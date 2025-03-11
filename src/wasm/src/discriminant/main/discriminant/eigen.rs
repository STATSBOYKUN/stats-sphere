use  crate::discriminant::main::types::results::{DiscriminantError, ChiSquareResult, EigenStats};
use  crate::discriminant::main::matrix::eigen::find_eigenpairs;
use  crate::discriminant::main::matrix::decomposition::{matrix_inverse, matrix_determinant};
use  crate::discriminant::main::stats::chi_square_p_value;
use  crate::discriminant::main::utils::round_to_decimal;

use super::core::DiscriminantAnalysis;

impl DiscriminantAnalysis {
    /// Compute canonical discriminant functions
    pub fn compute_canonical_discriminant_functions(&mut self) -> Result<(), DiscriminantError> {
        // Number of canonical functions is min(p, g-1)
        let m = std::cmp::min(self.q, self.g - 1);

        if m == 0 {
            return Err(DiscriminantError::ComputationError(
                "Cannot compute canonical discriminant functions: min(q, g-1) = 0".into()
            ));
        }

        // Calculate T - W (between-groups sum of squares and cross-products)
        let mut t_minus_w = vec![vec![0.0; self.p]; self.p];
        for i in 0..self.p {
            for j in 0..self.p {
                t_minus_w[i][j] = self.t_matrix[i][j] - self.w_matrix[i][j];
            }
        }

        // Calculate inverse of W
        let w_inv = matrix_inverse(&self.w_matrix)
            .map_err(|e| DiscriminantError::ComputationError(
                format!("Failed to invert W matrix: {}", e)
            ))?;

        // Calculate (T-W) * W^-1
        let mut a = vec![vec![0.0; self.p]; self.p];
        for i in 0..self.p {
            for j in 0..self.p {
                let mut sum = 0.0;
                for k in 0..self.p {
                    sum += t_minus_w[i][k] * w_inv[k][j];
                }
                a[i][j] = sum;
            }
        }

        // Find eigenvalues and eigenvectors
        let (eigenvalues, eigenvectors) = find_eigenpairs(&a, m)
            .map_err(|e| DiscriminantError::ComputationError(
                format!("Eigenvalue computation failed: {}", e)
            ))?;

        // Store results
        self.eigenvalues = eigenvalues;

        // Initialize canonical coefficients matrix
        self.canonical_coefficients = vec![vec![0.0; m]; self.p];

        // Copy eigenvectors to canonical coefficients
        for i in 0..self.p {
            for j in 0..m {
                self.canonical_coefficients[i][j] = eigenvectors[i][j];
            }
        }

        Ok(())
    }

    /// Calculate standardized canonical discriminant function coefficients
    pub fn standardized_coefficients(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut standardized = vec![vec![0.0; m]; self.p];

        // Get eigenvalues and eigenvectors
        if self.eigenvalues.is_empty() || self.canonical_coefficients.is_empty() {
            return Err(DiscriminantError::ComputationError(
                "Cannot compute standardized coefficients: eigenvalues not computed".to_string()
            ));
        }

        // Calculate within-group standard deviations
        let within_std_devs: Vec<f64> = (0..self.p)
            .map(|i| (self.w_matrix[i][i] / (self.n - self.g as f64)).sqrt())
            .collect();

        for i in 0..self.p {
            for j in 0..m {
                // SPSS standardization formula
                standardized[i][j] = self.canonical_coefficients[i][j] * within_std_devs[i];
            }
        }

        // Normalize to ensure proper scaling (sum of squared coefficients = 1)
        for j in 0..m {
            let mut sum_sq = 0.0;
            for i in 0..self.p {
                sum_sq += standardized[i][j] * standardized[i][j];
            }
            let norm = sum_sq.sqrt();
            if norm > 1e-10 {
                for i in 0..self.p {
                    standardized[i][j] /= norm;
                }
            }
        }

        Ok(standardized)
    }

    /// Calculate structure matrix (correlations between variables and discriminant functions)
    pub fn structure_matrix(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut structure = vec![vec![0.0; m]; self.p];

        // Structure coefficients are correlations between variables and discriminant scores
        // Calculate discriminant scores for all cases
        let mut scores = vec![vec![0.0; m]; self.n as usize];
        let mut score_idx = 0;

        for j in 0..self.g {
            for k in 0..self.m[j] {
                for func in 0..m {
                    let mut score = 0.0;
                    for i in 0..self.p {
                        score += self.canonical_coefficients[i][func] * self.data[j][k][i];
                    }
                    scores[score_idx][func] = score;
                }
                score_idx += 1;
            }
        }

        // Calculate means and standard deviations of variables and scores
        let mut var_means = vec![0.0; self.p];
        let mut score_means = vec![0.0; m];

        for i in 0..self.p {
            var_means[i] = self.means_overall[i];
        }

        for j in 0..m {
            for i in 0..scores.len() {
                score_means[j] += scores[i][j];
            }
            score_means[j] /= scores.len() as f64;
        }

        // Calculate correlations between variables and discriminant scores
        for i in 0..self.p {
            for j in 0..m {
                let mut cov = 0.0;
                let mut var_ss = 0.0;
                let mut score_ss = 0.0;

                score_idx = 0;
                for g in 0..self.g {
                    for k in 0..self.m[g] {
                        let var_dev = self.data[g][k][i] - var_means[i];
                        let score_dev = scores[score_idx][j] - score_means[j];

                        cov += var_dev * score_dev;
                        var_ss += var_dev * var_dev;
                        score_ss += score_dev * score_dev;

                        score_idx += 1;
                    }
                }

                if var_ss > 0.0 && score_ss > 0.0 {
                    structure[i][j] = cov / (var_ss.sqrt() * score_ss.sqrt());
                } else {
                    structure[i][j] = 0.0;
                }
            }
        }

        Ok(structure)
    }

    /// Calculate canonical correlations
    pub fn canonical_correlations(&self) -> Vec<f64> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut correlations = Vec::with_capacity(m);

        for k in 0..m {
            if k < self.eigenvalues.len() {
                let lambda_k = self.eigenvalues[k];
                correlations.push((lambda_k / (1.0 + lambda_k)).sqrt());
            }
        }

        correlations
    }

    /// Calculate Wilks' Lambda for the discriminant functions
    pub fn wilks_lambda(&self) -> Vec<ChiSquareResult> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut results = Vec::with_capacity(m);

        // Calculate lambda values
        for k in 0..m {
            let mut product = 1.0;

            for i in k..m {
                if i < self.eigenvalues.len() {
                    product *= 1.0 / (1.0 + self.eigenvalues[i]);
                }
            }

            // Calculate chi-square
            let df = (self.p - k) * (self.g - k - 1);
            let chi_square = -(self.n - (self.p + self.g) as f64 / 2.0 - 1.0) * product.ln();
            let p_value = chi_square_p_value(chi_square, df as u32);

            results.push(ChiSquareResult {
                chi_square: round_to_decimal(chi_square, 3),
                df: df as u32,
                p_value: round_to_decimal(p_value, 3),
            });
        }

        results
    }

    /// Calculate eigenvalue statistics
    pub fn eigen_statistics(&self) -> Vec<EigenStats> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut stats = Vec::with_capacity(m);

        // Calculate sum of eigenvalues
        let sum_eigenvalues: f64 = self.eigenvalues.iter().sum();

        // Calculate percentage of variance for each eigenvalue
        let mut cumulative = 0.0;

        for k in 0..m {
            if k < self.eigenvalues.len() {
                let eigenvalue = self.eigenvalues[k];
                let pct = (eigenvalue / sum_eigenvalues) * 100.0;
                cumulative += pct;

                let canonical_corr = (eigenvalue / (1.0 + eigenvalue)).sqrt();

                stats.push(EigenStats {
                    eigenvalue: round_to_decimal(eigenvalue, 3),
                    pct_of_variance: round_to_decimal(pct, 1),
                    cumulative_pct: round_to_decimal(cumulative, 1),
                    canonical_correlation: round_to_decimal(canonical_corr, 3),
                });
            }
        }

        stats
    }

    /// Calculate group centroids
    pub fn group_centroids(&self) -> Vec<Vec<f64>> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut centroids = vec![vec![0.0; m]; self.g];

        // Get unstandardized coefficients
        let unstd_coeffs = match self.unstandardized_coefficients() {
            Ok(c) => c,
            Err(_) => return centroids,
        };

        // Calculate function values at group means
        for j in 0..self.g {
            for k in 0..m {
                // Start with constant term
                let mut sum = unstd_coeffs[self.p][k];

                // Add variable terms
                for i in 0..self.p {
                    sum += unstd_coeffs[i][k] * self.means_by_group[j][i];
                }

                centroids[j][k] = sum;
            }
        }

        // Ensure centroids are properly centered
        for k in 0..m {
            // Calculate grand mean of centroids
            let mut mean = 0.0;
            for j in 0..self.g {
                mean += centroids[j][k] * (self.n_j[j] / self.n);
            }

            // Center the centroids
            for j in 0..self.g {
                centroids[j][k] -= mean;
            }

            // Scale to ensure between-group variance equals 1
            let mut var = 0.0;
            for j in 0..self.g {
                var += (centroids[j][k] * centroids[j][k]) * (self.n_j[j] / self.n);
            }

            if var > 0.0 {
                let scaling = 1.0 / var.sqrt();
                for j in 0..self.g {
                    centroids[j][k] *= scaling;
                }
            }
        }

        centroids
    }

    /// Calculate unstandardized canonical discriminant function coefficients
    pub fn unstandardized_coefficients(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        let m = std::cmp::min(self.q, self.g - 1);

        // The unstandardized coefficients with constant
        let mut coeffs = vec![vec![0.0; m]; self.p + 1];

        // Calculate the unstandardized discriminant function coefficients
        // These are the raw coefficients that will be applied to variables
        for i in 0..self.p {
            for j in 0..m {
                if j < self.canonical_coefficients[i].len() {
                    coeffs[i][j] = self.canonical_coefficients[i][j];
                }
            }
        }

        // Normalize using the same scaling as in the SPSS algorithm
        // This ensures the within-group variance equals the eigenvalues
        for j in 0..m {
            if j < self.eigenvalues.len() {
                let scaling_factor = self.eigenvalues[j].sqrt();
                for i in 0..self.p {
                    coeffs[i][j] *= scaling_factor;
                }
            }
        }

        // Calculate constant term
        for j in 0..m {
            let mut sum = 0.0;
            for i in 0..self.p {
                sum += coeffs[i][j] * self.means_overall[i];
            }
            coeffs[self.p][j] = -sum;
        }

        Ok(coeffs)
    }
}
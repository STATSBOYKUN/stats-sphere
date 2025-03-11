use  crate::discriminant::main::types::results::{DiscriminantError, ClassificationResult, ClassificationResults};
use  crate::discriminant::main::matrix::decomposition::matrix_inverse;
use  crate::discriminant::main::stats::{chi_square_cdf, mahalanobis_distance};
use  crate::discriminant::main::utils::argmax;

use super::core::DiscriminantAnalysis;

impl DiscriminantAnalysis {
    /// Calculate classification function coefficients (Fisher's linear discriminant functions)
    pub fn classification_functions(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        // Calculate inverse of W
        let w_inv = matrix_inverse(&self.w_matrix)
            .map_err(|e| DiscriminantError::ComputationError(format!("Failed to invert W matrix: {}", e)))?;

        // Classification function coefficients with constant term
        let mut coeffs = vec![vec![0.0; self.g]; self.p + 1];

        // Calculate coefficients for each group
        for j in 0..self.g {
            for i in 0..self.p {
                let mut sum = 0.0;

                for l in 0..self.p {
                    sum += w_inv[i][l] * self.means_by_group[j][l];
                }

                coeffs[i][j] = (self.n - self.g as f64) * sum;
            }

            // Calculate constant term
            let mut sum = 0.0;

            for i in 0..self.p {
                sum += coeffs[i][j] * self.means_by_group[j][i];
            }

            // Use a small value instead of 0 for priors to avoid -infinity
            let prior = if self.priors[j] <= 0.0 { 1e-10 } else { self.priors[j] };
            coeffs[self.p][j] = prior.ln() - 0.5 * sum;
        }

        Ok(coeffs)
    }

    /// Classify a new case
    pub fn classify(&self, x: &[f64]) -> Result<ClassificationResult, DiscriminantError> {
        if x.len() != self.p {
            return Err(DiscriminantError::InvalidInput(
                format!("Input vector must have {} elements, got {}", self.p, x.len())
            ));
        }

        // Number of functions
        let m = std::cmp::min(self.q, self.g - 1);

        // 1. Calculate discriminant function values
        let mut f = vec![0.0; m];

        for k in 0..m {
            let mut sum = 0.0;

            for i in 0..self.p {
                if k < self.canonical_coefficients[i].len() {
                    sum += self.canonical_coefficients[i][k] * x[i];
                }
            }

            f[k] = sum;
        }

        // 2. Calculate Mahalanobis distances to group centroids
        let centroids = self.group_centroids();
        let mut mahalanobis_distances = vec![0.0; self.g];
        let mut chi_square_probs = vec![0.0; self.g];

        // Identity matrix for canonical space
        let identity = vec![vec![1.0; m]; m];

        for j in 0..self.g {
            let mut distance = 0.0;

            // Calculate squared distance in canonical space
            for k in 0..m {
                if k < centroids[j].len() {
                    let diff = f[k] - centroids[j][k];
                    distance += diff * diff;
                }
            }

            mahalanobis_distances[j] = distance;

            // Chi-square probability
            chi_square_probs[j] = 1.0 - chi_square_cdf(distance, m as u32);
        }

        // 3. Calculate posterior probabilities
        let mut g_j = vec![0.0; self.g];

        for j in 0..self.g {
            // Use a small value instead of 0 for priors to avoid -infinity
            let prior = if self.priors[j] <= 0.0 { 1e-10 } else { self.priors[j] };
            g_j[j] = prior.ln() - 0.5 * mahalanobis_distances[j];
        }

        let max_g = g_j.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

        let mut posterior = vec![0.0; self.g];
        let mut denominator = 0.0;

        for j in 0..self.g {
            let g_diff = g_j[j] - max_g;

            if g_diff > -46.0 {
                let p = (g_diff).exp();
                posterior[j] = p;
                denominator += p;
            }
        }

        if denominator > 0.0 {
            for j in 0..self.g {
                posterior[j] /= denominator;
            }
        }

        // 4. Determine predicted group
        let predicted_group = match argmax(&posterior) {
            Some(idx) => idx,
            None => return Err(DiscriminantError::ComputationError(
                "Failed to determine predicted group".into()
            )),
        };

        Ok(ClassificationResult {
            predicted_group,
            posterior_probabilities: posterior,
            discriminant_functions: f,
            mahalanobis_distances,
            chi_square_probs,
        })
    }

    /// Perform cross-validation
    pub fn cross_validate(&self) -> Result<ClassificationResults, DiscriminantError> {
        // Pre-allocate count matrices
        let mut original_count = vec![vec![0; self.g]; self.g];
        let mut cross_val_count = vec![vec![0; self.g]; self.g];

        // Calculate pooled covariance matrix inverse
        let c_inv = matrix_inverse(&self.c_matrix)
            .map_err(|_| DiscriminantError::ComputationError(
                "Cannot compute inverse of pooled covariance matrix".to_string()
            ))?;

        // Original classification
        for j in 0..self.g {
            for k in 0..self.m[j] {
                // Extract case
                let x = &self.data[j][k];

                // Classify using all data
                let result = self.classify(x)?;
                let predicted = result.predicted_group;

                // Update original classification counts
                original_count[j][predicted] += 1;

                // Cross-validation: leave-one-out
                // Find group with minimum Mahalanobis distance (excluding case k)
                let mut min_distance = f64::INFINITY;
                let mut cv_predicted = 0;

                for i in 0..self.g {
                    // Skip groups with prior probability of 0
                    if self.priors[i] <= 0.0 {
                        continue;
                    }

                    // For non-self groups, use original means
                    if i != j {
                        // Calculate Mahalanobis distance
                        let distance = mahalanobis_distance(x, &self.means_by_group[i], &c_inv);

                        // Adjust for prior probability
                        let prior = if self.priors[i] <= 0.0 { 1e-10 } else { self.priors[i] };
                        let adjusted_distance = distance - 2.0 * prior.ln();

                        if adjusted_distance < min_distance {
                            min_distance = adjusted_distance;
                            cv_predicted = i;
                        }
                    } else {
                        // For self group, recalculate mean without this case
                        let mut leave_one_out_mean = vec![0.0; self.p];

                        let weight_sum = self.n_j[j] - self.weights[j][k];

                        if weight_sum <= 0.0 {
                            continue;
                        }

                        for i in 0..self.p {
                            let mut sum = 0.0;

                            for l in 0..self.m[j] {
                                if l != k {
                                    sum += self.weights[j][l] * self.data[j][l][i];
                                }
                            }

                            leave_one_out_mean[i] = sum / weight_sum;
                        }

                        // Calculate Mahalanobis distance to leave-one-out mean
                        let distance = mahalanobis_distance(x, &leave_one_out_mean, &c_inv);

                        // Adjust for prior probability
                        let prior = if self.priors[i] <= 0.0 { 1e-10 } else { self.priors[i] };
                        let adjusted_distance = distance - 2.0 * prior.ln();

                        if adjusted_distance < min_distance {
                            min_distance = adjusted_distance;
                            cv_predicted = i;
                        }
                    }
                }

                // Update cross-validation counts
                cross_val_count[j][cv_predicted] += 1;
            }
        }

        // Calculate percentages and correct classification rates
        let mut original_pct = vec![vec![0.0; self.g]; self.g];
        let mut cross_val_pct = vec![vec![0.0; self.g]; self.g];

        let mut original_correct = 0;
        let mut cross_val_correct = 0;
        let total_cases: usize = self.m.iter().sum();

        for j in 0..self.g {
            let row_sum = original_count[j].iter().sum::<usize>();

            if row_sum > 0 {
                for i in 0..self.g {
                    original_pct[j][i] = (original_count[j][i] as f64 / row_sum as f64) * 100.0;
                    cross_val_pct[j][i] = (cross_val_count[j][i] as f64 / row_sum as f64) * 100.0;
                }

                original_correct += original_count[j][j];
                cross_val_correct += cross_val_count[j][j];
            }
        }

        let original_correct_pct = (original_correct as f64 / total_cases as f64) * 100.0;
        let cross_val_correct_pct = (cross_val_correct as f64 / total_cases as f64) * 100.0;

        Ok(ClassificationResults {
            original_count,
            original_percentage: original_pct,
            cross_val_count,
            cross_val_percentage: cross_val_pct,
            original_correct_pct,
            cross_val_correct_pct,
        })
    }
}
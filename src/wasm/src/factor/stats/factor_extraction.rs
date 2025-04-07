use nalgebra::DMatrix;

use crate::factor::models::{
    config::{ ExtractionMethod, FactorAnalysisConfig },
    result::ExtractionResult,
};

// Extract factors using specified method
pub fn extract_factors(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    match config.extraction.method {
        ExtractionMethod::PrincipalComponents =>
            extract_principal_components(matrix, config, var_names),
        ExtractionMethod::UnweightedLeastSquares =>
            extract_unweighted_least_squares(matrix, config, var_names),
        ExtractionMethod::GeneralizedLeastSquares =>
            extract_generalized_least_squares(matrix, config, var_names),
        ExtractionMethod::MaximumLikelihood =>
            extract_maximum_likelihood(matrix, config, var_names),
        ExtractionMethod::PrincipalAxisFactoring =>
            extract_principal_axis_factoring(matrix, config, var_names),
        ExtractionMethod::AlphaFactoring => extract_alpha_factoring(matrix, config, var_names),
        ExtractionMethod::ImageFactoring => extract_image_factoring(matrix, config, var_names),
    }
}

// Principal Components Analysis extraction
pub fn extract_principal_components(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Perform eigenvalue decomposition
    let eigen = matrix.clone().symmetric_eigen();
    let mut eigenvalues = Vec::with_capacity(n_vars);
    let mut eigenvectors = DMatrix::zeros(n_vars, n_vars);

    // Sort eigenvalues and eigenvectors in descending order
    let mut indices: Vec<usize> = (0..n_vars).collect();
    indices.sort_by(|&i, &j|
        eigen.eigenvalues[j].partial_cmp(&eigen.eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    for i in 0..n_vars {
        eigenvalues.push(eigen.eigenvalues[indices[i]]);
        for j in 0..n_vars {
            eigenvectors[(j, i)] = eigen.eigenvectors[(j, indices[i])];
        }
    }

    // Determine number of factors to retain
    let n_factors = determine_factors_to_retain(&eigenvalues, config);

    if n_factors == 0 {
        return Err("No factors meet the retention criteria".to_string());
    }

    // Calculate loadings matrix (Lambda_m = Omega_m * Gamma_m^(1/2))
    let mut loadings = DMatrix::zeros(n_vars, n_factors);
    for i in 0..n_vars {
        for j in 0..n_factors {
            loadings[(i, j)] = eigenvectors[(i, j)] * eigenvalues[j].sqrt();
        }
    }

    // Calculate communalities (h_i = sum(|gamma_j| * omega_ij^2))
    let mut communalities = vec![0.0; n_vars];
    for i in 0..n_vars {
        for j in 0..n_factors {
            communalities[i] += eigenvalues[j].abs() * eigenvectors[(i, j)].powi(2);
        }
    }

    // Calculate explained variance
    let total_variance: f64 = eigenvalues.iter().sum();
    let explained_variance: Vec<f64> = eigenvalues
        .iter()
        .take(n_factors)
        .map(|&val| (val / total_variance) * 100.0)
        .collect();

    // Calculate cumulative variance
    let mut cumulative_variance = vec![0.0; n_factors];
    let mut cum_sum = 0.0;
    for (i, &var) in explained_variance.iter().enumerate() {
        cum_sum += var;
        cumulative_variance[i] = cum_sum;
    }

    Ok(ExtractionResult {
        loadings,
        eigenvalues: eigenvalues.into_iter().take(n_factors).collect(),
        communalities,
        explained_variance,
        cumulative_variance,
        n_factors,
        var_names: var_names.to_vec(),
    })
}

pub fn extract_principal_axis_factoring(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates (squared multiple correlations)
    let mut communalities = vec![0.0; n_vars];
    let mut r_matrix = matrix.clone();

    // Initialize communalities with SMC
    let inverse_matrix = match matrix.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // If matrix is singular, use alternative estimate
            for i in 0..n_vars {
                let mut max_r = 0.0;
                for j in 0..n_vars {
                    if i != j {
                        let r_ij = matrix[(i, j)].abs();
                        if r_ij > max_r {
                            max_r = r_ij;
                        }
                    }
                }
                communalities[i] = max_r;
            }

            // Copy communalities to diagonal of r_matrix
            for i in 0..n_vars {
                r_matrix[(i, i)] = communalities[i];
            }

            // Return early using initial estimates
            return extract_factors_from_adjusted_matrix(
                &r_matrix,
                config,
                var_names,
                communalities
            );
        }
    };

    // Calculate communalities using squared multiple correlations
    for i in 0..n_vars {
        let r_ii = inverse_matrix[(i, i)];
        if r_ii > 0.0 {
            communalities[i] = 1.0 - 1.0 / r_ii;
        } else {
            // Fallback to maximum correlation
            let mut max_r = 0.0;
            for j in 0..n_vars {
                if i != j {
                    let r_ij = matrix[(i, j)].abs();
                    if r_ij > max_r {
                        max_r = r_ij;
                    }
                }
            }
            communalities[i] = max_r;
        }

        // Replace diagonal with communality
        r_matrix[(i, i)] = communalities[i];
    }

    // Iterative solution for communalities
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Perform eigenvalue decomposition on adjusted correlation matrix
        let eigen = r_matrix.clone().symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates
        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                new_communalities[i] +=
                    sorted_eigenvalues[j].abs() * sorted_eigenvectors[(i, j)].powi(2);
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (new_communalities[i] - communalities[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Converged, calculate final loadings
            let mut loadings = DMatrix::zeros(n_vars, n_factors);
            for i in 0..n_vars {
                for j in 0..n_factors {
                    loadings[(i, j)] = sorted_eigenvectors[(i, j)] * sorted_eigenvalues[j].sqrt();
                }
            }

            // Calculate explained variance
            let total_variance: f64 = sorted_eigenvalues.iter().sum();
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / total_variance) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities and correlation matrix for next iteration
        communalities = new_communalities;
        for i in 0..n_vars {
            r_matrix[(i, i)] = communalities[i];
        }
    }

    // If we reach here, we've hit the maximum iterations without converging
    // Return the best result we have with current communalities
    extract_factors_from_adjusted_matrix(&r_matrix, config, var_names, communalities)
}

// Helper function to extract factors from adjusted matrix
fn extract_factors_from_adjusted_matrix(
    r_matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String],
    communalities: Vec<f64>
) -> Result<ExtractionResult, String> {
    let n_vars = r_matrix.nrows();

    // Perform eigenvalue decomposition
    let eigen = r_matrix.clone().symmetric_eigen();

    // Sort eigenvalues and eigenvectors
    let mut indices: Vec<usize> = (0..n_vars).collect();
    indices.sort_by(|&i, &j|
        eigen.eigenvalues[j].partial_cmp(&eigen.eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let sorted_eigenvalues: Vec<f64> = indices
        .iter()
        .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
        .collect();

    let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        for j in 0..n_vars {
            sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
        }
    }

    // Determine number of factors
    let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
    if n_factors == 0 {
        return Err("No factors meet the retention criteria".to_string());
    }

    // Calculate loadings
    let mut loadings = DMatrix::zeros(n_vars, n_factors);
    for i in 0..n_vars {
        for j in 0..n_factors {
            loadings[(i, j)] = sorted_eigenvectors[(i, j)] * sorted_eigenvalues[j].sqrt();
        }
    }

    // Calculate explained variance
    let total_variance: f64 = sorted_eigenvalues.iter().sum();
    let explained_variance: Vec<f64> = sorted_eigenvalues
        .iter()
        .take(n_factors)
        .map(|&val| (val / total_variance) * 100.0)
        .collect();

    // Calculate cumulative variance
    let mut cumulative_variance = vec![0.0; n_factors];
    let mut cum_sum = 0.0;
    for (i, &var) in explained_variance.iter().enumerate() {
        cum_sum += var;
        cumulative_variance[i] = cum_sum;
    }

    Ok(ExtractionResult {
        loadings,
        eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
        communalities,
        explained_variance,
        cumulative_variance,
        n_factors,
        var_names: var_names.to_vec(),
    })
}

// Unweighted Least Squares extraction
pub fn extract_unweighted_least_squares(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates
    let mut communalities = vec![0.5; n_vars]; // Initialize with 0.5
    let mut r_matrix = matrix.clone();

    // Update diagonal with initial communalities
    for i in 0..n_vars {
        r_matrix[(i, i)] = communalities[i];
    }

    // Iterative solution for communalities
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Calculate reduced correlation matrix R - diagonal(uniqueness)
        let mut reduced_matrix = r_matrix.clone();
        for i in 0..n_vars {
            reduced_matrix[(i, i)] = r_matrix[(i, i)] - (1.0 - communalities[i]);
        }

        // Perform eigenvalue decomposition on reduced matrix
        let eigen = reduced_matrix.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates - ULS specific formula
        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                if sorted_eigenvalues[j] > 0.0 {
                    new_communalities[i] +=
                        sorted_eigenvalues[j] * sorted_eigenvectors[(i, j)].powi(2);
                }
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (new_communalities[i] - communalities[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Converged, calculate final loadings
            let mut loadings = DMatrix::zeros(n_vars, n_factors);
            for i in 0..n_vars {
                for j in 0..n_factors {
                    if sorted_eigenvalues[j] > 0.0 {
                        loadings[(i, j)] =
                            sorted_eigenvectors[(i, j)] * sorted_eigenvalues[j].sqrt();
                    }
                }
            }

            // Calculate explained variance
            let total_variance: f64 = sorted_eigenvalues.iter().take(n_vars).sum();
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / total_variance) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities for next iteration
        communalities = new_communalities;

        // Update diagonal of correlation matrix
        for i in 0..n_vars {
            r_matrix[(i, i)] = 1.0; // Reset diagonal to 1.0 for ULS
        }
    }

    // If we reach here, we've hit the maximum iterations without converging
    // Return a result with the current estimates
    Err("ULS extraction failed to converge within the maximum iterations".to_string())
}

// Generalized Least Squares extraction
pub fn extract_generalized_least_squares(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates
    let mut communalities = vec![0.5; n_vars]; // Initialize with 0.5
    let mut r_matrix = matrix.clone();

    // Iterative solution for communalities
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Calculate weight matrix W = R^(-2)
        let r_inverse = match r_matrix.clone().try_inverse() {
            Some(inv) => inv,
            None => {
                return Err("Correlation matrix is singular in GLS extraction".to_string());
            }
        };

        // Calculate weighted correlation matrix
        let weighted_matrix = &r_inverse * matrix * &r_inverse;

        // Perform eigenvalue decomposition
        let eigen = weighted_matrix.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates - GLS specific
        let mut loadings = DMatrix::zeros(n_vars, n_factors);
        for i in 0..n_vars {
            for j in 0..n_factors {
                loadings[(i, j)] =
                    sorted_eigenvectors[(i, j)] * (sorted_eigenvalues[j] - 1.0).sqrt();
            }
        }

        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                new_communalities[i] += loadings[(i, j)].powi(2);
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (new_communalities[i] - communalities[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Calculate explained variance
            let total_variance: f64 = sorted_eigenvalues.iter().take(n_vars).sum();
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / total_variance) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            // Calculate chi-square for GLS
            let w = matrix.nrows() as f64;
            let chi_square =
                (w - 1.0 - (2.0 * (n_vars as f64) + 5.0) / 6.0 - (2.0 * (n_factors as f64)) / 3.0) *
                (n_factors..n_vars)
                    .map(|j| (sorted_eigenvalues[j] - 1.0).powi(2) / 2.0)
                    .sum::<f64>();

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities for next iteration
        communalities = new_communalities;

        // Update R matrix for next iteration
        for i in 0..n_vars {
            for j in 0..n_vars {
                if i == j {
                    r_matrix[(i, j)] = 1.0; // Keep diagonal as 1.0
                } else {
                    // Adjust off-diagonal correlations based on uniqueness
                    let weight = ((1.0 - communalities[i]) * (1.0 - communalities[j])).sqrt();
                    r_matrix[(i, j)] = matrix[(i, j)] * weight;
                }
            }
        }
    }

    // If we reach here, we've hit the maximum iterations without converging
    Err("GLS extraction failed to converge within the maximum iterations".to_string())
}

// Maximum Likelihood extraction
pub fn extract_maximum_likelihood(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates - using SMC (squared multiple correlations)
    let mut communalities = vec![0.0; n_vars];
    let inverse_matrix = match matrix.clone().try_inverse() {
        Some(inv) => Some(inv), // Return Option<Matrix>
        None => {
            // If matrix is singular, use alternative initial estimates
            for i in 0..n_vars {
                communalities[i] = 0.5; // Default value
            }
            None // Return None for the Option type
        }
    };

    // If we have an inverse matrix, calculate SMC
    if let Some(inv) = &inverse_matrix {
        for i in 0..n_vars {
            let r_ii = inv[(i, i)];
            if r_ii > 0.0 {
                communalities[i] = 1.0 - 1.0 / r_ii;
            } else {
                communalities[i] = 0.5; // Default value
            }
        }
    }

    // Calculate initial uniqueness (psi-squared)
    let mut psi_squared = vec![0.0; n_vars];
    for i in 0..n_vars {
        psi_squared[i] = 1.0 - communalities[i];
        if psi_squared[i] < 0.005 {
            // Avoid very small values
            psi_squared[i] = 0.005;
        }
    }

    // Iterative solution for Maximum Likelihood
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Construct psi matrix (diagonal matrix of uniquenesses)
        let mut psi_matrix = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            psi_matrix[(i, i)] = psi_squared[i];
        }

        // Calculate psi^(-1) * R * psi^(-1)
        let mut psi_inv = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            psi_inv[(i, i)] = 1.0 / (psi_squared[i] as f64).sqrt();
        }

        let weighted_r = &psi_inv * matrix * &psi_inv;

        // Perform eigenvalue decomposition
        let eigen = weighted_r.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate loadings
        let mut loadings = DMatrix::zeros(n_vars, n_factors);
        for i in 0..n_vars {
            for j in 0..n_factors {
                loadings[(i, j)] =
                    (psi_squared[i] as f64).sqrt() *
                    sorted_eigenvectors[(i, j)] *
                    (sorted_eigenvalues[j] - 1.0).sqrt();
            }
        }

        // Calculate new communality estimates
        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                new_communalities[i] += loadings[(i, j)].powi(2);
            }

            // Ensure communalities don't exceed 1.0
            if new_communalities[i] > 0.995 {
                new_communalities[i] = 0.995;
            }
        }

        // Calculate new uniquenesses
        let mut new_psi_squared = vec![0.0; n_vars];
        for i in 0..n_vars {
            new_psi_squared[i] = 1.0 - new_communalities[i];
            if new_psi_squared[i] < 0.005 {
                // Avoid very small values
                new_psi_squared[i] = 0.005;
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = ((new_psi_squared[i] - psi_squared[i]) as f64).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Calculate explained variance
            let total_variance: f64 = n_vars as f64; // Total variance is p for correlation matrix
            let explained_variance: Vec<f64> = (0..n_factors)
                .map(
                    |j|
                        ((new_communalities
                            .iter()
                            .map(|&h| h)
                            .sum::<f64>() /
                            total_variance) *
                            100.0) /
                        (n_factors as f64)
                )
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            // Calculate chi-square for ML
            let n = matrix.nrows() as f64;
            let ml_function = sorted_eigenvalues
                .iter()
                .skip(n_factors)
                .map(|&e| e.ln() + 1.0 / e - 1.0)
                .sum::<f64>();

            let chi_square =
                (n - 1.0 - (2.0 * (n_vars as f64) + 5.0) / 6.0 - (2.0 * (n_factors as f64)) / 3.0) *
                ml_function;
            let df = ((n_vars - n_factors).pow(2) - n_vars - n_factors) / 2;

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update uniquenesses for next iteration
        psi_squared = new_psi_squared;
    }

    // If we reach here, we've hit the maximum iterations without converging
    Err("ML extraction failed to converge within the maximum iterations".to_string())
}

// Alpha Factoring extraction
pub fn extract_alpha_factoring(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Check if determinant of correlation matrix is too small
    let determinant = matrix.determinant();
    if determinant.abs() < 1e-8 {
        return Err("Correlation matrix is nearly singular for alpha factoring".to_string());
    }

    // Initial communality estimates
    let mut h_initial = vec![0.0; n_vars];

    // Initialize communalities
    let inverse_matrix = match matrix.clone().try_inverse() {
        Some(inv) => {
            // Use SMC method
            for i in 0..n_vars {
                h_initial[i] = 1.0 - 1.0 / inv[(i, i)];

                // Ensure valid initial communality
                if h_initial[i] < 0.0 || h_initial[i] > 1.0 {
                    h_initial[i] = 0.5;
                }
            }
            true
        }
        None => {
            // Use maximum correlation method
            for i in 0..n_vars {
                let mut max_corr = 0.0;
                for j in 0..n_vars {
                    if i != j {
                        let corr = matrix[(i, j)].abs();
                        if corr > max_corr {
                            max_corr = corr;
                        }
                    }
                }
                h_initial[i] = max_corr;
            }
            false
        }
    };

    // Setup for iterations
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    let mut h_current = h_initial.clone();

    // Iterative solution for Alpha factoring
    for iteration in 0..max_iterations {
        // Create diagonal matrix H^(1/2)
        let mut h_sqrt = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            h_sqrt[(i, i)] = h_current[i].sqrt();
        }

        // Calculate H^(1/2) * (R-I) * H^(1/2) + I
        let identity = DMatrix::identity(n_vars, n_vars);
        let r_minus_i = matrix - &identity;
        let transformed = &h_sqrt * &r_minus_i * &h_sqrt + identity;

        // Perform eigenvalue decomposition
        let eigen = transformed.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates - Alpha factoring specific formula
        let mut h_new = vec![0.0; n_vars];
        for k in 0..n_vars {
            let mut sum = 0.0;
            for j in 0..n_factors {
                sum += sorted_eigenvalues[j].abs() * sorted_eigenvectors[(k, j)].powi(2);
            }
            h_new[k] = sum * h_current[k];

            // Check for zero communality
            if h_new[k] < 1e-6 {
                return Err("Zero communality detected in alpha factoring".to_string());
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (h_new[i] - h_current[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Converged, calculate final loadings
            let mut loadings = DMatrix::zeros(n_vars, n_factors);
            for i in 0..n_vars {
                for j in 0..n_factors {
                    loadings[(i, j)] =
                        h_current[i].sqrt() *
                        sorted_eigenvectors[(i, j)] *
                        sorted_eigenvalues[j].sqrt();
                }
            }

            // Calculate explained variance
            let total_variance: f64 = h_new.iter().sum(); // Sum of communalities
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / (n_vars as f64)) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: h_new,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities for next iteration
        h_current = h_new;
    }

    // If we reach here, we've hit the maximum iterations without converging
    Err("Alpha factoring failed to converge within the maximum iterations".to_string())
}

// Image Factoring extraction
pub fn extract_image_factoring(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Get inverse of correlation matrix
    let r_inverse = match matrix.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Correlation matrix is singular for image factoring".to_string());
        }
    };

    // Create S matrix (diagonal matrix of 1/sqrt(r_ii))
    let mut s_matrix = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        s_matrix[(i, i)] = 1.0 / r_inverse[(i, i)].sqrt();
    }

    // Calculate S^(-1) * R * S^(-1)
    let s_inv = s_matrix.clone().try_inverse().unwrap(); // S is diagonal, so inverse should exist
    let transformed = &s_inv * matrix * &s_inv;

    // Perform eigenvalue decomposition
    let eigen = transformed.symmetric_eigen();

    // Sort eigenvalues and eigenvectors
    let mut indices: Vec<usize> = (0..n_vars).collect();
    indices.sort_by(|&i, &j|
        eigen.eigenvalues[j].partial_cmp(&eigen.eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let sorted_eigenvalues: Vec<f64> = indices
        .iter()
        .map(|&i| eigen.eigenvalues[i])
        .collect();

    let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        for j in 0..n_vars {
            sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
        }
    }

    // Determine number of factors - for image factoring, only use eigenvalues > 1
    let mut n_factors = 0;
    for &val in &sorted_eigenvalues {
        if val > 1.0 {
            n_factors += 1;
        } else {
            break;
        }
    }

    if n_factors == 0 {
        return Err("No factors with eigenvalues > 1 in image factoring".to_string());
    }

    // Calculate loadings using image factoring formula
    let mut loadings = DMatrix::zeros(n_vars, n_factors);
    for i in 0..n_vars {
        for j in 0..n_factors {
            loadings[(i, j)] =
                (s_matrix[(i, i)] * sorted_eigenvectors[(i, j)] * (sorted_eigenvalues[j] - 1.0)) /
                sorted_eigenvalues[j].sqrt();
        }
    }

    // Calculate communalities
    let mut communalities = vec![0.0; n_vars];
    for i in 0..n_vars {
        for j in 0..n_factors {
            communalities[i] +=
                ((sorted_eigenvalues[j] - 1.0).powi(2) * sorted_eigenvectors[(i, j)].powi(2)) /
                (sorted_eigenvalues[j] * r_inverse[(i, i)]);
        }
    }

    // Calculate explained variance
    let total_variance = n_vars as f64; // Total variance is p for correlation matrix
    let explained_variance: Vec<f64> = (0..n_factors)
        .map(|j| (sorted_eigenvalues[j] / total_variance) * 100.0)
        .collect();

    // Calculate cumulative variance
    let mut cumulative_variance = vec![0.0; n_factors];
    let mut cum_sum = 0.0;
    for (i, &var) in explained_variance.iter().enumerate() {
        cum_sum += var;
        cumulative_variance[i] = cum_sum;
    }

    // Calculate image covariance matrix
    // R + S^2 * R^(-1) * S^2 - 2*S^2
    let image_covar = matrix + &s_matrix * &r_inverse * &s_matrix - &s_matrix * 2.0;

    // Calculate anti-image covariance matrix
    // S^2 * R^(-1) * S^2
    let anti_image_covar = &s_matrix * &r_inverse * &s_matrix;

    Ok(ExtractionResult {
        loadings,
        eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
        communalities,
        explained_variance,
        cumulative_variance,
        n_factors,
        var_names: var_names.to_vec(),
    })
}

// Determine number of factors to retain
pub fn determine_factors_to_retain(eigenvalues: &[f64], config: &FactorAnalysisConfig) -> usize {
    if let Some(max_factors) = config.extraction.max_factors {
        let max = max_factors as usize;
        if max > 0 && max <= eigenvalues.len() {
            return max;
        }
    }

    // Use eigenvalue criterion (Kaiser criterion by default)
    let eigen_cutoff = config.extraction.eigen_val;
    let count = eigenvalues
        .iter()
        .take_while(|&&val| val >= eigen_cutoff)
        .count();

    if count == 0 {
        1 // Always retain at least one factor
    } else {
        count
    }
}

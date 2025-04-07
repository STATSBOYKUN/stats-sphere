use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::factor::models::{
    config::FactorAnalysisConfig,
    result::{
        Communalities,
        ComponentMatrix,
        ComponentScoreCoefficientMatrix,
        ComponentScoreCovarianceMatrix,
        ExtractionResult,
        ReproducedCorrelations,
        ScreePlot,
        TotalVarianceComponent,
        TotalVarianceExplained,
    },
};

pub fn create_communalities(
    extraction_result: &ExtractionResult,
    var_names: &[String]
) -> Communalities {
    let mut initial = HashMap::new();
    let mut extraction = HashMap::new();

    for (i, var_name) in var_names.iter().enumerate() {
        initial.insert(var_name.clone(), 1.0); // Initial communalities are 1.0 for PCA
        if i < extraction_result.communalities.len() {
            extraction.insert(var_name.clone(), extraction_result.communalities[i]);
        }
    }

    Communalities {
        initial,
        extraction,
    }
}

// Create total variance explained result
pub fn create_total_variance_explained(
    extraction_result: &ExtractionResult
) -> TotalVarianceExplained {
    let n_factors = extraction_result.n_factors;
    let mut initial_eigenvalues = Vec::with_capacity(n_factors);
    let mut extraction_sums = Vec::with_capacity(n_factors);
    let mut rotation_sums = Vec::new(); // Will be filled if rotation is applied

    for i in 0..n_factors {
        let eigenvalue = extraction_result.eigenvalues[i];
        let percent = extraction_result.explained_variance[i];
        let cumulative = extraction_result.cumulative_variance[i];

        initial_eigenvalues.push(TotalVarianceComponent {
            total: eigenvalue,
            percent_of_variance: percent,
            cumulative_percent: cumulative,
        });

        extraction_sums.push(TotalVarianceComponent {
            total: eigenvalue,
            percent_of_variance: percent,
            cumulative_percent: cumulative,
        });
    }

    TotalVarianceExplained {
        initial_eigenvalues,
        extraction_sums,
        rotation_sums,
    }
}

// Create component/factor matrix result
pub fn create_component_matrix(
    extraction_result: &ExtractionResult,
    var_names: &[String]
) -> ComponentMatrix {
    let mut components = HashMap::new();

    for (i, var_name) in var_names.iter().enumerate() {
        if i < extraction_result.loadings.nrows() {
            let mut loadings = Vec::with_capacity(extraction_result.n_factors);

            for j in 0..extraction_result.n_factors {
                loadings.push(extraction_result.loadings[(i, j)]);
            }

            components.insert(var_name.clone(), loadings);
        }
    }

    ComponentMatrix {
        components,
    }
}

// Calculate reproduced correlations
pub fn calculate_reproduced_correlations(
    extraction_result: &ExtractionResult,
    original_matrix: &DMatrix<f64>,
    var_names: &[String]
) -> ReproducedCorrelations {
    let n_vars = extraction_result.loadings.nrows();
    let mut reproduced_correlation = HashMap::new();
    let mut residual = HashMap::new();

    // Calculate reproduced correlation matrix
    let loadings = &extraction_result.loadings;
    let reproduced_matrix = loadings * loadings.transpose();

    for (i, var_name) in var_names.iter().enumerate() {
        if i < n_vars {
            let mut var_reproduced = HashMap::new();
            let mut var_residual = HashMap::new();

            for (j, other_var) in var_names.iter().enumerate() {
                if j < n_vars {
                    // Reproduced correlation
                    let repro_corr = reproduced_matrix[(i, j)];
                    var_reproduced.insert(other_var.clone(), repro_corr);

                    // Residual (original - reproduced)
                    let residual_corr = original_matrix[(i, j)] - repro_corr;
                    var_residual.insert(other_var.clone(), residual_corr);
                }
            }

            reproduced_correlation.insert(var_name.clone(), var_reproduced);
            residual.insert(var_name.clone(), var_residual);
        }
    }

    ReproducedCorrelations {
        reproduced_correlation,
        residual,
    }
}

// Calculate factor scores
pub fn calculate_score_coefficients(
    matrix: &DMatrix<f64>,
    result: &ExtractionResult,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<(ComponentScoreCoefficientMatrix, ComponentScoreCovarianceMatrix), String> {
    let loadings = &result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    let mut coefficients = DMatrix::zeros(n_rows, n_cols);

    // Choose factor score coefficient method
    if config.scores.regression {
        // Regression method
        // W = R^(-1) * A where A is the loadings matrix and R is the correlation matrix
        match matrix.clone().try_inverse() {
            Some(inv_matrix) => {
                coefficients = inv_matrix * loadings;
            }
            None => {
                return Err(
                    "Could not invert correlation matrix for factor score calculation".to_string()
                );
            }
        }
    } else if config.scores.bartlett {
        // Bartlett method
        // W = (A'*U^(-2)*A)^(-1)*A'*U^(-2) where U^2 = diag(1-h_j^2)

        // Calculate U^(-2) matrix - diagonal matrix of reciprocals of uniquenesses
        let mut u_inv_squared = DMatrix::zeros(n_rows, n_rows);
        for i in 0..n_rows {
            let h_squared = if i < result.communalities.len() {
                result.communalities[i]
            } else {
                0.0
            };

            // Avoid division by zero
            let u_squared = (1.0 - h_squared).max(0.001);
            u_inv_squared[(i, i)] = 1.0 / u_squared;
        }

        // Calculate (A'*U^(-2)*A)
        let a_transpose_u_inv_squared_a = loadings.transpose() * u_inv_squared.clone() * loadings;

        // Invert (A'*U^(-2)*A)
        match a_transpose_u_inv_squared_a.try_inverse() {
            Some(ata_inv) => {
                coefficients = ata_inv * loadings.transpose() * u_inv_squared;
            }
            None => {
                return Err("Could not invert matrix for Bartlett method".to_string());
            }
        }
    } else if config.scores.anderson {
        // Anderson-Rubin method
        // W = U^(-1)*A*(A'*U^(-2)*A)^(-1/2)

        // Calculate U^(-1) matrix - diagonal matrix of reciprocals of sqrt of uniquenesses
        let mut u_inv = DMatrix::zeros(n_rows, n_rows);
        let mut u_inv_squared = DMatrix::zeros(n_rows, n_rows);

        for i in 0..n_rows {
            let h_squared = if i < result.communalities.len() {
                result.communalities[i]
            } else {
                0.0
            };

            // Avoid division by zero
            let u_squared = (1.0 - h_squared).max(0.001);
            u_inv[(i, i)] = 1.0 / u_squared.sqrt();
            u_inv_squared[(i, i)] = 1.0 / u_squared;
        }

        // Calculate A'*U^(-2)*A
        let a_transpose_u_inv_squared_a = loadings.transpose() * u_inv_squared * loadings;

        // Calculate symmetric square root
        match symmetric_matrix_sqrt(&a_transpose_u_inv_squared_a) {
            Some(ata_u_sqrt) => {
                match ata_u_sqrt.try_inverse() {
                    Some(ata_u_sqrt_inv) => {
                        coefficients = u_inv * loadings * ata_u_sqrt_inv;
                    }
                    None => {
                        return Err(
                            "Could not invert square root matrix for Anderson-Rubin method".to_string()
                        );
                    }
                }
            }
            None => {
                return Err(
                    "Could not calculate square root of matrix for Anderson-Rubin method".to_string()
                );
            }
        }
    } else {
        // Default to regression method
        match matrix.clone().try_inverse() {
            Some(inv_matrix) => {
                coefficients = inv_matrix * loadings;
            }
            None => {
                return Err(
                    "Could not invert correlation matrix for factor score calculation".to_string()
                );
            }
        }
    }

    // Convert to result structures
    let mut component_score_coefficient_matrix = ComponentScoreCoefficientMatrix {
        components: HashMap::new(),
    };

    for (i, var_name) in var_names.iter().enumerate() {
        if i < n_rows {
            let mut factor_scores = Vec::with_capacity(n_cols);

            for j in 0..n_cols {
                factor_scores.push(coefficients[(i, j)]);
            }

            component_score_coefficient_matrix.components.insert(var_name.clone(), factor_scores);
        }
    }

    // Calculate factor score covariance matrix
    // For regression method: (B'R^(-1)B)
    // For Bartlett method: (A'U^(-2)A)^(-1)
    // For Anderson-Rubin method: Identity matrix
    let mut component_score_covariance_matrix = ComponentScoreCovarianceMatrix {
        components: vec![vec![0.0; n_cols]; n_cols],
    };

    if config.scores.anderson {
        // Anderson-Rubin method produces uncorrelated scores (identity covariance matrix)
        for i in 0..n_cols {
            for j in 0..n_cols {
                component_score_covariance_matrix.components[i][j] = if i == j { 1.0 } else { 0.0 };
            }
        }
    } else if config.scores.bartlett {
        // Bartlett method: (A'U^(-2)A)^(-1)
        let mut u_inv_squared = DMatrix::zeros(n_rows, n_rows);
        for i in 0..n_rows {
            let h_squared = if i < result.communalities.len() {
                result.communalities[i]
            } else {
                0.0
            };

            let u_squared = (1.0 - h_squared).max(0.001);
            u_inv_squared[(i, i)] = 1.0 / u_squared;
        }

        let a_transpose_u_inv_squared_a = loadings.transpose() * u_inv_squared * loadings;

        match a_transpose_u_inv_squared_a.try_inverse() {
            Some(cov_matrix) => {
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = cov_matrix[(i, j)];
                    }
                }
            }
            None => {
                // Fall back to identity matrix
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = if i == j {
                            1.0
                        } else {
                            0.0
                        };
                    }
                }
            }
        }
    } else {
        // Regression method: (B'R^(-1)B)
        match matrix.clone().try_inverse() {
            Some(r_inv) => {
                let cov_matrix = coefficients.transpose() * r_inv * coefficients;
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = cov_matrix[(i, j)];
                    }
                }
            }
            None => {
                // Fall back to identity matrix
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = if i == j {
                            1.0
                        } else {
                            0.0
                        };
                    }
                }
            }
        }
    }

    Ok((component_score_coefficient_matrix, component_score_covariance_matrix))
}

// Helper function to calculate the symmetric square root of a matrix
pub fn symmetric_matrix_sqrt(matrix: &DMatrix<f64>) -> Option<DMatrix<f64>> {
    let n = matrix.nrows();
    if n != matrix.ncols() {
        return None;
    }

    // Perform eigenvalue decomposition
    let eigen = matrix.clone().symmetric_eigen();

    // Create diagonal matrix of sqrt of eigenvalues
    let mut d_sqrt = DMatrix::zeros(n, n);
    for i in 0..n {
        if eigen.eigenvalues[i] < 0.0 {
            // Matrix is not positive definite
            return None;
        }
        d_sqrt[(i, i)] = eigen.eigenvalues[i].sqrt();
    }

    // Compute Q * D^(1/2) * Q'
    Some(eigen.eigenvectors.clone() * d_sqrt * eigen.eigenvectors.transpose())
}

pub fn create_scree_plot(extraction_result: &ExtractionResult) -> ScreePlot {
    let eigenvalues = extraction_result.eigenvalues.clone();
    let mut component_numbers = Vec::with_capacity(eigenvalues.len());

    for i in 0..eigenvalues.len() {
        component_numbers.push(i + 1);
    }

    ScreePlot {
        eigenvalues,
        component_numbers,
    }
}

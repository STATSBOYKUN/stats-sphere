use std::collections::HashMap;

use nalgebra::{ DMatrix, DVector };

use crate::factor::models::result::{
    AntiImageMatrices,
    CorrelationMatrix,
    DescriptiveStatistic,
    InverseCorrelationMatrix,
};

use super::core::incomplete_beta;

pub fn calculate_matrix(
    data_matrix: &DMatrix<f64>,
    matrix_type: &str
) -> Result<DMatrix<f64>, String> {
    let n_rows = data_matrix.nrows();
    let n_cols = data_matrix.ncols();

    if n_rows < 2 {
        return Err("Not enough data to calculate matrix".to_string());
    }

    // Calculate column means
    let mut means = DVector::zeros(n_cols);
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += data_matrix[(i, j)];
        }
        means[j] = sum / (n_rows as f64);
    }

    // Calculate standard deviations for correlation matrix
    let mut std_devs = DVector::zeros(n_cols);
    if matrix_type == "correlation" {
        for j in 0..n_cols {
            let mut sum_sq = 0.0;
            for i in 0..n_rows {
                sum_sq += (data_matrix[(i, j)] - means[j]).powi(2);
            }
            std_devs[j] = (sum_sq / ((n_rows - 1) as f64)).sqrt();
        }
    }

    // Calculate matrix
    let mut result = DMatrix::zeros(n_cols, n_cols);
    for i in 0..n_cols {
        for j in 0..n_cols {
            let mut sum_product = 0.0;
            for k in 0..n_rows {
                sum_product += (data_matrix[(k, i)] - means[i]) * (data_matrix[(k, j)] - means[j]);
            }

            if matrix_type == "correlation" {
                result[(i, j)] = sum_product / (((n_rows - 1) as f64) * std_devs[i] * std_devs[j]);
            } else {
                result[(i, j)] = sum_product / ((n_rows - 1) as f64);
            }
        }
    }

    Ok(result)
}

// Calculate descriptive statistics
pub fn calculate_descriptive_statistics(
    data_matrix: &DMatrix<f64>,
    var_names: &[String]
) -> Vec<DescriptiveStatistic> {
    let n_rows = data_matrix.nrows();
    let n_cols = data_matrix.ncols();
    let mut stats = Vec::with_capacity(n_cols);

    for j in 0..n_cols {
        let mut sum = 0.0;
        let mut sum_sq = 0.0;

        for i in 0..n_rows {
            let val = data_matrix[(i, j)];
            sum += val;
            sum_sq += val.powi(2);
        }

        let mean = sum / (n_rows as f64);
        let variance = (sum_sq - sum.powi(2) / (n_rows as f64)) / ((n_rows - 1) as f64);
        let std_dev = variance.sqrt();

        stats.push(DescriptiveStatistic {
            variable: var_names[j].clone(),
            mean,
            std_deviation: std_dev,
            analysis_n: n_rows,
        });
    }

    stats
}

// Create correlation matrix for results
pub fn create_correlation_matrix(matrix: &DMatrix<f64>, var_names: &[String]) -> CorrelationMatrix {
    let n_vars = matrix.nrows();
    let mut correlations = HashMap::new();
    let mut sig_values = HashMap::new();

    for i in 0..n_vars {
        let var_name = &var_names[i];
        let mut var_correlations = HashMap::new();
        let mut var_sig_values = HashMap::new();

        for j in 0..n_vars {
            let other_var = &var_names[j];
            var_correlations.insert(other_var.clone(), matrix[(i, j)]);

            // Calculate significance (p-value)
            let p_value = if i == j {
                0.0
            } else {
                // Fisher's z-transformation for correlation significance
                let n = matrix.nrows();
                let r = matrix[(i, j)];
                let z = 0.5 * ((1.0 + r) / (1.0 - r)).ln();
                let se = 1.0 / ((n - 3) as f64).sqrt();
                let t = z / se;

                // Two-tailed p-value approximation using t distribution with n-2 degrees of freedom
                let df = n - 2;
                let x = (df as f64) / ((df as f64) + t * t);
                let beta = 0.5 * incomplete_beta(0.5 * (df as f64), 0.5, x);
                2.0 * beta
            };

            var_sig_values.insert(other_var.clone(), p_value);
        }

        correlations.insert(var_name.clone(), var_correlations);
        sig_values.insert(var_name.clone(), var_sig_values);
    }

    CorrelationMatrix {
        correlations,
        sig_values,
    }
}

// Create inverse correlation matrix for results
pub fn create_inverse_correlation_matrix(
    inverse: &DMatrix<f64>,
    var_names: &[String]
) -> InverseCorrelationMatrix {
    let n_vars = inverse.nrows();
    let mut inverse_correlations = HashMap::new();

    for i in 0..n_vars {
        let var_name = &var_names[i];
        let mut var_inverse = HashMap::new();

        for j in 0..n_vars {
            let other_var = &var_names[j];
            var_inverse.insert(other_var.clone(), inverse[(i, j)]);
        }

        inverse_correlations.insert(var_name.clone(), var_inverse);
    }

    InverseCorrelationMatrix {
        inverse_correlations,
    }
}

// Calculate anti-image matrices
pub fn calculate_anti_image_matrices(
    inverse: &DMatrix<f64>,
    var_names: &[String]
) -> AntiImageMatrices {
    let n_vars = inverse.nrows();
    let mut anti_image_covariance = HashMap::new();
    let mut anti_image_correlation = HashMap::new();

    for i in 0..n_vars {
        let var_name = &var_names[i];
        let mut var_cov = HashMap::new();
        let mut var_corr = HashMap::new();

        for j in 0..n_vars {
            let other_var = &var_names[j];

            // Anti-image covariance: -partial covariances (negative of off-diagonal elements of inverse)
            let cov_value = if i == j {
                1.0 / inverse[(i, j)]
            } else {
                -inverse[(i, j)] / (inverse[(i, i)] * inverse[(j, j)])
            };

            var_cov.insert(other_var.clone(), cov_value);

            // Anti-image correlation: partial correlations with sign reversed
            let corr_value = if i == j {
                1.0
            } else {
                -inverse[(i, j)] / (inverse[(i, i)] * inverse[(j, j)]).sqrt()
            };

            var_corr.insert(other_var.clone(), corr_value);
        }

        anti_image_covariance.insert(var_name.clone(), var_cov);
        anti_image_correlation.insert(var_name.clone(), var_corr);
    }

    AntiImageMatrices {
        anti_image_covariance,
        anti_image_correlation,
    }
}

// pooled_matrices.rs
use std::collections::HashMap;
use nalgebra::DMatrix;

use crate::discriminant::models::{ result::PooledMatrices, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    extract_group_values,
    calculate_group_means,
    matrix_to_vec,
    calculate_pooled_covariance_matrix,
};

pub fn calculate_pooled_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<PooledMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_pooled_matrices".into());

    // Extract variable names
    let variables: Vec<String> = config.main.independent_variables.clone();
    let num_vars = variables.len();

    // Initialize result structures
    let mut covariance: HashMap<String, HashMap<String, f64>> = HashMap::new();
    let mut correlation: HashMap<String, HashMap<String, f64>> = HashMap::new();

    // Calculate within-group sums of squares and cross-products
    let mut pooled_cov_matrix = calculate_pooled_covariance_matrix(data, &variables);

    // Calculate correlation matrix from covariance matrix
    let mut pooled_corr_matrix = DMatrix::zeros(num_vars, num_vars);

    for i in 0..num_vars {
        for j in 0..num_vars {
            if i == j {
                pooled_corr_matrix[(i, j)] = 1.0;
            } else {
                let cov_ij = pooled_cov_matrix[(i, j)];
                let std_i = pooled_cov_matrix[(i, i)].sqrt();
                let std_j = pooled_cov_matrix[(j, j)].sqrt();

                if std_i > 0.0 && std_j > 0.0 {
                    pooled_corr_matrix[(i, j)] = cov_ij / (std_i * std_j);
                } else {
                    pooled_corr_matrix[(i, j)] = 0.0;
                }
            }
        }
    }

    // Convert matrices to HashMaps for the result structure
    for (i, var1_name) in variables.iter().enumerate() {
        let mut cov_map: HashMap<String, f64> = HashMap::new();
        let mut corr_map: HashMap<String, f64> = HashMap::new();

        for (j, var2_name) in variables.iter().enumerate() {
            cov_map.insert(var2_name.clone(), pooled_cov_matrix[(i, j)]);
            corr_map.insert(var2_name.clone(), pooled_corr_matrix[(i, j)]);
        }

        covariance.insert(var1_name.clone(), cov_map);
        correlation.insert(var1_name.clone(), corr_map);
    }

    Ok(PooledMatrices {
        variables,
        covariance,
        correlation,
    })
}

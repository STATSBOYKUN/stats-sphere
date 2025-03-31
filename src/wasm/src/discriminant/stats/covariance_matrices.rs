// covariance_matrices.rs
use std::collections::HashMap;
use nalgebra::DMatrix;

use crate::discriminant::models::{ result::CovarianceMatrices, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    extract_group_values,
    calculate_group_means,
};

pub fn calculate_covariance_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CovarianceMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_covariance_matrices".into());

    // Extract group and variable names
    let groups: Vec<String> = (1..=data.group_data.len()).map(|i| i.to_string()).collect();
    let variables: Vec<String> = config.main.independent_variables.clone();
    let num_vars = variables.len();

    // Initialize matrices structure
    let mut matrices: HashMap<String, HashMap<String, HashMap<String, f64>>> = HashMap::new();

    // For each group, create a covariance matrix
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        if group_data.is_empty() {
            continue;
        }

        let group_name = &groups[group_idx];
        let mut group_matrix: HashMap<String, HashMap<String, f64>> = HashMap::new();

        // Calculate means for each variable in this group
        let means = calculate_group_means(group_data, &variables);

        // Create covariance matrix for this group
        let mut cov_matrix = DMatrix::zeros(num_vars, num_vars);

        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1 = extract_group_values(group_data, var1_idx, &variables);
                let values2 = extract_group_values(group_data, var2_idx, &variables);

                cov_matrix[(var1_idx, var2_idx)] = calculate_covariance(
                    &values1,
                    &values2,
                    means[var1_idx],
                    means[var2_idx]
                );
            }
        }

        // Convert the matrix to the HashMap format required by the result type
        for (var1_idx, var1_name) in variables.iter().enumerate() {
            let mut var_row: HashMap<String, f64> = HashMap::new();

            for (var2_idx, var2_name) in variables.iter().enumerate() {
                var_row.insert(var2_name.clone(), cov_matrix[(var1_idx, var2_idx)]);
            }

            group_matrix.insert(var1_name.clone(), var_row);
        }

        matrices.insert(group_name.clone(), group_matrix);
    }

    Ok(CovarianceMatrices {
        groups,
        variables,
        matrices,
    })
}

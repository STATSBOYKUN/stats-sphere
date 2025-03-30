use std::collections::HashMap;

use crate::discriminant::models::{ result::CovarianceMatrices, AnalysisData, DiscriminantConfig };
use crate::discriminant::util::calculate_covariance;

pub fn calculate_covariance_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CovarianceMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_covariance_matrices".into());

    // Extract group and variable names
    let groups: Vec<String> = (0..data.group_data.len()).map(|i| (i + 1).to_string()).collect();

    let variables: Vec<String> = config.main.independent_variables.clone();

    // Initialize matrices structure
    let mut matrices: HashMap<String, HashMap<String, HashMap<String, f64>>> = HashMap::new();

    // For each group, create a covariance matrix
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        let group_name = &groups[group_idx];
        let mut group_matrix: HashMap<String, HashMap<String, f64>> = HashMap::new();

        // Calculate means for each variable in this group
        let mut means = Vec::with_capacity(variables.len());
        for var_idx in 0..variables.len() {
            let values: Vec<f64> = group_data
                .iter()
                .map(|case| case[var_idx])
                .collect();

            means.push(
                if values.is_empty() {
                    0.0
                } else {
                    values.iter().sum::<f64>() / (values.len() as f64)
                }
            );
        }

        for (var1_idx, var1_name) in variables.iter().enumerate() {
            let mut var_row: HashMap<String, f64> = HashMap::new();

            // Extract values for variable 1
            let values1: Vec<f64> = group_data
                .iter()
                .map(|case| case[var1_idx])
                .collect();

            for (var2_idx, var2_name) in variables.iter().enumerate() {
                // Extract values for variable 2
                let values2: Vec<f64> = group_data
                    .iter()
                    .map(|case| case[var2_idx])
                    .collect();

                // Calculate covariance
                let cov = calculate_covariance(
                    &values1,
                    &values2,
                    means[var1_idx],
                    means[var2_idx]
                );
                var_row.insert(var2_name.clone(), cov);
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

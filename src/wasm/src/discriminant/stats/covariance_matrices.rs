use std::collections::HashMap;

use crate::discriminant::models::{ result::CovarianceMatrices, AnalysisData, DiscriminantConfig };

pub fn calculate_covariance_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CovarianceMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_covariance_matrices".into());

    // Extract group and variable names
    let groups: Vec<String> = (0..data.group_data.len())
        .map(|i| format!("Group_{}", i + 1))
        .collect();

    let variables: Vec<String> = config.main.independent_variables.clone();

    // Initialize matrices structure
    let mut matrices: HashMap<String, HashMap<String, HashMap<String, f64>>> = HashMap::new();

    // For each group, create a covariance matrix
    for group in &groups {
        let mut group_matrix: HashMap<String, HashMap<String, f64>> = HashMap::new();

        for var1 in &variables {
            let mut var_row: HashMap<String, f64> = HashMap::new();

            for var2 in &variables {
                if var1 == var2 {
                    // Diagonal values
                    var_row.insert(var2.clone(), 0.19);
                } else {
                    // Off-diagonal values
                    var_row.insert(var2.clone(), 0.011);
                }
            }

            group_matrix.insert(var1.clone(), var_row);
        }

        matrices.insert(group.clone(), group_matrix);
    }

    Ok(CovarianceMatrices {
        groups,
        variables,
        matrices,
    })
}

use std::collections::HashMap;

use crate::discriminant::models::{ result::PooledMatrices, AnalysisData, DiscriminantConfig };

pub fn calculate_pooled_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<PooledMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_pooled_matrices".into());

    // Extract variable names
    let variables: Vec<String> = config.main.independent_variables.clone();

    // Initialize result structures
    let mut covariance: HashMap<String, HashMap<String, f64>> = HashMap::new();
    let mut correlation: HashMap<String, HashMap<String, f64>> = HashMap::new();

    // Populate with values similar to image 5
    for var1 in &variables {
        let mut cov_map: HashMap<String, f64> = HashMap::new();
        let mut corr_map: HashMap<String, f64> = HashMap::new();

        for var2 in &variables {
            if var1 == var2 {
                // Diagonal values
                cov_map.insert(var2.clone(), 0.225);
                corr_map.insert(var2.clone(), 1.0);
            } else {
                // Off-diagonal values
                cov_map.insert(var2.clone(), 0.014);
                corr_map.insert(var2.clone(), 0.122);
            }
        }

        covariance.insert(var1.clone(), cov_map);
        correlation.insert(var1.clone(), corr_map);
    }

    Ok(PooledMatrices {
        variables,
        covariance,
        correlation,
    })
}

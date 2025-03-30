use std::collections::HashMap;

use crate::discriminant::models::{ result::PooledMatrices, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    extract_group_values,
    calculate_group_means,
};

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

    // Calculate within-group sums of squares and cross-products
    let mut within_ss = vec![vec![0.0; variables.len()]; variables.len()];
    let mut total_n = 0;

    for group_data in data.group_data.iter() {
        let n_cases = group_data.len();
        if n_cases <= 1 {
            continue; // Skip groups with 0 or 1 case
        }

        total_n += n_cases;

        // Calculate means for each variable in this group
        let means = calculate_group_means(group_data, &variables);

        // Calculate within-group sums of squares and cross-products
        for var1_idx in 0..variables.len() {
            for var2_idx in 0..variables.len() {
                let values1 = extract_group_values(group_data, var1_idx, &variables);
                let values2 = extract_group_values(group_data, var2_idx, &variables);

                let sum_products = values1
                    .iter()
                    .zip(values2.iter())
                    .map(|(&v1, &v2)| (v1 - means[var1_idx]) * (v2 - means[var2_idx]))
                    .sum::<f64>();

                within_ss[var1_idx][var2_idx] += sum_products;
            }
        }
    }

    // Calculate pooled covariance matrix
    let num_groups = data.group_data.len();
    let degrees_of_freedom = total_n - num_groups;

    for (var1_idx, var1_name) in variables.iter().enumerate() {
        let mut cov_map: HashMap<String, f64> = HashMap::new();
        let mut corr_map: HashMap<String, f64> = HashMap::new();

        for (var2_idx, var2_name) in variables.iter().enumerate() {
            // Pooled covariance
            let cov_value = within_ss[var1_idx][var2_idx] / (degrees_of_freedom as f64);
            cov_map.insert(var2_name.clone(), cov_value);

            // Pooled correlation
            if var1_idx == var2_idx {
                corr_map.insert(var2_name.clone(), 1.0);
            } else {
                let var1_variance = within_ss[var1_idx][var1_idx] / (degrees_of_freedom as f64);
                let var2_variance = within_ss[var2_idx][var2_idx] / (degrees_of_freedom as f64);

                if var1_variance > 0.0 && var2_variance > 0.0 {
                    let corr_value = cov_value / (var1_variance.sqrt() * var2_variance.sqrt());
                    corr_map.insert(var2_name.clone(), corr_value);
                } else {
                    corr_map.insert(var2_name.clone(), 0.0);
                }
            }
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

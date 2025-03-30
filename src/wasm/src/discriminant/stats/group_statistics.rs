use std::collections::HashMap;

use crate::discriminant::models::{ result::GroupStatistics, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::extract_group_values;

pub fn calculate_group_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<GroupStatistics, String> {
    web_sys::console::log_1(&"Executing calculate_group_statistics".into());

    // Create categories as strings
    let groups: Vec<String> = (0..data.group_data.len()).map(|i| (i + 1).to_string()).collect();
    let variables = config.main.independent_variables.clone();

    // Initialize result structures
    let mut means: HashMap<String, Vec<f64>> = HashMap::new();
    let mut std_deviations: HashMap<String, Vec<f64>> = HashMap::new();

    // Calculate means and standard deviations for each group
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        let group_name = &groups[group_idx];
        let mut group_means = Vec::with_capacity(variables.len());
        let mut group_std_devs = Vec::with_capacity(variables.len());

        for var_idx in 0..variables.len() {
            // Extract values for this variable in this group
            let values = extract_group_values(group_data, var_idx, &variables);

            // Calculate mean
            let mean_value = if values.is_empty() {
                0.0
            } else {
                values.iter().sum::<f64>() / (values.len() as f64)
            };

            // Calculate standard deviation
            let std_dev_value = if values.len() <= 1 {
                0.0
            } else {
                let variance =
                    values
                        .iter()
                        .map(|&value| (value - mean_value).powi(2))
                        .sum::<f64>() / ((values.len() - 1) as f64);
                variance.sqrt()
            };

            group_means.push(mean_value);
            group_std_devs.push(std_dev_value);
        }

        means.insert(group_name.clone(), group_means);
        std_deviations.insert(group_name.clone(), group_std_devs);
    }

    Ok(GroupStatistics {
        groups,
        variables,
        means,
        std_deviations,
    })
}

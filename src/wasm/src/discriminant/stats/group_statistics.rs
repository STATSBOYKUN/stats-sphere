use std::collections::HashMap;
use rayon::prelude::*;

use crate::discriminant::models::{ result::GroupStatistics, AnalysisData, DiscriminantConfig };
use super::core::{ extract_analyzed_dataset, calculate_std_dev };

pub fn calculate_group_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<GroupStatistics, String> {
    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;
    let independent_variables = &config.main.independent_variables;

    let mut result = GroupStatistics {
        groups: Vec::new(),
        variables: independent_variables.clone(),
        means: HashMap::new(),
        std_deviations: HashMap::new(),
    };

    // Calculate "Total" group statistics for all variables
    let mut total_values = HashMap::new();
    for variable in independent_variables {
        let mut all_values = Vec::new();
        for group in &dataset.group_labels {
            if let Some(values) = dataset.group_data.get(variable).and_then(|g| g.get(group)) {
                all_values.extend(values.clone());
            }
        }
        total_values.insert(variable.clone(), all_values);
    }

    // Initialize mean and std_dev maps
    for variable in independent_variables {
        result.means.insert(variable.clone(), Vec::new());
        result.std_deviations.insert(variable.clone(), Vec::new());
    }

    // Add "Total" group
    let mut unique_groups = vec!["Total".to_string()];
    unique_groups.extend(dataset.group_labels.clone());
    result.groups = unique_groups;

    // Calculate statistics for each group and variable in parallel
    let statistics: Vec<(String, Vec<(String, f64, f64)>)> = result.groups
        .par_iter()
        .map(|group| {
            let var_stats = independent_variables
                .par_iter()
                .map(|variable| {
                    // Create a static empty Vec that can be referenced safely
                    let empty_vec: Vec<f64> = Vec::new();

                    let values = if group == "Total" {
                        total_values.get(variable).unwrap_or(&empty_vec)
                    } else {
                        dataset.group_data
                            .get(variable)
                            .and_then(|g| g.get(group))
                            .unwrap_or(&empty_vec)
                    };

                    if values.is_empty() {
                        (variable.clone(), 0.0, 0.0)
                    } else {
                        let mean = values.iter().sum::<f64>() / (values.len() as f64);
                        let std_dev = calculate_std_dev(values, Some(mean));
                        (variable.clone(), mean, std_dev)
                    }
                })
                .collect();

            (group.clone(), var_stats)
        })
        .collect();

    // Combine results
    if config.statistics.means {
        for (group_idx, (group, var_stats)) in statistics.iter().enumerate() {
            for (variable, mean, std_dev) in var_stats {
                result.means.get_mut(variable).unwrap().push(*mean);
                result.std_deviations.get_mut(variable).unwrap().push(*std_dev);
            }
        }
    }

    Ok(result)
}

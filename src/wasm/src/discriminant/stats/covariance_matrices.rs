use std::collections::HashMap;
use rayon::prelude::*;

use crate::discriminant::models::{ result::CovarianceMatrices, AnalysisData, DiscriminantConfig };
use super::core::{ extract_analyzed_dataset, calculate_covariance, AnalyzedDataset };

pub fn calculate_covariance_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CovarianceMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_covariance_matrices".into());

    // Skip calculation if neither option is selected
    if !config.statistics.sg_covariance && !config.statistics.total_covariance {
        return Ok(CovarianceMatrices {
            groups: Vec::new(),
            variables: config.main.independent_variables.clone(),
            matrices: HashMap::new(),
        });
    }

    // Extract analyzed dataset
    let mut dataset = extract_analyzed_dataset(data, config)?;
    let independent_variables = &config.main.independent_variables;

    // Add "Total" group if needed
    if config.statistics.total_covariance {
        let mut total_group = HashMap::new();

        for variable in independent_variables {
            let mut all_values = Vec::new();

            for group in &dataset.group_labels {
                if let Some(values) = dataset.group_data.get(variable).and_then(|g| g.get(group)) {
                    all_values.extend(values.clone());
                }
            }

            total_group.insert(variable.clone(), all_values);
        }

        dataset.group_data.insert("Total".to_string(), total_group);

        // Add "Total" to group means as well
        let mut total_means = HashMap::new();
        for variable in independent_variables {
            // Create a static empty Vec that can be referenced safely
            let empty_vec: Vec<f64> = Vec::new();

            // Use and_then() with proper reference handling
            let all_values = dataset.group_data
                .get(variable)
                .and_then(|g| g.get("Total"))
                .unwrap_or(&empty_vec);

            let mean = if all_values.is_empty() {
                0.0
            } else {
                all_values.iter().sum::<f64>() / (all_values.len() as f64)
            };

            total_means.insert(variable.clone(), mean);
        }

        dataset.group_means.insert("Total".to_string(), total_means);
    }

    // Determine which groups to calculate
    let groups_to_calculate = if
        config.statistics.sg_covariance &&
        config.statistics.total_covariance
    {
        let mut all_groups = dataset.group_labels.clone();
        all_groups.push("Total".to_string());
        all_groups
    } else if config.statistics.sg_covariance {
        dataset.group_labels.clone()
    } else if config.statistics.total_covariance {
        vec!["Total".to_string()]
    } else {
        Vec::new()
    };

    // Calculate covariance matrices in parallel
    let matrices: HashMap<String, HashMap<String, HashMap<String, f64>>> = groups_to_calculate
        .par_iter()
        .filter_map(|group| {
            let group_matrix = calculate_group_covariance_matrix(
                &dataset,
                group,
                independent_variables
            );
            Some((group.clone(), group_matrix))
        })
        .collect();

    // Determine result groups based on selected statistics
    let result_groups = if config.statistics.sg_covariance && config.statistics.total_covariance {
        let mut result = dataset.group_labels.clone();
        result.push("Total".to_string());
        result
    } else if config.statistics.sg_covariance {
        dataset.group_labels.clone()
    } else if config.statistics.total_covariance {
        vec!["Total".to_string()]
    } else {
        Vec::new()
    };

    Ok(CovarianceMatrices {
        groups: result_groups,
        variables: independent_variables.clone(),
        matrices,
    })
}

fn calculate_group_covariance_matrix(
    dataset: &AnalyzedDataset,
    group: &str,
    variables: &[String]
) -> HashMap<String, HashMap<String, f64>> {
    let mut group_matrix = HashMap::new();

    // For each variable, calculate covariances with all other variables
    for var1 in variables {
        let mut var_row = HashMap::new();

        for var2 in variables {
            if
                let (Some(values1), Some(values2)) = (
                    dataset.group_data.get(var1).and_then(|g| g.get(group)),
                    dataset.group_data.get(var2).and_then(|g| g.get(group)),
                )
            {
                let cov = if values1.len() > 1 && values1.len() == values2.len() {
                    let mean1 = dataset.group_means
                        .get(group)
                        .and_then(|m| m.get(var1))
                        .unwrap_or(&0.0);
                    let mean2 = dataset.group_means
                        .get(group)
                        .and_then(|m| m.get(var2))
                        .unwrap_or(&0.0);
                    calculate_covariance(values1, values2, Some(*mean1), Some(*mean2))
                } else {
                    0.0
                };

                var_row.insert(var2.clone(), cov);
            }
        }

        group_matrix.insert(var1.clone(), var_row);
    }

    group_matrix
}

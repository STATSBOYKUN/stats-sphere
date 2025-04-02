use std::collections::HashMap;

use crate::discriminant::models::{
    data::DataValue,
    result::CovarianceMatrices,
    AnalysisData,
    DataRecord,
    DiscriminantConfig,
};

pub fn calculate_covariance_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CovarianceMatrices, String> {
    web_sys::console::log_1(&"Executing calculate_covariance_matrices".into());

    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;

    // Skip calculation if neither option is selected
    if !config.statistics.sg_covariance && !config.statistics.total_covariance {
        return Ok(CovarianceMatrices {
            groups: Vec::new(),
            variables: independent_variables.clone(),
            matrices: HashMap::new(),
        });
    }

    // Flatten the group data for easier processing
    let flattened_group_data: Vec<&DataRecord> = data.group_data
        .iter()
        .flat_map(|records| records.iter())
        .collect();

    // Extract group values by index and track unique groups
    let mut record_groups: HashMap<usize, String> = HashMap::new();
    let mut unique_groups = Vec::new();

    for (i, record) in flattened_group_data.iter().enumerate() {
        if let Some(value) = record.values.get(grouping_variable) {
            let group_label = match value {
                DataValue::Number(num) => num.to_string(),
                DataValue::Text(text) => text.clone(),
                _ => {
                    continue;
                }
            };

            record_groups.insert(i, group_label.clone());

            if !unique_groups.contains(&group_label) {
                unique_groups.push(group_label);
            }
        }
    }

    // Sort the groups
    unique_groups.sort();

    // Group data by group and variable
    let mut grouped_data: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();

    // Initialize the data structure
    for group in &unique_groups {
        for variable in independent_variables {
            grouped_data
                .entry(group.clone())
                .or_insert_with(HashMap::new)
                .entry(variable.clone())
                .or_insert_with(Vec::new);
        }
    }

    // Add a "Total" group for all data combined
    if config.statistics.total_covariance {
        for variable in independent_variables {
            grouped_data
                .entry("Total".to_string())
                .or_insert_with(HashMap::new)
                .entry(variable.clone())
                .or_insert_with(Vec::new);
        }
    }

    // Collect data for each group and variable
    for (var_idx, variable) in independent_variables.iter().enumerate() {
        if var_idx >= data.independent_data.len() {
            continue;
        }

        let var_records = &data.independent_data[var_idx];

        for (i, record) in var_records.iter().enumerate() {
            if let Some(group) = record_groups.get(&i) {
                if let Some(DataValue::Number(value)) = record.values.get(variable) {
                    // Add to specific group
                    grouped_data.get_mut(group).unwrap().get_mut(variable).unwrap().push(*value);

                    // Also add to "Total" group if needed
                    if config.statistics.total_covariance {
                        grouped_data
                            .get_mut("Total")
                            .unwrap()
                            .get_mut(variable)
                            .unwrap()
                            .push(*value);
                    }
                }
            }
        }
    }

    // Calculate means for each group and variable
    let mut group_means: HashMap<String, HashMap<String, f64>> = HashMap::new();
    let mut group_sizes: HashMap<String, usize> = HashMap::new();

    let all_groups = if config.statistics.total_covariance {
        let mut groups = unique_groups.clone();
        groups.push("Total".to_string());
        groups
    } else {
        unique_groups.clone()
    };

    for group in &all_groups {
        group_means.insert(group.clone(), HashMap::new());

        let mut group_size = 0;
        for variable in independent_variables {
            let values = &grouped_data[group][variable];
            group_size = values.len(); // All variables should have the same count

            if !values.is_empty() {
                let mean = values.iter().sum::<f64>() / (values.len() as f64);
                group_means.get_mut(group).unwrap().insert(variable.clone(), mean);
            } else {
                group_means.get_mut(group).unwrap().insert(variable.clone(), 0.0);
            }
        }

        group_sizes.insert(group.clone(), group_size);
    }

    // Calculate covariance matrices
    let mut matrices: HashMap<String, HashMap<String, HashMap<String, f64>>> = HashMap::new();

    // Determine which groups to calculate
    let groups_to_calculate = if
        config.statistics.sg_covariance &&
        config.statistics.total_covariance
    {
        all_groups
    } else if config.statistics.sg_covariance {
        unique_groups.clone()
    } else if config.statistics.total_covariance {
        vec!["Total".to_string()]
    } else {
        Vec::new()
    };

    for group in &groups_to_calculate {
        let mut group_matrix: HashMap<String, HashMap<String, f64>> = HashMap::new();

        for var1 in independent_variables {
            let mut var_row: HashMap<String, f64> = HashMap::new();

            for var2 in independent_variables {
                let values1 = &grouped_data[group][var1];
                let values2 = &grouped_data[group][var2];

                let cov = if values1.len() > 1 && values1.len() == values2.len() {
                    let mean1 = group_means[group][var1];
                    let mean2 = group_means[group][var2];

                    // Calculate covariance
                    let sum_of_products = values1
                        .iter()
                        .zip(values2.iter())
                        .map(|(&v1, &v2)| (v1 - mean1) * (v2 - mean2))
                        .sum::<f64>();

                    sum_of_products / ((values1.len() - 1) as f64)
                } else {
                    0.0
                };

                var_row.insert(var2.clone(), cov);
            }

            group_matrix.insert(var1.clone(), var_row);
        }

        matrices.insert(group.clone(), group_matrix);
    }

    // Return result with appropriate groups
    let result_groups = if config.statistics.sg_covariance && config.statistics.total_covariance {
        // Add the original groups plus "Total"
        let mut result = unique_groups.clone();
        result.push("Total".to_string());
        result
    } else if config.statistics.sg_covariance {
        unique_groups.clone()
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

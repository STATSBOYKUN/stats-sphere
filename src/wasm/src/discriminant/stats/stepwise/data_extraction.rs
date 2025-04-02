use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DataValue };

// Extract grouped data from dataset
pub fn extract_grouped_data(
    data: &AnalysisData,
    group_var: &str,
    variables: &[String],
    min_range: Option<f64>,
    max_range: Option<f64>
) -> Result<(HashMap<String, HashMap<String, Vec<f64>>>, Vec<String>, usize), String> {
    // Initialize group mappings
    let mut group_mappings: HashMap<String, Vec<usize>> = HashMap::new();

    // Extract group data
    for (i, record) in data.group_data.iter().flatten().enumerate() {
        if let Some(value) = record.values.get(group_var) {
            let group_label = match value {
                DataValue::Number(num) => {
                    // Check if within range
                    let in_range =
                        min_range.map_or(true, |min| *num >= min) &&
                        max_range.map_or(true, |max| *num <= max);
                    if in_range {
                        num.to_string()
                    } else {
                        continue;
                    }
                }
                DataValue::Text(text) => text.clone(),
                _ => {
                    continue;
                }
            };

            group_mappings.entry(group_label).or_insert_with(Vec::new).push(i);
        }
    }

    // Sort group labels for consistent processing
    let mut group_labels: Vec<String> = group_mappings.keys().cloned().collect();
    group_labels.sort();

    // Extract values for each variable by group
    let mut variable_values: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();
    let mut total_cases = 0;

    for var_name in variables {
        let mut group_values: HashMap<String, Vec<f64>> = HashMap::new();

        // Find index of this variable in independent_data
        for (var_idx, var_data) in data.independent_data.iter().enumerate() {
            if var_idx >= variables.len() {
                continue;
            }

            if &variables[var_idx] == var_name {
                // Process each group
                for group_label in &group_labels {
                    let mut values = Vec::new();

                    if let Some(indices) = group_mappings.get(group_label) {
                        for &idx in indices {
                            if idx < var_data.len() {
                                if
                                    let Some(DataValue::Number(val)) =
                                        var_data[idx].values.get(var_name)
                                {
                                    values.push(*val);
                                }
                            }
                        }
                    }

                    group_values.insert(group_label.clone(), values);
                }

                break;
            }
        }

        // Count total valid cases for the first variable
        if var_name == &variables[0] {
            for group_values in group_values.values() {
                total_cases += group_values.len();
            }
        }

        variable_values.insert(var_name.clone(), group_values);
    }

    Ok((variable_values, group_labels, total_cases))
}

// Calculate group means for all variables
pub fn calculate_group_means(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    variables: &[String]
) -> HashMap<String, HashMap<String, f64>> {
    let mut group_means: HashMap<String, HashMap<String, f64>> = HashMap::new();

    for group_label in group_labels {
        let mut var_means = HashMap::new();

        for var_name in variables {
            if
                let Some(group_var_values) = group_data
                    .get(var_name)
                    .and_then(|g| g.get(group_label))
            {
                if !group_var_values.is_empty() {
                    let mean =
                        group_var_values.iter().sum::<f64>() / (group_var_values.len() as f64);
                    var_means.insert(var_name.clone(), mean);
                } else {
                    var_means.insert(var_name.clone(), 0.0);
                }
            } else {
                var_means.insert(var_name.clone(), 0.0);
            }
        }

        group_means.insert(group_label.clone(), var_means);
    }

    group_means
}

// Calculate overall means for all variables
pub fn calculate_overall_means(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    variables: &[String]
) -> HashMap<String, f64> {
    let mut overall_means: HashMap<String, f64> = HashMap::new();

    for var_name in variables {
        let mut sum = 0.0;
        let mut count = 0;

        for group_label in group_labels {
            if let Some(values) = group_data.get(var_name).and_then(|g| g.get(group_label)) {
                sum += values.iter().sum::<f64>();
                count += values.len();
            }
        }

        if count > 0 {
            overall_means.insert(var_name.clone(), sum / (count as f64));
        } else {
            overall_means.insert(var_name.clone(), 0.0);
        }
    }

    overall_means
}

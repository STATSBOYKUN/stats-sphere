use std::collections::HashMap;
use crate::hierarchical::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::ProximityMatrix,
};
use super::{ calculate_distance, calculate_variable_distance };
pub fn generate_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<ProximityMatrix, String> {
    let mut distances = HashMap::new();
    // Get variables to use for calculating distances
    let variables = match &config.main.variables {
        Some(vars) => vars.clone(),
        None => {
            return Err("No variables specified for clustering".to_string());
        }
    };

    if config.main.cluster_cases {
        // CASE CLUSTERING
        generate_case_proximity_matrix(data, config, &variables, &mut distances)?;
    } else if config.main.cluster_var {
        // VARIABLE CLUSTERING
        generate_variable_proximity_matrix(data, config, &variables, &mut distances)?;
    } else {
        return Err("Neither case nor variable clustering specified".to_string());
    }

    Ok(ProximityMatrix { distances })
}

fn generate_case_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig,
    variables: &[String],
    distances: &mut HashMap<(String, String), f64>
) -> Result<(), String> {
    // Case clustering - calculate distances between all cases
    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }
    let case_count = data.cluster_data[0].len();

    // Extract values for each case and variable
    let mut case_values = Vec::with_capacity(case_count);
    let mut case_labels = Vec::with_capacity(case_count);

    for case_idx in 0..case_count {
        let mut values = HashMap::new();

        // Get values for all specified variables
        for var in variables {
            for dataset_idx in 0..data.cluster_data.len() {
                let dataset = &data.cluster_data[dataset_idx];

                if case_idx < dataset.len() {
                    if let Some(value) = dataset[case_idx].values.get(var) {
                        values.insert(var.clone(), value.clone());
                        break;
                    }
                }
            }
        }

        // Create case label using gender or other specified label
        let label = if let Some(label_var) = &config.main.label_cases {
            let mut label_value = String::new();

            // First try to find the label in label data
            for dataset in &data.label_data {
                if case_idx < dataset.len() {
                    if let Some(value) = dataset[case_idx].values.get(label_var) {
                        match value {
                            DataValue::Text(text) => {
                                label_value = text.clone();
                                break;
                            }
                            DataValue::Number(num) => {
                                label_value = num.to_string();
                                break;
                            }
                            _ => {}
                        }
                    }
                }
            }

            // Format as shown in the reference image: "1.m", "2.f", etc.
            format!("{}.{}", case_idx + 1, label_value)
        } else {
            format!("Case {}", case_idx + 1)
        };

        case_values.push(values);
        case_labels.push(label);
    }

    // Calculate all pairwise distances including self (which is 0)
    for i in 0..case_count {
        for j in 0..case_count {
            let distance = if i == j {
                0.0 // Distance to self is always 0
            } else {
                calculate_distance(&case_values[i], &case_values[j], variables, config)
            };

            distances.insert((case_labels[i].clone(), case_labels[j].clone()), distance);
        }
    }
    Ok(())
}

fn generate_variable_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig,
    variables: &[String],
    distances: &mut HashMap<(String, String), f64>
) -> Result<(), String> {
    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }
    let case_count = data.cluster_data[0].len();

    // For each variable, collect its values across all cases
    let mut variable_values: HashMap<String, Vec<f64>> = HashMap::new();

    for var in variables {
        let mut values = Vec::with_capacity(case_count);

        for i in 0..case_count {
            for dataset in &data.cluster_data {
                if i < dataset.len() {
                    if let Some(DataValue::Number(value)) = dataset[i].values.get(var) {
                        values.push(*value);
                        break;
                    }
                }
            }
        }

        variable_values.insert(var.clone(), values);
    }

    // Calculate distances between all pairs of variables
    for i in 0..variables.len() {
        for j in 0..variables.len() {
            let var_i = &variables[i];
            let var_j = &variables[j];

            let distance = if i == j {
                0.0 // Distance to self is always 0
            } else {
                // For variable clustering, we compare the vectors of values
                calculate_variable_distance(&variable_values, var_i, var_j, config)
            };

            distances.insert((var_i.clone(), var_j.clone()), distance);
        }
    }

    Ok(())
}

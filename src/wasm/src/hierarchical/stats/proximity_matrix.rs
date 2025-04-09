// proximity_matrix.rs
use std::collections::HashMap;
use crate::hierarchical::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::ProximityMatrix,
};

use super::core::{
    calculate_distance,
    calculate_statistics,
    calculate_variable_distance,
    extract_case_label,
};

pub fn generate_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<ProximityMatrix, String> {
    let variables = config.main.variables
        .as_ref()
        .ok_or_else(|| "No variables specified for clustering".to_string())?;

    let mut distances = if config.main.cluster_cases {
        generate_case_proximity_matrix(data, config, variables)?
    } else if config.main.cluster_var {
        generate_variable_proximity_matrix(data, config, variables)?
    } else {
        return Err("Neither case nor variable clustering specified".to_string());
    };

    if config.method.abs_value || config.method.change_sign || config.method.rescale_range {
        transform_proximity_values(&mut distances, config)?;
    }

    Ok(ProximityMatrix { distances })
}

fn generate_case_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig,
    variables: &[String]
) -> Result<HashMap<(String, String), f64>, String> {
    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }

    let case_count = data.cluster_data[0].len();
    let mut distances = HashMap::new();

    // Extract case data
    let case_values: Vec<HashMap<String, DataValue>> = (0..case_count)
        .map(|case_idx| {
            let mut values = HashMap::new();
            for var in variables {
                for dataset in &data.cluster_data {
                    if case_idx < dataset.len() {
                        if let Some(value) = dataset[case_idx].values.get(var) {
                            values.insert(var.clone(), value.clone());
                            break;
                        }
                    }
                }
            }
            values
        })
        .collect();

    // Create case labels using the updated extract_case_label function
    let case_labels: Vec<String> = (0..case_count)
        .map(|case_idx| extract_case_label(data, config, case_idx))
        .collect();

    // Calculate distances - could be parallelized for better performance
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

    Ok(distances)
}

fn generate_variable_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig,
    variables: &[String]
) -> Result<HashMap<(String, String), f64>, String> {
    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }

    let mut distances = HashMap::new();
    let case_count = data.cluster_data[0].len();

    // For each variable, collect its values across all cases
    let mut variable_values: HashMap<String, Vec<f64>> = HashMap::new();

    for var in variables {
        let values: Vec<f64> = (0..case_count)
            .filter_map(|i| {
                data.cluster_data
                    .iter()
                    .filter_map(|dataset| {
                        if i < dataset.len() {
                            match dataset[i].values.get(var) {
                                Some(DataValue::Number(value)) => Some(*value),
                                _ => None,
                            }
                        } else {
                            None
                        }
                    })
                    .next()
            })
            .collect();

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
                calculate_variable_distance(&variable_values, var_i, var_j, config)
            };

            distances.insert((var_i.clone(), var_j.clone()), distance);
        }
    }

    Ok(distances)
}

// Functions to transform proximity matrix values
pub fn transform_proximity_values(
    distances: &mut HashMap<(String, String), f64>,
    config: &ClusterConfig
) -> Result<(), String> {
    // Apply transformations in order: abs value, sign change, rescale
    if config.method.abs_value {
        for value in distances.values_mut() {
            *value = value.abs();
        }
    }

    if config.method.change_sign {
        for value in distances.values_mut() {
            *value = -*value;
        }
    }

    if config.method.rescale_range {
        let values: Vec<f64> = distances.values().cloned().collect();
        let stats = calculate_statistics(&values);

        // Rescale all values to [0,1]
        if stats.range > 0.0 {
            for value in distances.values_mut() {
                *value = (*value - stats.min) / stats.range;
            }
        }
    }

    Ok(())
}

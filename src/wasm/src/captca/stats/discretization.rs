use std::collections::HashMap;

use crate::captca::models::{
    config::{ CATPCAConfig, DiscretizeMethod },
    data::{ AnalysisData, DataValue },
};

/// Apply discretization to variables
pub fn apply_discretization(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<AnalysisData, String> {
    let mut discretized_data = data.clone();

    // Get variables to discretize
    if let Some(variables_list) = &config.discretize.variables_list {
        for var_name in variables_list {
            match config.discretize.method {
                DiscretizeMethod::Grouping => {
                    if config.discretize.number_of_categories {
                        // Grouping into categories with normal or uniform distribution
                        let categories = config.discretize.number_of_categories_value;
                        let normal_dist = config.discretize.distribution_normal;

                        // Extract values for the variable
                        let mut values = Vec::new();
                        for dataset in &data.analysis_data {
                            for record in dataset {
                                if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                    values.push(*val);
                                }
                            }
                        }

                        if values.is_empty() {
                            continue;
                        }

                        // Define category boundaries
                        let mut boundaries = Vec::new();

                        if normal_dist {
                            // Calculate mean and standard deviation
                            let sum: f64 = values.iter().sum();
                            let mean = sum / (values.len() as f64);

                            let variance: f64 =
                                values
                                    .iter()
                                    .map(|val| (val - mean).powi(2))
                                    .sum::<f64>() / (values.len() as f64);
                            let std_dev = variance.sqrt();

                            // Create boundaries using normal distribution
                            for i in 1..categories {
                                let percentile = (i as f64) / (categories as f64);
                                // Approximation for normal distribution percentiles
                                let z = -3.0 + 6.0 * percentile;
                                let boundary = mean + z * std_dev;
                                boundaries.push(boundary);
                            }
                        } else {
                            // Sort values for uniform distribution
                            values.sort_by(|a, b|
                                a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)
                            );

                            // Create boundaries for uniform distribution
                            for i in 1..categories {
                                let idx = (((i as f64) * (values.len() as f64)) /
                                    (categories as f64)) as usize;
                                if idx < values.len() {
                                    boundaries.push(values[idx]);
                                }
                            }
                        }

                        // Apply discretization
                        for dataset in &mut discretized_data.analysis_data {
                            for record in dataset {
                                if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                    let mut category = 1;
                                    for (i, &boundary) in boundaries.iter().enumerate() {
                                        if *val > boundary {
                                            category = (i as i32) + 2;
                                        } else {
                                            break;
                                        }
                                    }
                                    record.values.insert(
                                        var_name.clone(),
                                        DataValue::Number(category as f64)
                                    );
                                }
                            }
                        }
                    } else if
                        config.discretize.equal_intervals &&
                        config.discretize.equal_intervals_value.is_some()
                    {
                        // Grouping into equal intervals
                        let interval_size = config.discretize.equal_intervals_value.unwrap();

                        // Find minimum value
                        let mut min_val = f64::MAX;
                        for dataset in &data.analysis_data {
                            for record in dataset {
                                if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                    if *val < min_val {
                                        min_val = *val;
                                    }
                                }
                            }
                        }

                        // Apply discretization
                        for dataset in &mut discretized_data.analysis_data {
                            for record in dataset {
                                if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                    let category = ((val - min_val) / interval_size).floor() + 1.0;
                                    record.values.insert(
                                        var_name.clone(),
                                        DataValue::Number(category)
                                    );
                                }
                            }
                        }
                    }
                }
                DiscretizeMethod::Ranking => {
                    // Extract values with their indices
                    let mut values_with_indices = Vec::new();
                    let mut record_indices = Vec::new();

                    for (dataset_idx, dataset) in data.analysis_data.iter().enumerate() {
                        for (record_idx, record) in dataset.iter().enumerate() {
                            if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                values_with_indices.push((*val, dataset_idx, record_idx));
                                record_indices.push((dataset_idx, record_idx));
                            }
                        }
                    }

                    // Sort by value
                    values_with_indices.sort_by(|a, b|
                        a.0.partial_cmp(&b.0).unwrap_or(std::cmp::Ordering::Equal)
                    );

                    // Assign ranks
                    let mut ranks = HashMap::new();
                    for (rank, (_, dataset_idx, record_idx)) in values_with_indices
                        .iter()
                        .enumerate() {
                        ranks.insert((*dataset_idx, *record_idx), rank + 1);
                    }

                    // Apply ranking
                    for (dataset_idx, dataset) in discretized_data.analysis_data
                        .iter_mut()
                        .enumerate() {
                        for (record_idx, record) in dataset.iter_mut().enumerate() {
                            if let Some(rank) = ranks.get(&(dataset_idx, record_idx)) {
                                record.values.insert(
                                    var_name.clone(),
                                    DataValue::Number(*rank as f64)
                                );
                            }
                        }
                    }
                }
                DiscretizeMethod::Multiplying => {
                    // Extract values for standardization
                    let mut values = Vec::new();
                    for dataset in &data.analysis_data {
                        for record in dataset {
                            if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                values.push(*val);
                            }
                        }
                    }

                    if values.is_empty() {
                        continue;
                    }

                    // Calculate mean and standard deviation
                    let sum: f64 = values.iter().sum();
                    let mean = sum / (values.len() as f64);

                    let variance: f64 =
                        values
                            .iter()
                            .map(|val| (val - mean).powi(2))
                            .sum::<f64>() / (values.len() as f64);
                    let std_dev = variance.sqrt();

                    // Find minimum standardized value
                    let min_standardized = values
                        .iter()
                        .map(|val| (*val - mean) / std_dev)
                        .fold(f64::MAX, |a, b| a.min(b));

                    // Calculate offset to make minimum value 1
                    let offset = 1.0 - (min_standardized * 10.0).round();

                    // Apply transformation
                    for dataset in &mut discretized_data.analysis_data {
                        for record in dataset {
                            if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                                let standardized = (*val - mean) / std_dev;
                                let discretized = (standardized * 10.0).round() + offset;
                                record.values.insert(
                                    var_name.clone(),
                                    DataValue::Number(discretized)
                                );
                            }
                        }
                    }
                }
                _ => {}
            }
        }
    }

    Ok(discretized_data)
}

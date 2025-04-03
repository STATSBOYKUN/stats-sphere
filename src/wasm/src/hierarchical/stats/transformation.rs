use std::collections::HashMap;
use crate::hierarchical::models::{
    config::{ ClusterConfig, StandardizeMethod },
    data::{ AnalysisData, DataValue },
};

pub fn transform_data(data: &mut AnalysisData, config: &ClusterConfig) -> Result<(), String> {
    // Get variables to use for standardization
    let variables = match &config.main.variables {
        Some(vars) => vars.clone(),
        None => {
            return Err("No variables specified for transformation".to_string());
        }
    };

    if config.method.by_case {
        standardize_by_case(data, config, &variables)?;
    } else if config.method.by_variable {
        standardize_by_variable(data, config, &variables)?;
    }

    // Apply transformations to the proximity matrix if needed
    if config.method.abs_value || config.method.change_sign || config.method.rescale_range {
        // These transformations are applied to proximity matrix,
        // which is generated later in the process
    }

    Ok(())
}

fn standardize_by_case(
    data: &mut AnalysisData,
    config: &ClusterConfig,
    variables: &[String]
) -> Result<(), String> {
    if data.cluster_data.is_empty() {
        return Ok(());
    }

    // Process each case (row) separately
    for dataset_idx in 0..data.cluster_data.len() {
        let dataset = &mut data.cluster_data[dataset_idx];

        for case_idx in 0..dataset.len() {
            // Extract values for all variables for this case
            let mut case_values = Vec::new();

            for var in variables {
                if let Some(DataValue::Number(value)) = dataset[case_idx].values.get(var) {
                    case_values.push(*value);
                }
            }

            // Skip if no values to standardize
            if case_values.is_empty() {
                continue;
            }

            // Calculate statistics for this case
            let stats = calculate_statistics(&case_values);

            // Apply standardization to each value
            for var in variables {
                if let Some(DataValue::Number(value)) = dataset[case_idx].values.get_mut(var) {
                    *value = standardize_value(*value, &stats, &config.method.standardize_method);
                }
            }
        }
    }

    Ok(())
}

fn standardize_by_variable(
    data: &mut AnalysisData,
    config: &ClusterConfig,
    variables: &[String]
) -> Result<(), String> {
    if data.cluster_data.is_empty() {
        return Ok(());
    }

    // Process each variable (column) separately
    for var in variables {
        // Extract all values for this variable across all cases
        let mut var_values = Vec::new();

        for dataset in &data.cluster_data {
            for case in dataset {
                if let Some(DataValue::Number(value)) = case.values.get(var) {
                    var_values.push(*value);
                }
            }
        }

        // Skip if no values to standardize
        if var_values.is_empty() {
            continue;
        }

        // Calculate statistics for this variable
        let stats = calculate_statistics(&var_values);

        // Apply standardization to each case for this variable
        for dataset in &mut data.cluster_data {
            for case in dataset {
                if let Some(DataValue::Number(value)) = case.values.get_mut(var) {
                    *value = standardize_value(*value, &stats, &config.method.standardize_method);
                }
            }
        }
    }

    Ok(())
}

struct DataStatistics {
    mean: f64,
    std_dev: f64,
    min: f64,
    max: f64,
    range: f64,
    abs_max: f64,
}

fn calculate_statistics(values: &[f64]) -> DataStatistics {
    if values.is_empty() {
        return DataStatistics {
            mean: 0.0,
            std_dev: 1.0,
            min: 0.0,
            max: 0.0,
            range: 1.0,
            abs_max: 1.0,
        };
    }

    // Calculate mean
    let sum: f64 = values.iter().sum();
    let count = values.len() as f64;
    let mean = sum / count;

    // Calculate std dev
    let variance =
        values
            .iter()
            .map(|x| (x - mean).powi(2))
            .sum::<f64>() / count;
    let std_dev = variance.sqrt();

    // Find min and max
    let min = *values.iter().fold(&f64::INFINITY, |a, b| if b < a { b } else { a });
    let max = *values.iter().fold(&f64::NEG_INFINITY, |a, b| if b > a { b } else { a });

    // Calculate range and absolute max
    let range = max - min;
    let abs_max = values
        .iter()
        .map(|x| x.abs())
        .fold(0.0, |a, b| if b > a { b } else { a });

    DataStatistics {
        mean,
        std_dev,
        min,
        max,
        range,
        abs_max,
    }
}

fn standardize_value(value: f64, stats: &DataStatistics, method: &StandardizeMethod) -> f64 {
    match method {
        StandardizeMethod::None => value,
        StandardizeMethod::ZScore => {
            if stats.std_dev == 0.0 { 0.0 } else { (value - stats.mean) / stats.std_dev }
        }
        StandardizeMethod::RangeNegOneToOne => {
            if stats.range == 0.0 { 0.0 } else { 2.0 * ((value - stats.min) / stats.range) - 1.0 }
        }
        StandardizeMethod::RangeZeroToOne => {
            if stats.range == 0.0 { 0.5 } else { (value - stats.min) / stats.range }
        }
        StandardizeMethod::MaxMagnitudeOne => {
            if stats.abs_max == 0.0 { 0.0 } else { value / stats.abs_max }
        }
        StandardizeMethod::MeanOne => {
            if stats.mean == 0.0 { value + 1.0 } else { value / stats.mean }
        }
        StandardizeMethod::StdDevOne => {
            if stats.std_dev == 0.0 { value } else { value / stats.std_dev }
        }
    }
}

// Functions to transform proximity matrix values
pub fn transform_proximity_values(
    distances: &mut HashMap<(String, String), f64>,
    config: &ClusterConfig
) -> Result<(), String> {
    // Apply transformations in order: abs value, sign change, rescale

    if config.method.abs_value {
        apply_absolute_value(distances);
    }

    if config.method.change_sign {
        apply_sign_change(distances);
    }

    if config.method.rescale_range {
        apply_rescale(distances);
    }

    Ok(())
}

fn apply_absolute_value(distances: &mut HashMap<(String, String), f64>) {
    for value in distances.values_mut() {
        *value = value.abs();
    }
}

fn apply_sign_change(distances: &mut HashMap<(String, String), f64>) {
    for value in distances.values_mut() {
        *value = -*value;
    }
}

fn apply_rescale(distances: &mut HashMap<(String, String), f64>) {
    // Find min and max values
    let mut min = f64::INFINITY;
    let mut max = f64::NEG_INFINITY;

    for &value in distances.values() {
        if value < min {
            min = value;
        }
        if value > max {
            max = value;
        }
    }

    let range = max - min;

    // Rescale all values to [0,1]
    if range > 0.0 {
        for value in distances.values_mut() {
            *value = (*value - min) / range;
        }
    }
}

// transformation.rs
use crate::hierarchical::models::{
    config::{ ClusterConfig, StandardizeMethod },
    data::{ AnalysisData, DataValue },
};
use crate::hierarchical::stats::common::{ calculate_statistics, DataStats };

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
            let case_values: Vec<f64> = variables
                .iter()
                .filter_map(|var| {
                    if let Some(DataValue::Number(value)) = dataset[case_idx].values.get(var) {
                        Some(*value)
                    } else {
                        None
                    }
                })
                .collect();

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
        let var_values: Vec<f64> = data.cluster_data
            .iter()
            .flat_map(|dataset| dataset.iter())
            .filter_map(|case| {
                if let Some(DataValue::Number(value)) = case.values.get(var) {
                    Some(*value)
                } else {
                    None
                }
            })
            .collect();

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

fn standardize_value(value: f64, stats: &DataStats, method: &StandardizeMethod) -> f64 {
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

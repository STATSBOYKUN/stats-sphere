use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::factor::models::{
    config::FactorAnalysisConfig,
    data::{ AnalysisData, DataRecord, DataValue },
};

pub fn extract_data_matrix(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<(DMatrix<f64>, Vec<String>), String> {
    // Get the target variables
    let var_names = if let Some(vars) = &config.main.target_var {
        // If specific variables are provided, use them
        let var_defs = if !data.target_data_defs.is_empty() && !data.target_data_defs[0].is_empty() {
            &data.target_data_defs[0]
        } else {
            return Err("No variable definitions found".to_string());
        };

        // Map variable names (might be index-based in configs)
        vars.iter()
            .map(|v| {
                if let Ok(idx) = v.parse::<usize>() {
                    if idx < var_defs.len() { var_defs[idx].name.clone() } else { v.clone() }
                } else {
                    v.clone()
                }
            })
            .collect::<Vec<String>>()
    } else {
        // Collect all numeric variables from all datasets
        data.target_data
            .iter()
            .flat_map(|dataset| {
                dataset.iter().flat_map(|record| {
                    record.values
                        .iter()
                        .filter(|(_, value)| matches!(value, DataValue::Number(_)))
                        .map(|(key, _)| key.clone())
                })
            })
            .collect::<std::collections::HashSet<String>>()
            .into_iter()
            .collect::<Vec<String>>()
    };

    if var_names.is_empty() {
        return Err("No valid variables found".to_string());
    }

    // Process all records from all datasets
    // Get max number of cases across all datasets
    let num_cases = data.target_data
        .iter()
        .map(|dataset| dataset.len())
        .max()
        .unwrap_or(0);

    if num_cases == 0 {
        return Err("No data records found".to_string());
    }

    // Prepare to collect data for each case
    let mut collected_records: Vec<HashMap<String, DataValue>> = vec![HashMap::new(); num_cases];

    // For each dataset, collect values for all variables
    for dataset in &data.target_data {
        for (case_idx, record) in dataset.iter().enumerate() {
            if case_idx < num_cases {
                // Merge this record's values into the case's collection
                for (var_name, value) in &record.values {
                    collected_records[case_idx].insert(var_name.clone(), value.clone());
                }
            }
        }
    }

    // Convert to DataRecords
    let records: Vec<DataRecord> = collected_records
        .into_iter()
        .map(|values| DataRecord { values })
        .collect();

    // Apply filtering based on value_target and selection if specified
    let filtered_records = if let Some(value_target) = &config.main.value_target {
        if let Some(selection) = &config.value.selection {
            // Both value_target and selection are specified
            if !data.value_target_data.is_empty() {
                // Prepare to match each case with its value target
                let mut filtered = Vec::new();

                // For each case, check if the value target matches the selection
                for (case_idx, record) in records.iter().enumerate() {
                    let mut matches_selection = false;

                    // Check across all value target datasets
                    for value_dataset in &data.value_target_data {
                        if case_idx < value_dataset.len() {
                            let value_record = &value_dataset[case_idx];

                            match value_record.values.get(value_target) {
                                Some(DataValue::Text(text)) => {
                                    if text.as_str() == selection.as_str() {
                                        matches_selection = true;
                                        break;
                                    }
                                }
                                Some(DataValue::Number(num)) => {
                                    if num.to_string() == *selection {
                                        matches_selection = true;
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                    }

                    if matches_selection {
                        filtered.push(record.clone());
                    }
                }

                filtered
            } else {
                // Value target data is not available, use all records
                records.clone()
            }
        } else {
            // No selection specified, use all records
            records.clone()
        }
    } else {
        // No value_target specified, use all records
        records.clone()
    };

    if filtered_records.is_empty() {
        return Err("No valid records after filtering".to_string());
    }

    // Count valid records based on options
    let mut valid_records: Vec<Vec<f64>> = Vec::new();

    for record in &filtered_records {
        let mut row = Vec::new();
        let mut has_missing = false;

        for var_name in &var_names {
            match record.values.get(var_name) {
                Some(DataValue::Number(value)) => row.push(*value),
                _ => {
                    has_missing = true;
                    if config.options.replace_mean {
                        row.push(f64::NAN); // Will replace with mean later
                    } else {
                        break; // Skip this record
                    }
                }
            }
        }

        if !has_missing || (has_missing && !config.options.exclude_list_wise) {
            if row.len() == var_names.len() {
                valid_records.push(row);
            }
        }
    }

    if valid_records.is_empty() {
        return Err("No valid records after filtering".to_string());
    }

    // Replace NaN with means if requested
    if config.options.replace_mean {
        replace_missing_with_means(&mut valid_records);
    }

    // Convert to DMatrix
    let n_rows = valid_records.len();
    let n_cols = var_names.len();
    let mut data_matrix = DMatrix::zeros(n_rows, n_cols);

    for i in 0..n_rows {
        for j in 0..n_cols {
            data_matrix[(i, j)] = valid_records[i][j];
        }
    }

    Ok((data_matrix, var_names))
}

// Replace missing values (NaN) with column means
pub fn replace_missing_with_means(data: &mut Vec<Vec<f64>>) {
    if data.is_empty() {
        return;
    }

    let n_cols = data[0].len();
    let mut means = vec![0.0; n_cols];
    let mut counts = vec![0; n_cols];

    // Calculate means
    for row in data.iter() {
        for (j, &val) in row.iter().enumerate() {
            if !val.is_nan() {
                means[j] += val;
                counts[j] += 1;
            }
        }
    }

    for j in 0..n_cols {
        if counts[j] > 0 {
            means[j] /= counts[j] as f64;
        }
    }

    // Replace missing values
    for row in data.iter_mut() {
        for j in 0..n_cols {
            if row[j].is_nan() {
                row[j] = means[j];
            }
        }
    }
}

// filter_valid_cases - New function to filter data based on configuration
pub fn filter_valid_cases(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<AnalysisData, String> {
    // Extract the data matrix to validate the data
    let (_, _) = extract_data_matrix(data, config)?;

    // Return filtered data
    Ok(AnalysisData {
        target_data: data.target_data.clone(),
        value_target_data: data.value_target_data.clone(),
        target_data_defs: data.target_data_defs.clone(),
        value_target_data_defs: data.value_target_data_defs.clone(),
    })
}

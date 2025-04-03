use crate::kmeans::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::ProcessedData,
};

pub fn preprocess_data(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<ProcessedData, String> {
    if data.target_data.is_empty() {
        return Err("No target data provided".to_string());
    }

    // Use target_var from config if provided, otherwise collect all numeric variables from all datasets
    let variables = if let Some(target_var) = &config.main.target_var {
        target_var.clone()
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

    if variables.is_empty() {
        return Err("No valid clustering variables found".to_string());
    }

    // Get the number of cases (assuming all datasets have the same length)
    let num_cases = if !data.target_data.is_empty() { data.target_data[0].len() } else { 0 };

    if num_cases == 0 {
        return Err("No cases found in data".to_string());
    }

    let mut data_matrix = Vec::new();
    let mut case_numbers = Vec::new();

    // Process each case
    for case_idx in 0..num_cases {
        let mut row = Vec::new();
        let mut has_missing = false;

        // For each variable, find its value across all datasets
        for var in &variables {
            let mut var_value: Option<f64> = None;

            // Check each dataset for this variable
            for dataset in &data.target_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(val)) = dataset[case_idx].values.get(var) {
                        var_value = Some(*val);
                        break;
                    }
                }
            }

            // Add the value to the row or mark as missing
            match var_value {
                Some(val) => row.push(val),
                None => {
                    has_missing = true;
                    if !config.options.exclude_list_wise {
                        // If not excluding list-wise, use a default value (0.0)
                        row.push(0.0);
                    } else {
                        break;
                    }
                }
            }
        }

        // Add the row if it's complete or if we're not doing list-wise exclusion
        if !has_missing || !config.options.exclude_list_wise {
            if row.len() == variables.len() {
                data_matrix.push(row);
                case_numbers.push((case_idx + 1) as i32);
            }
        }
    }

    if data_matrix.is_empty() {
        return Err("No valid data records after preprocessing".to_string());
    }

    Ok(ProcessedData {
        variables,
        data_matrix,
        case_numbers,
    })
}

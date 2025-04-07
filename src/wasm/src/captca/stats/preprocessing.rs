use std::collections::HashSet;

use crate::captca::models::{
    config::CATPCAConfig,
    data::{ AnalysisData, DataValue },
    result::CaseProcessingSummary,
};

/// Calculate case processing summary statistics
pub fn basic_processing_summary(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<CaseProcessingSummary, String> {
    let mut valid_active_cases = 0;
    let mut active_cases_missing = 0;
    let mut supplementary_cases = 0;
    let mut total_cases = 0;

    // Get analysis variables
    let analysis_vars = match &config.main.analysis_vars {
        Some(vars) => vars,
        None => {
            return Err("No analysis variables specified".to_string());
        }
    };

    // Process analysis data
    for dataset in &data.analysis_data {
        for record in dataset {
            total_cases += 1;

            let mut has_missing = false;
            for var_name in analysis_vars {
                match record.values.get(var_name) {
                    None => {
                        has_missing = true;
                        break;
                    }
                    Some(DataValue::Null) => {
                        has_missing = true;
                        break;
                    }
                    Some(DataValue::Number(val)) if *val < 1.0 => {
                        has_missing = true;
                        break;
                    }
                    _ => {}
                }
            }

            if has_missing {
                active_cases_missing += 1;
            } else {
                valid_active_cases += 1;
            }
        }
    }

    // Process supplementary data if available
    if !data.supplement_data.is_empty() {
        for dataset in &data.supplement_data {
            supplementary_cases += dataset.len() as i32;
        }
    }

    // Calculate cases used in analysis
    let cases_used = if config.missing.missing_values_exclude {
        valid_active_cases
    } else if config.missing.missing_values_impute {
        valid_active_cases + active_cases_missing
    } else {
        valid_active_cases
    };

    Ok(CaseProcessingSummary {
        valid_active_cases,
        active_cases_missing,
        supplementary_cases,
        total: total_cases,
        cases_used,
    })
}

/// Filter valid cases based on configuration
pub fn filter_valid_cases(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<AnalysisData, String> {
    let mut filtered_data = data.clone();

    // Apply range filter if specified
    if config.options.range_of_cases {
        if let (Some(first), Some(last)) = (config.options.first, config.options.last) {
            let first_idx = first as usize;
            let last_idx = last as usize;

            for dataset in &mut filtered_data.analysis_data {
                if !dataset.is_empty() && last_idx < dataset.len() {
                    *dataset = dataset[first_idx..=last_idx].to_vec();
                }
            }

            if !filtered_data.supplement_data.is_empty() {
                for dataset in &mut filtered_data.supplement_data {
                    if !dataset.is_empty() && last_idx < dataset.len() {
                        *dataset = dataset[first_idx..=last_idx].to_vec();
                    }
                }
            }
        }
    }

    // Apply single case filter if specified
    if config.options.single_case && config.options.single_case_value.is_some() {
        let case_idx = config.options.single_case_value.unwrap() as usize;

        for dataset in &mut filtered_data.analysis_data {
            if !dataset.is_empty() && case_idx < dataset.len() {
                *dataset = vec![dataset[case_idx].clone()];
            } else {
                *dataset = Vec::new();
            }
        }

        if !filtered_data.supplement_data.is_empty() {
            for dataset in &mut filtered_data.supplement_data {
                if !dataset.is_empty() && case_idx < dataset.len() {
                    *dataset = vec![dataset[case_idx].clone()];
                } else {
                    *dataset = Vec::new();
                }
            }
        }
    }

    // Apply listwise deletion for missing values if specified
    if config.missing.exclude_objects {
        let analysis_vars = match &config.main.analysis_vars {
            Some(vars) => vars,
            None => {
                return Err("No analysis variables specified".to_string());
            }
        };

        let mut valid_indices: Vec<usize> = Vec::new();

        // Find valid indices across all datasets
        let mut all_valid_indices = HashSet::new();

        for (dataset_idx, dataset) in filtered_data.analysis_data.iter().enumerate() {
            for (record_idx, record) in dataset.iter().enumerate() {
                let mut valid = true;

                for var_name in analysis_vars {
                    match record.values.get(var_name) {
                        None => {
                            valid = false;
                            break;
                        }
                        Some(DataValue::Null) => {
                            valid = false;
                            break;
                        }
                        Some(DataValue::Number(val)) if *val < 1.0 => {
                            valid = false;
                            break;
                        }
                        _ => {}
                    }
                }

                if valid {
                    all_valid_indices.insert((dataset_idx, record_idx));
                }
            }
        }

        // Filter datasets based on valid indices
        for (dataset_idx, dataset) in filtered_data.analysis_data.iter_mut().enumerate() {
            let mut valid_records = Vec::new();

            for (record_idx, record) in dataset.iter().enumerate() {
                if all_valid_indices.contains(&(dataset_idx, record_idx)) {
                    valid_records.push(record.clone());
                }
            }

            *dataset = valid_records;
        }

        // Apply the same filtering to supplementary data
        if !filtered_data.supplement_data.is_empty() {
            for (dataset_idx, dataset) in filtered_data.supplement_data.iter_mut().enumerate() {
                let mut valid_records = Vec::new();

                for (record_idx, record) in dataset.iter().enumerate() {
                    if all_valid_indices.contains(&(dataset_idx, record_idx)) {
                        valid_records.push(record.clone());
                    }
                }

                *dataset = valid_records;
            }
        }
    }

    Ok(filtered_data)
}

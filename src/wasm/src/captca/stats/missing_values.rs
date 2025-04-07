use std::collections::HashMap;

use rand::Rng;

use crate::captca::models::{ config::CATPCAConfig, data::{ AnalysisData, DataValue } };

/// Handle missing values according to configuration
pub fn handle_missing_values(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<AnalysisData, String> {
    let mut processed_data = data.clone();

    // Get variables for missing value treatment
    let target_vars = if let Some(vars) = &config.missing.current_target_list {
        vars.clone()
    } else if let Some(vars) = &config.main.analysis_vars {
        vars.clone()
    } else {
        return Err("No variables specified for missing value treatment".to_string());
    };

    let mut rng = rand::thread_rng();

    for var_name in &target_vars {
        // Skip if variable doesn't need missing value handling
        if !config.missing.missing_values_exclude && !config.missing.missing_values_impute {
            continue;
        }

        if config.missing.missing_values_impute {
            // Calculate frequencies for imputation
            let mut value_counts = HashMap::new();
            let mut total_count = 0;

            for dataset in &processed_data.analysis_data {
                for record in dataset {
                    if let Some(val) = record.values.get(var_name) {
                        if !matches!(val, DataValue::Null) {
                            if let DataValue::Number(num) = val {
                                if *num >= 1.0 {
                                    *value_counts.entry(val.clone()).or_insert(0) += 1;
                                    total_count += 1;
                                }
                            } else {
                                *value_counts.entry(val.clone()).or_insert(0) += 1;
                                total_count += 1;
                            }
                        }
                    }
                }
            }

            // Find mode for imputation
            let mode = if config.missing.impute_mode {
                value_counts
                    .iter()
                    .max_by_key(|&(_, count)| *count)
                    .map(|(val, _)| val.clone())
            } else {
                None
            };

            // Find maximum category for extra category imputation
            let max_category = if config.missing.impute_extra_cat {
                value_counts
                    .keys()
                    .filter_map(|val| {
                        if let DataValue::Number(num) = val { Some(*num) } else { None }
                    })
                    .fold(0.0, |max, val| (max as f64).max(val))
            } else {
                0.0
            };

            // Impute missing values
            for dataset in &mut processed_data.analysis_data {
                for record in dataset {
                    let is_missing = match record.values.get(var_name) {
                        None => true,
                        Some(DataValue::Null) => true,
                        Some(DataValue::Number(val)) if *val < 1.0 => true,
                        _ => false,
                    };

                    if is_missing {
                        if config.missing.impute_mode && mode.is_some() {
                            // Impute with mode
                            record.values.insert(var_name.clone(), mode.clone().unwrap());
                        } else if config.missing.impute_extra_cat {
                            // Impute with extra category
                            record.values.insert(
                                var_name.clone(),
                                DataValue::Number(max_category + 1.0)
                            );
                        } else if config.missing.impute_random_cat {
                            // Impute with random category based on frequency
                            let rand_val = rng.gen_range(0..total_count);
                            let mut cumsum = 0;

                            for (val, count) in &value_counts {
                                cumsum += count;
                                if rand_val < cumsum {
                                    record.values.insert(var_name.clone(), val.clone());
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(processed_data)
}

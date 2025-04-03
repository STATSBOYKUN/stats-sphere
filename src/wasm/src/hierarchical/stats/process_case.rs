// process_case.rs
use crate::hierarchical::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::CaseProcessingSummary,
};

pub fn process_cases(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<CaseProcessingSummary, String> {
    let mut total_cases = 0;
    let mut valid_cases = 0;
    let mut missing_cases = 0;

    // If we're clustering cases
    if config.main.cluster_cases {
        // Count unique cases across all datasets
        // Assuming first dataset's length represents case count
        if !data.cluster_data.is_empty() {
            total_cases = data.cluster_data[0].len();

            // Check each case index
            for case_idx in 0..total_cases {
                let mut is_valid = true;

                // Check if any selected variables are missing for this case
                if let Some(vars) = &config.main.variables {
                    for var in vars {
                        let mut var_valid = false;

                        // Check each dataset for this variable
                        for dataset in &data.cluster_data {
                            if case_idx < dataset.len() {
                                if let Some(value) = dataset[case_idx].values.get(var) {
                                    match value {
                                        | DataValue::Number(_)
                                        | DataValue::Text(_)
                                        | DataValue::Boolean(_) => {
                                            var_valid = true;
                                            break;
                                        }
                                        _ => {}
                                    }
                                }
                            }
                        }

                        if !var_valid {
                            is_valid = false;
                            break;
                        }
                    }
                }

                if is_valid {
                    valid_cases += 1;
                } else {
                    missing_cases += 1;
                }
            }
        }
    } else {
        // If we're clustering variables, count the number of variables
        if let Some(vars) = &config.main.variables {
            total_cases = vars.len();
            valid_cases = vars.len(); // Assuming all variables are valid
        }
    }

    // Calculate percentages
    let valid_percent = if total_cases > 0 {
        ((valid_cases as f64) / (total_cases as f64)) * 100.0
    } else {
        0.0
    };

    let missing_percent = if total_cases > 0 {
        ((missing_cases as f64) / (total_cases as f64)) * 100.0
    } else {
        0.0
    };

    Ok(CaseProcessingSummary {
        valid_cases,
        valid_percent,
        missing_cases,
        missing_percent,
        total_cases,
        total_percent: 100.0,
    })
}

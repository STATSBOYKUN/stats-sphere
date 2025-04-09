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
    let (total_cases, valid_cases, missing_cases) = if config.main.cluster_cases {
        process_case_clustering(data, config)?
    } else if config.main.cluster_var {
        process_variable_clustering(data, config)?
    } else {
        (0, 0, 0)
    };

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

fn process_case_clustering(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<(usize, usize, usize), String> {
    if data.cluster_data.is_empty() {
        return Ok((0, 0, 0));
    }

    let total_cases = data.cluster_data[0].len();
    let mut valid_cases = 0;
    let mut missing_cases = 0;

    // Check each case
    for case_idx in 0..total_cases {
        let is_valid = if let Some(vars) = &config.main.variables {
            // Case is valid if all variables have data
            vars.iter().all(|var| {
                data.cluster_data
                    .iter()
                    .any(|dataset| {
                        case_idx < dataset.len() &&
                            dataset[case_idx].values
                                .get(var)
                                .map_or(false, |value| {
                                    matches!(
                                        value,
                                        DataValue::Number(_) |
                                            DataValue::Text(_) |
                                            DataValue::Boolean(_)
                                    )
                                })
                    })
            })
        } else {
            true // No variables specified, assume all cases are valid
        };

        if is_valid {
            valid_cases += 1;
        } else {
            missing_cases += 1;
        }
    }

    Ok((total_cases, valid_cases, missing_cases))
}

fn process_variable_clustering(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<(usize, usize, usize), String> {
    // For variable clustering, count variables
    if let Some(vars) = &config.main.variables {
        let total_vars = vars.len();

        // Count variables with sufficient non-missing data
        let valid_vars = vars
            .iter()
            .filter(|&var| {
                // A variable is valid if it has data for at least some cases
                data.cluster_data
                    .iter()
                    .any(|dataset| {
                        dataset
                            .iter()
                            .any(|case| {
                                case.values
                                    .get(var)
                                    .map_or(false, |value| {
                                        matches!(value, DataValue::Number(_))
                                    })
                            })
                    })
            })
            .count();

        let missing_vars = total_vars - valid_vars;

        Ok((total_vars, valid_vars, missing_vars))
    } else {
        Ok((0, 0, 0))
    }
}

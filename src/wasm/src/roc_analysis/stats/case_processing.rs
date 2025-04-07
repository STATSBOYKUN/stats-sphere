use crate::roc_analysis::models::{
    config::RocConfig,
    data::{ AnalysisData, DataValue },
    result::CaseProcessingSummary,
};

pub fn calculate_case_processing_summary(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<CaseProcessingSummary, String> {
    if config.main.state_target_variable.is_none() {
        return Err("State target variable is not specified".to_string());
    }
    let state_target_var = config.main.state_target_variable.as_ref().unwrap();

    if config.main.state_var_val.is_none() {
        return Err("State variable value is not specified".to_string());
    }
    let state_var_val = config.main.state_var_val.as_ref().unwrap();

    let mut positive_count = 0;
    let mut negative_count = 0;
    let mut missing_count = 0;

    if let Some(first_dataset) = data.state_data.first() {
        for record in first_dataset {
            if let Some(value) = record.values.get(state_target_var) {
                match value {
                    DataValue::Text(val) => {
                        if val == state_var_val {
                            positive_count += 1;
                        } else {
                            negative_count += 1;
                        }
                    }
                    DataValue::Number(val) => {
                        if
                            state_var_val
                                .parse::<f64>()
                                .map(|parsed_val| parsed_val == *val)
                                .unwrap_or(false)
                        {
                            positive_count += 1;
                        } else {
                            negative_count += 1;
                        }
                    }
                    DataValue::Boolean(val) => {
                        if state_var_val == "true" && *val {
                            positive_count += 1;
                        } else if state_var_val == "false" && !*val {
                            positive_count += 1;
                        } else {
                            negative_count += 1;
                        }
                    }
                    DataValue::Null => {
                        if config.options.miss_value_as_valid {
                            negative_count += 1;
                        } else if config.options.exclude_miss_value {
                            missing_count += 1;
                        } else {
                            missing_count += 1;
                        }
                    }
                }
            } else {
                if config.options.miss_value_as_valid {
                    negative_count += 1;
                } else if config.options.exclude_miss_value {
                    missing_count += 1;
                } else {
                    missing_count += 1;
                }
            }
        }
    } else {
        return Err("No state data found".to_string());
    }

    let total_count = positive_count + negative_count + missing_count;

    Ok(CaseProcessingSummary {
        positive: positive_count,
        negative: negative_count,
        missing: missing_count,
        total: total_count,
    })
}

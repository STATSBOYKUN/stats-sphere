use crate::roc_analysis::models::{ config::RocConfig, data::{ AnalysisData, DataValue } };

pub fn extract_values(
    data: &AnalysisData,
    config: &RocConfig,
    test_target_var: &str
) -> Result<(Vec<f64>, Vec<f64>), String> {
    if config.main.state_target_variable.is_none() {
        return Err("State target variable is not specified".to_string());
    }
    let state_target_var = config.main.state_target_variable.as_ref().unwrap();

    if config.main.state_var_val.is_none() {
        return Err("State variable value is not specified".to_string());
    }
    let state_var_val = config.main.state_var_val.as_ref().unwrap();

    let mut positive_values = Vec::new();
    let mut negative_values = Vec::new();

    if data.state_data.is_empty() {
        return Err("No state data provided".to_string());
    }

    let state_dataset = &data.state_data[0];

    for test_dataset in &data.test_data {
        if test_dataset.len() != state_dataset.len() {
            continue;
        }

        for case_idx in 0..state_dataset.len() {
            let state_record = &state_dataset[case_idx];

            if let Some(state_value) = state_record.values.get(state_target_var) {
                let is_positive = match state_value {
                    DataValue::Text(val) => val == state_var_val,
                    DataValue::Number(val) =>
                        state_var_val
                            .parse::<f64>()
                            .map(|p| p == *val)
                            .unwrap_or(false),
                    DataValue::Boolean(val) => {
                        if state_var_val == "true" {
                            *val
                        } else if state_var_val == "false" {
                            !*val
                        } else {
                            false
                        }
                    }
                    DataValue::Null => false,
                };

                let test_record = &test_dataset[case_idx];

                if let Some(DataValue::Number(val)) = test_record.values.get(test_target_var) {
                    if is_positive {
                        positive_values.push(*val);
                    } else {
                        negative_values.push(*val);
                    }
                }
            }
        }
    }

    if positive_values.is_empty() || negative_values.is_empty() {
        return Err(
            format!(
                "Insufficient positive ({}) or negative ({}) values found for test variable '{}'",
                positive_values.len(),
                negative_values.len(),
                test_target_var
            )
        );
    }

    Ok((positive_values, negative_values))
}

pub fn extract_grouped_values(
    data: &AnalysisData,
    config: &RocConfig,
    test_target_var: &str
) -> Result<(Vec<f64>, Vec<f64>, Vec<f64>, Vec<f64>), String> {
    if config.main.state_target_variable.is_none() {
        return Err("State target variable is not specified".to_string());
    }
    let state_target_var = config.main.state_target_variable.as_ref().unwrap();

    if config.main.state_var_val.is_none() {
        return Err("State variable value is not specified".to_string());
    }
    let state_var_val = config.main.state_var_val.as_ref().unwrap();

    if config.main.target_group_var.is_none() {
        return Err("Target group variable is not specified for grouped analysis".to_string());
    }

    let target_group_var = config.main.target_group_var.as_ref().unwrap();

    let mut group1_positive_values = Vec::new();
    let mut group1_negative_values = Vec::new();
    let mut group2_positive_values = Vec::new();
    let mut group2_negative_values = Vec::new();

    let (group1_identifier, group2_identifier) = if config.define_groups.specified_values {
        if config.define_groups.group1.is_none() || config.define_groups.group2.is_none() {
            return Err("Group values not specified".to_string());
        }
        (
            config.define_groups.group1.as_ref().unwrap().clone(),
            config.define_groups.group2.as_ref().unwrap().clone(),
        )
    } else if config.define_groups.cut_point {
        if config.define_groups.cut_point_value.is_none() {
            return Err("Cut point value not specified".to_string());
        }
        let cut_point = config.define_groups.cut_point_value.unwrap();
        (format!("<{}", cut_point), format!(">={}", cut_point))
    } else if config.define_groups.use_mid_value {
        let mut min_val = f64::MAX;
        let mut max_val = f64::MIN;

        if let Some(group_dataset) = data.group_data.first() {
            if !group_dataset.is_empty() {
                for record in group_dataset {
                    if let Some(group_value) = record.values.get(target_group_var) {
                        if let DataValue::Number(val) = group_value {
                            min_val = min_val.min(*val);
                            max_val = max_val.max(*val);
                        }
                    }
                }
            } else {
                if let Some(state_dataset) = data.state_data.first() {
                    for record in state_dataset {
                        if let Some(group_value) = record.values.get(target_group_var) {
                            if let DataValue::Number(val) = group_value {
                                min_val = min_val.min(*val);
                                max_val = max_val.max(*val);
                            }
                        }
                    }
                }
            }
        } else {
            if let Some(state_dataset) = data.state_data.first() {
                for record in state_dataset {
                    if let Some(group_value) = record.values.get(target_group_var) {
                        if let DataValue::Number(val) = group_value {
                            min_val = min_val.min(*val);
                            max_val = max_val.max(*val);
                        }
                    }
                }
            } else {
                return Err("No data found for determining mid value".to_string());
            }
        }

        if min_val == f64::MAX || max_val == f64::MIN {
            return Err("Could not determine min/max values for mid point calculation".to_string());
        }

        let mid_point = (min_val + max_val) / 2.0;
        (format!("<{}", mid_point), format!(">={}", mid_point))
    } else {
        return Err("No group definition method specified".to_string());
    };

    let (state_dataset, test_dataset, group_dataset) = if
        !data.group_data.is_empty() &&
        data.group_data.first().is_some()
    {
        (data.state_data.first(), data.test_data.first(), data.group_data.first())
    } else {
        (data.state_data.first(), data.test_data.first(), data.state_data.first())
    };

    if state_dataset.is_none() || test_dataset.is_none() || group_dataset.is_none() {
        return Err("Missing required data for grouped analysis".to_string());
    }

    let state_dataset = state_dataset.unwrap();
    let test_dataset = test_dataset.unwrap();
    let group_dataset = group_dataset.unwrap();

    if state_dataset.len() != test_dataset.len() || state_dataset.len() != group_dataset.len() {
        return Err("State, test, and group datasets have different lengths".to_string());
    }

    for i in 0..state_dataset.len() {
        if
            let (Some(state_record), Some(test_record), Some(group_record)) = (
                state_dataset.get(i),
                test_dataset.get(i),
                group_dataset.get(i),
            )
        {
            let is_positive = if let Some(state_value) = state_record.values.get(state_target_var) {
                match state_value {
                    DataValue::Text(val) => val == state_var_val,
                    DataValue::Number(val) =>
                        state_var_val
                            .parse::<f64>()
                            .map(|p| p == *val)
                            .unwrap_or(false),
                    DataValue::Boolean(val) => {
                        if state_var_val == "true" {
                            *val
                        } else if state_var_val == "false" {
                            !*val
                        } else {
                            false
                        }
                    }
                    DataValue::Null => false,
                }
            } else {
                continue;
            };

            let test_value = if let Some(tv) = test_record.values.get(test_target_var) {
                match tv {
                    DataValue::Number(val) => *val,
                    _ => {
                        continue;
                    }
                }
            } else {
                continue;
            };

            let group_value = if let Some(gv) = group_record.values.get(target_group_var) {
                gv
            } else {
                continue;
            };

            let is_group1 = match group_value {
                DataValue::Text(val) => {
                    if config.define_groups.specified_values {
                        val == &group1_identifier
                    } else {
                        false
                    }
                }
                DataValue::Number(val) => {
                    if config.define_groups.cut_point {
                        *val < config.define_groups.cut_point_value.unwrap()
                    } else if config.define_groups.use_mid_value {
                        let mid_point = group1_identifier
                            .trim_start_matches('<')
                            .parse::<f64>()
                            .unwrap_or(0.0);
                        *val < mid_point
                    } else if config.define_groups.specified_values {
                        val.to_string() == group1_identifier
                    } else {
                        false
                    }
                }
                _ => {
                    continue;
                }
            };

            if is_group1 {
                if is_positive {
                    group1_positive_values.push(test_value);
                } else {
                    group1_negative_values.push(test_value);
                }
            } else {
                if is_positive {
                    group2_positive_values.push(test_value);
                } else {
                    group2_negative_values.push(test_value);
                }
            }
        }
    }

    if group1_positive_values.is_empty() || group1_negative_values.is_empty() {
        return Err(format!("Insufficient data for group '{}'", group1_identifier));
    }

    if group2_positive_values.is_empty() || group2_negative_values.is_empty() {
        return Err(format!("Insufficient data for group '{}'", group2_identifier));
    }

    Ok((
        group1_positive_values,
        group1_negative_values,
        group2_positive_values,
        group2_negative_values,
    ))
}

pub fn generate_cutoffs(positive_values: &[f64], negative_values: &[f64]) -> Vec<f64> {
    let mut all_values = positive_values.to_vec();
    all_values.extend_from_slice(negative_values);
    all_values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

    let mut cutoffs = Vec::new();

    if let Some(min_val) = all_values.first() {
        cutoffs.push(min_val - 1.0);
    }

    let mut unique_values = Vec::new();
    for &value in all_values.iter() {
        if !unique_values.contains(&value) {
            unique_values.push(value);
        }
    }
    unique_values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

    for i in 0..unique_values.len().saturating_sub(1) {
        cutoffs.push((unique_values[i] + unique_values[i + 1]) / 2.0);
    }

    if let Some(max_val) = unique_values.last() {
        cutoffs.push(max_val + 1.0);
    }

    cutoffs
}

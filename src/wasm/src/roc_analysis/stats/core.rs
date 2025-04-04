use crate::roc_analysis::models::{
    config::RocConfig,
    data::{ AnalysisData, DataValue },
    result::*,
};

// Calculate case processing summary
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

    // Count in the first dataset of state_data
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
                        // Handle null values based on configuration
                        if config.options.miss_value_as_valid {
                            // Count as valid but negative
                            negative_count += 1;
                        } else if config.options.exclude_miss_value {
                            // Count as missing
                            missing_count += 1;
                        } else {
                            // Default behavior
                            missing_count += 1;
                        }
                    }
                }
            } else {
                // Handle missing values based on configuration
                if config.options.miss_value_as_valid {
                    // Count as valid but negative
                    negative_count += 1;
                } else if config.options.exclude_miss_value {
                    // Count as missing
                    missing_count += 1;
                } else {
                    // Default behavior
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

// Helper function to extract test and state values
fn extract_values(data: &AnalysisData, config: &RocConfig) -> Result<(Vec<f64>, Vec<f64>), String> {
    if config.main.state_target_variable.is_none() {
        return Err("State target variable is not specified".to_string());
    }
    let state_target_var = config.main.state_target_variable.as_ref().unwrap();

    if config.main.state_var_val.is_none() {
        return Err("State variable value is not specified".to_string());
    }
    let state_var_val = config.main.state_var_val.as_ref().unwrap();

    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }
    let test_target_var = &test_target_vars[0];

    let mut positive_values = Vec::new();
    let mut negative_values = Vec::new();

    // Assuming first datasets for simplicity
    if
        let (Some(state_dataset), Some(test_dataset)) = (
            data.state_data.first(),
            data.test_data.first(),
        )
    {
        if state_dataset.len() != test_dataset.len() {
            return Err("State and test datasets have different lengths".to_string());
        }

        for (i, state_record) in state_dataset.iter().enumerate() {
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

                if let Some(test_record) = test_dataset.get(i) {
                    if let Some(test_value) = test_record.values.get(test_target_var) {
                        if let DataValue::Number(val) = test_value {
                            if is_positive {
                                positive_values.push(*val);
                            } else {
                                negative_values.push(*val);
                            }
                        }
                    }
                }
            }
        }
    } else {
        return Err("Missing state or test data".to_string());
    }

    if positive_values.is_empty() || negative_values.is_empty() {
        return Err("Insufficient positive or negative values found".to_string());
    }

    Ok((positive_values, negative_values))
}

// Helper function to extract test and state values for each group
fn extract_grouped_values(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<(Vec<f64>, Vec<f64>, Vec<f64>, Vec<f64>), String> {
    if config.main.state_target_variable.is_none() {
        return Err("State target variable is not specified".to_string());
    }
    let state_target_var = config.main.state_target_variable.as_ref().unwrap();

    if config.main.state_var_val.is_none() {
        return Err("State variable value is not specified".to_string());
    }
    let state_var_val = config.main.state_var_val.as_ref().unwrap();

    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }
    let test_target_var = &test_target_vars[0];

    // Check if grouping is enabled
    if config.main.target_group_var.is_none() {
        // If no grouping variable is specified, return an error or use standard analysis
        return Err("Target group variable is not specified for grouped analysis".to_string());
    }

    let target_group_var = config.main.target_group_var.as_ref().unwrap();

    let mut group1_positive_values = Vec::new();
    let mut group1_negative_values = Vec::new();
    let mut group2_positive_values = Vec::new();
    let mut group2_negative_values = Vec::new();

    // Define group identifiers based on configuration
    let (group1_identifier, group2_identifier) = if config.define_groups.specified_values {
        // Use specified values
        if config.define_groups.group1.is_none() || config.define_groups.group2.is_none() {
            return Err("Group values not specified".to_string());
        }
        (
            config.define_groups.group1.as_ref().unwrap().clone(),
            config.define_groups.group2.as_ref().unwrap().clone(),
        )
    } else if config.define_groups.cut_point {
        // Use cut point
        if config.define_groups.cut_point_value.is_none() {
            return Err("Cut point value not specified".to_string());
        }
        let cut_point = config.define_groups.cut_point_value.unwrap();
        (format!("<{}", cut_point), format!(">={}", cut_point))
    } else if config.define_groups.use_mid_value {
        // Use mid value logic (need to find min and max values first)
        let mut min_val = f64::MAX;
        let mut max_val = f64::MIN;

        // If group_data is available, use it
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
                // If group_data is empty, try using state_data
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
            // If group_data is not available, try using state_data
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

    // Try to get group data from various sources
    let (state_dataset, test_dataset, group_dataset) = if
        !data.group_data.is_empty() &&
        data.group_data.first().is_some()
    {
        // Use dedicated group_data if available
        (data.state_data.first(), data.test_data.first(), data.group_data.first())
    } else {
        // Otherwise, use state_data for group information
        (data.state_data.first(), data.test_data.first(), data.state_data.first())
    };

    // Ensure we have all the data we need
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
            // Determine if the record is positive or negative
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
                continue; // Skip if state value is missing
            };

            // Get test value
            let test_value = if let Some(tv) = test_record.values.get(test_target_var) {
                match tv {
                    DataValue::Number(val) => *val,
                    _ => {
                        continue;
                    } // Skip if not a number
                }
            } else {
                continue; // Skip if test value is missing
            };

            // Determine which group this record belongs to
            let group_value = if let Some(gv) = group_record.values.get(target_group_var) {
                gv
            } else {
                continue; // Skip if group value is missing
            };

            let is_group1 = match group_value {
                DataValue::Text(val) => {
                    if config.define_groups.specified_values {
                        val == &group1_identifier
                    } else {
                        false // Text values not handled for non-specified groups
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
                } // Skip other types
            };

            // Add value to appropriate group
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

    // Check if we have enough data for analysis
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

// Generate cutoff points from test values
fn generate_cutoffs(positive_values: &[f64], negative_values: &[f64]) -> Vec<f64> {
    let mut all_values = positive_values.to_vec();
    all_values.extend_from_slice(negative_values);
    all_values.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));

    let mut cutoffs = Vec::new();

    // Add minimum - 1 as first cutoff
    if let Some(min_val) = all_values.first() {
        cutoffs.push(min_val - 1.0);
    }

    // Add average of consecutive distinct values
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

    // Add maximum + 1 as last cutoff
    if let Some(max_val) = unique_values.last() {
        cutoffs.push(max_val + 1.0);
    }

    cutoffs
}

// Calculate ROC coordinates
pub fn calculate_roc_coordinates(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<Vec<RocCoordinate>, String> {
    // If paired sample, use regular extraction
    if config.main.paired_sample {
        let (positive_values, negative_values) = extract_values(data, config)?;
        return calculate_roc_coordinates_from_values(&positive_values, &negative_values, config);
    }

    // Use grouped extraction for independent groups
    if config.main.target_group_var.is_some() {
        // For grouped analysis, we focus on one group at a time
        let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config)?;
        return calculate_roc_coordinates_from_values(&group1_pos, &group1_neg, config);
    }

    // Default to regular extraction if no grouping is specified
    let (positive_values, negative_values) = extract_values(data, config)?;
    calculate_roc_coordinates_from_values(&positive_values, &negative_values, config)
}

// Calculate ROC coordinates from positive and negative values
fn calculate_roc_coordinates_from_values(
    positive_values: &[f64],
    negative_values: &[f64],
    config: &RocConfig
) -> Result<Vec<RocCoordinate>, String> {
    let cutoffs = generate_cutoffs(positive_values, negative_values);

    let mut coordinates = Vec::new();

    for cutoff in cutoffs {
        let (tp, fn_count, tn, fp) = calculate_confusion_matrix(
            positive_values,
            negative_values,
            cutoff,
            config
        );

        let sensitivity = if tp + fn_count > 0 {
            (tp as f64) / ((tp + fn_count) as f64)
        } else {
            0.0
        };
        let specificity = if tn + fp > 0 { (tn as f64) / ((tn + fp) as f64) } else { 0.0 };

        coordinates.push(RocCoordinate {
            positive_if_greater_than: cutoff,
            sensitivity,
            one_minus_specificity: 1.0 - specificity,
        });
    }

    // Handle special case for missing data
    if config.options.miss_value_as_valid {
        // Additional logic for treating missing values as valid would go here
        // This would typically involve adding specific coordinates for missing values
    }

    Ok(coordinates)
}

// Calculate confusion matrix with proper cutoff handling
fn calculate_confusion_matrix(
    positive_values: &[f64],
    negative_values: &[f64],
    cutoff: f64,
    config: &RocConfig
) -> (usize, usize, usize, usize) {
    let mut true_positives = 0;
    let mut false_negatives = 0;
    let mut true_negatives = 0;
    let mut false_positives = 0;

    let larger_is_positive = config.options.larger_test;
    let _include_cutoff = config.options.include_cutoff;
    let exclude_cutoff = config.options.exclude_cutoff;

    // Determine how to handle values that equal the cutoff
    let include_equal = if exclude_cutoff {
        false
    } else {
        // Default to include if neither is explicitly set
        true
    };

    for &val in positive_values {
        let is_positive = if larger_is_positive {
            if val > cutoff { true } else if val == cutoff { include_equal } else { false }
        } else {
            if val < cutoff { true } else if val == cutoff { include_equal } else { false }
        };

        if is_positive {
            true_positives += 1;
        } else {
            false_negatives += 1;
        }
    }

    for &val in negative_values {
        let is_positive = if larger_is_positive {
            if val > cutoff { true } else if val == cutoff { include_equal } else { false }
        } else {
            if val < cutoff { true } else if val == cutoff { include_equal } else { false }
        };

        if is_positive {
            false_positives += 1;
        } else {
            true_negatives += 1;
        }
    }

    (true_positives, false_negatives, true_negatives, false_positives)
}

// Calculate precision-recall coordinates
pub fn calculate_precision_recall_coordinates(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<Vec<PrecisionRecallCoordinate>, String> {
    // If paired sample, use regular extraction
    if config.main.paired_sample {
        let (positive_values, negative_values) = extract_values(data, config)?;
        return calculate_pr_coordinates_from_values(&positive_values, &negative_values, config);
    }

    // Use grouped extraction for independent groups
    if config.main.target_group_var.is_some() {
        // For grouped analysis, we focus on one group at a time
        let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config)?;
        return calculate_pr_coordinates_from_values(&group1_pos, &group1_neg, config);
    }

    // Default to regular extraction if no grouping is specified
    let (positive_values, negative_values) = extract_values(data, config)?;
    calculate_pr_coordinates_from_values(&positive_values, &negative_values, config)
}

// Calculate precision-recall coordinates from positive and negative values
fn calculate_pr_coordinates_from_values(
    positive_values: &[f64],
    negative_values: &[f64],
    config: &RocConfig
) -> Result<Vec<PrecisionRecallCoordinate>, String> {
    let cutoffs = generate_cutoffs(positive_values, negative_values);

    let mut coordinates = Vec::new();

    for cutoff in cutoffs {
        let (tp, fn_count, _, fp) = calculate_confusion_matrix(
            positive_values,
            negative_values,
            cutoff,
            config
        );

        let precision = if tp + fp > 0 { (tp as f64) / ((tp + fp) as f64) } else { f64::NAN };
        let recall = if tp + fn_count > 0 { (tp as f64) / ((tp + fn_count) as f64) } else { 0.0 };

        // Apply interpolation based on config
        let adjusted_values = if config.display.intepol_true {
            // Interpolation along true positives
            (precision, recall)
        } else if config.display.intepol_false {
            // Interpolation along false positives
            // This is a simplified approach; real implementation would be more complex
            (precision, recall)
        } else {
            (precision, recall)
        };

        coordinates.push(PrecisionRecallCoordinate {
            positive_if_greater_than: cutoff,
            precision: adjusted_values.0,
            recall: adjusted_values.1,
        });
    }

    // Post-process coordinates if needed
    if config.display.prc_point {
        // Additional processing if specific PR curve points are requested
    }

    Ok(coordinates)
}

// Calculate area under ROC curve using nonparametric method (Mann-Whitney U Statistic)
pub fn calculate_area_under_roc_curve(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<AreaUnderRocCurve, String> {
    // If paired sample, use regular extraction
    if config.main.paired_sample {
        let (positive_values, negative_values) = extract_values(data, config)?;
        return calculate_auc_from_values(&positive_values, &negative_values, config);
    }

    // Use grouped extraction for independent groups
    if config.main.target_group_var.is_some() {
        // For grouped analysis, we still return a single AUC for the currently selected group
        // In practice, the function would be called twice with different group configurations
        let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config)?;
        return calculate_auc_from_values(&group1_pos, &group1_neg, config);
    }

    // Default to regular extraction if no grouping is specified
    let (positive_values, negative_values) = extract_values(data, config)?;
    calculate_auc_from_values(&positive_values, &negative_values, config)
}

// Calculate AUC from positive and negative values
fn calculate_auc_from_values(
    positive_values: &[f64],
    negative_values: &[f64],
    config: &RocConfig
) -> Result<AreaUnderRocCurve, String> {
    // Calculate AUC using the Mann-Whitney U statistic approach
    let m = positive_values.len();
    let n = negative_values.len();

    let mut rank_sum = 0.0;

    for &pos_val in positive_values {
        for &neg_val in negative_values {
            if config.options.larger_test {
                if pos_val > neg_val {
                    rank_sum += 1.0;
                } else if pos_val == neg_val {
                    rank_sum += 0.5;
                }
            } else {
                if pos_val < neg_val {
                    rank_sum += 1.0;
                } else if pos_val == neg_val {
                    rank_sum += 0.5;
                }
            }
        }
    }

    let auc = rank_sum / ((m as f64) * (n as f64));

    // Calculate standard error
    let is_nonparametric = match config.options.dist_assumpt_method {
        crate::roc_analysis::models::config::DistributionMethod::Nonparametric => true,
        _ => false,
    };

    let std_error = if is_nonparametric {
        calculate_nonparametric_std_error(
            positive_values,
            negative_values,
            auc,
            config.options.larger_test
        )
    } else {
        calculate_binegexp_std_error(positive_values, negative_values, auc)
    };

    // Asymptotic significance (p-value)
    let z_statistic = (auc - 0.5) / std_error;
    let asymptotic_sig = 2.0 * (1.0 - normal_cdf(z_statistic.abs()));

    // Confidence interval
    let conf_level = (config.options.conf_level as f64) / 100.0;
    let alpha = 1.0 - conf_level;
    let z_alpha = normal_quantile(1.0 - alpha / 2.0);

    let margin = z_alpha * std_error;
    let lower_bound = (auc - margin).max(0.0);
    let upper_bound = (auc + margin).min(1.0);

    Ok(AreaUnderRocCurve {
        area: auc,
        std_error,
        asymptotic_sig,
        asymptotic_95_confidence_interval: Interval {
            lower_bound,
            upper_bound,
        },
    })
}

// Calculate standard error under nonparametric assumption
fn calculate_nonparametric_std_error(
    positive_values: &[f64],
    negative_values: &[f64],
    auc: f64,
    larger_is_positive: bool
) -> f64 {
    let m = positive_values.len();
    let n = negative_values.len();

    // Calculate Q1
    let mut q1_sum = 0.0;
    for i in 0..m {
        let mut count = 0.0;
        for j in 0..n {
            if larger_is_positive {
                if positive_values[i] > negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            } else {
                if positive_values[i] < negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            }
        }
        q1_sum += (count / (n as f64) - auc).powi(2);
    }
    let q1 = q1_sum / ((m - 1) as f64);

    // Calculate Q2
    let mut q2_sum = 0.0;
    for j in 0..n {
        let mut count = 0.0;
        for i in 0..m {
            if larger_is_positive {
                if positive_values[i] > negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            } else {
                if positive_values[i] < negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            }
        }
        q2_sum += (count / (m as f64) - auc).powi(2);
    }
    let q2 = q2_sum / ((n - 1) as f64);

    // Calculate SE
    ((auc * (1.0 - auc) + ((m - 1) as f64) * q1 + ((n - 1) as f64) * q2) / ((m * n) as f64)).sqrt()
}

// Calculate standard error under bi-negative exponential assumption
fn calculate_binegexp_std_error(positive_values: &[f64], negative_values: &[f64], auc: f64) -> f64 {
    let m = positive_values.len();
    let n = negative_values.len();

    if m != n {
        // Fallback to nonparametric if sample sizes are unequal
        return calculate_nonparametric_std_error(positive_values, negative_values, auc, true);
    }

    let q3 = auc / (2.0 - auc);
    let q4 = (2.0 * auc.powi(2)) / (1.0 + auc);

    (
        (auc * (1.0 - auc) +
            ((m - 1) as f64) * (q3 - auc.powi(2)) +
            ((n - 1) as f64) * (q4 - auc.powi(2))) /
        ((m * n) as f64)
    ).sqrt()
}

// Normal cumulative distribution function
fn normal_cdf(x: f64) -> f64 {
    0.5 * (1.0 + erf(x / (2.0_f64).sqrt()))
}

// Error function approximation
fn erf(x: f64) -> f64 {
    let sign = if x >= 0.0 { 1.0 } else { -1.0 };
    let x = x.abs();

    let a1 = 0.254829592;
    let a2 = -0.284496736;
    let a3 = 1.421413741;
    let a4 = -1.453152027;
    let a5 = 1.061405429;
    let p = 0.3275911;

    let t = 1.0 / (1.0 + p * x);
    let y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * (-x * x).exp();

    sign * y
}

// Normal quantile function approximation
fn normal_quantile(p: f64) -> f64 {
    if p <= 0.0 {
        return f64::NEG_INFINITY;
    }
    if p >= 1.0 {
        return f64::INFINITY;
    }

    if p == 0.5 {
        return 0.0;
    }

    let q = if p > 0.5 { 1.0 - p } else { p };

    let t = (-2.0 * q.ln()).sqrt();

    let c0 = 2.515517;
    let c1 = 0.802853;
    let c2 = 0.010328;
    let d1 = 1.432788;
    let d2 = 0.189269;
    let d3 = 0.001308;

    let x = t - (c0 + c1 * t + c2 * t.powi(2)) / (1.0 + d1 * t + d2 * t.powi(2) + d3 * t.powi(3));

    if p > 0.5 {
        x
    } else {
        -x
    }
}

// Calculate overall model quality
pub fn calculate_overall_model_quality(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<f64, String> {
    // If paired sample or no grouping, use regular AUC
    if config.main.paired_sample || !config.main.target_group_var.is_some() {
        let auc_result = calculate_area_under_roc_curve(data, config)?;
        return Ok(auc_result.asymptotic_95_confidence_interval.lower_bound);
    }

    // For grouped data, calculate AUC for the currently selected group
    let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config)?;
    let auc_result = calculate_auc_from_values(&group1_pos, &group1_neg, config)?;

    // Overall model quality is based on the lower bound of the confidence interval
    Ok(auc_result.asymptotic_95_confidence_interval.lower_bound)
}

// Calculate classifier evaluation metrics
pub fn calculate_classifier_evaluation_metrics(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<ClassifierEvaluationMetrics, String> {
    // If paired sample or no grouping, use regular AUC
    if config.main.paired_sample || !config.main.target_group_var.is_some() {
        let auc_result = calculate_area_under_roc_curve(data, config)?;
        let roc_coordinates = calculate_roc_coordinates(data, config)?;

        // Calculate Gini index
        let gini_index = 2.0 * auc_result.area - 1.0;

        // Find maximum K-S statistic
        let (max_k_s, cutoff) = find_max_ks(&roc_coordinates);

        return Ok(ClassifierEvaluationMetrics {
            gini_index,
            max_k_s,
            cutoff,
        });
    }

    // For grouped data, calculate metrics for the currently selected group
    let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config)?;
    let auc_result = calculate_auc_from_values(&group1_pos, &group1_neg, config)?;
    let roc_coordinates = calculate_roc_coordinates_from_values(&group1_pos, &group1_neg, config)?;

    // Calculate Gini index
    let gini_index = 2.0 * auc_result.area - 1.0;

    // Find maximum K-S statistic
    let (max_k_s, cutoff) = find_max_ks(&roc_coordinates);

    Ok(ClassifierEvaluationMetrics {
        gini_index,
        max_k_s,
        cutoff,
    })
}

// Helper function to find the maximum K-S statistic and its cutoff
fn find_max_ks(roc_coordinates: &[RocCoordinate]) -> (f64, f64) {
    let mut max_k_s = 0.0;
    let mut cutoff = 0.0;

    for coord in roc_coordinates {
        let k_s = (coord.sensitivity - coord.one_minus_specificity).abs();
        if k_s > max_k_s {
            max_k_s = k_s;
            cutoff = coord.positive_if_greater_than;
        }
    }

    (max_k_s, cutoff)
}

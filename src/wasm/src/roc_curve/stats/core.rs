use std::collections::HashMap;
use crate::roc_curve::models::{
    config::{ ROCCurveConfig, DistributionMethod },
    data::{ AnalysisData, DataValue },
    result::*,
};

// Calculate case processing summary
pub fn calculate_case_processing_summary(
    data: &AnalysisData,
    config: &ROCCurveConfig
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

// Helper function to extract test and state values for a specific test variable
fn extract_values(
    data: &AnalysisData,
    config: &ROCCurveConfig,
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

    // Initialize collections for test values
    let mut positive_values = Vec::new();
    let mut negative_values = Vec::new();

    // Get the state data (single variable)
    if data.state_data.is_empty() {
        return Err("No state data provided".to_string());
    }

    // Use the first state dataset
    let state_dataset = &data.state_data[0];

    // Find the corresponding test dataset containing our test variable
    for test_dataset in &data.test_data {
        // Skip if lengths don't match
        if test_dataset.len() != state_dataset.len() {
            continue;
        }

        // Process each case
        for case_idx in 0..state_dataset.len() {
            // Get state value to determine positive/negative class
            let state_record = &state_dataset[case_idx];

            if let Some(state_value) = state_record.values.get(state_target_var) {
                // Determine if this is a positive or negative case
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

                // Get corresponding test value
                let test_record = &test_dataset[case_idx];

                if let Some(DataValue::Number(val)) = test_record.values.get(test_target_var) {
                    // Add to appropriate collection
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

// Calculate ROC coordinates for all test variables
pub fn calculate_roc_coordinates(
    data: &AnalysisData,
    config: &ROCCurveConfig
) -> Result<HashMap<String, Vec<RocCoordinate>>, String> {
    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }

    let mut coordinates_map: HashMap<String, Vec<RocCoordinate>> = HashMap::new();

    for test_var in test_target_vars {
        let (positive_values, negative_values) = extract_values(data, config, test_var)?;
        let var_coordinates = calculate_roc_coordinates_from_values(
            &positive_values,
            &negative_values,
            config
        )?;
        coordinates_map.insert(test_var.clone(), var_coordinates);
    }

    Ok(coordinates_map)
}

// Calculate ROC coordinates for a specific test variable
pub fn calculate_roc_coordinates_for_variable(
    data: &AnalysisData,
    config: &ROCCurveConfig,
    test_var: &str
) -> Result<Vec<RocCoordinate>, String> {
    let (positive_values, negative_values) = extract_values(data, config, test_var)?;
    calculate_roc_coordinates_from_values(&positive_values, &negative_values, config)
}

// Calculate ROC coordinates from positive and negative values
fn calculate_roc_coordinates_from_values(
    positive_values: &[f64],
    negative_values: &[f64],
    config: &ROCCurveConfig
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

    Ok(coordinates)
}

// Calculate confusion matrix with proper cutoff handling
fn calculate_confusion_matrix(
    positive_values: &[f64],
    negative_values: &[f64],
    cutoff: f64,
    config: &ROCCurveConfig
) -> (usize, usize, usize, usize) {
    let mut true_positives = 0;
    let mut false_negatives = 0;
    let mut true_negatives = 0;
    let mut false_positives = 0;

    let larger_is_positive = config.options.larger_test;
    let exclude_cutoff = config.options.exclude_cutoff;

    // Determine how to handle values that equal the cutoff
    let include_equal = if exclude_cutoff {
        false
    } else {
        // Default to include if not explicitly excluded
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

// Calculate area under ROC curve for all test variables
pub fn calculate_area_under_roc_curve(
    data: &AnalysisData,
    config: &ROCCurveConfig
) -> Result<HashMap<String, AreaUnderRocCurve>, String> {
    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }

    let mut auc_map: HashMap<String, AreaUnderRocCurve> = HashMap::new();

    for test_var in test_target_vars {
        let (positive_values, negative_values) = extract_values(data, config, test_var)?;
        let auc_result = calculate_auc_from_values(&positive_values, &negative_values, config)?;
        auc_map.insert(test_var.clone(), auc_result);
    }

    Ok(auc_map)
}

// Calculate area under ROC curve for a specific test variable
pub fn calculate_area_under_roc_curve_for_variable(
    data: &AnalysisData,
    config: &ROCCurveConfig,
    test_var: &str
) -> Result<AreaUnderRocCurve, String> {
    let (positive_values, negative_values) = extract_values(data, config, test_var)?;
    calculate_auc_from_values(&positive_values, &negative_values, config)
}

// Calculate AUC from positive and negative values
fn calculate_auc_from_values(
    positive_values: &[f64],
    negative_values: &[f64],
    config: &ROCCurveConfig
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
        DistributionMethod::Nonparametric => true,
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

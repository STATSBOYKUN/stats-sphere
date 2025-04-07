use std::collections::HashMap;

use crate::roc_analysis::models::{ config::RocConfig, data::AnalysisData, result::RocCoordinate };

use super::core::{ extract_grouped_values, extract_values, generate_cutoffs };

pub fn calculate_roc_coordinates(
    data: &AnalysisData,
    config: &RocConfig
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
        let var_coordinates = calculate_roc_coordinates_for_variable(data, config, test_var)?;
        coordinates_map.insert(test_var.clone(), var_coordinates);
    }

    Ok(coordinates_map)
}

pub fn calculate_roc_coordinates_for_variable(
    data: &AnalysisData,
    config: &RocConfig,
    test_var: &str
) -> Result<Vec<RocCoordinate>, String> {
    if config.main.paired_sample {
        let (positive_values, negative_values) = extract_values(data, config, test_var)?;
        return calculate_roc_coordinates_from_values(&positive_values, &negative_values, config);
    }

    if config.main.target_group_var.is_some() {
        let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config, test_var)?;
        return calculate_roc_coordinates_from_values(&group1_pos, &group1_neg, config);
    }

    let (positive_values, negative_values) = extract_values(data, config, test_var)?;
    calculate_roc_coordinates_from_values(&positive_values, &negative_values, config)
}

pub fn calculate_roc_coordinates_from_values(
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

    if config.options.miss_value_as_valid {
        // Additional logic for treating missing values as valid
    }

    Ok(coordinates)
}

pub fn calculate_confusion_matrix(
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
    let exclude_cutoff = config.options.exclude_cutoff;

    let include_equal = if exclude_cutoff { false } else { true };

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

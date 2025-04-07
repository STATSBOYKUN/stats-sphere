use std::collections::HashMap;

use crate::roc_analysis::models::{
    config::RocConfig,
    data::AnalysisData,
    result::PrecisionRecallCoordinate,
};

use super::core::{
    calculate_confusion_matrix,
    extract_grouped_values,
    extract_values,
    generate_cutoffs,
};

pub fn calculate_precision_recall_coordinates(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<HashMap<String, Vec<PrecisionRecallCoordinate>>, String> {
    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }

    let mut coordinates_map: HashMap<String, Vec<PrecisionRecallCoordinate>> = HashMap::new();

    for test_var in test_target_vars {
        let var_coordinates = calculate_precision_recall_coordinates_for_variable(
            data,
            config,
            test_var
        )?;
        coordinates_map.insert(test_var.clone(), var_coordinates);
    }

    Ok(coordinates_map)
}

pub fn calculate_precision_recall_coordinates_for_variable(
    data: &AnalysisData,
    config: &RocConfig,
    test_var: &str
) -> Result<Vec<PrecisionRecallCoordinate>, String> {
    if config.main.paired_sample {
        let (positive_values, negative_values) = extract_values(data, config, test_var)?;
        return calculate_pr_coordinates_from_values(&positive_values, &negative_values, config);
    }

    if config.main.target_group_var.is_some() {
        let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config, test_var)?;
        return calculate_pr_coordinates_from_values(&group1_pos, &group1_neg, config);
    }

    let (positive_values, negative_values) = extract_values(data, config, test_var)?;
    calculate_pr_coordinates_from_values(&positive_values, &negative_values, config)
}

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

        let adjusted_values = if config.display.intepol_true {
            (precision, recall)
        } else if config.display.intepol_false {
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

    if config.display.prc_point {
        // Additional processing for specific PR curve points
    }

    Ok(coordinates)
}

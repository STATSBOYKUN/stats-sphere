use std::collections::HashMap;

use crate::roc_analysis::models::{
    config::RocConfig,
    data::AnalysisData,
    result::{ ClassifierEvaluationMetrics, RocCoordinate },
};

use super::{
    auc::{ calculate_area_under_roc_curve_for_variable, calculate_auc_from_values },
    core::{
        calculate_roc_coordinates_for_variable,
        calculate_roc_coordinates_from_values,
        extract_grouped_values,
    },
};

pub fn calculate_overall_model_quality(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<HashMap<String, f64>, String> {
    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }

    let mut quality_map: HashMap<String, f64> = HashMap::new();

    for test_var in test_target_vars {
        let var_quality = calculate_overall_model_quality_for_variable(data, config, test_var)?;
        quality_map.insert(test_var.clone(), var_quality);
    }

    Ok(quality_map)
}

pub fn calculate_overall_model_quality_for_variable(
    data: &AnalysisData,
    config: &RocConfig,
    test_var: &str
) -> Result<f64, String> {
    if config.main.paired_sample || !config.main.target_group_var.is_some() {
        let auc_result = calculate_area_under_roc_curve_for_variable(data, config, test_var)?;
        return Ok(auc_result.asymptotic_95_confidence_interval.lower_bound);
    }

    let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config, test_var)?;
    let auc_result = calculate_auc_from_values(&group1_pos, &group1_neg, config)?;

    Ok(auc_result.asymptotic_95_confidence_interval.lower_bound)
}

pub fn calculate_classifier_evaluation_metrics(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<HashMap<String, ClassifierEvaluationMetrics>, String> {
    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }

    let mut metrics_map: HashMap<String, ClassifierEvaluationMetrics> = HashMap::new();

    for test_var in test_target_vars {
        let var_metrics = calculate_classifier_evaluation_metrics_for_variable(
            data,
            config,
            test_var
        )?;
        metrics_map.insert(test_var.clone(), var_metrics);
    }

    Ok(metrics_map)
}

pub fn calculate_classifier_evaluation_metrics_for_variable(
    data: &AnalysisData,
    config: &RocConfig,
    test_var: &str
) -> Result<ClassifierEvaluationMetrics, String> {
    if config.main.paired_sample || !config.main.target_group_var.is_some() {
        let auc_result = calculate_area_under_roc_curve_for_variable(data, config, test_var)?;
        let roc_coordinates = calculate_roc_coordinates_for_variable(data, config, test_var)?;

        let gini_index = 2.0 * auc_result.area - 1.0;
        let (max_k_s, cutoff) = find_max_ks(&roc_coordinates);

        return Ok(ClassifierEvaluationMetrics {
            gini_index,
            max_k_s,
            cutoff,
        });
    }

    let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config, test_var)?;
    let auc_result = calculate_auc_from_values(&group1_pos, &group1_neg, config)?;
    let roc_coordinates = calculate_roc_coordinates_from_values(&group1_pos, &group1_neg, config)?;

    let gini_index = 2.0 * auc_result.area - 1.0;
    let (max_k_s, cutoff) = find_max_ks(&roc_coordinates);

    Ok(ClassifierEvaluationMetrics {
        gini_index,
        max_k_s,
        cutoff,
    })
}

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

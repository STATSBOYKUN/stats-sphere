use std::collections::HashMap;

use crate::discriminant::models::{
    result::{ VariableInAnalysis, VariableNotInAnalysis },
    DiscriminantConfig,
};

use super::{
    method_implementations::{ calculate_variable_f_to_enter, calculate_variable_f_to_remove },
    statistical_tests::{ calculate_p_value_from_f, calculate_tolerance },
    stepwise_statistics::MethodType,
};

// Determine the method type from config
pub fn determine_method_type(config: &DiscriminantConfig) -> MethodType {
    if config.method.wilks {
        MethodType::Wilks
    } else if config.method.unexplained {
        MethodType::Unexplained
    } else if config.method.mahalonobis {
        MethodType::Mahalanobis
    } else if config.method.f_ratio {
        MethodType::FRatio
    } else if config.method.raos {
        MethodType::Raos
    } else {
        // Default to Wilks' lambda
        MethodType::Wilks
    }
}

// Analyze variables not in the model
pub fn analyze_variables_not_in_model(
    variables: &[String],
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize,
    config: &DiscriminantConfig
) -> Vec<VariableNotInAnalysis> {
    let mut variables_not_in_analysis = Vec::new();
    let method_type = determine_method_type(config);

    for var_name in variables {
        // Calculate tolerance for this variable
        let (tolerance, min_tolerance) = calculate_tolerance(
            var_name,
            group_data,
            group_labels,
            current_variables
        );

        // Minimum tolerance check
        if tolerance < 0.001 {
            continue;
        }

        // Calculate F-to-enter based on the selected method
        let (f_to_enter, wilks_lambda) = calculate_variable_f_to_enter(
            var_name,
            group_data,
            group_labels,
            group_means,
            overall_means,
            current_variables,
            num_groups,
            total_cases,
            method_type
        );

        variables_not_in_analysis.push(VariableNotInAnalysis {
            variable: var_name.clone(),
            tolerance,
            min_tolerance,
            f_to_enter,
            wilks_lambda,
        });
    }

    // Sort variables by F-to-enter (descending)
    variables_not_in_analysis.sort_by(|a, b|
        b.f_to_enter.partial_cmp(&a.f_to_enter).unwrap_or(std::cmp::Ordering::Equal)
    );

    variables_not_in_analysis
}

// Analyze variables in the model
pub fn analyze_variables_in_model(
    variables: &[String],
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    num_groups: usize,
    total_cases: usize,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> Vec<VariableInAnalysis> {
    let mut variables_in_analysis = Vec::new();

    for var_name in variables {
        // Create a set of variables excluding the current one
        let other_variables: Vec<String> = variables
            .iter()
            .filter(|&v| v != var_name)
            .cloned()
            .collect();

        // Calculate tolerance for this variable
        let (tolerance, _) = calculate_tolerance(
            var_name,
            group_data,
            group_labels,
            &other_variables
        );

        // Calculate F-to-remove
        let (f_to_remove, wilks_lambda) = calculate_variable_f_to_remove(
            var_name,
            group_data,
            group_labels,
            group_means,
            overall_means,
            variables,
            num_groups,
            total_cases,
            method_type
        );

        variables_in_analysis.push(VariableInAnalysis {
            variable: var_name.clone(),
            tolerance,
            f_to_remove,
            wilks_lambda,
        });
    }

    // Sort variables by F-to-remove (ascending)
    variables_in_analysis.sort_by(|a, b|
        a.f_to_remove.partial_cmp(&b.f_to_remove).unwrap_or(std::cmp::Ordering::Equal)
    );

    variables_in_analysis
}

// Find the best variable to enter the model
pub fn find_best_variable_to_enter(
    variables: &[String],
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> (Option<String>, VariableNotInAnalysis) {
    // Default empty result
    let default_result = VariableNotInAnalysis {
        variable: String::new(),
        tolerance: 0.0,
        min_tolerance: 0.0,
        f_to_enter: 0.0,
        wilks_lambda: 1.0,
    };

    if variables.is_empty() {
        return (None, default_result);
    }

    // Analyze all candidate variables
    let mut candidates = Vec::new();

    for var_name in variables {
        // Calculate tolerance
        let (tolerance, min_tolerance) = calculate_tolerance(
            var_name,
            group_data,
            group_labels,
            current_variables
        );

        // Skip if tolerance is too low
        if tolerance < 0.001 {
            continue;
        }

        // Calculate F-to-enter based on method
        let (f_to_enter, wilks_lambda) = calculate_variable_f_to_enter(
            var_name,
            group_data,
            group_labels,
            group_means,
            overall_means,
            current_variables,
            num_groups,
            total_cases,
            method_type
        );

        candidates.push(VariableNotInAnalysis {
            variable: var_name.clone(),
            tolerance,
            min_tolerance,
            f_to_enter,
            wilks_lambda,
        });
    }

    if candidates.is_empty() {
        return (None, default_result);
    }

    // Sort candidates based on the method
    match method_type {
        MethodType::Wilks => {
            // For Wilks' lambda, smaller value is better
            candidates.sort_by(|a, b|
                a.wilks_lambda.partial_cmp(&b.wilks_lambda).unwrap_or(std::cmp::Ordering::Equal)
            );
        }
        MethodType::Raos => {
            // For Rao's V, we need to check against v_enter
            candidates.sort_by(|a, b|
                b.f_to_enter.partial_cmp(&a.f_to_enter).unwrap_or(std::cmp::Ordering::Equal)
            );

            // Filter by v_enter threshold
            let rao_candidates: Vec<_> = candidates
                .iter()
                .filter(|c| c.f_to_enter >= config.method.v_enter)
                .collect();

            if !rao_candidates.is_empty() {
                let best = rao_candidates[0].clone();
                return (Some(best.variable.clone()), best);
            }
        }
        _ => {
            // For other methods, higher F value is better
            candidates.sort_by(|a, b|
                b.f_to_enter.partial_cmp(&a.f_to_enter).unwrap_or(std::cmp::Ordering::Equal)
            );
        }
    }

    if !candidates.is_empty() {
        let best = candidates[0].clone();
        return (Some(best.variable.clone()), best);
    }

    (None, default_result)
}

// Find the worst variable to remove from the model
pub fn find_worst_variable_to_remove(
    variables: &[String],
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    num_groups: usize,
    total_cases: usize,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> (Option<String>, VariableInAnalysis) {
    // Default empty result
    let default_result = VariableInAnalysis {
        variable: String::new(),
        tolerance: 0.0,
        f_to_remove: f64::MAX,
        wilks_lambda: 0.0,
    };

    if variables.is_empty() {
        return (None, default_result);
    }

    // Analyze all variables in the model
    let mut candidates = Vec::new();

    for var_name in variables {
        // Calculate tolerance
        let others: Vec<String> = variables
            .iter()
            .filter(|&v| v != var_name)
            .cloned()
            .collect();
        let (tolerance, _) = calculate_tolerance(var_name, group_data, group_labels, &others);

        // Calculate F-to-remove based on method
        let (f_to_remove, wilks_lambda) = calculate_variable_f_to_remove(
            var_name,
            group_data,
            group_labels,
            group_means,
            overall_means,
            variables,
            num_groups,
            total_cases,
            method_type
        );

        candidates.push(VariableInAnalysis {
            variable: var_name.clone(),
            tolerance,
            f_to_remove,
            wilks_lambda,
        });
    }

    if candidates.is_empty() {
        return (None, default_result);
    }

    // Sort candidates based on the method
    match method_type {
        MethodType::Wilks => {
            // For Wilks' lambda, larger value is worse for removal
            candidates.sort_by(|a, b|
                b.wilks_lambda.partial_cmp(&a.wilks_lambda).unwrap_or(std::cmp::Ordering::Equal)
            );
        }
        _ => {
            // For other methods, lower F value is worse
            candidates.sort_by(|a, b|
                a.f_to_remove.partial_cmp(&b.f_to_remove).unwrap_or(std::cmp::Ordering::Equal)
            );
        }
    }

    // Check if worst candidate meets removal criteria
    if !candidates.is_empty() {
        let worst = candidates[0].clone();

        // Apply removal criteria
        let should_remove = if config.method.f_value {
            worst.f_to_remove <= config.method.f_removal
        } else if config.method.f_probability {
            let p_value = calculate_p_value_from_f(
                worst.f_to_remove,
                (num_groups - 1) as f64,
                (total_cases - variables.len() + 1 - num_groups) as f64
            );
            p_value >= config.method.p_removal
        } else {
            false
        };

        if should_remove {
            return (Some(worst.variable.clone()), worst);
        }
    }

    (None, default_result)
}

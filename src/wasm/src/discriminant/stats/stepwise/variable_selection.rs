use rayon::prelude::*;

use crate::discriminant::{
    models::{ result::{ VariableInAnalysis, VariableNotInAnalysis }, DiscriminantConfig },
    stats::core::{ AnalyzedDataset, calculate_p_value_from_f },
};

use super::{
    method_implementations::{ calculate_variable_f_to_enter, calculate_variable_f_to_remove },
    statistical_tests::calculate_tolerance,
    stepwise_statistics::MethodType,
};

// Determine the method type from config
pub fn determine_method_type(config: &DiscriminantConfig) -> MethodType {
    match true {
        _ if config.method.wilks => MethodType::Wilks,
        _ if config.method.unexplained => MethodType::Unexplained,
        _ if config.method.mahalonobis => MethodType::Mahalanobis,
        _ if config.method.f_ratio => MethodType::FRatio,
        _ if config.method.raos => MethodType::Raos,
        _ => MethodType::Wilks, // Default
    }
}

// Analyze variables not in the model - parallelized
pub fn analyze_variables_not_in_model(
    variables: &[String],
    dataset: &AnalyzedDataset,
    current_variables: &[String],
    config: &DiscriminantConfig
) -> Vec<VariableNotInAnalysis> {
    let method_type = determine_method_type(config);

    // Parallel analysis of variables
    let results: Vec<Option<VariableNotInAnalysis>> = variables
        .par_iter()
        .map(|var_name| {
            // Calculate tolerance
            let (tolerance, min_tolerance) = calculate_tolerance(
                var_name,
                dataset,
                current_variables
            );

            // Tolerance check
            if tolerance < 0.001 {
                return None;
            }

            // Calculate F-to-enter
            let (f_to_enter, wilks_lambda) = calculate_variable_f_to_enter(
                var_name,
                dataset,
                current_variables,
                method_type
            );

            Some(VariableNotInAnalysis {
                variable: var_name.clone(),
                tolerance,
                min_tolerance,
                f_to_enter,
                wilks_lambda,
            })
        })
        .collect();

    // Filter out None values and collect results
    let mut variables_not_in_analysis: Vec<VariableNotInAnalysis> = results
        .into_iter()
        .filter_map(|x| x)
        .collect();

    // Sort variables by F-to-enter (descending)
    variables_not_in_analysis.sort_unstable_by(|a, b|
        b.f_to_enter.partial_cmp(&a.f_to_enter).unwrap_or(std::cmp::Ordering::Equal)
    );

    variables_not_in_analysis
}

// Analyze variables in the model - parallelized
pub fn analyze_variables_in_model(
    variables: &[String],
    dataset: &AnalyzedDataset,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> Vec<VariableInAnalysis> {
    // Parallel analysis of variables
    let results: Vec<VariableInAnalysis> = variables
        .par_iter()
        .map(|var_name| {
            // Create a set of variables excluding the current one
            let other_variables: Vec<String> = variables
                .iter()
                .filter(|&v| v != var_name)
                .cloned()
                .collect();

            // Calculate tolerance
            let (tolerance, _) = calculate_tolerance(var_name, dataset, &other_variables);

            // Calculate F-to-remove
            let (f_to_remove, wilks_lambda) = calculate_variable_f_to_remove(
                var_name,
                dataset,
                variables,
                method_type
            );

            VariableInAnalysis {
                variable: var_name.clone(),
                tolerance,
                f_to_remove,
                wilks_lambda,
            }
        })
        .collect();

    // Sort variables by F-to-remove (ascending)
    let mut variables_in_analysis = results;
    variables_in_analysis.sort_unstable_by(|a, b|
        a.f_to_remove.partial_cmp(&b.f_to_remove).unwrap_or(std::cmp::Ordering::Equal)
    );

    variables_in_analysis
}

// Find the best variable to enter the model with caching
pub fn find_best_variable_to_enter(
    variables: &[String],
    dataset: &AnalyzedDataset,
    current_variables: &[String],
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
    let candidates = analyze_variables_not_in_model(variables, dataset, current_variables, config);

    if candidates.is_empty() {
        return (None, default_result);
    }

    // Find best candidate based on method
    let best_candidate = match method_type {
        MethodType::Raos => {
            // Filter by v_enter threshold
            candidates
                .iter()
                .find(|c| c.f_to_enter >= config.method.v_enter)
                .or_else(|| candidates.first())
                .cloned()
        }
        MethodType::Wilks => {
            // For Wilks, smaller lambda is better
            candidates
                .iter()
                .min_by(|a, b|
                    a.wilks_lambda.partial_cmp(&b.wilks_lambda).unwrap_or(std::cmp::Ordering::Equal)
                )
                .cloned()
        }
        _ => {
            // For other methods, first candidate is already sorted by F (highest first)
            candidates.first().cloned()
        }
    };

    best_candidate.map(|best| (Some(best.variable.clone()), best)).unwrap_or((None, default_result))
}

// Find the worst variable to remove from the model with caching
pub fn find_worst_variable_to_remove(
    variables: &[String],
    dataset: &AnalyzedDataset,
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
    let candidates = analyze_variables_in_model(variables, dataset, method_type, config);

    if candidates.is_empty() {
        return (None, default_result);
    }

    // Get worst candidate based on method
    let worst_candidate = match method_type {
        MethodType::Wilks => {
            // For Wilks, larger lambda is worse
            candidates
                .iter()
                .max_by(|a, b|
                    a.wilks_lambda.partial_cmp(&b.wilks_lambda).unwrap_or(std::cmp::Ordering::Equal)
                )
                .cloned()
        }
        _ => {
            // For other methods, first candidate is already sorted (lowest F first)
            candidates.first().cloned()
        }
    };

    let worst = worst_candidate.unwrap_or(default_result);

    // Apply removal criteria
    let should_remove = if config.method.f_value {
        worst.f_to_remove <= config.method.f_removal
    } else if config.method.f_probability {
        let p_value = calculate_p_value_from_f(
            worst.f_to_remove,
            (dataset.num_groups - 1) as f64,
            (dataset.total_cases - variables.len() + 1 - dataset.num_groups) as f64
        );
        p_value >= config.method.p_removal
    } else {
        false
    };

    if should_remove {
        (Some(worst.variable.clone()), worst)
    } else {
        (None, worst)
    }
}

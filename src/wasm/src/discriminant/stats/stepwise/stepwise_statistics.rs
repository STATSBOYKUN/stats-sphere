// stepwise_statistics.rs
use std::collections::HashMap;

use crate::discriminant::models::{
    result::{ PairwiseComparison, StepwiseStatistics, VariableInAnalysis, VariableNotInAnalysis },
    AnalysisData,
    DiscriminantConfig,
};

use super::{
    data_extraction::{ calculate_overall_means, calculate_group_means, extract_grouped_data },
    pairwise_comparisons::generate_pairwise_comparisons,
    statistical_tests::{
        calculate_overall_f_statistic,
        calculate_overall_wilks_lambda,
        calculate_p_value_from_f,
    },
    variable_selection::{
        analyze_variables_in_model,
        analyze_variables_not_in_model,
        determine_method_type,
        find_best_variable_to_enter,
        find_worst_variable_to_remove,
    },
};

// Method type enum for different stepwise methods
#[derive(Copy, Clone, Debug)]
pub enum MethodType {
    Wilks,
    Unexplained,
    Mahalanobis,
    FRatio,
    Raos,
}

// Helper struct to store step data
struct StepData {
    variable_entered: Option<String>,
    variable_removed: Option<String>,
    wilks_lambda: f64,
    f_value: f64,
    df1: i32,
    df2: i32,
    df3: i32,
    exact_f: f64,
    exact_df1: i32,
    exact_df2: i32,
    significance: f64,
    variables_in_analysis: Vec<VariableInAnalysis>,
    variables_not_in_analysis: Vec<VariableNotInAnalysis>,
    pairwise_comparisons: HashMap<String, Vec<PairwiseComparison>>,
}

pub fn calculate_stepwise_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StepwiseStatistics, String> {
    // Check if stepwise analysis is requested
    if !config.main.stepwise {
        return Err("Stepwise analysis not requested".to_string());
    }

    // Get variables and configuration parameters
    let variables = &config.main.independent_variables;
    let group_var = &config.main.grouping_variable;
    let min_range = config.define_range.min_range;
    let max_range = config.define_range.max_range;

    // Process group data to determine valid groups
    let (group_data_map, group_labels, total_cases) = extract_grouped_data(
        data,
        group_var,
        variables,
        min_range,
        max_range
    )?;

    let num_groups = group_labels.len();

    // If not enough groups, return error
    if num_groups < 2 {
        return Err("Not enough valid groups for analysis".to_string());
    }

    // Calculate group means and overall means
    let group_means = calculate_group_means(&group_data_map, &group_labels, variables);
    let overall_means = calculate_overall_means(&group_data_map, &group_labels, variables);

    // Initialize variables for stepwise analysis
    let mut current_variables: Vec<String> = Vec::new();
    let mut remaining_variables: Vec<String> = variables.clone();
    let mut steps_data: Vec<StepData> = Vec::new();

    // Analyze initial step (no variables in model)
    let initial_variables_not_in = analyze_variables_not_in_model(
        &remaining_variables,
        &group_data_map,
        &group_labels,
        &group_means,
        &overall_means,
        &current_variables,
        num_groups,
        total_cases,
        config
    );

    // Record initial step data
    let initial_step = StepData {
        variable_entered: None,
        variable_removed: None,
        wilks_lambda: 1.0, // No discrimination initially
        f_value: 0.0,
        df1: 0,
        df2: 1,
        df3: (total_cases - num_groups) as i32,
        exact_f: 0.0,
        exact_df1: 0,
        exact_df2: (total_cases - num_groups) as i32,
        significance: 1.0,
        variables_in_analysis: Vec::new(),
        variables_not_in_analysis: initial_variables_not_in,
        pairwise_comparisons: HashMap::new(),
    };

    steps_data.push(initial_step);

    // Maximum number of steps (at most all variables)
    let max_steps = variables.len();

    // Perform stepwise selection if needed
    if config.method.f_value || config.method.f_probability {
        // Determine which method to use
        let method_type = determine_method_type(config);

        // Perform stepwise analysis for multiple steps
        for step in 0..max_steps {
            // Find best variable to enter
            let (best_var_to_enter, best_stats) = find_best_variable_to_enter(
                &remaining_variables,
                &group_data_map,
                &group_labels,
                &group_means,
                &overall_means,
                &current_variables,
                num_groups,
                total_cases,
                method_type,
                config
            );

            // Check if we should enter this variable
            let mut should_enter = false;
            if let Some(var_name) = &best_var_to_enter {
                if config.method.f_value {
                    should_enter = best_stats.f_to_enter >= config.method.f_entry;
                } else if config.method.f_probability {
                    let p_value = calculate_p_value_from_f(
                        best_stats.f_to_enter,
                        (num_groups - 1) as f64,
                        (total_cases - current_variables.len() - num_groups) as f64
                    );
                    should_enter = p_value <= config.method.p_entry;
                }
            }

            // If no variable meets entry criteria, break
            if !should_enter || best_var_to_enter.is_none() {
                break;
            }

            // Add the best variable to the model
            if let Some(var_name) = best_var_to_enter {
                current_variables.push(var_name.clone());
                remaining_variables.retain(|v| v != &var_name);

                // Analyze variables in the model
                let vars_in_analysis = analyze_variables_in_model(
                    &current_variables,
                    &group_data_map,
                    &group_labels,
                    &group_means,
                    &overall_means,
                    num_groups,
                    total_cases,
                    method_type,
                    config
                );

                // Analyze variables not in the model
                let vars_not_in_analysis = analyze_variables_not_in_model(
                    &remaining_variables,
                    &group_data_map,
                    &group_labels,
                    &group_means,
                    &overall_means,
                    &current_variables,
                    num_groups,
                    total_cases,
                    config
                );

                // Calculate overall statistics for this step
                let wilks_lambda = calculate_overall_wilks_lambda(
                    &group_data_map,
                    &group_labels,
                    &group_means,
                    &overall_means,
                    &current_variables,
                    num_groups,
                    total_cases
                );

                // Calculate F statistic for this step
                let (f_value, df1, df2, df3) = calculate_overall_f_statistic(
                    wilks_lambda,
                    current_variables.len(),
                    num_groups,
                    total_cases
                );

                // Calculate exact F for display
                let exact_f = f_value;
                let exact_df1 = df1;
                let exact_df2 = df3 - df1 + 1;

                // Calculate significance
                let significance = calculate_p_value_from_f(
                    exact_f,
                    exact_df1 as f64,
                    exact_df2 as f64
                );

                // Generate pairwise comparisons if requested
                let pairwise_comparisons = if config.method.pairwise {
                    generate_pairwise_comparisons(
                        &group_data_map,
                        &group_labels,
                        &group_means,
                        &current_variables,
                        (step + 1) as i32,
                        num_groups,
                        total_cases
                    )
                } else {
                    HashMap::new()
                };

                // Record step data
                let step_data = StepData {
                    variable_entered: Some(var_name),
                    variable_removed: None,
                    wilks_lambda,
                    f_value,
                    df1,
                    df2,
                    df3,
                    exact_f,
                    exact_df1,
                    exact_df2,
                    significance,
                    variables_in_analysis: vars_in_analysis,
                    variables_not_in_analysis: vars_not_in_analysis,
                    pairwise_comparisons,
                };

                steps_data.push(step_data);

                // Check if we should examine variables for removal
                if step > 0 && current_variables.len() > 1 {
                    let mut step_complete = false;

                    while !step_complete {
                        // Find worst variable to remove
                        let (worst_var_to_remove, worst_stats) = find_worst_variable_to_remove(
                            &current_variables,
                            &group_data_map,
                            &group_labels,
                            &group_means,
                            &overall_means,
                            num_groups,
                            total_cases,
                            method_type,
                            config
                        );

                        // Check if we should remove this variable
                        let mut should_remove = false;
                        if let Some(var_name) = &worst_var_to_remove {
                            if config.method.f_value {
                                should_remove = worst_stats.f_to_remove <= config.method.f_removal;
                            } else if config.method.f_probability {
                                let p_value = calculate_p_value_from_f(
                                    worst_stats.f_to_remove,
                                    (num_groups - 1) as f64,
                                    (total_cases - current_variables.len() - num_groups + 1) as f64
                                );
                                should_remove = p_value >= config.method.p_removal;
                            }
                        }

                        // If no variable meets removal criteria, break
                        if !should_remove || worst_var_to_remove.is_none() {
                            step_complete = true;
                            continue;
                        }

                        // Remove the variable from the model
                        if let Some(var_name) = worst_var_to_remove {
                            current_variables.retain(|v| v != &var_name);
                            remaining_variables.push(var_name.clone());

                            // Analyze variables in the model after removal
                            let vars_in_analysis = analyze_variables_in_model(
                                &current_variables,
                                &group_data_map,
                                &group_labels,
                                &group_means,
                                &overall_means,
                                num_groups,
                                total_cases,
                                method_type,
                                config
                            );

                            // Analyze variables not in the model after removal
                            let vars_not_in_analysis = analyze_variables_not_in_model(
                                &remaining_variables,
                                &group_data_map,
                                &group_labels,
                                &group_means,
                                &overall_means,
                                &current_variables,
                                num_groups,
                                total_cases,
                                config
                            );

                            // Calculate overall statistics for this step
                            let wilks_lambda = calculate_overall_wilks_lambda(
                                &group_data_map,
                                &group_labels,
                                &group_means,
                                &overall_means,
                                &current_variables,
                                num_groups,
                                total_cases
                            );

                            // Calculate F statistic for this step
                            let (f_value, df1, df2, df3) = calculate_overall_f_statistic(
                                wilks_lambda,
                                current_variables.len(),
                                num_groups,
                                total_cases
                            );

                            // Calculate exact F for display
                            let exact_f = f_value;
                            let exact_df1 = df1;
                            let exact_df2 = df3 - df1 + 1;

                            // Calculate significance
                            let significance = calculate_p_value_from_f(
                                exact_f,
                                exact_df1 as f64,
                                exact_df2 as f64
                            );

                            // Generate pairwise comparisons if requested
                            let pairwise_comparisons = if config.method.pairwise {
                                generate_pairwise_comparisons(
                                    &group_data_map,
                                    &group_labels,
                                    &group_means,
                                    &current_variables,
                                    (step + 1) as i32,
                                    num_groups,
                                    total_cases
                                )
                            } else {
                                HashMap::new()
                            };

                            // Record step data for removal
                            let step_data = StepData {
                                variable_entered: None,
                                variable_removed: Some(var_name),
                                wilks_lambda,
                                f_value,
                                df1,
                                df2,
                                df3,
                                exact_f,
                                exact_df1,
                                exact_df2,
                                significance,
                                variables_in_analysis: vars_in_analysis,
                                variables_not_in_analysis: vars_not_in_analysis,
                                pairwise_comparisons,
                            };

                            steps_data.push(step_data);
                        }
                    }
                }
            }

            // If all variables are in the model, break
            if remaining_variables.is_empty() {
                break;
            }
        }
    }

    // Convert the step data to output format
    let mut result = StepwiseStatistics {
        variables_entered: Vec::new(),
        variables_removed: Vec::new(),
        wilks_lambda: Vec::new(),
        f_values: Vec::new(),
        df1: Vec::new(),
        df2: Vec::new(),
        df3: Vec::new(),
        exact_f: Vec::new(),
        exact_df1: Vec::new(),
        exact_df2: Vec::new(),
        significance: Vec::new(),
        variables_in_analysis: HashMap::new(),
        variables_not_in_analysis: HashMap::new(),
        pairwise_comparisons: HashMap::new(),
    };

    // Extract data from step data
    for (step_idx, step) in steps_data.iter().enumerate() {
        // Add variables entered/removed
        result.variables_entered.push(step.variable_entered.clone().unwrap_or_default());
        result.variables_removed.push(step.variable_removed.clone());

        // Add statistical values
        result.wilks_lambda.push(step.wilks_lambda);
        result.f_values.push(step.f_value);
        result.df1.push(step.df1);
        result.df2.push(step.df2);
        result.df3.push(step.df3);
        result.exact_f.push(step.exact_f);
        result.exact_df1.push(step.exact_df1);
        result.exact_df2.push(step.exact_df2);
        result.significance.push(step.significance);

        // Add variables in analysis by step
        result.variables_in_analysis.insert(
            (step_idx + 1).to_string(),
            step.variables_in_analysis.clone()
        );

        // Add variables not in analysis by step (zero-based)
        result.variables_not_in_analysis.insert(
            step_idx.to_string(),
            step.variables_not_in_analysis.clone()
        );

        // Add pairwise comparisons if available
        if !step.pairwise_comparisons.is_empty() {
            result.pairwise_comparisons.insert(
                (step_idx + 1).to_string(),
                step.pairwise_comparisons.clone()
            );
        }
    }

    Ok(result)
}

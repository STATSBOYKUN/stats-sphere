use std::collections::HashMap;

use crate::discriminant::{
    models::{
        result::{
            PairwiseComparison,
            StepwiseStatistics,
            VariableInAnalysis,
            VariableNotInAnalysis,
        },
        AnalysisData,
        DiscriminantConfig,
    },
    stats::core::{ calculate_p_value_from_f, extract_analyzed_dataset, AnalyzedDataset },
};

use super::{
    pairwise_comparisons::generate_pairwise_comparisons,
    statistical_tests::{ calculate_overall_f_statistic, calculate_overall_wilks_lambda },
    variable_selection::{
        analyze_variables_in_model,
        analyze_variables_not_in_model,
        determine_method_type,
        find_best_variable_to_enter,
        find_worst_variable_to_remove,
    },
};

// Method type enum for different stepwise methods
#[derive(Copy, Clone, Debug, PartialEq)]
pub enum MethodType {
    Wilks,
    Unexplained,
    Mahalanobis,
    FRatio,
    Raos,
}

// Helper struct to store step data
#[derive(Clone)]
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

    // Get variables and extract analyzed dataset
    let variables = &config.main.independent_variables;
    let dataset = extract_analyzed_dataset(data, config)?;

    if dataset.num_groups < 2 {
        return Err("Not enough valid groups for analysis".to_string());
    }

    // Perform stepwise analysis
    let steps_data = if config.method.f_value || config.method.f_probability {
        perform_stepwise_analysis(&dataset, variables, config)?
    } else {
        vec![create_initial_step(&dataset, variables, config)]
    };

    // Convert step data to output format
    convert_steps_to_output(steps_data)
}

fn perform_stepwise_analysis(
    dataset: &AnalyzedDataset,
    variables: &Vec<String>,
    config: &DiscriminantConfig
) -> Result<Vec<StepData>, String> {
    // Initialize variables for stepwise analysis
    let mut current_variables: Vec<String> = Vec::new();
    let mut remaining_variables: Vec<String> = variables.clone();
    let mut steps_data: Vec<StepData> = Vec::new();

    // Add initial step
    steps_data.push(create_initial_step(dataset, variables, config));

    // Determine which method to use
    let method_type = determine_method_type(config);

    // Maximum number of steps (at most all variables)
    let max_steps = variables.len();

    // Perform stepwise selection
    for step in 0..max_steps {
        // Process one step of variable selection
        let step_result = process_selection_step(
            &dataset,
            &mut current_variables,
            &mut remaining_variables,
            step,
            method_type,
            config
        )?;

        // If no changes made, break
        if !step_result.changes_made {
            break;
        }

        // Add step data
        steps_data.extend(step_result.step_data);

        // If all variables are in the model, break
        if remaining_variables.is_empty() {
            break;
        }
    }

    Ok(steps_data)
}

struct StepResult {
    changes_made: bool,
    step_data: Vec<StepData>,
}

fn process_selection_step(
    dataset: &AnalyzedDataset,
    current_variables: &mut Vec<String>,
    remaining_variables: &mut Vec<String>,
    step: usize,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> Result<StepResult, String> {
    let mut steps_data = Vec::new();
    let mut changes_made = false;

    // Find best variable to enter
    let (best_var_to_enter, best_stats) = find_best_variable_to_enter(
        remaining_variables,
        &dataset,
        current_variables,
        method_type,
        config
    );

    // Check if we should enter this variable
    let should_enter = should_enter_variable(
        &best_var_to_enter,
        &best_stats,
        dataset.num_groups,
        dataset.total_cases,
        current_variables.len(),
        config
    );

    // If no variable meets entry criteria, return
    if !should_enter || best_var_to_enter.is_none() {
        return Ok(StepResult {
            changes_made: false,
            step_data: steps_data,
        });
    }

    // Add variable to model
    if let Some(var_name) = best_var_to_enter {
        current_variables.push(var_name.clone());
        remaining_variables.retain(|v| v != &var_name);
        changes_made = true;

        // Add step data for variable entry
        steps_data.push(
            create_step_data(
                dataset,
                current_variables,
                remaining_variables,
                Some(var_name),
                None,
                (step as i32) + 1,
                method_type,
                config
            )
        );

        // Check for variable removal if needed
        if step > 0 && current_variables.len() > 1 {
            let removal_result = process_variable_removal(
                dataset,
                current_variables,
                remaining_variables,
                step,
                method_type,
                config
            )?;

            if removal_result.changes_made {
                steps_data.extend(removal_result.step_data);
            }
        }
    }

    Ok(StepResult {
        changes_made,
        step_data: steps_data,
    })
}

fn process_variable_removal(
    dataset: &AnalyzedDataset,
    current_variables: &mut Vec<String>,
    remaining_variables: &mut Vec<String>,
    step: usize,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> Result<StepResult, String> {
    let mut steps_data = Vec::new();
    let mut changes_made = false;
    let mut step_complete = false;

    while !step_complete {
        // Find worst variable to remove
        let (worst_var_to_remove, worst_stats) = find_worst_variable_to_remove(
            current_variables,
            &dataset,
            method_type,
            config
        );

        // Check if we should remove this variable
        let should_remove = should_remove_variable(
            &worst_var_to_remove,
            &worst_stats,
            dataset.num_groups,
            dataset.total_cases,
            current_variables.len(),
            config
        );

        // If no variable meets removal criteria, break
        if !should_remove || worst_var_to_remove.is_none() {
            step_complete = true;
            continue;
        }

        // Remove variable from model
        if let Some(var_name) = worst_var_to_remove {
            current_variables.retain(|v| v != &var_name);
            remaining_variables.push(var_name.clone());
            changes_made = true;

            // Add step data for variable removal
            steps_data.push(
                create_step_data(
                    dataset,
                    current_variables,
                    remaining_variables,
                    None,
                    Some(var_name),
                    (step as i32) + 1,
                    method_type,
                    config
                )
            );
        }
    }

    Ok(StepResult {
        changes_made,
        step_data: steps_data,
    })
}

fn should_enter_variable(
    var_opt: &Option<String>,
    stats: &VariableNotInAnalysis,
    num_groups: usize,
    total_cases: usize,
    num_current_vars: usize,
    config: &DiscriminantConfig
) -> bool {
    if var_opt.is_none() {
        return false;
    }

    if config.method.f_value {
        stats.f_to_enter >= config.method.f_entry
    } else if config.method.f_probability {
        let p_value = calculate_p_value_from_f(
            stats.f_to_enter,
            (num_groups - 1) as f64,
            (total_cases - num_current_vars - num_groups) as f64
        );
        p_value <= config.method.p_entry
    } else {
        false
    }
}

fn should_remove_variable(
    var_opt: &Option<String>,
    stats: &VariableInAnalysis,
    num_groups: usize,
    total_cases: usize,
    num_current_vars: usize,
    config: &DiscriminantConfig
) -> bool {
    if var_opt.is_none() {
        return false;
    }

    if config.method.f_value {
        stats.f_to_remove <= config.method.f_removal
    } else if config.method.f_probability {
        let p_value = calculate_p_value_from_f(
            stats.f_to_remove,
            (num_groups - 1) as f64,
            (total_cases - num_current_vars + 1 - num_groups) as f64
        );
        p_value >= config.method.p_removal
    } else {
        false
    }
}

fn create_initial_step(
    dataset: &AnalyzedDataset,
    variables: &[String],
    config: &DiscriminantConfig
) -> StepData {
    let initial_variables_not_in = analyze_variables_not_in_model(variables, &dataset, &[], config);

    StepData {
        variable_entered: None,
        variable_removed: None,
        wilks_lambda: 1.0, // No discrimination initially
        f_value: 0.0,
        df1: 0,
        df2: 1,
        df3: (dataset.total_cases - dataset.num_groups) as i32,
        exact_f: 0.0,
        exact_df1: 0,
        exact_df2: (dataset.total_cases - dataset.num_groups) as i32,
        significance: 1.0,
        variables_in_analysis: Vec::new(),
        variables_not_in_analysis: initial_variables_not_in,
        pairwise_comparisons: HashMap::new(),
    }
}

fn create_step_data(
    dataset: &AnalyzedDataset,
    current_variables: &[String],
    remaining_variables: &[String],
    variable_entered: Option<String>,
    variable_removed: Option<String>,
    step: i32,
    method_type: MethodType,
    config: &DiscriminantConfig
) -> StepData {
    // Analyze variables in and out of the model
    let vars_in_analysis = analyze_variables_in_model(
        current_variables,
        &dataset,
        method_type,
        config
    );

    let vars_not_in_analysis = analyze_variables_not_in_model(
        remaining_variables,
        &dataset,
        current_variables,
        config
    );

    // Calculate overall statistics
    let wilks_lambda = calculate_overall_wilks_lambda(&dataset, current_variables);

    // Calculate F statistic
    let (f_value, df1, df2, df3) = calculate_overall_f_statistic(
        wilks_lambda,
        current_variables.len(),
        dataset.num_groups,
        dataset.total_cases
    );

    // Calculate exact F for display
    let exact_f = f_value;
    let exact_df1 = df1;
    let exact_df2 = df3 - df1 + 1;

    // Calculate significance
    let significance = calculate_p_value_from_f(exact_f, exact_df1 as f64, exact_df2 as f64);

    // Generate pairwise comparisons if requested
    let pairwise_comparisons = if config.method.pairwise {
        generate_pairwise_comparisons(&dataset, current_variables, step)
    } else {
        HashMap::new()
    };

    StepData {
        variable_entered,
        variable_removed,
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
    }
}

fn convert_steps_to_output(steps_data: Vec<StepData>) -> Result<StepwiseStatistics, String> {
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

        // Add variables not in analysis by step
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

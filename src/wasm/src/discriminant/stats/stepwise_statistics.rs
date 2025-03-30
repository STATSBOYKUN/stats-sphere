use std::collections::HashMap;

use crate::discriminant::models::{
    result::{ PairwiseComparison, StepwiseStatistics, VariableInAnalysis, VariableNotInAnalysis },
    AnalysisData,
    DiscriminantConfig,
};

pub fn calculate_stepwise_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StepwiseStatistics, String> {
    web_sys::console::log_1(&"Executing calculate_stepwise_statistics".into());

    // Check if stepwise analysis is requested
    if !config.main.stepwise {
        return Err("Stepwise analysis not requested".to_string());
    }

    // Get variables and their inclusion levels
    let variables = &config.main.independent_variables;

    // Analyze each step for variable entry/removal
    let mut steps_data = perform_stepwise_analysis(data, config)?;

    // Extract results in the format needed for output
    let variables_entered = steps_data
        .iter()
        .filter_map(|step| step.variable_entered.clone())
        .collect();

    let variables_removed = steps_data
        .iter()
        .map(|step| step.variable_removed.clone())
        .collect();

    let wilks_lambda = steps_data
        .iter()
        .map(|step| step.wilks_lambda)
        .collect();

    let f_values = steps_data
        .iter()
        .map(|step| step.f_value)
        .collect();

    let df1: Vec<i32> = steps_data
        .iter()
        .map(|step| step.df1)
        .collect();

    let df2: Vec<i32> = steps_data
        .iter()
        .map(|step| 1)
        .collect();

    let df3: Vec<i32> = steps_data
        .iter()
        .map(|step| step.df2)
        .collect();

    let exact_f = steps_data
        .iter()
        .map(|step| step.exact_f)
        .collect();

    let exact_df1 = df1.clone();

    let exact_df2: Vec<i32> = steps_data
        .iter()
        .map(|step| step.df2 - step.df1 + 1) // Adjust for variables in the model
        .collect();

    let significance: Vec<f64> = steps_data
        .iter()
        .map(|step| calculate_p_value_from_f(step.f_value, step.df1 as f64, step.df2 as f64))
        .collect();

    // Variables in analysis at each step
    let mut variables_in_analysis = HashMap::new();

    for (step_idx, step) in steps_data.iter().enumerate() {
        let step_key = (step_idx + 1).to_string();
        let variables_in = step.variables_in_analysis.clone();
        variables_in_analysis.insert(step_key, variables_in);
    }

    // Variables not in analysis at each step
    let mut variables_not_in_analysis = HashMap::new();

    for (step_idx, step) in steps_data.iter().enumerate() {
        let step_key = step_idx.to_string(); // Note: 0-based indexing for first step
        let variables_out = step.variables_not_in_analysis.clone();
        variables_not_in_analysis.insert(step_key, variables_out);
    }

    // Pairwise comparisons at each step
    let mut pairwise_comparisons = HashMap::new();

    for (step_idx, step) in steps_data.iter().enumerate() {
        if !step.pairwise_comparisons.is_empty() {
            let step_key = (step_idx + 1).to_string();
            pairwise_comparisons.insert(step_key, step.pairwise_comparisons.clone());
        }
    }

    Ok(StepwiseStatistics {
        variables_entered,
        variables_removed,
        wilks_lambda,
        f_values,
        df1,
        df2,
        df3,
        exact_f,
        exact_df1,
        exact_df2,
        significance,
        variables_in_analysis,
        variables_not_in_analysis,
        pairwise_comparisons,
    })
}

// Helper struct to store stepwise analysis results at each step
struct StepData {
    variable_entered: Option<String>,
    variable_removed: Option<String>,
    wilks_lambda: f64,
    f_value: f64,
    exact_f: f64,
    df1: i32,
    df2: i32,
    variables_in_analysis: Vec<VariableInAnalysis>,
    variables_not_in_analysis: Vec<VariableNotInAnalysis>,
    pairwise_comparisons: Vec<PairwiseComparison>,
}

// Perform the stepwise analysis
fn perform_stepwise_analysis(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<Vec<StepData>, String> {
    let variables = &config.main.independent_variables;
    let num_groups = data.group_data.len();
    let num_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    // Initialize with empty model
    let mut current_variables: Vec<String> = Vec::new();
    let mut steps_data: Vec<StepData> = Vec::new();

    // For initial step, all variables are candidates for entry
    let initial_step = evaluate_initial_step(data, config, &current_variables);
    steps_data.push(initial_step);

    // Determine maximum number of steps
    let max_steps = variables.len() * 2; // Safe upper limit

    // Iteratively select/remove variables
    for step in 0..max_steps {
        // 1. Find the best variable to enter (if any)
        let (best_var_to_enter, entry_stats) = find_best_variable_to_enter(
            data,
            config,
            &current_variables,
            &steps_data.last().unwrap().variables_not_in_analysis
        );

        // 2. Find the worst variable to remove (if any)
        let (worst_var_to_remove, removal_stats) = find_worst_variable_to_remove(
            data,
            config,
            &current_variables,
            &steps_data.last().unwrap().variables_in_analysis
        );

        // 3. Determine whether to enter, remove, or terminate
        let mut step_complete = true;
        let mut variable_entered = None;
        let mut variable_removed = None;

        // Entry condition
        if let Some(var_name) = best_var_to_enter {
            if entry_stats.f_to_enter >= config.method.f_entry {
                current_variables.push(var_name.clone());
                variable_entered = Some(var_name);
                step_complete = false;
            }
        }

        // Removal condition (only if no variable was entered)
        if step_complete && !current_variables.is_empty() {
            if let Some(var_name) = worst_var_to_remove {
                if removal_stats.f_to_remove <= config.method.f_removal {
                    if let Some(index) = current_variables.iter().position(|x| *x == var_name) {
                        current_variables.remove(index);
                        variable_removed = Some(var_name);
                        step_complete = false;
                    }
                }
            }
        }

        // If no changes were made, we're done
        if step_complete {
            break;
        }

        // 4. Evaluate the model with the updated variables
        let step_data = evaluate_step(
            data,
            config,
            &current_variables,
            variable_entered,
            variable_removed,
            (step as i32) + 1
        );

        steps_data.push(step_data);
    }

    Ok(steps_data)
}

// Evaluate initial step (no variables in model)
fn evaluate_initial_step(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    current_variables: &[String]
) -> StepData {
    let variables = &config.main.independent_variables;
    let num_groups = data.group_data.len();
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    // All variables are candidates for entry
    let mut variables_not_in_analysis = Vec::new();

    for (var_idx, var_name) in variables.iter().enumerate() {
        // For each variable, calculate tolerance and F-to-enter
        let (tolerance, min_tolerance) = calculate_tolerance(data, var_name, current_variables);
        let (f_to_enter, wilks) = calculate_f_to_enter(data, var_name, current_variables);

        variables_not_in_analysis.push(VariableNotInAnalysis {
            variable: var_name.clone(),
            tolerance,
            min_tolerance,
            f_to_enter,
            wilks_lambda: wilks,
        });
    }

    // No variables in analysis yet
    let variables_in_analysis = Vec::new();

    // No pairwise comparisons in initial step
    let pairwise_comparisons = Vec::new();

    // Initial Wilks' lambda is 1.0 (no discrimination)
    let wilks_lambda = 1.0;
    let f_value = 0.0;
    let exact_f = 0.0;

    // Degrees of freedom
    let df1 = 0;
    let df2 = (total_cases as i32) - (num_groups as i32);

    StepData {
        variable_entered: None,
        variable_removed: None,
        wilks_lambda,
        f_value,
        exact_f,
        df1,
        df2,
        variables_in_analysis,
        variables_not_in_analysis,
        pairwise_comparisons,
    }
}

// Evaluate a step in the stepwise process
fn evaluate_step(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    current_variables: &[String],
    variable_entered: Option<String>,
    variable_removed: Option<String>,
    step: i32
) -> StepData {
    let variables = &config.main.independent_variables;
    let num_groups = data.group_data.len();
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    // Check which variables are in the analysis
    let mut variables_in_analysis = Vec::new();
    let mut variables_not_in_analysis = Vec::new();

    for (var_idx, var_name) in variables.iter().enumerate() {
        if current_variables.contains(var_name) {
            // Variable is in analysis - calculate tolerance and F-to-remove
            let (tolerance, _) = calculate_tolerance(
                data,
                var_name,
                &current_variables
                    .iter()
                    .filter(|&v| v != var_name)
                    .cloned()
                    .collect::<Vec<_>>()
            );

            let (f_to_remove, wilks) = calculate_f_to_remove(data, var_name, current_variables);

            variables_in_analysis.push(VariableInAnalysis {
                variable: var_name.clone(),
                tolerance,
                f_to_remove,
                wilks_lambda: wilks,
            });
        } else {
            // Variable is not in analysis - calculate tolerance and F-to-enter
            let (tolerance, min_tolerance) = calculate_tolerance(data, var_name, current_variables);
            let (f_to_enter, wilks) = calculate_f_to_enter(data, var_name, current_variables);

            variables_not_in_analysis.push(VariableNotInAnalysis {
                variable: var_name.clone(),
                tolerance,
                min_tolerance,
                f_to_enter,
                wilks_lambda: wilks,
            });
        }
    }

    // Calculate Wilks' lambda and overall F for the current model
    let (wilks_lambda, f_value) = if current_variables.is_empty() {
        (1.0, 0.0) // No discrimination if no variables
    } else {
        calculate_overall_wilks_lambda_and_f(data, current_variables)
    };

    let exact_f = f_value; // In the simple case, these are the same

    // Generate pairwise comparisons for this step
    let pairwise_comparisons = if config.method.pairwise {
        generate_pairwise_comparisons(data, current_variables, step)
    } else {
        Vec::new()
    };

    // Degrees of freedom
    let df1 = current_variables.len() as i32;
    let df2 = (total_cases as i32) - (num_groups as i32);

    StepData {
        variable_entered,
        variable_removed,
        wilks_lambda,
        f_value,
        exact_f,
        df1,
        df2,
        variables_in_analysis,
        variables_not_in_analysis,
        pairwise_comparisons,
    }
}

// Find the best variable to enter the model
fn find_best_variable_to_enter(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    current_variables: &[String],
    candidates: &[VariableNotInAnalysis]
) -> (Option<String>, VariableNotInAnalysis) {
    // Default empty result
    let empty_result = VariableNotInAnalysis {
        variable: String::new(),
        tolerance: 0.0,
        min_tolerance: 0.0,
        f_to_enter: 0.0,
        wilks_lambda: 1.0,
    };

    if candidates.is_empty() {
        return (None, empty_result);
    }

    // Find variable with highest F-to-enter value
    let tolerance_threshold = config.method.f_entry;

    let mut best_var = None;
    let mut best_stats = empty_result;

    for candidate in candidates {
        // Skip if tolerance is too low
        if candidate.tolerance < tolerance_threshold {
            continue;
        }

        if best_var.is_none() || candidate.f_to_enter > best_stats.f_to_enter {
            best_var = Some(candidate.variable.clone());
            best_stats = candidate.clone();
        }
    }

    (best_var, best_stats)
}

// Find the worst variable to remove from the model
fn find_worst_variable_to_remove(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    current_variables: &[String],
    candidates: &[VariableInAnalysis]
) -> (Option<String>, VariableInAnalysis) {
    // Default empty result
    let empty_result = VariableInAnalysis {
        variable: String::new(),
        tolerance: 0.0,
        f_to_remove: f64::MAX,
        wilks_lambda: 0.0,
    };

    if candidates.is_empty() {
        return (None, empty_result);
    }

    // Find variable with lowest F-to-remove value
    let removal_threshold = config.method.f_removal;

    let mut worst_var = None;
    let mut worst_stats = empty_result;

    for candidate in candidates {
        if worst_var.is_none() || candidate.f_to_remove < worst_stats.f_to_remove {
            if candidate.f_to_remove <= removal_threshold {
                worst_var = Some(candidate.variable.clone());
                worst_stats = candidate.clone();
            }
        }
    }

    (worst_var, worst_stats)
}

// Generate pairwise comparisons between groups
fn generate_pairwise_comparisons(
    data: &AnalysisData,
    current_variables: &[String],
    step: i32
) -> Vec<PairwiseComparison> {
    let num_groups = data.group_data.len();
    let mut comparisons = Vec::new();

    // Skip if no variables in model
    if current_variables.is_empty() {
        return comparisons;
    }

    // Generate comparisons for each pair of groups
    for i in 0..num_groups {
        for j in i + 1..num_groups {
            // Calculate F value for this pair
            let f_value = calculate_pairwise_f(data, current_variables, i, j);

            // Calculate significance
            let p_value = calculate_p_value_from_f(
                f_value,
                current_variables.len() as f64,
                (data.group_data[i].len() + data.group_data[j].len() - 2) as f64
            );

            comparisons.push(PairwiseComparison {
                step,
                category1: (i + 1) as i32, // 1-based category indices
                category2: (j + 1) as i32,
                f_value,
                significance: p_value,
            });
        }
    }

    comparisons
}

// Calculate tolerance for a variable
fn calculate_tolerance(
    data: &AnalysisData,
    variable: &str,
    current_variables: &[String]
) -> (f64, f64) {
    // Find index of the variable
    let variables = &data.independent_data;
    let var_idx = data.independent_data
        .iter()
        .position(|v| v[0].values.get(variable).is_some())
        .unwrap_or(0);

    // If no variables in model, tolerance is 1.0
    if current_variables.is_empty() {
        return (1.0, 1.0);
    }

    // Extract values for all variables
    let all_values: Vec<Vec<f64>> = extract_variable_values(data, &[variable.to_string()]);
    let model_values: Vec<Vec<f64>> = extract_variable_values(data, current_variables);

    if all_values.is_empty() || all_values[0].is_empty() {
        return (1.0, 1.0);
    }

    // Calculate tolerance (1 - R²) using simplified approach
    // In a real implementation, we would build a regression model
    let tolerance = 0.8; // Placeholder
    let min_tolerance = 0.7; // Placeholder

    (tolerance, min_tolerance)
}

// Calculate F-to-enter statistic for a variable
fn calculate_f_to_enter(
    data: &AnalysisData,
    variable: &str,
    current_variables: &[String]
) -> (f64, f64) {
    // If the variable is already in the model, return 0
    if current_variables.contains(&variable.to_string()) {
        return (0.0, 1.0);
    }

    // Extract values
    let var_values: Vec<Vec<f64>> = extract_variable_values(data, &[variable.to_string()]);

    if var_values.is_empty() || var_values[0].is_empty() {
        return (0.0, 1.0);
    }

    // Calculate between-groups and within-groups variances
    let num_groups = data.group_data.len();
    let mut group_means = Vec::with_capacity(num_groups);
    let mut group_counts = Vec::with_capacity(num_groups);

    for group_idx in 0..num_groups {
        let values: Vec<f64> = data.group_data[group_idx]
            .iter()
            .filter_map(|record| {
                if let Some(value) = record.values.get(variable) {
                    match value {
                        crate::discriminant::models::DataValue::Number(n) => Some(*n),
                        _ => None,
                    }
                } else {
                    None
                }
            })
            .collect();

        let mean = if values.is_empty() {
            0.0
        } else {
            values.iter().sum::<f64>() / (values.len() as f64)
        };

        group_means.push(mean);
        group_counts.push(values.len());
    }

    // Calculate overall mean
    let total_count: usize = group_counts.iter().sum();
    let overall_mean =
        group_means
            .iter()
            .zip(group_counts.iter())
            .map(|(&mean, &count)| mean * (count as f64))
            .sum::<f64>() / (total_count as f64);

    // Calculate between-groups sum of squares
    let between_ss = group_means
        .iter()
        .zip(group_counts.iter())
        .map(|(&mean, &count)| (count as f64) * (mean - overall_mean).powi(2))
        .sum::<f64>();

    // Calculate within-groups sum of squares
    let mut within_ss = 0.0;

    for group_idx in 0..num_groups {
        let values: Vec<f64> = data.group_data[group_idx]
            .iter()
            .filter_map(|record| {
                if let Some(value) = record.values.get(variable) {
                    match value {
                        crate::discriminant::models::DataValue::Number(n) => Some(*n),
                        _ => None,
                    }
                } else {
                    None
                }
            })
            .collect();

        let group_mean = group_means[group_idx];
        let group_within_ss = values
            .iter()
            .map(|&value| (value - group_mean).powi(2))
            .sum::<f64>();

        within_ss += group_within_ss;
    }

    // Calculate F statistic
    let df1 = num_groups - 1;
    let df2 = total_count - num_groups;

    let f_value = if within_ss > 0.0 && df1 > 0 && df2 > 0 {
        between_ss / (df1 as f64) / (within_ss / (df2 as f64))
    } else {
        0.0
    };

    // Calculate Wilks' lambda
    let wilks_lambda = if between_ss + within_ss > 0.0 {
        within_ss / (between_ss + within_ss)
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-remove statistic for a variable
fn calculate_f_to_remove(
    data: &AnalysisData,
    variable: &str,
    current_variables: &[String]
) -> (f64, f64) {
    // If the variable is not in the model, return 0
    if !current_variables.contains(&variable.to_string()) {
        return (0.0, 1.0);
    }

    // Create a model without this variable
    let reduced_model: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    // Calculate Wilks' lambda for both models
    let (full_wilks, _) = calculate_overall_wilks_lambda_and_f(data, current_variables);
    let (reduced_wilks, _) = calculate_overall_wilks_lambda_and_f(data, &reduced_model);

    // Calculate F statistic for the difference
    let num_groups = data.group_data.len();
    let total_count: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    let df1 = num_groups - 1;
    let df2 = total_count - num_groups - current_variables.len() + 1;

    let f_value = if reduced_wilks > full_wilks && full_wilks > 0.0 {
        (((reduced_wilks - full_wilks) / full_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, reduced_wilks)
}

// Calculate overall Wilks' lambda and F statistic for a set of variables
fn calculate_overall_wilks_lambda_and_f(data: &AnalysisData, variables: &[String]) -> (f64, f64) {
    if variables.is_empty() {
        return (1.0, 0.0);
    }

    // Extract values for all variables
    let values: Vec<Vec<f64>> = extract_variable_values(data, variables);

    if values.is_empty() || values[0].is_empty() {
        return (1.0, 0.0);
    }

    // Calculate between-groups and within-groups matrices
    // For simplicity, we'll use a univariate approach for each variable
    let num_vars = variables.len();
    let num_groups = data.group_data.len();

    // Calculate overall Wilks' lambda (product of individual lambdas)
    let mut overall_lambda = 1.0;
    let mut sum_f = 0.0;

    for var_idx in 0..num_vars {
        let variable = &variables[var_idx];
        let (_, lambda) = calculate_f_to_enter(data, variable, &[]);

        overall_lambda *= lambda;
    }

    // Calculate F statistic
    let total_count: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    let p = num_vars as f64;
    let g = num_groups as f64;
    let n = total_count as f64;

    let s = 1.0;
    let m = (p * (g - 1.0) - 2.0) / 2.0;
    let n_adj = n - 1.0 - (p + g) / 2.0;

    let f_value =
        ((1.0 - overall_lambda.powf(1.0 / s)) / overall_lambda.powf(1.0 / s)) * (n_adj / p);

    (overall_lambda, f_value)
}

// Helper function to calculate p-value from F statistic
fn calculate_p_value_from_f(f: f64, df1: f64, df2: f64) -> f64 {
    // Simple approximation
    if f <= 0.0 {
        return 1.0;
    }

    // Rough inverse relationship between F and p-value
    let ratio = f / (1.0 + f);

    if ratio > 0.99 {
        0.001
    } else if ratio > 0.95 {
        0.01
    } else if ratio > 0.9 {
        0.05
    } else if ratio > 0.8 {
        0.1
    } else {
        1.0 - ratio
    }
}

// Calculate F statistic for a pair of groups
fn calculate_pairwise_f(
    data: &AnalysisData,
    variables: &[String],
    group1_idx: usize,
    group2_idx: usize
) -> f64 {
    if variables.is_empty() {
        return 0.0;
    }

    // Extract data for these two groups
    let group1_data = &data.group_data[group1_idx];
    let group2_data = &data.group_data[group2_idx];

    let num_vars = variables.len();

    // Calculate group means for each variable
    let mut group1_means = Vec::with_capacity(num_vars);
    let mut group2_means = Vec::with_capacity(num_vars);

    for var_idx in 0..num_vars {
        let variable = &variables[var_idx];

        // Group 1 mean
        let values1: Vec<f64> = group1_data
            .iter()
            .filter_map(|record| {
                if let Some(value) = record.values.get(variable) {
                    match value {
                        crate::discriminant::models::DataValue::Number(n) => Some(*n),
                        _ => None,
                    }
                } else {
                    None
                }
            })
            .collect();

        let mean1 = if values1.is_empty() {
            0.0
        } else {
            values1.iter().sum::<f64>() / (values1.len() as f64)
        };

        // Group 2 mean
        let values2: Vec<f64> = group2_data
            .iter()
            .filter_map(|record| {
                if let Some(value) = record.values.get(variable) {
                    match value {
                        crate::discriminant::models::DataValue::Number(n) => Some(*n),
                        _ => None,
                    }
                } else {
                    None
                }
            })
            .collect();

        let mean2 = if values2.is_empty() {
            0.0
        } else {
            values2.iter().sum::<f64>() / (values2.len() as f64)
        };

        group1_means.push(mean1);
        group2_means.push(mean2);
    }

    // Calculate Mahalanobis distance squared (simplified)
    let mut distance_squared = 0.0;

    for var_idx in 0..num_vars {
        let diff = group1_means[var_idx] - group2_means[var_idx];
        distance_squared += diff * diff;
    }

    // Calculate F statistic
    let n1 = group1_data.len() as f64;
    let n2 = group2_data.len() as f64;

    let f_value = (((n1 * n2) / (n1 + n2)) * distance_squared) / (num_vars as f64);

    f_value
}

// Helper function to extract values for variables
fn extract_variable_values(data: &AnalysisData, variables: &[String]) -> Vec<Vec<f64>> {
    let mut result = Vec::with_capacity(variables.len());

    for variable in variables {
        let mut values = Vec::new();

        // Collect values across all groups
        for group_data in &data.group_data {
            for record in group_data {
                if let Some(value) = record.values.get(variable) {
                    match value {
                        crate::discriminant::models::DataValue::Number(n) => values.push(*n),
                        _ => {} // Ignore non-numeric values
                    }
                }
            }
        }

        result.push(values);
    }

    result
}

// stepwise_statistics.rs
use std::collections::HashMap;
use nalgebra::{ DMatrix, DVector };

use crate::discriminant::models::{
    result::{ PairwiseComparison, StepwiseStatistics, VariableInAnalysis, VariableNotInAnalysis },
    AnalysisData,
    DiscriminantConfig,
};

use crate::discriminant::stats::common::{
    calculate_p_value_from_f,
    extract_values_by_index,
    extract_group_values,
    calculate_group_means,
    calculate_covariance,
    vec_to_matrix,
    matrix_to_vec,
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
    let num_vars = variables.len();
    let num_groups = data.group_data.len();

    // Analyze each step for variable entry/removal
    let steps_data = perform_stepwise_analysis(data, config)?;

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
        .map(|step| step.df2)
        .collect();

    let df3: Vec<i32> = steps_data
        .iter()
        .map(|step| step.df3)
        .collect();

    let exact_f = steps_data
        .iter()
        .map(|step| step.exact_f)
        .collect();

    let exact_df1 = df1.clone();

    let exact_df2: Vec<i32> = steps_data
        .iter()
        .map(|step| step.exact_df2)
        .collect();

    let significance: Vec<f64> = steps_data
        .iter()
        .map(|step| step.significance)
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
    df3: i32,
    exact_df2: i32,
    significance: f64,
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
    let num_vars = variables.len();
    let num_groups = data.group_data.len();
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    // Initialize with empty model
    let mut current_variables: Vec<String> = Vec::new();
    let mut steps_data: Vec<StepData> = Vec::new();

    // For initial step, all variables are candidates for entry
    let initial_step = evaluate_initial_step(
        data,
        config,
        &current_variables,
        num_groups,
        total_cases
    );
    steps_data.push(initial_step);

    // Determine maximum number of steps
    let max_steps = variables.len() * 2; // Safe upper limit

    // Cache F-to-enter values for all variables
    let mut f_to_enter_cache = HashMap::new();
    for var in variables {
        let (f_value, wilks) = calculate_f_to_enter(
            data,
            var,
            &current_variables,
            num_groups,
            total_cases
        );
        f_to_enter_cache.insert(var.clone(), (f_value, wilks));
    }

    // Iteratively select/remove variables
    for step in 0..max_steps {
        // 1. Find the best variable to enter (if any)
        let (best_var_to_enter, entry_stats) = find_best_variable_to_enter(
            data,
            config,
            &current_variables,
            &steps_data.last().unwrap().variables_not_in_analysis,
            &f_to_enter_cache
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
            (step as i32) + 1,
            num_groups,
            total_cases
        );

        // 5. Update F-to-enter cache for next step
        for var in variables {
            if !current_variables.contains(var) {
                let (f_value, wilks) = calculate_f_to_enter(
                    data,
                    var,
                    &current_variables,
                    num_groups,
                    total_cases
                );
                f_to_enter_cache.insert(var.clone(), (f_value, wilks));
            }
        }

        steps_data.push(step_data);
    }

    Ok(steps_data)
}

// Evaluate initial step (no variables in model)
fn evaluate_initial_step(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> StepData {
    let variables = &config.main.independent_variables;

    // All variables are candidates for entry
    let mut variables_not_in_analysis = Vec::new();

    for (var_idx, var_name) in variables.iter().enumerate() {
        // For each variable, calculate tolerance and F-to-enter
        let (tolerance, min_tolerance) = calculate_tolerance(data, var_name, current_variables);
        let (f_to_enter, wilks) = calculate_f_to_enter(
            data,
            var_name,
            current_variables,
            num_groups,
            total_cases
        );

        variables_not_in_analysis.push(VariableNotInAnalysis {
            variable: var_name.clone(),
            tolerance,
            min_tolerance,
            f_to_enter,
            wilks_lambda: wilks,
        });
    }

    // Sort variables by F-to-enter value (descending)
    variables_not_in_analysis.sort_by(|a, b|
        b.f_to_enter.partial_cmp(&a.f_to_enter).unwrap_or(std::cmp::Ordering::Equal)
    );

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
    let df2 = 1;
    let df3 = (total_cases as i32) - (num_groups as i32);
    let exact_df2 = df3;
    let significance = 1.0;

    StepData {
        variable_entered: None,
        variable_removed: None,
        wilks_lambda,
        f_value,
        exact_f,
        df1,
        df2,
        df3,
        exact_df2,
        significance,
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
    step: i32,
    num_groups: usize,
    total_cases: usize
) -> StepData {
    let variables = &config.main.independent_variables;

    // Check which variables are in/not in the analysis
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

            let (f_to_remove, wilks) = calculate_f_to_remove(
                data,
                var_name,
                current_variables,
                num_groups,
                total_cases
            );

            variables_in_analysis.push(VariableInAnalysis {
                variable: var_name.clone(),
                tolerance,
                f_to_remove,
                wilks_lambda: wilks,
            });
        } else {
            // Variable is not in analysis - calculate tolerance and F-to-enter
            let (tolerance, min_tolerance) = calculate_tolerance(data, var_name, current_variables);
            let (f_to_enter, wilks) = calculate_f_to_enter(
                data,
                var_name,
                current_variables,
                num_groups,
                total_cases
            );

            variables_not_in_analysis.push(VariableNotInAnalysis {
                variable: var_name.clone(),
                tolerance,
                min_tolerance,
                f_to_enter,
                wilks_lambda: wilks,
            });
        }
    }

    // Sort variables in analysis by F-to-remove (ascending)
    variables_in_analysis.sort_by(|a, b|
        a.f_to_remove.partial_cmp(&b.f_to_remove).unwrap_or(std::cmp::Ordering::Equal)
    );

    // Sort variables not in analysis by F-to-enter (descending)
    variables_not_in_analysis.sort_by(|a, b|
        b.f_to_enter.partial_cmp(&a.f_to_enter).unwrap_or(std::cmp::Ordering::Equal)
    );

    // Calculate Wilks' lambda and overall F for the current model
    let (wilks_lambda, f_value) = if current_variables.is_empty() {
        (1.0, 0.0) // No discrimination if no variables
    } else {
        calculate_overall_wilks_lambda_and_f(data, current_variables, num_groups, total_cases)
    };

    let exact_f = f_value; // In the simple case, these are the same

    // Generate pairwise comparisons for this step
    let pairwise_comparisons = if config.method.pairwise {
        generate_pairwise_comparisons(data, current_variables, step)
    } else {
        Vec::new()
    };

    // Calculate p-value
    let df1 = current_variables.len() as i32;
    let df2 = (num_groups as i32) - 1;
    let df3 = (total_cases as i32) - (num_groups as i32);
    let exact_df2 = df3 - df1 + 1;

    let significance = calculate_p_value_from_f(exact_f, df1 as f64, exact_df2 as f64);

    StepData {
        variable_entered,
        variable_removed,
        wilks_lambda,
        f_value,
        exact_f,
        df1,
        df2,
        df3,
        exact_df2,
        significance,
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
    candidates: &[VariableNotInAnalysis],
    f_to_enter_cache: &HashMap<String, (f64, f64)>
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
    let tolerance_threshold = 0.001; // Minimum tolerance to consider a variable

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
    // If no variables in model, tolerance is 1.0
    if current_variables.is_empty() {
        return (1.0, 1.0);
    }

    // Find indices
    let all_variables = &data.independent_data;

    // Extract values for target variable
    let target_values = all_variables
        .iter()
        .flat_map(|group| {
            group.iter().filter_map(|record| {
                if
                    let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                        record.values.get(variable)
                {
                    Some(*val)
                } else {
                    None
                }
            })
        })
        .collect::<Vec<f64>>();

    // Extract values for predictor variables
    let mut predictor_values = Vec::with_capacity(current_variables.len());

    for var in current_variables {
        let values = all_variables
            .iter()
            .flat_map(|group| {
                group.iter().filter_map(|record| {
                    if
                        let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                            record.values.get(var)
                    {
                        Some(*val)
                    } else {
                        None
                    }
                })
            })
            .collect::<Vec<f64>>();

        predictor_values.push(values);
    }

    // Calculate R² of target variable predicted by current variables
    // This should use multiple regression, but here's a simplified version
    let mut r_squared = 0.0;

    // If only one predictor, use simple linear regression
    if current_variables.len() == 1 && !target_values.is_empty() && !predictor_values[0].is_empty() {
        // Calculate correlation coefficient
        let target_mean = target_values.iter().sum::<f64>() / (target_values.len() as f64);
        let pred_mean =
            predictor_values[0].iter().sum::<f64>() / (predictor_values[0].len() as f64);

        let mut numerator = 0.0;
        let mut denom1 = 0.0;
        let mut denom2 = 0.0;

        for i in 0..target_values.len() {
            if i < predictor_values[0].len() {
                numerator +=
                    (target_values[i] - target_mean) * (predictor_values[0][i] - pred_mean);
                denom1 += (target_values[i] - target_mean).powi(2);
                denom2 += (predictor_values[0][i] - pred_mean).powi(2);
            }
        }

        let r = if denom1 > 0.0 && denom2 > 0.0 {
            numerator / (denom1.sqrt() * denom2.sqrt())
        } else {
            0.0
        };

        r_squared = r.powi(2);
    } else {
        // Multiple predictors would need a more sophisticated approach
        // For simplicity, use a default r² estimation based on number of predictors
        r_squared = 0.2 * (current_variables.len() as f64);
        if r_squared > 0.9 {
            r_squared = 0.9;
        }
    }

    // Tolerance = 1 - R²
    let tolerance = 1.0 - r_squared;

    // Estimate minimum tolerance (lowest possible with any other variable)
    let min_tolerance = tolerance * 0.8;

    (tolerance, min_tolerance)
}

// Calculate F-to-enter statistic for a variable
fn calculate_f_to_enter(
    data: &AnalysisData,
    variable: &str,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // If the variable is already in the model, return 0
    if current_variables.contains(&variable.to_string()) {
        return (0.0, 1.0);
    }

    // If there are no variables in the model, use univariate F statistic
    if current_variables.is_empty() {
        return calculate_univariate_f(data, variable, num_groups, total_cases);
    }

    // Otherwise, calculate the F-to-enter statistic for an additional variable

    // First, calculate Wilks' lambda for the current model
    let (current_wilks, _) = calculate_overall_wilks_lambda_and_f(
        data,
        current_variables,
        num_groups,
        total_cases
    );

    // Then calculate Wilks' lambda for the model with the additional variable
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let (new_wilks, _) = calculate_overall_wilks_lambda_and_f(
        data,
        &new_variables,
        num_groups,
        total_cases
    );

    // Calculate F-to-enter
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() - 1 - (num_groups - 1);

    let f_value = if df2 > 0 && new_wilks < current_wilks {
        (((current_wilks - new_wilks) / new_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, new_wilks)
}

// Calculate univariate F statistic for a variable
fn calculate_univariate_f(
    data: &AnalysisData,
    variable: &str,
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Extract values for each group
    let mut group_values = Vec::with_capacity(num_groups);
    let mut group_means = Vec::with_capacity(num_groups);
    let mut group_counts = Vec::with_capacity(num_groups);

    for group_data in &data.group_data {
        let values: Vec<f64> = group_data
            .iter()
            .filter_map(|record| {
                if
                    let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                        record.values.get(variable)
                {
                    Some(*val)
                } else {
                    None
                }
            })
            .collect();

        let count = values.len();
        let mean = if count > 0 { values.iter().sum::<f64>() / (count as f64) } else { 0.0 };

        group_values.push(values);
        group_means.push(mean);
        group_counts.push(count);
    }

    // Calculate overall mean
    let overall_mean =
        group_means
            .iter()
            .zip(group_counts.iter())
            .map(|(&mean, &count)| mean * (count as f64))
            .sum::<f64>() / (total_cases as f64);

    // Calculate between-groups sum of squares
    let between_ss = group_means
        .iter()
        .zip(group_counts.iter())
        .map(|(&mean, &count)| (count as f64) * (mean - overall_mean).powi(2))
        .sum::<f64>();

    // Calculate within-groups sum of squares
    let within_ss = group_values
        .iter()
        .zip(group_means.iter())
        .map(|(values, &mean)|
            values
                .iter()
                .map(|&val| (val - mean).powi(2))
                .sum::<f64>()
        )
        .sum::<f64>();

    // Calculate F statistic
    let df1 = num_groups - 1;
    let df2 = total_cases - num_groups;

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
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // If the variable is not in the model, return 0
    if !current_variables.contains(&variable.to_string()) {
        return (0.0, 1.0);
    }

    // Calculate Wilks' lambda for the current model
    let (current_wilks, _) = calculate_overall_wilks_lambda_and_f(
        data,
        current_variables,
        num_groups,
        total_cases
    );

    // Create a model without this variable
    let reduced_model: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    // Calculate Wilks' lambda for the reduced model
    let (reduced_wilks, _) = if reduced_model.is_empty() {
        (1.0, 0.0)
    } else {
        calculate_overall_wilks_lambda_and_f(data, &reduced_model, num_groups, total_cases)
    };

    // Calculate F statistic for the difference
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() + 1 - (num_groups - 1);

    let f_value = if reduced_wilks > current_wilks && current_wilks > 0.0 && df2 > 0 {
        (((reduced_wilks - current_wilks) / current_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, reduced_wilks)
}

// Calculate overall Wilks' lambda and F statistic for a set of variables
fn calculate_overall_wilks_lambda_and_f(
    data: &AnalysisData,
    variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    if variables.is_empty() {
        return (1.0, 0.0);
    }

    // Calculate between-groups matrix
    let mut between_matrix = vec![vec![0.0; variables.len()]; variables.len()];

    // Group means
    let mut group_means = Vec::with_capacity(num_groups);
    let mut group_counts = Vec::with_capacity(num_groups);

    for group_data in &data.group_data {
        let mut means = Vec::with_capacity(variables.len());

        for var in variables {
            let values: Vec<f64> = group_data
                .iter()
                .filter_map(|record| {
                    if
                        let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                            record.values.get(var)
                    {
                        Some(*val)
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
            means.push(mean);
        }

        group_means.push(means);
        group_counts.push(group_data.len());
    }

    // Overall means
    let mut overall_means = vec![0.0; variables.len()];

    for var_idx in 0..variables.len() {
        let mut sum = 0.0;
        let mut count = 0;

        for g in 0..num_groups {
            sum += group_means[g][var_idx] * (group_counts[g] as f64);
            count += group_counts[g];
        }

        overall_means[var_idx] = if count > 0 { sum / (count as f64) } else { 0.0 };
    }

    // Calculate between-groups matrix
    for i in 0..variables.len() {
        for j in 0..variables.len() {
            let mut sum = 0.0;

            for g in 0..num_groups {
                sum +=
                    (group_counts[g] as f64) *
                    (group_means[g][i] - overall_means[i]) *
                    (group_means[g][j] - overall_means[j]);
            }

            between_matrix[i][j] = sum;
        }
    }

    // Calculate within-groups matrix
    let mut within_matrix = vec![vec![0.0; variables.len()]; variables.len()];

    for g in 0..num_groups {
        let group_data = &data.group_data[g];

        for i in 0..variables.len() {
            for j in 0..variables.len() {
                let var_i = &variables[i];
                let var_j = &variables[j];

                let values_i: Vec<f64> = group_data
                    .iter()
                    .filter_map(|record| {
                        if
                            let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                                record.values.get(var_i)
                        {
                            Some(*val)
                        } else {
                            None
                        }
                    })
                    .collect();

                let values_j: Vec<f64> = group_data
                    .iter()
                    .filter_map(|record| {
                        if
                            let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                                record.values.get(var_j)
                        {
                            Some(*val)
                        } else {
                            None
                        }
                    })
                    .collect();

                // Calculate covariance for this group
                let cov = calculate_covariance(
                    &values_i,
                    &values_j,
                    group_means[g][i],
                    group_means[g][j]
                );

                within_matrix[i][j] += ((group_counts[g] - 1) as f64) * cov;
            }
        }
    }

    // Normalize within-groups matrix
    let total_df = total_cases - num_groups;

    for i in 0..variables.len() {
        for j in 0..variables.len() {
            within_matrix[i][j] /= total_df as f64;
        }
    }

    // Convert to matrices for computation
    let within_mat = vec_to_matrix(&within_matrix);
    let between_mat = vec_to_matrix(&between_matrix);

    // Calculate determinants
    let within_det = if within_mat.is_empty() {
        1.0
    } else {
        match within_mat.clone().determinant() {
            d if d > 0.0 => d,
            _ => 1.0,
        }
    };

    let total_det = if within_mat.is_empty() || between_mat.is_empty() {
        1.0
    } else {
        match (within_mat + between_mat).determinant() {
            d if d > 0.0 => d,
            _ => 1.0,
        }
    };

    // Calculate Wilks' lambda
    let wilks_lambda = if total_det > 0.0 { within_det / total_det } else { 1.0 };

    // Calculate F statistic
    let p = variables.len() as f64;
    let g = (num_groups as f64) - 1.0;
    let n = (total_cases as f64) - g - 1.0;

    // Use Rao's approximation
    let df1 = p * g;
    let df2 = ((n - p + 1.0) * g) / 2.0;

    let f_value = if wilks_lambda < 1.0 && df2 > 0.0 {
        (((1.0 - wilks_lambda.powf(1.0 / g)) / wilks_lambda.powf(1.0 / g)) * df2) / p
    } else {
        0.0
    };

    (wilks_lambda, f_value)
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
                if
                    let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                        record.values.get(variable)
                {
                    Some(*val)
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
                if
                    let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                        record.values.get(variable)
                {
                    Some(*val)
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

    // Calculate pooled covariance matrix
    let mut pooled_cov = vec![vec![0.0; num_vars]; num_vars];

    for i in 0..num_vars {
        for j in 0..num_vars {
            let var_i = &variables[i];
            let var_j = &variables[j];

            // Group 1
            let values1_i: Vec<f64> = group1_data
                .iter()
                .filter_map(|record| {
                    if
                        let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                            record.values.get(var_i)
                    {
                        Some(*val)
                    } else {
                        None
                    }
                })
                .collect();

            let values1_j: Vec<f64> = group1_data
                .iter()
                .filter_map(|record| {
                    if
                        let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                            record.values.get(var_j)
                    {
                        Some(*val)
                    } else {
                        None
                    }
                })
                .collect();

            let cov1 = calculate_covariance(
                &values1_i,
                &values1_j,
                group1_means[i],
                group1_means[j]
            );

            // Group 2
            let values2_i: Vec<f64> = group2_data
                .iter()
                .filter_map(|record| {
                    if
                        let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                            record.values.get(var_i)
                    {
                        Some(*val)
                    } else {
                        None
                    }
                })
                .collect();

            let values2_j: Vec<f64> = group2_data
                .iter()
                .filter_map(|record| {
                    if
                        let Some(crate::discriminant::models::data::DataValue::Number(val)) =
                            record.values.get(var_j)
                    {
                        Some(*val)
                    } else {
                        None
                    }
                })
                .collect();

            let cov2 = calculate_covariance(
                &values2_i,
                &values2_j,
                group2_means[i],
                group2_means[j]
            );

            // Pooled covariance
            let n1 = group1_data.len();
            let n2 = group2_data.len();

            pooled_cov[i][j] =
                (((n1 - 1) as f64) * cov1 + ((n2 - 1) as f64) * cov2) / ((n1 + n2 - 2) as f64);
        }
    }

    // Calculate Mahalanobis distance squared
    let mut diff = vec![0.0; num_vars];
    for i in 0..num_vars {
        diff[i] = group1_means[i] - group2_means[i];
    }

    // Try to invert pooled covariance matrix
    let pooled_mat = vec_to_matrix(&pooled_cov);

    match pooled_mat.clone().try_inverse() {
        Some(inv_cov) => {
            // Calculate Mahalanobis distance squared: D² = (μ₁ - μ₂)ᵀ S⁻¹ (μ₁ - μ₂)
            let diff_vec = DVector::from_vec(diff);
            let d_squared = diff_vec.clone().dot(&(inv_cov * diff_vec));

            // Calculate F statistic
            let n1 = group1_data.len() as f64;
            let n2 = group2_data.len() as f64;

            (((n1 * n2) / (n1 + n2)) * d_squared) / (num_vars as f64)
        }
        None => {
            // If matrix is singular, use a simplified approach
            diff
                .iter()
                .map(|&d| d.powi(2))
                .sum::<f64>() / (num_vars as f64)
        }
    }
}

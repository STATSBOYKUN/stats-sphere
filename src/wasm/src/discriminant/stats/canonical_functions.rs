use std::collections::HashMap;
use nalgebra::DMatrix;
use crate::discriminant::stats::stepwise::stepwise_statistics::calculate_stepwise_statistics;

use crate::discriminant::models::{
    result::CanonicalFunctions,
    data::DataValue,
    AnalysisData,
    DiscriminantConfig,
    DataRecord,
};

pub fn calculate_canonical_functions(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CanonicalFunctions, String> {
    web_sys::console::log_1(&"Executing calculate_canonical_functions".into());

    // Check for stepwise analysis and get variables to use
    let variables_to_use = if config.main.stepwise {
        // Try to get final variables from stepwise analysis
        get_stepwise_selected_variables(data, config)?
    } else {
        // Use all specified independent variables
        config.main.independent_variables.clone()
    };

    let grouping_variable = &config.main.grouping_variable;

    // Extract grouped data and unique groups first
    let (grouped_data, unique_groups) = extract_grouped_data(
        data,
        grouping_variable,
        &variables_to_use
    );

    // Number of discriminant functions is min(number of unique groups - 1, number of variables)
    let num_groups = unique_groups.len();
    let num_vars = variables_to_use.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for canonical functions".to_string());
    }

    // Calculate group means
    let group_means = calculate_group_means_for_variables(
        &grouped_data,
        &unique_groups,
        &variables_to_use
    );

    // Calculate overall means
    let overall_means = calculate_overall_means(&grouped_data, &unique_groups, &variables_to_use);

    // Calculate pooled within-groups matrix
    let pooled_within = calculate_pooled_within_matrix(&grouped_data, &variables_to_use);

    // Calculate between-groups matrix
    let between_groups = calculate_between_groups_matrix(
        &grouped_data,
        &group_means,
        &variables_to_use
    );

    // Solve eigenvalue problem
    let (eigenvalues, eigenvectors) = solve_eigenvalue_problem(
        &pooled_within,
        &between_groups,
        num_functions
    );

    // Calculate variance statistics
    let (variance_percentage, cumulative_percentage) = calculate_variance_percentages(&eigenvalues);

    // Calculate canonical correlations
    let canonical_correlation: Vec<f64> = eigenvalues
        .iter()
        .map(|&eigen| {
            let corr = (eigen / (1.0 + eigen)).sqrt();
            if corr.is_nan() {
                0.0
            } else {
                corr
            }
        })
        .collect();

    // Process coefficients, standardized coefficients, and constants
    let (coefficients, standardized_coefficients) = process_discriminant_coefficients(
        &eigenvectors,
        &variables_to_use,
        &pooled_within,
        &overall_means,
        num_functions
    );

    // Calculate function at group centroids
    let function_at_centroids = calculate_function_at_group_centroids(
        &group_means,
        &eigenvectors,
        &overall_means,
        &variables_to_use,
        num_functions
    );

    Ok(CanonicalFunctions {
        eigenvalues,
        variance_percentage,
        cumulative_percentage,
        canonical_correlation,
        coefficients,
        standardized_coefficients,
        function_at_centroids,
    })
}

fn extract_grouped_data(
    data: &AnalysisData,
    grouping_variable: &str,
    independent_variables: &[String]
) -> (HashMap<String, HashMap<String, Vec<f64>>>, Vec<String>) {
    let flattened_group_data: Vec<&DataRecord> = data.group_data
        .iter()
        .flat_map(|records| records.iter())
        .collect();

    let mut record_groups: HashMap<usize, String> = HashMap::new();
    let mut unique_groups = Vec::new();

    for (i, record) in flattened_group_data.iter().enumerate() {
        for (key, value) in &record.values {
            if key == grouping_variable {
                let group_label = match value {
                    DataValue::Number(num) => num.to_string(),
                    DataValue::Text(text) => text.clone(),
                    _ => {
                        continue;
                    }
                };

                record_groups.insert(i, group_label.clone());

                if !unique_groups.contains(&group_label) {
                    unique_groups.push(group_label);
                }

                break;
            }
        }
    }

    // Sort the groups for consistent results
    unique_groups.sort();

    // Group data by group and variable
    let mut grouped_data: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();

    for group in &unique_groups {
        grouped_data.insert(group.clone(), HashMap::new());
        for variable in independent_variables {
            grouped_data.get_mut(group).unwrap().insert(variable.clone(), Vec::new());
        }
    }

    // Collect data for each group and variable
    for (var_idx, variable) in independent_variables.iter().enumerate() {
        if var_idx >= data.independent_data.len() {
            continue;
        }

        let var_records = &data.independent_data[var_idx];

        for (i, record) in var_records.iter().enumerate() {
            if let Some(group) = record_groups.get(&i) {
                if let Some(DataValue::Number(value)) = record.values.get(variable) {
                    grouped_data.get_mut(group).unwrap().get_mut(variable).unwrap().push(*value);
                }
            }
        }
    }

    (grouped_data, unique_groups)
}

fn calculate_group_means_for_variables(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    unique_groups: &[String],
    independent_variables: &[String]
) -> HashMap<String, HashMap<String, f64>> {
    let mut group_means: HashMap<String, HashMap<String, f64>> = HashMap::new();

    for group in unique_groups {
        group_means.insert(group.clone(), HashMap::new());

        for variable in independent_variables {
            let values = &grouped_data[group][variable];
            if !values.is_empty() {
                let mean = values.iter().sum::<f64>() / (values.len() as f64);
                group_means.get_mut(group).unwrap().insert(variable.clone(), mean);
            } else {
                group_means.get_mut(group).unwrap().insert(variable.clone(), 0.0);
            }
        }
    }

    group_means
}

fn calculate_pooled_within_matrix(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    independent_variables: &[String]
) -> DMatrix<f64> {
    let num_vars = independent_variables.len();
    let mut pooled_within = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0.0;

    for (group, group_vars) in grouped_data {
        let n = if let Some(values) = group_vars.get(&independent_variables[0]) {
            values.len()
        } else {
            continue;
        };

        if n <= 1 {
            continue;
        }

        let df = (n - 1) as f64;
        total_df += df;

        // Calculate group means
        let group_means: HashMap<String, f64> = independent_variables
            .iter()
            .map(|var| {
                let values = &group_vars[var];
                let mean = if values.is_empty() {
                    0.0
                } else {
                    values.iter().sum::<f64>() / (values.len() as f64)
                };
                (var.clone(), mean)
            })
            .collect();

        // Calculate group covariance matrix
        for (i, var1) in independent_variables.iter().enumerate() {
            for (j, var2) in independent_variables.iter().enumerate() {
                let values1 = &group_vars[var1];
                let values2 = &group_vars[var2];

                if values1.is_empty() || values2.is_empty() {
                    continue;
                }

                let mean1 = group_means[var1];
                let mean2 = group_means[var2];

                let mut cov_sum = 0.0;
                let min_len = std::cmp::min(values1.len(), values2.len());
                for k in 0..min_len {
                    cov_sum += (values1[k] - mean1) * (values2[k] - mean2);
                }

                let group_cov = cov_sum / df;
                pooled_within[(i, j)] += df * group_cov;
            }
        }
    }

    if total_df > 0.0 {
        pooled_within /= total_df;
    }

    // Add small regularization to ensure invertibility
    let epsilon = 1e-8;
    for i in 0..num_vars {
        pooled_within[(i, i)] += epsilon;
    }

    pooled_within
}

fn calculate_between_groups_matrix(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_means: &HashMap<String, HashMap<String, f64>>,
    independent_variables: &[String]
) -> DMatrix<f64> {
    let num_vars = independent_variables.len();
    let mut between_groups = DMatrix::zeros(num_vars, num_vars);

    // Calculate overall means
    let mut overall_means = HashMap::new();
    let mut total_cases = 0.0;

    for variable in independent_variables {
        let mut total_value = 0.0;
        let mut count = 0.0;

        for (group, group_vars) in grouped_data {
            if let Some(values) = group_vars.get(variable) {
                let n = values.len() as f64;
                if n > 0.0 {
                    let mean = group_means[group][variable];
                    total_value += mean * n;
                    count += n;
                }
            }
        }

        overall_means.insert(variable.clone(), if count > 0.0 { total_value / count } else { 0.0 });
        total_cases = count;
    }

    // Calculate between-groups matrix
    for (group, _) in grouped_data {
        let n = if let Some(values) = grouped_data[group].get(&independent_variables[0]) {
            values.len() as f64
        } else {
            continue;
        };

        for (i, var1) in independent_variables.iter().enumerate() {
            for (j, var2) in independent_variables.iter().enumerate() {
                let diff1 = group_means[group][var1] - overall_means[var1];
                let diff2 = group_means[group][var2] - overall_means[var2];
                between_groups[(i, j)] += n * diff1 * diff2;
            }
        }
    }

    between_groups
}

fn solve_eigenvalue_problem(
    w: &DMatrix<f64>,
    b: &DMatrix<f64>,
    num_functions: usize
) -> (Vec<f64>, Vec<Vec<f64>>) {
    let n = w.nrows();

    // Try to invert W
    let w_inv = match w.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // Regularize W if it's singular
            let epsilon = 1e-8;
            let w_reg = w + &DMatrix::identity(n, n) * epsilon;
            match w_reg.try_inverse() {
                Some(inv) => inv,
                None => {
                    web_sys::console::log_1(&"Error: W matrix is singular".into());
                    return (vec![0.0; num_functions], vec![vec![0.0; num_functions]; n]);
                }
            }
        }
    };

    // Compute W^(-1) * B
    let wb = &w_inv * b;

    // Symmetrize the matrix for better numerical stability
    let wb_sym = (&wb + &wb.transpose()) / 2.0;

    // Use SVD for eigenvalue decomposition
    let svd = nalgebra::SVD::new(wb_sym.clone(), true, true);

    // Extract eigenvalues (singular values)
    let mut eigenvalues: Vec<f64> = svd.singular_values
        .iter()
        .map(|&s| s)
        .collect();

    // Sort in descending order
    eigenvalues.sort_by(|a, b| b.partial_cmp(a).unwrap_or(std::cmp::Ordering::Equal));

    // Truncate to num_functions
    eigenvalues.truncate(num_functions);

    // Extract eigenvectors
    let mut eigenvectors = vec![vec![0.0; num_functions]; n];

    // Handle the Option<Matrix> for SVD.u
    if let Some(u_matrix) = &svd.u {
        for i in 0..n {
            for j in 0..std::cmp::min(num_functions, u_matrix.ncols()) {
                eigenvectors[i][j] = u_matrix[(i, j)];
            }
        }
    }

    // Ensure we have enough eigenvalues
    while eigenvalues.len() < num_functions {
        eigenvalues.push(0.0);
    }

    (eigenvalues, eigenvectors)
}

fn process_discriminant_coefficients(
    eigenvectors: &Vec<Vec<f64>>,
    variables: &[String],
    pooled_within: &DMatrix<f64>,
    overall_means: &HashMap<String, f64>,
    num_functions: usize
) -> (HashMap<String, Vec<f64>>, HashMap<String, Vec<f64>>) {
    let num_vars = variables.len();

    // Extract standard deviations for standardization
    let std_devs: Vec<f64> = (0..num_vars).map(|i| pooled_within[(i, i)].sqrt()).collect();

    // Unstandardized coefficients
    let mut coefficients: HashMap<String, Vec<f64>> = variables
        .iter()
        .enumerate()
        .map(|(var_idx, var)| {
            let coef_values: Vec<f64> = if var_idx < eigenvectors.len() {
                (0..num_functions)
                    .map(|func_idx| (
                        if func_idx < eigenvectors[var_idx].len() {
                            eigenvectors[var_idx][func_idx]
                        } else {
                            0.0
                        }
                    ))
                    .collect()
            } else {
                vec![0.0; num_functions]
            };
            (var.clone(), coef_values)
        })
        .collect();

    // Standardized coefficients
    let standardized_coefficients: HashMap<String, Vec<f64>> = variables
        .iter()
        .enumerate()
        .map(|(var_idx, var)| {
            let std_dev = if var_idx < std_devs.len() { std_devs[var_idx] } else { 1.0 };
            let std_coef_values: Vec<f64> = if var_idx < eigenvectors.len() {
                (0..num_functions)
                    .map(|func_idx| {
                        if func_idx < eigenvectors[var_idx].len() && std_dev > 0.0 {
                            eigenvectors[var_idx][func_idx] * std_dev
                        } else {
                            0.0
                        }
                    })
                    .collect()
            } else {
                vec![0.0; num_functions]
            };
            (var.clone(), std_coef_values)
        })
        .collect();

    // Calculate constants for each function and add to coefficients
    let mut constants = Vec::with_capacity(num_functions);

    for func_idx in 0..num_functions {
        let mut constant = 0.0;

        // Calculate constant as negative of sum(coefficient * mean) for all variables
        for (var_idx, var) in variables.iter().enumerate() {
            if let Some(coef_values) = coefficients.get(var) {
                if func_idx < coef_values.len() {
                    let coef = coef_values[func_idx];
                    let mean = overall_means.get(var).copied().unwrap_or(0.0);
                    constant -= coef * mean;
                }
            }
        }

        constants.push(constant);
    }

    // Add constants to the coefficients map with the key "(Constant)"
    coefficients.insert("(Constant)".to_string(), constants);

    (coefficients, standardized_coefficients)
}

fn get_stepwise_selected_variables(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<Vec<String>, String> {
    // If stepwise mode is not enabled, return all variables
    if !config.main.stepwise {
        return Ok(config.main.independent_variables.clone());
    }

    // Calculate stepwise statistics to get the final selected variables
    match calculate_stepwise_statistics(data, config) {
        Ok(stepwise_stats) => {
            // Get the variables in the final step
            let final_step = stepwise_stats.variables_in_analysis
                .keys()
                .map(|k| k.parse::<i32>().unwrap_or(0))
                .max()
                .unwrap_or(0)
                .to_string();

            if let Some(vars_in_model) = stepwise_stats.variables_in_analysis.get(&final_step) {
                let selected_vars: Vec<String> = vars_in_model
                    .iter()
                    .map(|v| v.variable.clone())
                    .collect();

                if selected_vars.is_empty() {
                    // If no variables selected, return all variables
                    Ok(config.main.independent_variables.clone())
                } else {
                    Ok(selected_vars)
                }
            } else {
                // If no final step found, return all variables
                Ok(config.main.independent_variables.clone())
            }
        }
        Err(_) => {
            // If stepwise analysis fails, use all variables
            Ok(config.main.independent_variables.clone())
        }
    }
}

fn calculate_overall_means(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    unique_groups: &[String],
    variables: &[String]
) -> HashMap<String, f64> {
    let mut overall_means = HashMap::new();
    let mut total_counts = HashMap::new();

    for variable in variables {
        let mut sum = 0.0;
        let mut count = 0;

        for group in unique_groups {
            if let Some(values) = grouped_data.get(group).and_then(|g| g.get(variable)) {
                sum += values.iter().sum::<f64>();
                count += values.len();
            }
        }

        if count > 0 {
            overall_means.insert(variable.clone(), sum / (count as f64));
            total_counts.insert(variable.clone(), count);
        } else {
            overall_means.insert(variable.clone(), 0.0);
            total_counts.insert(variable.clone(), 0);
        }
    }

    overall_means
}

fn calculate_function_at_group_centroids(
    group_means: &HashMap<String, HashMap<String, f64>>,
    eigenvectors: &Vec<Vec<f64>>,
    overall_means: &HashMap<String, f64>,
    variables: &[String],
    num_functions: usize
) -> HashMap<String, Vec<f64>> {
    let num_vars = variables.len();
    let mut function_at_centroids = HashMap::new();

    for (group, means) in group_means {
        // Calculate centroid values for each function
        let mut centroid_values = vec![0.0; num_functions];

        for (func_idx, function_values) in centroid_values
            .iter_mut()
            .enumerate()
            .take(num_functions) {
            // First add constant (negative sum of coefficient * overall_mean)
            let mut constant = 0.0;
            for (var_idx, variable) in variables.iter().enumerate().take(num_vars) {
                if var_idx < eigenvectors.len() && func_idx < eigenvectors[var_idx].len() {
                    constant -=
                        eigenvectors[var_idx][func_idx] *
                        overall_means.get(variable).copied().unwrap_or(0.0);
                }
            }

            *function_values = constant;

            // Then add variable contributions
            for (var_idx, variable) in variables.iter().enumerate().take(num_vars) {
                if var_idx < eigenvectors.len() && func_idx < eigenvectors[var_idx].len() {
                    *function_values +=
                        means.get(variable).copied().unwrap_or(0.0) *
                        eigenvectors[var_idx][func_idx];
                }
            }
        }

        function_at_centroids.insert(group.clone(), centroid_values);
    }

    function_at_centroids
}

fn calculate_variance_percentages(eigenvalues: &[f64]) -> (Vec<f64>, Vec<f64>) {
    let total_eigenvalue: f64 = eigenvalues.iter().sum();

    let variance_percentage: Vec<f64> = if total_eigenvalue > 0.0 {
        eigenvalues
            .iter()
            .map(|&eigen| (100.0 * eigen) / total_eigenvalue)
            .collect()
    } else {
        vec![100.0 / eigenvalues.len() as f64; eigenvalues.len()]
    };

    let mut cumulative_percentage = Vec::with_capacity(eigenvalues.len());
    let mut cumsum = 0.0;
    for percent in &variance_percentage {
        cumsum += percent;
        cumulative_percentage.push(cumsum);
    }

    (variance_percentage, cumulative_percentage)
}

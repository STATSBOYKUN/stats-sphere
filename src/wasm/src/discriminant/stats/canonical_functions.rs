// canonical_functions.rs
use std::collections::HashMap;
use nalgebra::{ DMatrix, DVector };

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

    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;

    // Extract grouped data and unique groups first
    let (grouped_data, unique_groups) = extract_grouped_data(
        data,
        grouping_variable,
        independent_variables
    );

    // Number of discriminant functions is min(number of unique groups - 1, number of variables)
    let num_groups = unique_groups.len();
    let num_vars = independent_variables.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for canonical functions".to_string());
    }

    // Group data extraction and processing (similar to group_statistics.rs)
    let (grouped_data, unique_groups) = extract_grouped_data(
        data,
        grouping_variable,
        independent_variables
    );
    let group_means = calculate_group_means_for_variables(
        &grouped_data,
        &unique_groups,
        independent_variables
    );

    // Calculate pooled within-groups matrix
    let pooled_within = calculate_pooled_within_matrix(&grouped_data, independent_variables);

    // Calculate between-groups matrix
    let between_groups = calculate_between_groups_matrix(
        &grouped_data,
        &group_means,
        independent_variables
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

    // Process coefficients and standardized coefficients
    let (coefficients, standardized_coefficients) = process_discriminant_coefficients(
        &eigenvectors,
        independent_variables,
        &pooled_within,
        num_functions
    );

    // Calculate function at group centroids
    let function_at_centroids = calculate_function_at_group_centroids(
        &group_means,
        &eigenvectors,
        independent_variables,
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

// Extract grouped data similar to group_statistics.rs approach
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

// Calculate group means for variables
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
            }
        }
    }

    group_means
}

// Calculate pooled within-groups matrix
fn calculate_pooled_within_matrix(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    independent_variables: &[String]
) -> DMatrix<f64> {
    let num_vars = independent_variables.len();
    let mut pooled_within = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    for (group, group_vars) in grouped_data {
        let n = group_vars[&independent_variables[0]].len();
        if n <= 1 {
            continue;
        }

        let df = n - 1;
        total_df += df;

        // Calculate group means
        let group_means: HashMap<String, f64> = independent_variables
            .iter()
            .map(|var| {
                let values = &group_vars[var];
                let mean = values.iter().sum::<f64>() / (values.len() as f64);
                (var.clone(), mean)
            })
            .collect();

        // Calculate group covariance matrix
        for (i, var1) in independent_variables.iter().enumerate() {
            for (j, var2) in independent_variables.iter().enumerate() {
                let values1 = &group_vars[var1];
                let values2 = &group_vars[var2];
                let mean1 = group_means[var1];
                let mean2 = group_means[var2];

                let mut cov_sum = 0.0;
                for k in 0..values1.len() {
                    cov_sum += (values1[k] - mean1) * (values2[k] - mean2);
                }

                let group_cov = cov_sum / (df as f64);
                pooled_within[(i, j)] += (df as f64) * group_cov;
            }
        }
    }

    if total_df > 0 {
        pooled_within /= total_df as f64;
    }

    pooled_within
}

// Calculate between-groups matrix
fn calculate_between_groups_matrix(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_means: &HashMap<String, HashMap<String, f64>>,
    independent_variables: &[String]
) -> DMatrix<f64> {
    let num_vars = independent_variables.len();
    let mut between_groups = DMatrix::zeros(num_vars, num_vars);
    let mut total_cases = 0.0;

    // Calculate overall means
    let mut overall_means = Vec::with_capacity(num_vars);
    for (var_idx, variable) in independent_variables.iter().enumerate() {
        let mut total_value = 0.0;
        let mut count = 0.0;

        for (group, group_vars) in grouped_data {
            let n = group_vars[variable].len();
            let mean = group_means[group][variable];
            total_value += mean * (n as f64);
            count += n as f64;
        }

        overall_means.push(total_value / count);
        total_cases = count;
    }

    // Calculate between-groups matrix
    for (group, group_vars) in grouped_data {
        let n = group_vars[&independent_variables[0]].len();
        let group_means_this = &group_means[group];

        let mut diff = DVector::zeros(num_vars);
        for (var_idx, variable) in independent_variables.iter().enumerate() {
            diff[var_idx] = group_means_this[variable] - overall_means[var_idx];
        }

        between_groups += diff.clone() * diff.transpose() * (n as f64);
    }

    between_groups
}

// Process discriminant coefficients
fn process_discriminant_coefficients(
    eigenvectors: &Vec<Vec<f64>>,
    independent_variables: &[String],
    pooled_within: &DMatrix<f64>,
    num_functions: usize
) -> (HashMap<String, Vec<f64>>, HashMap<String, Vec<f64>>) {
    let num_vars = independent_variables.len();

    // Extract standard deviations for standardization
    let std_devs: Vec<f64> = (0..num_vars).map(|i| pooled_within[(i, i)].sqrt()).collect();

    // Unstandardized coefficients
    let coefficients: HashMap<String, Vec<f64>> = independent_variables
        .iter()
        .enumerate()
        .map(|(var_idx, var)| {
            let coef_values: Vec<f64> = (0..num_functions)
                .map(|func_idx| eigenvectors[var_idx][func_idx])
                .collect();
            (var.clone(), coef_values)
        })
        .collect();

    // Standardized coefficients
    let standardized_coefficients: HashMap<String, Vec<f64>> = independent_variables
        .iter()
        .enumerate()
        .map(|(var_idx, var)| {
            let std_dev = std_devs[var_idx];
            let std_coef_values: Vec<f64> = (0..num_functions)
                .map(|func_idx| {
                    if std_dev > 0.0 { eigenvectors[var_idx][func_idx] * std_dev } else { 0.0 }
                })
                .collect();
            (var.clone(), std_coef_values)
        })
        .collect();

    (coefficients, standardized_coefficients)
}

// Calculate function at group centroids
fn calculate_function_at_group_centroids(
    group_means: &HashMap<String, HashMap<String, f64>>,
    eigenvectors: &Vec<Vec<f64>>,
    independent_variables: &[String],
    num_functions: usize
) -> HashMap<String, Vec<f64>> {
    let num_vars = independent_variables.len();

    let mut function_at_centroids = HashMap::new();

    for (group_idx, (group, means)) in group_means.iter().enumerate() {
        // Get mean values for this group
        let group_means_vec: Vec<f64> = independent_variables
            .iter()
            .map(|var| means[var])
            .collect();

        // Calculate centroid values for each function
        let mut centroid_values = Vec::with_capacity(num_functions);
        for func_idx in 0..num_functions {
            let mut value = 0.0;
            for var_idx in 0..num_vars {
                value += group_means_vec[var_idx] * eigenvectors[var_idx][func_idx];
            }
            centroid_values.push(value);
        }

        function_at_centroids.insert(group.clone(), centroid_values);
    }

    function_at_centroids
}

// Placeholder for solve_eigenvalue_problem (to be implemented)
fn solve_eigenvalue_problem(
    w: &DMatrix<f64>,
    b: &DMatrix<f64>,
    num_functions: usize
) -> (Vec<f64>, Vec<Vec<f64>>) {
    // Implementation depends on your specific requirements
    // This is a stub that needs to be replaced with actual eigenvalue solving logic
    (vec![0.0; num_functions], vec![vec![0.0; num_functions]; w.nrows()])
}

// Calculate variance percentages
fn calculate_variance_percentages(eigenvalues: &[f64]) -> (Vec<f64>, Vec<f64>) {
    let total_eigenvalue: f64 = eigenvalues.iter().sum();

    let variance_percentage: Vec<f64> = if total_eigenvalue > 0.0 {
        eigenvalues
            .iter()
            .map(|&eigen| (100.0 * eigen) / total_eigenvalue)
            .collect()
    } else {
        vec![100.0; eigenvalues.len()]
    };

    let mut cumulative_percentage = Vec::with_capacity(eigenvalues.len());
    let mut cumsum = 0.0;
    for percent in &variance_percentage {
        cumsum += percent;
        cumulative_percentage.push(cumsum);
    }

    (variance_percentage, cumulative_percentage)
}

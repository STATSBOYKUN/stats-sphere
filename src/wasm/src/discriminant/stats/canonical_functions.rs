use std::collections::HashMap;

use crate::discriminant::models::{ result::CanonicalFunctions, AnalysisData, DiscriminantConfig };
use crate::discriminant::util::{
    calculate_covariance,
    calculate_pooled_within_matrix,
    calculate_between_groups_matrix,
    solve_eigenvalue_problem,
};

pub fn calculate_canonical_functions(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CanonicalFunctions, String> {
    web_sys::console::log_1(&"Executing calculate_canonical_functions".into());

    // Number of discriminant functions is min(number of groups - 1, number of variables)
    let num_groups = data.group_data.len();
    let num_vars = config.main.independent_variables.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for canonical functions".to_string());
    }

    // Calculate within-groups covariance matrix (W)
    let pooled_within = calculate_pooled_within_matrix(data, num_vars);

    // Calculate between-groups covariance matrix (B)
    let between_groups = calculate_between_groups_matrix(data, num_vars);

    // Solve the eigenvalue problem: (W^-1 * B) * V = λ * V
    // In practice, we would use a linear algebra library for this
    let (eigenvalues, eigenvectors) = solve_eigenvalue_problem(
        &pooled_within,
        &between_groups,
        num_functions
    );

    // Calculate variance percentages
    let total_eigenvalue: f64 = eigenvalues.iter().sum();
    let variance_percentage: Vec<f64> = eigenvalues
        .iter()
        .map(|&eigen| (100.0 * eigen) / total_eigenvalue)
        .collect();

    // Calculate cumulative percentages
    let mut cumulative_percentage = Vec::with_capacity(num_functions);
    let mut cumsum = 0.0;
    for percent in &variance_percentage {
        cumsum += percent;
        cumulative_percentage.push(cumsum);
    }

    // Calculate canonical correlations
    let canonical_correlation: Vec<f64> = eigenvalues
        .iter()
        .map(|&eigen| (eigen / (1.0 + eigen)).sqrt())
        .collect();

    // Variables names
    let variables = config.main.independent_variables.clone();

    // Calculate unstandardized coefficients
    let mut coefficients = HashMap::new();
    for (i, var) in variables.iter().enumerate() {
        let mut coef_values = Vec::with_capacity(num_functions);
        for j in 0..num_functions {
            coef_values.push(eigenvectors[i][j]);
        }
        coefficients.insert(var.clone(), coef_values);
    }

    // Calculate standardized coefficients
    let mut standardized_coefficients = HashMap::new();
    for (i, var) in variables.iter().enumerate() {
        let mut std_coef_values = Vec::with_capacity(num_functions);
        for j in 0..num_functions {
            let std_dev = pooled_within[i][i].sqrt();
            std_coef_values.push(eigenvectors[i][j] * std_dev);
        }
        standardized_coefficients.insert(var.clone(), std_coef_values);
    }

    // Calculate functions at group centroids
    let mut function_at_centroids = HashMap::new();
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        let group_name = (group_idx + 1).to_string();

        // Calculate group means
        let mut group_means = Vec::with_capacity(num_vars);
        for var_idx in 0..num_vars {
            let values: Vec<f64> = group_data
                .iter()
                .map(|case| case[var_idx])
                .collect();

            let mean = if values.is_empty() {
                0.0
            } else {
                values.iter().sum::<f64>() / (values.len() as f64)
            };
            group_means.push(mean);
        }

        // Apply discriminant functions to get centroids
        let mut centroid_values = Vec::with_capacity(num_functions);
        for func_idx in 0..num_functions {
            let mut value = 0.0;
            for var_idx in 0..num_vars {
                value += group_means[var_idx] * eigenvectors[var_idx][func_idx];
            }
            centroid_values.push(value);
        }

        function_at_centroids.insert(group_name, centroid_values);
    }

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

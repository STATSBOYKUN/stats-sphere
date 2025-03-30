use std::collections::HashMap;

use crate::discriminant::models::{ result::StructureMatrix, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    calculate_pooled_within_matrix,
    calculate_between_groups_matrix,
    solve_eigenvalue_problem,
    extract_values_by_index,
    extract_group_values,
    calculate_group_means,
};

pub fn calculate_structure_matrix(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StructureMatrix, String> {
    web_sys::console::log_1(&"Executing calculate_structure_matrix".into());

    let variables = config.main.independent_variables.clone();
    let num_vars = variables.len();

    // Number of discriminant functions
    let num_groups = data.group_data.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for structure matrix".to_string());
    }

    // Calculate pooled within-groups covariance matrix
    let pooled_within = calculate_pooled_within_matrix(data, &variables);

    // Calculate between-groups covariance matrix
    let between_groups = calculate_between_groups_matrix(data, &variables);

    // Calculate eigenvectors of W^-1 * B
    let (_, eigenvectors) = solve_eigenvalue_problem(
        &pooled_within,
        &between_groups,
        num_functions
    );

    // Calculate total covariance matrix
    let total_cov = calculate_total_covariance_matrix(data, &variables);

    // Calculate within-groups correlation matrix
    let within_corr = calculate_correlation_matrix(&pooled_within);

    // Calculate structure matrix (pooled within-groups correlations)
    let mut correlations = HashMap::new();

    for (i, var) in variables.iter().enumerate() {
        let mut corr_values = Vec::with_capacity(num_functions);

        for j in 0..num_functions {
            // Calculate correlation between variable i and discriminant function j
            let mut correlation = 0.0;

            for k in 0..num_vars {
                correlation += within_corr[i][k] * eigenvectors[k][j];
            }

            corr_values.push(correlation);
        }

        correlations.insert(var.clone(), corr_values);
    }

    // Sort variables by magnitude of correlation with first function
    let mut sorted_variables = variables.clone();
    sorted_variables.sort_by(|a, b| {
        let corr_a = correlations.get(a).unwrap()[0].abs();
        let corr_b = correlations.get(b).unwrap()[0].abs();
        corr_b.partial_cmp(&corr_a).unwrap() // Sort by descending absolute correlation
    });

    Ok(StructureMatrix {
        variables: sorted_variables,
        correlations,
    })
}

// Calculate total covariance matrix
fn calculate_total_covariance_matrix(data: &AnalysisData, variables: &[String]) -> Vec<Vec<f64>> {
    let num_vars = variables.len();
    let mut total_matrix = vec![vec![0.0; num_vars]; num_vars];

    // Collect all values regardless of group
    let mut all_values = Vec::with_capacity(num_vars);
    for var_idx in 0..num_vars {
        let values = extract_values_by_index(&data.group_data, var_idx, variables);
        all_values.push(values);
    }

    // Calculate overall means
    let mut overall_means = Vec::with_capacity(num_vars);
    for var_idx in 0..num_vars {
        let mean = if all_values[var_idx].is_empty() {
            0.0
        } else {
            all_values[var_idx].iter().sum::<f64>() / (all_values[var_idx].len() as f64)
        };
        overall_means.push(mean);
    }

    // Calculate total covariance matrix
    let total_n = all_values[0].len();
    if total_n <= 1 {
        return total_matrix;
    }

    for i in 0..num_vars {
        for j in 0..num_vars {
            let cov = calculate_covariance(
                &all_values[i],
                &all_values[j],
                overall_means[i],
                overall_means[j]
            );
            total_matrix[i][j] = cov;
        }
    }

    total_matrix
}

// Calculate correlation matrix from a covariance matrix
fn calculate_correlation_matrix(cov_matrix: &[Vec<f64>]) -> Vec<Vec<f64>> {
    let n = cov_matrix.len();
    let mut corr_matrix = vec![vec![0.0; n]; n];

    for i in 0..n {
        for j in 0..n {
            if i == j {
                corr_matrix[i][j] = 1.0;
            } else {
                let var_i = cov_matrix[i][i];
                let var_j = cov_matrix[j][j];

                if var_i > 0.0 && var_j > 0.0 {
                    corr_matrix[i][j] = cov_matrix[i][j] / (var_i.sqrt() * var_j.sqrt());
                }
            }
        }
    }

    corr_matrix
}

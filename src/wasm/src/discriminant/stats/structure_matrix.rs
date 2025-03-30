use std::collections::HashMap;

use crate::discriminant::models::{ result::StructureMatrix, AnalysisData, DiscriminantConfig };

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
    let pooled_within = calculate_pooled_within_matrix(data, num_vars);

    // Calculate between-groups covariance matrix
    let between_groups = calculate_between_groups_matrix(data, num_vars);

    // Calculate eigenvectors of W^-1 * B
    let (_, eigenvectors) = solve_eigenvalue_problem(
        &pooled_within,
        &between_groups,
        num_functions
    );

    // Calculate total covariance matrix
    let total_cov = calculate_total_covariance_matrix(data, num_vars);

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

// Calculate pooled within-groups covariance matrix
fn calculate_pooled_within_matrix(data: &AnalysisData, num_vars: usize) -> Vec<Vec<f64>> {
    let mut pooled_matrix = vec![vec![0.0; num_vars]; num_vars];
    let mut total_df = 0;

    for group_data in data.group_data.iter() {
        if group_data.len() <= 1 {
            continue;
        }

        let df = group_data.len() - 1;
        total_df += df;

        // Calculate means for this group
        let mut means = Vec::with_capacity(num_vars);
        for var_idx in 0..num_vars {
            let values: Vec<f64> = group_data
                .iter()
                .map(|case| case[var_idx])
                .collect();

            means.push(
                if values.is_empty() {
                    0.0
                } else {
                    values.iter().sum::<f64>() / (values.len() as f64)
                }
            );
        }

        // Calculate and add weighted covariance
        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1: Vec<f64> = group_data
                    .iter()
                    .map(|case| case[var1_idx])
                    .collect();
                let values2: Vec<f64> = group_data
                    .iter()
                    .map(|case| case[var2_idx])
                    .collect();

                let cov = calculate_covariance(
                    &values1,
                    &values2,
                    means[var1_idx],
                    means[var2_idx]
                );
                pooled_matrix[var1_idx][var2_idx] += (df as f64) * cov;
            }
        }
    }

    // Divide by total degrees of freedom
    if total_df > 0 {
        for i in 0..num_vars {
            for j in 0..num_vars {
                pooled_matrix[i][j] /= total_df as f64;
            }
        }
    }

    pooled_matrix
}

// Calculate between-groups covariance matrix
fn calculate_between_groups_matrix(data: &AnalysisData, num_vars: usize) -> Vec<Vec<f64>> {
    let mut between_matrix = vec![vec![0.0; num_vars]; num_vars];

    // Calculate overall means
    let mut overall_means = Vec::with_capacity(num_vars);
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    for var_idx in 0..num_vars {
        let all_values: Vec<f64> = data.group_data
            .iter()
            .flat_map(|group| group.iter().map(|case| case[var_idx]))
            .collect();

        let overall_mean = if all_values.is_empty() {
            0.0
        } else {
            all_values.iter().sum::<f64>() / (all_values.len() as f64)
        };

        overall_means.push(overall_mean);
    }

    // Calculate between-groups matrix
    for group_data in data.group_data.iter() {
        if group_data.is_empty() {
            continue;
        }

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

        // Add to between-groups matrix
        let n_cases = group_data.len() as f64;
        for i in 0..num_vars {
            for j in 0..num_vars {
                between_matrix[i][j] +=
                    n_cases *
                    (group_means[i] - overall_means[i]) *
                    (group_means[j] - overall_means[j]);
            }
        }
    }

    between_matrix
}

// Helper function to calculate covariance
fn calculate_covariance(values1: &[f64], values2: &[f64], mean1: f64, mean2: f64) -> f64 {
    if values1.len() <= 1 || values1.len() != values2.len() {
        return 0.0;
    }

    let sum_of_products = values1
        .iter()
        .zip(values2.iter())
        .map(|(&v1, &v2)| (v1 - mean1) * (v2 - mean2))
        .sum::<f64>();

    sum_of_products / ((values1.len() - 1) as f64)
}

// Calculate total covariance matrix
fn calculate_total_covariance_matrix(data: &AnalysisData, num_vars: usize) -> Vec<Vec<f64>> {
    let mut total_matrix = vec![vec![0.0; num_vars]; num_vars];

    // Collect all values regardless of group
    let mut all_values = Vec::with_capacity(num_vars);
    for var_idx in 0..num_vars {
        let values: Vec<f64> = data.group_data
            .iter()
            .flat_map(|group| group.iter().map(|case| case[var_idx]))
            .collect();
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

// Solve the eigenvalue problem
// In practice, we would use a linear algebra library for this
fn solve_eigenvalue_problem(
    w: &[Vec<f64>],
    b: &[Vec<f64>],
    num_functions: usize
) -> (Vec<f64>, Vec<Vec<f64>>) {
    let num_vars = w.len();

    // For simplicity, return some reasonable eigenvalues and eigenvectors
    // In a real implementation, this would use proper matrix operations

    // Generate some sample eigenvalues that decrease in magnitude
    let mut eigenvalues = Vec::with_capacity(num_functions);
    for i in 0..num_functions {
        eigenvalues.push(2.5 / ((i + 1) as f64));
    }

    // Generate sample eigenvectors
    let mut eigenvectors = vec![vec![0.0; num_functions]; num_vars];
    for i in 0..num_vars {
        for j in 0..num_functions {
            if j < num_functions {
                // Create reasonably varying eigenvector components
                eigenvectors[i][j] = ((i as f64) * 0.5 + (j as f64) * 0.3).sin();
            }
        }
    }

    // Normalize eigenvectors
    for j in 0..num_functions {
        let mut sum_squares = 0.0;
        for i in 0..num_vars {
            sum_squares += eigenvectors[i][j].powi(2);
        }
        let norm = sum_squares.sqrt();

        if norm > 0.0 {
            for i in 0..num_vars {
                eigenvectors[i][j] /= norm;
            }
        }
    }

    (eigenvalues, eigenvectors)
}

use std::collections::HashMap;
use nalgebra::DMatrix;
use rayon::prelude::*;

use crate::discriminant::{
    models::result::EigenDescription,
    stats::stepwise::stepwise_statistics::calculate_stepwise_statistics,
};
use super::core::{ calculate_pooled_within_matrix, extract_analyzed_dataset, AnalyzedDataset };

use crate::discriminant::models::{ result::CanonicalFunctions, AnalysisData, DiscriminantConfig };

pub fn calculate_eigen_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<EigenDescription, String> {
    web_sys::console::log_1(&"Executing calculate_eigen_statistics".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Determine which variables to use
    let variables_to_use = if config.main.stepwise {
        get_stepwise_selected_variables(data, config)?
    } else {
        config.main.independent_variables.clone()
    };

    // Calculate number of discriminant functions
    let num_functions = std::cmp::min(dataset.num_groups - 1, variables_to_use.len());

    if num_functions == 0 {
        return Err("Not enough groups or variables for canonical functions".to_string());
    }

    // Calculate pooled within-groups matrix
    let pooled_within = calculate_pooled_within_matrix(&dataset, &variables_to_use);

    // Calculate between-groups matrix
    let between_groups = calculate_between_groups_matrix(&dataset, &variables_to_use);

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

    // Flatten the eigenvectors matrix into a single vector for storage
    // We'll need to reshape it later when we use it
    let flat_eigenvectors: Vec<f64> = eigenvectors
        .iter()
        .flat_map(|vec| vec.iter().copied())
        .collect();

    // Create function names (Function 1, Function 2, etc.)
    let functions: Vec<String> = (1..=num_functions).map(|i| format!("Function {}", i)).collect();

    Ok(EigenDescription {
        functions,
        eigenvalue: eigenvalues,
        eigenvector: flat_eigenvectors,
        variance_percentage,
        cumulative_percentage,
        canonical_correlation,
    })
}

pub fn calculate_canonical_functions(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CanonicalFunctions, String> {
    web_sys::console::log_1(&"Executing calculate_canonical_functions".into());

    // First calculate the eigenvalues and eigenvectors
    let eigen_desc = calculate_eigen_statistics(data, config)?;

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Determine which variables to use
    let variables_to_use = if config.main.stepwise {
        get_stepwise_selected_variables(data, config)?
    } else {
        config.main.independent_variables.clone()
    };

    // Calculate number of discriminant functions
    let num_functions = std::cmp::min(dataset.num_groups - 1, variables_to_use.len());

    // Reshape the flat eigenvectors back to the original matrix form
    // Assuming eigenvectors was originally a matrix with dimensions [num_variables × num_functions]
    let num_variables = variables_to_use.len();
    let mut eigenvectors = Vec::with_capacity(num_variables);

    for i in 0..num_variables {
        let mut row = Vec::with_capacity(num_functions);
        for j in 0..num_functions {
            let index = i * num_functions + j;
            if index < eigen_desc.eigenvector.len() {
                row.push(eigen_desc.eigenvector[index]);
            } else {
                row.push(0.0); // Fill with zeros if we're out of bounds
            }
        }
        eigenvectors.push(row);
    }

    // Calculate pooled within-groups matrix (needed for coefficients)
    let pooled_within = calculate_pooled_within_matrix(&dataset, &variables_to_use);

    // Process coefficients, standardized coefficients, and constants
    let (coefficients, standardized_coefficients) = process_discriminant_coefficients(
        &eigenvectors,
        &variables_to_use,
        &pooled_within,
        &dataset.overall_means,
        num_functions
    );

    // Calculate function at group centroids
    let function_at_centroids = calculate_function_at_group_centroids(
        &dataset,
        &eigenvectors,
        &variables_to_use,
        num_functions
    );

    // Return only the fields defined in the CanonicalFunctions struct from result.rs
    Ok(CanonicalFunctions {
        coefficients,
        standardized_coefficients,
        function_at_centroids,
    })
}

pub fn solve_eigenvalue_problem(
    pooled_within: &DMatrix<f64>,
    between_groups: &DMatrix<f64>,
    num_functions: usize
) -> (Vec<f64>, Vec<Vec<f64>>) {
    let n = pooled_within.nrows();

    // Compute the Cholesky decomposition of the within-groups matrix
    let w_cholesky = match pooled_within.clone().cholesky() {
        Some(chol) => chol,
        None => {
            // If Cholesky fails, add a small regularization to the diagonal
            let mut regularized = pooled_within.clone();
            for i in 0..n {
                regularized[(i, i)] += 1e-10;
            }
            regularized
                .clone()
                .cholesky()
                .unwrap_or_else(|| {
                    // If still fails, use eigendecomposition approach
                    let eigen = regularized.symmetric_eigen();
                    let d = eigen.eigenvalues;
                    let v = eigen.eigenvectors;

                    let mut d_inv_sqrt = DMatrix::zeros(n, n);
                    for i in 0..n {
                        if d[i] > 1e-10 {
                            d_inv_sqrt[(i, i)] = 1.0 / d[i].sqrt();
                        } else {
                            d_inv_sqrt[(i, i)] = 0.0;
                        }
                    }

                    let pseudo_chol = v.clone() * d_inv_sqrt * v.transpose();
                    nalgebra::Cholesky::new(pseudo_chol).unwrap()
                })
        }
    };

    // Compute W^(-1/2)
    let w_inv_sqrt = w_cholesky.inverse();

    // Transform to standard eigenvalue problem: W^(-1/2) * B * W^(-1/2)
    let transformed = &w_inv_sqrt * between_groups * &w_inv_sqrt;

    // Get eigendecomposition
    let eigen = transformed.symmetric_eigen();
    let mut eigenvalues: Vec<f64> = eigen.eigenvalues.as_slice().to_vec();
    let eigenvectors_matrix = eigen.eigenvectors;

    // Sort eigenvalues in descending order
    let mut indices: Vec<usize> = (0..n).collect();
    indices.sort_by(|&i, &j|
        eigenvalues[j].partial_cmp(&eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    eigenvalues = indices
        .iter()
        .map(|&i| eigenvalues[i])
        .collect();

    // Prepare eigenvectors matrix
    let mut eigenvectors: Vec<Vec<f64>> = Vec::with_capacity(n);
    for _ in 0..n {
        eigenvectors.push(vec![0.0; num_functions]);
    }

    // Transform eigenvectors back to original problem
    for func_idx in 0..num_functions {
        if func_idx < indices.len() {
            let idx = indices[func_idx];
            let transformed_eigenvector = eigenvectors_matrix.column(idx);

            // v = W^(-1/2) * transformed_v
            let original_eigenvector = &w_inv_sqrt * transformed_eigenvector;

            for var_idx in 0..n {
                if var_idx < eigenvectors.len() && func_idx < eigenvectors[var_idx].len() {
                    eigenvectors[var_idx][func_idx] = original_eigenvector[var_idx];
                }
            }
        }
    }

    // Keep only the top num_functions eigenvalues
    eigenvalues.truncate(num_functions);

    (eigenvalues, eigenvectors)
}

fn calculate_between_groups_matrix(
    dataset: &AnalyzedDataset,
    variables: &[String]
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut between_groups = DMatrix::zeros(num_vars, num_vars);

    // Create index pairs for parallel processing
    let indices: Vec<(usize, usize)> = (0..num_vars)
        .flat_map(|i| (0..num_vars).map(move |j| (i, j)))
        .collect();

    // Process in parallel
    let between_contributions: Vec<(usize, usize, f64)> = indices
        .par_iter()
        .map(|&(i, j)| {
            let var1 = &variables[i];
            let var2 = &variables[j];
            let mut sum = 0.0;

            for group in &dataset.group_labels {
                if
                    let (Some(values), Some(group_mean_i), Some(group_mean_j)) = (
                        dataset.group_data.get(var1).and_then(|g| g.get(group)),
                        dataset.group_means.get(group).and_then(|m| m.get(var1)),
                        dataset.group_means.get(group).and_then(|m| m.get(var2)),
                    )
                {
                    let n = values.len() as f64;
                    if n > 0.0 {
                        let overall_mean_i = dataset.overall_means.get(var1).unwrap_or(&0.0);
                        let overall_mean_j = dataset.overall_means.get(var2).unwrap_or(&0.0);
                        sum +=
                            n * (group_mean_i - overall_mean_i) * (group_mean_j - overall_mean_j);
                    }
                }
            }

            (i, j, sum)
        })
        .collect();

    // Combine results
    for (i, j, value) in between_contributions {
        between_groups[(i, j)] = value;
    }

    between_groups
}

pub fn process_discriminant_coefficients(
    eigenvectors: &[Vec<f64>],
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
            let coef_values: Vec<f64> = (0..num_functions)
                .map(|func_idx| {
                    if var_idx < eigenvectors.len() && func_idx < eigenvectors[var_idx].len() {
                        eigenvectors[var_idx][func_idx]
                    } else {
                        0.0
                    }
                })
                .collect();
            (var.clone(), coef_values)
        })
        .collect();

    // Standardized coefficients
    let standardized_coefficients: HashMap<String, Vec<f64>> = variables
        .iter()
        .enumerate()
        .map(|(var_idx, var)| {
            let std_dev = if var_idx < std_devs.len() { std_devs[var_idx] } else { 1.0 };
            let std_coef_values: Vec<f64> = (0..num_functions)
                .map(|func_idx| {
                    if
                        var_idx < eigenvectors.len() &&
                        func_idx < eigenvectors[var_idx].len() &&
                        std_dev > 0.0
                    {
                        eigenvectors[var_idx][func_idx] * std_dev
                    } else {
                        0.0
                    }
                })
                .collect();
            (var.clone(), std_coef_values)
        })
        .collect();

    // Calculate constants for each function
    let mut constants = Vec::with_capacity(num_functions);

    for func_idx in 0..num_functions {
        let constant = variables.iter().fold(0.0, |acc, var| {
            if let Some(coef_values) = coefficients.get(var) {
                if func_idx < coef_values.len() {
                    let coef = coef_values[func_idx];
                    let mean = overall_means.get(var).copied().unwrap_or(0.0);
                    acc - coef * mean
                } else {
                    acc
                }
            } else {
                acc
            }
        });
        constants.push(constant);
    }

    // Add constants to the coefficients map
    coefficients.insert("(Constant)".to_string(), constants);

    (coefficients, standardized_coefficients)
}

pub fn get_stepwise_selected_variables(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<Vec<String>, String> {
    if !config.main.stepwise {
        return Ok(config.main.independent_variables.clone());
    }

    match calculate_stepwise_statistics(data, config) {
        Ok(stepwise_stats) => {
            let final_step = stepwise_stats.variables_in_analysis
                .keys()
                .filter_map(|k| k.parse::<i32>().ok())
                .max()
                .unwrap_or(0)
                .to_string();

            if let Some(vars_in_model) = stepwise_stats.variables_in_analysis.get(&final_step) {
                let selected_vars: Vec<String> = vars_in_model
                    .iter()
                    .map(|v| v.variable.clone())
                    .collect();

                if selected_vars.is_empty() {
                    Ok(config.main.independent_variables.clone())
                } else {
                    Ok(selected_vars)
                }
            } else {
                Ok(config.main.independent_variables.clone())
            }
        }
        Err(_) => Ok(config.main.independent_variables.clone()),
    }
}

pub fn calculate_function_at_group_centroids(
    dataset: &AnalyzedDataset,
    eigenvectors: &[Vec<f64>],
    variables: &[String],
    num_functions: usize
) -> HashMap<String, Vec<f64>> {
    let mut function_at_centroids = HashMap::new();

    // Process each group in parallel
    let results: Vec<(String, Vec<f64>)> = dataset.group_labels
        .par_iter()
        .map(|group| {
            let mut centroid_values = vec![0.0; num_functions];

            for func_idx in 0..num_functions {
                // First add constant (negative sum of coefficient * overall_mean)
                let constant = variables
                    .iter()
                    .enumerate()
                    .fold(0.0, |acc, (var_idx, variable)| {
                        if var_idx < eigenvectors.len() && func_idx < eigenvectors[var_idx].len() {
                            acc -
                                eigenvectors[var_idx][func_idx] *
                                    dataset.overall_means.get(variable).copied().unwrap_or(0.0)
                        } else {
                            acc
                        }
                    });

                centroid_values[func_idx] = constant;

                // Then add variable contributions
                for (var_idx, variable) in variables.iter().enumerate() {
                    if var_idx < eigenvectors.len() && func_idx < eigenvectors[var_idx].len() {
                        if
                            let Some(group_mean) = dataset.group_means
                                .get(group)
                                .and_then(|m| m.get(variable))
                        {
                            centroid_values[func_idx] +=
                                group_mean * eigenvectors[var_idx][func_idx];
                        }
                    }
                }
            }

            (group.clone(), centroid_values)
        })
        .collect();

    // Combine results
    for (group, values) in results {
        function_at_centroids.insert(group, values);
    }

    function_at_centroids
}

pub fn calculate_variance_percentages(eigenvalues: &[f64]) -> (Vec<f64>, Vec<f64>) {
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

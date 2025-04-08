use std::collections::HashMap;
use nalgebra::DMatrix;
use rayon::prelude::*;

use crate::discriminant::models::{ result::StructureMatrix, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;
use super::core::{ extract_analyzed_dataset, get_stepwise_selected_variables, AnalyzedDataset };

pub fn calculate_structure_matrix(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StructureMatrix, String> {
    web_sys::console::log_1(&"Executing calculate_structure_matrix".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Get variables to use
    let variables = if config.main.stepwise {
        get_stepwise_selected_variables(data, config)?
    } else {
        config.main.independent_variables.clone()
    };

    let num_vars = variables.len();

    // Calculate canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Number of discriminant functions
    let num_groups = dataset.group_labels.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for structure matrix".to_string());
    }

    // Calculate pooled within-groups covariance matrix
    let pooled_within = calculate_pooled_within_matrix(&dataset, &variables);

    // Extract eigenvectors from canonical functions
    let mut eigenvectors = vec![vec![0.0; num_functions]; num_vars];
    for (i, var) in variables.iter().enumerate() {
        if let Some(coef_values) = canonical_functions.coefficients.get(var) {
            for j in 0..num_functions {
                if j < coef_values.len() {
                    eigenvectors[i][j] = coef_values[j];
                }
            }
        }
    }

    // Calculate within-groups correlation matrix
    let within_corr = calculate_within_correlation_matrix(&pooled_within);

    // Calculate structure matrix (pooled within-groups correlations) - parallelize by variable
    let correlations: HashMap<String, Vec<f64>> = variables
        .par_iter()
        .enumerate()
        .map(|(i, var)| {
            let mut corr_values = Vec::with_capacity(num_functions);

            for j in 0..num_functions {
                // Calculate correlation between variable i and discriminant function j
                let correlation = (0..num_vars).fold(0.0, |acc, k| {
                    acc + within_corr[(i, k)] * eigenvectors[k][j]
                });

                corr_values.push(correlation);
            }

            (var.clone(), corr_values)
        })
        .collect();

    // Sort variables by absolute magnitude of correlation with first function
    let mut sorted_variables = variables.clone();
    sorted_variables.sort_by(|a, b| {
        let corr_a = correlations.get(a).unwrap_or(&vec![0.0])[0].abs();
        let corr_b = correlations.get(b).unwrap_or(&vec![0.0])[0].abs();
        corr_b.partial_cmp(&corr_a).unwrap_or(std::cmp::Ordering::Equal)
    });

    Ok(StructureMatrix {
        variables: sorted_variables,
        correlations,
    })
}

pub fn calculate_pooled_within_matrix(
    dataset: &AnalyzedDataset,
    variables: &[String]
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut pooled_within = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    for group in &dataset.group_labels {
        let n = dataset.group_data
            .get(&variables[0])
            .and_then(|g| g.get(group))
            .map_or(0, |v| v.len());

        if n <= 1 {
            continue;
        }

        let df = n - 1;
        total_df += df;

        // Calculate covariance for each variable pair
        for (i, var_i) in variables.iter().enumerate() {
            for (j, var_j) in variables.iter().enumerate() {
                if
                    let (Some(values_i), Some(values_j)) = (
                        dataset.group_data.get(var_i).and_then(|g| g.get(group)),
                        dataset.group_data.get(var_j).and_then(|g| g.get(group)),
                    )
                {
                    if values_i.len() > 1 && values_i.len() == values_j.len() {
                        let mean_i = dataset.group_means[group][var_i];
                        let mean_j = dataset.group_means[group][var_j];

                        // Calculate covariance
                        let mut cov_sum = 0.0;
                        for k in 0..values_i.len() {
                            cov_sum += (values_i[k] - mean_i) * (values_j[k] - mean_j);
                        }
                        let cov = cov_sum / ((values_i.len() - 1) as f64);

                        pooled_within[(i, j)] += (df as f64) * cov;
                    }
                }
            }
        }
    }

    if total_df > 0 {
        pooled_within /= total_df as f64;
    }

    // Add small regularization to ensure invertibility
    let epsilon = 1e-8;
    for i in 0..num_vars {
        pooled_within[(i, i)] += epsilon;
    }

    pooled_within
}

pub fn calculate_within_correlation_matrix(pooled_within: &DMatrix<f64>) -> DMatrix<f64> {
    let n = pooled_within.nrows();
    let mut within_corr = DMatrix::zeros(n, n);

    for i in 0..n {
        for j in 0..n {
            if i == j {
                within_corr[(i, j)] = 1.0;
            } else {
                let std_i = pooled_within[(i, i)].sqrt();
                let std_j = pooled_within[(j, j)].sqrt();

                if std_i > 0.0 && std_j > 0.0 {
                    within_corr[(i, j)] = pooled_within[(i, j)] / (std_i * std_j);
                } else {
                    within_corr[(i, j)] = 0.0;
                }
            }
        }
    }

    within_corr
}

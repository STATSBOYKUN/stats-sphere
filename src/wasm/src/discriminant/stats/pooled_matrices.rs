use std::collections::HashMap;
use nalgebra::DMatrix;
use rayon::prelude::*;

use crate::discriminant::models::{ result::PooledMatrices, AnalysisData, DiscriminantConfig };
use super::core::{ extract_analyzed_dataset, calculate_covariance, AnalyzedDataset };

pub fn calculate_pooled_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<PooledMatrices, String> {
    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;
    let independent_variables = &config.main.independent_variables;

    // Initialize result structures
    let mut covariance: HashMap<String, HashMap<String, f64>> = HashMap::new();
    let mut correlation: HashMap<String, HashMap<String, f64>> = HashMap::new();

    // Calculate pooled covariance matrix
    let pooled_cov_matrix = calculate_pooled_covariance_matrix(&dataset, independent_variables);

    // Calculate correlation matrix from covariance matrix
    let pooled_corr_matrix = calculate_correlation_matrix(&pooled_cov_matrix);

    // Convert matrices to HashMaps for the result structure
    for (i, var1) in independent_variables.iter().enumerate() {
        let mut cov_map = HashMap::new();
        let mut corr_map = HashMap::new();

        for (j, var2) in independent_variables.iter().enumerate() {
            cov_map.insert(var2.clone(), pooled_cov_matrix[(i, j)]);
            corr_map.insert(var2.clone(), pooled_corr_matrix[(i, j)]);
        }

        covariance.insert(var1.clone(), cov_map);
        correlation.insert(var1.clone(), corr_map);
    }

    Ok(PooledMatrices {
        variables: independent_variables.clone(),
        covariance,
        correlation,
    })
}

fn calculate_pooled_covariance_matrix(
    dataset: &AnalyzedDataset,
    variables: &[String]
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut pooled_cov = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    // Calculate pooled covariance matrix - process groups in parallel
    let group_contributions: Vec<(DMatrix<f64>, usize)> = dataset.group_labels
        .par_iter()
        .filter_map(|group| {
            // Check if group has data
            let n = dataset.group_data
                .get(&variables[0])
                .and_then(|g| g.get(group))
                .map_or(0, |v| v.len());

            if n <= 1 {
                return None;
            }

            let df = n - 1;

            // Calculate group covariance matrix
            let mut group_cov = DMatrix::zeros(num_vars, num_vars);

            for (i, var1) in variables.iter().enumerate() {
                for (j, var2) in variables.iter().enumerate() {
                    if
                        let (Some(values1), Some(values2)) = (
                            dataset.group_data.get(var1).and_then(|g| g.get(group)),
                            dataset.group_data.get(var2).and_then(|g| g.get(group)),
                        )
                    {
                        if !values1.is_empty() && values1.len() == values2.len() {
                            let mean1 = dataset.group_means[group][var1];
                            let mean2 = dataset.group_means[group][var2];

                            let cov = calculate_covariance(
                                values1,
                                values2,
                                Some(mean1),
                                Some(mean2)
                            );
                            group_cov[(i, j)] = (df as f64) * cov;
                        }
                    }
                }
            }

            Some((group_cov, df))
        })
        .collect();

    // Combine results
    for (group_cov, df) in group_contributions {
        pooled_cov += group_cov;
        total_df += df;
    }

    if total_df > 0 {
        pooled_cov /= total_df as f64;
    }

    pooled_cov
}

fn calculate_correlation_matrix(cov_matrix: &DMatrix<f64>) -> DMatrix<f64> {
    let n = cov_matrix.nrows();
    let mut corr_matrix = DMatrix::zeros(n, n);

    for i in 0..n {
        for j in 0..n {
            if i == j {
                corr_matrix[(i, j)] = 1.0;
            } else {
                let var_i = cov_matrix[(i, i)];
                let var_j = cov_matrix[(j, j)];

                if var_i > 0.0 && var_j > 0.0 {
                    corr_matrix[(i, j)] = cov_matrix[(i, j)] / (var_i.sqrt() * var_j.sqrt());
                } else {
                    corr_matrix[(i, j)] = 0.0;
                }
            }
        }
    }

    corr_matrix
}

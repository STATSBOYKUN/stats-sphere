use nalgebra::DMatrix;
use rayon::prelude::*;

use crate::discriminant::models::{ result::LogDeterminants, AnalysisData, DiscriminantConfig };
use super::core::{
    extract_analyzed_dataset,
    calculate_covariance,
    calculate_rank_and_log_det,
    AnalyzedDataset,
};

pub fn calculate_log_determinants(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<LogDeterminants, String> {
    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;
    let independent_variables = &config.main.independent_variables;

    // Initialize results
    let mut ranks = Vec::with_capacity(dataset.group_labels.len());
    let mut log_determinants = Vec::with_capacity(dataset.group_labels.len());
    let mut group_sizes = Vec::with_capacity(dataset.group_labels.len());
    let mut valid_groups = Vec::new();

    // Calculate covariance matrices and log determinants for each group in parallel
    let group_results: Vec<Option<(String, i32, f64, usize)>> = dataset.group_labels
        .par_iter()
        .map(|group| {
            // Check if group has enough data
            let n = dataset.group_data
                .get(independent_variables.first().unwrap_or(&String::new()))
                .and_then(|g| g.get(group))
                .map_or(0, |v| v.len());

            if n <= 1 {
                return None;
            }

            // Build covariance matrix
            let cov_matrix = calculate_group_covariance_matrix(
                &dataset,
                group,
                independent_variables
            );

            // Calculate rank and log determinant
            let (rank, log_det) = calculate_rank_and_log_det(&cov_matrix);

            Some((group.clone(), rank, log_det, n))
        })
        .collect();

    // Combine results
    for result in group_results {
        if let Some((group, rank, log_det, size)) = result {
            valid_groups.push(group);
            ranks.push(rank);
            log_determinants.push(log_det);
            group_sizes.push(size);
        }
    }

    // Calculate pooled covariance matrix
    let pooled_cov_matrix = calculate_pooled_covariance_matrix(
        &dataset,
        &valid_groups,
        independent_variables,
        &group_sizes
    );

    // Calculate rank and log determinant for pooled matrix
    let (rank_pooled, pooled_log_determinant) = calculate_rank_and_log_det(&pooled_cov_matrix);

    Ok(LogDeterminants {
        groups: valid_groups,
        ranks,
        log_determinants,
        rank_pooled,
        pooled_log_determinant,
    })
}

fn calculate_group_covariance_matrix(
    dataset: &AnalyzedDataset,
    group: &str,
    variables: &[String]
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut covariance_matrix = DMatrix::zeros(num_vars, num_vars);

    for (var1_idx, var1) in variables.iter().enumerate() {
        for (var2_idx, var2) in variables.iter().enumerate() {
            if
                let (Some(values1), Some(values2)) = (
                    dataset.group_data.get(var1).and_then(|g| g.get(group)),
                    dataset.group_data.get(var2).and_then(|g| g.get(group)),
                )
            {
                if values1.len() > 1 && values1.len() == values2.len() {
                    let mean1 = dataset.group_means[group][var1];
                    let mean2 = dataset.group_means[group][var2];

                    let cov = calculate_covariance(values1, values2, Some(mean1), Some(mean2));
                    covariance_matrix[(var1_idx, var2_idx)] = cov;
                }
            }
        }
    }

    covariance_matrix
}

fn calculate_pooled_covariance_matrix(
    dataset: &AnalyzedDataset,
    valid_groups: &[String],
    variables: &[String],
    group_sizes: &[usize]
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut pooled_cov = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;
    let mut group_idx = 0;

    for group in valid_groups {
        if group_idx >= group_sizes.len() {
            continue;
        }

        let n = group_sizes[group_idx];
        let df = n - 1;
        total_df += df;

        // Calculate group covariance matrix
        for (var1_idx, var1) in variables.iter().enumerate() {
            for (var2_idx, var2) in variables.iter().enumerate() {
                if
                    let (Some(values1), Some(values2)) = (
                        dataset.group_data.get(var1).and_then(|g| g.get(group)),
                        dataset.group_data.get(var2).and_then(|g| g.get(group)),
                    )
                {
                    if values1.len() > 1 && values1.len() == values2.len() {
                        let mean1 = dataset.group_means[group][var1];
                        let mean2 = dataset.group_means[group][var2];

                        let cov = calculate_covariance(values1, values2, Some(mean1), Some(mean2));
                        pooled_cov[(var1_idx, var2_idx)] += (df as f64) * cov;
                    }
                }
            }
        }

        group_idx += 1;
    }

    if total_df > 0 {
        pooled_cov /= total_df as f64;
    }

    pooled_cov
}

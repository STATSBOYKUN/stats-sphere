use nalgebra::{ DMatrix, DVector };
use rayon::prelude::*;

use crate::discriminant::stats::core::{ calculate_covariance, AnalyzedDataset };

// Calculate between-groups and within-groups matrices
pub fn calculate_between_within_matrices(
    dataset: &AnalyzedDataset,
    variables: &[String]
) -> (DMatrix<f64>, DMatrix<f64>) {
    let p = variables.len();

    // Initialize matrices
    let mut between_matrix = DMatrix::zeros(p, p);
    let mut within_matrix = DMatrix::zeros(p, p);

    // Calculate between-groups matrix
    for (i, var_i) in variables.iter().enumerate() {
        for (j, var_j) in variables.iter().enumerate() {
            let overall_mean_i = *dataset.overall_means.get(var_i).unwrap_or(&0.0);
            let overall_mean_j = *dataset.overall_means.get(var_j).unwrap_or(&0.0);

            let mut sum = 0.0;

            for group_label in &dataset.group_labels {
                if
                    let (Some(values_i), Some(mean_i), Some(mean_j)) = (
                        dataset.group_data.get(var_i).and_then(|g| g.get(group_label)),
                        dataset.group_means.get(group_label).and_then(|m| m.get(var_i)),
                        dataset.group_means.get(group_label).and_then(|m| m.get(var_j)),
                    )
                {
                    let n_g = values_i.len() as f64;
                    if n_g > 0.0 {
                        sum += n_g * (mean_i - overall_mean_i) * (mean_j - overall_mean_j);
                    }
                }
            }

            between_matrix[(i, j)] = sum;
        }
    }

    // Calculate within-groups matrix - parallel across group pairs
    let mut total_df = 0;

    let group_contributions: Vec<(DMatrix<f64>, usize)> = dataset.group_labels
        .par_iter()
        .filter_map(|group_label| {
            // For each group, calculate contribution to within-groups matrix
            let mut group_within = DMatrix::zeros(p, p);

            // Check if group has data
            let n = dataset.group_data
                .get(&variables[0])
                .and_then(|g| g.get(group_label))
                .map_or(0, |v| v.len());

            if n <= 1 {
                return None;
            }

            let df = n - 1;

            // Calculate group covariance matrix
            for (i, var_i) in variables.iter().enumerate() {
                for (j, var_j) in variables.iter().enumerate() {
                    if
                        let (Some(values_i), Some(values_j)) = (
                            dataset.group_data.get(var_i).and_then(|g| g.get(group_label)),
                            dataset.group_data.get(var_j).and_then(|g| g.get(group_label)),
                        )
                    {
                        if values_i.len() > 1 && values_i.len() == values_j.len() {
                            let mean_i = dataset.group_means[group_label][var_i];
                            let mean_j = dataset.group_means[group_label][var_j];

                            // Calculate covariance
                            let cov = calculate_covariance(
                                values_i,
                                values_j,
                                Some(mean_i),
                                Some(mean_j)
                            );

                            group_within[(i, j)] = (df as f64) * cov;
                        }
                    }
                }
            }

            Some((group_within, df))
        })
        .collect();

    // Combine group contributions
    for (group_within, df) in group_contributions {
        within_matrix += &group_within;
        total_df += df;
    }

    if total_df > 0 {
        within_matrix /= total_df as f64;
    }

    (between_matrix, within_matrix)
}

// Calculate total unexplained variation between groups
pub fn calculate_total_unexplained_variation(
    dataset: &AnalyzedDataset,
    variables: &[String]
) -> f64 {
    if variables.is_empty() {
        return 1.0; // Maximum unexplained variation
    }

    // Use simpler approach for parallel computation
    let mut unexplained_values = Vec::new();

    for (i, group_i) in dataset.group_labels.iter().enumerate() {
        let values: Vec<f64> = dataset.group_labels[i + 1..]
            .par_iter()
            .map(|group_j| {
                // Calculate Mahalanobis distance between these groups
                let d2 = calculate_group_mahalanobis_distance(dataset, group_i, group_j, variables);

                // Dixon's formula for unexplained variation
                4.0 / (4.0 + d2)
            })
            .collect();
        unexplained_values.extend(values);
    }

    // Sum the pairwise values
    unexplained_values.iter().sum()
}

// Calculate minimum Mahalanobis distance between any two groups
pub fn calculate_min_mahalanobis_distance(dataset: &AnalyzedDataset, variables: &[String]) -> f64 {
    if variables.is_empty() || dataset.group_labels.len() < 2 {
        return 0.0;
    }

    // Use simpler approach for parallel computation
    let mut distances = Vec::new();

    for (i, group_i) in dataset.group_labels.iter().enumerate() {
        let group_distances: Vec<f64> = dataset.group_labels[i + 1..]
            .par_iter()
            .map(|group_j| {
                calculate_group_mahalanobis_distance(dataset, group_i, group_j, variables)
            })
            .collect();
        distances.extend(group_distances);
    }

    // Find minimum distance
    if distances.is_empty() {
        0.0
    } else {
        distances.into_iter().fold(f64::MAX, |min_val, val| min_val.min(val))
    }
}

// Calculate minimum F ratio between any two groups
pub fn calculate_min_f_ratio(dataset: &AnalyzedDataset, variables: &[String]) -> f64 {
    if variables.is_empty() || dataset.group_labels.len() < 2 {
        return 0.0;
    }

    // Use simpler approach for parallel computation
    let mut f_ratios = Vec::new();

    for (i, group_i) in dataset.group_labels.iter().enumerate() {
        let group_f_ratios: Vec<f64> = dataset.group_labels[i + 1..]
            .par_iter()
            .map(|group_j| {
                // Calculate Mahalanobis distance
                let d2 = calculate_group_mahalanobis_distance(dataset, group_i, group_j, variables);

                // Get group sizes
                let n_i = dataset.group_data
                    .get(&variables[0])
                    .and_then(|g| g.get(group_i))
                    .map_or(0, |v| v.len());

                let n_j = dataset.group_data
                    .get(&variables[0])
                    .and_then(|g| g.get(group_j))
                    .map_or(0, |v| v.len());

                if n_i > 0 && n_j > 0 {
                    let p = variables.len() as f64;
                    let n = dataset.total_cases as f64;
                    let g = dataset.num_groups as f64;

                    // Convert to F ratio
                    (d2 * (n - g - p + 1.0) * ((n_i * n_j) as f64)) /
                        (p * (n - g) * ((n_i + n_j) as f64))
                } else {
                    0.0
                }
            })
            .collect();
        f_ratios.extend(group_f_ratios);
    }

    // Find minimum F ratio
    if f_ratios.is_empty() {
        0.0
    } else {
        f_ratios.into_iter().fold(f64::MAX, |min_val, val| min_val.min(val))
    }
}

// Helper function to calculate Mahalanobis distance between two groups
fn calculate_group_mahalanobis_distance(
    dataset: &AnalyzedDataset,
    group_i: &str,
    group_j: &str,
    variables: &[String]
) -> f64 {
    // Extract means for both groups as vectors
    let mut mean_diff = DVector::zeros(variables.len());

    for (idx, var) in variables.iter().enumerate() {
        let mean_i = dataset.group_means
            .get(group_i)
            .and_then(|m| m.get(var))
            .copied()
            .unwrap_or(0.0);
        let mean_j = dataset.group_means
            .get(group_j)
            .and_then(|m| m.get(var))
            .copied()
            .unwrap_or(0.0);
        mean_diff[idx] = mean_i - mean_j;
    }

    // Build pooled covariance matrix
    let mut pooled_cov = DMatrix::zeros(variables.len(), variables.len());
    let mut total_df = 0;

    for group_label in [group_i, group_j] {
        let n_g = dataset.group_data
            .get(&variables[0])
            .and_then(|g| g.get(group_label))
            .map_or(0, |v| v.len());

        if n_g <= 1 {
            continue;
        }

        let df = n_g - 1;
        total_df += df;

        // Calculate covariance contribution for this group
        for (i, var_i) in variables.iter().enumerate() {
            for (j, var_j) in variables.iter().enumerate() {
                if
                    let (Some(values_i), Some(values_j)) = (
                        dataset.group_data.get(var_i).and_then(|g| g.get(group_label)),
                        dataset.group_data.get(var_j).and_then(|g| g.get(group_label)),
                    )
                {
                    if values_i.len() == values_j.len() && values_i.len() > 1 {
                        let mean_i = dataset.group_means[group_label][var_i];
                        let mean_j = dataset.group_means[group_label][var_j];

                        // Calculate covariance
                        let cov = calculate_covariance(
                            values_i,
                            values_j,
                            Some(mean_i),
                            Some(mean_j)
                        );

                        pooled_cov[(i, j)] += (df as f64) * cov;
                    }
                }
            }
        }
    }

    // Normalize pooled covariance
    if total_df > 0 {
        pooled_cov /= total_df as f64;
    } else {
        // If no valid covariance, return a simple Euclidean distance
        return mean_diff.norm_squared();
    }

    // Add small regularization for numerical stability
    for i in 0..variables.len() {
        pooled_cov[(i, i)] += 1e-8;
    }

    // Calculate Mahalanobis distance
    match pooled_cov.try_inverse() {
        Some(inv_cov) => (mean_diff.transpose() * (inv_cov * mean_diff))[0],
        None => mean_diff.norm_squared(), // Fallback to Euclidean distance
    }
}

// Calculate Rao's V statistic
pub fn calculate_raos_v(dataset: &AnalyzedDataset, variables: &[String]) -> f64 {
    if variables.is_empty() {
        return 0.0;
    }

    // Calculate between-groups and within-groups matrices
    let (between_mat, within_mat) = calculate_between_within_matrices(dataset, variables);

    // Try to invert within-groups matrix
    match within_mat.clone().try_inverse() {
        Some(w_inv) => {
            // Calculate Rao's V = trace(W^-1 * B)
            let product = w_inv * between_mat;
            (0..variables.len()).map(|i| product[(i, i)]).sum()
        }
        None => {
            // If matrix is singular, use trace of between-groups matrix
            (0..variables.len()).map(|i| between_mat[(i, i)]).sum()
        }
    }
}

use std::collections::HashMap;
use nalgebra::{ DMatrix, DVector };

// Calculate between-groups and within-groups matrices
pub fn calculate_between_within_matrices(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    variables: &[String],
    num_groups: usize
) -> (Vec<Vec<f64>>, Vec<Vec<f64>>) {
    let p = variables.len();

    // Initialize matrices
    let mut between_matrix = vec![vec![0.0; p]; p];
    let mut within_matrix = vec![vec![0.0; p]; p];

    // Calculate between-groups matrix
    for i in 0..p {
        for j in 0..p {
            let var_i = &variables[i];
            let var_j = &variables[j];

            let overall_mean_i = *overall_means.get(var_i).unwrap_or(&0.0);
            let overall_mean_j = *overall_means.get(var_j).unwrap_or(&0.0);

            let mut sum = 0.0;

            for group_label in group_labels {
                let values_i = group_data.get(var_i).and_then(|g| g.get(group_label));

                if
                    let (Some(values_i), Some(mean_i), Some(mean_j)) = (
                        values_i,
                        group_means.get(group_label).and_then(|m| m.get(var_i)),
                        group_means.get(group_label).and_then(|m| m.get(var_j)),
                    )
                {
                    let n_g = values_i.len() as f64;

                    if n_g > 0.0 {
                        sum += n_g * (mean_i - overall_mean_i) * (mean_j - overall_mean_j);
                    }
                }
            }

            between_matrix[i][j] = sum;
        }
    }

    // Calculate within-groups matrix
    for i in 0..p {
        for j in 0..p {
            let var_i = &variables[i];
            let var_j = &variables[j];

            let mut sum = 0.0;
            let mut df = 0;

            for group_label in group_labels {
                let values_i = group_data.get(var_i).and_then(|g| g.get(group_label));
                let values_j = group_data.get(var_j).and_then(|g| g.get(group_label));

                if
                    let (Some(values_i), Some(values_j), Some(mean_i), Some(mean_j)) = (
                        values_i,
                        values_j,
                        group_means.get(group_label).and_then(|m| m.get(var_i)),
                        group_means.get(group_label).and_then(|m| m.get(var_j)),
                    )
                {
                    if values_i.len() > 1 && values_i.len() == values_j.len() {
                        // Calculate covariance for this group
                        let mut group_sum = 0.0;

                        for k in 0..values_i.len() {
                            group_sum += (values_i[k] - mean_i) * (values_j[k] - mean_j);
                        }

                        sum += group_sum;
                        df += values_i.len() - 1;
                    }
                }
            }

            within_matrix[i][j] = if df > 0 { sum / (df as f64) } else { 0.0 };
        }
    }

    (between_matrix, within_matrix)
}

// Calculate total unexplained variation between groups
pub fn calculate_total_unexplained_variation(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    variables: &[String],
    num_groups: usize
) -> f64 {
    if variables.is_empty() {
        return 1.0; // Maximum unexplained variation
    }

    let mut total_unexplained = 0.0;

    // Calculate for each pair of groups
    for i in 0..group_labels.len() {
        for j in i + 1..group_labels.len() {
            let group_i = &group_labels[i];
            let group_j = &group_labels[j];

            // Calculate Mahalanobis distance between these groups
            let d2 = calculate_mahalanobis_distance(
                group_data,
                group_means,
                group_i,
                group_j,
                variables
            );

            // Dixon's formula for unexplained variation
            total_unexplained += 4.0 / (4.0 + d2);
        }
    }

    total_unexplained
}

// Calculate minimum Mahalanobis distance between any two groups
pub fn calculate_min_mahalanobis_distance(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    variables: &[String],
    num_groups: usize
) -> f64 {
    if variables.is_empty() || group_labels.len() < 2 {
        return 0.0;
    }

    let mut min_distance = f64::MAX;

    // Calculate for each pair of groups
    for i in 0..group_labels.len() {
        for j in i + 1..group_labels.len() {
            let group_i = &group_labels[i];
            let group_j = &group_labels[j];

            // Calculate Mahalanobis distance between these groups
            let d2 = calculate_mahalanobis_distance(
                group_data,
                group_means,
                group_i,
                group_j,
                variables
            );

            if d2 < min_distance {
                min_distance = d2;
            }
        }
    }

    if min_distance == f64::MAX {
        0.0
    } else {
        min_distance
    }
}

// Calculate minimum F ratio between any two groups
pub fn calculate_min_f_ratio(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> f64 {
    if variables.is_empty() || group_labels.len() < 2 {
        return 0.0;
    }

    let mut min_f_ratio = f64::MAX;

    // Calculate for each pair of groups
    for i in 0..group_labels.len() {
        for j in i + 1..group_labels.len() {
            let group_i = &group_labels[i];
            let group_j = &group_labels[j];

            // Calculate Mahalanobis distance between these groups
            let d2 = calculate_mahalanobis_distance(
                group_data,
                group_means,
                group_i,
                group_j,
                variables
            );

            // Convert to F ratio
            let n_i = group_data
                .get(&variables[0])
                .and_then(|g| g.get(group_i))
                .map_or(0, |v| v.len());
            let n_j = group_data
                .get(&variables[0])
                .and_then(|g| g.get(group_j))
                .map_or(0, |v| v.len());

            if n_i > 0 && n_j > 0 {
                let p = variables.len() as f64;
                let n = total_cases as f64;
                let g = num_groups as f64;

                let f_ratio =
                    (d2 * (n - g - p + 1.0) * ((n_i * n_j) as f64)) /
                    (p * (n - g) * ((n_i + n_j) as f64));

                if f_ratio < min_f_ratio {
                    min_f_ratio = f_ratio;
                }
            }
        }
    }

    if min_f_ratio == f64::MAX {
        0.0
    } else {
        min_f_ratio
    }
}

// Calculate Mahalanobis distance between two groups
pub fn calculate_mahalanobis_distance(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_means: &HashMap<String, HashMap<String, f64>>,
    group_i: &str,
    group_j: &str,
    variables: &[String]
) -> f64 {
    if variables.is_empty() {
        return 0.0;
    }

    // Extract means for both groups
    let mut mean_diff = Vec::with_capacity(variables.len());

    for var in variables {
        let mean_i = group_means
            .get(group_i)
            .and_then(|m| m.get(var))
            .copied()
            .unwrap_or(0.0);
        let mean_j = group_means
            .get(group_j)
            .and_then(|m| m.get(var))
            .copied()
            .unwrap_or(0.0);

        mean_diff.push(mean_i - mean_j);
    }

    // Calculate pooled covariance matrix for these two groups
    let mut pooled_cov = vec![vec![0.0; variables.len()]; variables.len()];
    let mut total_df = 0;

    for group_label in [group_i, group_j] {
        let n_g = group_data
            .get(&variables[0])
            .and_then(|g| g.get(group_label))
            .map_or(0, |v| v.len());

        if n_g <= 1 {
            continue;
        }

        let df = n_g - 1;
        total_df += df;

        // Calculate covariance matrix for this group
        for (i, var_i) in variables.iter().enumerate() {
            for (j, var_j) in variables.iter().enumerate() {
                if
                    let (Some(values_i), Some(values_j), Some(mean_i), Some(mean_j)) = (
                        group_data.get(var_i).and_then(|g| g.get(group_label)),
                        group_data.get(var_j).and_then(|g| g.get(group_label)),
                        group_means.get(group_label).and_then(|m| m.get(var_i)),
                        group_means.get(group_label).and_then(|m| m.get(var_j)),
                    )
                {
                    if values_i.len() == values_j.len() && values_i.len() > 1 {
                        // Calculate covariance for this group
                        let cov = calculate_covariance(values_i, values_j, *mean_i, *mean_j);

                        pooled_cov[i][j] += (df as f64) * cov;
                    }
                }
            }
        }
    }

    // Normalize pooled covariance matrix
    if total_df > 0 {
        for i in 0..variables.len() {
            for j in 0..variables.len() {
                pooled_cov[i][j] /= total_df as f64;
            }
        }
    } else {
        // If no valid covariance, return a simple Euclidean distance
        return mean_diff
            .iter()
            .map(|&d| d.powi(2))
            .sum();
    }

    // Convert to DMatrix for inversion
    let mut pooled_mat = DMatrix::zeros(variables.len(), variables.len());

    for i in 0..variables.len() {
        for j in 0..variables.len() {
            pooled_mat[(i, j)] = pooled_cov[i][j];
        }
    }

    // Try to invert the matrix
    match pooled_mat.clone().try_inverse() {
        Some(inv_cov) => {
            // Calculate Mahalanobis distance squared
            let diff_vec = DVector::from_vec(mean_diff);

            // Extract the scalar value from the 1x1 matrix result
            (diff_vec.transpose() * (inv_cov * diff_vec))[(0, 0)]
        }
        None => {
            // If matrix is singular, use a simplified approach
            mean_diff
                .iter()
                .map(|&d| d.powi(2))
                .sum()
        }
    }
}

// Calculate Rao's V statistic
pub fn calculate_raos_v(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> f64 {
    if variables.is_empty() {
        return 0.0;
    }

    // Calculate between-groups and within-groups matrices
    let (between_matrix, within_matrix) = calculate_between_within_matrices(
        group_data,
        group_labels,
        group_means,
        overall_means,
        variables,
        num_groups
    );

    // Convert to DMatrix format
    let mut between_mat = DMatrix::zeros(variables.len(), variables.len());
    let mut within_mat = DMatrix::zeros(variables.len(), variables.len());

    for i in 0..variables.len() {
        for j in 0..variables.len() {
            between_mat[(i, j)] = between_matrix[i][j];
            within_mat[(i, j)] = within_matrix[i][j];
        }
    }

    // Try to invert within-groups matrix
    match within_mat.clone().try_inverse() {
        Some(w_inv) => {
            // Calculate Rao's V = trace(W^-1 * B)
            let product = w_inv * between_mat;
            let trace = (0..variables.len()).map(|i| product[(i, i)]).sum::<f64>();

            trace
        }
        None => {
            // If matrix is singular, use a simplified approach
            (0..variables.len()).map(|i| between_matrix[i][i]).sum::<f64>()
        }
    }
}

// Calculate covariance between two vectors
pub fn calculate_covariance(values1: &[f64], values2: &[f64], mean1: f64, mean2: f64) -> f64 {
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

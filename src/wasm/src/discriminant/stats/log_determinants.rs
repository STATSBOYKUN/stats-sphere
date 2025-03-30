use crate::discriminant::models::{ result::LogDeterminants, AnalysisData, DiscriminantConfig };

pub fn calculate_log_determinants(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<LogDeterminants, String> {
    web_sys::console::log_1(&"Executing calculate_log_determinants".into());

    // Extract group names
    let groups: Vec<String> = (0..data.group_data.len()).map(|i| (i + 1).to_string()).collect();

    // Number of variables
    let num_vars = config.main.independent_variables.len();

    // Initialize results
    let mut ranks = Vec::with_capacity(groups.len());
    let mut log_determinants = Vec::with_capacity(groups.len());

    // Calculate covariance matrices and their log determinants for each group
    for group_data in data.group_data.iter() {
        if group_data.len() <= num_vars + 1 {
            // Not enough cases for a reliable covariance matrix
            ranks.push(0);
            log_determinants.push(0.0);
            continue;
        }

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

        // Calculate covariance matrix
        let mut cov_matrix = vec![vec![0.0; num_vars]; num_vars];

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

                cov_matrix[var1_idx][var2_idx] = calculate_covariance(
                    &values1,
                    &values2,
                    means[var1_idx],
                    means[var2_idx]
                );
            }
        }

        // Determine rank and calculate log determinant
        let (rank, log_det) = calculate_rank_and_log_det(&cov_matrix);

        ranks.push(rank);
        log_determinants.push(log_det);
    }

    // Calculate pooled covariance matrix and its log determinant
    let mut pooled_cov_matrix = calculate_pooled_covariance_matrix(data, num_vars);
    let (_, pooled_log_determinant) = calculate_rank_and_log_det(&pooled_cov_matrix);

    Ok(LogDeterminants {
        groups,
        ranks,
        log_determinants,
        pooled_log_determinant,
    })
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

// Calculate pooled covariance matrix
fn calculate_pooled_covariance_matrix(data: &AnalysisData, num_vars: usize) -> Vec<Vec<f64>> {
    let mut pooled_cov_matrix = vec![vec![0.0; num_vars]; num_vars];
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
                pooled_cov_matrix[var1_idx][var2_idx] += (df as f64) * cov;
            }
        }
    }

    // Divide by total degrees of freedom
    if total_df > 0 {
        for i in 0..num_vars {
            for j in 0..num_vars {
                pooled_cov_matrix[i][j] /= total_df as f64;
            }
        }
    }

    pooled_cov_matrix
}

// Function to calculate rank and log determinant of a matrix
fn calculate_rank_and_log_det(matrix: &[Vec<f64>]) -> (usize, f64) {
    let n = matrix.len();
    if n == 0 {
        return (0, 0.0);
    }

    // Simplified implementation - in a real case you would use a proper linear algebra library
    // to calculate rank and determinant

    // Assume full rank for simplicity
    let rank = n;

    // Approximate log determinant
    let mut log_det = 0.0;
    for i in 0..n {
        if matrix[i][i] > 0.0 {
            log_det += matrix[i][i].ln();
        }
    }

    (rank, log_det)
}

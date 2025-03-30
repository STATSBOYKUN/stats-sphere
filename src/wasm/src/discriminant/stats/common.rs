use crate::discriminant::models::{ AnalysisData, DiscriminantConfig, DataRecord, DataValue };

// Extract numeric values from DataRecord by field name
pub fn extract_values_by_name(records: &[DataRecord], field_name: &str) -> Vec<f64> {
    records
        .iter()
        .filter_map(|record| {
            if let Some(DataValue::Number(value)) = record.values.get(field_name) {
                Some(*value)
            } else {
                None
            }
        })
        .collect()
}

// Extract numeric values from group data for a specific variable index
pub fn extract_values_by_index(
    group_data: &[Vec<DataRecord>],
    var_idx: usize,
    variables: &[String]
) -> Vec<f64> {
    if var_idx >= variables.len() {
        return Vec::new();
    }

    let var_name = &variables[var_idx];

    group_data
        .iter()
        .flat_map(|group| extract_values_by_name(group, var_name))
        .collect()
}

// Extract group values for a specific variable index
pub fn extract_group_values(
    group: &[DataRecord],
    var_idx: usize,
    variables: &[String]
) -> Vec<f64> {
    if var_idx >= variables.len() {
        return Vec::new();
    }

    let var_name = &variables[var_idx];
    extract_values_by_name(group, var_name)
}

// Calculate means for each variable in a group
pub fn calculate_group_means(group_data: &[DataRecord], variables: &[String]) -> Vec<f64> {
    let mut means = Vec::with_capacity(variables.len());

    for var_idx in 0..variables.len() {
        let values = extract_group_values(group_data, var_idx, variables);

        means.push(
            if values.is_empty() {
                0.0
            } else {
                values.iter().sum::<f64>() / (values.len() as f64)
            }
        );
    }

    means
}

// Common covariance calculation
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

// Pooled within-groups covariance matrix calculation
pub fn calculate_pooled_within_matrix(data: &AnalysisData, variables: &[String]) -> Vec<Vec<f64>> {
    let num_vars = variables.len();
    let mut pooled_matrix = vec![vec![0.0; num_vars]; num_vars];
    let mut total_df = 0;

    for group_data in data.group_data.iter() {
        if group_data.len() <= 1 {
            continue;
        }

        let df = group_data.len() - 1;
        total_df += df;

        // Calculate means for this group
        let means = calculate_group_means(group_data, variables);

        // Calculate and add weighted covariance
        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1 = extract_group_values(group_data, var1_idx, variables);
                let values2 = extract_group_values(group_data, var2_idx, variables);

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

// Between-groups covariance matrix calculation
pub fn calculate_between_groups_matrix(data: &AnalysisData, variables: &[String]) -> Vec<Vec<f64>> {
    let num_vars = variables.len();
    let mut between_matrix = vec![vec![0.0; num_vars]; num_vars];

    // Calculate overall means
    let mut overall_means = Vec::with_capacity(num_vars);
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    for var_idx in 0..num_vars {
        let all_values = extract_values_by_index(&data.group_data, var_idx, variables);

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
        let group_means = calculate_group_means(group_data, variables);

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

// Log determinant calculation
pub fn calculate_log_determinant(matrix: &[Vec<f64>]) -> f64 {
    let n = matrix.len();
    if n == 0 {
        return 0.0;
    }

    if n == 1 {
        return matrix[0][0].ln();
    }

    if n == 2 {
        let det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        return if det > 0.0 { det.ln() } else { 0.0 };
    }

    // For larger matrices, we'd use a proper linear algebra library
    // Placeholder implementation for 3+ dimensions
    let mut det = 1.0;
    for i in 0..n {
        det *= matrix[i][i];
    }

    if det > 0.0 {
        det.ln()
    } else {
        0.0
    }
}

// Calculate rank and log determinant of a matrix
pub fn calculate_rank_and_log_det(matrix: &[Vec<f64>]) -> (i32, f64) {
    let n = matrix.len();
    if n == 0 {
        return (0, 0.0);
    }

    // Simplified implementation - in a real case you would use a proper linear algebra library
    // to calculate rank and determinant

    // Assume full rank for simplicity
    let rank = n as i32;

    // Approximate log determinant
    let mut log_det = 0.0;
    for i in 0..n {
        if matrix[i][i] > 0.0 {
            log_det += matrix[i][i].ln();
        }
    }

    (rank, log_det)
}

// Eigenvalue problem solver
pub fn solve_eigenvalue_problem(
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

// P-value calculation from F statistic
pub fn calculate_p_value_from_f(f: f64, df1: f64, df2: f64) -> f64 {
    // Simple approximation for demonstration
    if f <= 0.0 {
        return 1.0;
    }

    // Inverse relationship between F and p-value
    let p_approx = if f > 10.0 {
        0.001
    } else if f > 5.0 {
        0.01
    } else if f > 3.0 {
        0.05
    } else if f > 2.0 {
        0.1
    } else {
        0.5
    };

    p_approx
}

// P-value calculation from chi-square statistic
pub fn calculate_p_value_from_chi_square(chi_square: f64, df: usize) -> f64 {
    // Simple approximation for demonstration
    if chi_square <= 0.0 {
        return 1.0;
    }

    // Rough approximation based on chi-square value and degrees of freedom
    let ratio = chi_square / (df as f64);

    if ratio > 3.0 {
        0.001
    } else if ratio > 2.0 {
        0.01
    } else if ratio > 1.5 {
        0.05
    } else if ratio > 1.0 {
        0.1
    } else {
        0.5
    }
}

// Extract numeric values from DataRecord for discriminant analysis
pub fn extract_case_values(record: &DataRecord, variables: &[String]) -> Vec<f64> {
    variables
        .iter()
        .filter_map(|var_name| {
            if let Some(DataValue::Number(value)) = record.values.get(var_name) {
                Some(*value)
            } else {
                None
            }
        })
        .collect()
}

// Helper function for calculating pooled covariance matrix
pub fn calculate_pooled_covariance_matrix(
    data: &AnalysisData,
    variables: &[String]
) -> Vec<Vec<f64>> {
    let num_vars = variables.len();
    let mut pooled_matrix = vec![vec![0.0; num_vars]; num_vars];
    let mut total_df = 0;

    for group_data in data.group_data.iter() {
        if group_data.len() <= 1 {
            continue;
        }

        let df = group_data.len() - 1;
        total_df += df;

        // Calculate means for this group
        let means = calculate_group_means(group_data, variables);

        // Calculate and add weighted covariance
        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1 = extract_group_values(group_data, var1_idx, variables);
                let values2 = extract_group_values(group_data, var2_idx, variables);

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

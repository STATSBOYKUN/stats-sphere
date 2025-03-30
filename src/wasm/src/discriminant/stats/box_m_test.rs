use crate::discriminant::models::{ result::BoxMTest, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    calculate_log_determinant,
    calculate_p_value_from_f,
    calculate_group_means,
    extract_group_values,
};

pub fn calculate_box_m_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<BoxMTest, String> {
    web_sys::console::log_1(&"Executing calculate_box_m_test".into());

    // Number of groups
    let num_groups = data.group_data.len();

    // Get variable names
    let variables = &config.main.independent_variables;
    let num_vars = variables.len();

    // Calculate covariance matrices for each group
    let mut group_covariance_matrices = Vec::with_capacity(num_groups);
    let mut group_sizes = Vec::with_capacity(num_groups);
    let mut group_log_determinants = Vec::with_capacity(num_groups);

    for group_data in data.group_data.iter() {
        let n_cases = group_data.len();
        if n_cases <= num_vars + 1 {
            continue; // Skip groups with too few cases
        }

        group_sizes.push(n_cases);

        // Calculate means for each variable in this group
        let means = calculate_group_means(group_data, variables);

        // Calculate covariance matrix for this group
        let mut cov_matrix = vec![vec![0.0; num_vars]; num_vars];

        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1 = extract_group_values(group_data, var1_idx, variables);
                let values2 = extract_group_values(group_data, var2_idx, variables);

                cov_matrix[var1_idx][var2_idx] = calculate_covariance(
                    &values1,
                    &values2,
                    means[var1_idx],
                    means[var2_idx]
                );
            }
        }

        group_covariance_matrices.push(cov_matrix.clone());

        // Calculate log determinant of covariance matrix
        let log_det = calculate_log_determinant(&cov_matrix);
        group_log_determinants.push(log_det);
    }

    if group_covariance_matrices.is_empty() {
        return Err("Not enough valid groups for Box's M test".to_string());
    }

    // Calculate pooled covariance matrix
    let total_n: usize = group_sizes.iter().sum();
    let mut pooled_cov_matrix = vec![vec![0.0; num_vars]; num_vars];

    for g in 0..group_covariance_matrices.len() {
        let weight = (group_sizes[g] - 1) as f64;

        for i in 0..num_vars {
            for j in 0..num_vars {
                pooled_cov_matrix[i][j] += weight * group_covariance_matrices[g][i][j];
            }
        }
    }

    let total_degrees_of_freedom = total_n - group_covariance_matrices.len();

    for i in 0..num_vars {
        for j in 0..num_vars {
            pooled_cov_matrix[i][j] /= total_degrees_of_freedom as f64;
        }
    }

    // Calculate log determinant of pooled covariance matrix
    let pooled_log_det = calculate_log_determinant(&pooled_cov_matrix);

    // Calculate Box's M statistic
    // M = (n - g) * ln|S| - sum((n_j - 1) * ln|S_j|)
    let mut box_m = ((total_n - group_sizes.len()) as f64) * pooled_log_det;

    for g in 0..group_sizes.len() {
        box_m -= ((group_sizes[g] - 1) as f64) * group_log_determinants[g];
    }

    // Calculate F approximation
    let p = num_vars as f64;
    let g = group_sizes.len() as f64;

    let c1 = (2.0 * p.powi(2) + 3.0 * p - 1.0) / (6.0 * (p + 1.0) * (g - 1.0));

    let c2 = calculate_c2(group_sizes.len(), &group_sizes, total_n);

    let f_approx = box_m * (1.0 - c1 - c2 / box_m);

    let df1 = 0.5 * ((num_vars * (num_vars + 1) * (group_sizes.len() - 1)) as f64);
    let df2 = calculate_df2(c1, c2, df1);

    // Calculate p-value
    let p_value = calculate_p_value_from_f(f_approx / df1, df1, df2);

    Ok(BoxMTest {
        box_m,
        f_approx,
        df1,
        df2,
        p_value,
    })
}

// Helper function to calculate c2 for Box's M test
fn calculate_c2(g: usize, group_sizes: &[usize], total_n: usize) -> f64 {
    let mut sum = 0.0;

    for &n_j in group_sizes {
        sum += 1.0 / ((n_j - 1) as f64);
    }

    sum -= 1.0 / ((total_n - g) as f64);

    (sum * ((g - 1) as f64)) / 6.0
}

// Helper function to calculate df2 for Box's M test
fn calculate_df2(c1: f64, c2: f64, df1: f64) -> f64 {
    (df1 * (1.0 - c1)) / c2
}

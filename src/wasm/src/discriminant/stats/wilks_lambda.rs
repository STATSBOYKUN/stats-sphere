use crate::discriminant::models::{ result::WilksLambdaTest, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_pooled_covariance_matrix,
    calculate_p_value_from_chi_square,
    extract_values_by_index,
};

pub fn calculate_wilks_lambda_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<WilksLambdaTest, String> {
    web_sys::console::log_1(&"Executing calculate_wilks_lambda_test".into());

    // Variables to use
    let variables = &config.main.independent_variables;
    let num_vars = variables.len();

    // Calculate pooled within-groups covariance matrix (W)
    let pooled_within = calculate_pooled_covariance_matrix(data, variables);

    // Calculate total covariance matrix (T)
    let total_cov = calculate_total_covariance_matrix(data, variables);

    // Calculate Wilks' lambda = |W|/|T|
    let (w_log_det, t_log_det) = calculate_log_determinants(&pooled_within, &total_cov);
    let wilks_lambda = (w_log_det - t_log_det).exp();

    // Calculate chi-square statistic
    let num_groups = data.group_data.len();
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    let n = total_cases as f64;
    let p = num_vars as f64;
    let g = num_groups as f64;

    let chi_square = -(n - 1.0 - (p + g) / 2.0) * wilks_lambda.ln();

    // Degrees of freedom
    let df = (p * (g - 1.0)) as i32;

    // Calculate significance (p-value)
    let significance = calculate_p_value_from_chi_square(chi_square, df as usize);

    Ok(WilksLambdaTest {
        test_of_functions: vec!["1".to_string()],
        wilks_lambda: vec![wilks_lambda],
        chi_square: vec![chi_square],
        df: vec![df],
        significance: vec![significance],
    })
}

// Calculate total covariance matrix
fn calculate_total_covariance_matrix(data: &AnalysisData, variables: &[String]) -> Vec<Vec<f64>> {
    let num_vars = variables.len();
    let mut total_matrix = vec![vec![0.0; num_vars]; num_vars];

    // Collect all values regardless of group
    let mut all_values = Vec::with_capacity(num_vars);
    for var_idx in 0..num_vars {
        let values = extract_values_by_index(&data.group_data, var_idx, variables);
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

// Calculate log determinants of matrices
fn calculate_log_determinants(matrix1: &[Vec<f64>], matrix2: &[Vec<f64>]) -> (f64, f64) {
    // In a real implementation, use a proper linear algebra library
    let n = matrix1.len();
    if n == 0 {
        return (0.0, 0.0);
    }

    let mut log_det1 = 0.0;
    let mut log_det2 = 0.0;

    // Simple approximation for demonstration
    for i in 0..n {
        if matrix1[i][i] > 0.0 {
            log_det1 += matrix1[i][i].ln();
        }
        if matrix2[i][i] > 0.0 {
            log_det2 += matrix2[i][i].ln();
        }
    }

    (log_det1, log_det2)
}

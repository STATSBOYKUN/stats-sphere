use std::collections::HashMap;
use nalgebra::DMatrix;
use statrs::distribution::{ FisherSnedecor, ContinuousCDF };

use crate::discriminant::models::{
    result::BoxMTest,
    AnalysisData,
    DiscriminantConfig,
    DataRecord,
    DataValue,
};

const EPSILON: f64 = 1e-10;

pub fn calculate_box_m_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<BoxMTest, String> {
    web_sys::console::log_1(&"Executing calculate_box_m_test".into());

    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;
    let num_vars = independent_variables.len();

    // Flatten the group data for easier processing
    let flattened_group_data: Vec<&DataRecord> = data.group_data
        .iter()
        .flat_map(|records| records.iter())
        .collect();

    // Extract group values by index and track unique groups
    let mut record_groups: HashMap<usize, String> = HashMap::new();
    let mut unique_groups = Vec::new();

    for (i, record) in flattened_group_data.iter().enumerate() {
        for (key, value) in &record.values {
            // Check if this is the grouping variable
            if key == grouping_variable {
                let group_label = match value {
                    DataValue::Number(num) => num.to_string(),
                    DataValue::Text(text) => text.clone(),
                    _ => {
                        continue;
                    }
                };

                record_groups.insert(i, group_label.clone());

                if !unique_groups.contains(&group_label) {
                    unique_groups.push(group_label);
                }

                break;
            }
        }
    }

    unique_groups.sort();

    // Prepare data for each group
    let mut group_data: HashMap<String, Vec<Vec<f64>>> = HashMap::new();

    // Initialize group data structure
    for group in &unique_groups {
        group_data.insert(group.clone(), vec![Vec::new(); num_vars]);
    }

    // Collect data for each group and variable
    for (var_idx, variable) in independent_variables.iter().enumerate() {
        if var_idx >= data.independent_data.len() {
            continue;
        }

        let var_records = &data.independent_data[var_idx];

        for (i, record) in var_records.iter().enumerate() {
            if let Some(group) = record_groups.get(&i) {
                if let Some(DataValue::Number(value)) = record.values.get(variable) {
                    group_data.get_mut(group).unwrap()[var_idx].push(*value);
                }
            }
        }
    }

    // Compute per-group covariance matrices and log determinants
    let mut group_covs = Vec::new();
    let mut group_log_dets = Vec::new();
    let mut group_sizes = Vec::new();

    for group in &unique_groups {
        let group_matrix_data = &group_data[group];

        // Ensure all variables have the same number of observations
        let group_size = group_matrix_data[0].len();
        if group_size <= 1 {
            continue; // Skip groups with insufficient data
        }

        let cov_matrix = compute_group_covariance_matrix(group_matrix_data)?;
        let log_det = compute_log_determinant(&cov_matrix);

        group_covs.push(cov_matrix);
        group_log_dets.push(log_det);
        group_sizes.push(group_size);
    }

    let p = num_vars;
    let k = group_covs.len();
    let total_sample_size: usize = group_sizes.iter().sum();

    // Compute pooled matrix
    let pooled_cov_matrix = compute_pooled_covariance_matrix(&group_covs, &group_sizes);
    let pooled_log_det = compute_log_determinant(&pooled_cov_matrix);

    // Compute Box's M statistic
    let mut box_m = ((total_sample_size - k) as f64) * pooled_log_det;
    for (i, log_det) in group_log_dets.iter().enumerate() {
        box_m -= ((group_sizes[i] - 1) as f64) * log_det;
    }

    // Compute correction factors
    let c1 = compute_c1_factor(p, k);
    let c2 = compute_c2_factor(&group_sizes, total_sample_size);

    // Compute F approximation
    let v1 = ((p * (p + 1) * (k - 1)) as f64) / 2.0;
    let adjusted_m = box_m * (1.0 - c1 - c2 / (box_m + EPSILON));

    let f_approx = if adjusted_m > 0.0 && v1 > 0.0 { adjusted_m / v1 } else { 0.0 };

    // Compute degrees of freedom and p-value
    let df1 = v1;
    let df2 = compute_df2(c1, c2, df1);

    let p_value = if f_approx.is_finite() { compute_p_value(f_approx, df1, df2) } else { 1.0 };

    Ok(BoxMTest {
        box_m,
        f_approx,
        df1,
        df2,
        p_value,
    })
}

fn compute_group_covariance_matrix(group_matrix_data: &[Vec<f64>]) -> Result<DMatrix<f64>, String> {
    let num_vars = group_matrix_data.len();
    let num_cases = group_matrix_data[0].len();

    if num_cases <= 1 {
        return Err("Group too small for covariance computation".to_string());
    }

    // Compute means for each variable
    let mut means = vec![0.0; num_vars];
    for var_idx in 0..num_vars {
        means[var_idx] = group_matrix_data[var_idx].iter().sum::<f64>() / (num_cases as f64);
    }

    // Compute covariance matrix
    let mut cov_matrix = DMatrix::zeros(num_vars, num_vars);

    for var1 in 0..num_vars {
        for var2 in 0..num_vars {
            let mut sum = 0.0;
            for case_idx in 0..num_cases {
                sum +=
                    (group_matrix_data[var1][case_idx] - means[var1]) *
                    (group_matrix_data[var2][case_idx] - means[var2]);
            }
            cov_matrix[(var1, var2)] = sum / ((num_cases - 1) as f64);
        }
    }

    Ok(cov_matrix)
}

fn compute_log_determinant(matrix: &DMatrix<f64>) -> f64 {
    let svd = nalgebra::SVD::new(matrix.clone(), false, false);
    let singular_values = svd.singular_values;

    singular_values
        .iter()
        .filter(|&v| *v > EPSILON)
        .map(|v| v.ln())
        .sum()
}

fn compute_pooled_covariance_matrix(
    group_covs: &[DMatrix<f64>],
    group_sizes: &[usize]
) -> DMatrix<f64> {
    let p = group_covs[0].nrows();
    let mut pooled_cov = DMatrix::zeros(p, p);
    let mut total_df = 0;

    for (cov, &size) in group_covs.iter().zip(group_sizes) {
        let df = size - 1;
        total_df += df;
        pooled_cov += cov * (df as f64);
    }

    if total_df > 0 {
        pooled_cov /= total_df as f64;
    }

    pooled_cov
}

fn compute_c1_factor(p: usize, k: usize) -> f64 {
    (2.0 * (p as f64).powi(2) + 3.0 * (p as f64) - 1.0) /
        (6.0 * ((p as f64) + 1.0) * ((k as f64) - 1.0))
}

fn compute_c2_factor(group_sizes: &[usize], total_sample_size: usize) -> f64 {
    let k = group_sizes.len();
    let mut sum1 = 0.0;

    for &size in group_sizes {
        sum1 += 1.0 / ((size - 1) as f64);
    }

    sum1 -= 1.0 / ((total_sample_size - k) as f64);
    (sum1 * ((k as f64) - 1.0)) / 6.0
}

fn compute_df2(c1: f64, c2: f64, df1: f64) -> f64 {
    (df1 + 2.0) / (c2 / (1.0 - c1).powi(2) + 1e-10)
}

fn compute_p_value(f_approx: f64, df1: f64, df2: f64) -> f64 {
    match FisherSnedecor::new(df1, df2) {
        Ok(dist) => dist.sf(f_approx).max(0.0).min(1.0),
        Err(_) => 1.0,
    }
}

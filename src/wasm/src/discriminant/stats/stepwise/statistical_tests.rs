use std::collections::HashMap;

use nalgebra::DMatrix;
use statrs::distribution::{ ContinuousCDF, FisherSnedecor };

use super::matrix_calculations::calculate_between_within_matrices;

// Calculate univariate F test for a variable
pub fn calculate_univariate_f(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Extract variable data
    let overall_mean = *overall_means.get(variable).unwrap_or(&0.0);

    // Calculate between-groups sum of squares
    let mut between_ss = 0.0;
    let mut within_ss = 0.0;

    // Count valid groups and total valid cases
    let mut valid_groups = 0;
    let mut valid_cases = 0;

    for group_label in group_labels {
        if let Some(group_values) = group_data.get(variable).and_then(|g| g.get(group_label)) {
            if group_values.is_empty() {
                continue;
            }

            valid_groups += 1;
            valid_cases += group_values.len();

            // Get group mean
            let group_mean = group_means
                .get(group_label)
                .and_then(|m| m.get(variable))
                .copied()
                .unwrap_or(0.0);

            // Calculate between-groups SS for this group
            between_ss += (group_values.len() as f64) * (group_mean - overall_mean).powi(2);

            // Calculate within-groups SS for this group
            within_ss += group_values
                .iter()
                .map(|&val| (val - group_mean).powi(2))
                .sum::<f64>();
        }
    }

    // Calculate F statistic
    let f_value = if within_ss > 0.0 && valid_groups > 1 {
        let between_df = valid_groups - 1;
        let within_df = valid_cases - valid_groups;

        between_ss / (between_df as f64) / (within_ss / (within_df as f64))
    } else {
        0.0
    };

    // Calculate Wilks' lambda
    let wilks_lambda = if between_ss + within_ss > 0.0 {
        within_ss / (between_ss + within_ss)
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate overall Wilks' lambda for a set of variables
pub fn calculate_overall_wilks_lambda(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> f64 {
    if variables.is_empty() {
        return 1.0;
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

    // Wilks' lambda = |W| / |B + W|
    // To calculate, we need determinants

    // Calculate determinant of within-groups matrix
    let within_det = match within_mat.clone().determinant() {
        det if det > 0.0 => det,
        _ => 1.0, // Fallback for singular matrix
    };

    // Calculate determinant of total matrix
    let total_mat = between_mat + within_mat;
    let total_det = match total_mat.determinant() {
        det if det > 0.0 => det,
        _ => 1.0, // Fallback for singular matrix
    };

    // Calculate Wilks' lambda
    if total_det > 0.0 {
        within_det / total_det
    } else {
        1.0
    }
}

// Calculate overall F statistic for a set of variables
pub fn calculate_overall_f_statistic(
    wilks_lambda: f64,
    num_variables: usize,
    num_groups: usize,
    total_cases: usize
) -> (f64, i32, i32, i32) {
    let p = num_variables as f64;
    let g = (num_groups as f64) - 1.0;
    let df1 = (p * g) as i32;
    let df2 = (p as i32) + 1;
    let df3 = ((total_cases as f64) - p - g) as i32;

    // Use Rao's approximation
    let s = if p.powi(2) + g.powi(2) - 5.0 != 0.0 {
        ((4.0 * (p.powi(2) + g.powi(2) - 5.0)) / (p.powi(2) * g.powi(2))).sqrt()
    } else {
        1.0
    };

    let r = (total_cases as f64) - 1.0 - (p + g) / 2.0;

    let f_value = if wilks_lambda < 1.0 {
        ((1.0 - wilks_lambda.powf(1.0 / s)) / wilks_lambda.powf(1.0 / s)) * (r / p)
    } else {
        0.0
    };

    (f_value, df1, df2, df3)
}

// Calculate p-value from F statistic
pub fn calculate_p_value_from_f(f_value: f64, df1: f64, df2: f64) -> f64 {
    if f_value <= 0.0 || df1 <= 0.0 || df2 <= 0.0 {
        return 1.0;
    }

    match FisherSnedecor::new(df1, df2) {
        Ok(dist) => {
            // Calculate survival function (1 - CDF)
            dist.sf(f_value)
        }
        Err(_) => 1.0,
    }
}

// Calculate tolerance for a variable
pub fn calculate_tolerance(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    other_variables: &[String]
) -> (f64, f64) {
    if other_variables.is_empty() {
        // When no other variables, tolerance is 1.0
        return (1.0, 1.0);
    }

    // Extract values for target variable
    let mut target_values = Vec::new();

    for group_label in group_labels {
        if let Some(values) = group_data.get(variable).and_then(|g| g.get(group_label)) {
            target_values.extend(values.iter().copied());
        }
    }

    if target_values.is_empty() {
        return (0.0, 0.0);
    }

    // Calculate R² between this variable and others
    let mut r_squared = 0.0;

    if other_variables.len() == 1 {
        // Simple case with one predictor - calculate correlation coefficient
        let other_var = &other_variables[0];
        let mut other_values = Vec::new();

        for group_label in group_labels {
            if let Some(values) = group_data.get(other_var).and_then(|g| g.get(group_label)) {
                other_values.extend(values.iter().copied());
            }
        }

        if other_values.len() == target_values.len() && !other_values.is_empty() {
            let target_mean = target_values.iter().sum::<f64>() / (target_values.len() as f64);
            let other_mean = other_values.iter().sum::<f64>() / (other_values.len() as f64);

            let mut numerator = 0.0;
            let mut denom1 = 0.0;
            let mut denom2 = 0.0;

            for i in 0..target_values.len() {
                numerator += (target_values[i] - target_mean) * (other_values[i] - other_mean);
                denom1 += (target_values[i] - target_mean).powi(2);
                denom2 += (other_values[i] - other_mean).powi(2);
            }

            let r = if denom1 > 0.0 && denom2 > 0.0 {
                numerator / (denom1.sqrt() * denom2.sqrt())
            } else {
                0.0
            };

            r_squared = r.powi(2);
        }
    } else {
        // Multiple predictors - use a simplified estimate
        // In practice, a multiple regression would be used here
        r_squared = 0.2 * (other_variables.len() as f64);
        if r_squared > 0.9 {
            r_squared = 0.9;
        }
    }

    let tolerance = 1.0 - r_squared;
    let min_tolerance = tolerance * 0.8; // Estimate of minimum possible tolerance

    (tolerance, min_tolerance)
}

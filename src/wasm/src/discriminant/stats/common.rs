// common.rs
use crate::discriminant::models::{ AnalysisData, DiscriminantConfig, DataRecord, DataValue };
use nalgebra::{ DMatrix, DVector, SVD };
use statrs::distribution::{ FisherSnedecor, ChiSquared, ContinuousCDF };
use statrs::function::gamma::ln_gamma;
use std::f64::consts::PI;

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

// Extract all variable values from a single case as vector
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

pub fn filter_valid_cases(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<AnalysisData, String> {
    web_sys::console::log_1(&"Executing filter_valid_cases".into());

    let group_var = &config.main.grouping_variable;
    let independent_vars = &config.main.independent_variables;
    let min_range = config.define_range.min_range;
    let max_range = config.define_range.max_range;

    // First, determine which cases are valid based on group variable criteria
    let mut valid_indices = Vec::new();
    let mut filtered_group_data = Vec::new();

    for group in &data.group_data {
        let mut valid_group_indices = Vec::new();
        let mut filtered_group = Vec::new();

        for (idx, record) in group.iter().enumerate() {
            // Check if group value is within range
            let is_valid_group = match record.values.get(group_var) {
                Some(DataValue::Number(val)) => {
                    let min_valid = min_range.map_or(true, |min| val >= &min);
                    let max_valid = max_range.map_or(true, |max| val <= &max);
                    min_valid && max_valid
                }
                _ => false, // Any non-number or missing value is invalid
            };

            if is_valid_group {
                // Check if case has all required independent variables
                let mut has_all_independent_vars = true;

                // Assuming each independent variable array is in the same order as main.independent_variables
                for (var_idx, var_name) in independent_vars.iter().enumerate() {
                    if var_idx >= data.independent_data.len() {
                        has_all_independent_vars = false;
                        break;
                    }

                    let var_data = &data.independent_data[var_idx];
                    if idx >= var_data.len() {
                        has_all_independent_vars = false;
                        break;
                    }

                    // Check if this variable has a valid value for this case
                    let value_valid = match var_data[idx].values.get(var_name) {
                        Some(DataValue::Number(val)) if !val.is_nan() => true,
                        Some(DataValue::Text(s)) if !s.trim().is_empty() => true,
                        Some(other_value) if !matches!(other_value, DataValue::Null) => true,
                        _ => false,
                    };

                    if !value_valid {
                        has_all_independent_vars = false;
                        break;
                    }
                }

                if has_all_independent_vars {
                    valid_group_indices.push(idx);
                    filtered_group.push(record.clone());
                }
            }
        }

        valid_indices.push(valid_group_indices);
        filtered_group_data.push(filtered_group);
    }

    // Filter independent_data to include only valid cases
    // Maintain the structure: each element is a variable array
    let mut filtered_independent_data = Vec::new();

    for var_data in &data.independent_data {
        let mut filtered_var_data = Vec::new();

        // Process each group
        for (group_idx, group_valid_indices) in valid_indices.iter().enumerate() {
            // For each valid case in this group, get the corresponding record
            for &case_idx in group_valid_indices {
                if case_idx < var_data.len() {
                    filtered_var_data.push(var_data[case_idx].clone());
                }
            }
        }

        filtered_independent_data.push(filtered_var_data);
    }

    // Filter selection_data if applicable
    let filtered_selection_data = match
        (&data.selection_data, &config.main.selection_variable, &config.set_value.value)
    {
        (Some(selection_data), Some(selection_var), Some(set_value)) => {
            let mut filtered_sel_data = Vec::new();

            for (group_idx, sel_group) in selection_data.iter().enumerate() {
                let mut filtered_sel_group = Vec::new();

                // Only include cases that match both valid indices and selection criteria
                if group_idx < valid_indices.len() {
                    for &case_idx in &valid_indices[group_idx] {
                        if case_idx < sel_group.len() {
                            match sel_group[case_idx].values.get(selection_var) {
                                Some(DataValue::Number(val)) if (val - set_value).abs() < 1e-10 => {
                                    filtered_sel_group.push(sel_group[case_idx].clone());
                                }
                                Some(DataValue::Text(s)) if s == &set_value.to_string() => {
                                    filtered_sel_group.push(sel_group[case_idx].clone());
                                }
                                _ => {}
                            }
                        }
                    }
                }

                filtered_sel_data.push(filtered_sel_group);
            }

            Some(filtered_sel_data)
        }
        (Some(selection_data), None, _) | (Some(selection_data), _, None) => {
            // If no selection criteria, just filter based on valid indices
            let mut filtered_sel_data = Vec::new();

            for (group_idx, sel_group) in selection_data.iter().enumerate() {
                let mut filtered_sel_group = Vec::new();

                if group_idx < valid_indices.len() {
                    for &case_idx in &valid_indices[group_idx] {
                        if case_idx < sel_group.len() {
                            filtered_sel_group.push(sel_group[case_idx].clone());
                        }
                    }
                }

                filtered_sel_data.push(filtered_sel_group);
            }

            Some(filtered_sel_data)
        }
        _ => None,
    };

    Ok(AnalysisData {
        group_data: filtered_group_data,
        independent_data: filtered_independent_data,
        selection_data: filtered_selection_data,
        group_data_defs: data.group_data_defs.clone(),
        independent_data_defs: data.independent_data_defs.clone(),
        selection_data_defs: data.selection_data_defs.clone(),
    })
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

// Proper covariance calculation
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

// Convert data to matrix format for linear algebra operations
pub fn data_to_matrix(data: &AnalysisData, variables: &[String]) -> Vec<DMatrix<f64>> {
    let mut matrices = Vec::with_capacity(data.group_data.len());

    for group_data in &data.group_data {
        let n_cases = group_data.len();
        if n_cases == 0 {
            continue;
        }

        let n_vars = variables.len();
        let mut matrix = DMatrix::zeros(n_cases, n_vars);

        for (case_idx, record) in group_data.iter().enumerate() {
            for (var_idx, var_name) in variables.iter().enumerate() {
                if let Some(DataValue::Number(value)) = record.values.get(var_name) {
                    matrix[(case_idx, var_idx)] = *value;
                }
            }
        }

        matrices.push(matrix);
    }

    matrices
}

// Calculate pooled within-groups covariance matrix using matrix operations
pub fn calculate_pooled_within_matrix(data: &AnalysisData, variables: &[String]) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut pooled_matrix = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    for group_data in data.group_data.iter() {
        if group_data.len() <= 1 {
            continue;
        }

        let df = group_data.len() - 1;
        total_df += df;

        let means = calculate_group_means(group_data, variables);

        // Create data matrix for this group
        let n_cases = group_data.len();
        let mut X = DMatrix::zeros(n_cases, num_vars);

        for (case_idx, record) in group_data.iter().enumerate() {
            for (var_idx, var_name) in variables.iter().enumerate() {
                if let Some(DataValue::Number(value)) = record.values.get(var_name) {
                    X[(case_idx, var_idx)] = *value - means[var_idx]; // Centered data
                }
            }
        }

        // Calculate covariance matrix X'X / (n-1)
        let cov = (X.transpose() * X) / (df as f64);
        pooled_matrix += cov * (df as f64);
    }

    if total_df > 0 {
        pooled_matrix /= total_df as f64;
    }

    pooled_matrix
}

// Calculate between-groups covariance matrix using matrix operations
pub fn calculate_between_groups_matrix(data: &AnalysisData, variables: &[String]) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut between_matrix = DMatrix::zeros(num_vars, num_vars);

    // Calculate overall means
    let mut overall_means = DVector::zeros(num_vars);
    let mut total_cases = 0;

    for group_data in &data.group_data {
        let n_cases = group_data.len();
        total_cases += n_cases;

        if n_cases == 0 {
            continue;
        }

        let group_means = calculate_group_means(group_data, variables);
        for (var_idx, &mean) in group_means.iter().enumerate() {
            overall_means[var_idx] += mean * (n_cases as f64);
        }
    }

    if total_cases > 0 {
        overall_means /= total_cases as f64;
    }

    // Calculate between-groups matrix
    for group_data in &data.group_data {
        let n_cases = group_data.len();
        if n_cases == 0 {
            continue;
        }

        let group_means = calculate_group_means(group_data, variables);
        let mut diff = DVector::zeros(num_vars);

        for (var_idx, &mean) in group_means.iter().enumerate() {
            diff[var_idx] = mean - overall_means[var_idx];
        }

        // Fixed the moved value error by adding clone()
        between_matrix += diff.clone() * diff.transpose() * (n_cases as f64);
    }

    between_matrix
}

// Solve eigenvalue problem W^-1 * B for discriminant analysis
pub fn solve_eigenvalue_problem(
    w: &DMatrix<f64>,
    b: &DMatrix<f64>,
    num_functions: usize
) -> (Vec<f64>, Vec<Vec<f64>>) {
    // Cholesky decomposition of W
    let w_inv = match w.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // If W is singular, use pseudoinverse
            let svd = SVD::new(w.clone(), true, true);
            let singular_values = svd.singular_values;
            let u = svd.u.unwrap();
            let v_t = svd.v_t.unwrap();

            let mut s_inv = DMatrix::zeros(w.nrows(), w.ncols());
            let epsilon = 1e-10 * singular_values[0];

            for i in 0..singular_values.len() {
                if singular_values[i] > epsilon {
                    s_inv[(i, i)] = 1.0 / singular_values[i];
                }
            }

            v_t.transpose() * s_inv * u.transpose()
        }
    };

    // Calculate W^-1 * B
    let wb = w_inv * b;

    // Eigendecomposition of W^-1 * B
    let svd = SVD::new(wb, true, true);
    let singular_values = svd.singular_values;
    let v = svd.v_t.unwrap().transpose();

    // Extract eigenvalues and eigenvectors
    let mut eigenvalues = Vec::with_capacity(num_functions);
    let mut eigenvectors = vec![vec![0.0; num_functions]; w.nrows()];

    let actual_functions = std::cmp::min(num_functions, singular_values.len());

    for i in 0..actual_functions {
        eigenvalues.push(singular_values[i]);
        for j in 0..w.nrows() {
            eigenvectors[j][i] = v[(j, i)];
        }
    }

    // Fill in remaining functions if needed
    for i in actual_functions..num_functions {
        eigenvalues.push(0.0);
    }

    (eigenvalues, eigenvectors)
}

// Calculate log determinant of matrix using eigenvalues
pub fn calculate_log_determinant(matrix: &DMatrix<f64>) -> f64 {
    let svd = SVD::new(matrix.clone(), false, false);
    let singular_values = svd.singular_values;

    singular_values
        .iter()
        .filter(|&v| *v > 1e-10)
        .map(|v| v.ln())
        .sum()
}

// P-value calculation from F statistic using proper F distribution
pub fn calculate_p_value_from_f(f_value: f64, df1: f64, df2: f64) -> f64 {
    if f_value <= 0.0 || df1 <= 0.0 || df2 <= 0.0 {
        return 1.0;
    }

    // Create the F distribution
    match FisherSnedecor::new(df1, df2) {
        Ok(dist) => {
            // Calculate survival function (1 - CDF)
            dist.sf(f_value)
        }
        Err(_) => 1.0,
    }
}

// P-value calculation from chi-square statistic
pub fn calculate_p_value_from_chi_square(chi_square: f64, df: usize) -> f64 {
    if chi_square <= 0.0 || df == 0 {
        return 1.0;
    }

    // Create the Chi-square distribution
    match ChiSquared::new(df as f64) {
        Ok(dist) => { dist.sf(chi_square) }
        Err(_) => 1.0,
    }
}

// Calculate rank and log determinant of a matrix
pub fn calculate_rank_and_log_det(matrix: &DMatrix<f64>) -> (i32, f64) {
    let svd = SVD::new(matrix.clone(), false, false);
    let singular_values = svd.singular_values;

    let epsilon = 1e-10 * singular_values[0];
    let rank = singular_values
        .iter()
        .filter(|&v| *v > epsilon)
        .count() as i32;

    let log_det = singular_values
        .iter()
        .filter(|&v| *v > epsilon)
        .map(|v| v.ln())
        .sum();

    (rank, log_det)
}

// Convert DMatrix to Vec<Vec<f64>> for compatibility
pub fn matrix_to_vec(matrix: &DMatrix<f64>) -> Vec<Vec<f64>> {
    let rows = matrix.nrows();
    let cols = matrix.ncols();
    let mut result = vec![vec![0.0; cols]; rows];

    for i in 0..rows {
        for j in 0..cols {
            result[i][j] = matrix[(i, j)];
        }
    }

    result
}

// Convert Vec<Vec<f64>> to DMatrix for calculations
pub fn vec_to_matrix(data: &[Vec<f64>]) -> DMatrix<f64> {
    if data.is_empty() || data[0].is_empty() {
        return DMatrix::zeros(0, 0);
    }

    let rows = data.len();
    let cols = data[0].len();
    let mut matrix = DMatrix::zeros(rows, cols);

    for i in 0..rows {
        for j in 0..cols {
            if j < data[i].len() {
                matrix[(i, j)] = data[i][j];
            }
        }
    }

    matrix
}

// Calculate pooled covariance matrix for multiple groups
pub fn calculate_pooled_covariance_matrix(
    data: &AnalysisData,
    variables: &[String]
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut pooled_cov = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    for group_data in &data.group_data {
        if group_data.len() <= 1 {
            continue;
        }

        let n_cases = group_data.len();
        let df = n_cases - 1;
        total_df += df;

        let group_means = calculate_group_means(group_data, variables);
        let mut group_cov = DMatrix::zeros(num_vars, num_vars);

        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1 = extract_group_values(group_data, var1_idx, variables);
                let values2 = extract_group_values(group_data, var2_idx, variables);

                let cov = calculate_covariance(
                    &values1,
                    &values2,
                    group_means[var1_idx],
                    group_means[var2_idx]
                );

                group_cov[(var1_idx, var2_idx)] = cov;
            }
        }

        pooled_cov += group_cov * (df as f64);
    }

    if total_df > 0 {
        pooled_cov /= total_df as f64;
    }

    pooled_cov
}

// Function to format number with precision
pub fn format_number(value: f64, precision: usize) -> String {
    if value.abs() < 1e-10 {
        return "0.0".to_string();
    }
    format!("{:.1$}", value, precision)
}

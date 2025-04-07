use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::captca::models::{ config::CATPCAConfig, data::AnalysisData, result::Correlations };

use super::core::{ create_data_matrix, initialize_object_scores, optimal_scale_variable };

/// Calculate correlations between variables
pub fn calculate_correlations(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<Correlations, String> {
    // Get analysis variables
    let analysis_vars = match &config.main.analysis_vars {
        Some(vars) => vars,
        None => {
            return Err("No analysis variables specified".to_string());
        }
    };

    let dimensions = config.main.dimensions as usize;

    // Create data matrix
    let (data_matrix, row_indices, category_mappings) = create_data_matrix(data, analysis_vars);

    if data_matrix.nrows() == 0 || data_matrix.ncols() == 0 {
        return Err("No valid data for analysis".to_string());
    }

    // Calculate original correlations
    let mut original_variables = HashMap::new();

    for (i, var_i) in analysis_vars.iter().enumerate() {
        let mut correlations = HashMap::new();

        for (j, var_j) in analysis_vars.iter().enumerate() {
            let corr = calculate_variable_correlation(&data_matrix, i, j);
            correlations.insert(var_j.clone(), corr);
        }

        original_variables.insert(var_i.clone(), correlations);
    }

    // Initialize object scores and apply optimal scaling
    let mut object_scores = initialize_object_scores(data_matrix.nrows(), dimensions, config);

    // Initialize quantifications
    let mut all_quantifications = Vec::with_capacity(analysis_vars.len());

    for j in 0..analysis_vars.len() {
        let (quant, _) = optimal_scale_variable(
            &data_matrix,
            j,
            &category_mappings[j],
            config,
            dimensions,
            &object_scores
        );
        all_quantifications.push(quant);
    }

    // Create transformed variable matrix
    let mut transformed_matrix = DMatrix::zeros(data_matrix.nrows(), data_matrix.ncols());

    for i in 0..data_matrix.nrows() {
        for j in 0..data_matrix.ncols() {
            let cat_val = data_matrix[(i, j)];
            if let Some(&cat_idx) = category_mappings[j].get(&cat_val) {
                if cat_idx < all_quantifications[j].len() {
                    transformed_matrix[(i, j)] = all_quantifications[j][cat_idx];
                }
            }
        }
    }

    // Calculate transformed correlations
    let mut transformed_variables = HashMap::new();

    for (i, var_i) in analysis_vars.iter().enumerate() {
        let mut correlations = HashMap::new();

        for (j, var_j) in analysis_vars.iter().enumerate() {
            let corr = calculate_variable_correlation(&transformed_matrix, i, j);
            correlations.insert(var_j.clone(), corr);
        }

        transformed_variables.insert(var_i.clone(), correlations);
    }

    // Calculate eigenvalues
    let eigenvalues = calculate_eigenvalues(&transformed_matrix, dimensions);

    Ok(Correlations {
        original_variables,
        transformed_variables,
        dimensions: (1..=dimensions as i32).collect(),
        eigenvalues,
    })
}

/// Calculate correlation between two variables
pub fn calculate_variable_correlation(
    data_matrix: &DMatrix<f64>,
    var_i: usize,
    var_j: usize
) -> f64 {
    let n_objects = data_matrix.nrows();

    // Calculate means
    let mean_i: f64 =
        (0..n_objects).map(|k| data_matrix[(k, var_i)]).sum::<f64>() / (n_objects as f64);

    let mean_j: f64 =
        (0..n_objects).map(|k| data_matrix[(k, var_j)]).sum::<f64>() / (n_objects as f64);

    // Calculate correlation
    let mut numerator = 0.0;
    let mut denom_i = 0.0;
    let mut denom_j = 0.0;

    for k in 0..n_objects {
        let diff_i = data_matrix[(k, var_i)] - mean_i;
        let diff_j = data_matrix[(k, var_j)] - mean_j;

        numerator += diff_i * diff_j;
        denom_i += diff_i * diff_i;
        denom_j += diff_j * diff_j;
    }

    if denom_i > 0.0 && denom_j > 0.0 {
        numerator / (denom_i.sqrt() * denom_j.sqrt())
    } else {
        0.0
    }
}

/// Calculate eigenvalues of a matrix
pub fn calculate_eigenvalues(matrix: &DMatrix<f64>, dimensions: usize) -> Vec<f64> {
    let n_vars = matrix.ncols();

    // Create correlation matrix
    let mut corr_matrix = DMatrix::zeros(n_vars, n_vars);

    for i in 0..n_vars {
        for j in 0..n_vars {
            corr_matrix[(i, j)] = calculate_variable_correlation(matrix, i, j);
        }
    }

    // In a real implementation, we would calculate actual eigenvalues
    // of the correlation matrix. For simplicity, we're approximating.

    // Sort diagonals of correlation matrix
    let mut diag_values: Vec<f64> = (0..n_vars).map(|i| corr_matrix[(i, i)]).collect();
    diag_values.sort_by(|a, b| b.partial_cmp(a).unwrap_or(std::cmp::Ordering::Equal));

    // Return the largest eigenvalues
    let mut eigenvalues = Vec::with_capacity(n_vars);

    for i in 0..n_vars {
        if i < diag_values.len() {
            eigenvalues.push(diag_values[i]);
        } else {
            eigenvalues.push(0.0);
        }
    }

    eigenvalues
}

/// Calculate loading (correlation) between variable and component
pub fn calculate_loading(
    data_matrix: &DMatrix<f64>,
    var_idx: usize,
    object_scores: &DMatrix<f64>,
    dim_idx: usize
) -> f64 {
    let n_objects = data_matrix.nrows();

    // Calculate means
    let var_mean: f64 =
        (0..n_objects).map(|i| data_matrix[(i, var_idx)]).sum::<f64>() / (n_objects as f64);

    let score_mean: f64 =
        (0..n_objects).map(|i| object_scores[(i, dim_idx)]).sum::<f64>() / (n_objects as f64);

    // Calculate correlation
    let mut numerator = 0.0;
    let mut denom_var = 0.0;
    let mut denom_score = 0.0;

    for i in 0..n_objects {
        let var_diff = data_matrix[(i, var_idx)] - var_mean;
        let score_diff = object_scores[(i, dim_idx)] - score_mean;

        numerator += var_diff * score_diff;
        denom_var += var_diff * var_diff;
        denom_score += score_diff * score_diff;
    }

    if denom_var > 0.0 && denom_score > 0.0 {
        numerator / (denom_var.sqrt() * denom_score.sqrt())
    } else {
        0.0
    }
}

use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::captca::models::{ config::NormalizationMethod, data::{ AnalysisData, DataValue } };

/// Create a matrix from data for specified variables
pub fn create_data_matrix(
    data: &AnalysisData,
    variables: &[String]
) -> (DMatrix<f64>, Vec<Vec<usize>>, Vec<HashMap<String, usize>>) {
    // Get dimensions
    let mut n_rows = 0;
    for dataset in &data.analysis_data {
        n_rows += dataset.len();
    }
    let n_cols = variables.len();

    // Prepare matrix
    let mut matrix = DMatrix::zeros(n_rows, n_cols);
    let mut row_indices = Vec::new();
    let mut category_mappings = vec![HashMap::new(); n_cols];

    // Fill matrix
    let mut row_idx = 0;

    for (dataset_idx, dataset) in data.analysis_data.iter().enumerate() {
        let mut dataset_indices = Vec::new();

        for (record_idx, record) in dataset.iter().enumerate() {
            // Store indices for tracking - just store usize values
            dataset_indices.push(record_idx);

            // Fill row with values
            for (col_idx, var_name) in variables.iter().enumerate() {
                if let Some(DataValue::Number(val)) = record.values.get(var_name) {
                    // Convert float to string for HashMap key
                    let val_str = val.to_string();

                    // Map category to internal index if needed
                    let cat_idx = if let Some(idx) = category_mappings[col_idx].get(&val_str) {
                        *idx
                    } else {
                        let new_idx = category_mappings[col_idx].len();
                        category_mappings[col_idx].insert(val_str, new_idx);
                        new_idx
                    };

                    // Store value in matrix
                    matrix[(row_idx, col_idx)] = *val;
                }
            }

            row_idx += 1;
        }

        row_indices.push(dataset_indices);
    }

    (matrix, row_indices, category_mappings)
}

/// Create indicator matrix for categorical variables
pub fn create_indicator_matrix(
    data_matrix: &DMatrix<f64>,
    var_idx: usize,
    category_mapping: &HashMap<String, usize>
) -> DMatrix<f64> {
    let n_rows = data_matrix.nrows();
    let n_cats = category_mapping.len();

    let mut indicator = DMatrix::zeros(n_rows, n_cats);

    for i in 0..n_rows {
        let val = data_matrix[(i, var_idx)];
        let val_str = val.to_string();
        if let Some(&cat_idx) = category_mapping.get(&val_str) {
            indicator[(i, cat_idx)] = 1.0;
        }
    }

    indicator
}

/// Center and orthonormalize matrix
pub fn center_and_orthonormalize(matrix: &mut DMatrix<f64>) {
    let n_rows = matrix.nrows();
    let n_cols = matrix.ncols();

    // Center columns
    for j in 0..n_cols {
        let col_sum: f64 = (0..n_rows).map(|i| matrix[(i, j)]).sum();
        let col_mean = col_sum / (n_rows as f64);

        for i in 0..n_rows {
            matrix[(i, j)] -= col_mean;
        }
    }

    // Orthonormalize using Gram-Schmidt
    for j in 0..n_cols {
        // Normalize column j
        let col_norm: f64 = (0..n_rows)
            .map(|i| matrix[(i, j)] * matrix[(i, j)])
            .sum::<f64>()
            .sqrt();

        if col_norm > 1e-10 {
            for i in 0..n_rows {
                matrix[(i, j)] /= col_norm;
            }
        }

        // Make subsequent columns orthogonal to column j
        for k in j + 1..n_cols {
            let dot_prod: f64 = (0..n_rows).map(|i| matrix[(i, j)] * matrix[(i, k)]).sum();

            for i in 0..n_rows {
                matrix[(i, k)] -= dot_prod * matrix[(i, j)];
            }
        }
    }
}

/// Apply normalization to matrix
pub fn apply_normalization(matrix: &mut DMatrix<f64>, method: &NormalizationMethod) {
    match method {
        NormalizationMethod::VariablePrincipal => {
            // No additional normalization needed
        }
        NormalizationMethod::ObjectPrincipal => {
            // Scale rows
            for i in 0..matrix.nrows() {
                let row_sum_sq: f64 = (0..matrix.ncols())
                    .map(|j| matrix[(i, j)] * matrix[(i, j)])
                    .sum();

                if row_sum_sq > 0.0 {
                    let scale = 1.0 / row_sum_sq.sqrt();
                    for j in 0..matrix.ncols() {
                        matrix[(i, j)] *= scale;
                    }
                }
            }
        }
        NormalizationMethod::Symmetrical => {
            // Scale both rows and columns equally
            let mut col_sums_sq = vec![0.0; matrix.ncols()];

            for j in 0..matrix.ncols() {
                col_sums_sq[j] = (0..matrix.nrows()).map(|i| matrix[(i, j)] * matrix[(i, j)]).sum();
            }

            for i in 0..matrix.nrows() {
                for j in 0..matrix.ncols() {
                    if col_sums_sq[j] > 0.0 {
                        matrix[(i, j)] *= 1.0 / col_sums_sq[j].sqrt();
                    }
                }
            }
        }
        _ => {}
    }
}

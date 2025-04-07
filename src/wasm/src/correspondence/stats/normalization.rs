use nalgebra::{ DMatrix, SVD };

use crate::correspondence::models::{ config::CorrespondenceAnalysisConfig, data::AnalysisData };

use super::core::{
    calculate_chi_square_distances,
    calculate_column_profiles,
    calculate_euclidean_distances,
    calculate_row_profiles,
};

pub fn apply_normalization(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<(Vec<f64>, Vec<Vec<f64>>, Vec<Vec<f64>>), String> {
    // First, compute the distance matrix based on chosen method
    let distance_matrix = if config.model.chi_square {
        calculate_chi_square_distances(data, config)?
    } else if config.model.euclidean {
        calculate_euclidean_distances(data, config)?
    } else {
        return Err("No distance measure selected".to_string());
    };

    // Get row and column profiles for mass information
    let row_profiles = calculate_row_profiles(data, config)?;
    let column_profiles = calculate_column_profiles(data, config)?;

    // Convert to DMatrix for SVD
    let rows = distance_matrix.len();
    let cols = if rows > 0 { distance_matrix[0].len() } else { 0 };
    let mut flat_data: Vec<f64> = Vec::with_capacity(rows * cols);

    for row in &distance_matrix {
        flat_data.extend(row);
    }

    let z_matrix = DMatrix::from_row_slice(rows, cols, &flat_data);

    // Perform SVD
    let svd = SVD::new(z_matrix, true, true);

    // Extract singular values, left singular vectors (K), and right singular vectors (L)
    let singular_values: Vec<f64> = svd.singular_values.iter().cloned().collect();

    // Get dimensionality
    let dimensions = if config.model.custom {
        config.model.custom_dimensions as usize
    } else {
        config.model.dimensions as usize
    };

    let max_dims = (rows.min(cols) - 1).max(1);
    let dimensions = dimensions.min(max_dims).min(singular_values.len());

    // Extract U and V matrices (left and right singular vectors)
    let u_matrix = svd.u.unwrap();
    let v_matrix = svd.v_t.unwrap().transpose();

    // Convert to Vec<Vec<f64>> format for both left and right singular vectors
    let mut left_vectors: Vec<Vec<f64>> = vec![vec![0.0; dimensions]; rows];
    let mut right_vectors: Vec<Vec<f64>> = vec![vec![0.0; dimensions]; cols];

    for i in 0..rows {
        for j in 0..dimensions {
            left_vectors[i][j] = u_matrix[(i, j)];
        }
    }

    for i in 0..cols {
        for j in 0..dimensions {
            right_vectors[i][j] = v_matrix[(i, j)];
        }
    }

    // Apply normalization based on config (step 5 in algorithm docs)
    let (alpha, beta) = get_normalization_parameters(config);

    // Adjust scores based on normalization parameters (r_is = r_tilde_is * lambda_s^alpha)
    let mut row_scores: Vec<Vec<f64>> = vec![vec![0.0; dimensions]; rows];
    let mut col_scores: Vec<Vec<f64>> = vec![vec![0.0; dimensions]; cols];

    for i in 0..rows {
        for j in 0..dimensions {
            if j < singular_values.len() && row_profiles.mass[i] > 0.0 {
                // Adjust row scores according to formula:
                // r_is = r_tilde_is * lambda_s^alpha = k_is / sqrt(f_i+/N) * lambda_s^alpha
                row_scores[i][j] =
                    (left_vectors[i][j] / row_profiles.mass[i].sqrt()) *
                    singular_values[j].powf(alpha);
            }
        }
    }

    for i in 0..cols {
        for j in 0..dimensions {
            if j < singular_values.len() && column_profiles.mass[i] > 0.0 {
                // Adjust column scores according to formula:
                // c_js = c_tilde_js * lambda_s^beta = l_js / sqrt(f_+j/N) * lambda_s^beta
                col_scores[i][j] =
                    (right_vectors[i][j] / column_profiles.mass[i].sqrt()) *
                    singular_values[j].powf(beta);
            }
        }
    }

    Ok((singular_values, row_scores, col_scores))
}

// Get normalization parameters based on config
pub fn get_normalization_parameters(config: &CorrespondenceAnalysisConfig) -> (f64, f64) {
    if config.model.principal {
        // Principal normalization (both alpha and beta = 1)
        (1.0, 1.0)
    } else if config.model.symmetrical {
        // Symmetrical normalization (alpha = beta = 0.5)
        (0.5, 0.5)
    } else if config.model.row_principal {
        // Row principal normalization (alpha = 1, beta = 0)
        (1.0, 0.0)
    } else if config.model.col_principal {
        // Column principal normalization (alpha = 0, beta = 1)
        (0.0, 1.0)
    } else if config.model.custom {
        // Custom normalization with q parameter
        // Use model.custom_dimensions as a proxy for q value
        let q = ((config.model.custom_dimensions as f64) / 100.0).max(-1.0).min(1.0);
        ((1.0 + q) / 2.0, (1.0 - q) / 2.0)
    } else {
        // Default to symmetrical
        (0.5, 0.5)
    }
}

// Normalize contributions of points to dimensions
pub fn normalize_contributions(contributions: &mut Vec<Vec<f64>>) {
    // Ensure contributions for each dimension sum to 1.0
    if contributions.is_empty() {
        return;
    }

    let dimensions = contributions[0].len();

    for d in 0..dimensions {
        let mut dim_sum = 0.0;
        for row in contributions.iter() {
            if d < row.len() {
                dim_sum += row[d];
            }
        }

        if dim_sum > 0.0 {
            for row in contributions.iter_mut() {
                if d < row.len() {
                    row[d] /= dim_sum;
                }
            }
        }
    }
}

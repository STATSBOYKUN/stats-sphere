use crate::hierarchical::types::{DistanceMetric, BinaryOptions, ClusteringError};
use crate::hierarchical::statistics::metrics::{calculate_distance, precompute_distance_values};
use crate::hierarchical::utils::validation::{validate_data_matrix, validate_finite_distances};
use crate::hierarchical::utils::error::log_warning;

use std::sync::{Arc, Mutex};
use rayon::prelude::*;

// Threshold for parallelization
const PARALLEL_THRESHOLD: usize = 50;

/// Calculate distance matrix for a set of points
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `metric` - Distance metric to use
/// * `params` - Optional parameters for specific metrics
/// * `binary_options` - Options for binary metrics
/// * `warnings` - Vec to collect warnings
/// * `custom_power` - Optional power parameter for Customized metric
/// * `custom_root` - Optional root parameter for Customized metric
///
/// # Returns
/// * Result containing distance matrix or error
pub fn calculate_distance_matrix(
    data: &[Vec<f64>],
    metric: DistanceMetric,
    params: Option<f64>,
    binary_options: Option<&BinaryOptions>,
    warnings: &mut Vec<String>,
    custom_power: Option<f64>,
    custom_root: Option<f64>,
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    // Validate input data
    validate_data_matrix(data, 2)?;
    
    let n = data.len();
    
    // Pre-compute distance values if applicable
    let _precomputed = match precompute_distance_values(data, metric) {
        Ok(result) => result,
        Err(e) => {
            log_warning(
                format!("Warning during distance pre-computation: {}. Continuing without pre-computation.", e),
                warnings
            );
            None
        }
    };
    
    // Initialize distance matrix
    let mut distance_matrix = vec![vec![0.0; n]; n];
    
    // Determine if we should use parallel computation
    if n > PARALLEL_THRESHOLD {
        // Parallel computation with thread-safe mutation
        let parallel_matrix = Arc::new(Mutex::new(distance_matrix));
        
        // Compute distances in parallel
        (0..n).into_par_iter().for_each(|i| {
            let mut row_distances = vec![(0, 0.0); n - i - 1];
            let mut row_count = 0;
            
            for j in (i+1)..n {
                match calculate_distance(&data[i], &data[j], metric, params, binary_options, custom_power, custom_root) {
                    Ok(dist) => {
                        row_distances[row_count] = (j, dist);
                        row_count += 1;
                    },
                    Err(e) => {
                        // Log error but continue with fallback value
                        let fallback_value = match metric {
                            DistanceMetric::Cosine | DistanceMetric::Correlation => 1.0,
                            _ => f64::MAX / 2.0,
                        };
                        
                        let warning = format!(
                            "Error calculating distance between points {} and {}: {}. Using fallback value {}.",
                            i, j, e, fallback_value
                        );
                        web_sys::console::warn_1(&wasm_bindgen::JsValue::from_str(&warning));
                        
                        row_distances[row_count] = (j, fallback_value);
                        row_count += 1;
                    }
                }
            }
            
            // Update the shared matrix
            if let Ok(mut matrix) = parallel_matrix.lock() {
                for (j, dist) in row_distances.iter().take(row_count) {
                    matrix[i][*j] = *dist;
                    matrix[*j][i] = *dist; // Symmetric
                }
            }
        });
        
        // Extract the result from Arc<Mutex<>>
        match Arc::try_unwrap(parallel_matrix) {
            Ok(mutex) => match mutex.into_inner() {
                Ok(matrix) => distance_matrix = matrix,
                Err(e) => {
                    return Err(ClusteringError::DistanceCalculationError(
                        format!("Failed to unwrap mutex: {}", e)
                    ));
                }
            },
            Err(_) => {
                return Err(ClusteringError::DistanceCalculationError(
                    "Failed to unwrap Arc".to_string()
                ));
            }
        }
    } else {
        // Sequential computation for smaller datasets
        for i in 0..n {
            // Set diagonal to 0
            distance_matrix[i][i] = 0.0;
            
            for j in (i+1)..n {
                match calculate_distance(&data[i], &data[j], metric, params, binary_options, custom_power, custom_root) {
                    Ok(dist) => {
                        distance_matrix[i][j] = dist;
                        distance_matrix[j][i] = dist; // Symmetric
                    },
                    Err(e) => {
                        // Log error but continue with fallback value
                        let fallback_value = match metric {
                            DistanceMetric::Cosine | DistanceMetric::Correlation => 1.0,
                            _ => f64::MAX / 2.0,
                        };
                        
                        let warning = format!(
                            "Error calculating distance between points {} and {}: {}. Using fallback value {}.",
                            i, j, e, fallback_value
                        );
                        web_sys::console::warn_1(&wasm_bindgen::JsValue::from_str(&warning));
                        
                        distance_matrix[i][j] = fallback_value;
                        distance_matrix[j][i] = fallback_value; // Symmetric
                    }
                }
            }
        }
    }
    
    // Validate and fix NaN/Infinity values
    if let Err(e) = validate_finite_distances(&mut distance_matrix) {
        log_warning(format!("Warning: {}", e), warnings);
        // Continue with the fixed matrix
    }
    
    Ok(distance_matrix)
}

/// Create a fallback distance matrix when normal computation fails
pub fn create_fallback_distance_matrix(
    data: &[Vec<f64>],
    warnings: &mut Vec<String>
) -> Vec<Vec<f64>> {
    let n = data.len();
    let mut distances = vec![vec![0.0; n]; n];
    
    log_warning(
        "Using fallback Euclidean distance calculation due to errors in primary method",
        warnings
    );

    // Calculate simple Euclidean distance
    for i in 0..n {
        distances[i][i] = 0.0; // Diagonal is 0
        
        for j in (i+1)..n {
            let mut sum_sq = 0.0;
            let mut valid_dims = 0;
            
            // Compute Euclidean distance, skipping NaN values
            for k in 0..data[i].len().min(data[j].len()) {
                if !data[i][k].is_nan() && !data[j][k].is_nan() {
                    let diff = data[i][k] - data[j][k];
                    sum_sq += diff * diff;
                    valid_dims += 1;
                }
            }
            
            let dist = if valid_dims > 0 {
                // Scale by number of dimensions to adjust for missing values
                let scale_factor = data[i].len() as f64 / valid_dims as f64;
                (sum_sq * scale_factor).sqrt()
            } else {
                // No valid dimensions to compare
                f64::MAX / 2.0
            };
            
            distances[i][j] = dist;
            distances[j][i] = dist; // Symmetric
        }
    }
    
    distances
}
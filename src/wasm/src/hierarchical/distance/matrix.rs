use crate::hierarchical::types::{DistanceMetric, BinaryOptions, ClusteringError};
use super::metrics::{calculate_distance, precompute_distance_values};
use std::sync::{Arc, Mutex};
use rayon::prelude::*;

/// Calculate distance matrix for a set of points
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `metric` - Distance metric to use
/// * `params` - Optional parameters for specific metrics
/// * `binary_options` - Options for binary metrics
///
/// # Returns
/// * Result containing distance matrix or error
pub fn calculate_distance_matrix(
    data: &[Vec<f64>],
    metric: DistanceMetric,
    params: Option<f64>,
    binary_options: Option<&BinaryOptions>,
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    let n = data.len();
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "Empty data provided for distance matrix calculation".to_string()
        ));
    }
    
    if n < 2 {
        return Err(ClusteringError::DistanceCalculationError(
            "Need at least 2 data points for distance matrix calculation".to_string()
        ));
    }
    
    // Use Arc<Mutex> for thread-safe mutation
    let distance_matrix = Arc::new(Mutex::new(vec![vec![0.0; n]; n]));
    
    let _precomputed = precompute_distance_values(data, metric)?;
    
    if n > 100 {
        // Parallel computation with thread-safe mutation
        (0..n).into_par_iter().for_each(|i| {
            let mut row = vec![0.0; n];
            for j in (i+1)..n {
                match calculate_distance(&data[i], &data[j], metric, params, binary_options) {
                    Ok(dist) => row[j] = dist,
                    Err(e) => {
                        // Log error but continue (could use a fallback value)
                        eprintln!("Error calculating distance between points {} and {}: {}", i, j, e);
                        row[j] = f64::MAX / 2.0; // Use large but finite value instead of infinity
                    }
                }
            }
            
            // Safely update the shared matrix
            if let Ok(mut matrix) = distance_matrix.lock() {
                for j in (i+1)..n {
                    matrix[i][j] = row[j];
                    matrix[j][i] = row[j]; // Symmetric
                }
            }
        });
    } else {
        // Sequential computation
        let mut matrix = match distance_matrix.lock() {
            Ok(guard) => guard,
            Err(e) => return Err(ClusteringError::DistanceCalculationError(
                format!("Failed to acquire lock: {}", e)
            )),
        };
        
        for i in 0..n {
            // Set diagonal to 0
            matrix[i][i] = 0.0;
            
            for j in (i+1)..n {
                match calculate_distance(&data[i], &data[j], metric, params, binary_options) {
                    Ok(dist) => {
                        matrix[i][j] = dist;
                        matrix[j][i] = dist; // Symmetric
                    },
                    Err(e) => {
                        return Err(ClusteringError::DistanceCalculationError(
                            format!("Error calculating distance between points {} and {}: {}", i, j, e)
                        ));
                    }
                }
            }
        }
    }
    
    // Convert Arc<Mutex<Vec<Vec<f64>>>> back to Vec<Vec<f64>>
    match Arc::try_unwrap(distance_matrix) {
        Ok(mutex) => match mutex.into_inner() {
            Ok(matrix) => Ok(matrix),
            Err(e) => Err(ClusteringError::DistanceCalculationError(
                format!("Failed to unwrap mutex: {}", e)
            )),
        },
        Err(_) => Err(ClusteringError::DistanceCalculationError(
            "Failed to unwrap Arc".to_string()
        )),
    }
}
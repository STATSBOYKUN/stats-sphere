use crate::hierarchical::types::{DistanceTransformation, ClusteringError, StandardizationMethod};
use crate::hierarchical::utils::error::validate;

/// Transform distance matrix based on specified transformation
///
/// # Arguments
/// * `distance_matrix` - Input distance matrix to transform
/// * `transformation` - Transformation to apply
///
/// # Returns
/// * Transformed distance matrix
pub fn transform_distance_matrix(
    distance_matrix: &[Vec<f64>],
    transformation: DistanceTransformation,
) -> Vec<Vec<f64>> {
    if transformation == DistanceTransformation::None {
        return distance_matrix.to_vec();
    }
    
    let n = distance_matrix.len();
    let mut transformed = vec![vec![0.0; n]; n];
    
    match transformation {
        DistanceTransformation::AbsoluteValue => {
            for i in 0..n {
                for j in 0..n {
                    transformed[i][j] = distance_matrix[i][j].abs();
                }
            }
        },
        DistanceTransformation::ChangeSign => {
            for i in 0..n {
                for j in 0..n {
                    transformed[i][j] = -distance_matrix[i][j];
                }
            }
        },
        DistanceTransformation::RescaleZeroToOne => {
            // Find min and max values
            let mut min_val = f64::INFINITY;
            let mut max_val = f64::NEG_INFINITY;
            
            for i in 0..n {
                for j in 0..n {
                    let val = distance_matrix[i][j];
                    if !val.is_nan() && i != j { // Exclude diagonal elements
                        min_val = min_val.min(val);
                        max_val = max_val.max(val);
                    }
                }
            }
            
            let range = max_val - min_val;
            
            if range > f64::EPSILON {
                for i in 0..n {
                    for j in 0..n {
                        if i == j {
                            transformed[i][j] = 0.0;
                        } else {
                            transformed[i][j] = (distance_matrix[i][j] - min_val) / range;
                        }
                    }
                }
            } else {
                // All non-diagonal elements are the same
                for i in 0..n {
                    for j in 0..n {
                        transformed[i][j] = if i == j { 0.0 } else { 0.5 };
                    }
                }
            }
        },
        DistanceTransformation::None => {
            // Just copy the matrix
            for i in 0..n {
                for j in 0..n {
                    transformed[i][j] = distance_matrix[i][j];
                }
            }
        },
    }
    
    transformed
}

/// Standardize data matrix based on specified method
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `method` - Standardization method to use
/// * `standardize_by_case` - Whether to standardize by case (true) or by variable (false)
///
/// # Returns
/// * Result with standardized data matrix or error
pub fn standardize_data(
    data: &[Vec<f64>],
    method: StandardizationMethod,
    standardize_by_case: bool
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    // If no standardization is requested, return a copy of the data
    if method == StandardizationMethod::None {
        return Ok(data.to_vec());
    }
    
    validate(
        !data.is_empty() && !data[0].is_empty(),
        ClusteringError::DataPreparationError,
        "Empty data matrix"
    )?;
    
    let n_cases = data.len();
    let n_vars = data[0].len();
    
    // Copy the data for modification
    let mut standardized = data.to_vec();
    
    if standardize_by_case {
        // Standardize each case (row) separately
        for case in 0..n_cases {
            standardize_row(&mut standardized, case, method)?;
        }
    } else {
        // Standardize each variable (column) separately
        for var in 0..n_vars {
            standardize_column(&mut standardized, var, method)?;
        }
    }
    
    Ok(standardized)
}

/// Standardize a specific column (variable) in the data matrix
fn standardize_column(
    data: &mut [Vec<f64>],
    col_idx: usize,
    method: StandardizationMethod
) -> Result<(), ClusteringError> {
    let n_cases = data.len();
    
    // Extract the column
    let column: Vec<f64> = data.iter().map(|row| row[col_idx]).collect();
    
    // Different standardization methods require different statistics
    match method {
        StandardizationMethod::ZScore => {
            // Calculate mean and standard deviation
            let mean = column.iter().sum::<f64>() / n_cases as f64;
            
            let variance = column.iter()
                .map(|&x| (x - mean).powi(2))
                .sum::<f64>() / n_cases as f64;
            
            let std_dev = variance.sqrt();
            
            if std_dev <= std::f64::EPSILON {
                // Handle zero or near-zero standard deviation
                for case in 0..n_cases {
                    data[case][col_idx] = 0.0;
                }
            } else {
                // Apply z-score standardization
                for case in 0..n_cases {
                    data[case][col_idx] = (data[case][col_idx] - mean) / std_dev;
                }
            }
        },
        StandardizationMethod::RangeNegOneToOne => {
            // Find min and max values
            let min_val = column.iter()
                .fold(f64::INFINITY, |a, &b| a.min(b));
            let max_val = column.iter()
                .fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            
            let range = max_val - min_val;
            
            if range <= std::f64::EPSILON {
                // Handle zero or near-zero range
                for case in 0..n_cases {
                    data[case][col_idx] = 0.0; // Center at 0 for constant values
                }
            } else {
                // Scale to [-1, 1]
                for case in 0..n_cases {
                    data[case][col_idx] = 2.0 * ((data[case][col_idx] - min_val) / range) - 1.0;
                }
            }
        },
        StandardizationMethod::RangeZeroToOne => {
            // Find min and max values
            let min_val = column.iter()
                .fold(f64::INFINITY, |a, &b| a.min(b));
            let max_val = column.iter()
                .fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            
            let range = max_val - min_val;
            
            if range <= std::f64::EPSILON {
                // Handle zero or near-zero range
                for case in 0..n_cases {
                    data[case][col_idx] = 0.5; // Center at 0.5 for constant values
                }
            } else {
                // Scale to [0, 1]
                for case in 0..n_cases {
                    data[case][col_idx] = (data[case][col_idx] - min_val) / range;
                }
            }
        },
        StandardizationMethod::MaxMagnitudeOne => {
            // Find max absolute value
            let max_abs = column.iter()
                .fold(0.0f64, |max: f64, &x| max.max(x.abs()));
            
            if max_abs <= std::f64::EPSILON {
                // Handle zero or near-zero values
                for case in 0..n_cases {
                    data[case][col_idx] = 0.0;
                }
            } else {
                // Scale so max absolute value is 1
                for case in 0..n_cases {
                    data[case][col_idx] = data[case][col_idx] / max_abs;
                }
            }
        },
        StandardizationMethod::MeanOne => {
            // Calculate mean
            let mean = column.iter().sum::<f64>() / n_cases as f64;
            
            if mean.abs() <= std::f64::EPSILON {
                return Err(ClusteringError::DataPreparationError(
                    "Cannot standardize to mean=1 when mean is zero".to_string()
                ));
            }
            
            // Scale so mean is 1
            for case in 0..n_cases {
                data[case][col_idx] = data[case][col_idx] / mean;
            }
        },
        StandardizationMethod::StdDevOne => {
            // Calculate mean and standard deviation
            let mean = column.iter().sum::<f64>() / n_cases as f64;
            
            let variance = column.iter()
                .map(|&x| (x - mean).powi(2))
                .sum::<f64>() / n_cases as f64;
            
            let std_dev = variance.sqrt();
            
            if std_dev <= std::f64::EPSILON {
                return Err(ClusteringError::DataPreparationError(
                    "Cannot standardize to stddev=1 when standard deviation is zero".to_string()
                ));
            }
            
            // Keep the mean but scale so standard deviation is 1
            for case in 0..n_cases {
                data[case][col_idx] = mean + ((data[case][col_idx] - mean) / std_dev);
            }
        },
        StandardizationMethod::None => {
            // No standardization, do nothing
        },
    }
    
    Ok(())
}

/// Standardize a specific row (case) in the data matrix
fn standardize_row(
    data: &mut [Vec<f64>],
    row_idx: usize,
    method: StandardizationMethod
) -> Result<(), ClusteringError> {
    let n_vars = data[0].len();
    
    // Implementation follows similar logic to standardize_column
    // but operates on rows instead
    
    // Different standardization methods require different statistics
    match method {
        StandardizationMethod::ZScore => {
            // Calculate mean and standard deviation for this row
            let mean = data[row_idx].iter().sum::<f64>() / n_vars as f64;
            
            let variance = data[row_idx].iter()
                .map(|&x| (x - mean).powi(2))
                .sum::<f64>() / n_vars as f64;
            
            let std_dev = variance.sqrt();
            
            if std_dev <= std::f64::EPSILON {
                // Handle zero or near-zero standard deviation
                for var in 0..n_vars {
                    data[row_idx][var] = 0.0;
                }
            } else {
                // Apply z-score standardization
                for var in 0..n_vars {
                    data[row_idx][var] = (data[row_idx][var] - mean) / std_dev;
                }
            }
        },
        StandardizationMethod::RangeNegOneToOne => {
            // Find min and max values
            let min_val = data[row_idx].iter()
                .fold(f64::INFINITY, |a, &b| a.min(b));
            let max_val = data[row_idx].iter()
                .fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            
            let range = max_val - min_val;
            
            if range <= std::f64::EPSILON {
                // Handle zero or near-zero range
                for var in 0..n_vars {
                    data[row_idx][var] = 0.0; // Center at 0 for constant values
                }
            } else {
                // Scale to [-1, 1]
                for var in 0..n_vars {
                    data[row_idx][var] = 2.0 * ((data[row_idx][var] - min_val) / range) - 1.0;
                }
            }
        },
        StandardizationMethod::RangeZeroToOne => {
            // Find min and max values
            let min_val = data[row_idx].iter()
                .fold(f64::INFINITY, |a, &b| a.min(b));
            let max_val = data[row_idx].iter()
                .fold(f64::NEG_INFINITY, |a, &b| a.max(b));
            
            let range = max_val - min_val;
            
            if range <= std::f64::EPSILON {
                // Handle zero or near-zero range
                for var in 0..n_vars {
                    data[row_idx][var] = 0.5; // Center at 0.5 for constant values
                }
            } else {
                // Scale to [0, 1]
                for var in 0..n_vars {
                    data[row_idx][var] = (data[row_idx][var] - min_val) / range;
                }
            }
        },
        // Implementasi metode lainnya mengikuti pola yang sama
        _ => {
            return Err(ClusteringError::DataPreparationError(
                format!("Standardization method {:?} not implemented for row standardization", method)
            ));
        }
    }
    
    Ok(())
}
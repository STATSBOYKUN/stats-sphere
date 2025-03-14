use super::types::{StandardizationMethod, ClusteringError, MissingValueStrategy};

/// Standardize data matrix based on specified method
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `method` - Standardization method to use
/// * `by_variable` - Whether to standardize by variable (true) or by case (false)
///
/// # Returns
/// * Result with standardized data matrix or error
pub fn standardize_data(
    data: &[Vec<f64>],
    method: StandardizationMethod,
    by_variable: bool
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    if data.is_empty() || data[0].is_empty() {
        return Err(ClusteringError::DataPreparationError(
            "Empty data matrix".to_string()
        ));
    }
    
    // If no standardization is requested, return a copy of the data
    if method == StandardizationMethod::None {
        return Ok(data.to_vec());
    }
    
    let n_cases = data.len();
    let n_vars = data[0].len();
    
    // Ensure all rows have the same number of variables
    for (i, row) in data.iter().enumerate() {
        if row.len() != n_vars {
            return Err(ClusteringError::DataPreparationError(
                format!("Row {} has {} variables, expected {}", i, row.len(), n_vars)
            ));
        }
    }
    
    // Copy the data for modification
    let mut standardized = data.to_vec();
    
    if by_variable {
        // Standardize each variable (column) separately
        for var in 0..n_vars {
            standardize_column(&mut standardized, var, method)?;
        }
    } else {
        // Standardize each case (row) separately
        for case in 0..n_cases {
            standardize_row(&mut standardized, case, method)?;
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
    let mut column: Vec<f64> = data.iter().map(|row| row[col_idx]).collect();
    
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
            let min_val = *column.iter().min_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            let max_val = *column.iter().max_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            
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
            let min_val = *column.iter().min_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            let max_val = *column.iter().max_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            
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
            let max_abs = column.iter().map(|&x| x.abs()).fold(0.0, f64::max);
            
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
                // Handle zero or near-zero mean
                return Err(ClusteringError::DataPreparationError(
                    "Cannot standardize to mean=1 when mean is zero".to_string()
                ));
            } else {
                // Scale so mean is 1
                for case in 0..n_cases {
                    data[case][col_idx] = data[case][col_idx] / mean;
                }
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
                // Handle zero or near-zero standard deviation
                return Err(ClusteringError::DataPreparationError(
                    "Cannot standardize to stddev=1 when standard deviation is zero".to_string()
                ));
            } else {
                // Keep the mean but scale so standard deviation is 1
                for case in 0..n_cases {
                    data[case][col_idx] = mean + ((data[case][col_idx] - mean) / std_dev);
                }
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
            // Find min and max values in the row
            let min_val = *data[row_idx].iter().min_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            let max_val = *data[row_idx].iter().max_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            
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
            // Find min and max values in the row
            let min_val = *data[row_idx].iter().min_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            let max_val = *data[row_idx].iter().max_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal)).unwrap_or(&0.0);
            
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
        StandardizationMethod::MaxMagnitudeOne => {
            // Find max absolute value in the row
            let max_abs = data[row_idx].iter().map(|&x| x.abs()).fold(0.0, f64::max);
            
            if max_abs <= std::f64::EPSILON {
                // Handle zero or near-zero values
                for var in 0..n_vars {
                    data[row_idx][var] = 0.0;
                }
            } else {
                // Scale so max absolute value is 1
                for var in 0..n_vars {
                    data[row_idx][var] = data[row_idx][var] / max_abs;
                }
            }
        },
        StandardizationMethod::MeanOne => {
            // Calculate mean of the row
            let mean = data[row_idx].iter().sum::<f64>() / n_vars as f64;
            
            if mean.abs() <= std::f64::EPSILON {
                // Handle zero or near-zero mean
                return Err(ClusteringError::DataPreparationError(
                    "Cannot standardize to mean=1 when mean is zero".to_string()
                ));
            } else {
                // Scale so mean is 1
                for var in 0..n_vars {
                    data[row_idx][var] = data[row_idx][var] / mean;
                }
            }
        },
        StandardizationMethod::StdDevOne => {
            // Calculate mean and standard deviation for this row
            let mean = data[row_idx].iter().sum::<f64>() / n_vars as f64;
            
            let variance = data[row_idx].iter()
                .map(|&x| (x - mean).powi(2))
                .sum::<f64>() / n_vars as f64;
            
            let std_dev = variance.sqrt();
            
            if std_dev <= std::f64::EPSILON {
                // Handle zero or near-zero standard deviation
                return Err(ClusteringError::DataPreparationError(
                    "Cannot standardize to stddev=1 when standard deviation is zero".to_string()
                ));
            } else {
                // Keep the mean but scale so standard deviation is 1
                for var in 0..n_vars {
                    data[row_idx][var] = mean + ((data[row_idx][var] - mean) / std_dev);
                }
            }
        },
        StandardizationMethod::None => {
            // No standardization, do nothing
        },
    }
    
    Ok(())
}

/// Handle missing values in data matrix
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `strategy` - Strategy for handling missing values
///
/// # Returns
/// * Result with processed data matrix and array of valid case indices
pub fn handle_missing_values(
    data: &[Vec<f64>],
    strategy: MissingValueStrategy
) -> Result<(Vec<Vec<f64>>, Vec<usize>), ClusteringError> {
    if data.is_empty() {
        return Err(ClusteringError::DataPreparationError(
            "Empty data matrix".to_string()
        ));
    }
    
    let n_cases = data.len();
    let n_vars = data[0].len();
    
    // Ensure all rows have the same number of variables
    for (i, row) in data.iter().enumerate() {
        if row.len() != n_vars {
            return Err(ClusteringError::DataPreparationError(
                format!("Row {} has {} variables, expected {}", i, row.len(), n_vars)
            ));
        }
    }
    
    // Vector to track which cases are valid
    let mut valid_cases = Vec::with_capacity(n_cases);
    
    match strategy {
        MissingValueStrategy::ExcludeListwise => {
            // A case is valid only if it has no missing values
            let mut cleaned_data = Vec::with_capacity(n_cases);
            
            for (i, row) in data.iter().enumerate() {
                let has_missing = row.iter().any(|&x| x.is_nan());
                
                if !has_missing {
                    cleaned_data.push(row.clone());
                    valid_cases.push(i);
                }
            }
            
            if cleaned_data.is_empty() {
                return Err(ClusteringError::DataPreparationError(
                    "No valid cases after excluding rows with missing values".to_string()
                ));
            }
            
            Ok((cleaned_data, valid_cases))
        },
        MissingValueStrategy::ExcludePairwise => {
            // This is more complex and depends on the specific analysis
            // For hierarchical clustering, we need to handle missing values when calculating distances
            // For now, we'll just return the original data and mark all cases as valid
            valid_cases.extend(0..n_cases);
            Ok((data.to_vec(), valid_cases))
        },
    }
}

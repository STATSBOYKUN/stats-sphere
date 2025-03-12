/// Utility functions for discriminant analysis
///
/// General utility functions used across the discriminant analysis implementation

use serde_json::Value;
use crate::discriminant::main::types::results::DiscriminantError;

/// Extract the first field name from a JSON Value
///
/// # Arguments
/// * `value` - JSON value object
///
/// # Returns
/// * Optional first field name found
pub fn extract_first_field_name(value: &Value) -> Option<String> {
    if let Value::Object(map) = value {
        map.keys().next().map(|k| k.clone())
    } else {
        None
    }
}

/// Extract a specific field value from a JSON Value as f64
///
/// # Arguments
/// * `value` - JSON value object
/// * `field_name` - Field name to extract
///
/// # Returns
/// * Optional field value as f64
pub fn extract_field_value(value: &Value, field_name: &str) -> Option<f64> {
    if let Value::Object(map) = value {
        map.get(field_name).and_then(|val| val.as_f64())
    } else {
        None
    }
}

/// Round a value to a specified number of decimal places
///
/// # Arguments
/// * `value` - Value to round
/// * `decimal_places` - Number of decimal places
///
/// # Returns
/// * Rounded value
pub fn round_to_decimal(value: f64, decimal_places: usize) -> f64 {
    let multiplier = 10_f64.powi(decimal_places as i32);
    (value * multiplier).round() / multiplier
}

/// Format a p-value for display
///
/// # Arguments
/// * `p` - p-value
///
/// # Returns
/// * Formatted p-value string
pub fn format_p_value(p: f64) -> String {
    if p < 0.001 {
        "<.001".to_string()
    } else {
        format!("{:.3}", p)[1..].to_string()
    }
}

/// Calculate the percentage of a count relative to a total
///
/// # Arguments
/// * `count` - Count value
/// * `total` - Total value
///
/// # Returns
/// * Percentage
pub fn percentage(count: usize, total: usize) -> f64 {
    if total == 0 {
        0.0
    } else {
        (count as f64 / total as f64) * 100.0
    }
}

/// Check if a vector contains only zeros (with tolerance)
///
/// # Arguments
/// * `vec` - Input vector
/// * `tolerance` - Tolerance for zero comparison
///
/// # Returns
/// * true if all values are effectively zero
pub fn all_zeros(vec: &[f64], tolerance: f64) -> bool {
    vec.iter().all(|&x| x.abs() < tolerance)
}

/// Find the index of the maximum value in a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Optional index of maximum value
pub fn argmax(vec: &[f64]) -> Option<usize> {
    if vec.is_empty() {
        return None;
    }

    vec.iter()
       .enumerate()
       .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
       .map(|(idx, _)| idx)
}

/// Find the index of the minimum value in a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Optional index of minimum value
pub fn argmin(vec: &[f64]) -> Option<usize> {
    if vec.is_empty() {
        return None;
    }

    vec.iter()
       .enumerate()
       .min_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal))
       .map(|(idx, _)| idx)
}

/// Calculate mean of a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Mean value or error if vector is empty
pub fn vector_mean(vec: &[f64]) -> Result<f64, DiscriminantError> {
    if vec.is_empty() {
        return Err(DiscriminantError::InsufficientData);
    }

    Ok(vec.iter().sum::<f64>() / vec.len() as f64)
}

/// Calculate weighted mean of a vector
///
/// # Arguments
/// * `vec` - Input vector
/// * `weights` - Weight vector
///
/// # Returns
/// * Weighted mean or error
pub fn weighted_mean(vec: &[f64], weights: &[f64]) -> Result<f64, DiscriminantError> {
    if vec.is_empty() || vec.len() != weights.len() {
        return Err(DiscriminantError::InvalidInput(
            "Vector and weights must have same non-zero length".to_string()
        ));
    }

    let weight_sum = weights.iter().sum::<f64>();
    if weight_sum.abs() < 1e-10 {
        return Err(DiscriminantError::InvalidInput(
            "Sum of weights must be non-zero".to_string()
        ));
    }

    let weighted_sum = vec.iter()
                          .zip(weights.iter())
                          .map(|(&val, &weight)| val * weight)
                          .sum::<f64>();

    Ok(weighted_sum / weight_sum)
}

/// Scale a vector by a constant
///
/// # Arguments
/// * `vec` - Vector to scale (modified in-place)
/// * `scalar` - Scaling factor
pub fn scale_vector(vec: &mut [f64], scalar: f64) {
    for val in vec.iter_mut() {
        *val *= scalar;
    }
}

/// Get a unique set of values from a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Vector containing unique values
pub fn unique_values<T: Clone + PartialEq>(vec: &[T]) -> Vec<T> {
    let mut result = Vec::new();

    for item in vec {
        if !result.contains(item) {
            result.push(item.clone());
        }
    }

    result
}

/// Count occurrences of each unique value in a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Vector of (value, count) pairs
pub fn value_counts<T: Clone + PartialEq>(vec: &[T]) -> Vec<(T, usize)> {
    let uniques = unique_values(vec);
    
    uniques.into_iter()
           .map(|unique| {
               let count = vec.iter().filter(|&item| *item == unique).count();
               (unique, count)
           })
           .collect()
}

/// Convert field names to standard format (first letter capitalized)
///
/// # Arguments
/// * `name` - Input field name
///
/// # Returns
/// * Standardized field name
pub fn standardize_field_name(name: &str) -> String {
    if name.is_empty() {
        return String::new();
    }

    let mut chars = name.chars();
    match chars.next() {
        Some(first) => first.to_uppercase().to_string() + chars.as_str(),
        None => String::new(),
    }
}

/// Safe access to matrix elements with bounds checking
///
/// # Arguments
/// * `matrix` - Input matrix
/// * `row` - Row index
/// * `col` - Column index
///
/// # Returns
/// * Optional matrix element value
pub fn get_matrix_element(matrix: &[Vec<f64>], row: usize, col: usize) -> Option<f64> {
    matrix.get(row).and_then(|r| r.get(col).copied())
}

/// Safely set matrix element with bounds checking
///
/// # Arguments
/// * `matrix` - Matrix to modify
/// * `row` - Row index
/// * `col` - Column index
/// * `value` - Value to set
///
/// # Returns
/// * true if successful, false if indices out of bounds
pub fn set_matrix_element(matrix: &mut [Vec<f64>], row: usize, col: usize, value: f64) -> bool {
    if row < matrix.len() && col < matrix[row].len() {
        matrix[row][col] = value;
        true
    } else {
        false
    }
}

/// Check if two floating point values are approximately equal
///
/// # Arguments
/// * `a` - First value
/// * `b` - Second value
/// * `epsilon` - Tolerance for comparison
///
/// # Returns
/// * true if values are approximately equal
pub fn approx_equal(a: f64, b: f64, epsilon: f64) -> bool {
    (a - b).abs() < epsilon
}

/// Create empty matrix with specified dimensions
///
/// # Arguments
/// * `rows` - Number of rows
/// * `cols` - Number of columns
///
/// # Returns
/// * Empty matrix initialized with zeros
pub fn create_matrix(rows: usize, cols: usize) -> Vec<Vec<f64>> {
    vec![vec![0.0; cols]; rows]
}

/// Copy matrix to avoid aliasing
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Deep copy of the matrix
pub fn copy_matrix(matrix: &[Vec<f64>]) -> Vec<Vec<f64>> {
    matrix.to_vec()
}

/// Get matrix dimensions
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Tuple of (rows, columns)
pub fn matrix_dimensions(matrix: &[Vec<f64>]) -> (usize, usize) {
    let rows = matrix.len();
    let cols = if rows > 0 { matrix[0].len() } else { 0 };
    (rows, cols)
}

/// Find minimum value in a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Optional minimum value
pub fn vector_min(vec: &[f64]) -> Option<f64> {
    if vec.is_empty() {
        None
    } else {
        let mut min_val = vec[0];
        for &val in vec.iter().skip(1) {
            if val < min_val {
                min_val = val;
            }
        }
        Some(min_val)
    }
}

/// Find maximum value in a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Optional maximum value
pub fn vector_max(vec: &[f64]) -> Option<f64> {
    if vec.is_empty() {
        None
    } else {
        let mut max_val = vec[0];
        for &val in vec.iter().skip(1) {
            if val > max_val {
                max_val = val;
            }
        }
        Some(max_val)
    }
}

/// Calculate median of a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Median value or error if vector is empty
pub fn vector_median(vec: &[f64]) -> Result<f64, DiscriminantError> {
    if vec.is_empty() {
        return Err(DiscriminantError::InsufficientData);
    }
    
    // Create a sorted copy of the vector
    let mut sorted = vec.to_vec();
    sorted.sort_by(|a, b| a.partial_cmp(b).unwrap_or(std::cmp::Ordering::Equal));
    
    let n = sorted.len();
    if n % 2 == 1 {
        // Odd number of elements, return the middle one
        Ok(sorted[n / 2])
    } else {
        // Even number of elements, return the average of the two middle ones
        Ok((sorted[n / 2 - 1] + sorted[n / 2]) / 2.0)
    }
}

/// Calculate sum of a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Sum of all elements
pub fn vector_sum(vec: &[f64]) -> f64 {
    vec.iter().sum()
}

/// Calculate product of a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Product of all elements
pub fn vector_product(vec: &[f64]) -> f64 {
    vec.iter().fold(1.0, |acc, &x| acc * x)
}

/// Calculate standard deviation of a vector
///
/// # Arguments
/// * `vec` - Input vector
///
/// # Returns
/// * Standard deviation or error if insufficient data
pub fn vector_std_dev(vec: &[f64]) -> Result<f64, DiscriminantError> {
    match crate::discriminant::main::stats::variance(vec) {
        Ok(var) => Ok(var.sqrt()),
        Err(e) => Err(e),
    }
}

/// Format a floating point number with specified decimals
///
/// # Arguments
/// * `value` - Value to format
/// * `decimals` - Number of decimal places
///
/// # Returns
/// * Formatted string
pub fn format_float(value: f64, decimals: usize) -> String {
    format!("{:.*}", decimals, value)
}

/// Print a matrix for debugging purposes
///
/// # Arguments
/// * `matrix` - Matrix to print
/// * `label` - Optional label
pub fn print_matrix(matrix: &[Vec<f64>], label: &str) {
    println!("Matrix: {}", label);
    for row in matrix {
        for &val in row {
            print!("{:8.4} ", val);
        }
        println!();
    }
    println!();
}
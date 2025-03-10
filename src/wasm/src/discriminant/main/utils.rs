/// Utility functions for discriminant analysis

use serde_json::Value;

/// Extract the first field name from a JSON Value
pub fn extract_first_field_name(value: &Value) -> Option<String> {
    if let Value::Object(map) = value {
        map.keys().next().map(|k| k.clone())
    } else {
        None
    }
}

/// Round a value to a specified number of decimal places
pub fn round_to_decimal(value: f64, decimal_places: usize) -> f64 {
    let multiplier = 10_f64.powi(decimal_places as i32);
    (value * multiplier).round() / multiplier
}

/// Format a p-value for display
pub fn format_p_value(p: f64) -> String {
    if p < 0.001 {
        return "<.001".to_string();
    } else {
        format!("{:.3}", p)[1..].to_string()
    }
}

/// Calculate the percentage of a count relative to a total
pub fn percentage(count: usize, total: usize) -> f64 {
    if total == 0 {
        0.0
    } else {
        (count as f64 / total as f64) * 100.0
    }
}

/// Convert field names to standard format (first letter capitalized)
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

/// Extract a specific field value from a JSON Value as f64
pub fn extract_field_value(value: &Value, field_name: &str) -> Option<f64> {
    if let Value::Object(map) = value {
        map.get(field_name).and_then(|val| val.as_f64())
    } else {
        None
    }
}

/// Check if a vector contains only zeros
pub fn all_zeros(vec: &[f64]) -> bool {
    vec.iter().all(|&x| x.abs() < 1e-10)
}

/// Find the index of the maximum value in a vector
pub fn argmax(vec: &[f64]) -> Option<usize> {
    if vec.is_empty() {
        return None;
    }

    let mut max_idx = 0;
    let mut max_val = vec[0];

    for (i, &val) in vec.iter().enumerate().skip(1) {
        if val > max_val {
            max_idx = i;
            max_val = val;
        }
    }

    Some(max_idx)
}

/// Find the index of the minimum value in a vector
pub fn argmin(vec: &[f64]) -> Option<usize> {
    if vec.is_empty() {
        return None;
    }

    let mut min_idx = 0;
    let mut min_val = vec[0];

    for (i, &val) in vec.iter().enumerate().skip(1) {
        if val < min_val {
            min_idx = i;
            min_val = val;
        }
    }

    Some(min_idx)
}

/// Compute the trace of a vector (sum of elements)
pub fn vector_sum(vec: &[f64]) -> f64 {
    vec.iter().sum()
}

/// Compute mean of a vector
pub fn vector_mean(vec: &[f64]) -> f64 {
    if vec.is_empty() {
        return 0.0;
    }

    vector_sum(vec) / vec.len() as f64
}

/// Compute weighted mean of a vector
pub fn weighted_mean(vec: &[f64], weights: &[f64]) -> f64 {
    if vec.is_empty() || vec.len() != weights.len() {
        return 0.0;
    }

    let weight_sum = weights.iter().sum::<f64>();
    if weight_sum == 0.0 {
        return 0.0;
    }

    let mut weighted_sum = 0.0;
    for i in 0..vec.len() {
        weighted_sum += vec[i] * weights[i];
    }

    weighted_sum / weight_sum
}

/// Scale a vector by a constant
pub fn scale_vector(vec: &mut [f64], scalar: f64) {
    for val in vec.iter_mut() {
        *val *= scalar;
    }
}

/// Normalize a vector to unit length
pub fn normalize_vector(vec: &mut [f64]) {
    let norm = vec.iter().map(|x| x * x).sum::<f64>().sqrt();
    if norm > 0.0 {
        scale_vector(vec, 1.0 / norm);
    }
}

/// Compute the norm of a vector
pub fn vector_norm(vec: &[f64]) -> f64 {
    vec.iter().map(|x| x * x).sum::<f64>().sqrt()
}

/// Check if a value is effectively zero
pub fn is_zero(value: f64) -> bool {
    value.abs() < 1e-10
}

/// Check if a value is effectively close to another
pub fn is_close(a: f64, b: f64, rtol: f64, atol: f64) -> bool {
    (a - b).abs() <= atol + rtol * b.abs()
}

/// Get a unique set of values from a vector
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
pub fn value_counts<T: Clone + PartialEq>(vec: &[T]) -> Vec<(T, usize)> {
    let uniques = unique_values(vec);
    let mut counts = Vec::with_capacity(uniques.len());

    for unique in uniques {
        let count = vec.iter().filter(|&item| *item == unique).count();
        counts.push((unique, count));
    }

    counts
}

/// Transpose a matrix (convert rows to columns and vice versa)
pub fn transpose<T: Clone>(matrix: &[Vec<T>]) -> Vec<Vec<T>> {
    if matrix.is_empty() || matrix[0].is_empty() {
        return Vec::new();
    }

    let rows = matrix.len();
    let cols = matrix[0].len();

    let mut result = vec![Vec::with_capacity(rows); cols];

    for i in 0..rows {
        for j in 0..cols {
            if j < matrix[i].len() {
                result[j].push(matrix[i][j].clone());
            }
        }
    }

    result
}

/// Create a identity matrix of specified size
pub fn identity_matrix(size: usize) -> Vec<Vec<f64>> {
    let mut result = vec![vec![0.0; size]; size];

    for i in 0..size {
        result[i][i] = 1.0;
    }

    result
}

/// Create a diagonal matrix from a vector
pub fn diagonal_matrix(diagonal: &[f64]) -> Vec<Vec<f64>> {
    let size = diagonal.len();
    let mut result = vec![vec![0.0; size]; size];

    for i in 0..size {
        result[i][i] = diagonal[i];
    }

    result
}
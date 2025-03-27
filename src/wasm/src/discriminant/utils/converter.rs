use serde_json::Value;

/// Extract the first field name from a JSON Value
///
/// # Arguments
/// * `value` - JSON value object
///
/// # Returns
/// * Optional first field name found
pub fn extract_field_name(value: &Value) -> Option<String> {
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
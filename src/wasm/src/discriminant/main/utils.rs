 /// Utility functions for discriminant analysis

 use serde_json::Value;
 use crate::discriminant::main::types::results::DiscriminantError;

 /// Extract the first field name from a JSON Value
 pub fn extract_first_field_name(value: &Value) -> Option<String> {
     if let Value::Object(map) = value {
         map.keys().next().map(|k| k.clone())
     } else {
         None
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

 /// Check if a vector contains only zeros (with tolerance)
 pub fn all_zeros(vec: &[f64], tolerance: f64) -> bool {
     vec.iter().all(|&x| x.abs() < tolerance)
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

 /// Calculate mean of a vector
 pub fn vector_mean(vec: &[f64]) -> Result<f64, DiscriminantError> {
     if vec.is_empty() {
         return Err(DiscriminantError::InsufficientData);
     }

     Ok(vec.iter().sum::<f64>() / vec.len() as f64)
 }

 /// Calculate weighted mean of a vector
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

     let mut weighted_sum = 0.0;
     for i in 0..vec.len() {
         weighted_sum += vec[i] * weights[i];
     }

     Ok(weighted_sum / weight_sum)
 }

 /// Scale a vector by a constant
 pub fn scale_vector(vec: &mut [f64], scalar: f64) {
     for val in vec.iter_mut() {
         *val *= scalar;
     }
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

 /// Safe access to matrix elements with bounds checking
 pub fn get_matrix_element(matrix: &[Vec<f64>], row: usize, col: usize) -> Option<f64> {
     matrix.get(row).and_then(|r| r.get(col).copied())
 }

 /// Safely set matrix element with bounds checking
 pub fn set_matrix_element(matrix: &mut [Vec<f64>], row: usize, col: usize, value: f64) -> bool {
     if row < matrix.len() && col < matrix[row].len() {
         matrix[row][col] = value;
         true
     } else {
         false
     }
 }

 /// Check if two floating point values are approximately equal
 pub fn approx_equal(a: f64, b: f64, epsilon: f64) -> bool {
     (a - b).abs() < epsilon
 }

 /// Create empty matrix with specified dimensions
 pub fn create_matrix(rows: usize, cols: usize) -> Vec<Vec<f64>> {
     vec![vec![0.0; cols]; rows]
 }

 /// Copy matrix to avoid aliasing
 pub fn copy_matrix(matrix: &[Vec<f64>]) -> Vec<Vec<f64>> {
     matrix.to_vec()
 }

 /// Get matrix dimensions
 pub fn matrix_dimensions(matrix: &[Vec<f64>]) -> (usize, usize) {
     let rows = matrix.len();
     let cols = if rows > 0 { matrix[0].len() } else { 0 };
     (rows, cols)
 }
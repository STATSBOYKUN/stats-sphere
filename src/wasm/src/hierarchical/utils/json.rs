use crate::hierarchical::types::ClusteringError;
use serde_json::Value;
use crate::ensure;

/// Extract data from JSON object array
///
/// # Arguments
/// * `data` - Vector of JSON objects containing variable data
/// * `variable_name` - Name of the variable to extract
///
/// # Returns
/// * Vector of f64 values or error
pub fn extract_data_from_json(
    data: &[Value],
    variable_name: &str
) -> Result<Vec<f64>, ClusteringError> {
    let mut values = Vec::with_capacity(data.len());
    
    for (i, item) in data.iter().enumerate() {
        match extract_numeric_value(item, variable_name) {
            Some(val) => values.push(val),
            None => return Err(ClusteringError::DataPreparationError(
                format!("Failed to extract numeric value for '{}' at index {}", variable_name, i)
            )),
        }
    }
    
    Ok(values)
}

/// Extract numeric value from a JSON object
///
/// # Arguments
/// * `obj` - JSON object
/// * `key` - Key to extract
///
/// # Returns
/// * Option containing f64 value if found and numeric
fn extract_numeric_value(obj: &Value, key: &str) -> Option<f64> {
    // Try direct access first
    if let Some(value) = obj.get(key) {
        if let Some(num) = value.as_f64() {
            return Some(num);
        }
    }
    
    // Then try as an object with the key as a field
    if let Some(inner_obj) = obj.as_object() {
        if inner_obj.contains_key(key) {
            if let Some(num) = inner_obj[key].as_f64() {
                return Some(num);
            }
        }
        
        // Try all fields for an object with the given key
        for (_, value) in inner_obj {
            if let Some(inner_inner) = value.as_object() {
                if inner_inner.contains_key(key) {
                    if let Some(num) = inner_inner[key].as_f64() {
                        return Some(num);
                    }
                }
            }
        }
    }
    
    None
}

/// Extract variable names from a dataset description
///
/// # Arguments
/// * `schema` - JSON array containing variable schema information
///
/// # Returns
/// * Vector of variable names
pub fn extract_variable_names(schema: &[Value]) -> Result<Vec<String>, ClusteringError> {
    let mut names = Vec::with_capacity(schema.len());
    
    for (i, item) in schema.iter().enumerate() {
        if let Some(var_info) = item.as_array().and_then(|arr| arr.first()) {
            if let Some(name) = var_info.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            } else {
                return Err(ClusteringError::DataPreparationError(
                    format!("Failed to extract variable name at index {}", i)
                ));
            }
        } else {
            return Err(ClusteringError::DataPreparationError(
                format!("Invalid schema format at index {}", i)
            ));
        }
    }
    
    Ok(names)
}

/// Parse input data from JSON
///
/// # Arguments
/// * `data_json` - JSON array of data points
/// * `variable_names` - Names of variables to extract
///
/// # Returns
/// * Matrix of f64 values (rows are cases, columns are variables)
pub fn parse_input_data(
    data_json: &[Value],
    variable_names: &[String]
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    let n_cases = if !data_json.is_empty() {
        if let Some(first_var) = data_json.first() {
            first_var.as_array().map_or(0, |arr| arr.len())
        } else {
            0
        }
    } else {
        0
    };
    
    ensure!(n_cases > 0,
        ClusteringError::DataPreparationError,
        "Empty data provided"
    );
    
    let n_vars = variable_names.len();
    
    // Create case-by-variable matrix
    let mut data_matrix = vec![vec![0.0; n_vars]; n_cases];
    
    for (var_idx, var_name) in variable_names.iter().enumerate() {
        // Find the data for this variable
        let var_data = data_json.iter()
            .find_map(|arr| {
                if let Some(var_arr) = arr.as_array() {
                    if var_arr.iter().any(|item| {
                        if let Some(obj) = item.as_object() {
                            obj.contains_key(var_name)
                        } else {
                            false
                        }
                    }) {
                        return Some(var_arr);
                    }
                }
                None
            })
            .ok_or_else(|| ClusteringError::DataPreparationError(
                format!("Failed to find data for variable '{}'", var_name)
            ))?;
        
        // Extract values
        for (case_idx, case_data) in var_data.iter().enumerate() {
            if case_idx >= n_cases {
                break;
            }
            
            let value = extract_numeric_value(case_data, var_name).unwrap_or(f64::NAN);
            data_matrix[case_idx][var_idx] = value;
        }
    }
    
    Ok(data_matrix)
}
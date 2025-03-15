use crate::kmeans::types::{config::*, data::*};
use crate::kmeans::utils::error::{KMeansError, KMeansResult};
use crate::kmeans::types::data::{KMeansInput};
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::{from_value, to_value, Value};
use crate::ensure_kmeans;

/// Convert a JsValue to a Rust type using serde deserialization.
///
/// # Arguments
/// * `value` - The JavaScript value to convert
///
/// # Returns
/// * `KMeansResult<T>` - The deserialized Rust value or an error
pub fn from_js_value<T>(value: &JsValue) -> KMeansResult<T>
where
    T: for<'a> Deserialize<'a>,
{
    let value: Value = serde_wasm_bindgen::from_value(value.clone())
        .map_err(|e| KMeansError::SerializationError(format!("Failed to deserialize JS value: {}", e)))?;
    
    from_value(value)
        .map_err(|e| KMeansError::SerializationError(format!("Failed to convert JSON to Rust type: {}", e)))
}

/// Convert a Rust type to a JsValue using serde serialization.
///
/// # Arguments
/// * `value` - The Rust value to convert
///
/// # Returns
/// * `KMeansResult<JsValue>` - The serialized JavaScript value or an error
pub fn to_js_value<T>(value: &T) -> KMeansResult<JsValue>
where
    T: Serialize,
{
    let json = to_value(value)
        .map_err(|e| KMeansError::SerializationError(format!("Failed to convert Rust type to JSON: {}", e)))?;
    
    Ok(serde_wasm_bindgen::to_value(&json)
        .map_err(|e| KMeansError::SerializationError(format!("Failed to serialize to JS value: {}", e)))?)
}

/// Parse all input data for K-Means clustering from JavaScript values.
///
/// # Arguments
/// * `temp_data` - Configuration settings
/// * `sliced_data_for_target` - Target variable data
/// * `sliced_data_for_case_target` - Case target variable data
/// * `var_defs_for_target` - Variable definitions for targets
/// * `var_defs_for_case_target` - Variable definitions for case targets
///
/// # Returns
/// * `KMeansResult<KMeansInput>` - The parsed input data or an error
pub fn parse_kmeans_input(
    temp_data: &JsValue,
    sliced_data_for_target: &JsValue,
    sliced_data_for_case_target: &JsValue,
    var_defs_for_target: &JsValue,
    var_defs_for_case_target: &JsValue,
) -> KMeansResult<KMeansInput> {
    // Use our ensure macro to check validity
    ensure_kmeans!(
        !temp_data.is_null() && !temp_data.is_undefined(),
        KMeansError::InvalidInput,
        "Configuration data cannot be null or undefined"
    );
    
    ensure_kmeans!(
        !sliced_data_for_target.is_null() && !sliced_data_for_target.is_undefined(),
        KMeansError::InvalidInput,
        "Target data cannot be null or undefined"
    );
    
    Ok(KMeansInput {
        temp_data: from_js_value(temp_data)?,
        sliced_data_for_target: from_js_value(sliced_data_for_target)?,
        sliced_data_for_case_target: from_js_value(sliced_data_for_case_target)?,
        var_defs_for_target: from_js_value(var_defs_for_target)?,
        var_defs_for_case_target: from_js_value(var_defs_for_case_target)?,
    })
}

/// Extract a numeric value from a JSON value, with conversion if necessary.
///
/// # Arguments
/// * `value` - The JSON value to convert
///
/// # Returns
/// * `KMeansResult<f64>` - The extracted numeric value or an error
pub fn extract_numeric_value(value: &Value) -> KMeansResult<f64> {
    match value {
        Value::Number(n) => {
            if let Some(num) = n.as_f64() {
                Ok(num)
            } else {
                Err(KMeansError::NumericConversion(format!(
                    "Could not convert number: {:?}", n
                )))
            }
        },
        Value::String(s) => {
            match s.parse::<f64>() {
                Ok(num) => Ok(num),
                Err(_) => {
                    // For nominal values represented as strings (like "0" or "1")
                    if s == "0" {
                        Ok(0.0)
                    } else if s == "1" {
                        Ok(1.0)
                    } else {
                        Err(KMeansError::NumericConversion(format!(
                            "Could not parse string as number: {:?}", s
                        )))
                    }
                }
            }
        },
        _ => Err(KMeansError::NumericConversion(format!(
            "Value is not numeric: {:?}", value
        ))),
    }
}
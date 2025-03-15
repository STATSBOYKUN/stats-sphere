use wasm_bindgen::prelude::*;
use serde_json::Value;

use crate::hierarchical::types::{StandardizationMethod, MissingValueStrategy, ClusteringError};
use crate::hierarchical::utils::*;

/// Standardize data from JavaScript
///
/// # Arguments
/// * `data_json` - JSON data array
/// * `method_str` - Standardization method
/// * `by_case` - Whether to standardize by case (true) or by variable (false)
///
/// # Returns
/// * Standardized data array
#[wasm_bindgen]
pub fn preprocess_data(
    data_json: &JsValue,
    method_str: &str,
    by_case: bool
) -> Result<JsValue, JsValue> {
    // Parse data
    let data: Vec<Vec<f64>> = match serde_wasm_bindgen::from_value(data_json.clone()) {
        Ok(d) => d,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Failed to parse data: {}", e)));
        }
    };
    
    // Convert method string to enum
    let method = match method_str {
        "ZScore" => StandardizationMethod::ZScore,
        "RangeNegOneToOne" => StandardizationMethod::RangeNegOneToOne,
        "RangeZeroToOne" => StandardizationMethod::RangeZeroToOne,
        "MaxMagnitudeOne" => StandardizationMethod::MaxMagnitudeOne,
        "MeanOne" => StandardizationMethod::MeanOne,
        "StdDevOne" => StandardizationMethod::StdDevOne,
        "None" => StandardizationMethod::None,
        _ => {
            return Err(JsValue::from_str(&format!("Unknown standardization method: {}", method_str)));
        }
    };
    
    // Apply standardization
    let result = match transform::standardize_data(&data, method, by_case) {
        Ok(standardized) => standardized,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Standardization failed: {}", e)));
        }
    };
    
    // Return as JS value
    match serde_wasm_bindgen::to_value(&result) {
        Ok(js_result) => Ok(js_result),
        Err(e) => Err(JsValue::from_str(&format!("Failed to serialize result: {}", e))),
    }
}

/// Handle missing values from JavaScript
///
/// # Arguments
/// * `data_json` - JSON data array
/// * `strategy_str` - Missing value strategy
///
/// # Returns
/// * Processed data array and valid case indices
#[wasm_bindgen]
pub fn handle_missing_values(
    data_json: &JsValue,
    strategy_str: &str
) -> Result<JsValue, JsValue> {
    // Parse data
    let data: Vec<Vec<f64>> = match serde_wasm_bindgen::from_value(data_json.clone()) {
        Ok(d) => d,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Failed to parse data: {}", e)));
        }
    };
    
    // Convert strategy string to enum
    let strategy = match strategy_str {
        "ExcludeListwise" => MissingValueStrategy::ExcludeListwise,
        "ExcludePairwise" => MissingValueStrategy::ExcludePairwise,
        _ => {
            return Err(JsValue::from_str(&format!("Unknown missing value strategy: {}", strategy_str)));
        }
    };
    
    // Handle missing values
    let result = match missing::handle_missing_values(&data, strategy) {
        Ok((processed_data, valid_case_ids)) => {
            // Create result object
            #[derive(serde::Serialize)]
            struct Result {
                data: Vec<Vec<f64>>,
                valid_case_ids: Vec<usize>,
            }
            
            Result {
                data: processed_data,
                valid_case_ids,
            }
        },
        Err(e) => {
            return Err(JsValue::from_str(&format!("Missing value handling failed: {}", e)));
        }
    };
    
    // Return as JS value
    match serde_wasm_bindgen::to_value(&result) {
        Ok(js_result) => Ok(js_result),
        Err(e) => Err(JsValue::from_str(&format!("Failed to serialize result: {}", e))),
    }
}

/// Impute missing values from JavaScript
///
/// # Arguments
/// * `data_json` - JSON data array
/// * `method` - Imputation method ("mean", "zero", etc.)
///
/// # Returns
/// * Imputed data array
#[wasm_bindgen]
pub fn impute_missing_values(
    data_json: &JsValue,
    method: &str
) -> Result<JsValue, JsValue> {
    // Parse data
    let data: Vec<Vec<f64>> = match serde_wasm_bindgen::from_value(data_json.clone()) {
        Ok(d) => d,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Failed to parse data: {}", e)));
        }
    };
    
    // Validate method
    if method != "mean" && method != "zero" {
        return Err(JsValue::from_str(&format!("Unknown imputation method: {}", method)));
    }
    
    // Impute missing values
    let result = match missing::impute_missing_values(&data, method) {
        Ok(imputed_data) => imputed_data,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Imputation failed: {}", e)));
        }
    };
    
    // Return as JS value
    match serde_wasm_bindgen::to_value(&result) {
        Ok(js_result) => Ok(js_result),
        Err(e) => Err(JsValue::from_str(&format!("Failed to serialize result: {}", e))),
    }
}
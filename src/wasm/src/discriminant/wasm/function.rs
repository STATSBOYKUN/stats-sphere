use wasm_bindgen::prelude::*;
use serde_json::Value;
use crate::discriminant::stats::core::DiscriminantAnalysis;
use crate::discriminant::models::config::Config;
use crate::discriminant::utils::error::DiscriminantError;
use crate::discriminant::models::data::VarDef;

/// Format DiscriminantError to JsValue
fn format_error(err: DiscriminantError) -> JsValue {
    JsValue::from_str(&format!("{}", err))
}

/// Filter data based on selection criteria
pub fn filter_data_by_selection(
    data: &[Value],
    selection_data: &[Value],
    selection_field_name: &str,
    filter_value: f64
) -> Vec<Value> {
    if selection_data.is_empty() {
        return data.to_vec();
    }

    let filtered_indices: Vec<usize> = selection_data
        .iter()
        .enumerate()
        .filter_map(|(idx, value)| {
            if let Some(field_value) = value.get(selection_field_name).and_then(|v| v.as_f64()) {
                if (field_value - filter_value).abs() < std::f64::EPSILON {
                    Some(idx)
                } else {
                    None
                }
            } else {
                None
            }
        })
        .collect();

    filtered_indices
        .iter()
        .filter_map(|&idx| {
            if idx < data.len() { Some(data[idx].clone()) } else { None }
        })
        .collect()
}

/// Extract variable definitions from var_defs arrays
pub fn extract_var_defs(
    group_var_defs: &[Vec<VarDef>],
    independent_var_defs: &[Vec<VarDef>],
    selection_var_defs_opt: Option<&[Vec<VarDef>]>
) -> Vec<VarDef> {
    let mut all_var_defs = Vec::new();

    // Extract group variable definitions
    for var_def_group in group_var_defs {
        for var_def in var_def_group {
            all_var_defs.push(var_def.clone());
        }
    }

    // Extract independent variable definitions
    for var_def_group in independent_var_defs {
        for var_def in var_def_group {
            all_var_defs.push(var_def.clone());
        }
    }

    // Extract selection variable definitions if available
    if let Some(selection_defs) = selection_var_defs_opt {
        for var_def_group in selection_defs {
            for var_def in var_def_group {
                all_var_defs.push(var_def.clone());
            }
        }
    }

    all_var_defs
}

/// Perform discriminant analysis with given data and configuration
///
/// # Arguments
/// * `group_variable` - JSON string containing group data
/// * `independent_variable` - JSON string containing independent variable data
/// * `selection_data` - JSON string containing selection data for filtering
/// * `config_json` - JSON object containing configuration
/// * `group_var_defs` - Definitions for group variables
/// * `independent_var_defs` - Definitions for independent variables
/// * `selection_var_defs` - Definitions for selection variables
///
/// # Returns
/// * JSON string with analysis results
#[wasm_bindgen]
pub fn perform_discriminant_analysis(
    group_variable: &JsValue,
    independent_variable: &JsValue,
    selection_data: &JsValue,
    config_json: &JsValue,
    group_var_defs: &JsValue,
    independent_var_defs: &JsValue,
    selection_var_defs: &JsValue
) -> Result<JsValue, JsValue> {
    // Convert JS values to Rust types
    let group_data: Vec<Value> = serde_wasm_bindgen
        ::from_value(group_variable.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse group data: {}", e)))?;

    let independent_data: Vec<Value> = serde_wasm_bindgen
        ::from_value(independent_variable.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse independent data: {}", e)))?;

    let selection_data_parsed: Option<Vec<Value>> = serde_wasm_bindgen
        ::from_value(selection_data.clone())
        .ok();

    // Parse variable definitions
    let group_var_defs_parsed: Vec<Vec<VarDef>> = serde_wasm_bindgen
        ::from_value(group_var_defs.clone())
        .map_err(|e|
            JsValue::from_str(&format!("Failed to parse group variable definitions: {}", e))
        )?;

    let independent_var_defs_parsed: Vec<Vec<VarDef>> = serde_wasm_bindgen
        ::from_value(independent_var_defs.clone())
        .map_err(|e|
            JsValue::from_str(&format!("Failed to parse independent variable definitions: {}", e))
        )?;

    let selection_var_defs_parsed: Option<Vec<Vec<VarDef>>> = serde_wasm_bindgen
        ::from_value(selection_var_defs.clone())
        .ok();

    // Parse configuration
    let config: Config = serde_wasm_bindgen
        ::from_value(config_json.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse configuration: {}", e)))?;

    // Create discriminant analysis object with the new signature
    let mut analysis = DiscriminantAnalysis::new(
        group_data,
        independent_data,
        selection_data_parsed,
        &config,
        group_var_defs_parsed,
        independent_var_defs_parsed,
        selection_var_defs_parsed
    ).map_err(format_error)?;

    // Compute canonical discriminant functions
    analysis.compute_canonical_discriminant_functions().map_err(format_error)?;

    // Perform stepwise analysis if configured
    if config.main.stepwise {
        analysis.perform_stepwise_analysis().map_err(format_error)?;
    }

    // Get results
    let results = analysis.get_results().map_err(format_error)?;

    // Return results as JSON
    serde_wasm_bindgen
        ::to_value(&results)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
}

/// Classify new data with trained model
///
/// # Arguments
/// * `trained_model` - JSON string containing trained model
/// * `new_data` - JSON array of feature values
///
/// # Returns
/// * JSON string with classification results
#[wasm_bindgen]
pub fn classify_new_data(trained_model: &JsValue, new_data: &JsValue) -> Result<JsValue, JsValue> {
    // Deserialize the trained model
    let model: DiscriminantAnalysis = serde_wasm_bindgen
        ::from_value(trained_model.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize model: {}", e)))?;

    // Convert JS values to Rust types
    let data: Vec<Vec<f64>> = serde_wasm_bindgen
        ::from_value(new_data.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse new data: {}", e)))?;

    // Classify each row
    let mut results = Vec::with_capacity(data.len());
    for row in data {
        let result = model.classify(&row).map_err(format_error)?;
        results.push(result);
    }

    // Return results as JSON
    serde_wasm_bindgen
        ::to_value(&results)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
}

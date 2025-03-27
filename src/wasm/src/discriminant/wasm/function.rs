use wasm_bindgen::prelude::*;
use serde_json::Value;
use crate::discriminant::stats::core::DiscriminantAnalysis;
use crate::discriminant::models::config::Config;
use crate::discriminant::utils::error::DiscriminantError;

/// Format DiscriminantError to JsValue
fn format_error(err: DiscriminantError) -> JsValue {
    JsValue::from_str(&format!("{}", err))
}

/// Perform discriminant analysis with given data and configuration
///
/// # Arguments
/// * `group_variable` - JSON string containing group data
/// * `independent_variable` - JSON string containing independent variable data
/// * `config_json` - JSON object containing configuration
///
/// # Returns
/// * JSON string with analysis results
#[wasm_bindgen]
pub fn perform_analysis(
    group_variable: &JsValue,
    independent_variable: &JsValue,
    config_json: &JsValue
) -> Result<JsValue, JsValue> {
    // Convert JS values to Rust types
    let group_data: Vec<Value> = serde_wasm_bindgen::from_value(group_variable.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse group data: {}", e)))?;

    let independent_data: Vec<Value> = serde_wasm_bindgen::from_value(independent_variable.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse independent data: {}", e)))?;
        
    // Parse configuration
    let config: Config = serde_wasm_bindgen::from_value(config_json.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse configuration: {}", e)))?;
        
    // Extract settings from config
    let min_range = config.define_range.min_range.unwrap_or(0.0);
    let max_range = config.define_range.max_range.unwrap_or(f64::MAX);
    
    // Determine prior probabilities based on config
    let prior_probs_opt = if config.classify.all_group_equal {
        // Equal priors
        None
    } else if config.classify.group_size {
        // Proportional to group size (will be calculated internally)
        None
    } else {
        // Custom priors would be extracted from config if available
        None
    };

    // Create discriminant analysis object
    let mut analysis = DiscriminantAnalysis::new(
        vec![group_data],
        vec![independent_data],
        min_range,
        max_range,
        prior_probs_opt
    ).map_err(format_error)?;
    
    // Apply configuration settings
    analysis.apply_config(&config).map_err(format_error)?;
    
    // Compute canonical discriminant functions
    analysis.compute_canonical_discriminant_functions()
        .map_err(format_error)?;
        
    // Perform stepwise analysis if configured
    if config.main.stepwise {
        analysis.perform_stepwise_analysis()
            .map_err(format_error)?;
    }
    
    // Get results
    let results = analysis.get_results()
        .map_err(format_error)?;
    
    // Return results as JSON
    serde_wasm_bindgen::to_value(&results)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
}

/// Perform cross-validation with given data and configuration
///
/// # Arguments
/// * `group_variable` - JSON string containing group data
/// * `independent_variable` - JSON string containing independent variable data
/// * `config_json` - JSON object containing configuration
///
/// # Returns
/// * JSON string with cross-validation results
#[wasm_bindgen]
pub fn perform_cross_validation(
    group_variable: &JsValue,
    independent_variable: &JsValue,
    config_json: &JsValue
) -> Result<JsValue, JsValue> {
    // Convert JS values to Rust types
    let group_data: Vec<Value> = serde_wasm_bindgen::from_value(group_variable.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse group data: {}", e)))?;

    let independent_data: Vec<Value> = serde_wasm_bindgen::from_value(independent_variable.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse independent data: {}", e)))?;
        
    // Parse configuration
    let config: Config = serde_wasm_bindgen::from_value(config_json.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse configuration: {}", e)))?;
        
    // Extract settings from config
    let min_range = config.define_range.min_range.unwrap_or(0.0);
    let max_range = config.define_range.max_range.unwrap_or(f64::MAX);
    
    // Determine prior probabilities based on config
    let prior_probs_opt = if config.classify.all_group_equal {
        // Equal priors
        None
    } else if config.classify.group_size {
        // Proportional to group size (will be calculated internally)
        None
    } else {
        // Custom priors would be extracted from config if available
        None
    };

    // Create discriminant analysis object
    let mut analysis = DiscriminantAnalysis::new(
        vec![group_data],
        vec![independent_data],
        min_range,
        max_range,
        prior_probs_opt
    ).map_err(format_error)?;
    
    // Apply configuration settings
    analysis.apply_config(&config).map_err(format_error)?;
    
    // Compute canonical discriminant functions
    analysis.compute_canonical_discriminant_functions()
        .map_err(format_error)?;
        
    // Perform cross-validation
    let results = analysis.cross_validate()
        .map_err(format_error)?;
    
    // Return results as JSON
    serde_wasm_bindgen::to_value(&results)
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
pub fn classify_new_data(
    trained_model: &JsValue,
    new_data: &JsValue
) -> Result<JsValue, JsValue> {
    // Deserialize the trained model
    let model: DiscriminantAnalysis = serde_wasm_bindgen::from_value(trained_model.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to deserialize model: {}", e)))?;
        
    // Convert JS values to Rust types
    let data: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(new_data.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse new data: {}", e)))?;
        
    // Classify each row
    let mut results = Vec::with_capacity(data.len());
    for row in data {
        let result = model.classify(&row)
            .map_err(format_error)?;
        results.push(result);
    }
    
    // Return results as JSON
    serde_wasm_bindgen::to_value(&results)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
}
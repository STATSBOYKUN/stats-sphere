use wasm_bindgen::prelude::*;
use serde_json::Value;

use crate::hierarchical::types::{AnalysisResult, ClusteringConfig, ClusteringError};
use crate::hierarchical::wasm::config::parse_spss_config;
use crate::hierarchical::algorithm::*;
use crate::hierarchical::statistics::*;
use crate::hierarchical::result::*;
use crate::hierarchical::utils::*;

/// Perform hierarchical clustering analysis from JavaScript
///
/// # Arguments
/// * `data_json` - JSON data array
/// * `config_json` - Configuration object
///
/// # Returns
/// * Result object with analysis data or error
#[wasm_bindgen]
pub fn perform_analysis(
    data_json: &JsValue,
    config_json: &JsValue
) -> Result<JsValue, JsValue> {
    // Initialize warnings
    let mut warnings = Vec::new();
    
    // Parse data
    let data: Vec<Vec<f64>> = match serde_wasm_bindgen::from_value(data_json.clone()) {
        Ok(d) => d,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Failed to parse data: {}", e)));
        }
    };
    
    // Parse configuration
    let config_value: Value = match serde_wasm_bindgen::from_value(config_json.clone()) {
        Ok(c) => c,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Failed to parse configuration: {}", e)));
        }
    };
    
    let config = match parse_spss_config(&config_value) {
        Ok(c) => c,
        Err(e) => {
            return Err(JsValue::from_str(&format!("Failed to parse SPSS configuration: {}", e)));
        }
    };
    
    // Perform analysis
    let result = match perform_hierarchical_analysis(&data, config, &mut warnings) {
        Ok(results) => AnalysisResult {
            success: true,
            warnings,
            error: None,
            data: Some(results),
        },
        Err(e) => {
            let error_msg = format!("Analysis failed: {}", e);
            log_warning(error_msg.clone(), &mut warnings);
            
            AnalysisResult {
                success: false,
                warnings,
                error: Some(error_msg),
                data: None,
            }
        }
    };
    
    // Return as JS value
    match serde_wasm_bindgen::to_value(&result) {
        Ok(js_result) => Ok(js_result),
        Err(e) => Err(JsValue::from_str(&format!("Failed to serialize result: {}", e))),
    }
}

/// Perform hierarchical clustering analysis with Rust API
/// 
/// # Arguments
/// * `data` - Data matrix (rows are cases, columns are variables)
/// * `config` - Clustering configuration
/// * `warnings` - Vector to collect warnings
/// 
/// # Returns
/// * Result containing analysis results or error
pub fn perform_hierarchical_analysis(
    data: &[Vec<f64>],
    config: ClusteringConfig,
    warnings: &mut Vec<String>
) -> Result<crate::hierarchical::types::HierarchicalClusteringResults, ClusteringError> {
    // Preprocess data
    let preprocessed_data = if config.standardization != crate::hierarchical::types::StandardizationMethod::None {
        transform::standardize_data(data, config.standardization, config.standardize_by_case)?
    } else {
        data.to_vec()
    };
    
    // Calculate distance matrix
    let distance_matrix = match matrix::calculate_distance_matrix(
        &preprocessed_data,
        config.distance_metric,
        config.minkowski_power,
        config.binary_options.as_ref(),
        warnings,
        config.custom_power,
        config.custom_root,
    ) {
        Ok(matrix) => matrix,
        Err(e) => {
            log_warning(format!("Error calculating distances: {}. Using fallback.", e), warnings);
            matrix::create_fallback_distance_matrix(&preprocessed_data, warnings)
        }
    };
    
    // Apply distance transformation if needed
    let transformed_distances = if config.distance_transformation != crate::hierarchical::types::DistanceTransformation::None {
        transform::transform_distance_matrix(&distance_matrix, config.distance_transformation)
    } else {
        distance_matrix
    };
    
    // Perform clustering
    let mut results = clustering::hierarchical_cluster(
        &preprocessed_data,
        &transformed_distances,
        &config,
        warnings,
    )?;
    
    // Try to get default single solution (3 clusters)
    let default_clusters = 3;
    if preprocessed_data.len() >= default_clusters {
        if let Ok(membership) = membership::get_cluster_membership(
            &results.agglomeration_schedule,
            default_clusters,
            preprocessed_data.len(),
            warnings
        ) {
            results.single_solution = Some(membership.clone());
            
            // Calculate evaluation metrics
            if let Ok(evaluation) = crate::hierarchical::statistics::evaluation::evaluate_clustering(
                &preprocessed_data,
                &membership,
                &transformed_distances,
                warnings
            ) {
                results.evaluation = Some(evaluation);
            }
        }
    }
    
    Ok(results)
}
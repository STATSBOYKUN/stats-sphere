use wasm_bindgen::prelude::*;

use crate::twostep::models::{ config::ClusterConfig, data::AnalysisData, result::ClusteringResult };
use crate::twostep::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &ClusterConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<ClusteringResult>, JsValue> {
    web_sys::console::log_1(&"Starting Two-Step Cluster Analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Basic data processing and validation
    executed_functions.push("basic_data_processing".to_string());
    let processing_summary = match basic_data_processing(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("basic_data_processing", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 2: Prepare data for clustering
    let prepared_data = match prepare_clustering_data(data, config) {
        Ok(prepared) => prepared,
        Err(e) => {
            error_collector.add_error("prepare_clustering_data", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 3: Perform clustering
    executed_functions.push("perform_clustering".to_string());
    let clustering_result = match perform_clustering(&prepared_data, config) {
        Ok(result) => result,
        Err(e) => {
            error_collector.add_error("perform_clustering", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Optional Step 4: Generate additional analytics if requested
    let mut additional_analytics = None;
    if config.output.pivot_table || config.output.chart_table {
        executed_functions.push("generate_analytics".to_string());
        match generate_analytics(&clustering_result, config) {
            Ok(analytics) => {
                additional_analytics = Some(analytics);
            }
            Err(e) => {
                error_collector.add_error("generate_analytics", &e);
                // Continue execution despite errors
            }
        }
    }

    // Optional Step 5: Export results if requested
    if config.output.export_model || config.output.export_cf_tree {
        executed_functions.push("export_results".to_string());
        match export_results(&clustering_result, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("export_results", &e);
                // Continue execution despite errors
            }
        }
    }

    // Create the final result
    let result = ClusteringResult {
        // Populate the result fields
        cell_distribution: clustering_result.cell_distribution,
        cluster_profiles: clustering_result.cluster_profiles,
        auto_clustering: clustering_result.auto_clustering,
        cluster_distribution: clustering_result.cluster_distribution,
        clusters: clustering_result.clusters,
        predictor_importance: clustering_result.predictor_importance,
        cluster_sizes: clustering_result.cluster_sizes,
    };

    Ok(Some(result))
}

// Placeholder functions to be implemented later
fn basic_data_processing(_data: &AnalysisData, _config: &ClusterConfig) -> Result<(), String> {
    Ok(())
}

fn prepare_clustering_data(
    _data: &AnalysisData,
    _config: &ClusterConfig
) -> Result<AnalysisData, String> {
    // Implement data preparation logic
    Err("Not implemented".to_string())
}

fn perform_clustering(
    _prepared_data: &AnalysisData,
    _config: &ClusterConfig
) -> Result<ClusteringResult, String> {
    // Implement clustering algorithm
    Err("Not implemented".to_string())
}

fn generate_analytics(_result: &ClusteringResult, _config: &ClusterConfig) -> Result<(), String> {
    Ok(())
}

fn export_results(_result: &ClusteringResult, _config: &ClusterConfig) -> Result<(), String> {
    Ok(())
}

// Additional utility functions
pub fn get_results(result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(_result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    // Placeholder implementation
    Err(string_to_js_error("Not implemented".to_string()))
}

pub fn get_all_errors(error_collector: &ErrorCollector) -> JsValue {
    JsValue::from_str(&error_collector.get_error_summary())
}

pub fn clear_errors(error_collector: &mut ErrorCollector) -> JsValue {
    error_collector.clear();
    JsValue::from_str("Error collector cleared")
}

use std::collections::HashMap;

use wasm_bindgen::prelude::*;

use crate::kmeans::models::result::{ ANOVATable, CaseCountTable, InitialClusterCenters };
use crate::kmeans::models::{ config::ClusterConfig, data::AnalysisData, result::ClusteringResult };
use crate::kmeans::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &ClusterConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<ClusteringResult>, JsValue> {
    web_sys::console::log_1(&"Starting K-Means Cluster analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Validate input data and configuration
    executed_functions.push("validate_input_data".to_string());
    match validate_input_data(data, config) {
        Ok(_) => {}
        Err(e) => {
            error_collector.add_error("validate_input_data", &e);
            return Err(string_to_js_error(e));
        }
    }

    // Step 2: Preprocess data
    executed_functions.push("preprocess_data".to_string());
    let preprocessed_data = match preprocess_data(data, config) {
        Ok(processed) => processed,
        Err(e) => {
            error_collector.add_error("preprocess_data", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 3: Initialize clusters
    executed_functions.push("initialize_clusters".to_string());
    let initial_centers = match initialize_clusters(&preprocessed_data, config) {
        Ok(centers) => centers,
        Err(e) => {
            error_collector.add_error("initialize_clusters", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 4: Perform clustering
    executed_functions.push("perform_clustering".to_string());
    let clustering_result = match perform_clustering(&preprocessed_data, config, &initial_centers) {
        Ok(result) => result,
        Err(e) => {
            error_collector.add_error("perform_clustering", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Additional optional analyses based on configuration
    let anova_result = if config.options.anova {
        executed_functions.push("calculate_anova".to_string());
        match calculate_anova(&preprocessed_data, &clustering_result) {
            Ok(anova) => Some(anova),
            Err(e) => {
                error_collector.add_error("calculate_anova", &e);
                None
            }
        }
    } else {
        None
    };

    // Generate final result
    let result = ClusteringResult {
        anova: anova_result,
        cases_count: Some(generate_case_count(&preprocessed_data, &clustering_result)),
        initial_centers: Some(initial_centers),
        iteration_history: None, // To be implemented
        cluster_membership: None, // To be implemented
        final_cluster_centers: None, // To be implemented
        distances_between_centers: None, // To be implemented
    };

    Ok(Some(result))
}

// Placeholder functions with basic error handling
fn validate_input_data(data: &AnalysisData, config: &ClusterConfig) -> Result<(), String> {
    // Basic validation checks
    if data.target_data.is_empty() {
        return Err("No target data provided".to_string());
    }

    if config.main.cluster <= 0 {
        return Err("Number of clusters must be positive".to_string());
    }

    Ok(())
}

fn preprocess_data(data: &AnalysisData, config: &ClusterConfig) -> Result<AnalysisData, String> {
    // Basic preprocessing
    // Handle missing values based on configuration
    Ok(data.clone())
}

fn initialize_clusters(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<InitialClusterCenters, String> {
    // Basic cluster initialization logic
    Ok(InitialClusterCenters {
        centers: HashMap::new(),
    })
}

fn perform_clustering(
    data: &AnalysisData,
    config: &ClusterConfig,
    initial_centers: &InitialClusterCenters
) -> Result<HashMap<String, Vec<String>>, String> {
    // Basic clustering logic
    Ok(HashMap::new())
}

fn calculate_anova(
    data: &AnalysisData,
    clustering_result: &HashMap<String, Vec<String>>
) -> Result<ANOVATable, String> {
    // Basic ANOVA calculation
    Ok(ANOVATable {
        clusters: HashMap::new(),
    })
}

fn generate_case_count(
    data: &AnalysisData,
    clustering_result: &HashMap<String, Vec<String>>
) -> CaseCountTable {
    // Generate case count table
    CaseCountTable {
        valid: 0,
        missing: 0,
        clusters: HashMap::new(),
    }
}

pub fn get_results(result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<Vec<String>>) -> Result<JsValue, JsValue> {
    match result {
        Some(functions) => Ok(serde_wasm_bindgen::to_value(functions).unwrap()),
        None => Err(string_to_js_error("No analysis has been performed".to_string())),
    }
}

pub fn get_all_errors(error_collector: &ErrorCollector) -> JsValue {
    JsValue::from_str(&error_collector.get_error_summary())
}

pub fn clear_errors(error_collector: &mut ErrorCollector) -> JsValue {
    error_collector.clear();
    JsValue::from_str("Error collector cleared")
}

use wasm_bindgen::prelude::*;

use crate::hierarchical::models::{
    config::ClusterConfig,
    data::AnalysisData,
    result::ClusteringResult,
};
use crate::hierarchical::stats::core;
use crate::hierarchical::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &ClusterConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<ClusteringResult>, JsValue> {
    web_sys::console::log_1(&"Starting Hierarchical Cluster Analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Log Data
    web_sys::console::log_1(&format!("Data: {:?}", data).into());

    // Basic case processing
    executed_functions.push("case_processing".to_string());
    let case_processing_summary = match core::process_cases(data, config) {
        Ok(summary) => {
            web_sys::console::log_1(&format!("Case Processing Summary: {:?}", summary).into());
            summary
        }
        Err(e) => {
            error_collector.add_error("case_processing", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Clustering logic
    let case_clusters = match core::perform_clustering(data, config) {
        Ok(clusters) => {
            web_sys::console::log_1(&format!("Case Clusters: {:?}", clusters).into());
            clusters
        }
        Err(e) => {
            error_collector.add_error("perform_clustering", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Proximity matrix
    let mut proximity_matrix = None;

    // Agglomeration schedule
    let mut agglomeration_schedule = None;

    if config.main.disp_stats {
        if config.statistics.prox_matrix {
            executed_functions.push("proximity_matrix".to_string());
            match core::generate_proximity_matrix(data, config) {
                Ok(matrix) => {
                    web_sys::console::log_1(&format!("Proximity Matrix: {:?}", matrix).into());
                    proximity_matrix = Some(matrix);
                }
                Err(e) => {
                    error_collector.add_error("proximity_matrix", &e);
                    return Err(string_to_js_error(e));
                }
            };
        }
        if config.statistics.aggl_schedule {
            executed_functions.push("agglomeration_schedule".to_string());
            match core::generate_agglomeration_schedule(data, config) {
                Ok(schedule) => {
                    web_sys::console::log_1(
                        &format!("Agglomeration Schedule: {:?}", schedule).into()
                    );
                    agglomeration_schedule = Some(schedule);
                }
                Err(e) => {
                    error_collector.add_error("agglomeration_schedule", &e);
                    return Err(string_to_js_error(e));
                }
            };
        }
    }

    // Dendrogram
    let mut dendrogram = None;
    if config.main.disp_plots && config.plots.dendrograms {
        executed_functions.push("dendrogram".to_string());
        match core::generate_dendrogram(data, config) {
            Ok(dendro) => {
                web_sys::console::log_1(&format!("Dendrogram: {:?}", dendro).into());
                dendrogram = Some(dendro);
            }
            Err(e) => {
                error_collector.add_error("dendrogram", &e);
                return Err(string_to_js_error(e));
            }
        };
    }

    // Create final result
    let result = ClusteringResult {
        case_processing_summary,
        case_clusters,
        proximity_matrix,
        agglomeration_schedule,
        dendrogram,
        executed_functions,
    };

    Ok(Some(result))
}

// Utility functions to interact with the result
pub fn get_results(result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(&result.executed_functions).unwrap()),
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

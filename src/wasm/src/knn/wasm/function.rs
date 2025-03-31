use wasm_bindgen::prelude::*;

use crate::knn::models::{ config::KnnConfig, data::AnalysisData, result::NearestNeighborAnalysis };
use crate::knn::stats::core;
use crate::knn::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &KnnConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<NearestNeighborAnalysis>, JsValue> {
    web_sys::console::log_1(&"Starting Nearest Neighbor Analysis".into());

    // Initialize result with executed function tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Basic processing summary (always executed)
    executed_functions.push("basic_processing_summary".to_string());
    let case_processing_summary = match core::basic_processing_summary(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("basic_processing_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 2: System settings (always executed)
    executed_functions.push("system_settings".to_string());
    let system_settings = match core::get_system_settings() {
        Ok(settings) => settings,
        Err(e) => {
            error_collector.add_error("system_settings", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 3: Predictor importance if requested
    let predictor_importance = if
        !config.features.forced_entry_var.is_none() ||
        config.features.perform_selection
    {
        executed_functions.push("predictor_importance".to_string());
        match core::calculate_predictor_importance(data, config) {
            Ok(importance) => Some(importance),
            Err(e) => {
                error_collector.add_error("predictor_importance", &e);
                None
            }
        }
    } else {
        None
    };

    // Step 4: Classification results
    executed_functions.push("classification_results".to_string());
    let classification_table = match core::calculate_classification_table(data, config) {
        Ok(table) => table,
        Err(e) => {
            error_collector.add_error("classification_results", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 5: Error summary
    let error_summary = match core::calculate_error_summary(&classification_table) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("error_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 6: Predictor space
    executed_functions.push("predictor_space".to_string());
    let predictor_space = match core::calculate_predictor_space(data, config) {
        Ok(space) => space,
        Err(e) => {
            error_collector.add_error("predictor_space", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 7: Peers chart
    executed_functions.push("peers_chart".to_string());
    let peers_chart = match core::calculate_peers_chart(data, config) {
        Ok(chart) => chart,
        Err(e) => {
            error_collector.add_error("peers_chart", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 8: Nearest neighbors
    executed_functions.push("nearest_neighbors".to_string());
    let nearest_neighbors = match core::calculate_nearest_neighbors(data, config) {
        Ok(neighbors) => neighbors,
        Err(e) => {
            error_collector.add_error("nearest_neighbors", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 9: Quadrant map
    executed_functions.push("quadrant_map".to_string());
    let quadrant_map = match core::calculate_quadrant_map(data, config) {
        Ok(map) => map,
        Err(e) => {
            error_collector.add_error("quadrant_map", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Create the final result
    let result = NearestNeighborAnalysis {
        case_processing_summary,
        system_settings,
        predictor_importance,
        classification_table,
        error_summary,
        predictor_space,
        peers_chart,
        nearest_neighbors,
        quadrant_map,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<NearestNeighborAnalysis>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_all_errors(error_collector: &ErrorCollector) -> JsValue {
    JsValue::from_str(&error_collector.get_error_summary())
}

pub fn clear_errors(error_collector: &mut ErrorCollector) -> JsValue {
    error_collector.clear();
    JsValue::from_str("Error collector cleared")
}

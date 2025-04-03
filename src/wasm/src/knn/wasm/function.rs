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

    // Step 1: System settings if requested
    let mut system_settings = None;
    if config.partition.set_seed {
        executed_functions.push("system_settings".to_string());
        match core::generate_mersenne_twister(data, config) {
            Ok(seed) => {
                system_settings = Some(seed);
            }
            Err(e) => {
                error_collector.add_error("system_settings", &e);
                return Err(string_to_js_error(e));
            }
        }
    }

    // Step 1: Basic processing summary
    let mut case_processing_summary = None;
    if config.output.case_summary {
        executed_functions.push("basic_processing_summary".to_string());
        match core::basic_processing_summary(data, config) {
            Ok(summary) => {
                case_processing_summary = Some(summary);
            }
            Err(e) => {
                error_collector.add_error("basic_processing_summary", &e);
            }
        };
    }

    // Step 2: Nearest neighbors
    executed_functions.push("nearest_neighbors".to_string());
    let mut nearest_neighbors = None;
    match core::calculate_nearest_neighbors(data, config) {
        Ok(neighbors) => {
            nearest_neighbors = Some(neighbors);
        }
        Err(e) => {
            error_collector.add_error("nearest_neighbors", &e);
        }
    }

    // Step 3: Classification results
    executed_functions.push("classification_results".to_string());
    let mut classification_table = None;
    match core::calculate_classification_table(data, config) {
        Ok(table) => {
            classification_table = Some(table);
        }
        Err(e) => {
            error_collector.add_error("classification_results", &e);
        }
    }

    // Step 4: Predictor importance if requested
    let mut predictor_importance = None;
    if config.features.forced_entry_var.is_some() || config.features.perform_selection {
        executed_functions.push("predictor_importance".to_string());
        match core::calculate_predictor_importance(data, config) {
            Ok(importance) => {
                predictor_importance = Some(importance);
            }
            Err(e) => {
                error_collector.add_error("predictor_importance", &e);
            }
        }
    }

    // Step 5: Predictor space
    executed_functions.push("predictor_space".to_string());
    let mut predictor_space = None;
    match core::calculate_predictor_space(data, config) {
        Ok(space) => {
            predictor_space = Some(space);
        }
        Err(e) => {
            error_collector.add_error("predictor_space", &e);
        }
    }

    // Step 6: Peers chart
    executed_functions.push("peers_chart".to_string());
    let mut peers_chart = None;
    match core::calculate_peers_chart(data, config) {
        Ok(chart) => {
            peers_chart = Some(chart);
        }
        Err(e) => {
            error_collector.add_error("peers_chart", &e);
        }
    }

    // Step 7: Quadrant map
    executed_functions.push("quadrant_map".to_string());
    let mut quadrant_map = None;
    match core::calculate_quadrant_map(data, config) {
        Ok(map) => {
            quadrant_map = Some(map);
        }
        Err(e) => {
            error_collector.add_error("quadrant_map", &e);
        }
    }

    // Step 8: Error summary
    let mut error_summary = None;
    match core::calculate_error_summary(&classification_table) {
        Ok(summary) => {
            error_summary = Some(summary);
        }
        Err(e) => {
            error_collector.add_error("error_summary", &e);
        }
    }

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

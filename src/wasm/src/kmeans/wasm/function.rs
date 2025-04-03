use wasm_bindgen::prelude::*;

use crate::kmeans::models::{ config::ClusterConfig, data::AnalysisData, result::ClusteringResult };
use crate::kmeans::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::kmeans::stats::core;

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

    // Step 1: Preprocess data
    executed_functions.push("preprocess_data".to_string());
    let preprocessed_data = match core::preprocess_data(data, config) {
        Ok(processed) => {
            // Log the preprocessed data for debugging
            web_sys::console::log_1(&format!("Preprocessed data: {:?}", processed).into());
            processed
        }
        Err(e) => {
            error_collector.add_error("preprocess_data", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 2: Initialize clusters
    executed_functions.push("initialize_clusters".to_string());
    let mut initial_centers = None;
    if config.options.initial_cluster {
        match core::initialize_clusters(&preprocessed_data, config) {
            Ok(centers) => {
                // Log the initial cluster centers for debugging
                web_sys::console::log_1(&format!("Initial cluster centers: {:?}", centers).into());
                initial_centers = Some(centers);
            }
            Err(e) => {
                error_collector.add_error("initialize_clusters", &e);
                return Err(string_to_js_error(e));
            }
        };
    }

    // Step 3: Iteration history
    executed_functions.push("iteration_history".to_string());
    let mut iteration_history = None;
    match core::generate_iteration_history(&preprocessed_data, config) {
        Ok(history) => {
            // Log the iteration history for debugging
            web_sys::console::log_1(&format!("Iteration history: {:?}", history).into());
            iteration_history = Some(history);
        }
        Err(e) => {
            error_collector.add_error("iteration_history", &e);
        }
    }

    // Step 4: Cluster membership
    executed_functions.push("cluster_membership".to_string());
    let mut cluster_membership = None;
    match core::generate_cluster_membership(&preprocessed_data, config) {
        Ok(membership) => {
            // Log the cluster membership for debugging
            web_sys::console::log_1(&format!("Cluster membership: {:?}", membership).into());
            cluster_membership = Some(membership);
        }
        Err(e) => {
            error_collector.add_error("cluster_membership", &e);
        }
    }

    // Step 5: Final cluster centers
    let mut final_cluster_centers = None;
    executed_functions.push("final_cluster_centers".to_string());
    match core::generate_final_cluster_centers(&preprocessed_data, config) {
        Ok(centers) => {
            // Log the final cluster centers for debugging
            web_sys::console::log_1(&format!("Final cluster centers: {:?}", centers).into());
            final_cluster_centers = Some(centers);
        }
        Err(e) => {
            error_collector.add_error("final_cluster_centers", &e);
        }
    }

    // Step 6: Distances between centers
    let mut distances_between_centers = None;
    executed_functions.push("distances_between_centers".to_string());
    match core::calculate_distances_between_centers(&preprocessed_data, config) {
        Ok(distances) => {
            // Log the distances between centers for debugging
            web_sys::console::log_1(&format!("Distances between centers: {:?}", distances).into());
            distances_between_centers = Some(distances);
        }
        Err(e) => {
            error_collector.add_error("distances_between_centers", &e);
        }
    }

    // Additional optional analyses based on configuration
    let mut anova = None;
    if config.options.anova {
        executed_functions.push("calculate_anova".to_string());
        match core::calculate_anova(&preprocessed_data, &config) {
            Ok(result) => {
                // Log the ANOVA result for debugging
                web_sys::console::log_1(&format!("ANOVA result: {:?}", result).into());
                anova = Some(result);
            }
            Err(e) => {
                error_collector.add_error("calculate_anova", &e);
            }
        }
    }

    // Case count table
    let mut cases_count = None;
    if config.options.cluster_info {
        executed_functions.push("generate_case_count".to_string());
        match core::generate_case_count(&preprocessed_data, &config) {
            Ok(count) => {
                // Log the case count for debugging
                web_sys::console::log_1(&format!("Case count: {:?}", count).into());
                cases_count = Some(count);
            }
            Err(e) => {
                error_collector.add_error("generate_case_count", &e);
            }
        }
    }

    // Generate final result
    let result = ClusteringResult {
        initial_centers,
        iteration_history,
        cluster_membership,
        final_cluster_centers,
        distances_between_centers,
        anova,
        cases_count,
    };

    Ok(Some(result))
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

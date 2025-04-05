use wasm_bindgen::prelude::*;

use crate::twostep::models::{ config::ClusterConfig, data::AnalysisData, result::ClusteringResult };
use crate::twostep::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::twostep::stats::core;

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

    // Step 1: Prepare data for clustering
    executed_functions.push("prepare_clustering_data".to_string());
    let prepared_data = match core::prepare_clustering_data(data, config) {
        Ok(prepared) => { prepared }
        Err(e) => {
            error_collector.add_error("prepare_clustering_data", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Calculate model summary
    executed_functions.push("calculate_model_summary".to_string());
    let model_summary = match core::calculate_model_summary(&prepared_data, config) {
        Ok(summary) => {
            web_sys::console::log_1(&format!("Model Summary: {:?}", summary).into());
            Some(summary)
        }
        Err(e) => {
            error_collector.add_error("calculate_model_summary", &e);
            None
        }
    };

    // Step 2: Calculate the cell distribution
    let cell_distribution = if config.output.clust_var {
        match core::calculate_cell_distribution(&prepared_data, config) {
            Ok(distribution) => {
                // Log the cell distribution for debugging
                web_sys::console::log_1(&format!("Cell Distribution: {:?}", distribution).into());
                Some(distribution)
            }
            Err(e) => {
                error_collector.add_error("calculate_cell_distribution", &e);
                None
            }
        }
    } else {
        None
    };

    // Step 3: Calculate cluster profiles
    executed_functions.push("calculate_cluster_profiles".to_string());
    let cluster_profiles = match core::calculate_cluster_profiles(&prepared_data, config) {
        Ok(profiles) => {
            // Log the cluster profiles for debugging
            web_sys::console::log_1(&format!("Cluster Profiles: {:?}", profiles).into());
            Some(profiles)
        }
        Err(e) => {
            error_collector.add_error("calculate_cluster_profiles", &e);
            None
        }
    };

    // Step 4: Calculate auto clustering if enabled
    executed_functions.push("calculate_auto_clustering".to_string());
    let auto_clustering = if config.main.auto {
        match core::calculate_auto_clustering(&prepared_data, config) {
            Ok(auto) => {
                // Log the auto clustering for debugging
                web_sys::console::log_1(&format!("Auto Clustering: {:?}", auto).into());
                Some(auto)
            }
            Err(e) => {
                error_collector.add_error("calculate_auto_clustering", &e);
                None
            }
        }
    } else {
        None
    };

    // Step 5: Calculate cluster distribution
    executed_functions.push("calculate_cluster_distribution".to_string());
    let cluster_distribution = match core::calculate_cluster_distribution(&prepared_data, config) {
        Ok(distribution) => {
            // Log the cluster distribution for debugging
            web_sys::console::log_1(&format!("Cluster Distribution: {:?}", distribution).into());
            Some(distribution)
        }
        Err(e) => {
            error_collector.add_error("calculate_cluster_distribution", &e);
            None
        }
    };

    // Step 6: Calculate clusters
    executed_functions.push("calculate_clusters".to_string());
    let clusters = match core::calculate_clusters(&prepared_data, config) {
        Ok(clusters_data) => {
            // Log the clusters for debugging
            web_sys::console::log_1(&format!("Clusters: {:?}", clusters_data).into());
            Some(clusters_data)
        }
        Err(e) => {
            error_collector.add_error("calculate_clusters", &e);
            None
        }
    };

    // Step 7: Calculate predictor importance
    executed_functions.push("calculate_predictor_importance".to_string());
    let predictor_importance = match core::calculate_predictor_importance(&prepared_data, config) {
        Ok(importance) => {
            // Log the predictor importance for debugging
            web_sys::console::log_1(&format!("Predictor Importance: {:?}", importance).into());
            Some(importance)
        }
        Err(e) => {
            error_collector.add_error("calculate_predictor_importance", &e);
            None
        }
    };

    // Cluster Sizes
    let cluster_sizes = match core::calculate_cluster_sizes(&prepared_data, config) {
        Ok(sizes) => Some(sizes),
        Err(e) => {
            error_collector.add_error("calculate_cluster_sizes", &e);
            None
        }
    };

    // Create the final result
    let result = ClusteringResult {
        model_summary,
        cell_distribution,
        cluster_profiles,
        auto_clustering,
        cluster_distribution,
        clusters,
        predictor_importance,
        cluster_sizes,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(_result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    Err(string_to_js_error("Not implemented".to_string()))
}

pub fn get_all_errors(error_collector: &ErrorCollector) -> JsValue {
    JsValue::from_str(&error_collector.get_error_summary())
}

pub fn clear_errors(error_collector: &mut ErrorCollector) -> JsValue {
    error_collector.clear();
    JsValue::from_str("Error collector cleared")
}

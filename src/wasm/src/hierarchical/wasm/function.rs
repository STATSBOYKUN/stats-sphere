// function.rs
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

    // Create a mutable copy of the data for transformations
    let mut analysis_data = data.clone();

    // Apply transformations if configured
    if config.method.by_case || config.method.by_variable {
        executed_functions.push("transform_data".to_string());
        match core::transform_data(&mut analysis_data, config) {
            Ok(_) => {
                web_sys::console::log_1(&"Data transformation applied".into());
            }
            Err(e) => {
                error_collector.add_error("transform_data", &e);
                return Err(string_to_js_error(e));
            }
        }
    }

    // Log transformed data
    web_sys::console::log_1(&format!("Transformed Data: {:?}", analysis_data).into());

    // Basic case processing
    executed_functions.push("case_processing".to_string());
    let case_processing_summary = match core::process_cases(&analysis_data, config) {
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
    let case_clusters = match core::perform_clustering(&analysis_data, config) {
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
    if config.main.disp_stats && config.statistics.prox_matrix {
        executed_functions.push("proximity_matrix".to_string());
        match core::generate_proximity_matrix(&analysis_data, config) {
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

    // Agglomeration schedule
    let mut agglomeration_schedule = None;
    if config.main.disp_stats && config.statistics.aggl_schedule {
        executed_functions.push("agglomeration_schedule".to_string());
        match core::generate_agglomeration_schedule_wrapper(&analysis_data, config) {
            Ok(schedule) => {
                web_sys::console::log_1(&format!("Agglomeration Schedule: {:?}", schedule).into());
                agglomeration_schedule = Some(schedule);
            }
            Err(e) => {
                error_collector.add_error("agglomeration_schedule", &e);
                return Err(string_to_js_error(e));
            }
        };
    }

    // Dendrogram
    let mut dendrogram = None;
    if config.main.disp_plots && config.plots.dendrograms {
        executed_functions.push("dendrogram".to_string());
        match core::generate_dendrogram(&analysis_data, config) {
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

    // Icicle plot
    let mut icicle_plot = None;
    if config.main.disp_plots && !config.plots.none_clusters {
        executed_functions.push("icicle_plot".to_string());

        match core::generate_icicle_plot(&analysis_data, config) {
            Ok(plot) => {
                web_sys::console::log_1(&format!("Icicle Plot generated").into());
                icicle_plot = Some(plot);
            }
            Err(e) => {
                error_collector.add_error("icicle_plot", &e);
                // Log error but continue - icicle plot is optional
                web_sys::console::log_1(&format!("Error generating icicle plot: {}", e).into());
            }
        }
    }

    // Create cluster memberships for different cluster solutions
    let mut cluster_memberships = Vec::new();
    if config.statistics.single_sol || config.statistics.range_sol {
        executed_functions.push("cluster_memberships".to_string());
        match core::get_cluster_memberships(&analysis_data, config) {
            Ok(memberships) => {
                web_sys::console::log_1(
                    &format!("Generated {} cluster solutions", memberships.len()).into()
                );
                cluster_memberships = memberships;
            }
            Err(e) => {
                error_collector.add_error("cluster_memberships", &e);
                // Log error but continue - this is optional
                web_sys::console::log_1(
                    &format!("Error generating cluster memberships: {}", e).into()
                );
            }
        }
    }

    // Create final result
    let result = ClusteringResult {
        case_processing_summary,
        case_clusters,
        proximity_matrix,
        agglomeration_schedule,
        dendrogram,
        icicle_plot,
        executed_functions,
        cluster_memberships,
    };

    Ok(Some(result))
}

// Utility functions remain unchanged
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

use wasm_bindgen::prelude::*;

use crate::hierarchical::models::{
    config::ClusterConfig,
    data::AnalysisData,
    result::{
        AgglomerationSchedule,
        AgglomerationStage,
        CaseCluster,
        CaseProcessingSummary,
        ClusteringResult,
        Dendrogram,
        DendrogramNode,
        ProximityMatrix,
    },
};
use crate::hierarchical::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &ClusterConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<ClusteringResult>, JsValue> {
    web_sys::console::log_1(&"Starting Hierarchical Cluster Analysis".into());

    // Log configuration
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Basic case processing
    let case_processing_summary = match process_cases(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("case_processing", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Clustering logic
    let case_clusters = match perform_clustering(data, config) {
        Ok(clusters) => clusters,
        Err(e) => {
            error_collector.add_error("perform_clustering", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Proximity matrix
    let proximity_matrix = match generate_proximity_matrix(data, config) {
        Ok(matrix) => matrix,
        Err(e) => {
            error_collector.add_error("proximity_matrix", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Agglomeration schedule
    let agglomeration_schedule = match generate_agglomeration_schedule(data, config) {
        Ok(schedule) => schedule,
        Err(e) => {
            error_collector.add_error("agglomeration_schedule", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Dendrogram
    let dendrogram = match generate_dendrogram(data, config) {
        Ok(dendro) => dendro,
        Err(e) => {
            error_collector.add_error("dendrogram", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Create final result
    let result = ClusteringResult {
        case_processing_summary,
        case_clusters,
        proximity_matrix,
        agglomeration_schedule,
        dendrogram,
    };

    Ok(Some(result))
}

// Placeholder functions to be implemented
fn process_cases(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<CaseProcessingSummary, String> {
    // Basic implementation of case processing
    Ok(CaseProcessingSummary {
        valid_cases: data.cluster_data.len(),
        valid_percent: 100.0,
        missing_cases: 0,
        missing_percent: 0.0,
        total_cases: data.cluster_data.len(),
        total_percent: 100.0,
    })
}

fn perform_clustering(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<Vec<CaseCluster>, String> {
    // Dummy implementation based on configuration
    let cluster_count = config.statistics.no_of_cluster.unwrap_or(2);

    Ok(
        (0..cluster_count)
            .map(|i| CaseCluster {
                name: format!("Cluster {}", i + 1),
                cluster_count: data.cluster_data.len() / (cluster_count as usize),
            })
            .collect()
    )
}

fn generate_proximity_matrix(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<ProximityMatrix, String> {
    use std::collections::HashMap;

    // Dummy implementation of proximity matrix
    let mut distances = HashMap::new();

    // Generate dummy distances between first few cases
    for (i, case1) in data.cluster_data.iter().enumerate() {
        for (j, case2) in data.cluster_data.iter().enumerate() {
            if i != j {
                let case1_key = format!("Case {}", i + 1);
                let case2_key = format!("Case {}", j + 1);
                distances.insert((case1_key, case2_key), ((i as f64) - (j as f64)).abs());
            }
        }
    }

    Ok(ProximityMatrix { distances })
}

fn generate_agglomeration_schedule(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    // Dummy implementation of agglomeration schedule
    let stages = (0..data.cluster_data.len())
        .map(|i| AgglomerationStage {
            stage: i,
            clusters_combined: (i, i + 1),
            coefficients: (i as f64) * 0.1,
            cluster_first_appears: (i, i + 1),
            next_stage: i + 1,
        })
        .collect();

    Ok(AgglomerationSchedule { stages })
}

fn generate_dendrogram(data: &AnalysisData, config: &ClusterConfig) -> Result<Dendrogram, String> {
    // Dummy implementation of dendrogram
    let nodes = data.cluster_data
        .iter()
        .enumerate()
        .map(|(i, _)| DendrogramNode {
            case: format!("Case {}", i + 1),
            linkage_distance: (i as f64) * 0.5,
        })
        .collect();

    Ok(Dendrogram { nodes })
}

// Utility functions to interact with the result
pub fn get_results(result: &Option<ClusteringResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

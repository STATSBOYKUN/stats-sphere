use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

use super::config::ClusMethod;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusteringResult {
    pub case_processing_summary: CaseProcessingSummary,
    pub case_clusters: Vec<CaseCluster>,
    pub proximity_matrix: Option<ProximityMatrix>,
    pub agglomeration_schedule: Option<AgglomerationSchedule>,
    pub dendrogram: Option<Dendrogram>,
    pub executed_functions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    pub valid_cases: usize,
    pub valid_percent: f64,
    pub missing_cases: usize,
    pub missing_percent: f64,
    pub total_cases: usize,
    pub total_percent: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseCluster {
    pub name: String,
    pub cluster_count: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProximityMatrix {
    pub distances: HashMap<(String, String), f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgglomerationStage {
    pub stage: usize,
    pub clusters_combined: (usize, usize),
    pub coefficients: f64,
    pub cluster_first_appears: (usize, usize),
    pub next_stage: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AgglomerationSchedule {
    pub stages: Vec<AgglomerationStage>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DendrogramNode {
    pub case: String,
    pub linkage_distance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Dendrogram {
    pub nodes: Vec<DendrogramNode>,
}

// Structure to track clusters during agglomeration
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterState {
    pub clusters: Vec<Vec<usize>>, // List of clusters, each containing case indices
    pub distances: Vec<Vec<f64>>, // Distance matrix between clusters
    pub case_labels: Vec<String>, // Labels for each case
    pub variables: Vec<String>, // Variables used for clustering
    pub method: ClusMethod, // Clustering method
}

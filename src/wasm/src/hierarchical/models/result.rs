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
    pub icicle_plot: Option<IciclePlot>,
    pub executed_functions: Vec<String>,
    pub cluster_memberships: Vec<ClusterMembership>,
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IciclePlot {
    pub orientation: String,
    pub clusters: Vec<String>,
    pub num_clusters: Vec<usize>,
    pub start_cluster: i32,
    pub stop_cluster: i32,
    pub step_by: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterMembership {
    pub num_clusters: usize,
    pub case_assignments: Vec<usize>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DendrogramTreeNode {
    pub id: usize, // Node ID
    pub left: Option<Box<DendrogramTreeNode>>, // Left child
    pub right: Option<Box<DendrogramTreeNode>>, // Right child
    pub cases: Vec<usize>, // Case indices in this node
    pub height: f64, // Merge height/distance
    pub label: Option<String>, // Label (only for leaf nodes)
}

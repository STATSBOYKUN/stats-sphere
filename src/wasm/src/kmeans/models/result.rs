use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusteringResult {
    pub initial_centers: Option<InitialClusterCenters>,
    pub iteration_history: Option<IterationHistory>,
    pub cluster_membership: Option<Vec<ClusterMembership>>,
    pub final_cluster_centers: Option<FinalClusterCenters>,
    pub distances_between_centers: Option<DistancesBetweenCenters>,
    pub anova: Option<ANOVATable>,
    pub cases_count: Option<CaseCountTable>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ANOVATable {
    pub clusters: HashMap<String, ANOVACluster>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ANOVACluster {
    pub mean_square: f64,
    pub df: i32,
    pub f: f64,
    pub significance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseCountTable {
    pub valid: usize,
    pub missing: usize,
    pub clusters: HashMap<String, usize>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct InitialClusterCenters {
    pub centers: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IterationHistory {
    pub iterations: Vec<IterationStep>,
    pub convergence_note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IterationStep {
    pub iteration: i32,
    pub changes: HashMap<String, f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterMembership {
    pub case_number: i32,
    pub cluster: i32,
    pub distance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FinalClusterCenters {
    pub centers: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DistancesBetweenCenters {
    pub distances: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessedData {
    pub variables: Vec<String>,
    pub data_matrix: Vec<Vec<f64>>,
    pub case_numbers: Vec<i32>,
}

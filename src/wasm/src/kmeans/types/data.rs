use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use super::config::TempData;

/// Variable definition for clustering analysis.
///
/// Contains metadata about variables used in the clustering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariableDef {
    pub name: String,
    #[serde(rename = "type")]
    pub var_type: String,
    pub label: String,
    pub values: String,
    pub missing: String,
    pub measure: String,
}

/// Data point for clustering.
///
/// Each data point is a map of variable names to values.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DataPoint(pub HashMap<String, serde_json::Value>);

/// Cluster information.
///
/// Contains the center coordinates and member indices.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Cluster {
    pub center: Vec<f64>,
    pub members: Vec<usize>,
}

/// ANOVA statistics for clustering variables.
///
/// Contains statistics for evaluating the quality of the clustering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnovaTable {
    pub variables: Vec<String>,
    pub cluster_mean_squares: Vec<f64>,
    pub cluster_df: usize,
    pub error_mean_squares: Vec<f64>,
    pub error_df: usize,
    pub f_values: Vec<f64>,
    pub significance: Vec<f64>,  // p-values
}

/// Cluster membership information for each case.
///
/// Contains case number, original variables, assigned cluster, and distance.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterMembershipInfo {
    pub case_numbers: Vec<usize>,
    pub original_data: Vec<serde_json::Value>,
    pub clusters: Vec<usize>,
    pub distances: Vec<f64>,
}

/// Distances between final cluster centers.
///
/// Matrix of Euclidean distances between each pair of final cluster centers.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterDistanceMatrix {
    pub num_clusters: usize,
    pub distances: Vec<Vec<f64>>,
}

/// Statistics about cluster case counts
///
/// Contains counts of cases in each cluster, total valid cases, and missing cases
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusterCaseStatistics {
    pub cluster_counts: Vec<usize>,
    pub valid_count: usize,
    pub missing_count: usize,
}

/// Results of the K-Means clustering.
///
/// Contains all output data from the clustering process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ClusteringResult {
    pub initial_centers: Vec<Vec<f64>>,
    pub final_centers: Vec<Vec<f64>>,
    pub iterations: Vec<Vec<f64>>,  // Changes in centers by iteration
    pub cluster_membership: Vec<usize>,
    pub distances: Vec<f64>,
    pub cluster_sizes: Vec<usize>,
    pub anova_table: Option<AnovaTable>,
    pub variable_names: Vec<String>,
    pub iteration_count: usize,
    pub missing_count: usize,
    pub min_distance_initial: f64,
    pub case_statistics: ClusterCaseStatistics,
    pub membership_info: ClusterMembershipInfo,
    pub distance_matrix: ClusterDistanceMatrix,
    pub case_target_data: Vec<serde_json::Value>,
}

/// Struktur untuk hasil análisis dengan informasi warnings/errors
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub success: bool,
    pub warnings: Vec<String>,
    pub error: Option<String>,
    pub data: Option<ClusteringResult>,
}

/// Input data for K-Means clustering.
///
/// Contains all the data needed to perform clustering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KMeansInput {
    pub temp_data: TempData,
    pub sliced_data_for_target: Vec<Vec<DataPoint>>,
    pub sliced_data_for_case_target: Vec<Vec<DataPoint>>,
    pub var_defs_for_target: Vec<Vec<VariableDef>>,
    pub var_defs_for_case_target: Vec<Vec<VariableDef>>,
}

/// K-Means clustering implementation.
/// 
/// Contains the configuration, data, and results of the clustering process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KMeansClustering {
    config: TempData,
    data: Vec<Vec<f64>>,
    variable_names: Vec<String>,
    centers: Vec<Vec<f64>>,
    initial_centers: Vec<Vec<f64>>,
    cluster_membership: Vec<usize>,
    distances: Vec<f64>,
    iterations: Vec<Vec<f64>>,
    iteration_count: usize,
    missing_count: usize,
    warnings: Vec<String>,
}
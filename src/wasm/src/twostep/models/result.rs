use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusteringResult {
    pub cell_distribution: CellDistribution,
    pub cluster_profiles: ClusterProfiles,
    pub auto_clustering: AutoClustering,
    pub cluster_distribution: ClusterDistribution,
    pub clusters: Clusters,
    pub predictor_importance: PredictorImportance,
    pub cluster_sizes: ClusterSizes,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CellDistribution {
    pub x_axis: String,
    pub frequency_data: Vec<FrequencyPoint>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FrequencyPoint {
    pub x_value: f64,
    pub frequency: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterProfiles {
    pub centroids: HashMap<String, CentroidData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CentroidData {
    pub mean: f64,
    pub std_deviation: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AutoClustering {
    pub cluster_analysis: Vec<ClusterAnalysisPoint>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterAnalysisPoint {
    pub number_of_clusters: i32,
    pub bayesian_criterion: f64,
    pub bic_change: Option<f64>,
    pub ratio_of_bic_changes: Option<f64>,
    pub ratio_of_distance_measures: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterDistribution {
    pub clusters: Vec<ClusterGroup>,
    pub total: ClusterGroup,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterGroup {
    pub n: i32,
    pub percent_of_combined: f64,
    pub percent_of_total: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Clusters {
    pub cluster_groups: Vec<ClusterGroupDetails>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterGroupDetails {
    pub label: Option<String>,
    pub description: Option<String>,
    pub size: f64,
    pub inputs: HashMap<String, f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PredictorImportance {
    pub predictors: HashMap<String, f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterSizes {
    pub clusters: Vec<ClusterSizeDetail>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterSizeDetail {
    pub cluster_number: i32,
    pub percent_values1: f64,
    pub percent_values2: f64,
    pub v4: i32,
    pub v5: f64,
}

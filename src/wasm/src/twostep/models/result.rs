use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusteringResult {
    pub model_summary: Option<ModelSummary>,
    pub cell_distribution: Option<CellDistribution>,
    pub cluster_profiles: Option<ClusterProfiles>,
    pub auto_clustering: Option<AutoClustering>,
    pub cluster_distribution: Option<ClusterDistribution>,
    pub clusters: Option<Clusters>,
    pub predictor_importance: Option<PredictorImportance>,
    pub cluster_sizes: Option<ClusterSizes>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelSummary {
    pub algorithm: String,
    pub inputs: i32,
    pub clusters: i32,
    pub silhouette: f64,
    pub quality: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CellDistribution {
    pub distributions: HashMap<String, VariableDistribution>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariableDistribution {
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
    pub frequencies: HashMap<String, FrequencyData>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FrequencyData {
    pub categories: HashMap<String, CategoryFrequency>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryFrequency {
    pub frequency: i32,
    pub percent: f64,
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
    pub aic_criterion: Option<f64>,
    pub bic_change: Option<f64>,
    pub aic_change: Option<f64>,
    pub ratio_of_bic_changes: Option<f64>,
    pub ratio_of_aic_changes: Option<f64>,
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CFNode {
    pub entries: Vec<CFEntry>,
    pub is_leaf: bool,
    pub children: Vec<CFNode>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CFEntry {
    pub n: i32,
    pub sum_values: Vec<f64>,
    pub sum_squared: Vec<f64>,
    pub category_counts: Vec<HashMap<String, i32>>,
    pub distance: f64,
    pub cases: Vec<usize>,
}

// Processed data structure
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessedData {
    pub categorical_variables: Vec<String>,
    pub continuous_variables: Vec<String>,
    pub data_matrix: Vec<Vec<f64>>,
    pub categorical_matrix: Vec<Vec<String>>,
    pub case_numbers: Vec<i32>,
    pub clusters: Vec<usize>,
    pub sub_clusters: Vec<CFEntry>,
    pub means: Vec<f64>,
    pub std_devs: Vec<f64>,
    pub num_clusters: i32,
    pub total_cases: usize,
    pub variable_importance: HashMap<String, f64>,
}

use serde::{Deserialize, Serialize};
use std::fmt;

/// Macro untuk pemeriksaan kondisi dan pengembalian error yang konsisten
#[macro_export]
macro_rules! ensure {
    ($condition:expr, $error_type:expr, $message:expr) => {
        if !$condition {
            return Err($error_type(format!($message)));
        }
    };
}

/// Linkage methods available for hierarchical clustering
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum LinkageMethod {
    AverageBetweenGroups,
    AverageWithinGroups,
    SingleLinkage,
    CompleteLinkage,
    Centroid,
    Median,
    Ward,
}

impl fmt::Display for LinkageMethod {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            LinkageMethod::AverageBetweenGroups => write!(f, "Average Linkage Between Groups"),
            LinkageMethod::AverageWithinGroups => write!(f, "Average Linkage Within Groups"),
            LinkageMethod::SingleLinkage => write!(f, "Single Linkage"),
            LinkageMethod::CompleteLinkage => write!(f, "Complete Linkage"),
            LinkageMethod::Centroid => write!(f, "Centroid Method"),
            LinkageMethod::Median => write!(f, "Median Method"),
            LinkageMethod::Ward => write!(f, "Ward's Method"),
        }
    }
}

/// Distance metrics for measuring similarity/dissimilarity
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum DistanceMetric {
    Euclidean,
    SquaredEuclidean,
    Manhattan,
    Chebyshev,
    Cosine,
    Correlation,
    Jaccard,
    ChiSquare,
    Minkowski,
}

/// Types of data that can be used with different distance metrics
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum DataType {
    Interval,
    Counts,
    Binary,
}

/// Standardization methods for input data
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum StandardizationMethod {
    ZScore,
    RangeNegOneToOne,
    RangeZeroToOne,
    MaxMagnitudeOne,
    MeanOne,
    StdDevOne,
    None,
}

/// Options for handling missing values
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum MissingValueStrategy {
    ExcludeListwise,
    ExcludePairwise,
}

/// Transformation options for distance measures
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum DistanceTransformation {
    AbsoluteValue,
    ChangeSign,
    RescaleZeroToOne,
    None,
}

/// Core configuration for clustering analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClusteringConfig {
    pub method: LinkageMethod,
    pub distance_metric: DistanceMetric,
    pub data_type: DataType,
    pub standardization: StandardizationMethod,
    pub missing_values: MissingValueStrategy,
    pub distance_transformation: DistanceTransformation,
    pub minkowski_power: Option<f64>,
    pub binary_options: Option<BinaryOptions>,
}

/// Options for binary data distance calculation
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BinaryOptions {
    pub present_value: f64,
    pub absent_value: f64,
}

/// Step in agglomerative clustering process
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AgglomerationStep {
    pub step: usize,
    pub cluster1: usize,
    pub cluster2: usize,
    pub coefficient: f64,
    pub stage_cluster1_first_appears: i32,
    pub stage_cluster2_first_appears: i32,
    pub next_stage: i32,
}

/// Complete agglomeration schedule
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AgglomerationSchedule {
    pub steps: Vec<AgglomerationStep>,
    pub method: LinkageMethod,
    pub distance_metric: DistanceMetric,
    pub standardization: StandardizationMethod,
}

/// Cluster membership information
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClusterMembership {
    pub case_ids: Vec<usize>,
    pub cluster_ids: Vec<usize>,
    pub num_clusters: usize,
}

/// Cluster evaluation metrics
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClusterEvaluation {
    pub silhouette: f64,
    pub sse: f64,
    pub ssb: f64,
    pub predictor_importance: Vec<f64>,
}

/// Error types for clustering operations
#[derive(Debug, Clone)]
pub enum ClusteringError {
    DataPreparationError(String),
    DistanceCalculationError(String),
    ClusteringProcessError(String),
    EvaluationError(String),
    InvalidConfiguration(String),
    GeneralError(String),
}

impl fmt::Display for ClusteringError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            ClusteringError::DataPreparationError(msg) => write!(f, "Data preparation error: {}", msg),
            ClusteringError::DistanceCalculationError(msg) => write!(f, "Distance calculation error: {}", msg),
            ClusteringError::ClusteringProcessError(msg) => write!(f, "Clustering process error: {}", msg),
            ClusteringError::EvaluationError(msg) => write!(f, "Evaluation error: {}", msg),
            ClusteringError::InvalidConfiguration(msg) => write!(f, "Invalid configuration: {}", msg),
            ClusteringError::GeneralError(msg) => write!(f, "Error: {}", msg),
        }
    }
}

impl std::error::Error for ClusteringError {}

/// Complete output from hierarchical clustering
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct HierarchicalClusteringResults {
    pub agglomeration_schedule: AgglomerationSchedule,
    pub proximity_matrix: Vec<Vec<f64>>,
    pub single_solution: Option<ClusterMembership>,
    pub range_solutions: Option<Vec<ClusterMembership>>,
    pub evaluation: Option<ClusterEvaluation>,
    pub dendrogram_data: Option<DendrogramData>,
}

/// Data for dendrogram visualization
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DendrogramData {
    pub heights: Vec<f64>,
    pub merges: Vec<(usize, usize)>,
    pub labels: Vec<String>,
}

/// Cluster node in hierarchical clustering
#[derive(Debug, Clone)]
pub struct ClusterNode {
    pub id: usize,
    pub members: Vec<usize>,
    pub size: usize,
    pub centroid: Vec<f64>,
    pub sum_squares: Vec<f64>,
}

impl ClusterNode {
    /// Create a new cluster node with a single point
    pub fn new(id: usize, point: &[f64]) -> Self {
        ClusterNode {
            id,
            members: vec![id],
            size: 1,
            centroid: point.to_vec(),
            sum_squares: point.iter().map(|&x| x * x).collect(),
        }
    }

    /// Merge two clusters into a new one
    pub fn merge(id: usize, cluster1: &ClusterNode, cluster2: &ClusterNode) -> Self {
        let total_size = cluster1.size + cluster2.size;
        let mut merged_members = cluster1.members.clone();
        merged_members.extend_from_slice(&cluster2.members);
        
        // Calculate new centroid as weighted average
        let weight1 = cluster1.size as f64 / total_size as f64;
        let weight2 = cluster2.size as f64 / total_size as f64;
        
        let new_centroid: Vec<f64> = cluster1.centroid.iter().zip(cluster2.centroid.iter())
            .map(|(&c1, &c2)| weight1 * c1 + weight2 * c2)
            .collect();
        
        // Update sum of squares
        let new_sum_squares: Vec<f64> = cluster1.sum_squares.iter().zip(cluster2.sum_squares.iter())
            .map(|(&s1, &s2)| s1 + s2)
            .collect();
        
        ClusterNode {
            id,
            members: merged_members,
            size: total_size,
            centroid: new_centroid,
            sum_squares: new_sum_squares,
        }
    }
}
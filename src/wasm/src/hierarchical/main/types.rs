use serde::{Deserialize, Serialize};
use std::fmt;

/// Linkage methods available for hierarchical clustering
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum LinkageMethod {
    /// Average distance between all pairs of objects in clusters
    AverageBetweenGroups,
    /// Average distance between all objects in the merged cluster
    AverageWithinGroups,
    /// Minimum distance between any two points across clusters
    SingleLinkage,
    /// Maximum distance between any two points across clusters
    CompleteLinkage,
    /// Distance between cluster centroids
    Centroid,
    /// Similar to centroid but doesn't weight by cluster size
    Median,
    /// Minimizes the increase in total within-cluster variance
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
    /// Standard Euclidean distance
    Euclidean,
    /// Squared Euclidean distance (no square root)
    SquaredEuclidean,
    /// Manhattan/city block distance
    Manhattan,
    /// Maximum distance along any dimension
    Chebyshev,
    /// Cosine similarity (1 - cosine angle)
    Cosine,
    /// Correlation-based distance
    Correlation,
    /// For binary data
    Jaccard,
    /// For count data
    ChiSquare,
    /// Minkowski distance with custom parameters
    Minkowski,
}

/// Types of data that can be used with different distance metrics
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum DataType {
    /// Continuous numerical data
    Interval,
    /// Count data
    Counts,
    /// Binary data
    Binary,
}

/// Standardization methods for input data
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum StandardizationMethod {
    /// Convert to z-scores
    ZScore,
    /// Scale to range -1 to 1
    RangeNegOneToOne,
    /// Scale to range 0 to 1
    RangeZeroToOne,
    /// Scale for maximum magnitude 1
    MaxMagnitudeOne,
    /// Scale for mean 1
    MeanOne,
    /// Scale for standard deviation 1
    StdDevOne,
    /// No standardization
    None,
}

/// Options for handling missing values
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum MissingValueStrategy {
    /// Exclude cases with any missing values
    ExcludeListwise,
    /// Use available pairwise data
    ExcludePairwise,
}

/// Transformation options for distance measures
#[derive(Serialize, Deserialize, Clone, Copy, Debug, PartialEq)]
pub enum DistanceTransformation {
    /// Use absolute values
    AbsoluteValue,
    /// Change sign of distances
    ChangeSign,
    /// Rescale to 0-1 range
    RescaleZeroToOne,
    /// No transformation
    None,
}

/// Core configuration for clustering analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClusteringConfig {
    /// Method used for clustering
    pub method: LinkageMethod,
    /// Distance metric for measuring similarity
    pub distance_metric: DistanceMetric,
    /// Type of data being analyzed
    pub data_type: DataType,
    /// How to standardize input data
    pub standardization: StandardizationMethod,
    /// How to handle missing values
    pub missing_values: MissingValueStrategy,
    /// How to transform distance measures
    pub distance_transformation: DistanceTransformation,
    /// Parameters for Minkowski distance (p value)
    pub minkowski_power: Option<f64>,
    /// Options for binary data distance calculation
    pub binary_options: Option<BinaryOptions>,
}

/// Options for binary data distance calculation
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BinaryOptions {
    /// Value representing present state
    pub present_value: f64,
    /// Value representing absent state
    pub absent_value: f64,
}

/// Step in agglomerative clustering process
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AgglomerationStep {
    /// Step number
    pub step: usize,
    /// First cluster joined
    pub cluster1: usize,
    /// Second cluster joined
    pub cluster2: usize,
    /// Distance/similarity coefficient at joining
    pub coefficient: f64,
    /// Stage where this cluster first appears
    pub stage_cluster1_first_appears: i32,
    /// Stage where this cluster first appears
    pub stage_cluster2_first_appears: i32,
    /// Next stage where this cluster is used
    pub next_stage: i32,
}

/// Complete agglomeration schedule
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AgglomerationSchedule {
    /// Steps in the agglomeration process
    pub steps: Vec<AgglomerationStep>,
    /// Method used for clustering
    pub method: LinkageMethod,
    /// Distance metric used
    pub distance_metric: DistanceMetric,
    /// Standardization method used
    pub standardization: StandardizationMethod,
}

/// Cluster membership information
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClusterMembership {
    /// Case IDs in original order
    pub case_ids: Vec<usize>,
    /// Cluster membership for each case
    pub cluster_ids: Vec<usize>,
    /// Number of clusters in solution
    pub num_clusters: usize,
}

/// Cluster evaluation metrics
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClusterEvaluation {
    /// Silhouette coefficient (-1 to 1, higher is better)
    pub silhouette: f64,
    /// Sum of squares error (lower is better)
    pub sse: f64,
    /// Sum of squares between clusters (higher is better)
    pub ssb: f64,
    /// Predictor importance scores (per variable)
    pub predictor_importance: Vec<f64>,
}

/// Error types for clustering operations
#[derive(Debug, Clone)]
pub enum ClusteringError {
    /// Error during input data preparation
    DataPreparationError(String),
    /// Error during distance calculation
    DistanceCalculationError(String),
    /// Error during clustering process
    ClusteringProcessError(String),
    /// Error in evaluation metrics
    EvaluationError(String),
    /// Invalid configuration parameters
    InvalidConfiguration(String),
    /// General error
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
    /// Schedule of agglomeration steps
    pub agglomeration_schedule: AgglomerationSchedule,
    /// Proximity matrix (distances/similarities)
    pub proximity_matrix: Vec<Vec<f64>>,
    /// Cluster membership for single solution
    pub single_solution: Option<ClusterMembership>,
    /// Cluster membership for range of solutions
    pub range_solutions: Option<Vec<ClusterMembership>>,
    /// Cluster evaluation metrics
    pub evaluation: Option<ClusterEvaluation>,
    /// Dendrogram data for plotting
    pub dendrogram_data: Option<DendrogramData>,
}

/// Data for dendrogram visualization
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DendrogramData {
    /// Heights at which clusters merge
    pub heights: Vec<f64>,
    /// Paired indices of clusters being merged
    pub merges: Vec<(usize, usize)>,
    /// Labels for leaf nodes
    pub labels: Vec<String>,
}

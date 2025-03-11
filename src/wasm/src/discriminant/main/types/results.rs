use serde::{Deserialize, Serialize};
pub use super::base::*;

/// F and Lambda result
#[derive(Serialize, Deserialize, Clone)]
pub struct FLambdaResult {
    pub f: f64,
    pub lambda: f64,
    pub df1: u32,
    pub df2: u32,
    pub sig: f64,  // Significance (p-value)
}

/// Box's M test result
#[derive(Serialize, Deserialize, Clone)]
pub struct BoxMResult {
    pub m: f64,
    pub f: f64,
    pub df1: f64,
    pub df2: f64,
    pub p_value: f64,
    pub log_determinants: Vec<(usize, f64)>, // (group_id, log_determinant)
    pub pooled_log_determinant: f64,
}

/// Chi-Square result for Wilks' Lambda
#[derive(Serialize, Deserialize, Clone)]
pub struct ChiSquareResult {
    pub chi_square: f64,
    pub df: u32,
    pub p_value: f64,
}

/// Eigen Statistics
#[derive(Serialize, Deserialize, Clone)]
pub struct EigenStats {
    pub eigenvalue: f64,
    pub pct_of_variance: f64,
    pub cumulative_pct: f64,
    pub canonical_correlation: f64,
}

/// Classification Results
#[derive(Serialize, Deserialize, Clone)]
pub struct ClassificationResults {
    pub original_count: Vec<Vec<usize>>,
    pub original_percentage: Vec<Vec<f64>>,
    pub cross_val_count: Vec<Vec<usize>>,
    pub cross_val_percentage: Vec<Vec<f64>>,
    pub original_correct_pct: f64,
    pub cross_val_correct_pct: f64,
}

/// Result of classifying a single case
#[derive(Serialize, Deserialize, Clone)]
pub struct ClassificationResult {
    pub predicted_group: usize,
    pub posterior_probabilities: Vec<f64>,
    pub discriminant_functions: Vec<f64>,
    pub mahalanobis_distances: Vec<f64>,
    pub chi_square_probs: Vec<f64>,
}

/// Complete discriminant analysis results
#[derive(Serialize, Deserialize, Clone)]
pub struct DiscriminantResults {
    pub case_processing_summary: CaseProcessingSummary,
    pub group_statistics: GroupStatistics,

    // Tests of Equality of Group Means
    pub wilks_lambda: Vec<FLambdaResult>,

    // Pooled Within-Groups Matrices
    pub pooled_covariance: Vec<Vec<f64>>,
    pub pooled_correlation: Vec<Vec<f64>>,

    // Covariance Matrices
    pub group_covariance: Vec<Vec<Vec<f64>>>,
    pub total_covariance: Vec<Vec<f64>>,

    // Box's Test Results
    pub box_m: BoxMResult,

    // Eigenvalues
    pub eigen_stats: Vec<EigenStats>,

    // Wilks' Lambda for functions
    pub functions_lambda: Vec<ChiSquareResult>,

    // Standardized Canonical Discriminant Function Coefficients
    pub std_coefficients: Vec<Vec<f64>>,

    // Stepwise Statistics
    pub stepwise_statistics: Option<StepwiseStatistics>,

    // Structure Matrix
    pub structure_matrix: Vec<Vec<f64>>,

    // Canonical Discriminant Function Coefficients
    pub unstd_coefficients: Vec<Vec<f64>>,

    // Functions at Group Centroids
    pub group_centroids: Vec<Vec<f64>>,

    // Classification Function Coefficients
    pub classification_functions: Vec<Vec<f64>>,

    // Classification Results
    pub classification_results: ClassificationResults,

    // Original data summary
    pub means_by_group: Vec<Vec<f64>>,
    pub means_overall: Vec<f64>,

    // Variable names
    pub variable_names: Vec<String>,
    pub group_name: String,
    pub group_values: Vec<usize>,
}

/// Error type for discriminant analysis operations
#[derive(Debug, Clone)]
pub enum DiscriminantError {
    NotEnoughGroups,
    InvalidGroupSize,
    InsufficientData,
    SingularMatrix,
    NotEnoughVariables,
    InvalidConfiguration,
    ComputationError(String),
    InvalidInput(String),
}

impl std::fmt::Display for DiscriminantError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            DiscriminantError::NotEnoughGroups => write!(f, "Not enough groups for analysis"),
            DiscriminantError::InvalidGroupSize => write!(f, "Group size is invalid"),
            DiscriminantError::InsufficientData => write!(f, "Insufficient data for analysis"),
            DiscriminantError::SingularMatrix => write!(f, "Singular matrix encountered"),
            DiscriminantError::NotEnoughVariables => write!(f, "Not enough variables"),
            DiscriminantError::InvalidConfiguration => write!(f, "Invalid analysis configuration"),
            DiscriminantError::ComputationError(msg) => write!(f, "Computation error: {}", msg),
            DiscriminantError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
        }
    }
}

impl std::error::Error for DiscriminantError {}
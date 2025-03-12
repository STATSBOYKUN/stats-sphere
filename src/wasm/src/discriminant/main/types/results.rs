use serde::{Deserialize, Serialize};
pub use super::base::*;

/// F-statistic and Wilks' Lambda result for equality tests
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct FLambdaResult {
    /// F-statistic value
    pub f: f64,
    
    /// Wilks' Lambda value
    pub lambda: f64,
    
    /// Degrees of freedom 1
    pub df1: u32,
    
    /// Degrees of freedom 2
    pub df2: u32,
    
    /// Significance level (p-value)
    pub sig: f64,  
}

/// Box's M test result for equality of covariance matrices
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BoxMResult {
    /// Box's M statistic
    pub m: f64,
    
    /// F approximation
    pub f: f64,
    
    /// Degrees of freedom 1
    pub df1: f64,
    
    /// Degrees of freedom 2
    pub df2: f64,
    
    /// Significance level (p-value)
    pub p_value: f64,
    
    /// Log determinants for each group's covariance matrix
    pub log_determinants: Vec<(usize, f64)>, // (group_id, log_determinant)
    
    /// Log determinant of pooled covariance matrix
    pub pooled_log_determinant: f64,
}

/// Chi-Square test result for Wilks' Lambda
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ChiSquareResult {
    /// Chi-square statistic
    pub chi_square: f64,
    
    /// Degrees of freedom
    pub df: u32,
    
    /// Significance level (p-value)
    pub p_value: f64,
}

/// Eigenvalue statistics for canonical discriminant functions
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct EigenStats {
    /// Eigenvalue
    pub eigenvalue: f64,
    
    /// Percentage of variance explained
    pub pct_of_variance: f64,
    
    /// Cumulative percentage of variance explained
    pub cumulative_pct: f64,
    
    /// Canonical correlation
    pub canonical_correlation: f64,
}

/// Classification results summary
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClassificationResults {
    /// Counts of original classification by group
    pub original_count: Vec<Vec<usize>>,
    
    /// Percentages of original classification by group
    pub original_percentage: Vec<Vec<f64>>,
    
    /// Counts of cross-validated classification by group
    pub cross_val_count: Vec<Vec<usize>>,
    
    /// Percentages of cross-validated classification by group
    pub cross_val_percentage: Vec<Vec<f64>>,
    
    /// Overall percentage correct for original classification
    pub original_correct_pct: f64,
    
    /// Overall percentage correct for cross-validated classification
    pub cross_val_correct_pct: f64,
}

/// Classification result for a single case
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ClassificationResult {
    /// Predicted group for the case
    pub predicted_group: usize,
    
    /// Posterior probabilities for each group
    pub posterior_probabilities: Vec<f64>,
    
    /// Discriminant function values
    pub discriminant_functions: Vec<f64>,
    
    /// Mahalanobis distances to each group centroid
    pub mahalanobis_distances: Vec<f64>,
    
    /// Chi-square probabilities for Mahalanobis distances
    pub chi_square_probs: Vec<f64>,
}

/// Complete discriminant analysis results
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DiscriminantResults {
    /// Summary of case processing
    pub case_processing_summary: CaseProcessingSummary,
    
    /// Group statistics
    pub group_statistics: GroupStatistics,

    /// Tests of equality of group means
    pub wilks_lambda: Vec<FLambdaResult>,

    /// Pooled within-groups covariance matrix
    pub pooled_covariance: Vec<Vec<f64>>,
    
    /// Pooled within-groups correlation matrix
    pub pooled_correlation: Vec<Vec<f64>>,

    /// Covariance matrices for each group
    pub group_covariance: Vec<Vec<Vec<f64>>>,
    
    /// Total covariance matrix
    pub total_covariance: Vec<Vec<f64>>,

    /// Box's M test results
    pub box_m: BoxMResult,

    /// Eigenvalue statistics
    pub eigen_stats: Vec<EigenStats>,

    /// Wilks' Lambda for discriminant functions
    pub functions_lambda: Vec<ChiSquareResult>,

    /// Standardized canonical discriminant function coefficients
    pub std_coefficients: Vec<Vec<f64>>,

    /// Stepwise discriminant analysis statistics (if performed)
    pub stepwise_statistics: Option<StepwiseStatistics>,

    /// Structure matrix (correlations between variables and functions)
    pub structure_matrix: Vec<Vec<f64>>,

    /// Unstandardized canonical discriminant function coefficients
    pub unstd_coefficients: Vec<Vec<f64>>,

    /// Group centroids in discriminant function space
    pub group_centroids: Vec<Vec<f64>>,

    /// Classification function coefficients
    pub classification_functions: Vec<Vec<f64>>,

    /// Classification results
    pub classification_results: ClassificationResults,

    /// Group means for variables
    pub means_by_group: Vec<Vec<f64>>,
    
    /// Overall means for variables
    pub means_overall: Vec<f64>,

    /// Variable names
    pub variable_names: Vec<String>,
    
    /// Group variable name
    pub group_name: String,
    
    /// Values for groups
    pub group_values: Vec<usize>,
}

/// Error type for discriminant analysis operations
#[derive(Debug, Clone)]
pub enum DiscriminantError {
    /// Not enough groups for analysis (need at least 2)
    NotEnoughGroups,
    
    /// Group size is invalid (empty group or insufficient cases)
    InvalidGroupSize,
    
    /// Insufficient data for analysis
    InsufficientData,
    
    /// Matrix is singular (determinant = 0)
    SingularMatrix,
    
    /// Not enough variables for analysis
    NotEnoughVariables,
    
    /// Invalid configuration of analysis parameters
    InvalidConfiguration,
    
    /// Error during computation with detailed message
    ComputationError(String),
    
    /// Invalid input parameters with detailed message
    InvalidInput(String),
}

impl std::fmt::Display for DiscriminantError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            DiscriminantError::NotEnoughGroups => write!(f, "Not enough groups for analysis (minimum 2 required)"),
            DiscriminantError::InvalidGroupSize => write!(f, "Group size is invalid (empty group or insufficient cases)"),
            DiscriminantError::InsufficientData => write!(f, "Insufficient data for analysis"),
            DiscriminantError::SingularMatrix => write!(f, "Singular matrix encountered (determinant = 0)"),
            DiscriminantError::NotEnoughVariables => write!(f, "Not enough variables for analysis"),
            DiscriminantError::InvalidConfiguration => write!(f, "Invalid analysis configuration"),
            DiscriminantError::ComputationError(msg) => write!(f, "Computation error: {}", msg),
            DiscriminantError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
        }
    }
}

impl std::error::Error for DiscriminantError {}
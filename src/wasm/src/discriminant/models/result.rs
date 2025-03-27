use serde::{Deserialize, Serialize};

/// Stepwise method options for variable selection in discriminant analysis
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Debug)]
pub enum StepwiseMethod {
    /// Wilks' lambda - minimizes Lambda at each step (default)
    Wilks,            
    /// Minimizes unexplained variance between groups
    Unexplained,      
    /// Maximizes Mahalanobis distance between closest groups
    Mahalanobis,      
    /// Maximizes smallest F ratio between groups
    SmallestF,        
    /// Maximizes Rao's V (Lawley-Hotelling trace)
    RaoV,             
}

/// Criteria type options for stepwise variable selection
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq, Debug)]
pub enum CriteriaType {
    /// Use F value thresholds for entry/removal
    FValue,           
    /// Use probability of F thresholds for entry/removal
    Probability,      
}

/// Stepwise criteria parameters for variable selection
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StepwiseCriteria {
    /// Type of criteria (F-value or probability)
    pub criteria_type: CriteriaType,
    
    /// Entry threshold (3.84 for F, 0.05 for probability)
    pub entry: f64,    
    
    /// Removal threshold (2.71 for F, 0.10 for probability)
    pub removal: f64,  
    
    /// Minimum Rao's V to enter (only used with Rao's V method)
    pub v_to_enter: f64,
}

/// Display options for stepwise discriminant analysis output
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StepwiseDisplay {
    /// Show summary of steps in the analysis
    pub summary_steps: bool,      
    
    /// Show F statistics for pairwise group distances
    pub pairwise_distances: bool, 
}

/// Information about each step in stepwise discriminant analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StepInfo {
    /// Step number in the analysis
    pub step: usize,
    
    /// Index of the variable entered/removed
    pub variable_index: usize,
    
    /// Name of the variable entered/removed
    pub variable_name: String,
    
    /// Action taken ("Entered" or "Removed")
    pub action: String,           
    
    /// F or Wilks' Lambda statistic value
    pub statistic: f64,           
    
    /// Degrees of freedom 1
    pub df1: usize,
    
    /// Degrees of freedom 2
    pub df2: usize,
    
    /// Degrees of freedom 3
    pub df3: usize,
    
    /// Wilks' Lambda value
    pub wilks_lambda: f64,
    
    /// Degrees of freedom for Wilks' Lambda
    pub wilks_df1: usize,
    
    /// Degrees of freedom for Wilks' Lambda
    pub wilks_df2: usize,
    
    /// Exact F statistic value
    pub exact_f: f64,
    
    /// Degrees of freedom for exact F
    pub exact_f_df1: usize,
    
    /// Degrees of freedom for exact F
    pub exact_f_df2: usize,
    
    /// Significance (p-value)
    pub significance: f64,
}

/// Information about variables currently in the discriminant analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VariableInAnalysis {
    /// Step number when status was recorded
    pub step: usize,
    
    /// Index of the variable
    pub variable_index: usize,
    
    /// Name of the variable
    pub variable_name: String,
    
    /// Tolerance value (1 - R²)
    pub tolerance: f64,
    
    /// F-to-remove statistic
    pub f_to_remove: f64,
}

/// Information about variables not in the discriminant analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct VariableNotInAnalysis {
    /// Step number when status was recorded
    pub step: usize,
    
    /// Index of the variable
    pub variable_index: usize,
    
    /// Name of the variable
    pub variable_name: String,
    
    /// Tolerance value if variable were to enter
    pub tolerance: f64,
    
    /// Minimum tolerance threshold
    pub min_tolerance: f64,
    
    /// F-to-enter statistic
    pub f_to_enter: f64,
    
    /// Wilks' Lambda if variable were to enter
    pub wilks_lambda: f64,
}

/// Pairwise group comparison information
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PairwiseComparison {
    /// Step number when comparison was calculated
    pub step: usize,
    
    /// First group in the pair
    pub group1: usize,
    
    /// Second group in the pair
    pub group2: usize,
    
    /// F-value for the difference between groups
    pub f_value: f64,
    
    /// Significance (p-value) of F
    pub significance: f64,
}

/// Complete statistics for stepwise discriminant analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct StepwiseStatistics {
    /// Method used for variable selection
    pub method: StepwiseMethod,
    
    /// Criteria for entry/removal
    pub criteria: StepwiseCriteria,
    
    /// Display options
    pub display: StepwiseDisplay,
    
    /// Information for each step
    pub steps: Vec<StepInfo>,
    
    /// Variables currently in the analysis
    pub variables_in_analysis: Vec<VariableInAnalysis>,
    
    /// Variables not in the analysis
    pub variables_not_in_analysis: Vec<VariableNotInAnalysis>,
    
    /// Wilks' Lambda for each step
    pub wilks_lambda_steps: Vec<StepInfo>,
    
    /// Pairwise group comparisons
    pub pairwise_comparisons: Vec<PairwiseComparison>,
    
    /// Maximum number of steps allowed
    pub max_steps: usize,
    
    /// Tolerance threshold for variable selection
    pub tolerance: f64,
}

/// Case processing summary information
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct CaseProcessingSummary {
    /// Number of valid cases
    pub valid_count: usize,
    
    /// Percentage of valid cases
    pub valid_percent: f64,
    
    /// Number of cases excluded due to missing group
    pub excluded_missing_group: usize,
    
    /// Percentage of cases excluded due to missing group
    pub excluded_missing_group_percent: f64,
    
    /// Number of cases excluded due to missing variables
    pub excluded_missing_var: usize,
    
    /// Percentage of cases excluded due to missing variables
    pub excluded_missing_var_percent: f64,
    
    /// Number of cases excluded due to both missing group and variables
    pub excluded_both: usize,
    
    /// Percentage of cases excluded due to both missing group and variables
    pub excluded_both_percent: f64,
    
    /// Total number of excluded cases
    pub excluded_total: usize,
    
    /// Percentage of total excluded cases
    pub excluded_total_percent: f64,
    
    /// Total number of cases
    pub total_count: usize,
    
    /// Total percentage (always 100.0)
    pub total_percent: f64,
}

/// Group statistics information
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct GroupStatistics {
    /// Values identifying each group
    pub group_values: Vec<usize>,
    
    /// Names of the variables
    pub variable_names: Vec<String>,
    
    /// Mean values for each group and variable
    pub means: Vec<Vec<f64>>,
    
    /// Standard deviations for each group and variable
    pub std_deviations: Vec<Vec<f64>>,
    
    /// Number of cases in each group (unweighted)
    pub unweighted_counts: Vec<usize>,
    
    /// Weighted count of cases in each group
    pub weighted_counts: Vec<f64>,
    
    /// Overall means for each variable
    pub total_means: Vec<f64>,
    
    /// Overall standard deviations for each variable
    pub total_std_deviations: Vec<f64>,
    
    /// Total number of cases (unweighted)
    pub total_unweighted_count: usize,
    
    /// Total number of cases (weighted)
    pub total_weighted_count: f64,
}

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
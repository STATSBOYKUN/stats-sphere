use serde::{Deserialize, Serialize};

/// Case processing summary information
#[derive(Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    pub valid_count: usize,
    pub valid_percent: f64,
    pub excluded_missing_group: usize,
    pub excluded_missing_group_percent: f64,
    pub excluded_missing_var: usize,
    pub excluded_missing_var_percent: f64,
    pub excluded_both: usize,
    pub excluded_both_percent: f64,
    pub excluded_total: usize,
    pub excluded_total_percent: f64,
    pub total_count: usize,
    pub total_percent: f64,
}

/// Group statistics information
#[derive(Serialize, Deserialize, Clone)]
pub struct GroupStatistics {
    pub group_values: Vec<usize>,
    pub variable_names: Vec<String>,
    pub means: Vec<Vec<f64>>,
    pub std_deviations: Vec<Vec<f64>>,
    pub unweighted_counts: Vec<usize>,
    pub weighted_counts: Vec<f64>,
    pub total_means: Vec<f64>,
    pub total_std_deviations: Vec<f64>,
    pub total_unweighted_count: usize,
    pub total_weighted_count: f64,
}

/// Stepwise method options
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum StepwiseMethod {
    Wilks,            // Wilks' lambda (default)
    Unexplained,      // Unexplained variance
    Mahalanobis,      // Mahalanobis distance
    SmallestF,        // Smallest F ratio
    RaoV,             // Rao's V
}

/// Criteria type options
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum CriteriaType {
    FValue,           // Use F value (default)
    Probability,      // Use probability of F
}

/// Stepwise criteria parameters
#[derive(Serialize, Deserialize, Clone)]
pub struct StepwiseCriteria {
    pub criteria_type: CriteriaType,
    pub entry: f64,    // Entry value (default: 3.84 for F, 0.05 for probability)
    pub removal: f64,  // Removal value (default: 2.71 for F, 0.10 for probability)
    pub v_to_enter: f64, // Minimum Rao's V to enter (default: 0.0)
}

/// Display options for stepwise output
#[derive(Serialize, Deserialize, Clone)]
pub struct StepwiseDisplay {
    pub summary_steps: bool,      // Show summary of steps (default: true)
    pub pairwise_distances: bool, // Show F for pairwise distances (default: true)
}

/// Step information for variables entered/removed
#[derive(Serialize, Deserialize, Clone)]
pub struct StepInfo {
    pub step: usize,
    pub variable_index: usize,
    pub variable_name: String,
    pub action: String,           // "Entered" or "Removed"
    pub statistic: f64,           // F or Wilks' Lambda
    pub df1: usize,
    pub df2: usize,
    pub df3: usize,
    pub wilks_lambda: f64,
    pub wilks_df1: usize,
    pub wilks_df2: usize,
    pub exact_f: f64,
    pub exact_f_df1: usize,
    pub exact_f_df2: usize,
    pub significance: f64,
}

/// Variable information for variables in analysis
#[derive(Serialize, Deserialize, Clone)]
pub struct VariableInAnalysis {
    pub step: usize,
    pub variable_index: usize,
    pub variable_name: String,
    pub tolerance: f64,
    pub f_to_remove: f64,
}

/// Variable information for variables not in analysis
#[derive(Serialize, Deserialize, Clone)]
pub struct VariableNotInAnalysis {
    pub step: usize,
    pub variable_index: usize,
    pub variable_name: String,
    pub tolerance: f64,
    pub min_tolerance: f64,
    pub f_to_enter: f64,
    pub wilks_lambda: f64,
}

/// Pairwise comparison information
#[derive(Serialize, Deserialize, Clone)]
pub struct PairwiseComparison {
    pub step: usize,
    pub group1: usize,
    pub group2: usize,
    pub f_value: f64,
    pub significance: f64,
}

/// Complete stepwise statistics
#[derive(Serialize, Deserialize, Clone)]
pub struct StepwiseStatistics {
    pub method: StepwiseMethod,
    pub criteria: StepwiseCriteria,
    pub display: StepwiseDisplay,
    pub steps: Vec<StepInfo>,
    pub variables_in_analysis: Vec<VariableInAnalysis>,
    pub variables_not_in_analysis: Vec<VariableNotInAnalysis>,
    pub wilks_lambda_steps: Vec<StepInfo>,
    pub pairwise_comparisons: Vec<PairwiseComparison>,
    pub max_steps: usize,
    pub tolerance: f64,
}

/// Hasil dari perhitungan F dan Lambda
#[derive(Serialize, Deserialize, Clone)]
pub struct FLambdaResult {
    pub f: f64,
    pub lambda: f64,
    pub df1: u32,
    pub df2: u32,
    pub sig: f64,  // Significance (p-value)
}

/// Hasil dari uji Box's M
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

/// Hasil Chi-Square untuk Wilks' Lambda
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

/// Struktur untuk menyimpan hasil klasifikasi
#[derive(Serialize, Deserialize, Clone)]
pub struct ClassificationResults {
    pub original_count: Vec<Vec<usize>>,
    pub original_percentage: Vec<Vec<f64>>,
    pub cross_val_count: Vec<Vec<usize>>,
    pub cross_val_percentage: Vec<Vec<f64>>,
    pub original_correct_pct: f64,
    pub cross_val_correct_pct: f64,
}

/// Hasil dari klasifikasi satu kasus
#[derive(Serialize, Deserialize, Clone)]
pub struct ClassificationResult {
    pub predicted_group: usize,
    pub posterior_probabilities: Vec<f64>,
    pub discriminant_functions: Vec<f64>,
    pub mahalanobis_distances: Vec<f64>,
    pub chi_square_probs: Vec<f64>,
}

/// Struktur untuk menyimpan hasil analisis diskriminan lengkap
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

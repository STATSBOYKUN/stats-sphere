use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscriminantResult {
    #[serde(rename = "processing_summary")]
    pub processing_summary: ProcessingSummary,
    #[serde(rename = "group_statistics")]
    pub group_statistics: Option<GroupStatistics>,
    #[serde(rename = "equality_tests")]
    pub equality_tests: Option<EqualityTests>,
    #[serde(rename = "canonical_functions")]
    pub canonical_functions: Option<CanonicalFunctions>,
    #[serde(rename = "structure_matrix")]
    pub structure_matrix: Option<StructureMatrix>,
    #[serde(rename = "classification_results")]
    pub classification_results: Option<ClassificationResults>,
    #[serde(rename = "box_m_test")]
    pub box_m_test: Option<BoxMTest>,
    #[serde(rename = "pooled_matrices")]
    pub pooled_matrices: Option<PooledMatrices>,
    #[serde(rename = "covariance_matrices")]
    pub covariance_matrices: Option<CovarianceMatrices>,
    #[serde(rename = "log_determinants")]
    pub log_determinants: Option<LogDeterminants>,
    #[serde(rename = "eigen_description")]
    pub eigen_description: Option<EigenDescription>,
    #[serde(rename = "stepwise_statistics")]
    pub stepwise_statistics: Option<StepwiseStatistics>,
    #[serde(rename = "wilks_lambda_test")]
    pub wilks_lambda_test: Option<WilksLambdaTest>,
    #[serde(rename = "casewise_statistics")]
    pub casewise_statistics: Option<CasewiseStatistics>,
    #[serde(rename = "prior_probabilities")]
    pub prior_probabilities: Option<PriorProbabilities>,
    #[serde(rename = "classification_function_coefficients")]
    pub classification_function_coefficients: Option<ClassificationFunctionCoefficients>,
    #[serde(rename = "discriminant_histograms")]
    pub discriminant_histograms: Option<DiscriminantHistograms>,
    #[serde(rename = "executed_functions")]
    pub executed_functions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessingSummary {
    #[serde(rename = "valid_count")]
    pub valid_cases: usize,
    #[serde(rename = "excluded_count")]
    pub excluded_cases: usize,
    #[serde(rename = "total_count")]
    pub total_cases: usize,
    #[serde(rename = "valid_percent")]
    pub valid_percent: Option<f64>,
    #[serde(rename = "missing_group_codes")]
    pub missing_group_codes: Option<usize>,
    #[serde(rename = "missing_group_percent")]
    pub missing_group_percent: Option<f64>,
    #[serde(rename = "missing_disc_vars")]
    pub missing_disc_vars: Option<usize>,
    #[serde(rename = "missing_disc_percent")]
    pub missing_disc_percent: Option<f64>,
    #[serde(rename = "both_missing")]
    pub both_missing: Option<usize>,
    #[serde(rename = "both_missing_percent")]
    pub both_missing_percent: Option<f64>,
    #[serde(rename = "total_excluded_percent")]
    pub total_excluded_percent: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GroupStatistics {
    pub groups: Vec<String>,
    pub variables: Vec<String>,
    pub means: HashMap<String, Vec<f64>>,
    #[serde(rename = "std_deviations")]
    pub std_deviations: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EqualityTests {
    pub variables: Vec<String>,
    #[serde(rename = "wilks_lambda")]
    pub wilks_lambda: Vec<f64>,
    #[serde(rename = "f_values")]
    pub f_values: Vec<f64>,
    pub df1: Vec<i32>,
    pub df2: Vec<i32>,
    pub significance: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EigenDescription {
    #[serde(rename = "functions")]
    pub functions: Vec<String>,
    #[serde(rename = "eigenvalue")]
    pub eigenvalue: Vec<f64>,
    #[serde(rename = "eigenvector")]
    pub eigenvector: Vec<f64>,
    #[serde(rename = "variance_percentage")]
    pub variance_percentage: Vec<f64>,
    #[serde(rename = "cumulative_percentage")]
    pub cumulative_percentage: Vec<f64>,
    #[serde(rename = "canonical_correlation")]
    pub canonical_correlation: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CanonicalFunctions {
    pub coefficients: HashMap<String, Vec<f64>>,
    #[serde(rename = "standardized_coefficients")]
    pub standardized_coefficients: HashMap<String, Vec<f64>>,
    #[serde(rename = "function_at_centroids")]
    pub function_at_centroids: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StructureMatrix {
    pub variables: Vec<String>,
    pub correlations: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClassificationResults {
    #[serde(rename = "original_classification")]
    pub original_classification: HashMap<String, Vec<i32>>,
    #[serde(rename = "cross_validated_classification")]
    pub cross_validated_classification: Option<HashMap<String, Vec<i32>>>,
    #[serde(rename = "original_percentage")]
    pub original_percentage: HashMap<String, Vec<f64>>,
    #[serde(rename = "cross_validated_percentage")]
    pub cross_validated_percentage: Option<HashMap<String, Vec<f64>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BoxMTest {
    #[serde(rename = "box_m")]
    pub box_m: f64,
    #[serde(rename = "f_approx")]
    pub f_approx: f64,
    pub df1: f64,
    pub df2: f64,
    #[serde(rename = "p_value")]
    pub p_value: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PooledMatrices {
    pub variables: Vec<String>,
    #[serde(rename = "covariance")]
    pub covariance: HashMap<String, HashMap<String, f64>>,
    #[serde(rename = "correlation")]
    pub correlation: HashMap<String, HashMap<String, f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CovarianceMatrices {
    pub groups: Vec<String>,
    pub variables: Vec<String>,
    #[serde(rename = "matrices")]
    pub matrices: HashMap<String, HashMap<String, HashMap<String, f64>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogDeterminants {
    pub groups: Vec<String>,
    pub ranks: Vec<i32>,
    #[serde(rename = "log_determinants")]
    pub log_determinants: Vec<f64>,
    #[serde(rename = "rank_pooled")]
    pub rank_pooled: i32,
    #[serde(rename = "pooled_log_determinant")]
    pub pooled_log_determinant: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StepwiseStatistics {
    #[serde(rename = "variables_entered")]
    pub variables_entered: Vec<String>,
    #[serde(rename = "variables_removed")]
    pub variables_removed: Vec<Option<String>>,
    #[serde(rename = "wilks_lambda")]
    pub wilks_lambda: Vec<f64>,
    #[serde(rename = "f_values")]
    pub f_values: Vec<f64>,
    pub df1: Vec<i32>,
    pub df2: Vec<i32>,
    pub df3: Vec<i32>,
    #[serde(rename = "exact_f")]
    pub exact_f: Vec<f64>,
    #[serde(rename = "exact_df1")]
    pub exact_df1: Vec<i32>,
    #[serde(rename = "exact_df2")]
    pub exact_df2: Vec<i32>,
    #[serde(rename = "significance")]
    pub significance: Vec<f64>,
    #[serde(rename = "variables_in_analysis")]
    pub variables_in_analysis: HashMap<String, Vec<VariableInAnalysis>>,
    #[serde(rename = "variables_not_in_analysis")]
    pub variables_not_in_analysis: HashMap<String, Vec<VariableNotInAnalysis>>,
    #[serde(rename = "pairwise_comparisons")]
    pub pairwise_comparisons: HashMap<String, HashMap<String, Vec<PairwiseComparison>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariableInAnalysis {
    pub variable: String,
    pub tolerance: f64,
    #[serde(rename = "f_to_remove")]
    pub f_to_remove: f64,
    #[serde(rename = "wilks_lambda")]
    pub wilks_lambda: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariableNotInAnalysis {
    pub variable: String,
    pub tolerance: f64,
    #[serde(rename = "min_tolerance")]
    pub min_tolerance: f64,
    #[serde(rename = "f_to_enter")]
    pub f_to_enter: f64,
    #[serde(rename = "wilks_lambda")]
    pub wilks_lambda: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PairwiseComparison {
    pub step: i32,
    pub group_name: String,
    pub f_value: f64,
    pub significance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WilksLambdaTest {
    #[serde(rename = "test_of_functions")]
    pub test_of_functions: Vec<String>,
    #[serde(rename = "wilks_lambda")]
    pub wilks_lambda: Vec<f64>,
    #[serde(rename = "chi_square")]
    pub chi_square: Vec<f64>,
    pub df: Vec<i32>,
    pub significance: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CasewiseStatistics {
    #[serde(rename = "case_number")]
    pub case_number: Vec<usize>,
    #[serde(rename = "actual_group")]
    pub actual_group: Vec<String>,
    #[serde(rename = "predicted_group")]
    pub predicted_group: Vec<String>,
    #[serde(rename = "highest_group")]
    pub highest_group: HighestGroupStatistics,
    #[serde(rename = "second_highest_group")]
    pub second_highest_group: HighestGroupStatistics,
    #[serde(rename = "discriminant_scores")]
    pub discriminant_scores: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct HighestGroupStatistics {
    #[serde(rename = "p_value")]
    pub p_value: Vec<f64>,
    pub df: Vec<usize>,
    #[serde(rename = "p_g_equals_d")]
    pub p_g_equals_d: Vec<f64>,
    #[serde(rename = "squared_mahalanobis_distance")]
    pub squared_mahalanobis_distance: Vec<f64>,
    pub group: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PriorProbabilities {
    pub groups: Vec<usize>,
    #[serde(rename = "prior_probabilities")]
    pub prior_probabilities: Vec<f64>,
    #[serde(rename = "cases_used")]
    pub cases_used: HashMap<String, Vec<usize>>,
    pub total: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClassificationFunctionCoefficients {
    pub groups: Vec<usize>,
    pub variables: Vec<String>,
    pub coefficients: HashMap<String, Vec<f64>>,
    #[serde(rename = "constant_terms")]
    pub constant_terms: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscriminantHistograms {
    #[serde(rename = "functions")]
    pub functions: Vec<String>,
    #[serde(rename = "groups")]
    pub groups: Vec<String>,
    #[serde(rename = "histograms")]
    pub histograms: HashMap<String, GroupHistogram>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GroupHistogram {
    #[serde(rename = "bin_count")]
    pub bin_count: i32,
    #[serde(rename = "bin_width")]
    pub bin_width: f64,
    #[serde(rename = "min_value")]
    pub min_value: f64,
    #[serde(rename = "max_value")]
    pub max_value: f64,
    #[serde(rename = "mean")]
    pub mean: f64,
    #[serde(rename = "std_dev")]
    pub std_dev: f64,
    #[serde(rename = "sample_size")]
    pub sample_size: i32,
    #[serde(rename = "bin_frequencies")]
    pub bin_frequencies: Vec<i32>,
    #[serde(rename = "bin_edges")]
    pub bin_edges: Vec<f64>,
}

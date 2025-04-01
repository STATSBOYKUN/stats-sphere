use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MCAResult {
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
    #[serde(rename = "stepwise_statistics")]
    pub stepwise_statistics: Option<StepwiseStatistics>,
    #[serde(rename = "wilks_lambda_test")]
    pub wilks_lambda_test: Option<WilksLambdaTest>,
    #[serde(rename = "discriminant_histograms")]
    pub discriminant_histograms: Option<DiscriminantHistograms>,
    #[serde(rename = "iteration_history")]
    pub iteration_history: Option<IterationHistory>,
    #[serde(rename = "model_summary")]
    pub model_summary: Option<ModelSummary>,
    #[serde(rename = "original_correlations")]
    pub original_correlations: Option<CorrelationsMatrix>,
    #[serde(rename = "transformed_correlations")]
    pub transformed_correlations: Option<CorrelationsMatrix>,
    #[serde(rename = "object_scores")]
    pub object_scores: Option<ObjectScores>,
    #[serde(rename = "object_contributions")]
    pub object_contributions: Option<ObjectContributions>,
    #[serde(rename = "discrimination_measures")]
    pub discrimination_measures: Option<DiscriminationMeasures>,
    #[serde(rename = "category_points")]
    pub category_points: Option<CategoryPoints>,
    #[serde(rename = "object_points_labeled")]
    pub object_points_labeled: Option<HashMap<String, ObjectPointsLabeled>>,
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
    #[serde(rename = "active_cases_with_missing")]
    pub active_cases_with_missing: Option<usize>,
    #[serde(rename = "supplementary_cases")]
    pub supplementary_cases: Option<usize>,
    #[serde(rename = "cases_used_in_analysis")]
    pub cases_used_in_analysis: Option<usize>,
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
pub struct CanonicalFunctions {
    pub eigenvalues: Vec<f64>,
    #[serde(rename = "variance_percentage")]
    pub variance_percentage: Vec<f64>,
    #[serde(rename = "cumulative_percentage")]
    pub cumulative_percentage: Vec<f64>,
    #[serde(rename = "canonical_correlation")]
    pub canonical_correlation: Vec<f64>,
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
    pub pairwise_comparisons: HashMap<String, Vec<PairwiseComparison>>,
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
    pub category1: i32,
    pub category2: i32,
    #[serde(rename = "f_value")]
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

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IterationHistory {
    #[serde(rename = "iteration_number")]
    pub iteration_number: Vec<i32>,
    #[serde(rename = "variance_accounted_total")]
    pub variance_accounted_total: Vec<f64>,
    #[serde(rename = "variance_accounted_increase")]
    pub variance_accounted_increase: Vec<f64>,
    pub loss: Vec<f64>,
    pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelSummary {
    pub dimension: Vec<String>,
    #[serde(rename = "cronbachs_alpha")]
    pub cronbachs_alpha: Vec<f64>,
    #[serde(rename = "variance_accounted_eigenvalue")]
    pub variance_accounted_eigenvalue: Vec<f64>,
    #[serde(rename = "variance_accounted_inertia")]
    pub variance_accounted_inertia: Vec<f64>,
    #[serde(rename = "variance_accounted_percentage")]
    pub variance_accounted_percentage: Vec<f64>,
    pub total: Option<TotalRow>,
    pub mean: Option<MeanRow>,
    pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TotalRow {
    pub cronbachs_alpha: Option<f64>,
    pub eigenvalue: f64,
    pub inertia: f64,
    pub percentage: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MeanRow {
    pub cronbachs_alpha: f64,
    pub eigenvalue: f64,
    pub inertia: f64,
    pub percentage: f64,
    pub note: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CorrelationsMatrix {
    pub variables: Vec<String>,
    pub dimensions: Vec<String>,
    pub eigenvalues: Vec<f64>,
    pub correlations: HashMap<String, HashMap<String, f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectScores {
    #[serde(rename = "case_numbers")]
    pub case_numbers: Vec<i32>,
    pub dimensions: Vec<String>,
    pub scores: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectContributions {
    #[serde(rename = "case_numbers")]
    pub case_numbers: Vec<i32>,
    pub mass: Vec<f64>,
    pub inertia: Vec<f64>,
    #[serde(rename = "point_to_inertia_dim1")]
    pub point_to_inertia_dim1: Vec<f64>,
    #[serde(rename = "point_to_inertia_dim2")]
    pub point_to_inertia_dim2: Vec<f64>,
    #[serde(rename = "dim1_to_inertia_point")]
    pub dim1_to_inertia_point: Vec<f64>,
    #[serde(rename = "dim2_to_inertia_point")]
    pub dim2_to_inertia_point: Vec<f64>,
    #[serde(rename = "total_to_inertia_point")]
    pub total_to_inertia_point: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscriminationMeasures {
    pub variables: Vec<String>,
    pub dimensions: Vec<String>,
    pub mean: Option<Vec<f64>>,
    pub measures: HashMap<String, Vec<f64>>,
    #[serde(rename = "active_total")]
    pub active_total: Vec<f64>,
    #[serde(rename = "percentage_of_variance")]
    pub percentage_of_variance: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryPoints {
    pub variables: Vec<String>,
    pub categories: HashMap<String, Vec<String>>,
    #[serde(rename = "dimension_coordinates")]
    pub dimension_coordinates: HashMap<String, HashMap<String, Vec<f64>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectPointsLabeled {
    pub dimension_labels: Vec<String>,
    #[serde(rename = "case_numbers")]
    pub case_numbers: Vec<i32>,
    #[serde(rename = "category_labels")]
    pub category_labels: Vec<String>,
    #[serde(rename = "dimension_coordinates")]
    pub dimension_coordinates: HashMap<String, Vec<f64>>,
}

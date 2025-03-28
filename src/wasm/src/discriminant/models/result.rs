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
    #[serde(rename = "executed_functions")]
    pub executed_functions: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessingSummary {
    #[serde(rename = "valid_count")] // Mengubah dari valid_cases ke valid_count
    pub valid_cases: usize,
    #[serde(rename = "excluded_count")] // Mengubah nama untuk konsistensi
    pub excluded_cases: usize,
    #[serde(rename = "total_count")] // Mengubah nama untuk konsistensi
    pub total_cases: usize,
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

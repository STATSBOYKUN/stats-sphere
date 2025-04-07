use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CATPCAResult {
    #[serde(rename = "case_processing_summary")]
    pub case_processing_summary: Option<CaseProcessingSummary>,
    #[serde(rename = "iteration_history")]
    pub iteration_history: Option<IterationHistory>,
    #[serde(rename = "model_summary")]
    pub model_summary: Option<ModelSummary>,
    #[serde(rename = "quantifications")]
    pub quantifications: Option<Quantifications>,
    #[serde(rename = "variance_accounted")]
    pub variance_accounted: Option<VarianceAccounted>,
    #[serde(rename = "correlations")]
    pub correlations: Option<Correlations>,
    #[serde(rename = "object_scores")]
    pub object_scores: Option<ObjectScores>,
    #[serde(rename = "component_loadings")]
    pub component_loadings: Option<ComponentLoadings>,
    #[serde(rename = "category_points")]
    pub category_points: Option<CategoryPoints>,
    #[serde(rename = "biplot")]
    pub biplot: Option<Biplot>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    #[serde(rename = "valid_active_cases")]
    pub valid_active_cases: i32,
    #[serde(rename = "active_cases_missing")]
    pub active_cases_missing: i32,
    #[serde(rename = "supplementary_cases")]
    pub supplementary_cases: i32,
    pub total: i32,
    #[serde(rename = "cases_used")]
    pub cases_used: i32,
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
    #[serde(rename = "centroid_coordinates")]
    pub centroid_coordinates: Vec<f64>,
    #[serde(rename = "restriction_coordinates")]
    pub restriction_coordinates: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelSummary {
    pub dimensions: Vec<i32>,
    #[serde(rename = "cronbachs_alpha")]
    pub cronbachs_alpha: Vec<f64>,
    #[serde(rename = "variance_accounted")]
    pub variance_accounted: Vec<f64>,
    #[serde(rename = "variance_percentage")]
    pub variance_percentage: Vec<f64>,
    pub total: ModelSummaryTotal,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelSummaryTotal {
    #[serde(rename = "cronbachs_alpha")]
    pub cronbachs_alpha: f64,
    #[serde(rename = "variance_total")]
    pub variance_total: f64,
    #[serde(rename = "variance_percentage")]
    pub variance_percentage: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Quantifications {
    pub categories: Vec<CategoryQuantification>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryQuantification {
    pub category: String,
    pub frequency: i32,
    pub quantification: f64,
    #[serde(rename = "centroid_coordinates")]
    pub centroid_coordinates: Vec<f64>,
    #[serde(rename = "vector_coordinates")]
    pub vector_coordinates: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VarianceAccounted {
    pub variables: Vec<String>,
    #[serde(rename = "centroid_coordinates")]
    pub centroid_coordinates: HashMap<String, Vec<f64>>,
    #[serde(rename = "vector_coordinates")]
    pub vector_coordinates: HashMap<String, Vec<f64>>,
    pub means: HashMap<String, f64>,
    pub totals: HashMap<String, f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Correlations {
    #[serde(rename = "original_variables")]
    pub original_variables: HashMap<String, HashMap<String, f64>>,
    #[serde(rename = "transformed_variables")]
    pub transformed_variables: HashMap<String, HashMap<String, f64>>,
    pub dimensions: Vec<i32>,
    pub eigenvalues: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectScores {
    pub clusters: Vec<String>,
    pub dimensions: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ComponentLoadings {
    pub variables: Vec<String>,
    pub dimensions: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryPoints {
    pub variables: Vec<String>,
    #[serde(rename = "centroid_coordinates")]
    pub centroid_coordinates: HashMap<String, Vec<Point>>,
    #[serde(rename = "vector_coordinates")]
    pub vector_coordinates: HashMap<String, Vec<Point>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Point {
    pub x: f64,
    pub y: f64,
    pub category: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Biplot {
    pub points: Vec<BiplotPoint>,
    #[serde(rename = "centroid_types")]
    pub centroid_types: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BiplotPoint {
    pub x: f64,
    pub y: f64,
    #[serde(rename = "point_type")]
    pub point_type: String,
    pub label: String,
    pub cluster: Option<String>,
}

use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OVERALSAnalysisResult {
    pub case_processing_summary: CaseProcessingSummary,
    pub variables: Vec<VariableInfo>,
    pub centroids: CentroidsResult,
    pub object_scores: ObjectScores,
    pub component_loadings: ComponentLoadings,
    pub weights: Weights,
    pub fit_measures: FitMeasures,
    pub transformation_plots: TransformationPlots,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    pub cases_used_in_analysis: usize,
    pub total_cases: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariableInfo {
    pub name: String,
    pub number_of_categories: usize,
    pub optimal_scaling_level: ScalingLevel,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ScalingLevel {
    Ordinal,
    Nominal,
    Single,
    Multiple,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CentroidsResult {
    pub centroids: HashMap<String, Vec<CentroidCategory>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CentroidCategory {
    pub marginal_frequency: usize,
    pub projected_centroids: Coordinates,
    pub category_centroids: Coordinates,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Coordinates {
    pub dimension1: f64,
    pub dimension2: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectScores {
    pub scores: Vec<ObjectScore>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectScore {
    pub dimension1: f64,
    pub dimension2: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ComponentLoadings {
    pub loadings: HashMap<String, Dimensions>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Dimensions {
    pub dimension1: f64,
    pub dimension2: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Weights {
    pub weights: HashMap<String, Dimensions>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FitMeasures {
    pub loss: HashMap<String, f64>,
    pub multiple_fit: FitDimensions,
    pub single_fit: FitDimensions,
    pub single_loss: FitDimensions,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FitDimensions {
    pub dimension1: f64,
    pub dimension2: f64,
    pub sum: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransformationPlots {
    pub transformations: HashMap<String, Vec<TransformationPoint>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TransformationPoint {
    pub category: usize,
    pub quantification: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IterationHistory {
    pub iterations: Vec<IterationStep>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IterationStep {
    pub loss: f64,
    pub fit: f64,
    pub difference_from_previous: f64,
}

// result.rs
use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NearestNeighborAnalysis {
    pub case_processing_summary: Option<CaseProcessingSummary>,
    pub system_settings: Option<SystemSettings>,
    pub predictor_importance: Option<PredictorImportance>,
    pub classification_table: Option<ClassificationTable>,
    pub error_summary: Option<ErrorSummary>,
    pub predictor_space: Option<PredictorSpace>,
    pub peers_chart: Option<PeersChart>,
    pub nearest_neighbors: Option<NearestNeighbors>,
    pub quadrant_map: Option<QuadrantMap>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    pub training: ProcessingSummaryDetail,
    pub holdout: ProcessingSummaryDetail,
    pub valid: ProcessingSummaryDetail,
    pub excluded: ProcessingSummaryDetail,
    pub total: ProcessingSummaryDetail,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessingSummaryDetail {
    pub n: Option<usize>,
    pub percent: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemSettings {
    pub rng: RngSetting,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RngSetting {
    pub keyword: String,
    pub description: String,
    pub setting: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PredictorImportance {
    pub predictors: HashMap<String, f64>,
    pub target: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClassificationTable {
    pub training: ClassificationPartition,
    pub holdout: ClassificationPartition,
    pub overall_percent: OverallPercent,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClassificationPartition {
    pub observed: Vec<usize>,
    pub predicted: Vec<usize>,
    pub percent_correct: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OverallPercent {
    pub training: f64,
    pub holdout: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ErrorSummary {
    pub training: f64,
    pub holdout: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PredictorSpace {
    pub model_predictors: usize,
    pub k_value: usize,
    pub dimensions: Vec<PredictorDimension>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PredictorDimension {
    pub name: String,
    pub points: Vec<DataPoint>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DataPoint {
    pub x: f64,
    pub y: f64,
    pub z: f64,
    pub focal: bool,
    pub target_value: bool,
    pub point_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NearestNeighbors {
    pub focal_neighbor_sets: Vec<FocalNeighborSet>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PeersChart {
    pub focal_neighbor_sets: Vec<FocalNeighborSet>,
    pub features: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuadrantMap {
    pub focal_neighbor_sets: Vec<FocalNeighborSet>,
    pub features: HashMap<String, Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FocalNeighborSet {
    pub focal_record: i32,
    pub neighbors: Vec<NeighborDetail>,
    pub distances: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NeighborDetail {
    pub id: i32,
    pub distance: f64,
}

use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NearestNeighborAnalysis {
    pub case_processing_summary: CaseProcessingSummary,
    pub system_settings: SystemSettings,
    pub predictor_importance: PredictorImportance,
    pub classification_table: ClassificationTable,
    pub error_summary: ErrorSummary,
    pub predictor_space: PredictorSpace,
    pub peers_chart: PeersChart,
    pub nearest_neighbors: NearestNeighbors,
    pub quadrant_map: QuadrantMap,
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
    pub focal: bool,
    pub purchase_outcome: bool,
    pub point_type: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PeersChart {
    pub purchase_outcome: PeerChartData,
    pub customer_age: PeerChartData,
    pub total_purchase_amount: PeerChartData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PeerChartData {
    pub focal_records: Vec<i32>,
    pub neighbors: Vec<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NearestNeighbors {
    pub focal_record: i32,
    pub neighbors: Vec<NeighborDetail>,
    pub distances: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NeighborDetail {
    pub id: i32,
    pub distance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuadrantMap {
    pub purchase_outcome: QuadrantMapData,
    pub customer_age: QuadrantMapData,
    pub total_purchase_amount: QuadrantMapData,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QuadrantMapData {
    pub focal_records: Vec<i32>,
    pub neighbors: Vec<i32>,
}

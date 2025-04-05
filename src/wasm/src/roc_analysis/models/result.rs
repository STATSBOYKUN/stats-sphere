use std::collections::HashMap;
use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ROCAnalysisResult {
    #[serde(rename = "case_processing_summary")]
    pub case_processing_summary: Option<CaseProcessingSummary>,
    #[serde(rename = "coordinates_precision_recall")]
    pub coordinates_precision_recall: Option<HashMap<String, Vec<PrecisionRecallCoordinate>>>,
    #[serde(rename = "coordinates_roc")]
    pub coordinates_roc: Option<HashMap<String, Vec<RocCoordinate>>>,
    #[serde(rename = "area_under_roc_curve")]
    pub area_under_roc_curve: Option<HashMap<String, AreaUnderRocCurve>>,
    #[serde(rename = "overall_model_quality")]
    pub overall_model_quality: Option<HashMap<String, f64>>,
    #[serde(rename = "classifier_evaluation_metrics")]
    pub classifier_evaluation_metrics: Option<HashMap<String, ClassifierEvaluationMetrics>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    pub positive: usize,
    pub negative: usize,
    pub missing: usize,
    pub total: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PrecisionRecallCoordinate {
    #[serde(rename = "positive_if_greater_than")]
    pub positive_if_greater_than: f64,
    pub precision: f64,
    pub recall: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RocCoordinate {
    #[serde(rename = "positive_if_greater_than")]
    pub positive_if_greater_than: f64,
    pub sensitivity: f64,
    #[serde(rename = "1_specificity")]
    pub one_minus_specificity: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AreaUnderRocCurve {
    pub area: f64,
    #[serde(rename = "std_error")]
    pub std_error: f64,
    #[serde(rename = "asymptotic_sig")]
    pub asymptotic_sig: f64,
    #[serde(rename = "asymptotic_95_confidence_interval")]
    pub asymptotic_95_confidence_interval: Interval,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Interval {
    #[serde(rename = "lower_bound")]
    pub lower_bound: f64,
    #[serde(rename = "upper_bound")]
    pub upper_bound: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClassifierEvaluationMetrics {
    #[serde(rename = "gini_index")]
    pub gini_index: f64,
    #[serde(rename = "max_k_s")]
    pub max_k_s: f64,
    pub cutoff: f64,
}

use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CorrespondenceAnalysisResult {
    pub correspondence_table: Option<CorrespondenceTable>,
    pub row_profiles: Option<RowProfiles>,
    pub column_profiles: Option<ColumnProfiles>,
    pub summary: Option<AnalysisSummary>,
    pub row_points: Option<PointsAnalysis>,
    pub column_points: Option<PointsAnalysis>,
    pub confidence_row_points: Option<ConfidencePoints>,
    pub confidence_column_points: Option<ConfidencePoints>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CorrespondenceTable {
    pub data: Vec<Vec<f64>>,
    pub active_margin: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RowProfiles {
    pub data: Vec<Vec<f64>>,
    pub mass: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ColumnProfiles {
    pub data: Vec<Vec<f64>>,
    pub mass: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AnalysisSummary {
    pub singular_values: Vec<f64>,
    pub inertia: Vec<f64>,
    pub chi_square: Vec<f64>,
    pub significance: Vec<f64>,
    pub proportion_of_inertia: ProportionOfInertia,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProportionOfInertia {
    pub accounted_for: Vec<f64>,
    pub cumulative: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PointsAnalysis {
    pub mass: Vec<f64>,
    pub scores: Vec<Vec<f64>>,
    pub inertia: Vec<f64>,
    pub contributions: PointContributions,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PointContributions {
    pub of_point_to_inertia: Vec<Vec<f64>>,
    pub of_dimension_to_inertia: Vec<Vec<f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfidencePoints {
    pub standard_deviation: Vec<Vec<f64>>,
    pub correlation: Vec<f64>,
}

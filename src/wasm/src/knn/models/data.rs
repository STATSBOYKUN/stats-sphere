use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DataRecord {
    #[serde(flatten)]
    pub values: HashMap<String, DataValue>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
#[serde(untagged)]
pub enum DataValue {
    Number(f64),
    Text(String),
    Boolean(bool),
    Null,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct VariableDefinition {
    pub name: String,
    pub r#type: String,
    pub label: String,
    pub values: String,
    pub missing: String,
    pub measure: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AnalysisData {
    pub target_data: Vec<Vec<DataRecord>>,
    pub features_data: Vec<Vec<DataRecord>>,
    pub focal_case_data: Vec<Vec<DataRecord>>,
    pub case_data: Option<Vec<Vec<DataRecord>>>,
    pub target_data_defs: Vec<Vec<VariableDefinition>>,
    pub features_data_defs: Vec<Vec<VariableDefinition>>,
    pub focal_case_data_defs: Vec<Vec<VariableDefinition>>,
    pub case_data_defs: Option<Vec<Vec<VariableDefinition>>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnnData {
    pub features: Vec<String>,
    pub data_matrix: Vec<Vec<f64>>,
    pub target_values: Vec<DataValue>,
    pub case_identifiers: Vec<i32>,
    pub training_indices: Vec<usize>,
    pub holdout_indices: Vec<usize>,
    pub focal_indices: Vec<usize>,
}

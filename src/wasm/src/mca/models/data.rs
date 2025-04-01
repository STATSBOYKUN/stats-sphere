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
    pub analysis_data: Vec<Vec<DataRecord>>,
    pub supplement_data: Vec<Vec<DataRecord>>,
    pub labeling_data: Option<Vec<Vec<DataRecord>>>,
    pub analysis_data_defs: Vec<Vec<VariableDefinition>>,
    pub supplement_data_defs: Vec<Vec<VariableDefinition>>,
    pub labeling_data_defs: Option<Vec<Vec<VariableDefinition>>>,
}

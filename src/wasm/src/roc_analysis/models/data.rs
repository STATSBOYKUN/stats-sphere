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
    pub test_data: Vec<Vec<DataRecord>>,
    pub state_data: Vec<Vec<DataRecord>>,
    pub group_data: Vec<Vec<DataRecord>>,
    pub test_data_defs: Vec<Vec<VariableDefinition>>,
    pub state_data_defs: Vec<Vec<VariableDefinition>>,
    pub group_data_defs: Vec<Vec<VariableDefinition>>,
}

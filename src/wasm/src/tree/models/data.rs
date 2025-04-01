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
    pub dependent_data: Vec<Vec<DataRecord>>,
    pub independent_data: Vec<Vec<DataRecord>>,
    pub influence_data: Option<Vec<Vec<DataRecord>>>,
    pub dependent_data_defs: Vec<Vec<VariableDefinition>>,
    pub independent_data_defs: Vec<Vec<VariableDefinition>>,
    pub influence_data_defs: Option<Vec<Vec<VariableDefinition>>>,
}

use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DecisionTreeResult {
    #[serde(rename = "model_summary")]
    pub model_summary: ModelSummary,
    #[serde(rename = "misclassification_costs")]
    pub misclassification_costs: MisclassificationCosts,
    #[serde(rename = "tree_table")]
    pub tree_table: Vec<TreeTableNode>,
    #[serde(rename = "gains_for_nodes")]
    pub gains_for_nodes: Vec<GainsForNode>,
    #[serde(rename = "risk")]
    pub risk: RiskEstimate,
    #[serde(rename = "classification")]
    pub classification: Classification,
    #[serde(rename = "target_category_response")]
    pub target_category_response: TargetCategoryResponse,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelSummary {
    #[serde(rename = "growing_method")]
    pub growing_method: String,
    #[serde(rename = "dependent_variable")]
    pub dependent_variable: String,
    #[serde(rename = "independent_variables")]
    pub independent_variables: Vec<String>,
    #[serde(rename = "validation")]
    pub validation: String,
    #[serde(rename = "maximum_tree_depth")]
    pub maximum_tree_depth: u8,
    #[serde(rename = "minimum_cases_parent_node")]
    pub minimum_cases_parent_node: u16,
    #[serde(rename = "minimum_cases_child_node")]
    pub minimum_cases_child_node: u16,
    #[serde(rename = "independent_variables_included")]
    pub independent_variables_included: Vec<String>,
    #[serde(rename = "number_of_nodes")]
    pub number_of_nodes: u8,
    #[serde(rename = "number_of_terminal_nodes")]
    pub number_of_terminal_nodes: u8,
    #[serde(rename = "depth")]
    pub depth: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MisclassificationCosts {
    #[serde(rename = "observed")]
    pub observed: HashMap<String, HashMap<String, f64>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TreeTableNode {
    #[serde(rename = "node")]
    pub node: u8,
    #[serde(rename = "n_total")]
    pub n_total: u16,
    #[serde(rename = "bad_percent")]
    pub bad_percent: f64,
    #[serde(rename = "bad_n")]
    pub bad_n: u16,
    #[serde(rename = "good_percent")]
    pub good_percent: f64,
    #[serde(rename = "good_n")]
    pub good_n: u16,
    #[serde(rename = "total_percent")]
    pub total_percent: f64,
    #[serde(rename = "predicted_category")]
    pub predicted_category: String,
    #[serde(rename = "parent_node")]
    pub parent_node: Option<u8>,
    #[serde(rename = "variable")]
    pub variable: Option<String>,
    #[serde(rename = "significance")]
    pub significance: f64,
    #[serde(rename = "chi_square")]
    pub chi_square: f64,
    #[serde(rename = "df")]
    pub df: u8,
    #[serde(rename = "split_values")]
    pub split_values: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GainsForNode {
    #[serde(rename = "node")]
    pub node: u8,
    #[serde(rename = "node_n")]
    pub node_n: u16,
    #[serde(rename = "node_percent")]
    pub node_percent: f64,
    #[serde(rename = "node_response")]
    pub node_response: f64,
    #[serde(rename = "node_gain_index")]
    pub node_gain_index: f64,
    #[serde(rename = "cumulative_n")]
    pub cumulative_n: u16,
    #[serde(rename = "cumulative_percent")]
    pub cumulative_percent: f64,
    #[serde(rename = "cumulative_response")]
    pub cumulative_response: f64,
    #[serde(rename = "cumulative_gain_index")]
    pub cumulative_gain_index: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RiskEstimate {
    #[serde(rename = "estimate")]
    pub estimate: f64,
    #[serde(rename = "std_error")]
    pub std_error: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Classification {
    #[serde(rename = "predicted_bad")]
    pub predicted_bad: u16,
    #[serde(rename = "predicted_good")]
    pub predicted_good: u16,
    #[serde(rename = "observed_bad")]
    pub observed_bad: u16,
    #[serde(rename = "observed_good")]
    pub observed_good: u16,
    #[serde(rename = "overall_percentage_bad")]
    pub overall_percentage_bad: f64,
    #[serde(rename = "overall_percentage_good")]
    pub overall_percentage_good: f64,
    #[serde(rename = "overall_percentage_correct")]
    pub overall_percentage_correct: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TargetCategoryResponse {
    #[serde(rename = "percentiles")]
    pub percentiles: Vec<f64>,
    #[serde(rename = "response_rates")]
    pub response_rates: Vec<f64>,
}

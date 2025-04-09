use wasm_bindgen::prelude::*;

use crate::hierarchical::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::ClusteringResult,
};
use crate::hierarchical::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::hierarchical::wasm::function;

#[wasm_bindgen]
pub struct HierarchicalCluster {
    config: ClusterConfig,
    data: AnalysisData,
    result: Option<ClusteringResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl HierarchicalCluster {
    #[wasm_bindgen(constructor)]
    pub fn new(
        cluster_data: JsValue,
        label_data: JsValue,
        cluster_data_defs: JsValue,
        label_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<HierarchicalCluster, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data
        let cluster_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(cluster_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse cluster data: {}", e);
                error_collector.add_error("constructor.cluster_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let label_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(label_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse label data: {}", e);
                error_collector.add_error("constructor.label_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let cluster_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(cluster_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse cluster data definitions: {}", e);
                error_collector.add_error("constructor.cluster_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let label_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(label_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse label data definitions: {}", e);
                error_collector.add_error("constructor.label_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Validate configuration
        if cluster_data.is_empty() {
            let msg = "Cluster data cannot be empty".to_string();
            error_collector.add_error("config.validation.cluster_data", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            cluster_data,
            label_data,
            cluster_data_defs,
            label_data_defs,
        };

        let config: ClusterConfig = match serde_wasm_bindgen::from_value(config_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse configuration: {}", e);
                error_collector.add_error("constructor.config", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Create instance
        let mut analysis = HierarchicalCluster {
            config,
            data,
            result: None,
            error_collector,
        };

        // Run the analysis
        match
            function::run_analysis(&analysis.data, &analysis.config, &mut analysis.error_collector)
        {
            Ok(result) => {
                analysis.result = result;
                Ok(analysis)
            }
            Err(e) => Err(e),
        }
    }

    // Expose functions from function.rs
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        function::get_results(&self.result)
    }

    pub fn get_all_errors(&self) -> JsValue {
        JsValue::from_str(&self.error_collector.get_error_summary())
    }

    pub fn clear_errors(&mut self) -> JsValue {
        self.error_collector.clear();
        JsValue::from_str("Error collector cleared")
    }
}

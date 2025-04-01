use wasm_bindgen::prelude::*;

use crate::twostep::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::ClusteringResult,
};
use crate::twostep::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::twostep::wasm::function;

#[wasm_bindgen]
pub struct TwoStepClusterAnalysis {
    config: ClusterConfig,
    data: AnalysisData,
    result: Option<ClusteringResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl TwoStepClusterAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        categorical_data: JsValue,
        continuous_data: JsValue,
        categorical_data_defs: JsValue,
        continuous_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<TwoStepClusterAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let categorical_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(categorical_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse categorical data: {}", e);
                error_collector.add_error("constructor.categorical_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let continuous_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(continuous_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse continuous data: {}", e);
                error_collector.add_error("constructor.continuous_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let categorical_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(categorical_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse categorical data definitions: {}", e);
                error_collector.add_error("constructor.categorical_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let continuous_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(continuous_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse continuous data definitions: {}", e);
                error_collector.add_error("constructor.continuous_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: ClusterConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse configuration: {}", e);
                error_collector.add_error("constructor.config", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Validate important configuration
        if config.main.categorical_var.is_none() && config.main.continuous_var.is_none() {
            let msg =
                "At least one categorical or continuous variable must be selected".to_string();
            error_collector.add_error("config.validation.variables", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            categorical_data,
            continuous_data,
            categorical_data_defs,
            continuous_data_defs: continuous_data_defs,
        };

        // Create instance
        let mut analysis = TwoStepClusterAnalysis {
            config,
            data,
            result: None,
            error_collector,
        };

        // Run the analysis using the function from function.rs
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

    // Utility methods to interact with results
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        function::get_results(&self.result)
    }

    pub fn get_executed_functions(&self) -> Result<JsValue, JsValue> {
        function::get_executed_functions(&self.result)
    }

    pub fn get_all_errors(&self) -> JsValue {
        function::get_all_errors(&self.error_collector)
    }

    pub fn clear_errors(&mut self) -> JsValue {
        function::clear_errors(&mut self.error_collector)
    }
}

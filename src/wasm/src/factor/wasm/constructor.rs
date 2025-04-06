use wasm_bindgen::prelude::*;

use crate::factor::models::{
    config::FactorAnalysisConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::FactorAnalysisResult,
};
use crate::factor::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::factor::wasm::function;

#[wasm_bindgen]
pub struct FactorAnalysis {
    config: FactorAnalysisConfig,
    data: AnalysisData,
    result: Option<FactorAnalysisResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl FactorAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        target_data: JsValue,
        value_target_data: JsValue,
        target_data_defs: JsValue,
        value_target_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<FactorAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse configuration
        let config: FactorAnalysisConfig = match
            serde_wasm_bindgen::from_value(config_data.clone())
        {
            Ok(data) => data,
            Err(e) => {
                let msg =
                    format!("Failed to parse configuration: {}. Ensure field names match the expected format.", e);
                error_collector.add_error("constructor.config", &msg);

                // Try to get more detailed error by inspecting the config data
                if let Ok(config_json) = js_sys::JSON::stringify(&config_data) {
                    let config_str = config_json.as_string().unwrap_or_default();
                    error_collector.add_error(
                        "constructor.config.raw",
                        &format!("Raw config: {}", config_str)
                    );
                }

                return Err(string_to_js_error(msg));
            }
        };

        // Parse target data
        let target_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(target_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse target data: {}", e);
                error_collector.add_error("constructor.target_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Parse value target data
        let value_target_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(value_target_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse value target data: {}", e);
                error_collector.add_error("constructor.value_target_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Parse target data definitions
        let target_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(target_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse target data definitions: {}", e);
                error_collector.add_error("constructor.target_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Parse value target data definitions
        let value_target_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(value_target_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse value target data definitions: {}", e);
                error_collector.add_error("constructor.value_target_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Validate configuration
        if config.main.target_var.as_ref().map_or(true, |vars| vars.is_empty()) {
            let msg = "No target variables selected for factor analysis".to_string();
            error_collector.add_error("config.validation.target_var", &msg);
            return Err(string_to_js_error(msg));
        }

        // Create analysis data structure
        let data = AnalysisData {
            target_data,
            value_target_data,
            target_data_defs,
            value_target_data_defs,
        };

        // Create the analysis instance
        let mut analysis = FactorAnalysis {
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

    // Function to get results
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        function::get_results(&self.result)
    }

    // Function to get all errors
    pub fn get_all_errors(&self) -> JsValue {
        function::get_all_errors(&self.error_collector)
    }

    // Function to clear errors
    pub fn clear_errors(&mut self) -> JsValue {
        function::clear_errors(&mut self.error_collector)
    }
}

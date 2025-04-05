use wasm_bindgen::prelude::*;

use crate::roc_curve::models::{
    config::ROCCurveConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::ROCCurveResult,
};
use crate::roc_curve::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::roc_curve::wasm::function;

#[wasm_bindgen]
pub struct RocCurve {
    config: ROCCurveConfig,
    data: AnalysisData,
    result: Option<ROCCurveResult>,
    error_collector: ErrorCollector,
    executed_functions: Vec<String>,
}

#[wasm_bindgen]
impl RocCurve {
    #[wasm_bindgen(constructor)]
    pub fn new(
        test_data: JsValue,
        state_data: JsValue,
        test_data_defs: JsValue,
        state_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<RocCurve, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let test_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(test_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse test data: {}", e);
                error_collector.add_error("constructor.test_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let state_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(state_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse state data: {}", e);
                error_collector.add_error("constructor.state_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let test_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(test_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse test data definitions: {}", e);
                error_collector.add_error("constructor.test_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let state_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(state_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse state data definitions: {}", e);
                error_collector.add_error("constructor.state_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: ROCCurveConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
            Ok(data) => data,
            Err(e) => {
                let msg =
                    format!("Failed to parse configuration: {}. Ensure field names match the expected format.", e);
                error_collector.add_error("constructor.config", &msg);

                // Try to get a more detailed error by inspecting the config data
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

        // Validate important configuration
        if config.main.state_target_variable.is_none() {
            let msg = "State target variable must be selected for ROC Analysis".to_string();
            error_collector.add_error("config.validation.state_target_variable", &msg);
            return Err(string_to_js_error(msg));
        }

        if config.main.test_target_variable.is_none() {
            let msg = "Test target variable must be selected for ROC Analysis".to_string();
            error_collector.add_error("config.validation.test_target_variable", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            test_data,
            state_data,
            test_data_defs,
            state_data_defs,
        };

        // Create instance
        let mut analysis = RocCurve {
            config,
            data,
            result: None,
            error_collector,
            executed_functions: Vec::new(),
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

    // Use functions from function.rs
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        function::get_results(&self.result)
    }

    pub fn get_executed_functions(&self) -> Result<JsValue, JsValue> {
        function::get_executed_functions(&Some(self.executed_functions.clone()))
    }

    pub fn get_all_errors(&self) -> JsValue {
        function::get_all_errors(&self.error_collector)
    }

    pub fn clear_errors(&mut self) -> JsValue {
        function::clear_errors(&mut self.error_collector)
    }
}

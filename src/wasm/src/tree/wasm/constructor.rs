use wasm_bindgen::prelude::*;

use crate::tree::models::{
    config::TreeConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::DecisionTreeResult,
};
use crate::tree::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::tree::wasm::function;

#[wasm_bindgen]
pub struct DecisionTreeAnalysis {
    config: TreeConfig,
    data: AnalysisData,
    result: Option<DecisionTreeResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl DecisionTreeAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        dependent_data: JsValue,
        independent_data: JsValue,
        influence_data: JsValue,
        config_data: JsValue,
        dependent_data_defs: JsValue,
        independent_data_defs: JsValue,
        influence_data_defs: JsValue
    ) -> Result<DecisionTreeAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let dependent_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(dependent_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse dependent data: {}", e);
                error_collector.add_error("constructor.dependent_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let independent_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(independent_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse independent data: {}", e);
                error_collector.add_error("constructor.independent_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let influence_data: Option<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(influence_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse influence data: {}", e);
                error_collector.add_error("constructor.influence_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let dependent_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(dependent_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse dependent data definitions: {}", e);
                error_collector.add_error("constructor.dependent_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let independent_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(independent_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse independent data definitions: {}", e);
                error_collector.add_error("constructor.independent_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let influence_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(influence_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse influence data definitions: {}", e);
                error_collector.add_error("constructor.influence_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: TreeConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
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
        if config.main.dependent_target_var.is_none() {
            let msg =
                "Dependent target variable must be selected for decision tree analysis".to_string();
            error_collector.add_error("config.validation.dependent_target", &msg);
            return Err(string_to_js_error(msg));
        }

        if
            config.main.independent_target_var.is_none() ||
            config.main.independent_target_var.unwrap().is_empty()
        {
            let msg = "At least one independent variable must be selected".to_string();
            error_collector.add_error("config.validation.independent_variables", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            dependent_data,
            independent_data,
            influence_data,
            dependent_data_defs,
            independent_data_defs,
            influence_data_defs,
        };

        // Create instance
        let mut analysis = DecisionTreeAnalysis {
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

    // Use functions from function.rs
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

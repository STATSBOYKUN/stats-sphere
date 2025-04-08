use wasm_bindgen::prelude::*;

use crate::discriminant::models::{
    config::DiscriminantConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::DiscriminantResult,
};
use crate::discriminant::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::discriminant::wasm::function;

#[wasm_bindgen]
pub struct DiscriminantAnalysis {
    config: DiscriminantConfig,
    data: AnalysisData,
    result: Option<DiscriminantResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl DiscriminantAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        group_data: JsValue,
        independent_data: JsValue,
        selection_data: JsValue,
        group_data_defs: JsValue,
        independent_data_defs: JsValue,
        selection_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<DiscriminantAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let group_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(group_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse group data: {}", e);
                error_collector.add_error("constructor.group_data", &msg);
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

        let selection_data: Option<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(selection_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse selection data: {}", e);
                error_collector.add_error("constructor.selection_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let group_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(group_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse group data definitions: {}", e);
                error_collector.add_error("constructor.group_data_defs", &msg);
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

        let selection_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(selection_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse selection data definitions: {}", e);
                error_collector.add_error("constructor.selection_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: DiscriminantConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
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
        if config.main.grouping_variable.is_empty() {
            let msg = "Grouping variable must be selected for discriminant analysis".to_string();
            error_collector.add_error("config.validation.grouping_variable", &msg);
            return Err(string_to_js_error(msg));
        }

        if config.main.independent_variables.is_empty() {
            let msg = "At least one independent variable must be selected".to_string();
            error_collector.add_error("config.validation.independent_variables", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            group_data,
            independent_data,
            selection_data,
            group_data_defs,
            independent_data_defs,
            selection_data_defs,
        };

        // Create instance
        let mut analysis = DiscriminantAnalysis {
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

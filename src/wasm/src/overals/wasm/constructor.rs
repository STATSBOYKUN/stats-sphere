use wasm_bindgen::prelude::*;

use crate::overals::models::{
    config::OVERALSAnalysisConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::OVERALSAnalysisResult,
};
use crate::overals::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::overals::wasm::function;

#[wasm_bindgen]
pub struct OVERALSAnalysis {
    config: OVERALSAnalysisConfig,
    data: AnalysisData,
    result: Option<OVERALSAnalysisResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl OVERALSAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        set_target_data: JsValue,
        plots_target_data: JsValue,
        set_target_data_defs: JsValue,
        plots_target_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<OVERALSAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let set_target_data: Vec<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(set_target_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse set target data: {}", e);
                error_collector.add_error("constructor.set_target_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let plots_target_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(plots_target_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse plots target data: {}", e);
                error_collector.add_error("constructor.plots_target_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let set_target_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(set_target_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse set target data definitions: {}", e);
                error_collector.add_error("constructor.set_target_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let plots_target_data_defs: Vec<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(plots_target_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse plots target data definitions: {}", e);
                error_collector.add_error("constructor.plots_target_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: OVERALSAnalysisConfig = match
            serde_wasm_bindgen::from_value(config_data.clone())
        {
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
        if
            config.main.set_target_variable.is_none() ||
            config.main.set_target_variable.as_ref().unwrap().is_empty()
        {
            let msg = "Set target variables must be selected for OVERALS analysis".to_string();
            error_collector.add_error("config.validation.set_target_variable", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            set_target_data,
            plots_target_data,
            set_target_data_defs,
            plots_target_data_defs,
        };

        // Create instance
        let mut analysis = OVERALSAnalysis {
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

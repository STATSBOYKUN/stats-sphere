use wasm_bindgen::prelude::*;

use crate::correspondence::models::{
    config::CorrespondenceAnalysisConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::CorrespondenceAnalysisResult,
};
use crate::correspondence::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::correspondence::wasm::function;

#[wasm_bindgen]
pub struct CorrespondenceAnalysis {
    config: CorrespondenceAnalysisConfig,
    data: AnalysisData,
    result: Option<CorrespondenceAnalysisResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl CorrespondenceAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        row_data: JsValue,
        col_data: JsValue,
        row_data_defs: JsValue,
        col_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<CorrespondenceAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let row_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(row_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse row data: {}", e);
                error_collector.add_error("constructor.row_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let col_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(col_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse column data: {}", e);
                error_collector.add_error("constructor.col_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let row_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(row_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse row data definitions: {}", e);
                error_collector.add_error("constructor.row_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let col_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(col_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse column data definitions: {}", e);
                error_collector.add_error("constructor.col_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: CorrespondenceAnalysisConfig = match
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

        // Validate configuration
        if
            config.main.row_target_var.is_none() ||
            config.main.row_target_var.as_ref().unwrap().is_empty()
        {
            let msg =
                "Row target variable must be selected for correspondence analysis".to_string();
            error_collector.add_error("config.validation.row_target_var", &msg);
            return Err(string_to_js_error(msg));
        }

        if
            config.main.col_target_var.is_none() ||
            config.main.col_target_var.as_ref().unwrap().is_empty()
        {
            let msg =
                "Column target variable must be selected for correspondence analysis".to_string();
            error_collector.add_error("config.validation.col_target_var", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            row_data,
            col_data,
            row_data_defs,
            col_data_defs,
        };

        // Create instance
        let mut analysis = CorrespondenceAnalysis {
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

    pub fn get_all_errors(&self) -> JsValue {
        function::get_all_errors(&self.error_collector)
    }

    pub fn clear_errors(&mut self) -> JsValue {
        function::clear_errors(&mut self.error_collector)
    }
}

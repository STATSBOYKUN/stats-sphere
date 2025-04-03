use wasm_bindgen::prelude::*;

use crate::knn::models::data::{ DataRecord, VariableDefinition };
use crate::knn::models::{ config::KnnConfig, data::AnalysisData, result::NearestNeighborAnalysis };
use crate::knn::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::knn::wasm::function;

#[wasm_bindgen]
pub struct KNNAnalysis {
    config: KnnConfig,
    data: AnalysisData,
    result: Option<NearestNeighborAnalysis>,
    error_collector: ErrorCollector,
    executed_functions: Vec<String>,
}

#[wasm_bindgen]
impl KNNAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        target_data: JsValue,
        features_data: JsValue,
        focal_case_data: JsValue,
        case_data: JsValue,
        target_data_defs: JsValue,
        features_data_defs: JsValue,
        focal_case_data_defs: JsValue,
        case_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<KNNAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let target_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(target_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse target data: {}", e);
                error_collector.add_error("constructor.target_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let features_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(features_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse features data: {}", e);
                error_collector.add_error("constructor.features_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let focal_case_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(focal_case_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse focal case data: {}", e);
                error_collector.add_error("constructor.focal_case_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let case_data: Option<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(case_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse case data: {}", e);
                error_collector.add_error("constructor.case_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

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

        let features_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(features_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse features data definitions: {}", e);
                error_collector.add_error("constructor.features_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let focal_case_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(focal_case_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse focal case data definitions: {}", e);
                error_collector.add_error("constructor.focal_case_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let case_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(case_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse case data definitions: {}", e);
                error_collector.add_error("constructor.case_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Parse configuration
        let config: KnnConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
            Ok(data) => data,
            Err(e) => {
                let msg =
                    format!("Failed to parse configuration: {}. Ensure field names match the expected format.", e);
                error_collector.add_error("constructor.config", &msg);

                // Try to get a more detailed error by inspecting the config data
                if let Ok(config_json) = js_sys::JSON::stringify(&config_data) {
                    if let Some(config_str) = config_json.as_string() {
                        error_collector.add_error(
                            "constructor.config.raw",
                            &format!("Raw config: {}", config_str)
                        );
                    }
                }

                return Err(string_to_js_error(msg));
            }
        };

        // Validate important configuration
        if config.main.dep_var.is_none() && config.main.feature_var.is_none() {
            let msg = "At least one target or feature variable must be selected".to_string();
            error_collector.add_error("config.validation.variables", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            target_data,
            features_data,
            focal_case_data,
            case_data,
            target_data_defs,
            features_data_defs,
            focal_case_data_defs,
            case_data_defs,
        };

        // Create instance with executed_functions initialized
        let mut analysis = KNNAnalysis {
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

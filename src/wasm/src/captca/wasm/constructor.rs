use wasm_bindgen::prelude::*;

use crate::captca::models::{
    config::CATPCAConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::CATPCAResult,
};
use crate::captca::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::captca::wasm::function;

#[wasm_bindgen]
pub struct OptimalScalingCatpca {
    config: CATPCAConfig,
    data: AnalysisData,
    result: Option<CATPCAResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl OptimalScalingCatpca {
    #[wasm_bindgen(constructor)]
    pub fn new(
        analysis_data: JsValue,
        supplement_data: JsValue,
        labeling_data: JsValue,
        config_data: JsValue,
        analysis_data_defs: JsValue,
        supplement_data_defs: JsValue,
        labeling_data_defs: JsValue
    ) -> Result<OptimalScalingCatpca, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let analysis_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(analysis_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse analysis data: {}", e);
                error_collector.add_error("constructor.analysis_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let supplement_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(supplement_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse supplement data: {}", e);
                error_collector.add_error("constructor.supplement_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let labeling_data: Option<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(labeling_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse labeling data: {}", e);
                error_collector.add_error("constructor.labeling_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let analysis_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(analysis_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse analysis data definitions: {}", e);
                error_collector.add_error("constructor.analysis_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let supplement_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(supplement_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse supplement data definitions: {}", e);
                error_collector.add_error("constructor.supplement_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let labeling_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(labeling_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse labeling data definitions: {}", e);
                error_collector.add_error("constructor.labeling_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: CATPCAConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
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
            config.main.analysis_vars.is_none() ||
            config.main.analysis_vars.as_ref().unwrap().is_empty()
        {
            let msg = "At least one analysis variable must be selected".to_string();
            error_collector.add_error("config.validation.analysis_vars", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            analysis_data,
            supplement_data,
            labeling_data,
            analysis_data_defs,
            supplement_data_defs,
            labeling_data_defs,
        };

        // Create instance
        let mut analysis = OptimalScalingCatpca {
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

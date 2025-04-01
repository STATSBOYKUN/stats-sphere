use wasm_bindgen::prelude::*;

use crate::univariate::models::{
    config::UnivariateConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::UnivariateResult,
};
use crate::univariate::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::univariate::wasm::function;

#[wasm_bindgen]
pub struct UnivariateAnalysis {
    config: UnivariateConfig,
    data: AnalysisData,
    result: Option<UnivariateResult>,
    error_collector: ErrorCollector,
}

#[wasm_bindgen]
impl UnivariateAnalysis {
    #[wasm_bindgen(constructor)]
    pub fn new(
        dep_data: JsValue,
        fix_factor_data: JsValue,
        rand_factor_data: JsValue,
        covar_data: JsValue,
        wls_data: JsValue,
        dep_data_defs: JsValue,
        fix_factor_data_defs: JsValue,
        rand_factor_data_defs: JsValue,
        covar_data_defs: JsValue,
        wls_data_defs: JsValue,
        config_data: JsValue
    ) -> Result<UnivariateAnalysis, JsValue> {
        // Initialize error collector
        let mut error_collector = ErrorCollector::default();

        // Parse input data using serde_wasm_bindgen
        let dependent_data: Vec<Vec<DataRecord>> = match serde_wasm_bindgen::from_value(dep_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse dependent data: {}", e);
                error_collector.add_error("constructor.dependent_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let fix_factor_data: Vec<Vec<DataRecord>> = match
            serde_wasm_bindgen::from_value(fix_factor_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse fixed factor data: {}", e);
                error_collector.add_error("constructor.fix_factor_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let random_factor_data: Option<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(rand_factor_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse random factor data: {}", e);
                error_collector.add_error("constructor.random_factor_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let covariate_data: Option<Vec<Vec<DataRecord>>> = match
            serde_wasm_bindgen::from_value(covar_data)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse covariate data: {}", e);
                error_collector.add_error("constructor.covariate_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let wls_data: Option<Vec<Vec<DataRecord>>> = match serde_wasm_bindgen::from_value(wls_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse WLS weight data: {}", e);
                error_collector.add_error("constructor.wls_data", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let dependent_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(dep_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse dependent data definitions: {}", e);
                error_collector.add_error("constructor.dependent_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let fix_factor_data_defs: Vec<Vec<VariableDefinition>> = match
            serde_wasm_bindgen::from_value(fix_factor_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse fixed factor data definitions: {}", e);
                error_collector.add_error("constructor.fix_factor_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let random_factor_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(rand_factor_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse random factor data definitions: {}", e);
                error_collector.add_error("constructor.random_factor_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let covariate_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(covar_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse covariate data definitions: {}", e);
                error_collector.add_error("constructor.covariate_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let wls_data_defs: Option<Vec<Vec<VariableDefinition>>> = match
            serde_wasm_bindgen::from_value(wls_data_defs)
        {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse WLS weight data definitions: {}", e);
                error_collector.add_error("constructor.wls_data_defs", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        let config: UnivariateConfig = match serde_wasm_bindgen::from_value(config_data) {
            Ok(data) => data,
            Err(e) => {
                let msg = format!("Failed to parse configuration: {}", e);
                error_collector.add_error("constructor.config", &msg);
                return Err(string_to_js_error(msg));
            }
        };

        // Validate important configuration
        if config.main.dep_var.is_none() {
            let msg = "Dependent variable must be selected for univariate analysis".to_string();
            error_collector.add_error("config.validation.dep_var", &msg);
            return Err(string_to_js_error(msg));
        }

        // Store data
        let data = AnalysisData {
            dependent_data,
            fix_factor_data,
            random_factor_data,
            covariate_data,
            wls_data,
            dependent_data_defs,
            fix_factor_data_defs,
            random_factor_data_defs,
            covariate_data_defs,
            wls_data_defs,
        };

        // Create instance
        let mut analysis = UnivariateAnalysis {
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

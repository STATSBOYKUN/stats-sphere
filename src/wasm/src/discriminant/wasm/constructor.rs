use wasm_bindgen::prelude::*;

use crate::discriminant::models::{
    config::DiscriminantConfig,
    data::{ AnalysisData, DataRecord, DataValue, VariableDefinition },
    result::{ DiscriminantResult, ProcessingSummary },
};
use crate::discriminant::stats::core;
use crate::discriminant::utils::error::{ string_to_js_error, ErrorCollector };

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
        config_data: JsValue,
        group_data_defs: JsValue,
        independent_data_defs: JsValue,
        selection_data_defs: JsValue
    ) -> Result<DiscriminantAnalysis, JsValue> {
        // Inisialisasi error collector
        let mut error_collector = ErrorCollector::default();

        // Log raw config for debugging
        web_sys::console::log_1(&format!("Raw config: {:?}", config_data).into());

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

        // Run the analysis
        match analysis.run_analysis() {
            Ok(_) => Ok(analysis),
            Err(e) => Err(e),
        }
    }

    // Run the analysis
    fn run_analysis(&mut self) -> Result<(), JsValue> {
        web_sys::console::log_1(&"Starting discriminant analysis".into());

        // Initialize result with executed functions tracking
        let mut executed_functions = Vec::new();

        // Log configuration to track which methods will be executed
        web_sys::console::log_1(&format!("Config: {:?}", self.config).into());

        // Setup basic processing summary
        let total_cases = self.data.group_data
            .iter()
            .map(|grp| grp.len())
            .sum();
        let valid_cases = total_cases; // Simplification for now
        let excluded_cases = 0; // Simplification for now

        // Add executed function names to track
        executed_functions.push("process_analysis_cases".to_string());

        // Basic statistics calculations
        if self.config.statistics.means {
            executed_functions.push("calculate_group_means".to_string());
            match core::calculate_group_means(&self.data, &self.config) {
                Ok(_) => {}
                Err(e) => {
                    self.error_collector.add_error("calculate_group_means", &e);
                    // Continue execution despite errors for non-critical functions
                }
            }
        }

        if self.config.statistics.anova {
            executed_functions.push("calculate_univariate_anova".to_string());
            match core::calculate_univariate_anova(&self.data, &self.config) {
                Ok(_) => {}
                Err(e) => {
                    self.error_collector.add_error("calculate_univariate_anova", &e);
                    // Continue execution despite errors for non-critical functions
                }
            }
        }

        if self.config.statistics.box_m {
            executed_functions.push("calculate_box_m_test".to_string());
            match core::calculate_box_m_test(&self.data, &self.config) {
                Ok(_) => {}
                Err(e) => {
                    self.error_collector.add_error("calculate_box_m_test", &e);
                    // Continue execution despite errors for non-critical functions
                }
            }
        }

        // Always calculate discriminant functions - this is critical
        executed_functions.push("calculate_discriminant_functions".to_string());
        let discriminant_functions = match
            core::calculate_discriminant_functions(&self.data, &self.config)
        {
            Ok(df) => df,
            Err(e) => {
                self.error_collector.add_error("calculate_discriminant_functions", &e);
                return Err(string_to_js_error(e));
            }
        };

        // Classification results if requested
        if self.config.classify.case || self.config.classify.summary {
            executed_functions.push("calculate_classification_results".to_string());
            match
                core::calculate_classification_results(
                    &self.data,
                    &self.config,
                    &discriminant_functions
                )
            {
                Ok(_) => {}
                Err(e) => {
                    self.error_collector.add_error("calculate_classification_results", &e);
                    // Continue execution despite errors for non-critical functions
                }
            }
        }

        // Leave-one-out validation if requested
        if self.config.classify.leave {
            executed_functions.push("calculate_leave_one_out_validation".to_string());
            match
                core::calculate_leave_one_out_validation(
                    &self.data,
                    &self.config,
                    &discriminant_functions
                )
            {
                Ok(_) => {}
                Err(e) => {
                    self.error_collector.add_error("calculate_leave_one_out_validation", &e);
                    // Continue execution despite errors for non-critical functions
                }
            }
        }

        // Create a simple result with executed functions for now
        self.result = Some(DiscriminantResult {
            processing_summary: ProcessingSummary {
                valid_cases: valid_cases,
                excluded_cases: excluded_cases,
                total_cases: total_cases,
            },
            group_statistics: None,
            equality_tests: None,
            canonical_functions: None,
            structure_matrix: None,
            classification_results: None,
            executed_functions: executed_functions.clone(),
        });

        Ok(())
    }

    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
            None => Err(string_to_js_error("No analysis results available".to_string())),
        }
    }

    pub fn get_executed_functions(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => Ok(serde_wasm_bindgen::to_value(&result.executed_functions).unwrap()),
            None => Err(string_to_js_error("No analysis has been performed".to_string())),
        }
    }

    // Fungsi untuk mendapatkan semua error yang terjadi
    pub fn get_all_errors(&self) -> JsValue {
        JsValue::from_str(&self.error_collector.get_error_summary())
    }

    // Fungsi untuk membersihkan error collector
    pub fn clear_errors(&mut self) -> JsValue {
        self.error_collector.clear();
        JsValue::from_str("Error collector cleared")
    }
}

use wasm_bindgen::prelude::*;

use crate::captca::models::{
    config::ScaConfig,
    data::{ AnalysisData, DataRecord, VariableDefinition },
    result::AnalysisResult,
};
use crate::captca::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::captca::wasm::function;

#[wasm_bindgen]
pub struct OptimalScalingCatpca {
    config: ScaConfig,
    data: AnalysisData,
    result: Option<AnalysisResult>,
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

        let config: ScaConfig = match serde_wasm_bindgen::from_value(config_data.clone()) {
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

    // Functions specific to CATPCA module
    pub fn save_discretized_data(&self) -> Result<JsValue, JsValue> {
        function::save_discretized_data(&self.config)
    }

    pub fn save_transformed_data(&self) -> Result<JsValue, JsValue> {
        function::save_transformed_data(&self.config)
    }

    pub fn save_object_scores(&self) -> Result<JsValue, JsValue> {
        function::save_object_scores(&self.config)
    }

    pub fn save_bootstrap_results(&self) -> Result<JsValue, JsValue> {
        function::save_bootstrap_results(&self.config)
    }

    pub fn apply_discretize_method(
        &mut self,
        variable_name: &str,
        method: &str
    ) -> Result<JsValue, JsValue> {
        // This is a stub function that would apply the discretization method
        // to a specific variable. In reality, this would call back to function.rs
        // to handle the actual transformation.
        web_sys::console::log_1(
            &format!(
                "Applying discretize method '{}' to variable '{}'",
                method,
                variable_name
            ).into()
        );
        Ok(JsValue::from_str(&format!("Applied {} to {}", method, variable_name)))
    }

    pub fn apply_missing_value_strategy(
        &mut self,
        variable_name: &str,
        strategy: &str
    ) -> Result<JsValue, JsValue> {
        // This is a stub function that would apply the missing value strategy
        // to a specific variable. In reality, this would call back to function.rs
        // to handle the actual transformation.
        web_sys::console::log_1(
            &format!(
                "Applying missing value strategy '{}' to variable '{}'",
                strategy,
                variable_name
            ).into()
        );
        Ok(JsValue::from_str(&format!("Applied {} to {}", strategy, variable_name)))
    }

    pub fn apply_define_range_scale(
        &mut self,
        variable_name: &str,
        weight: f64,
        scaling: &str,
        degree: i32,
        knots: i32
    ) -> Result<JsValue, JsValue> {
        // This function would apply range scale definition to an analysis variable
        web_sys::console::log_1(
            &format!(
                "Applying range scale to '{}': weight={}, scaling={}, degree={}, knots={}",
                variable_name,
                weight,
                scaling,
                degree,
                knots
            ).into()
        );
        Ok(JsValue::from_str(&format!("Applied range scale to {}", variable_name)))
    }

    pub fn apply_define_scale(
        &mut self,
        variable_name: &str,
        scaling: &str,
        degree: i32,
        knots: i32
    ) -> Result<JsValue, JsValue> {
        // This function would apply scale definition to a supplementary variable
        web_sys::console::log_1(
            &format!(
                "Applying scale to '{}': scaling={}, degree={}, knots={}",
                variable_name,
                scaling,
                degree,
                knots
            ).into()
        );
        Ok(JsValue::from_str(&format!("Applied scale to {}", variable_name)))
    }

    pub fn generate_object_plots(&self) -> Result<JsValue, JsValue> {
        if
            !self.config.object_plots.object_points &&
            !self.config.object_plots.biplot &&
            !self.config.object_plots.triplot
        {
            return Err(string_to_js_error("No object plots selected to generate".to_string()));
        }

        // This would return plot data that would be rendered in the UI
        Ok(JsValue::from_str("Object plot data generated"))
    }

    pub fn generate_category_plots(&self) -> Result<JsValue, JsValue> {
        if
            self.config.category_plots.cat_plots_var.is_none() ||
            self.config.category_plots.cat_plots_var.as_ref().unwrap().is_empty()
        {
            return Err(string_to_js_error("No category variables selected for plots".to_string()));
        }

        // This would return plot data that would be rendered in the UI
        Ok(JsValue::from_str("Category plot data generated"))
    }

    pub fn generate_loading_plots(&self) -> Result<JsValue, JsValue> {
        if !self.config.loading_plots.display_comp_loadings {
            return Err(string_to_js_error("Component loadings display is not enabled".to_string()));
        }

        // This would return plot data that would be rendered in the UI
        Ok(JsValue::from_str("Loading plot data generated"))
    }
}

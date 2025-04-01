use wasm_bindgen::prelude::*;

use crate::overals::models::{
    config::OVERALSAnalysisConfig,
    data::OveralsData,
    result::OVERALSAnalysisResult,
};
use crate::overals::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::overals::stats::core;

pub fn run_analysis(
    data: &OveralsData,
    config: &OVERALSAnalysisConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<OVERALSAnalysisResult>, JsValue> {
    web_sys::console::log_1(&"Starting OVERALS analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Case Processing Summary (always executed)
    executed_functions.push("case_processing_summary".to_string());
    let case_processing_summary = match core::calculate_case_processing_summary(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("case_processing_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 2: Variable Processing
    executed_functions.push("process_variables".to_string());
    let variables = match core::process_variables(data, config) {
        Ok(var_info) => var_info,
        Err(e) => {
            error_collector.add_error("process_variables", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 3: Calculate Centroids if requested
    let mut centroids = None;
    if config.options.centroid {
        executed_functions.push("calculate_centroids".to_string());
        match core::calculate_centroids(data, config) {
            Ok(cent_result) => {
                centroids = Some(cent_result);
                web_sys::console::log_1(&format!("Centroids: {:?}", centroids).into());
            }
            Err(e) => {
                error_collector.add_error("calculate_centroids", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 4: Calculate Object Scores if requested
    let mut object_scores = None;
    if config.options.obj_score {
        executed_functions.push("calculate_object_scores".to_string());
        match core::calculate_object_scores(data, config) {
            Ok(scores) => {
                object_scores = Some(scores);
                web_sys::console::log_1(&format!("Object Scores: {:?}", object_scores).into());
            }
            Err(e) => {
                error_collector.add_error("calculate_object_scores", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 5: Calculate Component Loadings if requested
    let mut component_loadings = None;
    if config.options.weight_compload {
        executed_functions.push("calculate_component_loadings".to_string());
        match core::calculate_component_loadings(data, config) {
            Ok(loadings) => {
                component_loadings = Some(loadings);
                web_sys::console::log_1(
                    &format!("Component Loadings: {:?}", component_loadings).into()
                );
            }
            Err(e) => {
                error_collector.add_error("calculate_component_loadings", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 6: Calculate Weights if requested
    let mut weights = None;
    if config.options.weight_compload {
        executed_functions.push("calculate_weights".to_string());
        match core::calculate_weights(data, config) {
            Ok(weight_result) => {
                weights = Some(weight_result);
                web_sys::console::log_1(&format!("Weights: {:?}", weights).into());
            }
            Err(e) => {
                error_collector.add_error("calculate_weights", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 7: Calculate Fit Measures if requested
    let mut fit_measures = None;
    if config.options.sing_mult {
        executed_functions.push("calculate_fit_measures".to_string());
        match core::calculate_fit_measures(data, config) {
            Ok(measures) => {
                fit_measures = Some(measures);
                web_sys::console::log_1(&format!("Fit Measures: {:?}", fit_measures).into());
            }
            Err(e) => {
                error_collector.add_error("calculate_fit_measures", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 8: Generate Transformation Plots if requested
    let mut transformation_plots = None;
    if config.options.trans {
        executed_functions.push("generate_transformation_plots".to_string());
        match core::generate_transformation_plots(data, config) {
            Ok(plots) => {
                transformation_plots = Some(plots);
                web_sys::console::log_1(
                    &format!("Transformation Plots: {:?}", transformation_plots).into()
                );
            }
            Err(e) => {
                error_collector.add_error("generate_transformation_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Create the final result
    let result = OVERALSAnalysisResult {
        case_processing_summary,
        variables,
        centroids,
        object_scores,
        component_loadings,
        weights,
        fit_measures,
        transformation_plots,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<OVERALSAnalysisResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<OVERALSAnalysisResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(&Vec::<String>::new()).unwrap()),
        None => Err(string_to_js_error("No analysis has been performed".to_string())),
    }
}

pub fn get_all_errors(error_collector: &ErrorCollector) -> JsValue {
    JsValue::from_str(&error_collector.get_error_summary())
}

pub fn clear_errors(error_collector: &mut ErrorCollector) -> JsValue {
    error_collector.clear();
    JsValue::from_str("Error collector cleared")
}

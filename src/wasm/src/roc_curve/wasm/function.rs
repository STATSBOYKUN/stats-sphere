use wasm_bindgen::prelude::*;

use crate::roc_curve::models::{
    config::ROCCurveConfig,
    data::AnalysisData,
    result::ROCCurveResult,
};
use crate::roc_curve::utils::{ converter::string_to_js_error, error::ErrorCollector };
use crate::roc_curve::stats::core;

pub fn run_analysis(
    data: &AnalysisData,
    config: &ROCCurveConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<ROCCurveResult>, JsValue> {
    web_sys::console::log_1(&"Starting ROC Analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Case Processing Summary (always executed)
    executed_functions.push("case_processing_summary".to_string());
    let mut case_processing_summary = None;
    match core::calculate_case_processing_summary(data, config) {
        Ok(summary) => {
            web_sys::console::log_1(&format!("Case Processing Summary: {:?}", summary).into());
            case_processing_summary = Some(summary);
        }
        Err(e) => {
            error_collector.add_error("case_processing_summary", &e);
        }
    }

    // Step 2: ROC Curve Coordinates if ROC Curve is requested
    let mut coordinates_roc = None;
    if config.main.roc_curve {
        executed_functions.push("calculate_roc_coordinates".to_string());
        match core::calculate_roc_coordinates(data, config) {
            Ok(coords) => {
                web_sys::console::log_1(&format!("ROC Coordinates: {:?}", coordinates_roc).into());
                coordinates_roc = Some(coords);
            }
            Err(e) => {
                error_collector.add_error("calculate_roc_coordinates", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 4: Calculate Area Under ROC Curve
    let mut area_under_roc_curve = None;
    executed_functions.push("calculate_area_under_roc_curve".to_string());
    match core::calculate_area_under_roc_curve(data, config) {
        Ok(area) => {
            web_sys::console::log_1(
                &format!("Area Under ROC Curve: {:?}", area_under_roc_curve).into()
            );
            area_under_roc_curve = Some(area);
        }
        Err(e) => {
            error_collector.add_error("calculate_area_under_roc_curve", &e);
            // Continue execution despite errors for non-critical functions
        }
    }

    // Create the final result
    let result = ROCCurveResult {
        case_processing_summary,
        coordinates_roc,
        area_under_roc_curve,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<ROCCurveResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<Vec<String>>) -> Result<JsValue, JsValue> {
    match result {
        Some(functions) => Ok(serde_wasm_bindgen::to_value(functions).unwrap()),
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

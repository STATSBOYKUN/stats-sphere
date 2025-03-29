use wasm_bindgen::prelude::*;

use crate::discriminant::models::{
    config::DiscriminantConfig,
    data::AnalysisData,
    result::DiscriminantResult,
};
use crate::discriminant::stats::core;
use crate::discriminant::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<DiscriminantResult>, JsValue> {
    web_sys::console::log_1(&"Starting discriminant analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Basic processing summary (always executed)
    executed_functions.push("basic_processing_summary".to_string());
    let processing_summary = match core::basic_processing_summary(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("basic_processing_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 2: Group statistics if requested
    let mut group_statistics = None;
    if config.statistics.means {
        executed_functions.push("calculate_group_statistics".to_string());
        match core::calculate_group_statistics(data, config) {
            Ok(stats) => {
                group_statistics = Some(stats);
            }
            Err(e) => {
                error_collector.add_error("calculate_group_statistics", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 3: Equality tests if requested
    let mut equality_tests = None;
    if config.statistics.anova {
        executed_functions.push("calculate_equality_tests".to_string());
        match core::calculate_equality_tests(data, config) {
            Ok(tests) => {
                equality_tests = Some(tests);
            }
            Err(e) => {
                error_collector.add_error("calculate_equality_tests", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // If Box's M test requested
    if config.statistics.box_m {
        executed_functions.push("calculate_box_m_test".to_string());
        match core::calculate_box_m_test(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("calculate_box_m_test", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 4: Calculate canonical functions (always executed)
    executed_functions.push("calculate_canonical_functions".to_string());
    let canonical_functions = match core::calculate_canonical_functions(data, config) {
        Ok(functions) => Some(functions),
        Err(e) => {
            error_collector.add_error("calculate_canonical_functions", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 5: Calculate structure matrix
    executed_functions.push("calculate_structure_matrix".to_string());
    let structure_matrix = match core::calculate_structure_matrix(data, config) {
        Ok(matrix) => Some(matrix),
        Err(e) => {
            error_collector.add_error("calculate_structure_matrix", &e);
            None
        }
    };

    // Step 6: Classification results if requested
    let mut classification_results = None;
    if config.classify.case || config.classify.summary {
        executed_functions.push("calculate_classification_results".to_string());
        match core::calculate_classification_results(data, config) {
            Ok(results) => {
                classification_results = Some(results);
            }
            Err(e) => {
                error_collector.add_error("calculate_classification_results", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 7: Bootstrap analysis if requested
    if config.bootstrap.perform_boot_strapping && !config.main.stepwise {
        executed_functions.push("perform_bootstrap_analysis".to_string());
        match core::perform_bootstrap_analysis(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("perform_bootstrap_analysis", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 8: Generate plots if requested
    if config.classify.combine || config.classify.sep_grp || config.classify.terr {
        executed_functions.push("generate_plots".to_string());
        match core::generate_plots(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("generate_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 9: Save results if requested
    if
        config.save.predicted ||
        config.save.discriminant ||
        config.save.probabilities ||
        (config.save.xml_file.is_some() && !config.save.xml_file.as_ref().unwrap().is_empty())
    {
        executed_functions.push("save_model_results".to_string());
        match core::save_model_results(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("save_model_results", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Create the final result
    let result = DiscriminantResult {
        processing_summary,
        group_statistics,
        equality_tests,
        canonical_functions,
        structure_matrix,
        classification_results,
        executed_functions,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<DiscriminantResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<DiscriminantResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(&result.executed_functions).unwrap()),
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

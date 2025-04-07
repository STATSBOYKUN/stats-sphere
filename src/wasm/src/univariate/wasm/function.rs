use wasm_bindgen::prelude::*;

use crate::univariate::models::{
    config::UnivariateConfig,
    data::AnalysisData,
    result::UnivariateResult,
};
use crate::univariate::stats::core;
use crate::univariate::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &UnivariateConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<UnivariateResult>, JsValue> {
    web_sys::console::log_1(&"Starting univariate analysis".into());

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

    // Step 2: Descriptive statistics if requested
    let mut descriptive_statistics = None;
    if config.options.desc_stats {
        executed_functions.push("calculate_descriptive_statistics".to_string());
        match core::calculate_descriptive_statistics(data, config) {
            Ok(stats) => {
                descriptive_statistics = Some(stats);
            }
            Err(e) => {
                error_collector.add_error("calculate_descriptive_statistics", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 3: Levene's Test for Homogeneity of Variances if requested
    let mut levene_test = None;
    if config.options.homogen_test {
        executed_functions.push("calculate_levene_test".to_string());
        match core::calculate_levene_test(data, config) {
            Ok(test) => {
                levene_test = Some(test);
            }
            Err(e) => {
                error_collector.add_error("calculate_levene_test", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 4: Tests of Between-Subjects Effects (ANOVA)
    let mut tests_between_subjects_effects = None;
    match core::calculate_tests_between_subjects_effects(data, config) {
        Ok(tests) => {
            executed_functions.push("calculate_tests_between_subjects_effects".to_string());
            tests_between_subjects_effects = Some(tests);
        }
        Err(e) => {
            error_collector.add_error("calculate_tests_between_subjects_effects", &e);
            return Err(string_to_js_error(e));
        }
    }

    // Step 5: Parameter Estimates if requested
    let mut parameter_estimates = None;
    if config.options.param_est {
        executed_functions.push("calculate_parameter_estimates".to_string());
        match core::calculate_parameter_estimates(data, config) {
            Ok(estimates) => {
                parameter_estimates = Some(estimates);
            }
            Err(e) => {
                error_collector.add_error("calculate_parameter_estimates", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 6: Lack of Fit Tests if requested
    let mut lack_of_fit_tests = None;
    if config.options.lack_of_fit {
        executed_functions.push("calculate_lack_of_fit_tests".to_string());
        match core::calculate_lack_of_fit_tests(data, config) {
            Ok(tests) => {
                lack_of_fit_tests = Some(tests);
            }
            Err(e) => {
                error_collector.add_error("calculate_lack_of_fit_tests", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 7: Spread-vs-Level Plots if requested
    let mut spread_vs_level_plots = None;
    if config.options.spr_vs_level {
        executed_functions.push("calculate_spread_vs_level_plots".to_string());
        match core::calculate_spread_vs_level_plots(data, config) {
            Ok(plots) => {
                spread_vs_level_plots = Some(plots);
            }
            Err(e) => {
                error_collector.add_error("calculate_spread_vs_level_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 8: Bootstrap analysis if requested
    if config.bootstrap.perform_boot_strapping {
        executed_functions.push("perform_bootstrap_analysis".to_string());
        match core::perform_bootstrap_analysis(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("perform_bootstrap_analysis", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 9: Generate plots if requested
    if config.plots.line_chart_type || config.plots.bar_chart_type {
        executed_functions.push("generate_plots".to_string());
        match core::generate_plots(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("generate_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Create the final result
    let result = UnivariateResult {
        between_subjects_factors: processing_summary,
        descriptive_statistics,
        levene_test,
        tests_of_between_subjects_effects,
        parameter_estimates,
        general_estimable_function,
        contrast_coefficients,
        lack_of_fit_tests,
        spread_vs_level_plots,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<UnivariateResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<UnivariateResult>) -> Result<JsValue, JsValue> {
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

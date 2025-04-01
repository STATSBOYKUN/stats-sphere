use wasm_bindgen::prelude::*;

use crate::mca::models::{ config::MCAConfig, data::AnalysisData, result::MCAResult };
use crate::mca::stats::core;
use crate::mca::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &MCAConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<MCAResult>, JsValue> {
    web_sys::console::log_1(&"Starting multiple correspondence analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Basic processing summary (always executed)
    executed_functions.push("processing_summary".to_string());
    let processing_summary = match core::processing_summary(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("processing_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Filter Data
    let filtered_data = match core::filter_valid_cases(data, config) {
        Ok(filtered) => filtered,
        Err(e) => {
            error_collector.add_error("filter_valid_cases", &e);
            return Err(string_to_js_error(e));
        }
    };

    web_sys::console::log_1(&format!("Filtered Data: {:?}", filtered_data).into());

    // Step 2: Apply discretization if configured
    if
        config.discretize.variables_list.is_some() &&
        !config.discretize.variables_list.as_ref().unwrap().is_empty()
    {
        executed_functions.push("apply_discretization".to_string());
        match core::apply_discretization(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("apply_discretization", &e);
                // Continue execution despite errors for discretization
            }
        };
    }

    // Step 3: Handle missing values based on strategy
    if
        config.missing.missing_values_exclude ||
        config.missing.missing_values_impute ||
        config.missing.exclude_objects
    {
        executed_functions.push("handle_missing_values".to_string());
        match core::handle_missing_values(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("handle_missing_values", &e);
                // Continue execution despite errors for missing values
            }
        };
    }

    // Step 4: Calculate iteration history if requested
    let mut iteration_history = None;
    if config.output.iteration_history {
        executed_functions.push("calculate_iteration_history".to_string());
        match core::calculate_iteration_history(&filtered_data, config) {
            Ok(history) => {
                iteration_history = Some(history);
            }
            Err(e) => {
                error_collector.add_error("calculate_iteration_history", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 5: Calculate model summary (always executed)
    executed_functions.push("calculate_model_summary".to_string());
    let model_summary = match core::calculate_model_summary(&filtered_data, config) {
        Ok(summary) => Some(summary),
        Err(e) => {
            error_collector.add_error("calculate_model_summary", &e);
            None
        }
    };

    // Step 6: Calculate correlations for original variables if requested
    let mut original_correlations = None;
    if config.output.corre_original_vars {
        executed_functions.push("calculate_original_correlations".to_string());
        match core::calculate_original_correlations(&filtered_data, config) {
            Ok(correlations) => {
                original_correlations = Some(correlations);
            }
            Err(e) => {
                error_collector.add_error("calculate_original_correlations", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 7: Calculate correlations for transformed variables if requested
    let mut transformed_correlations = None;
    if config.output.corre_trans_vars {
        executed_functions.push("calculate_transformed_correlations".to_string());
        match core::calculate_transformed_correlations(&filtered_data, config) {
            Ok(correlations) => {
                transformed_correlations = Some(correlations);
            }
            Err(e) => {
                error_collector.add_error("calculate_transformed_correlations", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 8: Calculate object scores if requested
    let mut object_scores = None;
    if config.output.object_scores {
        executed_functions.push("calculate_object_scores".to_string());
        match core::calculate_object_scores(&filtered_data, config) {
            Ok(scores) => {
                object_scores = Some(scores);
            }
            Err(e) => {
                error_collector.add_error("calculate_object_scores", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 9: Calculate discrimination measures if requested
    let mut discrimination_measures = None;
    if config.output.disc_measures {
        executed_functions.push("calculate_discrimination_measures".to_string());
        match core::calculate_discrimination_measures(&filtered_data, config) {
            Ok(measures) => {
                discrimination_measures = Some(measures);
            }
            Err(e) => {
                error_collector.add_error("calculate_discrimination_measures", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 10: Calculate category points if category quantifications were requested
    let mut category_points = None;
    if
        config.output.cat_quantifications.is_some() &&
        !config.output.cat_quantifications.as_ref().unwrap().is_empty()
    {
        executed_functions.push("calculate_category_points".to_string());
        match core::calculate_category_points(&filtered_data, config) {
            Ok(points) => {
                category_points = Some(points);
            }
            Err(e) => {
                error_collector.add_error("calculate_category_points", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 11: Create object plots if requested
    let mut object_points_labeled = None;
    if config.object_plots.object_points || config.object_plots.biplot {
        executed_functions.push("create_object_plots".to_string());
        match core::create_object_plots(&filtered_data, config) {
            Ok(plots) => {
                object_points_labeled = Some(plots);
            }
            Err(e) => {
                error_collector.add_error("create_object_plots", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 12: Create variable plots if requested
    if
        !config.variable_plots.cat_plots_var.is_none() ||
        !config.variable_plots.joint_cat_plots_var.is_none() ||
        !config.variable_plots.trans_plots_var.is_none()
    {
        executed_functions.push("create_variable_plots".to_string());
        match core::create_variable_plots(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("create_variable_plots", &e);
                // Continue execution despite errors
            }
        };
    }

    // Step 13: Save results if requested
    if config.save.discretized || config.save.save_trans || config.save.save_obj_scores {
        executed_functions.push("save_model_results".to_string());
        match core::save_model_results(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("save_model_results", &e);
                // Continue execution despite errors
            }
        };
    }

    // Create the final result
    let result = MCAResult {
        processing_summary,
        iteration_history,
        model_summary,
        original_correlations,
        transformed_correlations,
        object_scores,
        discrimination_measures,
        category_points,
        object_points_labeled,
        executed_functions,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<MCAResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<MCAResult>) -> Result<JsValue, JsValue> {
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

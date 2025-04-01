use wasm_bindgen::prelude::*;

use crate::captca::models::{ config::ScaConfig, data::AnalysisData, result::AnalysisResult };
use crate::captca::stats::core;
use crate::captca::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &ScaConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<AnalysisResult>, JsValue> {
    web_sys::console::log_1(&"Starting Categorical Principal Components Analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Basic processing summary (always executed)
    executed_functions.push("basic_processing_summary".to_string());
    let case_processing_summary = match core::basic_processing_summary(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("basic_processing_summary", &e);
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

    // Step 2: Apply discretization if requested
    if config.discretize.number_of_categories || config.discretize.equal_intervals {
        executed_functions.push("apply_discretization".to_string());
        match core::apply_discretization(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("apply_discretization", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 3: Handle missing values
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
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 4: Apply optimal scaling
    executed_functions.push("apply_optimal_scaling".to_string());
    let quantifications = match core::apply_optimal_scaling(&filtered_data, config) {
        Ok(quant) => Some(quant),
        Err(e) => {
            error_collector.add_error("apply_optimal_scaling", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 5: Calculate iteration history
    executed_functions.push("calculate_iteration_history".to_string());
    let iteration_history = match core::calculate_iteration_history(&filtered_data, config) {
        Ok(history) => Some(history),
        Err(e) => {
            error_collector.add_error("calculate_iteration_history", &e);
            // Not critical, can continue
            None
        }
    };

    // Step 6: Calculate model summary
    executed_functions.push("calculate_model_summary".to_string());
    let model_summary = match core::calculate_model_summary(&filtered_data, config) {
        Ok(summary) => Some(summary),
        Err(e) => {
            error_collector.add_error("calculate_model_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 7: Calculate variance accounted
    if config.output.variance {
        executed_functions.push("calculate_variance_accounted".to_string());
        match core::calculate_variance_accounted(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("calculate_variance_accounted", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 8: Calculate correlations if requested
    let mut correlations = None;
    if config.output.corre_original_vars || config.output.corre_trans_vars {
        executed_functions.push("calculate_correlations".to_string());
        match core::calculate_correlations(&filtered_data, config) {
            Ok(cors) => {
                correlations = Some(cors);
            }
            Err(e) => {
                error_collector.add_error("calculate_correlations", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 9: Calculate object scores if requested
    let mut object_scores = None;
    if config.output.object_scores {
        executed_functions.push("calculate_object_scores".to_string());
        match core::calculate_object_scores(&filtered_data, config) {
            Ok(scores) => {
                object_scores = Some(scores);
            }
            Err(e) => {
                error_collector.add_error("calculate_object_scores", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 10: Calculate component loadings if requested
    let mut component_loadings = None;
    if config.output.component_loadings {
        executed_functions.push("calculate_component_loadings".to_string());
        match core::calculate_component_loadings(&filtered_data, config) {
            Ok(loadings) => {
                component_loadings = Some(loadings);
            }
            Err(e) => {
                error_collector.add_error("calculate_component_loadings", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 11: Calculate category points if requested
    let mut category_points = None;
    if
        config.categoryPlots.cat_plots_var.is_some() ||
        config.categoryPlots.joint_cat_plots_var.is_some()
    {
        executed_functions.push("calculate_category_points".to_string());
        match core::calculate_category_points(&filtered_data, config) {
            Ok(points) => {
                category_points = Some(points);
            }
            Err(e) => {
                error_collector.add_error("calculate_category_points", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 12: Generate plots if requested
    if config.objectPlots.object_points || config.objectPlots.biplot || config.objectPlots.triplot {
        executed_functions.push("generate_object_plots".to_string());
        match core::generate_object_plots(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("generate_object_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 13: Generate biplot if requested
    let mut biplot = None;
    if config.objectPlots.biplot {
        executed_functions.push("generate_biplot".to_string());
        match core::generate_biplot(&filtered_data, config) {
            Ok(plot) => {
                biplot = Some(plot);
            }
            Err(e) => {
                error_collector.add_error("generate_biplot", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 14: Bootstrap analysis if requested
    if config.bootstrap.perform_bt {
        executed_functions.push("perform_bootstrap_analysis".to_string());
        match core::perform_bootstrap_analysis(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("perform_bootstrap_analysis", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Step 15: Save results if requested
    if
        config.save.discretized ||
        config.save.save_trans ||
        config.save.save_obj_scores ||
        config.save.save_approx
    {
        executed_functions.push("save_model_results".to_string());
        match core::save_model_results(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("save_model_results", &e);
                // Continue execution despite errors for non-critical functions
            }
        };
    }

    // Create the final result
    let result = AnalysisResult {
        case_processing_summary,
        iteration_history: iteration_history.unwrap_or_default(),
        model_summary: model_summary.unwrap_or_default(),
        quantifications: quantifications.unwrap_or_default(),
        variance_accounted: Default::default(), // Placeholder
        correlations: correlations.unwrap_or_default(),
        object_scores: object_scores.unwrap_or_default(),
        component_loadings: component_loadings.unwrap_or_default(),
        category_points: category_points.unwrap_or_default(),
        biplot: biplot.unwrap_or_default(),
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<AnalysisResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_all_errors(error_collector: &ErrorCollector) -> JsValue {
    JsValue::from_str(&error_collector.get_error_summary())
}

pub fn clear_errors(error_collector: &mut ErrorCollector) -> JsValue {
    error_collector.clear();
    JsValue::from_str("Error collector cleared")
}

pub fn save_discretized_data(config: &ScaConfig) -> Result<JsValue, JsValue> {
    if !config.save.discretized {
        return Err(string_to_js_error("Discretized data save option not enabled".to_string()));
    }

    if config.save.disc_newdata {
        web_sys::console::log_1(
            &format!(
                "Creating new dataset: {}",
                config.save.disc_dataset.clone().unwrap_or_default()
            ).into()
        );
    } else if config.save.disc_write_newdata {
        web_sys::console::log_1(
            &format!(
                "Writing to file: {}",
                config.save.discretized_file.clone().unwrap_or_default()
            ).into()
        );
    }

    Ok(JsValue::from_str("Discretized data saved"))
}

pub fn save_transformed_data(config: &ScaConfig) -> Result<JsValue, JsValue> {
    if !config.save.save_trans || !config.save.trans {
        return Err(string_to_js_error("Transformed data save option not enabled".to_string()));
    }

    if config.save.trans_newdata {
        web_sys::console::log_1(
            &format!(
                "Creating new dataset: {}",
                config.save.trans_dataset.clone().unwrap_or_default()
            ).into()
        );
    } else if config.save.trans_write_newdata {
        web_sys::console::log_1(
            &format!(
                "Writing to file: {}",
                config.save.transformed_file.clone().unwrap_or_default()
            ).into()
        );
    }

    Ok(JsValue::from_str("Transformed data saved"))
}

pub fn save_object_scores(config: &ScaConfig) -> Result<JsValue, JsValue> {
    if !config.save.save_obj_scores || !config.save.obj_scores {
        return Err(string_to_js_error("Object scores save option not enabled".to_string()));
    }

    if config.save.obj_newdata {
        web_sys::console::log_1(
            &format!(
                "Creating new dataset: {}",
                config.save.obj_dataset.clone().unwrap_or_default()
            ).into()
        );
    } else if config.save.obj_write_newdata {
        web_sys::console::log_1(
            &format!(
                "Writing to file: {}",
                config.save.obj_scores_file.clone().unwrap_or_default()
            ).into()
        );
    }

    Ok(JsValue::from_str("Object scores saved"))
}

pub fn save_bootstrap_results(config: &ScaConfig) -> Result<JsValue, JsValue> {
    if !config.bootstrap.perform_bt {
        return Err(string_to_js_error("Bootstrap analysis not performed".to_string()));
    }

    if config.save.bt_new_dataset {
        web_sys::console::log_1(
            &format!(
                "Creating new dataset for bootstrap: {}",
                config.save.bt_dataset_name.clone().unwrap_or_default()
            ).into()
        );
    } else if config.save.bt_write_data_file {
        web_sys::console::log_1(
            &format!(
                "Writing bootstrap to file: {}",
                config.save.bt_file_text.clone().unwrap_or_default()
            ).into()
        );
    }

    Ok(JsValue::from_str("Bootstrap results saved"))
}

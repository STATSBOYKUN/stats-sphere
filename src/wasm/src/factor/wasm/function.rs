use wasm_bindgen::prelude::*;

use crate::factor::models::{
    config::FactorAnalysisConfig,
    data::AnalysisData,
    result::FactorAnalysisResult,
};
use crate::factor::stats::core;
use crate::factor::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &FactorAnalysisConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<FactorAnalysisResult>, JsValue> {
    web_sys::console::log_1(&"Starting factor analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Filter Data based on value target if present
    let filtered_data = match core::filter_valid_cases(data, config) {
        Ok(filtered) => filtered,
        Err(e) => {
            error_collector.add_error("filter_valid_cases", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 1: Calculate Descriptive Statistics if requested
    let mut descriptive_statistics = None;
    if config.descriptives.univar_desc {
        executed_functions.push("calculate_descriptive_statistics".to_string());
        match core::calculate_descriptive_statistics_wrapper(&filtered_data, config) {
            Ok(stats) => {
                descriptive_statistics = Some(stats);
            }
            Err(e) => {
                error_collector.add_error("calculate_descriptive_statistics", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 2: Calculate Correlation/Covariance Matrix based on Analyze selection
    let mut correlation_matrix = None;
    if config.extraction.correlation {
        executed_functions.push("calculate_correlation_matrix".to_string());
        match core::calculate_correlation_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                correlation_matrix = Some(matrix);
            }
            Err(e) => {
                error_collector.add_error("calculate_correlation_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    } else if config.extraction.covariance {
        executed_functions.push("calculate_covariance_matrix".to_string());
        match core::calculate_covariance_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                correlation_matrix = Some(matrix); // Store in the same field
            }
            Err(e) => {
                error_collector.add_error("calculate_covariance_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 3: Calculate Inverse Matrix if requested
    let mut inverse_correlation_matrix = None;
    if config.descriptives.inverse {
        executed_functions.push("calculate_inverse_correlation_matrix".to_string());
        match core::calculate_inverse_correlation_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                inverse_correlation_matrix = Some(matrix);
            }
            Err(e) => {
                error_collector.add_error("calculate_inverse_correlation_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 4: Calculate KMO and Bartlett's Test if requested
    let mut kmo_bartletts_test = None;
    if config.descriptives.kmo {
        executed_functions.push("calculate_kmo_bartletts_test".to_string());
        match core::calculate_kmo_bartletts_test_wrapper(&filtered_data, config) {
            Ok(test) => {
                kmo_bartletts_test = Some(test);
            }
            Err(e) => {
                error_collector.add_error("calculate_kmo_bartletts_test", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 5: Calculate Anti-Image Matrices if requested
    let mut anti_image_matrices = None;
    if config.descriptives.anti_image {
        executed_functions.push("calculate_anti_image_matrices".to_string());
        match core::calculate_anti_image_matrices_wrapper(&filtered_data, config) {
            Ok(matrices) => {
                anti_image_matrices = Some(matrices);
            }
            Err(e) => {
                error_collector.add_error("calculate_anti_image_matrices", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 6: Calculate Communalities
    executed_functions.push("calculate_communalities".to_string());
    let communalities = match core::calculate_communalities_wrapper(&filtered_data, config) {
        Ok(communalities) => Some(communalities),
        Err(e) => {
            error_collector.add_error("calculate_communalities", &e);
            None
        }
    };

    // Step 7: Calculate Total Variance Explained
    executed_functions.push("calculate_total_variance_explained".to_string());
    let total_variance_explained = match
        core::calculate_total_variance_explained_wrapper(&filtered_data, config)
    {
        Ok(variance) => Some(variance),
        Err(e) => {
            error_collector.add_error("calculate_total_variance_explained", &e);
            None
        }
    };

    // Step 8: Calculate Factor/Component Matrix
    executed_functions.push("calculate_component_matrix".to_string());
    let component_matrix = match core::calculate_component_matrix_wrapper(&filtered_data, config) {
        Ok(matrix) => Some(matrix),
        Err(e) => {
            error_collector.add_error("calculate_component_matrix", &e);
            None
        }
    };

    // Step 9: Calculate Scree Plot if requested
    let mut scree_plot = None;
    if config.extraction.scree {
        executed_functions.push("calculate_scree_plot".to_string());
        match core::calculate_scree_plot_wrapper(&filtered_data, config) {
            Ok(plot) => {
                scree_plot = Some(plot);
            }
            Err(e) => {
                error_collector.add_error("calculate_scree_plot", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 10: Calculate Reproduced Correlations if requested
    let mut reproduced_correlations = None;
    if config.descriptives.reproduced {
        executed_functions.push("calculate_reproduced_correlations".to_string());
        match core::calculate_reproduced_correlations_wrapper(&filtered_data, config) {
            Ok(correlations) => {
                reproduced_correlations = Some(correlations);
            }
            Err(e) => {
                error_collector.add_error("calculate_reproduced_correlations", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 11: Calculate Rotated Component Matrix if not using 'None' rotation method
    let mut rotated_component_matrix = None;
    if !config.rotation.none && config.rotation.rotated_sol {
        executed_functions.push("calculate_rotated_component_matrix".to_string());
        match core::calculate_rotated_component_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                rotated_component_matrix = Some(matrix);
            }
            Err(e) => {
                error_collector.add_error("calculate_rotated_component_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 12: Calculate Component Transformation Matrix if rotation is performed
    let mut component_transformation_matrix = None;
    if !config.rotation.none && config.rotation.rotated_sol {
        executed_functions.push("calculate_component_transformation_matrix".to_string());
        match core::calculate_component_transformation_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                component_transformation_matrix = Some(matrix);
            }
            Err(e) => {
                error_collector.add_error("calculate_component_transformation_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 13: Calculate Component Score Coefficient Matrix if scores are saved
    let mut component_score_coefficient_matrix = None;
    if config.scores.save_var {
        executed_functions.push("calculate_component_score_coefficient_matrix".to_string());
        match core::calculate_component_score_coefficient_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                component_score_coefficient_matrix = Some(matrix);
            }
            Err(e) => {
                error_collector.add_error("calculate_component_score_coefficient_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 14: Calculate Component Score Covariance Matrix if scores are saved
    let mut component_score_covariance_matrix = None;
    if config.scores.save_var {
        executed_functions.push("calculate_component_score_covariance_matrix".to_string());
        match core::calculate_component_score_covariance_matrix_wrapper(&filtered_data, config) {
            Ok(matrix) => {
                component_score_covariance_matrix = Some(matrix);
            }
            Err(e) => {
                error_collector.add_error("calculate_component_score_covariance_matrix", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 15: Generate Loading Plots if requested
    if config.rotation.loading_plot {
        executed_functions.push("generate_loading_plots".to_string());
        match core::generate_loading_plots_wrapper(&filtered_data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("generate_loading_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Create the final result
    let result = FactorAnalysisResult {
        descriptive_statistics,
        scree_plot,
        correlation_matrix,
        inverse_correlation_matrix,
        kmo_bartletts_test,
        anti_image_matrices,
        communalities,
        total_variance_explained,
        component_matrix,
        reproduced_correlations,
        rotated_component_matrix,
        component_transformation_matrix,
        component_score_coefficient_matrix,
        component_score_covariance_matrix,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<FactorAnalysisResult>) -> Result<JsValue, JsValue> {
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

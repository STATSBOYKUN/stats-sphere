use wasm_bindgen::prelude::*;

use crate::correspondence::models::{
    config::MultiCorrespondenceConfig,
    data::AnalysisData,
    result::CorrespondenceAnalysisResult,
};
use crate::correspondence::stats::core;
use crate::correspondence::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &MultiCorrespondenceConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<CorrespondenceAnalysisResult>, JsValue> {
    web_sys::console::log_1(&"Starting correspondence analysis".into());

    // Initialize result with executed functions tracking
    let mut executed_functions = Vec::new();

    // Log configuration to track which methods will be executed
    web_sys::console::log_1(&format!("Config: {:?}", config).into());

    // Step 1: Validate input data and config
    executed_functions.push("validate_input_data".to_string());
    match core::validate_input_data(data, config) {
        Ok(_) => {}
        Err(e) => {
            error_collector.add_error("validate_input_data", &e);
            return Err(string_to_js_error(e));
        }
    }

    // Step 2: Create correspondence table
    executed_functions.push("create_correspondence_table".to_string());
    let correspondence_table = match core::create_correspondence_table(data, config) {
        Ok(table) => table,
        Err(e) => {
            error_collector.add_error("create_correspondence_table", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 3: Calculate row profiles if requested
    let mut row_profiles = None;
    if config.statistics.row_profile {
        executed_functions.push("calculate_row_profiles".to_string());
        match core::calculate_row_profiles(data, config) {
            Ok(profiles) => {
                row_profiles = Some(profiles);
            }
            Err(e) => {
                error_collector.add_error("calculate_row_profiles", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 4: Calculate column profiles if requested
    let mut column_profiles = None;
    if config.statistics.col_profile {
        executed_functions.push("calculate_column_profiles".to_string());
        match core::calculate_column_profiles(data, config) {
            Ok(profiles) => {
                column_profiles = Some(profiles);
            }
            Err(e) => {
                error_collector.add_error("calculate_column_profiles", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 5: Calculate chi-square distances if model uses chi-square
    let mut chi_square_distances = None;
    if config.model.chi_square {
        executed_functions.push("calculate_chi_square_distances".to_string());
        match core::calculate_chi_square_distances(data, config) {
            Ok(distances) => {
                chi_square_distances = Some(distances);
            }
            Err(e) => {
                error_collector.add_error("calculate_chi_square_distances", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 6: Calculate euclidean distances if model uses euclidean
    let mut euclidean_distances = None;
    if config.model.euclidean {
        executed_functions.push("calculate_euclidean_distances".to_string());
        match core::calculate_euclidean_distances(data, config) {
            Ok(distances) => {
                euclidean_distances = Some(distances);
            }
            Err(e) => {
                error_collector.add_error("calculate_euclidean_distances", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 7: Apply normalization based on selected method
    executed_functions.push("apply_normalization".to_string());
    let normalization_result = match core::apply_normalization(data, config) {
        Ok(result) => result,
        Err(e) => {
            error_collector.add_error("apply_normalization", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 8: Calculate analysis summary with singular values
    executed_functions.push("calculate_analysis_summary".to_string());
    let analysis_summary = match core::calculate_analysis_summary(data, config) {
        Ok(summary) => summary,
        Err(e) => {
            error_collector.add_error("calculate_analysis_summary", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 9: Calculate row points overview if requested
    let mut row_points = None;
    if config.statistics.row_points || config.statistics.stat_row_points {
        executed_functions.push("calculate_row_points".to_string());
        match core::calculate_row_points(data, config) {
            Ok(points) => {
                row_points = Some(points);
            }
            Err(e) => {
                error_collector.add_error("calculate_row_points", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 10: Calculate column points overview if requested
    let mut column_points = None;
    if config.statistics.col_points || config.statistics.stat_col_points {
        executed_functions.push("calculate_column_points".to_string());
        match core::calculate_column_points(data, config) {
            Ok(points) => {
                column_points = Some(points);
            }
            Err(e) => {
                error_collector.add_error("calculate_column_points", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 11: Perform permutation test if requested
    let mut permutation_test_result = None;
    if config.statistics.permutation_test {
        executed_functions.push("perform_permutation_test".to_string());
        match core::perform_permutation_test(data, config) {
            Ok(result) => {
                permutation_test_result = Some(result);
            }
            Err(e) => {
                error_collector.add_error("perform_permutation_test", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 12: Calculate confidence points for row points
    let mut confidence_row_points = None;
    if config.statistics.stat_row_points {
        executed_functions.push("calculate_confidence_row_points".to_string());
        match core::calculate_confidence_row_points(data, config) {
            Ok(points) => {
                confidence_row_points = Some(points);
            }
            Err(e) => {
                error_collector.add_error("calculate_confidence_row_points", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 13: Calculate confidence points for column points
    let mut confidence_column_points = None;
    if config.statistics.stat_col_points {
        executed_functions.push("calculate_confidence_column_points".to_string());
        match core::calculate_confidence_column_points(data, config) {
            Ok(points) => {
                confidence_column_points = Some(points);
            }
            Err(e) => {
                error_collector.add_error("calculate_confidence_column_points", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 14: Generate plots if requested
    if config.plots.biplot || config.plots.row_pts || config.plots.col_pts {
        executed_functions.push("generate_scatter_plots".to_string());
        match core::generate_scatter_plots(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("generate_scatter_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Step 15: Generate line plots if requested
    if config.plots.trans_row || config.plots.trans_col {
        executed_functions.push("generate_line_plots".to_string());
        match core::generate_line_plots(data, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("generate_line_plots", &e);
                // Continue execution despite errors for non-critical functions
            }
        }
    }

    // Create the final result
    let result = CorrespondenceAnalysisResult {
        correspondence_table,
        row_profiles: row_profiles.unwrap_or_default(),
        column_profiles: column_profiles.unwrap_or_default(),
        summary: analysis_summary,
        row_points: row_points.unwrap_or_default(),
        column_points: column_points.unwrap_or_default(),
        confidence_row_points: confidence_row_points.unwrap_or_default(),
        confidence_column_points: confidence_column_points.unwrap_or_default(),
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<CorrespondenceAnalysisResult>) -> Result<JsValue, JsValue> {
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

use wasm_bindgen::prelude::*;

use crate::tree::models::{ config::TreeConfig, data::AnalysisData, result::DecisionTreeResult };
use crate::tree::stats::core;
use crate::tree::utils::{ converter::string_to_js_error, error::ErrorCollector };

pub fn run_analysis(
    data: &AnalysisData,
    config: &TreeConfig,
    error_collector: &mut ErrorCollector
) -> Result<Option<DecisionTreeResult>, JsValue> {
    web_sys::console::log_1(&"Starting Decision Tree analysis".into());

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

    // Step 2: Filter and Prepare Data
    let filtered_data = match core::filter_valid_cases(data, config) {
        Ok(filtered) => filtered,
        Err(e) => {
            error_collector.add_error("filter_valid_cases", &e);
            return Err(string_to_js_error(e));
        }
    };

    web_sys::console::log_1(&format!("Filtered Data: {:?}", filtered_data).into());

    // Step 3: Validation Processing
    let mut validation_results = None;
    if config.validation.cross_validation || config.validation.split_sample {
        executed_functions.push("process_validation".to_string());
        match core::process_validation(&filtered_data, config) {
            Ok(results) => {
                validation_results = Some(results);
            }
            Err(e) => {
                error_collector.add_error("process_validation", &e);
                // Continue execution despite errors
            }
        }
    }

    // Step 4: Handle Influence Variable (if present)
    let mut influence_analysis = None;
    if config.main.influence_target_var.is_some() {
        executed_functions.push("process_influence_variable".to_string());
        match core::process_influence_variable(&filtered_data, config) {
            Ok(analysis) => {
                influence_analysis = Some(analysis);
            }
            Err(e) => {
                error_collector.add_error("process_influence_variable", &e);
                // Continue execution despite errors
            }
        }
    }

    // Step 5: Tree Growth and Analysis
    let tree_result = match core::grow_decision_tree(&filtered_data, config) {
        Ok(result) => result,
        Err(e) => {
            error_collector.add_error("grow_decision_tree", &e);
            return Err(string_to_js_error(e));
        }
    };

    // Step 6: Generate Tree Visualization (if requested in output config)
    let mut tree_visualization = None;
    if config.output.tree_output {
        executed_functions.push("generate_tree_visualization".to_string());
        match core::generate_tree_visualization(&tree_result, config) {
            Ok(viz) => {
                tree_visualization = Some(viz);
            }
            Err(e) => {
                error_collector.add_error("generate_tree_visualization", &e);
                // Continue execution despite errors
            }
        }
    }

    // Step 7: Classification Analysis
    let mut classification_results = None;
    if config.output.class_table {
        executed_functions.push("calculate_classification_results".to_string());
        match core::calculate_classification_results(&filtered_data, &tree_result, config) {
            Ok(results) => {
                classification_results = Some(results);
            }
            Err(e) => {
                error_collector.add_error("calculate_classification_results", &e);
                // Continue execution despite errors
            }
        }
    }

    // Step 8: Rule Generation (if requested)
    let mut rule_results = None;
    if config.output.gen_rules {
        executed_functions.push("generate_classification_rules".to_string());
        match core::generate_classification_rules(&tree_result, config) {
            Ok(rules) => {
                rule_results = Some(rules);
            }
            Err(e) => {
                error_collector.add_error("generate_classification_rules", &e);
                // Continue execution despite errors
            }
        }
    }

    // Step 9: Save Results (if requested)
    if
        config.save.terminal_node ||
        config.save.predicted_value ||
        config.save.predicted_probabilities
    {
        executed_functions.push("save_model_results".to_string());
        match core::save_model_results(&filtered_data, &tree_result, config) {
            Ok(_) => {}
            Err(e) => {
                error_collector.add_error("save_model_results", &e);
                // Continue execution despite errors
            }
        }
    }

    // Create the final result
    let result = DecisionTreeResult {
        model_summary: processing_summary,
        misclassification_costs: tree_result.misclassification_costs,
        tree_table: tree_result.tree_table,
        gains_for_nodes: tree_result.gains_for_nodes,
        risk: tree_result.risk,
        classification: tree_result.classification,
        target_category_response: tree_result.target_category_response,
    };

    Ok(Some(result))
}

pub fn get_results(result: &Option<DecisionTreeResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(result) => Ok(serde_wasm_bindgen::to_value(result).unwrap()),
        None => Err(string_to_js_error("No analysis results available".to_string())),
    }
}

pub fn get_executed_functions(result: &Option<DecisionTreeResult>) -> Result<JsValue, JsValue> {
    match result {
        Some(_) => Ok(serde_wasm_bindgen::to_value(&Vec::<String>::new()).unwrap()),
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

pub mod silhouette;
pub mod sum_squares;
pub mod importance;

use silhouette::calculate_silhouette;
use sum_squares::calculate_sum_of_squares;
use importance::calculate_predictor_importance;

use crate::hierarchical::types::{ClusterEvaluation, ClusterMembership, ClusteringError};
use crate::hierarchical::utils::error::log_warning;
use wasm_bindgen::JsValue;

/// Calculate evaluation metrics for a clustering solution
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
/// * `distance_matrix` - Pre-computed distance matrix
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * Result with evaluation metrics or error
pub fn evaluate_clustering(
    data: &[Vec<f64>],
    membership: &ClusterMembership,
    distance_matrix: &[Vec<f64>],
    warnings: &mut Vec<String>
) -> Result<ClusterEvaluation, ClusteringError> {
    // Calculate silhouette
    let silhouette = match calculate_silhouette(distance_matrix, membership) {
        Ok(s) => s,
        Err(e) => {
            let msg = format!("Failed to calculate silhouette: {}. Using default value.", e);
            web_sys::console::warn_1(&JsValue::from_str(&msg));
            log_warning(msg, warnings);
            
            // Use default value (0.0 is a neutral value)
            0.0
        }
    };
    
    // Calculate sum of squares
    let (sse, ssb) = match calculate_sum_of_squares(data, membership) {
        Ok((sse, ssb)) => (sse, ssb),
        Err(e) => {
            let msg = format!("Failed to calculate sum of squares: {}. Using default values.", e);
            web_sys::console::warn_1(&JsValue::from_str(&msg));
            log_warning(msg, warnings);
            
            // Use default values (rational values but clearly not calculated)
            (1.0, 1.0)
        }
    };
    
    // Calculate predictor importance
    let predictor_importance = match calculate_predictor_importance(data, membership) {
        Ok(importance) => importance,
        Err(e) => {
            let msg = format!("Failed to calculate predictor importance: {}. Using default values.", e);
            web_sys::console::warn_1(&JsValue::from_str(&msg));
            log_warning(msg, warnings);
            
            // Create vector with uniform values for all predictors
            // Assuming all predictors equally important
            let n_vars = if !data.is_empty() { data[0].len() } else { 0 };
            vec![1.0 / n_vars as f64; n_vars]
        }
    };
    
    // Log warnings for debugging
    if !warnings.is_empty() {
        web_sys::console::info_1(&JsValue::from_str(&format!(
            "Completed clustering evaluation with {} warnings",
            warnings.len()
        )));
    }
    
    Ok(ClusterEvaluation {
        silhouette,
        sse,
        ssb,
        predictor_importance,
    })
}
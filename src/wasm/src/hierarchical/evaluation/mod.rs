mod silhouette;
mod sum_squares;
mod importance;

use crate::hierarchical::types::{ClusterEvaluation, ClusterMembership, ClusteringError};
use silhouette::calculate_silhouette;
use sum_squares::calculate_sum_of_squares;
use importance::calculate_predictor_importance;
use wasm_bindgen::JsValue;

/// Calculate evaluation metrics for a clustering solution
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
/// * `distance_matrix` - Pre-computed distance matrix
///
/// # Returns
/// * Result with evaluation metrics or error
pub fn evaluate_clustering(
    data: &[Vec<f64>],
    membership: &ClusterMembership,
    distance_matrix: &[Vec<f64>]
) -> Result<ClusterEvaluation, ClusteringError> {
    // Container untuk warning
    let mut warnings = Vec::new();
    
    // Coba hitung silhouette, tangkap error tapi tetap lanjutkan
    let silhouette = match calculate_silhouette(distance_matrix, membership) {
        Ok(s) => s,
        Err(e) => {
            let msg = format!("Failed to calculate silhouette: {}. Using default value.", e);
            // Gunakan JsValue::from_str daripada .into() untuk menghindari moved value
            web_sys::console::warn_1(&JsValue::from_str(&msg));
            warnings.push(msg);
            
            // Gunakan nilai default (0.0 adalah nilai netral)
            0.0
        }
    };
    
    // Coba hitung sum of squares, tangkap error tapi tetap lanjutkan
    let (sse, ssb) = match calculate_sum_of_squares(data, membership) {
        Ok((sse, ssb)) => (sse, ssb),
        Err(e) => {
            let msg = format!("Failed to calculate sum of squares: {}. Using default values.", e);
            // Perbaikan untuk menghindari moved value
            web_sys::console::warn_1(&JsValue::from_str(&msg));
            warnings.push(msg);
            
            // Gunakan nilai default (rasional, tapi jelas bukan hasil perhitungan)
            (1.0, 1.0)
        }
    };
    
    // Coba hitung predictor importance
    let predictor_importance = match calculate_predictor_importance(data, membership) {
        Ok(importance) => importance,
        Err(e) => {
            let msg = format!("Failed to calculate predictor importance: {}. Using default values.", e);
            // Perbaikan untuk menghindari moved value
            web_sys::console::warn_1(&JsValue::from_str(&msg));
            warnings.push(msg);
            
            // Buat vektor dengan nilai seragam untuk semua prediktor
            // Asumsi semua prediktor sama pentingnya
            let n_vars = if !data.is_empty() { data[0].len() } else { 0 };
            vec![1.0 / n_vars as f64; n_vars]
        }
    };
    
    // Log semua warning untuk debugging
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
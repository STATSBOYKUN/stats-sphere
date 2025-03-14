mod silhouette;
mod sum_squares;
mod importance;

use crate::hierarchical::types::{ClusterEvaluation, ClusterMembership, ClusteringError};
use silhouette::calculate_silhouette;
use sum_squares::calculate_sum_of_squares;
use importance::calculate_predictor_importance;

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
    let silhouette = calculate_silhouette(distance_matrix, membership)?;
    let (sse, ssb) = calculate_sum_of_squares(data, membership)?;
    let predictor_importance = calculate_predictor_importance(data, membership)?;
    
    Ok(ClusterEvaluation {
        silhouette,
        sse,
        ssb,
        predictor_importance,
    })
}
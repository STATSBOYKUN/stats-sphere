use crate::hierarchical::types::{ClusterMembership, ClusteringError};
use crate::ensure;

/// Calculate Sum of Squares Error (SSE) and Sum of Squares Between (SSB)
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
///
/// # Returns
/// * Result with (SSE, SSB) or error
pub(crate) fn calculate_sum_of_squares(
    data: &[Vec<f64>],
    membership: &ClusterMembership
) -> Result<(f64, f64), ClusteringError> {
    let n_cases = membership.case_ids.len();
    
    ensure!(n_cases > 0,
        ClusteringError::EvaluationError,
        "No valid cases for sum of squares calculation"
    );
    
    let n_vars = data[0].len();
    let num_clusters = membership.num_clusters;
    
    // Calculate overall mean (centroid)
    let mut overall_mean = vec![0.0; n_vars];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        for j in 0..n_vars {
            overall_mean[j] += data[case_id][j];
        }
    }
    
    for j in 0..n_vars {
        overall_mean[j] /= n_cases as f64;
    }
    
    // Calculate cluster centroids
    let mut cluster_centroids = vec![vec![0.0; n_vars]; num_clusters];
    let mut cluster_sizes = vec![0; num_clusters];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        for j in 0..n_vars {
            cluster_centroids[cluster_id][j] += data[case_id][j];
        }
        
        cluster_sizes[cluster_id] += 1;
    }
    
    for cluster_id in 0..num_clusters {
        let size = cluster_sizes[cluster_id] as f64;
        if size > 0.0 {
            for j in 0..n_vars {
                cluster_centroids[cluster_id][j] /= size;
            }
        }
    }
    
    // Calculate SSE (Sum of Squared Errors)
    let mut sse = 0.0;
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        let mut squared_dist = 0.0;
        for j in 0..n_vars {
            let diff = data[case_id][j] - cluster_centroids[cluster_id][j];
            squared_dist += diff * diff;
        }
        
        sse += squared_dist;
    }
    
    // Calculate SSB (Sum of Squares Between clusters)
    let mut ssb = 0.0;
    
    for cluster_id in 0..num_clusters {
        let size = cluster_sizes[cluster_id] as f64;
        let mut squared_dist = 0.0;
        
        for j in 0..n_vars {
            let diff = cluster_centroids[cluster_id][j] - overall_mean[j];
            squared_dist += diff * diff;
        }
        
        ssb += size * squared_dist;
    }
    
    // Return average values for comparability
    Ok((sse / n_cases as f64, ssb / n_cases as f64))
}
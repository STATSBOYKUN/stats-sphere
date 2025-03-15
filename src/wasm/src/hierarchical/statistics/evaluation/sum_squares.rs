use crate::hierarchical::types::{ClusterMembership, ClusteringError};
use crate::ensure;

/// Calculate Sum of Squares Error (SSE) and Sum of Squares Between (SSB)
///
/// SSE measures within-cluster variance (cohesion) while SSB measures 
/// between-cluster variance (separation).
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
    let mut overall_valid_counts = vec![0; n_vars];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        for j in 0..n_vars {
            if !data[case_id][j].is_nan() {
                overall_mean[j] += data[case_id][j];
                overall_valid_counts[j] += 1;
            }
        }
    }
    
    for j in 0..n_vars {
        if overall_valid_counts[j] > 0 {
            overall_mean[j] /= overall_valid_counts[j] as f64;
        } else {
            overall_mean[j] = 0.0; // Default for columns with all NaN
        }
    }
    
    // Calculate cluster centroids
    let mut cluster_centroids = vec![vec![0.0; n_vars]; num_clusters];
    let mut cluster_valid_counts = vec![vec![0; n_vars]; num_clusters];
    let mut cluster_sizes = vec![0; num_clusters];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        for j in 0..n_vars {
            if !data[case_id][j].is_nan() {
                cluster_centroids[cluster_id][j] += data[case_id][j];
                cluster_valid_counts[cluster_id][j] += 1;
            }
        }
        
        cluster_sizes[cluster_id] += 1;
    }
    
    for cluster_id in 0..num_clusters {
        for j in 0..n_vars {
            if cluster_valid_counts[cluster_id][j] > 0 {
                cluster_centroids[cluster_id][j] /= cluster_valid_counts[cluster_id][j] as f64;
            } else {
                // Use overall mean for dimensions with all NaN
                cluster_centroids[cluster_id][j] = overall_mean[j];
            }
        }
    }
    
    // Calculate SSE (Sum of Squared Errors)
    let mut sse = 0.0;
    let mut sse_count = 0;
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        let mut squared_dist = 0.0;
        let mut valid_dims = 0;
        
        for j in 0..n_vars {
            if !data[case_id][j].is_nan() {
                let diff = data[case_id][j] - cluster_centroids[cluster_id][j];
                squared_dist += diff * diff;
                valid_dims += 1;
            }
        }
        
        if valid_dims > 0 {
            // Scale squared distance by ratio of total to valid dimensions
            let scale_factor = n_vars as f64 / valid_dims as f64;
            sse += squared_dist * scale_factor;
            sse_count += 1;
        }
    }
    
    // Calculate SSB (Sum of Squares Between clusters)
    let mut ssb = 0.0;
    let mut ssb_count = 0;
    
    for cluster_id in 0..num_clusters {
        if cluster_sizes[cluster_id] > 0 {
            let mut squared_dist = 0.0;
            let mut valid_dims = 0;
            
            for j in 0..n_vars {
                if !cluster_centroids[cluster_id][j].is_nan() && !overall_mean[j].is_nan() {
                    let diff = cluster_centroids[cluster_id][j] - overall_mean[j];
                    squared_dist += diff * diff;
                    valid_dims += 1;
                }
            }
            
            if valid_dims > 0 {
                // Scale squared distance by ratio of total to valid dimensions
                let scale_factor = n_vars as f64 / valid_dims as f64;
                ssb += cluster_sizes[cluster_id] as f64 * squared_dist * scale_factor;
                ssb_count += cluster_sizes[cluster_id];
            }
        }
    }
    
    // Return average values for comparability
    let avg_sse = if sse_count > 0 { sse / sse_count as f64 } else { 0.0 };
    let avg_ssb = if ssb_count > 0 { ssb / ssb_count as f64 } else { 0.0 };
    
    Ok((avg_sse, avg_ssb))
}
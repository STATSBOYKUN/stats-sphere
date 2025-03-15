use crate::hierarchical::types::{ClusterMembership, ClusteringError};
use crate::ensure;

/// Calculate Silhouette coefficient
///
/// The Silhouette coefficient is a measure of how well objects are assigned to their clusters.
/// Values near 1 indicate that the object is well-matched to its own cluster and poorly
/// matched to neighboring clusters.
///
/// # Arguments
/// * `distance_matrix` - Pre-computed distance matrix
/// * `membership` - Cluster membership information
///
/// # Returns
/// * Result with Silhouette coefficient or error
pub(crate) fn calculate_silhouette(
    distance_matrix: &[Vec<f64>],
    membership: &ClusterMembership
) -> Result<f64, ClusteringError> {
    let n_cases = membership.case_ids.len();
    let num_clusters = membership.num_clusters;
    
    // Check if we have at least 2 clusters
    ensure!(num_clusters >= 2,
        ClusteringError::EvaluationError,
        "Silhouette coefficient requires at least 2 clusters"
    );
    
    // Count cases per cluster
    let mut cluster_sizes = vec![0; num_clusters];
    for &cluster_id in &membership.cluster_ids {
        cluster_sizes[cluster_id] += 1;
    }
    
    // Check if all clusters have at least one member
    ensure!(!cluster_sizes.iter().any(|&size| size == 0),
        ClusteringError::EvaluationError,
        "All clusters must have at least one member"
    );
    
    // Pre-calculate cluster assignments for faster lookup
    let mut cluster_members: Vec<Vec<usize>> = vec![Vec::new(); num_clusters];
    for (i, &cluster_id) in membership.cluster_ids.iter().enumerate() {
        cluster_members[cluster_id].push(i);
    }
    
    // Calculate silhouette for each case
    let mut silhouette_values = Vec::with_capacity(n_cases);
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        // Calculate average distance to cases in the same cluster (a_i)
        let mut same_cluster_dist_sum = 0.0;
        let mut same_cluster_count = 0;
        
        for &j in &cluster_members[cluster_id] {
            if i == j {
                continue; // Skip self
            }
            
            let other_case_id = membership.case_ids[j];
            same_cluster_dist_sum += distance_matrix[case_id][other_case_id];
            same_cluster_count += 1;
        }
        
        // If this is the only point in the cluster, use a default value
        let a_i = if same_cluster_count > 0 {
            same_cluster_dist_sum / same_cluster_count as f64
        } else {
            0.0 // Singleton cluster
        };
        
        // Calculate average distance to cases in the nearest cluster (b_i)
        let mut min_other_cluster_dist = f64::INFINITY;
        
        for other_cluster in 0..num_clusters {
            if other_cluster == cluster_id {
                continue; // Skip own cluster
            }
            
            let mut other_cluster_dist_sum = 0.0;
            let other_cluster_count = cluster_members[other_cluster].len();
            
            if other_cluster_count > 0 {
                for &j in &cluster_members[other_cluster] {
                    let other_case_id = membership.case_ids[j];
                    other_cluster_dist_sum += distance_matrix[case_id][other_case_id];
                }
                
                let avg_dist = other_cluster_dist_sum / other_cluster_count as f64;
                min_other_cluster_dist = min_other_cluster_dist.min(avg_dist);
            }
        }
        
        let b_i = min_other_cluster_dist;
        
        // Calculate silhouette value for this case
        let silhouette_i = if same_cluster_count == 0 {
            0.0 // Singleton cluster
        } else if a_i < b_i {
            1.0 - (a_i / b_i)
        } else if a_i > b_i {
            (b_i / a_i) - 1.0
        } else {
            0.0 // a_i == b_i
        };
        
        silhouette_values.push(silhouette_i);
    }
    
    // Calculate average silhouette
    let avg_silhouette = silhouette_values.iter().sum::<f64>() / n_cases as f64;
    
    Ok(avg_silhouette)
}
use crate::hierarchical::types::{ClusteringError, LinkageMethod};
use crate::hierarchical::utils::error::log_warning;
use std::collections::HashMap;

/// Find closest pair of clusters with error recovery
///
/// # Arguments
/// * `distances` - Distance matrix
/// * `cluster_mapping` - Mapping of original indices to current cluster IDs
/// * `method` - Linkage method for clustering
/// * `cluster_sums` - Additional data needed for some linkage methods
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * Result with (index1, index2, distance) of closest pair
pub fn find_closest_clusters(
    distances: &[Vec<f64>],
    cluster_mapping: &[usize],
    method: LinkageMethod,
    cluster_sums: &HashMap<usize, HashMap<usize, f64>>,
    warnings: &mut Vec<String>
) -> Result<(usize, usize, f64), ClusteringError> {
    let n = distances.len();
    
    // Validate matrix dimensions
    if n == 0 {
        return Err(ClusteringError::ClusteringProcessError(
            "Distance matrix is empty".to_string()
        ));
    }
    
    // Find active clusters with flexible definition:
    // 1. Cluster is active if it has at least one finite distance to another cluster
    // 2. OR it still has its original ID in the mapping
    let mut active_clusters: Vec<usize> = (0..n)
        .filter(|&i| {
            // Criterion 1: Has finite distance to another cluster
            (0..n).any(|j| i != j && !distances[i][j].is_infinite()) ||
            // Criterion 2: Has original ID in mapping
            cluster_mapping[i] == i
        })
        .collect();
    
    // Check for sufficient active clusters
    if active_clusters.len() < 2 {
        // If not enough active clusters by distance, try using mapping
        let backup_clusters: Vec<usize> = (0..n)
            .filter(|&i| cluster_mapping[i] == i)
            .collect();
        
        if backup_clusters.len() >= 2 {
            let warning = format!(
                "Insufficient active clusters by distance ({}). Using mapping-based active clusters ({})",
                active_clusters.len(), backup_clusters.len()
            );
            log_warning(warning, warnings);
            active_clusters = backup_clusters;
        } else {
            // If still not enough, use first two indices as final fallback
            if n >= 2 {
                let warning = format!(
                    "No active clusters found by any method. Using first two indices as fallback"
                );
                log_warning(warning, warnings);
                active_clusters = vec![0, 1];
            } else {
                // Fatal error - impossible to cluster with < 2 points
                return Err(ClusteringError::ClusteringProcessError(
                    format!("Insufficient active clusters. Found: {}", active_clusters.len())
                ));
            }
        }
    }
    
    let mut min_dist = f64::INFINITY;
    let mut min_i = active_clusters[0];
    let mut min_j = active_clusters[1];  // At least 2 elements
    let mut found = false;
    
    // Find closest pair
    for &i in &active_clusters {
        for &j in &active_clusters {
            if i >= j {
                continue; // Avoid duplicate comparisons and self-comparison
            }
            
            let mut dist = distances[i][j];
            
            // Handle NaN/Infinite distances with fallback value
            if dist.is_nan() || dist.is_infinite() {
                // Use high but finite value as fallback
                dist = f64::MAX / 2.0;
                
                let warning = format!(
                    "Invalid distance between clusters {}-{}. Using fallback distance.",
                    i, j
                );
                log_warning(warning, warnings);
            }
            
            // For average linkage methods, adjust by cluster sizes
            if method == LinkageMethod::AverageBetweenGroups || method == LinkageMethod::AverageWithinGroups {
                if let Some(sums_i) = cluster_sums.get(&i) {
                    if let Some(&sum_ij) = sums_i.get(&j) {
                        dist = sum_ij; // Use the sum directly as it already accounts for normalization
                    }
                }
            }
            
            if dist < min_dist {
                min_dist = dist;
                min_i = i;
                min_j = j;
                found = true;
            }
        }
    }
    
    if !found {
        // If still not found, use first pair as fallback
        let warning = format!(
            "Could not find valid closest clusters. Using first pair as fallback."
        );
        log_warning(warning, warnings);
        
        min_i = active_clusters[0];
        min_j = active_clusters[1];
        min_dist = distances[min_i][min_j];
        
        // Handle extreme case where this distance is also invalid
        if min_dist.is_nan() || min_dist.is_infinite() {
            min_dist = 1.0; // Reasonable default value
        }
    }
    
    Ok((min_i, min_j, min_dist))
}
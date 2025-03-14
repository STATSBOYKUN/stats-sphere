use crate::hierarchical::types::{ClusterNode, ClusteringError, LinkageMethod};
use std::collections::HashMap;

/// Update cluster mapping after merging clusters
pub(crate) fn update_cluster_mapping(
    cluster_mapping: &mut [usize],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) {
    for i in 0..cluster_mapping.len() {
        if cluster_mapping[i] == cluster1_idx || cluster_mapping[i] == cluster2_idx {
            cluster_mapping[i] = new_cluster_id;
        }
    }
}

/// Update distance matrix after merging clusters
pub(crate) fn update_distance_matrix(
    distances: &mut [Vec<f64>],
    cluster_mapping: &mut [usize],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    method: LinkageMethod,
    cluster_sums: &mut HashMap<usize, HashMap<usize, f64>>,
    ward_coefficient: &mut f64,
    clusters: &[ClusterNode]
) -> Result<(), ClusteringError> {
    // Update cluster mapping
    update_cluster_mapping(cluster_mapping, cluster1_idx, cluster2_idx, new_cluster_id);
    
    // Update distances based on the chosen method
    match method {
        LinkageMethod::AverageBetweenGroups => 
            update_distance_average_between(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters, cluster_sums),
        LinkageMethod::AverageWithinGroups => 
            update_distance_average_within(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters, cluster_sums),
        LinkageMethod::SingleLinkage => 
            update_distance_single(distances, cluster1_idx, cluster2_idx, new_cluster_id),
        LinkageMethod::CompleteLinkage => 
            update_distance_complete(distances, cluster1_idx, cluster2_idx, new_cluster_id),
        LinkageMethod::Centroid => 
            update_distance_centroid(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters),
        LinkageMethod::Median => 
            update_distance_median(distances, cluster1_idx, cluster2_idx, new_cluster_id),
        LinkageMethod::Ward => {
            let result = update_distance_ward(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters);
            // Update ward coefficient
            *ward_coefficient += distances[cluster1_idx][cluster2_idx];
            result
        }
    }
}

/// Update distance matrix for average between groups linkage
fn update_distance_average_between(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode],
    cluster_sums: &mut HashMap<usize, HashMap<usize, f64>>
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    let n_sum = n1 + n2;
    
    // Prepare sums for calculation to avoid multiple mutable borrows
    let mut new_cluster_sums = HashMap::new();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        
        // Retrieve or calculate sums
        let sum_1k = cluster_sums
            .get(&cluster1_idx)
            .and_then(|sums| sums.get(&k))
            .cloned()
            .unwrap_or_else(|| n1 * d1k);
        
        let sum_2k = cluster_sums
            .get(&cluster2_idx)
            .and_then(|sums| sums.get(&k))
            .cloned()
            .unwrap_or_else(|| n2 * d2k);
        
        let new_sum = sum_1k + sum_2k;
        let new_dist = new_sum / n_sum;
        
        // Store new sum for the new cluster
        new_cluster_sums.insert(k, new_sum);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Insert the new cluster sums after calculations
    cluster_sums.insert(new_cluster_id, new_cluster_sums);
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for average within groups linkage
fn update_distance_average_within(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode],
    cluster_sums: &mut HashMap<usize, HashMap<usize, f64>>
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    let n_sum = n1 + n2;
    
    // Prepare sums for calculation to avoid multiple mutable borrows
    let mut new_cluster_sums = HashMap::new();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        // Retrieve or calculate sums
        let sum_1k = cluster_sums
            .get(&cluster1_idx)
            .and_then(|sums| sums.get(&k))
            .cloned()
            .unwrap_or_else(|| n1 * d1k);
        
        let sum_2k = cluster_sums
            .get(&cluster2_idx)
            .and_then(|sums| sums.get(&k))
            .cloned()
            .unwrap_or_else(|| n2 * d2k);
        
        let sum_12 = cluster_sums
            .get(&cluster1_idx)
            .and_then(|sums| sums.get(&cluster2_idx))
            .cloned()
            .unwrap_or_else(|| n1 * n2 * d12 / n_sum);
        
        let nk = clusters[k].size as f64;
        let new_sum = sum_1k + sum_2k + sum_12;
        let total_pairs = ((n1 + n2 + nk) * (n1 + n2 + nk - 1.0)) / 2.0;
        let new_dist = new_sum / total_pairs;
        
        // Store new sum for the new cluster
        new_cluster_sums.insert(k, new_sum);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Insert the new cluster sums after calculations
    cluster_sums.insert(new_cluster_id, new_cluster_sums);
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for single linkage
fn update_distance_single(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) -> Result<(), ClusteringError> {
    let n = distances.len();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let new_dist = d1k.min(d2k);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for complete linkage
fn update_distance_complete(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) -> Result<(), ClusteringError> {
    let n = distances.len();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let new_dist = d1k.max(d2k);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for centroid method
fn update_distance_centroid(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode]
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        let new_dist = ((n1 * d1k + n2 * d2k) / (n1 + n2)) - ((n1 * n2 * d12) / ((n1 + n2) * (n1 + n2)));
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for median method
fn update_distance_median(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) -> Result<(), ClusteringError> {
    let n = distances.len();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        let new_dist = 0.5 * d1k + 0.5 * d2k - 0.25 * d12;
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for Ward's method
fn update_distance_ward(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode]
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        let nk = clusters[k].size as f64;
        let nt = n1 + n2;
        
        let new_dist = ((n1 + nk) * d1k + (n2 + nk) * d2k - nk * d12) / (nt + nk);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}
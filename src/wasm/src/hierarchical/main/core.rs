use crate::hierarchical::types::{
  ClusterNode, ClusteringConfig, ClusteringError, 
  AgglomerationSchedule, AgglomerationStep, 
  HierarchicalClusteringResults, LinkageMethod
};
use super::linkage::update_distance_matrix;
use super::dendrogram::create_dendrogram_data;
use std::collections::HashMap;

/// Perform hierarchical clustering on the data
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `distance_matrix` - Pre-computed distance matrix
/// * `config` - Configuration for clustering
///
/// # Returns
/// * Result containing hierarchical clustering results or error
pub fn hierarchical_cluster(
    data: &[Vec<f64>],
    distance_matrix: &[Vec<f64>],
    config: &ClusteringConfig,
  ) -> Result<HierarchicalClusteringResults, ClusteringError> {
    let n = data.len();
    
    if n < 2 {
        return Err(ClusteringError::ClusteringProcessError(
            "Need at least 2 data points for hierarchical clustering".to_string()
        ));
    }
    
    // Initialize clusters (one per data point)
    let mut clusters: Vec<ClusterNode> = Vec::with_capacity(n);
    for i in 0..n {
        clusters.push(ClusterNode::new(i, &data[i]));
    }
    
    // Create working copy of distance matrix
    let mut distances = distance_matrix.to_vec();
    
    // Initialize additional data structures needed for different methods
    let mut cluster_sums: HashMap<usize, HashMap<usize, f64>> = HashMap::new();
    let mut ward_coefficient = 0.0;
    
    // Track which original cluster belongs to which active cluster
    let mut cluster_mapping: Vec<usize> = (0..n).collect();
    
    // Create agglomeration schedule
    let mut agglomeration_steps: Vec<AgglomerationStep> = Vec::with_capacity(n - 1);
    
    // Vectors to track first appearance and next stage
    let mut first_appearances: Vec<i32> = vec![-1; 2 * n - 1];
    let mut next_stages: Vec<i32> = vec![-1; 2 * n - 1];
    
    // Ensure diagonal elements are 0
    for i in 0..n {
        distances[i][i] = 0.0;
    }
    
    // Perform n-1 merges
    for step in 0..(n - 1) {
        // Find closest pair of clusters
        let (cluster1_idx, cluster2_idx, min_dist) = find_closest_clusters(
            &distances, 
            &cluster_mapping,
            config.method,
            &cluster_sums
        )?;
        
        // Ensure cluster1_idx is smaller than cluster2_idx for consistency
        let (cluster1_idx, cluster2_idx) = if cluster1_idx < cluster2_idx {
            (cluster1_idx, cluster2_idx)
        } else {
            (cluster2_idx, cluster1_idx)
        };
        
        // Get active cluster IDs
        let cluster1_id = cluster_mapping[cluster1_idx];
        let cluster2_id = cluster_mapping[cluster2_idx];
        
        // Create new cluster ID (n + step)
        let new_cluster_id = n + step;
        
        // Record the agglomeration step
        let agglomeration_step = AgglomerationStep {
            step: step + 1,
            cluster1: cluster1_id,
            cluster2: cluster2_id,
            coefficient: min_dist,
            stage_cluster1_first_appears: first_appearances[cluster1_id],
            stage_cluster2_first_appears: first_appearances[cluster2_id],
            next_stage: -1, // Will be set later
        };
        
        // Record first appearance of the new cluster
        first_appearances[new_cluster_id] = step as i32;
        
        // Update next_stage for the merged clusters
        if first_appearances[cluster1_id] >= 0 {
            next_stages[cluster1_id] = step as i32;
        }
        if first_appearances[cluster2_id] >= 0 {
            next_stages[cluster2_id] = step as i32;
        }
        
        agglomeration_steps.push(agglomeration_step);
        
        // Merge the clusters
        let cluster1 = &clusters[cluster1_id];
        let cluster2 = &clusters[cluster2_id];
        let new_cluster = ClusterNode::merge(new_cluster_id, cluster1, cluster2);
        clusters.push(new_cluster);
        
        // Update the distance matrix based on the chosen method
        update_distance_matrix(
            &mut distances,
            &mut cluster_mapping,
            cluster1_idx,
            cluster2_idx,
            new_cluster_id,
            config.method,
            &mut cluster_sums,
            &mut ward_coefficient,
            &clusters
        )?;
    }
    
    // Update the next_stage for all steps
    for i in 0..agglomeration_steps.len() {
        let cluster1 = agglomeration_steps[i].cluster1;
        let cluster2 = agglomeration_steps[i].cluster2;
        
        agglomeration_steps[i].stage_cluster1_first_appears = first_appearances[cluster1];
        agglomeration_steps[i].stage_cluster2_first_appears = first_appearances[cluster2];
        
        if first_appearances[cluster1] >= 0 {
            agglomeration_steps[i].stage_cluster1_first_appears = first_appearances[cluster1];
        }
        if first_appearances[cluster2] >= 0 {
            agglomeration_steps[i].stage_cluster2_first_appears = first_appearances[cluster2];
        }
        
        if next_stages[cluster1] >= 0 {
            agglomeration_steps[i].next_stage = next_stages[cluster1];
        }
    }
    
    // Create the agglomeration schedule
    let agglomeration_schedule = AgglomerationSchedule {
        steps: agglomeration_steps,
        method: config.method,
        distance_metric: config.distance_metric,
        standardization: config.standardization,
    };
    
    // Return the results
    Ok(HierarchicalClusteringResults {
        agglomeration_schedule: agglomeration_schedule.clone(),
        proximity_matrix: distance_matrix.to_vec(),
        single_solution: None, // Will be filled in later if requested
        range_solutions: None, // Will be filled in later if requested
        evaluation: None,      // Will be filled in later if requested
        dendrogram_data: Some(create_dendrogram_data(&clusters, &agglomeration_schedule.steps)),
    })
  }

/// Find closest pair of clusters
/// Find closest pair of clusters
fn find_closest_clusters(
    distances: &[Vec<f64>],
    cluster_mapping: &[usize],
    method: LinkageMethod,
    cluster_sums: &HashMap<usize, HashMap<usize, f64>>
) -> Result<(usize, usize, f64), ClusteringError> {
    let n = distances.len();
    
    // Validate matrix dimensions
    if n == 0 {
        return Err(ClusteringError::ClusteringProcessError(
            "Distance matrix is empty".to_string()
        ));
    }
    
    // Validate matrix consistency
    for (i, row) in distances.iter().enumerate() {
        if row.len() != n {
            return Err(ClusteringError::ClusteringProcessError(
                format!("Inconsistent row length at index {}: expected {}, got {}", i, n, row.len())
            ));
        }
    }
    
    // Find active clusters by checking for non-infinite distances
    // Sebuah cluster aktif jika memiliki setidaknya satu jarak non-infinite ke cluster lain
    let active_clusters: Vec<usize> = (0..n)
        .filter(|&i| {
            (0..n).any(|j| i != j && !distances[i][j].is_infinite())
        })
        .collect();
    
    // Check for sufficient active clusters
    if active_clusters.len() < 2 {
        return Err(ClusteringError::ClusteringProcessError(
            format!("Insufficient active clusters. Found: {}", active_clusters.len())
        ));
    }
    
    let mut min_dist = f64::INFINITY;
    let mut min_i = 0;
    let mut min_j = 0;
    let mut found = false;
    
    // Detailed tracking of comparisons
    let mut comparison_details = Vec::new();
    
    for &i in &active_clusters {
        for &j in &active_clusters {
            if i >= j {
                continue; // Avoid duplicate comparisons and self-comparison
            }
            
            let mut dist = distances[i][j];
            
            // For average linkage methods, adjust by cluster sizes
            if method == LinkageMethod::AverageBetweenGroups || method == LinkageMethod::AverageWithinGroups {
                if let Some(sums_i) = cluster_sums.get(&i) {
                    if let Some(&sum_ij) = sums_i.get(&j) {
                        dist = sum_ij; // Use the sum directly as it already accounts for the normalization
                    }
                }
            }
            
            // Track comparison details
            comparison_details.push((i, j, dist));
            
            if dist < min_dist {
                min_dist = dist;
                min_i = i;
                min_j = j;
                found = true;
            }
        }
    }
    
    if !found {
        // If no clusters found, return detailed error with comparison details
        let details = comparison_details
            .iter()
            .map(|&(i, j, dist)| format!("Clusters {}-{}: distance {}", i, j, dist))
            .collect::<Vec<_>>()
            .join("; ");
        
        return Err(ClusteringError::ClusteringProcessError(
            format!(
                "Could not find closest clusters. \
                Active clusters: {}. \
                Comparison details: {}",
                active_clusters.len(),
                details
            )
        ));
    }
    
    Ok((min_i, min_j, min_dist))
}
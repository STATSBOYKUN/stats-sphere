use crate::hierarchical::types::{
  ClusterNode, ClusteringConfig, ClusteringError, 
  AgglomerationSchedule, AgglomerationStep, 
  HierarchicalClusteringResults, LinkageMethod
};
use crate::hierarchical::algorithm::pairs::find_closest_clusters;
use crate::hierarchical::statistics::linkage::update_distance_matrix;
use crate::hierarchical::result::create_dendrogram_data;
use crate::hierarchical::utils::error::log_warning;
use crate::hierarchical::utils::validation::{validate_data_matrix, validate_distance_matrix};

use std::collections::HashMap;
use wasm_bindgen::JsValue;

/// Perform hierarchical clustering on the data
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `distance_matrix` - Pre-computed distance matrix
/// * `config` - Configuration for clustering
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * Result containing hierarchical clustering results or error
pub fn hierarchical_cluster(
  data: &[Vec<f64>],
  distance_matrix: &[Vec<f64>],
  config: &ClusteringConfig,
  warnings: &mut Vec<String>
) -> Result<HierarchicalClusteringResults, ClusteringError> {
  // Validate input data
  validate_data_matrix(data, 2)?;
  
  let n = data.len();
  
  // Validate distance matrix
  if let Err(e) = validate_distance_matrix(distance_matrix, n) {
      let warning = format!(
          "Distance matrix validation failed: {}. Using subset or adjusting distances.",
          e
      );
      log_warning(warning, warnings);
  }
  
  // Initialize clusters (one per data point)
  let mut clusters: Vec<ClusterNode> = Vec::with_capacity(n);
  for i in 0..n {
      clusters.push(ClusterNode::new(i, &data[i]));
  }
  
  // Create working copy of distance matrix
  let mut distances = distance_matrix.to_vec();
  
  // Ensure distance matrix has correct dimensions
  if distances.len() != n {
      let warning = format!(
          "Adjusting distance matrix to match data size ({} points)",
          n
      );
      log_warning(warning, warnings);
      
      // Create new distance matrix with correct dimensions
      let mut new_distances = vec![vec![0.0; n]; n];
      
      // Copy existing values
      for i in 0..distances.len().min(n) {
          for j in 0..distances[i].len().min(n) {
              new_distances[i][j] = distances[i][j];
          }
      }
      
      // Fill missing values with simple Euclidean distance
      for i in 0..n {
          for j in 0..n {
              if i == j {
                  new_distances[i][j] = 0.0; // Diagonal is always 0
              } else if i >= distances.len() || j >= distances[i].len() {
                  // Calculate Euclidean distance for missing values
                  let mut sum_sq = 0.0;
                  for k in 0..data[i].len().min(data[j].len()) {
                      let diff = data[i][k] - data[j][k];
                      sum_sq += diff * diff;
                  }
                  new_distances[i][j] = sum_sq.sqrt();
              }
          }
      }
      
      distances = new_distances;
  }
  
  // Ensure distance matrix values are valid (no NaN/Inf)
  for i in 0..n {
      // Diagonal is always 0
      distances[i][i] = 0.0;
      
      for j in (i+1)..n {
          if distances[i][j].is_nan() || distances[i][j].is_infinite() {
              let warning = format!(
                  "Invalid distance at ({}, {}): {}. Using Euclidean distance.",
                  i, j, distances[i][j]
              );
              log_warning(warning, warnings);
              
              // Calculate Euclidean distance as fallback
              let mut sum_sq = 0.0;
              for k in 0..data[i].len().min(data[j].len()) {
                  let diff = data[i][k] - data[j][k];
                  sum_sq += diff * diff;
              }
              distances[i][j] = sum_sq.sqrt();
              distances[j][i] = distances[i][j]; // Symmetric
          }
      }
  }
  
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
  
  // Perform n-1 merges
  for step in 0..(n - 1) {
      // Find closest pair of clusters
      let (cluster1_idx, cluster2_idx, min_dist) = match find_closest_clusters(
          &distances, 
          &cluster_mapping,
          config.method,
          &cluster_sums,
          warnings
      ) {
          Ok(result) => result,
          Err(e) => {
              let error_msg = format!("Error at step {}: {}. Clustering may be incomplete.", step, e);
              log_warning(error_msg, warnings);
              
              // If error at early step, use fallback to get at least one result
              if step == 0 {
                  // Use first two indices as fallback
                  (0, 1, 1.0)
              } else {
                  // If already have some steps, we can stop here
                  let warning = format!("Clustering stopped at step {} due to error: {}", step, e);
                  log_warning(warning, warnings);
                  break;
              }
          }
      };
      
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
      if let Err(e) = update_distance_matrix(
          &mut distances,
          &mut cluster_mapping,
          cluster1_idx,
          cluster2_idx,
          new_cluster_id,
          config.method,
          &mut cluster_sums,
          &mut ward_coefficient,
          &clusters
      ) {
          let warning = format!(
              "Error updating distance matrix at step {}: {}. Using approximation.",
              step, e
          );
          log_warning(warning, warnings);
          
          // Fallback: mark both clusters as inactive by setting distance to infinity
          for i in 0..n {
              if i != cluster1_idx && i != cluster2_idx {
                  distances[cluster1_idx][i] = f64::INFINITY;
                  distances[i][cluster1_idx] = f64::INFINITY;
                  distances[cluster2_idx][i] = f64::INFINITY;
                  distances[i][cluster2_idx] = f64::INFINITY;
              }
          }
          
          // Update cluster mapping
          for i in 0..cluster_mapping.len() {
              if cluster_mapping[i] == cluster1_id || cluster_mapping[i] == cluster2_id {
                  cluster_mapping[i] = new_cluster_id;
              }
          }
      }
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
  
  // Create dendrogram data
  let dendrogram_data = create_dendrogram_data(&clusters, &agglomeration_schedule.steps, warnings);
  
  // Return the results
  Ok(HierarchicalClusteringResults {
      agglomeration_schedule: agglomeration_schedule,
      proximity_matrix: distance_matrix.to_vec(),
      single_solution: None, // Will be filled in later if requested
      range_solutions: None, // Will be filled in later if requested
      evaluation: None,      // Will be filled in later if requested
      dendrogram_data: Some(dendrogram_data),
  })
}
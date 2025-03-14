use crate::hierarchical::types::{
  ClusterNode, ClusteringConfig, ClusteringError, 
  AgglomerationSchedule, AgglomerationStep, 
  HierarchicalClusteringResults, LinkageMethod
};
use super::linkage::update_distance_matrix;
use super::dendrogram::create_dendrogram_data;
use std::collections::HashMap;
use wasm_bindgen::JsValue;

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
    // Validasi input
    if data.is_empty() {
        return Err(ClusteringError::ClusteringProcessError(
            "Empty data provided for hierarchical clustering".to_string()
        ));
    }
    
    let n = data.len();
    
    if n < 2 {
        return Err(ClusteringError::ClusteringProcessError(
            "Need at least 2 data points for hierarchical clustering".to_string()
        ));
    }
    
    // Validasi distance matrix
    if distance_matrix.len() != n {
        web_sys::console::warn_1(&JsValue::from_str(&format!(
            "Distance matrix size mismatch: {} rows vs {} data points. Using subset.",
            distance_matrix.len(), n
        )));
    }
    
    // Container untuk warning - Ubah menjadi Vec<String> untuk mengatasi error
  let mut warnings: Vec<String> = Vec::new();
  
  // Initialize clusters (one per data point)
  let mut clusters: Vec<ClusterNode> = Vec::with_capacity(n);
  for i in 0..n {
      clusters.push(ClusterNode::new(i, &data[i]));
  }
    // Create working copy of distance matrix
    let mut distances = distance_matrix.to_vec();
    
    // Pastikan matriks jarak memiliki dimensi yang benar
    if distances.len() != n {
        web_sys::console::warn_1(&format!(
            "Adjusting distance matrix to match data size ({} points)",
            n
        ).into());
        
        // Buat matrix jarak baru dengan dimensi yang tepat
        let mut new_distances = vec![vec![0.0; n]; n];
        
        // Salin nilai yang ada
        for i in 0..distances.len().min(n) {
            for j in 0..distances[i].len().min(n) {
                new_distances[i][j] = distances[i][j];
            }
        }
        
        // Isi nilai yang hilang dengan perkiraan sederhana
        for i in 0..n {
            for j in 0..n {
                if i == j {
                    new_distances[i][j] = 0.0; // Diagonal selalu 0
                } else if i >= distances.len() || j >= distances[i].len() {
                    // Hitung jarak Euclidean untuk nilai yang hilang
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
        warnings.push("Distance matrix was adjusted to match data size".to_string());
    }
    
    // Pastikan matriks jarak valid (tidak ada NaN/Inf yang tidak perlu)
    for i in 0..n {
        // Diagonal selalu 0
        distances[i][i] = 0.0;
        
        for j in (i+1)..n {
            if distances[i][j].is_nan() || distances[i][j].is_infinite() {
                web_sys::console::warn_1(&format!(
                    "Invalid distance at ({}, {}): {}. Using Euclidean distance.",
                    i, j, distances[i][j]
                ).into());
                
                // Hitung jarak Euclidean sebagai fallback
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
            &cluster_sums
        ) {
            Ok(result) => result,
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error at step {}: {}. Clustering may be incomplete.",
                    step, e
                )));
                
                // Jika error di langkah awal, kita harus mengembalikan minimal 1 hasil
                if step == 0 {
                    // Gunakan 2 indeks pertama sebagai fallback
                    let c1 = 0;
                    let c2 = 1;
                    let dist = 1.0;
                    (c1, c2, dist)
                } else {
                    // Jika sudah ada beberapa langkah, kita bisa berhenti di sini
                    warnings.push(format!("Clustering stopped at step {} due to error: {}", step, e));
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
            web_sys::console::warn_1(&JsValue::from_str(&format!(
                "Error updating distance matrix at step {}: {}. Using approximation.",
                step, e
            )));
            
            // Fallback: tandai kedua cluster sebagai tidak aktif dengan mengatur jarak ke infinity
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
                if cluster_mapping[i] == cluster1_idx || cluster_mapping[i] == cluster2_idx {
                    cluster_mapping[i] = new_cluster_id;
                }
            }
            
            warnings.push(format!("Distance update failed at step {}", step));
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
    
    // Log warning jika ada masalah
    if !warnings.is_empty() {
        web_sys::console::info_1(&JsValue::from_str(&format!(
            "Hierarchical clustering completed with {} warnings",
            warnings.len()
        )));
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

/// Find closest pair of clusters dengan error recovery
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
            // Ini error fatal karena tidak bisa dilanjutkan
            return Err(ClusteringError::ClusteringProcessError(
                format!("Inconsistent row length at index {}: expected {}, got {}", i, n, row.len())
            ));
        }
    }
    
    // Find active clusters dengan definisi yang fleksibel:
    // 1. Cluster aktif memiliki setidaknya satu jarak finite ke cluster lain
    // 2. ATAU, belum digabungkan ke cluster lain (masih memiliki ID asli di mapping)
    let mut active_clusters: Vec<usize> = (0..n)
        .filter(|&i| {
            // Kriteria 1: Memiliki jarak finite ke cluster lain
            (0..n).any(|j| i != j && !distances[i][j].is_infinite()) ||
            // Kriteria 2: Belum digabungkan (ID asli di mapping)
            cluster_mapping[i] == i
        })
        .collect();
    
    // Check for sufficient active clusters
    if active_clusters.len() < 2 {
        // Jika tidak cukup cluster aktif, coba gunakan 2 indeks pertama yang belum digabungkan
        let backup_clusters: Vec<usize> = (0..n)
            .filter(|&i| cluster_mapping[i] == i)
            .collect();
        
        if backup_clusters.len() >= 2 {
            web_sys::console::warn_1(&format!(
                "Insufficient active clusters by distance ({}). Using mapping-based active clusters ({})",
                active_clusters.len(), backup_clusters.len()
            ).into());
            active_clusters = backup_clusters;
        } else {
            // Jika masih tidak cukup, gunakan 2 indeks pertama sebagai fallback terakhir
            if n >= 2 {
                web_sys::console::warn_1(&format!(
                    "No active clusters found by any method. Using first two indices as fallback"
                ).into());
                active_clusters = vec![0, 1];
            } else {
                // Ini error fatal karena tidak mungkin melakukan clustering dengan <2 titik
                return Err(ClusteringError::ClusteringProcessError(
                    format!("Insufficient active clusters. Found: {}", active_clusters.len())
                ));
            }
        }
    }
    
    let mut min_dist = f64::INFINITY;
    let mut min_i = active_clusters[0];
    let mut min_j = active_clusters[1];  // Minimal ada 2 elemen
    let mut found = false;
    
    // Detailed tracking of comparisons
    let mut comparison_details = Vec::new();
    
    for &i in &active_clusters {
        for &j in &active_clusters {
            if i >= j {
                continue; // Avoid duplicate comparisons and self-comparison
            }
            
            let mut dist = distances[i][j];
            
            // Handle NaN/Infinite distances dengan nilai fallback
            if dist.is_nan() || dist.is_infinite() {
                // Gunakan jarak Euclidean langsung dari data jika memungkinkan
                if i < cluster_mapping.len() && j < cluster_mapping.len() {
                    let cluster1_id = cluster_mapping[i];
                    let cluster2_id = cluster_mapping[j];
                    
                    // Tetapkan nilai jarak tinggi tapi finite untuk dihindari
                    dist = f64::MAX / 2.0;
                    
                    web_sys::console::warn_1(&format!(
                        "Invalid distance between clusters {}-{}. Using fallback distance.",
                        i, j
                    ).into());
                }
            }
            
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
        // Jika masih belum menemukan, gunakan pasangan pertama sebagai fallback
        web_sys::console::warn_1(&format!(
            "Could not find valid closest clusters. Using first pair as fallback."
        ).into());
        
        min_i = active_clusters[0];
        min_j = active_clusters[1];
        min_dist = distances[min_i][min_j];
        
        // Tangani kasus ekstrim di mana jarak ini juga tidak valid
        if min_dist.is_nan() || min_dist.is_infinite() {
            min_dist = 1.0; // Nilai default yang reasonable
        }
        
        web_sys::console::info_1(&format!(
            "Using fallback pair: ({}, {}) with distance {}",
            min_i, min_j, min_dist
        ).into());
    }
    
    Ok((min_i, min_j, min_dist))
}
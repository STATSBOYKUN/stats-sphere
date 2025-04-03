use crate::hierarchical::models::{
    config::ClusMethod,
    result::{ ClusterState, AgglomerationStage, AgglomerationSchedule },
};
use std::collections::HashMap;

// Find the two closest clusters and returns their indices and distance
pub fn find_closest_clusters(state: &ClusterState) -> Option<(usize, usize, f64)> {
    let n_clusters = state.clusters.len();
    if n_clusters < 2 {
        return None;
    }

    let mut min_distance = f64::MAX;
    let mut closest_pair = None;

    for i in 0..n_clusters {
        for j in i + 1..n_clusters {
            let distance = state.distances[i][j];
            if distance < min_distance {
                min_distance = distance;
                closest_pair = Some((i, j, distance));
            }
        }
    }

    closest_pair
}

// Calculate new distance between merged cluster and another cluster
pub fn calculate_new_distance(
    method: &ClusMethod,
    keep_cluster_idx: usize,
    remove_cluster_idx: usize,
    other_cluster_idx: usize,
    clusters: &[Vec<usize>],
    distances: &[Vec<f64>]
) -> f64 {
    // Get cluster sizes
    let n_keep = clusters[keep_cluster_idx].len() as f64;
    let n_remove = clusters[remove_cluster_idx].len() as f64;
    let n_other = clusters[other_cluster_idx].len() as f64;

    // Get distances between clusters
    let d_keep_other = distances[keep_cluster_idx][other_cluster_idx];
    let d_remove_other = distances[remove_cluster_idx][other_cluster_idx];
    let d_keep_remove = distances[keep_cluster_idx][remove_cluster_idx];

    match method {
        ClusMethod::AverageBetweenGroups => {
            // Formula: (Np*spr + Nq*sqr)/(Np + Nq)
            (n_keep * d_keep_other + n_remove * d_remove_other) / (n_keep + n_remove)
        }
        ClusMethod::AverageWithinGroups => {
            // Simple implementation: (spr + sqr)/2
            (d_keep_other + d_remove_other) / 2.0
        }
        ClusMethod::SingleLinkage => {
            // Formula for dissimilarity: min(spr, sqr)
            d_keep_other.min(d_remove_other)
        }
        ClusMethod::CompleteLinkage => {
            // Formula for dissimilarity: max(spr, sqr)
            d_keep_other.max(d_remove_other)
        }
        ClusMethod::Centroid => {
            // Formula: (Np*spr + Nq*sqr - (Np*Nq*spq)/(Np+Nq))/(Np+Nq)
            let numerator =
                n_keep * d_keep_other +
                n_remove * d_remove_other -
                (n_keep * n_remove * d_keep_remove) / (n_keep + n_remove);
            numerator / (n_keep + n_remove)
        }
        ClusMethod::Median => {
            // Formula: (spr + sqr)/2 - spq/4
            (d_keep_other + d_remove_other) / 2.0 - d_keep_remove / 4.0
        }
        ClusMethod::Ward => {
            // Formula: 1/(Nt+Nr)*[(Nr+Np)*srp + (Nr+Nq)*srq - Nr*spq]
            let n_total = n_keep + n_remove;
            ((n_other + n_keep) * d_keep_other +
                (n_other + n_remove) * d_remove_other -
                n_other * d_keep_remove) /
                (n_total + n_other)
        }
    }
}

// Generate agglomeration schedule for hierarchical clustering
pub fn generate_agglomeration_schedule(
    state: &mut ClusterState,
    is_ward_method: bool
) -> Result<AgglomerationSchedule, String> {
    let original_count = state.clusters.len();
    let stages_count = original_count - 1;

    // Initialize tracking structures
    let mut stages = Vec::with_capacity(stages_count);
    let mut ward_coefficient = 0.0;

    // Cluster tracking - each NEW cluster will have an ID starting after the original clusters
    let mut next_cluster_id = original_count + 1; // 1-indexed for display, start after original clusters

    // Map internal index to cluster ID (1-indexed)
    let mut cluster_map: HashMap<usize, usize> = HashMap::new();
    for i in 0..original_count {
        cluster_map.insert(i, i + 1); // Map 0-based index to 1-based ID
    }

    // Track when clusters first appear and next appear
    let mut first_appears: HashMap<usize, usize> = HashMap::new();
    let mut next_appears: HashMap<usize, usize> = HashMap::new();

    // Initialize first_appears for original clusters
    for i in 1..=original_count {
        first_appears.insert(i, 0); // Original clusters appear at stage 0
    }

    // Debug initial state
    web_sys::console::log_1(&format!("Initial clusters: {:?}", state.clusters).into());
    web_sys::console::log_1(&format!("Initial distances: {:?}", state.distances).into());

    // Process stages
    for stage_idx in 0..stages_count {
        let stage = stage_idx + 1; // 1-indexed stage number

        // Find closest clusters
        if let Some((idx1, idx2, distance)) = find_closest_clusters(state) {
            // Get real cluster IDs (1-indexed)
            let cluster1_id = *cluster_map.get(&idx1).unwrap_or(&(idx1 + 1));
            let cluster2_id = *cluster_map.get(&idx2).unwrap_or(&(idx2 + 1));

            web_sys::console::log_1(&format!("Processing stage {}", stage).into());
            web_sys::console::log_1(
                &format!("Merging clusters {} and {}", cluster1_id, cluster2_id).into()
            );

            // For Ward's method, update coefficient
            let coefficient = if is_ward_method {
                ward_coefficient += 0.5 * distance;
                ward_coefficient
            } else {
                distance
            };

            // Create new cluster
            let new_cluster_id = next_cluster_id;
            next_cluster_id += 1;

            // Record when this cluster first appears
            first_appears.insert(new_cluster_id, stage);

            // Get when merged clusters first appeared
            let cluster1_first_stage = *first_appears.get(&cluster1_id).unwrap_or(&0);
            let cluster2_first_stage = *first_appears.get(&cluster2_id).unwrap_or(&0);

            // Calculate next stage
            let next_stage = if stage == stages_count {
                0 // Last stage has no next stage
            } else {
                stage + 1 // Next stage
            };

            // Record when these clusters next appear (in this merge)
            next_appears.insert(cluster1_id, stage);
            next_appears.insert(cluster2_id, stage);

            // Create stage entry
            stages.push(AgglomerationStage {
                stage,
                clusters_combined: (cluster1_id, cluster2_id),
                coefficients: coefficient,
                cluster_first_appears: (cluster1_first_stage, cluster2_first_stage),
                next_stage: next_stage,
            });

            web_sys::console::log_1(
                &format!(
                    "Merged clusters {} and {} into new cluster {}",
                    cluster1_id,
                    cluster2_id,
                    new_cluster_id
                ).into()
            );

            // Merge the clusters
            merge_clusters(state, idx1, idx2);

            // Update cluster mapping
            cluster_map.remove(&idx2); // Remove the second cluster from mapping
            cluster_map.insert(idx1, new_cluster_id); // Update mapping for the first cluster

            // Update remaining cluster indices (they shift after removal)
            let mut new_cluster_map = HashMap::new();
            for (old_idx, id) in cluster_map.iter() {
                let new_idx = if *old_idx > idx2 { old_idx - 1 } else { *old_idx };
                new_cluster_map.insert(new_idx, *id);
            }
            cluster_map = new_cluster_map;
        } else {
            return Err(format!("Failed to find closest clusters at stage {}", stage_idx));
        }
    }

    // Debug final result
    web_sys::console::log_1(&format!("Final agglomeration schedule: {:?}", stages).into());

    Ok(AgglomerationSchedule { stages })
}

// Merge clusters and update the cluster state
pub fn merge_clusters(state: &mut ClusterState, keep_idx: usize, remove_idx: usize) {
    // Merge cluster elements
    let mut merged_cluster = state.clusters[keep_idx].clone();
    merged_cluster.extend(state.clusters[remove_idx].clone());
    state.clusters[keep_idx] = merged_cluster;

    // Remove the second cluster
    state.clusters.remove(remove_idx);

    // Update distances
    update_distances(state, keep_idx, remove_idx);
}

// Update distance matrix after merging clusters
pub fn update_distances(state: &mut ClusterState, keep_idx: usize, remove_idx: usize) {
    let n_clusters = state.clusters.len();
    let mut new_distances = vec![vec![0.0; n_clusters]; n_clusters];

    // Copy distances that don't involve the merged clusters
    for i in 0..n_clusters {
        for j in 0..n_clusters {
            if i == j {
                new_distances[i][j] = 0.0;
                continue;
            }

            let old_i = if i >= remove_idx { i + 1 } else { i };
            let old_j = if j >= remove_idx { j + 1 } else { j };

            if old_i != keep_idx && old_i != remove_idx && old_j != keep_idx && old_j != remove_idx {
                // Just copy the distance
                new_distances[i][j] = state.distances[old_i][old_j];
            }
        }
    }

    // Calculate new distances for the merged cluster
    for i in 0..n_clusters {
        if i == keep_idx {
            continue; // Skip self-distance
        }

        let old_i = if i >= remove_idx { i + 1 } else { i };

        let new_dist = calculate_new_distance(
            &state.method,
            keep_idx,
            remove_idx,
            old_i,
            &state.clusters,
            &state.distances
        );

        new_distances[keep_idx][i] = new_dist;
        new_distances[i][keep_idx] = new_dist; // Ensure symmetry
    }

    // Update the state's distance matrix
    state.distances = new_distances;
}

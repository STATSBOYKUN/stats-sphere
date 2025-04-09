// cluster_method.rs
use crate::hierarchical::models::{ config::ClusMethod, result::ClusterState };
use nalgebra::DMatrix;

// Find the two closest clusters and returns their indices and distance
pub fn find_closest_clusters(state: &ClusterState) -> Option<(usize, usize, f64)> {
    let n_clusters = state.clusters.len();
    if n_clusters < 2 {
        return None;
    }

    // Convert distances to DMatrix for better operations
    let mut distances_mat = DMatrix::from_element(n_clusters, n_clusters, f64::MAX);
    for i in 0..n_clusters {
        for j in 0..n_clusters {
            if i != j {
                distances_mat[(i, j)] = state.distances[i][j];
            }
        }
    }

    // Find minimum value and its indices
    let mut min_distance = f64::MAX;
    let mut closest_pair = None;

    for i in 0..n_clusters {
        for j in i + 1..n_clusters {
            let distance = distances_mat[(i, j)];
            if distance < min_distance {
                min_distance = distance;
                closest_pair = Some((i, j, distance));
            }
        }
    }

    closest_pair
}

// Calculate new distance between merged cluster and other clusters
pub fn calculate_new_distance(
    method: &ClusMethod,
    n_keep: usize,
    n_remove: usize,
    n_other: usize,
    d_keep_other: f64,
    d_remove_other: f64,
    d_keep_remove: f64
) -> f64 {
    // Convert to float for calculations
    let n_keep = n_keep as f64;
    let n_remove = n_remove as f64;
    let n_other = n_other as f64;

    match method {
        ClusMethod::AverageBetweenGroups => {
            (n_keep * d_keep_other + n_remove * d_remove_other) / (n_keep + n_remove)
        }
        ClusMethod::AverageWithinGroups => { (d_keep_other + d_remove_other) / 2.0 }
        ClusMethod::SingleLinkage => { d_keep_other.min(d_remove_other) }
        ClusMethod::CompleteLinkage => { d_keep_other.max(d_remove_other) }
        ClusMethod::Centroid => {
            let numerator =
                n_keep * d_keep_other +
                n_remove * d_remove_other -
                (n_keep * n_remove * d_keep_remove) / (n_keep + n_remove);
            numerator / (n_keep + n_remove)
        }
        ClusMethod::Median => { (d_keep_other + d_remove_other) / 2.0 - d_keep_remove / 4.0 }
        ClusMethod::Ward => {
            let n_total = n_keep + n_remove;
            ((n_other + n_keep) * d_keep_other +
                (n_other + n_remove) * d_remove_other -
                n_other * d_keep_remove) /
                (n_total + n_other)
        }
    }
}

// Merge clusters and update the cluster state
pub fn merge_clusters(state: &mut ClusterState, keep_idx: usize, remove_idx: usize) {
    // Merge cluster elements
    let mut merged_cluster = state.clusters[keep_idx].clone();
    merged_cluster.extend(state.clusters[remove_idx].clone());
    state.clusters[keep_idx] = merged_cluster;

    state.clusters.remove(remove_idx);

    // Update distances
    update_distances(state, keep_idx, remove_idx);
}

// Update distance matrix after merging clusters
pub fn update_distances(state: &mut ClusterState, keep_idx: usize, remove_idx: usize) {
    // Clone necessary data to avoid borrowing conflicts
    let method = state.method.clone();
    let n_clusters_original = state.clusters.len() + 1; // +1 because we've already removed a cluster

    // Get cluster sizes before any modifications
    let cluster_sizes: Vec<usize> = state.clusters
        .iter()
        .map(|c| c.len())
        .collect();
    let remove_cluster_size = state.clusters[keep_idx].len() - cluster_sizes[keep_idx]; // Size of the removed cluster

    // Store original distances for calculation (only the ones we need)
    let mut original_distances = Vec::new();
    for i in 0..n_clusters_original {
        if i != remove_idx {
            let old_i = if i > remove_idx { i - 1 } else { i };
            original_distances.push((i, state.distances[old_i].clone()));
        }
    }

    // Create new distance matrix
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

            // Find distances in our original copies
            if old_i != keep_idx && old_i != remove_idx && old_j != keep_idx && old_j != remove_idx {
                // Find the correct original distance from our stored copies
                let dist_i = &original_distances
                    .iter()
                    .find(|(idx, _)| *idx == old_i)
                    .unwrap().1;
                new_distances[i][j] = dist_i[old_j];
            }
        }
    }

    // Calculate new distances for the merged cluster
    for i in 0..n_clusters {
        if i == keep_idx {
            continue; // Skip self-distance
        }

        let old_i = if i >= remove_idx { i + 1 } else { i };

        // Get original distances needed for calculation
        let keep_other_dist = if
            let Some((_, dists)) = original_distances.iter().find(|(idx, _)| *idx == keep_idx)
        {
            dists[old_i]
        } else {
            0.0
        };

        let remove_other_dist = if
            let Some((_, dists)) = original_distances.iter().find(|(idx, _)| *idx == remove_idx)
        {
            dists[old_i]
        } else {
            0.0
        };

        let keep_remove_dist = if
            let Some((_, dists)) = original_distances.iter().find(|(idx, _)| *idx == keep_idx)
        {
            dists[remove_idx]
        } else {
            0.0
        };

        // Calculate new distance based on the method
        let new_dist = calculate_new_distance(
            &method,
            cluster_sizes[keep_idx],
            remove_cluster_size,
            cluster_sizes[if old_i >= remove_idx { old_i - 1 } else { old_i }],
            keep_other_dist,
            remove_other_dist,
            keep_remove_dist
        );

        new_distances[keep_idx][i] = new_dist;
        new_distances[i][keep_idx] = new_dist; // Ensure symmetry
    }

    // Update the state's distance matrix
    state.distances = new_distances;
}

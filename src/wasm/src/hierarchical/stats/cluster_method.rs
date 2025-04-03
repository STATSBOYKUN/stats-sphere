use nalgebra::{ max, min };

use crate::hierarchical::models::{ config::ClusMethod, result::ClusterState };

// Find the two closest clusters
pub fn find_closest_clusters(state: &ClusterState) -> Option<(usize, usize, f64)> {
    let mut min_distance = f64::MAX;
    let mut closest_pair = None;

    for i in 0..state.clusters.len() {
        for j in i + 1..state.clusters.len() {
            let distance = state.distances[i][j];
            if distance < min_distance {
                min_distance = distance;
                closest_pair = Some((i, j, distance));
            }
        }
    }

    closest_pair
}

// Function to calculate the distance between two clusters based on the clustering method
pub fn cluster_method(
    method: &ClusMethod,
    clusters: &[Vec<usize>],
    keep_cluster: usize,
    other_cluster: usize,
    remove_cluster: usize,
    distances: &[Vec<f64>]
) -> f64 {
    match method {
        ClusMethod::AverageBetweenGroups => {
            // Average linkage between groups
            let n1 = clusters[keep_cluster].len();
            let n2 = clusters[other_cluster].len();

            // Weight by group sizes
            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let d1 = distances[i][j];

            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let d2 = distances[i][j];

            ((n1 as f64) * d1 + (n2 as f64) * d2) / ((n1 + n2) as f64)
        }
        ClusMethod::SingleLinkage => {
            // Nearest neighbor (minimum distance)
            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let d1 = distances[i][j];

            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let d2 = distances[i][j];

            d1.min(d2)
        }
        ClusMethod::CompleteLinkage => {
            // Furthest neighbor (maximum distance)
            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let d1 = distances[i][j];

            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let d2 = distances[i][j];

            d1.max(d2)
        }
        ClusMethod::Ward => {
            // Ward's method - minimize the increase in error sum of squares
            let nk = clusters[keep_cluster].len() as f64;
            let no = clusters[other_cluster].len() as f64;
            let nr = clusters[remove_cluster].len() as f64;

            // i_k,o
            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let dko = distances[i][j];

            // i_r,o
            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let dro = distances[i][j];

            // i_k,r
            let i = min(keep_cluster, remove_cluster);
            let j = max(keep_cluster, remove_cluster);
            let dkr = distances[i][j];

            ((nk + no) * dko + (nk + nr) * dkr - nk * dro) / (nk + no + nr)
        }
        ClusMethod::Centroid => {
            // Centroid method
            let nk = clusters[keep_cluster].len() as f64;
            let no = clusters[other_cluster].len() as f64;
            let nr = clusters[remove_cluster].len() as f64;

            // i_k,o
            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let dko = distances[i][j];

            // i_r,o
            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let dro = distances[i][j];

            // i_k,r
            let i = min(keep_cluster, remove_cluster);
            let j = max(keep_cluster, remove_cluster);
            let dkr = distances[i][j];

            (nk * dko + nr * dro - (nk * nr * dkr) / (nk + nr)) / (nk + nr)
        }
        ClusMethod::Median => {
            // Median method
            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let dko = distances[i][j];

            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let dro = distances[i][j];

            let i = min(keep_cluster, remove_cluster);
            let j = max(keep_cluster, remove_cluster);
            let dkr = distances[i][j];

            (dko + dro) / 2.0 - dkr / 4.0
        }
        _ => {
            // Default to average linkage
            let n1 = clusters[keep_cluster].len();
            let n2 = clusters[other_cluster].len();

            let i = min(keep_cluster, other_cluster);
            let j = max(keep_cluster, other_cluster);
            let d1 = distances[i][j];

            let i = min(remove_cluster, other_cluster);
            let j = max(remove_cluster, other_cluster);
            let d2 = distances[i][j];

            ((n1 as f64) * d1 + (n2 as f64) * d2) / ((n1 + n2) as f64)
        }
    }
}

// Merge two clusters and update distances
pub fn merge_clusters(
    state: &mut ClusterState,
    i: usize,
    j: usize,
    coefficient: f64
) -> (usize, usize) {
    // Ensure i < j for consistent ordering
    let (cluster1, cluster2) = if i < j { (i, j) } else { (j, i) };

    // Merge clusters
    let mut merged_cluster = state.clusters[cluster1].clone();
    merged_cluster.extend(state.clusters[cluster2].clone());

    // Remove the second cluster first to avoid indexing issues
    state.clusters.remove(cluster2);
    // Replace the first cluster with the merged one
    state.clusters[cluster1] = merged_cluster;

    // Update distances
    update_distances(state, cluster1, cluster2);

    (cluster1, cluster2)
}

// Update distances after merging clusters
pub fn update_distances(state: &mut ClusterState, keep_cluster: usize, remove_cluster: usize) {
    let n_clusters = state.clusters.len();

    // Copy distances for the new cluster
    let mut new_distances = Vec::with_capacity(n_clusters);

    for i in 0..n_clusters {
        if i == keep_cluster {
            // Distance to itself is 0
            new_distances.push(0.0);
        } else if i < remove_cluster {
            // Calculate new distance using cluster method
            let new_dist = cluster_method(
                &state.method,
                &state.clusters,
                keep_cluster,
                i,
                remove_cluster,
                &state.distances
            );
            new_distances.push(new_dist);
        } else if i > remove_cluster {
            // Calculate new distance using cluster method for indices adjusted after removal
            let new_dist = cluster_method(
                &state.method,
                &state.clusters,
                keep_cluster,
                i,
                remove_cluster,
                &state.distances
            );
            new_distances.push(new_dist);
        }
    }

    // Remove the row and column for the removed cluster
    for row in &mut state.distances {
        if row.len() > remove_cluster {
            row.remove(remove_cluster);
        }
    }
    state.distances.remove(remove_cluster);

    // Update distances for the kept cluster
    for (i, dist) in new_distances.iter().enumerate() {
        if i < keep_cluster {
            state.distances[i][keep_cluster] = *dist;
        } else if i > keep_cluster {
            state.distances[keep_cluster][i] = *dist;
        }
    }
}

use std::collections::HashMap;

use crate::twostep::models::result::CFEntry;

use super::core::{ calculate_cluster_distance, calculate_min_intercluster_distance };

// Hierarchical clustering to group sub-clusters into final clusters
pub fn hierarchical_clustering(
    sub_clusters: &[CFEntry],
    num_clusters: usize,
    use_euclidean: bool
) -> Vec<usize> {
    let n = sub_clusters.len();

    if n <= num_clusters {
        // If fewer sub-clusters than requested clusters, return identity mapping
        return (0..n).collect();
    }

    // Initialize each sub-cluster as its own cluster
    let mut current_clusters: Vec<Vec<usize>> = (0..n).map(|i| vec![i]).collect();
    let mut cluster_assignments = vec![0; n];

    // While we have more clusters than requested
    while current_clusters.len() > num_clusters {
        let mut min_distance = f64::MAX;
        let mut merge_i = 0;
        let mut merge_j = 0;

        // Find the two closest clusters
        for i in 0..current_clusters.len() {
            for j in i + 1..current_clusters.len() {
                let mut cluster_distance = 0.0;
                let mut pair_count = 0;

                // Calculate average distance between all pairs
                for &sc_i in &current_clusters[i] {
                    for &sc_j in &current_clusters[j] {
                        cluster_distance += calculate_cluster_distance(
                            &sub_clusters[sc_i],
                            &sub_clusters[sc_j],
                            use_euclidean
                        );
                        pair_count += 1;
                    }
                }

                // Average distance
                if pair_count > 0 {
                    cluster_distance /= pair_count as f64;

                    if cluster_distance < min_distance {
                        min_distance = cluster_distance;
                        merge_i = i;
                        merge_j = j;
                    }
                }
            }
        }

        // Merge the two closest clusters
        let mut merged = current_clusters[merge_i].clone();
        merged.extend(current_clusters[merge_j].clone());

        // Remove the second cluster first (higher index)
        current_clusters.remove(merge_j);
        // Then remove the first one (lower index)
        current_clusters.remove(merge_i);
        // Add the merged cluster
        current_clusters.push(merged);
    }

    // Assign final cluster IDs
    for (cluster_id, cluster) in current_clusters.iter().enumerate() {
        for &sc_idx in cluster {
            cluster_assignments[sc_idx] = cluster_id;
        }
    }

    cluster_assignments
}

// Determine optimal number of clusters using BIC/AIC
pub fn determine_optimal_clusters(
    sub_clusters: &[CFEntry],
    max_clusters: i32,
    use_bic: bool,
    use_euclidean: bool
) -> i32 {
    // Limit max clusters to the number of sub-clusters, use config.main.max_cluster
    let max_k = max_clusters.min(sub_clusters.len() as i32);

    if max_k <= 1 {
        return 1;
    }

    // Calculate BIC/AIC for different numbers of clusters
    let mut bic_values = Vec::new();
    let mut aic_values = Vec::new();
    let mut bic_changes = Vec::new();
    let mut aic_changes = Vec::new();
    let mut distance_ratios = Vec::new();

    for k in 1..=max_k {
        // Temporarily cluster sub-clusters into k clusters
        let cluster_assignments = hierarchical_clustering(sub_clusters, k as usize, false);

        // Calculate both criteria
        let (bic, aic) = calculate_information_criteria(sub_clusters, &cluster_assignments, k);

        bic_values.push(bic);
        aic_values.push(aic);

        if bic_values.len() > 1 {
            let bic_change = bic_values[bic_values.len() - 2] - bic;
            bic_changes.push(bic_change);
        }

        if aic_values.len() > 1 {
            let aic_change = aic_values[aic_values.len() - 2] - aic;
            aic_changes.push(aic_change);
        }

        // Calculate minimum distance between clusters for distance ratio
        if k > 1 {
            let min_dist_k = calculate_min_intercluster_distance(
                sub_clusters,
                &cluster_assignments,
                use_euclidean
            );

            let prev_assignments = hierarchical_clustering(sub_clusters, (k - 1) as usize, false);

            let min_dist_prev = calculate_min_intercluster_distance(
                sub_clusters,
                &prev_assignments,
                use_euclidean
            );

            if min_dist_prev > 0.0 {
                distance_ratios.push((k, min_dist_k / min_dist_prev));
            } else {
                distance_ratios.push((k, 1.0));
            }
        }
    }

    // Find optimal number of clusters based on criterion
    if use_bic {
        // Check BIC changes
        if bic_changes.is_empty() {
            return 1;
        }

        // First stage: Find initial estimate using ratio of BIC changes
        let first_change = bic_changes[0];
        if first_change < 0.0 {
            return 1;
        }

        let mut initial_k = 1;
        const BIC_CHANGE_THRESHOLD: f64 = 0.04;
        for (i, &change) in bic_changes.iter().enumerate() {
            let ratio = change / first_change;
            if ratio < BIC_CHANGE_THRESHOLD {
                initial_k = i + 2; // +1 for 1-based, +1 for the next cluster after change
                break;
            }
        }

        // Second stage: Find largest relative increase in distance
        refine_optimal_clusters(initial_k as i32, &distance_ratios)
    } else {
        // Use AIC changes
        if aic_changes.is_empty() {
            return 1;
        }

        // First stage: Find initial estimate using ratio of AIC changes
        let first_change = aic_changes[0];
        if first_change < 0.0 {
            return 1;
        }

        let mut initial_k = 1;
        const BIC_CHANGE_THRESHOLD: f64 = 0.4;
        for (i, &change) in aic_changes.iter().enumerate() {
            let ratio = change / first_change;
            if ratio < BIC_CHANGE_THRESHOLD {
                // Using same threshold for simplicity
                initial_k = i + 2;
                break;
            }
        }

        // Second stage: Find largest relative increase in distance
        refine_optimal_clusters(initial_k as i32, &distance_ratios)
    }
}

// Helper function to refine optimal clusters using distance ratios
pub fn refine_optimal_clusters(initial_k: i32, distance_ratios: &[(i32, f64)]) -> i32 {
    // Sort by ratio descending
    let mut sorted_ratios = distance_ratios.to_vec();
    sorted_ratios.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    // Check if largest ratio is significantly larger than second largest
    if sorted_ratios.len() >= 2 && sorted_ratios[0].1 > sorted_ratios[1].1 * 1.15 {
        sorted_ratios[0].0
    } else if sorted_ratios.len() >= 2 {
        // Choose larger number of clusters among top two ratios
        sorted_ratios[0].0.max(sorted_ratios[1].0)
    } else if !sorted_ratios.is_empty() {
        sorted_ratios[0].0
    } else {
        initial_k
    }
}

// Calculate both BIC and AIC for clustering
pub fn calculate_information_criteria(
    sub_clusters: &[CFEntry],
    cluster_assignments: &[usize],
    num_clusters: i32
) -> (f64, f64) {
    // Count dimensions
    let num_continuous = if !sub_clusters.is_empty() {
        sub_clusters[0].sum_values.len()
    } else {
        0
    };
    let num_categorical = if !sub_clusters.is_empty() {
        sub_clusters[0].category_counts.len()
    } else {
        0
    };

    // Calculate log-likelihood
    let mut log_likelihood = 0.0;

    // For each cluster
    let k = num_clusters as usize;
    let mut cluster_counts = vec![0; k];

    // Count cases in each cluster
    for (sc_idx, &cluster_id) in cluster_assignments.iter().enumerate() {
        cluster_counts[cluster_id] += sub_clusters[sc_idx].n;
    }

    // Calculate log-likelihood by cluster
    for cluster_id in 0..k {
        let mut cluster_ll = 0.0;

        // Calculate cluster statistics
        let mut cluster_means = vec![0.0; num_continuous];
        let mut cluster_vars = vec![0.0; num_continuous];
        let mut cat_probs = vec![HashMap::new(); num_categorical];

        // First pass: calculate means
        for (sc_idx, &sc_cluster) in cluster_assignments.iter().enumerate() {
            if sc_cluster != cluster_id {
                continue;
            }

            let sc = &sub_clusters[sc_idx];

            for j in 0..num_continuous {
                cluster_means[j] += sc.sum_values[j];
            }

            for j in 0..num_categorical {
                for (cat, &count) in &sc.category_counts[j] {
                    let entry = cat_probs[j].entry(cat.clone()).or_insert(0);
                    *entry += count;
                }
            }
        }

        let n = cluster_counts[cluster_id] as f64;
        if n > 0.0 {
            for j in 0..num_continuous {
                cluster_means[j] /= n;
            }
        }

        // Second pass: calculate variances
        for (sc_idx, &sc_cluster) in cluster_assignments.iter().enumerate() {
            if sc_cluster != cluster_id {
                continue;
            }

            let sc = &sub_clusters[sc_idx];

            for j in 0..num_continuous {
                let mean_diff = sc.mean(j) - cluster_means[j];
                cluster_vars[j] += (sc.n as f64) * mean_diff.powi(2);
            }
        }

        for j in 0..num_continuous {
            if n > 1.0 {
                cluster_vars[j] = (cluster_vars[j] / n).max(1e-10);
            } else {
                cluster_vars[j] = 1.0; // Default for single-case clusters
            }
        }

        // Calculate log-likelihood contribution
        for j in 0..num_continuous {
            cluster_ll -= (n * (2.0 * std::f64::consts::PI * cluster_vars[j]).ln()) / 2.0;
        }

        for j in 0..num_categorical {
            for (_, &count) in &cat_probs[j] {
                let prob = (count as f64) / n;
                if prob > 0.0 {
                    cluster_ll += (count as f64) * prob.ln();
                }
            }
        }

        log_likelihood += cluster_ll;
    }

    // Calculate penalty term
    let total_cases = sub_clusters
        .iter()
        .map(|sc| sc.n)
        .sum::<i32>() as f64;
    let num_params =
        (k as f64) *
        // For continuous variables: means and variances
        (2.0 * (num_continuous as f64) +
            (
                // For categorical variables: probabilities (minus 1 per variable for sum-to-one constraint)
                sub_clusters
                    .iter()
                    .flat_map(|sc| sc.category_counts.iter())
                    .map(|cats| cats.len().max(1) - 1)
                    .sum::<usize>() as f64
            ));

    // Calculate BIC and AIC
    let bic = -2.0 * log_likelihood + num_params * total_cases.ln();
    let aic = -2.0 * log_likelihood + 2.0 * num_params;

    (bic, aic)
}

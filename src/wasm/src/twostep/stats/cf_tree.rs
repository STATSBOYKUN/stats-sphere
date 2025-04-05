use std::collections::HashMap;

use rand::{ seq::SliceRandom, thread_rng };

use crate::twostep::models::result::{ CFEntry, CFNode };

use super::core::{
    calculate_cluster_distance,
    calculate_euclidean_distance,
    calculate_log_likelihood_distance,
};

impl CFEntry {
    pub fn new(num_continuous: usize, num_categorical: usize) -> Self {
        CFEntry {
            n: 0,
            sum_values: vec![0.0; num_continuous],
            sum_squared: vec![0.0; num_continuous],
            category_counts: vec![HashMap::new(); num_categorical],
            distance: 0.0,
            cases: Vec::new(),
        }
    }

    pub fn mean(&self, idx: usize) -> f64 {
        if self.n > 0 { self.sum_values[idx] / (self.n as f64) } else { 0.0 }
    }

    pub fn variance(&self, idx: usize) -> f64 {
        if self.n > 1 {
            let mean = self.mean(idx);
            self.sum_squared[idx] / (self.n as f64) - mean * mean
        } else {
            0.0
        }
    }

    pub fn add_case(&mut self, case_idx: usize, data_row: &[f64], cat_row: &[String]) {
        self.n += 1;
        self.cases.push(case_idx);

        // Update continuous variable statistics
        for (i, &val) in data_row.iter().enumerate() {
            if i < self.sum_values.len() {
                self.sum_values[i] += val;
                self.sum_squared[i] += val * val;
            }
        }

        // Update categorical variable counts
        for (i, cat) in cat_row.iter().enumerate() {
            if i < self.category_counts.len() {
                let count = self.category_counts[i].entry(cat.clone()).or_insert(0);
                *count += 1;
            }
        }
    }
}

impl CFNode {
    pub fn new(is_leaf: bool) -> Self {
        CFNode {
            entries: Vec::new(),
            is_leaf: is_leaf,
            children: Vec::new(),
        }
    }
}

// Build CF Tree for pre-clustering
pub fn build_cf_tree(
    data_matrix: &[Vec<f64>],
    categorical_matrix: &[Vec<String>],
    use_euclidean: bool,
    handle_noise: bool,
    noise_threshold: f64,
    max_branch: i32,
    max_depth: i32,
    initial_threshold: f64
) -> Vec<CFEntry> {
    let num_continuous = if !data_matrix.is_empty() { data_matrix[0].len() } else { 0 };
    let num_categorical = if !categorical_matrix.is_empty() {
        categorical_matrix[0].len()
    } else {
        0
    };

    // For simplicity in this implementation, we'll create sub-clusters directly
    // rather than building a full CF tree structure

    // Shuffle data indices to minimize order effects
    let mut indices: Vec<usize> = (0..data_matrix.len()).collect();
    indices.shuffle(&mut thread_rng());

    let mut sub_clusters = Vec::new();

    // Initial threshold
    let mut threshold = initial_threshold;

    // Calculate max nodes possible based on config
    let max_branches = max_branch as usize;
    let max_depth = max_depth as i32;
    let max_nodes = if max_branches > 1 && max_depth > 0 {
        (max_branches.pow((max_depth as u32) + 1) - 1) / (max_branches - 1)
    } else {
        100 // Default if invalid config
    };

    for &idx in &indices {
        let mut assigned = false;

        // Try to assign to existing sub-cluster
        for sc in &mut sub_clusters {
            let distance = if use_euclidean {
                calculate_euclidean_distance(&data_matrix[idx], sc, num_continuous)
            } else {
                calculate_log_likelihood_distance(
                    &data_matrix[idx],
                    &categorical_matrix[idx],
                    sc,
                    num_continuous,
                    num_categorical
                )
            };

            if distance <= threshold {
                sc.add_case(idx, &data_matrix[idx], &categorical_matrix[idx]);
                assigned = true;
                break;
            }
        }

        // Create new sub-cluster if not assigned
        if !assigned {
            let mut new_sc = CFEntry::new(num_continuous, num_categorical);
            new_sc.add_case(idx, &data_matrix[idx], &categorical_matrix[idx]);
            sub_clusters.push(new_sc);

            // Check if we need to increase threshold (simplified CF tree rebuild)
            if sub_clusters.len() > max_nodes {
                // Increase threshold and merge some sub-clusters
                threshold *= 1.5;
                sub_clusters = merge_subclusters(&sub_clusters, threshold, use_euclidean);
            }
        }
    }

    // Handle noise if enabled
    if handle_noise && !sub_clusters.is_empty() {
        // Find largest sub-cluster
        let max_size = sub_clusters
            .iter()
            .map(|sc| sc.n)
            .max()
            .unwrap_or(1) as f64;
        let min_size_threshold = (max_size * noise_threshold).max(1.0) as i32;

        // Mark small sub-clusters as noise and potentially reassign
        let mut noise_cases = Vec::new();
        sub_clusters.retain(|sc| {
            if sc.n < min_size_threshold {
                noise_cases.extend(sc.cases.clone());
                false
            } else {
                true
            }
        });

        // Try to reassign noise cases
        for &idx in &noise_cases {
            let mut min_distance = f64::MAX;
            let mut best_cluster = 0;

            for (i, sc) in sub_clusters.iter().enumerate() {
                let distance = if use_euclidean {
                    calculate_euclidean_distance(&data_matrix[idx], sc, num_continuous)
                } else {
                    calculate_log_likelihood_distance(
                        &data_matrix[idx],
                        &categorical_matrix[idx],
                        sc,
                        num_continuous,
                        num_categorical
                    )
                };

                if distance < min_distance {
                    min_distance = distance;
                    best_cluster = i;
                }
            }

            // Reassign case if we found a cluster
            if !sub_clusters.is_empty() {
                sub_clusters[best_cluster].add_case(
                    idx,
                    &data_matrix[idx],
                    &categorical_matrix[idx]
                );
            }
        }
    }

    sub_clusters
}

// Merge sub-clusters to reduce their number
fn merge_subclusters(
    sub_clusters: &[CFEntry],
    threshold: f64,
    use_euclidean: bool
) -> Vec<CFEntry> {
    let mut result = Vec::new();
    let mut processed = vec![false; sub_clusters.len()];

    for i in 0..sub_clusters.len() {
        if processed[i] {
            continue;
        }

        let mut merged = sub_clusters[i].clone();
        processed[i] = true;

        // Find other clusters to merge with this one
        for j in i + 1..sub_clusters.len() {
            if processed[j] {
                continue;
            }

            let distance = calculate_cluster_distance(&merged, &sub_clusters[j], use_euclidean);

            if distance <= threshold {
                // Merge j into i
                merged.n += sub_clusters[j].n;
                for k in 0..merged.sum_values.len() {
                    merged.sum_values[k] += sub_clusters[j].sum_values[k];
                    merged.sum_squared[k] += sub_clusters[j].sum_squared[k];
                }

                for k in 0..merged.category_counts.len() {
                    for (cat, count) in &sub_clusters[j].category_counts[k] {
                        let entry = merged.category_counts[k].entry(cat.clone()).or_insert(0);
                        *entry += count;
                    }
                }

                merged.cases.extend(sub_clusters[j].cases.clone());
                processed[j] = true;
            }
        }

        result.push(merged);
    }

    result
}

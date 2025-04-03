use std::collections::HashMap;

use crate::kmeans::models::{
    config::ClusterConfig,
    result::{ IterationHistory, IterationStep, ProcessedData },
};

use super::core::{
    convert_map_to_matrix,
    find_closest_cluster,
    initialize_clusters,
    min_distance_between_centers,
};

pub fn generate_iteration_history(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<IterationHistory, String> {
    let num_clusters = config.main.cluster as usize;
    let max_iterations = config.iterate.maximum_iterations;
    let convergence_criterion = config.iterate.convergence_criterion;
    let use_running_means = config.iterate.use_running_means;

    let initial_centers_result = initialize_clusters(data, config)?;
    let mut current_centers = convert_map_to_matrix(
        &initial_centers_result.centers,
        &data.variables
    );

    let (min_center_dist, _, _) = min_distance_between_centers(&current_centers);
    let min_change_threshold = convergence_criterion * min_center_dist;

    let mut iterations = Vec::new();
    let mut convergence_note = None;

    for iteration in 1..=max_iterations {
        let mut new_centers = vec![vec![0.0; data.variables.len()]; num_clusters];
        let mut cluster_counts = vec![0; num_clusters];
        let mut changes = HashMap::new();

        for case in &data.data_matrix {
            let closest = find_closest_cluster(case, &current_centers);

            if use_running_means {
                cluster_counts[closest] += 1;
                let count = cluster_counts[closest] as f64;

                for j in 0..case.len() {
                    new_centers[closest][j] =
                        (new_centers[closest][j] * (count - 1.0) + case[j]) / count;
                }
            } else {
                cluster_counts[closest] += 1;

                for j in 0..case.len() {
                    new_centers[closest][j] += case[j];
                }
            }
        }

        if !use_running_means {
            for i in 0..num_clusters {
                if cluster_counts[i] > 0 {
                    for j in 0..data.variables.len() {
                        new_centers[i][j] /= cluster_counts[i] as f64;
                    }
                }
            }
        }

        let mut max_change = 0.0;

        for i in 0..num_clusters {
            let mut cluster_change = 0.0;

            for j in 0..data.variables.len() {
                let change = (new_centers[i][j] - current_centers[i][j]).abs();
                if change > cluster_change {
                    cluster_change = change;
                }
            }

            changes.insert(format!("{}", i + 1), cluster_change);

            if cluster_change > max_change {
                max_change = cluster_change;
            }
        }

        iterations.push(IterationStep {
            iteration,
            changes,
        });

        if max_change <= min_change_threshold {
            convergence_note = Some(
                format!(
                    "Convergence achieved due to no or small change in cluster centers. The maximum absolute coordinate change for any center is {:.3}. The current iteration is {}. The minimum distance between initial centers is {:.3}.",
                    max_change,
                    iteration,
                    min_center_dist
                )
            );
            break;
        }

        current_centers = new_centers;
    }

    if convergence_note.is_none() {
        convergence_note = Some(
            format!("Maximum number of iterations ({}) reached without convergence.", max_iterations)
        );
    }

    Ok(IterationHistory {
        iterations,
        convergence_note,
    })
}

use std::collections::HashMap;

use crate::kmeans::models::{
    config::ClusterConfig,
    result::{ DistancesBetweenCenters, FinalClusterCenters, ProcessedData },
};

use super::core::{
    convert_map_to_matrix,
    euclidean_distance,
    find_closest_cluster,
    initialize_clusters,
    min_distance_between_centers,
};

pub fn generate_final_cluster_centers(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<FinalClusterCenters, String> {
    let num_clusters = config.main.cluster as usize;
    let max_iterations = config.iterate.maximum_iterations;
    let convergence_criterion = config.iterate.convergence_criterion;

    let initial_centers_result = initialize_clusters(data, config)?;
    let mut current_centers = convert_map_to_matrix(
        &initial_centers_result.centers,
        &data.variables
    );

    let (min_center_dist, _, _) = min_distance_between_centers(&current_centers);
    let min_change_threshold = convergence_criterion * min_center_dist;

    for _ in 1..=max_iterations {
        let mut new_centers = vec![vec![0.0; data.variables.len()]; num_clusters];
        let mut cluster_counts = vec![0; num_clusters];
        let mut max_change = 0.0;

        for case in &data.data_matrix {
            let closest = find_closest_cluster(case, &current_centers);

            cluster_counts[closest] += 1;

            for j in 0..case.len() {
                new_centers[closest][j] += case[j];
            }
        }

        for i in 0..num_clusters {
            if cluster_counts[i] > 0 {
                for j in 0..data.variables.len() {
                    new_centers[i][j] /= cluster_counts[i] as f64;
                }
            }
        }

        for i in 0..num_clusters {
            for j in 0..data.variables.len() {
                let change = (new_centers[i][j] - current_centers[i][j]).abs();
                if change > max_change {
                    max_change = change;
                }
            }
        }

        if max_change <= min_change_threshold {
            break;
        }

        current_centers = new_centers;
    }

    let mut centers_map = HashMap::new();

    for (i, var) in data.variables.iter().enumerate() {
        let mut var_values = Vec::new();

        for j in 0..num_clusters {
            var_values.push(current_centers[j][i]);
        }

        centers_map.insert(var.clone(), var_values);
    }

    Ok(FinalClusterCenters { centers: centers_map })
}

pub fn calculate_distances_between_centers(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<DistancesBetweenCenters, String> {
    let num_clusters = config.main.cluster as usize;

    let final_centers_result = generate_final_cluster_centers(data, config)?;
    let final_centers = convert_map_to_matrix(&final_centers_result.centers, &data.variables);

    let mut distances = vec![vec![0.0; num_clusters]; num_clusters];

    for i in 0..num_clusters {
        for j in 0..num_clusters {
            distances[i][j] = if i == j {
                0.0
            } else {
                euclidean_distance(&final_centers[i], &final_centers[j])
            };
        }
    }

    Ok(DistancesBetweenCenters { distances })
}

use std::collections::HashMap;

use crate::kmeans::models::{
    config::ClusterConfig,
    result::{ InitialClusterCenters, ProcessedData },
};

use super::core::{
    euclidean_distance,
    find_nearest_cluster,
    find_second_closest_cluster,
    min_distance_between_centers,
    min_distance_from_cluster,
};

pub fn initialize_clusters(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<InitialClusterCenters, String> {
    let num_clusters = config.main.cluster as usize;

    if num_clusters <= 0 {
        return Err("Number of clusters must be positive".to_string());
    }

    if data.data_matrix.len() < num_clusters {
        return Err(
            format!(
                "Not enough data points ({}) for requested clusters ({})",
                data.data_matrix.len(),
                num_clusters
            )
        );
    }

    let mut initial_centers = vec![vec![0.0; data.variables.len()]; num_clusters];

    if config.main.read_initial {
        for i in 0..num_clusters {
            initial_centers[i] = data.data_matrix[i].clone();
        }
    } else {
        for i in 0..num_clusters {
            initial_centers[i] = data.data_matrix[i].clone();
        }

        for k in num_clusters..data.data_matrix.len() {
            let x_k = &data.data_matrix[k];

            let (closest, min_dist) = find_nearest_cluster(x_k, &initial_centers);
            let second_closest = find_second_closest_cluster(x_k, &initial_centers, closest);

            let (min_center_dist, m, n) = min_distance_between_centers(&initial_centers);

            if min_dist > min_center_dist {
                if
                    euclidean_distance(x_k, &initial_centers[m]) >
                    euclidean_distance(x_k, &initial_centers[n])
                {
                    initial_centers[m] = x_k.clone();
                } else {
                    initial_centers[n] = x_k.clone();
                }
            } else {
                let dist_to_second = euclidean_distance(x_k, &initial_centers[second_closest]);
                let min_dist_from_closest = min_distance_from_cluster(&initial_centers, closest);

                if dist_to_second > min_dist_from_closest {
                    initial_centers[closest] = x_k.clone();
                }
            }
        }
    }

    let mut centers_map = HashMap::new();

    for (i, var) in data.variables.iter().enumerate() {
        let mut var_values = Vec::new();
        for j in 0..num_clusters {
            var_values.push(initial_centers[j][i]);
        }
        centers_map.insert(var.clone(), var_values);
    }

    Ok(InitialClusterCenters { centers: centers_map })
}

use std::collections::HashMap;

use crate::twostep::models::{
    config::ClusterConfig,
    result::{ ClusterDistribution, ClusterGroup, ClusterGroupDetails, Clusters, ProcessedData },
};

pub fn calculate_cluster_distribution(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<ClusterDistribution, String> {
    // Count number of cases in each cluster
    let mut cluster_counts = vec![0; processed_data.num_clusters as usize];

    for &cluster in &processed_data.clusters {
        if cluster < cluster_counts.len() {
            cluster_counts[cluster] += 1;
        }
    }

    let total_cases = processed_data.data_matrix.len();

    // Create cluster groups
    let mut clusters = Vec::new();

    for (i, &count) in cluster_counts.iter().enumerate() {
        let percent = ((count as f64) / (total_cases as f64)) * 100.0;

        clusters.push(ClusterGroup {
            n: count as i32,
            percent_of_combined: percent,
            percent_of_total: percent,
        });
    }

    // Create total group
    let total = ClusterGroup {
        n: total_cases as i32,
        percent_of_combined: 100.0,
        percent_of_total: 100.0,
    };

    Ok(ClusterDistribution {
        clusters,
        total,
    })
}

pub fn calculate_clusters(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<Clusters, String> {
    let mut cluster_groups = Vec::new();

    for cluster_id in 0..processed_data.num_clusters {
        let mut inputs = HashMap::new();

        // Calculate mean for each continuous variable in this cluster
        for (var_idx, var_name) in processed_data.continuous_variables.iter().enumerate() {
            let mut sum = 0.0;
            let mut count = 0;

            for (i, &cluster) in processed_data.clusters.iter().enumerate() {
                if (cluster as i32) == cluster_id {
                    sum += processed_data.data_matrix[i][var_idx];
                    count += 1;
                }
            }

            if count > 0 {
                let mean = sum / (count as f64);

                // Convert back to original scale if data was standardized
                let original_mean = if
                    config.main.to_standardized.unwrap_or(true) &&
                    !config.main.assumed_standardized.unwrap_or(false)
                {
                    mean * processed_data.std_devs[var_idx] + processed_data.means[var_idx]
                } else {
                    mean
                };

                inputs.insert(var_name.clone(), original_mean);
            }
        }

        // Count cases in this cluster
        let size = processed_data.clusters
            .iter()
            .filter(|&&c| (c as i32) == cluster_id)
            .count() as f64;
        let size_percent = (size / (processed_data.data_matrix.len() as f64)) * 100.0;

        cluster_groups.push(ClusterGroupDetails {
            label: Some(format!("Cluster {}", cluster_id + 1)),
            description: None,
            size: size_percent,
            inputs,
        });
    }

    Ok(Clusters {
        cluster_groups,
    })
}

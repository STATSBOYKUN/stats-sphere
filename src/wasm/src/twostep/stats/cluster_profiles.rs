use std::collections::HashMap;

use crate::twostep::models::{
    config::ClusterConfig,
    result::{ CategoryFrequency, CentroidData, ClusterProfiles, FrequencyData, ProcessedData },
};

pub fn calculate_cluster_profiles(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<ClusterProfiles, String> {
    let mut centroids = HashMap::new();
    let mut frequencies = HashMap::new();

    // Calculate centroids for continuous variables
    for (idx, var_name) in processed_data.continuous_variables.iter().enumerate() {
        let mut overall_sum = 0.0;
        let mut overall_sum_sq = 0.0;

        for row in &processed_data.data_matrix {
            if idx < row.len() {
                let val = row[idx];
                overall_sum += val;
                overall_sum_sq += val * val;
            }
        }

        let n = processed_data.data_matrix.len() as f64;
        let mean = overall_sum / n;
        let variance = overall_sum_sq / n - mean * mean;
        let std_dev = variance.sqrt();

        // Store combined statistics
        centroids.insert(var_name.clone(), CentroidData {
            mean,
            std_deviation: std_dev,
        });

        // Calculate cluster-specific statistics
        for cluster_id in 0..processed_data.num_clusters {
            let mut cluster_sum = 0.0;
            let mut cluster_sum_sq = 0.0;
            let mut cluster_count = 0;

            for (case_idx, &cluster) in processed_data.clusters.iter().enumerate() {
                if
                    (cluster as i32) == cluster_id &&
                    idx < processed_data.data_matrix[case_idx].len()
                {
                    let val = processed_data.data_matrix[case_idx][idx];
                    cluster_sum += val;
                    cluster_sum_sq += val * val;
                    cluster_count += 1;
                }
            }

            if cluster_count > 0 {
                let cluster_mean = cluster_sum / (cluster_count as f64);
                let cluster_variance =
                    cluster_sum_sq / (cluster_count as f64) - cluster_mean * cluster_mean;
                let cluster_std_dev = cluster_variance.sqrt();

                centroids.insert(format!("{}_cluster{}", var_name, cluster_id + 1), CentroidData {
                    mean: cluster_mean,
                    std_deviation: cluster_std_dev,
                });
            }
        }
    }

    // Calculate frequencies for categorical variables
    for (idx, var_name) in processed_data.categorical_variables.iter().enumerate() {
        if processed_data.categorical_matrix.is_empty() {
            continue;
        }

        // Overall frequencies
        let mut overall_counts = HashMap::new();
        let total_cases = processed_data.categorical_matrix.len();

        for row in &processed_data.categorical_matrix {
            if idx < row.len() {
                let cat = &row[idx];
                *overall_counts.entry(cat.clone()).or_insert(0) += 1;
            }
        }

        // Create overall frequency data
        let mut overall_freq_data = HashMap::new();
        for (cat, &count) in &overall_counts {
            overall_freq_data.insert(cat.clone(), CategoryFrequency {
                frequency: count,
                percent: ((count as f64) / (total_cases as f64)) * 100.0,
            });
        }

        frequencies.insert(var_name.clone(), FrequencyData {
            categories: overall_freq_data,
        });

        // Calculate cluster-specific frequencies
        for cluster_id in 0..processed_data.num_clusters {
            let mut cluster_counts = HashMap::new();
            let mut cluster_total = 0;

            for (case_idx, &cluster) in processed_data.clusters.iter().enumerate() {
                if
                    (cluster as i32) == cluster_id &&
                    case_idx < processed_data.categorical_matrix.len() &&
                    idx < processed_data.categorical_matrix[case_idx].len()
                {
                    let cat = &processed_data.categorical_matrix[case_idx][idx];
                    *cluster_counts.entry(cat.clone()).or_insert(0) += 1;
                    cluster_total += 1;
                }
            }

            if cluster_total > 0 {
                let mut cluster_freq_data = HashMap::new();
                for (cat, &count) in &cluster_counts {
                    cluster_freq_data.insert(cat.clone(), CategoryFrequency {
                        frequency: count,
                        percent: ((count as f64) / (cluster_total as f64)) * 100.0,
                    });
                }

                frequencies.insert(
                    format!("{}_cluster{}", var_name, cluster_id + 1),
                    FrequencyData {
                        categories: cluster_freq_data,
                    }
                );
            }
        }
    }

    Ok(ClusterProfiles {
        centroids,
        frequencies,
    })
}

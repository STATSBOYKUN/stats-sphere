use std::collections::HashMap;

use crate::twostep::models::{
    config::ClusterConfig,
    result::{ ModelSummary, ProcessedData, CFEntry },
};

use super::core::{ calculate_euclidean_distance, calculate_log_likelihood_distance };

// Calculate silhouette coefficient for cluster quality assessment
pub fn calculate_silhouette(processed_data: &ProcessedData, use_euclidean: bool) -> f64 {
    let n = processed_data.data_matrix.len();
    if n <= 1 || processed_data.num_clusters <= 1 {
        return 0.0;
    }

    let mut silhouette_sum = 0.0;
    let mut valid_cases = 0;

    // For each data point
    for i in 0..n {
        let cluster_i = processed_data.clusters[i] as i32;

        // Calculate average distance to other points in same cluster (a)
        let mut same_cluster_count = 0;
        let mut same_cluster_dist_sum = 0.0;

        // Calculate average distance to points in nearest other cluster (b)
        let mut nearest_cluster_dist = f64::MAX;
        let mut cluster_dists = HashMap::new();

        for j in 0..n {
            if i == j {
                continue;
            }

            let cluster_j = processed_data.clusters[j] as i32;

            // Create a temporary CFEntry that represents point j as a cluster
            let temp_entry = create_point_as_cfentry(&processed_data.data_matrix[j], if
                processed_data.categorical_matrix.is_empty()
            {
                &[]
            } else {
                &processed_data.categorical_matrix[j]
            });

            // Calculate distance using existing distance functions
            let distance = if use_euclidean {
                calculate_euclidean_distance(
                    &processed_data.data_matrix[i],
                    &temp_entry,
                    processed_data.data_matrix[i].len()
                )
            } else {
                calculate_log_likelihood_distance(
                    &processed_data.data_matrix[i],
                    if processed_data.categorical_matrix.is_empty() {
                        &[]
                    } else {
                        &processed_data.categorical_matrix[i]
                    },
                    &temp_entry,
                    processed_data.data_matrix[i].len(),
                    if processed_data.categorical_matrix.is_empty() {
                        0
                    } else {
                        processed_data.categorical_matrix[i].len()
                    }
                )
            };

            if cluster_i == cluster_j {
                same_cluster_dist_sum += distance;
                same_cluster_count += 1;
            } else {
                let entry = cluster_dists.entry(cluster_j).or_insert((0.0, 0));
                entry.0 += distance;
                entry.1 += 1;
            }
        }

        // Calculate a: average distance to same cluster
        let a = if same_cluster_count > 0 {
            same_cluster_dist_sum / (same_cluster_count as f64)
        } else {
            0.0
        };

        // Calculate b: average distance to nearest other cluster
        let mut b = f64::MAX;
        for (_, (dist_sum, count)) in cluster_dists {
            if count > 0 {
                let avg_dist = dist_sum / (count as f64);
                b = b.min(avg_dist);
            }
        }

        if b == f64::MAX {
            b = 0.0;
        }

        // Calculate silhouette value
        let silhouette = if a < b && a > 0.0 {
            1.0 - a / b // Classic formula when a < b
        } else if a > b && b > 0.0 {
            b / a - 1.0 // Classic formula when a > b
        } else {
            0.0 // When a = b or either is 0
        };

        silhouette_sum += silhouette;
        valid_cases += 1;
    }

    // Average silhouette
    if valid_cases > 0 {
        silhouette_sum / (valid_cases as f64)
    } else {
        0.0
    }
}

// Helper function to create a CFEntry representing a single data point
fn create_point_as_cfentry(continuous: &[f64], categorical: &[String]) -> CFEntry {
    let mut entry = CFEntry::new(continuous.len(), categorical.len());

    // Set count to 1
    entry.n = 1;

    // Set continuous values
    for i in 0..continuous.len() {
        entry.sum_values[i] = continuous[i];
        entry.sum_squared[i] = continuous[i] * continuous[i];
    }

    // Set categorical values
    for i in 0..categorical.len() {
        *entry.category_counts[i].entry(categorical[i].clone()).or_insert(0) += 1;
    }

    entry
}

// Calculate model summary (unchanged)
pub fn calculate_model_summary(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<ModelSummary, String> {
    // Count the number of input variables
    let num_inputs =
        processed_data.continuous_variables.len() + processed_data.categorical_variables.len();

    // Calculate silhouette coefficient
    let silhouette = calculate_silhouette(processed_data, config.main.euclidean);

    // Determine quality rating
    let quality = if silhouette >= 0.5 {
        "Good".to_string()
    } else if silhouette >= 0.25 {
        "Fair".to_string()
    } else {
        "Poor".to_string()
    };

    Ok(ModelSummary {
        algorithm: "TwoStep".to_string(),
        inputs: num_inputs as i32,
        clusters: processed_data.num_clusters,
        silhouette,
        quality,
    })
}

use crate::twostep::models::{
    config::ClusterConfig,
    result::{ ClusterSizeDetail, ClusterSizes, ProcessedData },
};

pub fn calculate_cluster_sizes(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<ClusterSizes, String> {
    // Count cases in each cluster
    let mut cluster_counts = vec![0; processed_data.num_clusters as usize];

    for &cluster in &processed_data.clusters {
        if cluster < cluster_counts.len() {
            cluster_counts[cluster] += 1;
        }
    }

    let total_cases = processed_data.data_matrix.len();

    // Create cluster size details
    let mut clusters = Vec::new();

    for (i, &count) in cluster_counts.iter().enumerate() {
        let percent = ((count as f64) / (total_cases as f64)) * 100.0;

        clusters.push(ClusterSizeDetail {
            cluster_number: (i + 1) as i32,
            percent_values1: percent,
            percent_values2: percent,
            v4: count as i32,
            v5: percent,
        });
    }

    Ok(ClusterSizes {
        clusters,
    })
}

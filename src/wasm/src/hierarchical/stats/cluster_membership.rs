use std::collections::HashMap;

use crate::hierarchical::models::{ config::ClusterConfig, data::AnalysisData, result::CaseCluster };

use super::generate_agglomeration_schedule;

// Perform clustering to determine cluster membership
pub fn perform_clustering(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<Vec<CaseCluster>, String> {
    // Get the agglomeration schedule
    let agglomeration = generate_agglomeration_schedule(data, config)?;

    // Determine the number of clusters to create
    let num_clusters = config.statistics.no_of_cluster.unwrap_or(2) as usize;

    // Count total number of cases
    let num_cases = data.cluster_data
        .iter()
        .flat_map(|d| d.iter())
        .count();

    // Initialize each case to its own cluster
    let mut case_cluster_ids = (0..num_cases).collect::<Vec<usize>>();

    // Process agglomeration schedule in reverse to create the desired number of clusters
    let stages = agglomeration.stages.clone();
    let num_stages_to_process = num_cases - num_clusters;

    for i in 0..num_stages_to_process {
        let stage = &stages[i];
        let (cluster1, cluster2) = stage.clusters_combined;

        // Merge clusters by assigning all cases from cluster2 to cluster1
        for case_id in 0..num_cases {
            if case_cluster_ids[case_id] == cluster2 - 1 {
                case_cluster_ids[case_id] = cluster1 - 1;
            }
        }
    }

    // Count cases in each cluster
    let mut cluster_counts = HashMap::new();
    for cluster_id in &case_cluster_ids {
        *cluster_counts.entry(*cluster_id).or_insert(0) += 1;
    }

    // Create the result
    let mut clusters = Vec::new();
    for (cluster_id, count) in cluster_counts {
        clusters.push(CaseCluster {
            name: format!("Cluster {}", cluster_id + 1),
            cluster_count: count,
        });
    }

    // Sort clusters by name
    clusters.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(clusters)
}

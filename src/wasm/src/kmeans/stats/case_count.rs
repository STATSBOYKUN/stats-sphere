use std::collections::HashMap;

use crate::kmeans::models::{ config::ClusterConfig, result::{ CaseCountTable, ProcessedData } };

use super::core::generate_cluster_membership;

pub fn generate_case_count(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<CaseCountTable, String> {
    let num_clusters = config.main.cluster as usize;

    let membership = generate_cluster_membership(data, config)?;

    let mut cluster_counts = HashMap::new();

    for i in 1..=num_clusters {
        let count = membership
            .iter()
            .filter(|m| m.cluster == (i as i32))
            .count();

        cluster_counts.insert(i.to_string(), count);
    }

    let valid = membership.len();
    let missing = 0;

    Ok(CaseCountTable {
        valid,
        missing,
        clusters: cluster_counts,
    })
}

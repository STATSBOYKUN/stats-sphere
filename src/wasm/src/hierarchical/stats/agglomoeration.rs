use std::collections::HashMap;

use crate::hierarchical::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::{ AgglomerationSchedule, AgglomerationStage, ClusterState },
};

use super::{ calculate_distance, find_closest_clusters, merge_clusters };

// Generate the agglomeration schedule
pub fn generate_agglomeration_schedule(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    // Get variables to use for calculating distances
    let variables = match &config.main.variables {
        Some(vars) => vars.clone(),
        None => {
            return Err("No variables specified for clustering".to_string());
        }
    };

    // Get all cases
    let cases: Vec<HashMap<String, DataValue>> = data.cluster_data
        .iter()
        .flat_map(|dataset| dataset.iter().map(|record| record.values.clone()))
        .collect();

    // Get case labels or generate them
    let case_labels: Vec<String> = if let Some(label_var) = &config.main.label_cases {
        // label_var is a String representing a single variable
        cases
            .iter()
            .enumerate()
            .map(|(i, case)| {
                match case.get(label_var) {
                    Some(DataValue::Text(text)) => text.clone(),
                    Some(DataValue::Number(num)) => num.to_string(),
                    _ => format!("Case {}", i + 1),
                }
            })
            .collect()
    } else {
        (1..=cases.len()).map(|i| format!("Case {}", i)).collect()
    };

    // Initialize clusters - each case is its own cluster
    let mut clusters = Vec::with_capacity(cases.len());
    for i in 0..cases.len() {
        clusters.push(vec![i]);
    }

    // Calculate initial distance matrix
    let mut distances = vec![vec![0.0; cases.len()]; cases.len()];
    for i in 0..cases.len() {
        for j in i + 1..cases.len() {
            let distance = calculate_distance(
                &cases[i],
                &cases[j],
                &variables,
                &config.method.interval_method,
                config
            );
            distances[i][j] = distance;
        }
    }

    // Initialize cluster state
    let mut cluster_state = ClusterState {
        clusters,
        distances,
        case_labels,
        variables,
        method: config.method.clus_method.clone(),
    };

    // Create agglomeration stages
    let mut stages = Vec::new();
    let mut next_stage_map: HashMap<usize, usize> = HashMap::new();

    let num_cases = cases.len();
    for stage in 0..num_cases - 1 {
        // Find the two closest clusters
        if let Some((cluster1, cluster2, coefficient)) = find_closest_clusters(&cluster_state) {
            // Get the clusters that are being combined (original case numbers + 1 for SPSS-like indexing)
            let cluster1_cases = &cluster_state.clusters[cluster1].clone();
            let cluster2_cases = &cluster_state.clusters[cluster2].clone();

            // Find when these clusters first appeared
            let cluster1_first_appears = if cluster1_cases.len() == 1 {
                0
            } else {
                stage + 1 - cluster1_cases.len()
            };

            let cluster2_first_appears = if cluster2_cases.len() == 1 {
                0
            } else {
                stage + 1 - cluster2_cases.len()
            };

            // Calculate the next stage where this new cluster will be merged
            let next_stage = if stage < num_cases - 2 { stage + 2 } else { 0 };

            // Update next_stage for previously merged clusters
            if let Some(prev_stage1) = cluster1_first_appears.checked_sub(1) {
                if prev_stage1 < stages.len() {
                    next_stage_map.insert(prev_stage1, stage + 1);
                }
            }

            if let Some(prev_stage2) = cluster2_first_appears.checked_sub(1) {
                if prev_stage2 < stages.len() {
                    next_stage_map.insert(prev_stage2, stage + 1);
                }
            }

            // Create the stage
            stages.push(AgglomerationStage {
                stage: stage + 1, // 1-based indexing for stages
                clusters_combined: (cluster1_cases[0] + 1, cluster2_cases[0] + 1), // 1-based indexing for clusters
                coefficients: coefficient,
                cluster_first_appears: (cluster1_first_appears, cluster2_first_appears),
                next_stage: next_stage,
            });

            // Merge the clusters
            merge_clusters(&mut cluster_state, cluster1, cluster2, coefficient);
        } else {
            break;
        }
    }

    // Update next_stage values
    for (stage_idx, next) in next_stage_map {
        if stage_idx < stages.len() {
            stages[stage_idx].next_stage = next;
        }
    }

    Ok(AgglomerationSchedule { stages })
}

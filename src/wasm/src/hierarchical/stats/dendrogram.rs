use crate::hierarchical::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::{ Dendrogram, DendrogramNode },
};

use super::{ generate_agglomeration_schedule, generate_agglomeration_schedule_wrapper };

// Generate dendrogram data for visualization
pub fn generate_dendrogram(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<Dendrogram, String> {
    // Get the agglomeration schedule
    let agglomeration = generate_agglomeration_schedule_wrapper(data, config)?;

    // Get case labels
    let case_labels: Vec<String> = if let Some(label_vars) = &config.main.label_cases {
        data.cluster_data
            .iter()
            .flat_map(|dataset| dataset.iter())
            .enumerate()
            .map(|(i, record)| {
                match record.values.get(label_vars) {
                    Some(DataValue::Text(text)) => text.clone(),
                    Some(DataValue::Number(num)) => num.to_string(),
                    _ => format!("Case {}", i + 1),
                }
            })
            .collect()
    } else {
        (1..=data.cluster_data
            .iter()
            .flat_map(|d| d.iter())
            .count())
            .map(|i| format!("Case {}", i))
            .collect()
    };

    // Build dendrogram nodes
    let mut nodes = Vec::new();
    let num_cases = case_labels.len();

    // Create nodes for all cases
    for i in 0..num_cases {
        nodes.push(DendrogramNode {
            case: case_labels[i].clone(),
            linkage_distance: 0.0,
        });
    }

    // Add linkage distances from agglomeration schedule
    for stage in &agglomeration.stages {
        // The coefficient represents the distance at which clusters are merged
        let (cluster1, cluster2) = stage.clusters_combined;
        let linkage_distance = stage.coefficients;

        // Update linkage distances for cases in these clusters
        if cluster1 <= num_cases {
            nodes[cluster1 - 1].linkage_distance = linkage_distance;
        }

        if cluster2 <= num_cases {
            nodes[cluster2 - 1].linkage_distance = linkage_distance;
        }
    }

    Ok(Dendrogram { nodes })
}

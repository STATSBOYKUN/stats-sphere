use std::collections::HashMap;

use crate::knn::models::{
    config::KnnConfig,
    data::AnalysisData,
    result::{ FeatureData, PeersChart },
};

use super::core::{ find_k_nearest_neighbors, preprocess_knn_data };

pub fn calculate_peers_chart(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<PeersChart, String> {
    // Preprocess data
    let knn_data = preprocess_knn_data(data, config)?;

    // Determine k value
    let k = if config.neighbors.specify {
        config.neighbors.specify_k as usize
    } else if config.neighbors.auto_selection {
        config.neighbors.min_k as usize
    } else {
        3 // Default k value
    };

    // Get focal cases
    if knn_data.focal_indices.is_empty() {
        return Err("No focal cases found".to_string());
    }

    let focal_idx = knn_data.focal_indices[0];
    let focal_record = knn_data.case_identifiers[focal_idx];

    // Find k nearest neighbors to the focal case
    let use_euclidean = config.neighbors.metric_eucli;
    let neighbors = find_k_nearest_neighbors(
        &knn_data.data_matrix[focal_idx],
        &knn_data.data_matrix,
        &knn_data.training_indices,
        k,
        use_euclidean,
        None
    );

    // Extract neighbor case IDs
    let neighbor_ids: Vec<i32> = neighbors
        .iter()
        .map(|(idx, _)| knn_data.case_identifiers[*idx])
        .collect();

    // Create features map using available features
    let mut features = HashMap::new();

    // Add all features from the data
    for feature in &knn_data.features {
        features.insert(feature.clone(), FeatureData {
            focal_records: vec![focal_record],
            neighbors: neighbor_ids.clone(),
        });
    }

    // Add target variable if available
    if let Some(dep_var) = &config.main.dep_var {
        features.insert(dep_var.clone(), FeatureData {
            focal_records: vec![focal_record],
            neighbors: neighbor_ids.clone(),
        });
    }

    Ok(PeersChart {
        features,
    })
}

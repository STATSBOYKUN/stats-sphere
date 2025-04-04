use std::collections::HashMap;

use crate::knn::models::{
    config::KnnConfig,
    data::AnalysisData,
    result::{ NeighborDetail, PeersChart, FocalNeighborSet },
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

    // Determine focal indices based on focal_case_iden_var
    let focal_indices = if
        !knn_data.focal_indices.is_empty() &&
        config.main.focal_case_iden_var.is_some()
    {
        // If focal_case_iden_var is provided, use the focal indices from knn_data
        knn_data.focal_indices.clone()
    } else {
        // Otherwise, use all training indices as focal points
        knn_data.training_indices.clone()
    };

    if focal_indices.is_empty() {
        return Err("No focal cases found".to_string());
    }

    let use_euclidean = config.neighbors.metric_eucli;
    let mut focal_neighbor_sets = Vec::new();

    // Process each focal point
    for &focal_idx in &focal_indices {
        let focal_record = knn_data.case_identifiers[focal_idx];

        // Find k nearest neighbors to this focal case
        let neighbors = find_k_nearest_neighbors(
            &knn_data.data_matrix[focal_idx],
            &knn_data.data_matrix,
            &knn_data.training_indices,
            k,
            use_euclidean,
            None // No feature weights for now
        );

        // Create neighbor details
        let mut neighbor_details = Vec::new();
        let mut distances = Vec::new();

        for (idx, distance) in neighbors {
            let neighbor_id = knn_data.case_identifiers[idx];
            neighbor_details.push(NeighborDetail {
                id: neighbor_id,
                distance,
            });
            distances.push(distance);
        }

        // Add this focal point and its neighbors to the collection
        focal_neighbor_sets.push(FocalNeighborSet {
            focal_record,
            neighbors: neighbor_details,
            distances,
        });
    }

    // Create feature map
    let mut features = HashMap::new();

    // Process each feature
    for feature in &knn_data.features {
        features.insert(feature.clone(), Vec::new());
    }

    // Add target variable if available
    if let Some(dep_var) = &config.main.dep_var {
        features.insert(dep_var.clone(), Vec::new());
    }

    Ok(PeersChart {
        focal_neighbor_sets,
        features,
    })
}

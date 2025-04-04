use crate::knn::models::{
    config::KnnConfig,
    data::AnalysisData,
    result::{ NearestNeighbors, NeighborDetail, FocalNeighborSet },
};

use super::core::{ find_k_nearest_neighbors, preprocess_knn_data };

// Calculates nearest neighbors for the whole dataset
pub fn calculate_nearest_neighbors(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<NearestNeighbors, String> {
    // Preprocess data
    let knn_data = preprocess_knn_data(data, config)?;

    // Get focal case info
    if knn_data.focal_indices.is_empty() {
        return Err("No focal cases found".to_string());
    }

    // Determine k value
    let k = if config.neighbors.specify {
        config.neighbors.specify_k as usize
    } else if config.neighbors.auto_selection {
        // Auto selection - for now just use the min_k
        config.neighbors.min_k as usize
    } else {
        3 // Default k value
    };

    let use_euclidean = config.neighbors.metric_eucli;
    let mut focal_neighbor_sets = Vec::new();

    // Process each focal point
    for &focal_idx in &knn_data.focal_indices {
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

    Ok(NearestNeighbors {
        focal_neighbor_sets,
    })
}

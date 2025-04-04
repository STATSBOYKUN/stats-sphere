use std::collections::HashMap;

use crate::knn::models::{
    config::KnnConfig,
    data::{ AnalysisData, DataValue },
    result::{ ClassificationPartition, ClassificationTable, OverallPercent },
};

use super::core::{ find_k_nearest_neighbors, preprocess_knn_data };

pub fn calculate_classification_table(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<ClassificationTable, String> {
    // Check if we have a target variable - required for classification
    if config.main.dep_var.is_none() {
        return Err("A target variable is required for classification table".to_string());
    }

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

    // Determine if the target is categorical
    let target_is_categorical = knn_data.target_values.iter().all(|v| {
        match v {
            DataValue::Number(_) => false,
            DataValue::Text(_) => true,
            DataValue::Boolean(_) => true,
            DataValue::Null => false,
        }
    });

    if !target_is_categorical {
        return Err("Classification table is only available for categorical targets".to_string());
    }

    // Create mapping of categorical target values to numeric indices
    let mut category_map = HashMap::new();
    let mut categories = Vec::new();

    for value in &knn_data.target_values {
        let category = match value {
            DataValue::Text(s) => s.clone(),
            DataValue::Boolean(b) => b.to_string(),
            _ => {
                continue;
            }
        };

        if !category_map.contains_key(&category) {
            let idx = category_map.len();
            category_map.insert(category.clone(), idx);
            categories.push(category);
        }
    }

    // Initialize confusion matrices
    let n_categories = categories.len();
    let mut train_confusion = vec![vec![0; n_categories]; n_categories];
    let mut holdout_confusion = vec![vec![0; n_categories]; n_categories];

    // Use Euclidean or Manhattan distance
    let use_euclidean = config.neighbors.metric_eucli;

    // Classify training set
    for &idx in &knn_data.training_indices {
        // Get actual category
        let actual_value = &knn_data.target_values[idx];
        let actual_cat = match actual_value {
            DataValue::Text(s) => category_map.get(s),
            DataValue::Boolean(b) => category_map.get(&b.to_string()),
            _ => {
                continue;
            }
        };

        if actual_cat.is_none() {
            continue;
        }

        // Find k nearest neighbors excluding self
        let train_indices: Vec<usize> = knn_data.training_indices
            .iter()
            .filter(|&&i| i != idx)
            .copied()
            .collect();

        let neighbors = find_k_nearest_neighbors(
            &knn_data.data_matrix[idx],
            &knn_data.data_matrix,
            &train_indices,
            k,
            use_euclidean,
            None
        );

        // Predict category by majority vote
        let mut vote_counts = vec![0; n_categories];

        for (neighbor_idx, _) in neighbors {
            let neighbor_value = &knn_data.target_values[neighbor_idx];
            let neighbor_cat = match neighbor_value {
                DataValue::Text(s) => category_map.get(s),
                DataValue::Boolean(b) => category_map.get(&b.to_string()),
                _ => {
                    continue;
                }
            };

            if let Some(&cat_idx) = neighbor_cat {
                vote_counts[cat_idx] += 1;
            }
        }

        // Find predicted category (max votes)
        let predicted_cat = vote_counts
            .iter()
            .enumerate()
            .max_by_key(|&(_, count)| count)
            .map(|(idx, _)| idx)
            .unwrap_or(0);

        // Update confusion matrix
        let actual_idx = actual_cat.unwrap();
        train_confusion[*actual_idx][predicted_cat] += 1;
    }

    // Classify holdout set
    for &idx in &knn_data.holdout_indices {
        // Get actual category
        let actual_value = &knn_data.target_values[idx];
        let actual_cat = match actual_value {
            DataValue::Text(s) => category_map.get(s),
            DataValue::Boolean(b) => category_map.get(&b.to_string()),
            _ => {
                continue;
            }
        };

        if actual_cat.is_none() {
            continue;
        }

        // Find k nearest neighbors from training set
        let neighbors = find_k_nearest_neighbors(
            &knn_data.data_matrix[idx],
            &knn_data.data_matrix,
            &knn_data.training_indices,
            k,
            use_euclidean,
            None
        );

        // Predict category by majority vote
        let mut vote_counts = vec![0; n_categories];

        for (neighbor_idx, _) in neighbors {
            let neighbor_value = &knn_data.target_values[neighbor_idx];
            let neighbor_cat = match neighbor_value {
                DataValue::Text(s) => category_map.get(s),
                DataValue::Boolean(b) => category_map.get(&b.to_string()),
                _ => {
                    continue;
                }
            };

            if let Some(&cat_idx) = neighbor_cat {
                vote_counts[cat_idx] += 1;
            }
        }

        // Find predicted category (max votes)
        let predicted_cat = vote_counts
            .iter()
            .enumerate()
            .max_by_key(|&(_, count)| count)
            .map(|(idx, _)| idx)
            .unwrap_or(0);

        // Update confusion matrix
        let actual_idx = actual_cat.unwrap();
        holdout_confusion[*actual_idx][predicted_cat] += 1;
    }

    // Convert confusion matrices to output format
    // For simplicity, assume binary classification for now
    // In a complete implementation, we would handle multiple categories
    let mut train_observed = Vec::new();
    let mut train_predicted = Vec::new();
    let mut train_correct = 0;
    let mut train_total = 0;

    for i in 0..n_categories {
        let row_sum: usize = train_confusion[i].iter().sum();
        train_observed.push(row_sum);
        train_total += row_sum;
        train_correct += train_confusion[i][i];
    }

    for j in 0..n_categories {
        let col_sum: usize = (0..n_categories).map(|i| train_confusion[i][j]).sum();
        train_predicted.push(col_sum);
    }

    let mut holdout_observed = Vec::new();
    let mut holdout_predicted = Vec::new();
    let mut holdout_correct = 0;
    let mut holdout_total = 0;

    for i in 0..n_categories {
        let row_sum: usize = holdout_confusion[i].iter().sum();
        holdout_observed.push(row_sum);
        holdout_total += row_sum;
        holdout_correct += holdout_confusion[i][i];
    }

    for j in 0..n_categories {
        let col_sum: usize = (0..n_categories).map(|i| holdout_confusion[i][j]).sum();
        holdout_predicted.push(col_sum);
    }

    let train_percent_correct = if train_total > 0 {
        (100.0 * (train_correct as f64)) / (train_total as f64)
    } else {
        0.0
    };

    let holdout_percent_correct = if holdout_total > 0 {
        (100.0 * (holdout_correct as f64)) / (holdout_total as f64)
    } else {
        0.0
    };

    Ok(ClassificationTable {
        training: ClassificationPartition {
            observed: train_observed,
            predicted: train_predicted,
            percent_correct: train_percent_correct,
        },
        holdout: ClassificationPartition {
            observed: holdout_observed,
            predicted: holdout_predicted,
            percent_correct: holdout_percent_correct,
        },
        overall_percent: OverallPercent {
            training: train_percent_correct,
            holdout: holdout_percent_correct,
        },
    })
}

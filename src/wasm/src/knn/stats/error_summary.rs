use std::collections::HashMap;

use crate::knn::models::{
    data::{ DataValue, KnnData },
    result::{ ClassificationTable, ErrorSummary },
};

use super::core::find_k_nearest_neighbors;

// Calculate error rate for KNN model
pub fn calculate_knn_error(
    knn_data: &KnnData,
    k: usize,
    use_euclidean: bool,
    excluded_features: Option<&[usize]>,
    weights: Option<&[f64]>
) -> Result<f64, String> {
    // Check if we have target values - required for error calculation
    if
        knn_data.target_values.is_empty() ||
        knn_data.target_values.iter().all(|v| matches!(v, DataValue::Null))
    {
        return Err("Target values are required for error calculation".to_string());
    }

    // Determine if target is categorical
    let target_is_categorical = knn_data.target_values.iter().all(|v| {
        match v {
            DataValue::Number(_) => false,
            DataValue::Text(_) => true,
            DataValue::Boolean(_) => true,
            DataValue::Null => false,
        }
    });

    // Create category mapping if categorical
    let mut category_map = HashMap::new();

    if target_is_categorical {
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
                category_map.insert(category, idx);
            }
        }
    }

    let n_categories = category_map.len();
    let mut total_error = 0.0;
    let mut total_cases = 0;

    // Cross-validation approach for error calculation
    for (idx, point) in knn_data.data_matrix.iter().enumerate() {
        // Skip if not in training set
        if !knn_data.training_indices.contains(&idx) {
            continue;
        }

        // Prepare point with excluded features
        let mut modified_point = Vec::new();

        for (j, &val) in point.iter().enumerate() {
            if let Some(excluded) = excluded_features {
                if excluded.contains(&j) {
                    continue;
                }
            }
            modified_point.push(val);
        }

        // Find k nearest neighbors excluding self
        let train_indices: Vec<usize> = knn_data.training_indices
            .iter()
            .filter(|&&i| i != idx)
            .copied()
            .collect();

        // Prepare data matrix with excluded features
        let mut modified_data = Vec::new();

        for row in &knn_data.data_matrix {
            let mut modified_row = Vec::new();

            for (j, &val) in row.iter().enumerate() {
                if let Some(excluded) = excluded_features {
                    if excluded.contains(&j) {
                        continue;
                    }
                }
                modified_row.push(val);
            }

            modified_data.push(modified_row);
        }

        let neighbors = find_k_nearest_neighbors(
            &modified_point,
            &modified_data,
            &train_indices,
            k,
            use_euclidean,
            weights
        );

        // Calculate error based on target type
        if target_is_categorical {
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

            // Increment error if prediction is wrong
            if predicted_cat != *actual_cat.unwrap() {
                total_error += 1.0;
            }
        } else {
            // Regression case
            // Get actual value
            let actual_value = match &knn_data.target_values[idx] {
                DataValue::Number(n) => *n,
                _ => {
                    continue;
                }
            };

            // Calculate predicted value (mean of k nearest neighbors)
            let mut sum = 0.0;
            let mut count = 0;

            for (neighbor_idx, _) in neighbors {
                if let DataValue::Number(val) = knn_data.target_values[neighbor_idx] {
                    sum += val;
                    count += 1;
                }
            }

            let predicted = if count > 0 { sum / (count as f64) } else { 0.0 };

            // Sum squared error
            total_error += (actual_value - predicted).powi(2);
        }

        total_cases += 1;
    }

    // Calculate error rate or mean squared error
    if total_cases > 0 {
        if target_is_categorical {
            Ok(total_error / (total_cases as f64))
        } else {
            Ok(total_error / (total_cases as f64))
        }
    } else {
        Ok(0.0)
    }
}

// Calculate error summary
pub fn calculate_error_summary(
    classification_table: &Option<ClassificationTable>
) -> Result<ErrorSummary, String> {
    match classification_table {
        Some(table) => {
            // Calculate error rates as 100% - percent correct
            let training_error = 100.0 - table.training.percent_correct;
            let holdout_error = 100.0 - table.holdout.percent_correct;

            Ok(ErrorSummary {
                training: training_error,
                holdout: holdout_error,
            })
        }
        None => Err("Classification table not available for error summary calculation".to_string()),
    }
}

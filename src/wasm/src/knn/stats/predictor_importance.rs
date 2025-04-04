use std::collections::HashMap;

use crate::knn::models::{ config::KnnConfig, data::AnalysisData, result::PredictorImportance };

use super::core::{ calculate_knn_error, preprocess_knn_data };

pub fn calculate_predictor_importance(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<PredictorImportance, String> {
    // Check if we have a target variable - required for predictor importance
    if config.main.dep_var.is_none() {
        return Err(
            "A target variable is required for calculating predictor importance".to_string()
        );
    }

    // Preprocess data
    let knn_data = preprocess_knn_data(data, config)?;
    web_sys::console::log_1(&format!("KNN Data: {:?}", knn_data).into());

    // Determine k value
    let k = if config.neighbors.specify {
        config.neighbors.specify_k as usize
    } else if config.neighbors.auto_selection {
        config.neighbors.min_k as usize
    } else {
        3 // Default k value
    };

    // Get target variable
    let dep_var = match &config.main.dep_var {
        Some(var) => var.clone(),
        None => {
            return Err(
                "A target variable is required for calculating predictor importance".to_string()
            );
        }
    };

    // Calculate baseline error with all features
    let use_euclidean = config.neighbors.metric_eucli;
    let baseline_error = calculate_knn_error(&knn_data, k, use_euclidean, None, None)?;

    // Calculate error when each feature is removed
    let mut importance = HashMap::new();

    for (feature_idx, feature_name) in knn_data.features.iter().enumerate() {
        // Create a list of indices to exclude this feature
        let excluded_features = vec![feature_idx];

        // Calculate error without this feature
        let feature_error = calculate_knn_error(
            &knn_data,
            k,
            use_euclidean,
            Some(&excluded_features),
            None
        )?;

        // Calculate importance ratio
        let ratio = if baseline_error > 0.0 {
            feature_error / baseline_error
        } else {
            1.0 / (knn_data.features.len() as f64)
        };

        importance.insert(feature_name.clone(), ratio);
    }

    // Normalize importance values
    let sum: f64 = importance.values().sum();
    if sum > 0.0 {
        for val in importance.values_mut() {
            *val /= sum;
        }
    }

    Ok(PredictorImportance {
        predictors: importance,
        target: dep_var,
    })
}

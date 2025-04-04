use std::collections::HashSet;

use crate::knn::models::{ config::KnnConfig, data::{ AnalysisData, DataValue, KnnData } };
use super::core::{ normalize_features, split_training_holdout };

pub fn preprocess_knn_data(data: &AnalysisData, config: &KnnConfig) -> Result<KnnData, String> {
    // Extract feature variables
    let features = match &config.main.feature_var {
        Some(vars) => vars.clone(),
        None => {
            // Auto-detect numeric features from features_data
            if data.features_data.is_empty() {
                return Err("No features data provided".to_string());
            }

            let mut feature_vars = HashSet::new();
            for dataset in &data.features_data {
                for record in dataset {
                    for (key, value) in &record.values {
                        if matches!(value, DataValue::Number(_)) {
                            feature_vars.insert(key.clone());
                        }
                    }
                }
            }
            feature_vars.into_iter().collect()
        }
    };

    if features.is_empty() {
        return Err("No valid features found".to_string());
    }

    // Get dependent variable
    let dep_var = config.main.dep_var.clone();

    // Get number of cases - use maximum length across all datasets
    let features_cases = data.features_data
        .iter()
        .map(|ds| ds.len())
        .max()
        .unwrap_or(0);
    let target_cases = data.target_data
        .iter()
        .map(|ds| ds.len())
        .max()
        .unwrap_or(0);
    let num_cases = std::cmp::max(features_cases, target_cases);

    if num_cases == 0 {
        return Err("No cases found in data".to_string());
    }

    // Create data matrix and extract target values
    let mut data_matrix = Vec::new();
    let mut target_values = Vec::new();
    let mut case_identifiers = Vec::new();

    // Get case identifier variable
    let case_ident_var = &config.main.case_iden_var;

    // Process each case
    for case_idx in 0..num_cases {
        let mut row = Vec::new();

        // Extract feature values for current case from features_data
        for var in &features {
            let mut var_value: Option<f64> = None;

            // Look for value in features_data first
            for dataset in &data.features_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(val)) = dataset[case_idx].values.get(var) {
                        var_value = Some(*val);
                        break;
                    }
                }
            }

            // If not found in features_data, check other datasets
            if var_value.is_none() {
                for dataset in &data.target_data {
                    if case_idx < dataset.len() {
                        if let Some(DataValue::Number(val)) = dataset[case_idx].values.get(var) {
                            var_value = Some(*val);
                            break;
                        }
                    }
                }
            }

            // Add the value to the row or handle missing value
            match var_value {
                Some(val) => row.push(val),
                None => {
                    // If excluding incomplete cases, stop processing this case
                    if config.options.exclude {
                        break;
                    }
                    // Otherwise, use a default value (0.0)
                    row.push(0.0);
                }
            }
        }

        // Skip this case if not all features were processed
        if row.len() != features.len() {
            continue;
        }

        // Get target value if a dependent variable is specified (from target_data)
        let mut target_value = DataValue::Null;
        if let Some(ref dep_var_name) = dep_var {
            for dataset in &data.target_data {
                if case_idx < dataset.len() {
                    if let Some(val) = dataset[case_idx].values.get(dep_var_name) {
                        target_value = val.clone();
                        break;
                    }
                }
            }
        }

        // Get case identifier (look in all datasets)
        let mut case_id = (case_idx + 1) as i32;
        if let Some(id_var) = case_ident_var {
            // Try features_data first
            for dataset in &data.features_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(id)) = dataset[case_idx].values.get(id_var) {
                        case_id = *id as i32;
                        break;
                    }
                }
            }

            // If not found, try target_data
            if case_id == ((case_idx + 1) as i32) {
                for dataset in &data.target_data {
                    if case_idx < dataset.len() {
                        if let Some(DataValue::Number(id)) = dataset[case_idx].values.get(id_var) {
                            case_id = *id as i32;
                            break;
                        }
                    }
                }
            }
        }

        // Add the case to the data matrix
        data_matrix.push(row);
        target_values.push(target_value);
        case_identifiers.push(case_id);
    }

    if data_matrix.is_empty() {
        return Err("No valid data records after preprocessing".to_string());
    }

    // Normalize features if needed
    if config.main.norm_covar {
        normalize_features(&mut data_matrix);
    }

    // Split into training and holdout sets
    let (training_indices, holdout_indices) = split_training_holdout(
        data_matrix.len(),
        config.partition.training_number,
        config.partition.set_seed,
        config.partition.seed
    );

    // Identify focal cases
    let focal_var = &config.main.focal_case_iden_var;
    let mut focal_indices = Vec::new();

    if let Some(focal_var) = focal_var {
        for (idx, case_id) in case_identifiers.iter().enumerate() {
            // Look for this case ID in focal case data
            for dataset in &data.focal_case_data {
                for record in dataset {
                    if let Some(DataValue::Number(id)) = record.values.get(focal_var) {
                        if (*id as i32) == *case_id {
                            focal_indices.push(idx);
                            break;
                        }
                    }
                }
            }
        }
    }

    // If no focal cases found, use the first case as focal
    if focal_indices.is_empty() && !data_matrix.is_empty() {
        focal_indices.push(0);
    }

    Ok(KnnData {
        features,
        data_matrix,
        target_values,
        case_identifiers,
        training_indices,
        holdout_indices,
        focal_indices,
    })
}

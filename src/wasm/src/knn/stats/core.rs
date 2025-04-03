use crate::knn::models::{ config::KnnConfig, data::{ AnalysisData, DataValue }, result::* };
use rand::{ SeedableRng, Rng };
use rand_mt::Mt64;
use std::collections::{ HashMap, HashSet };

// Generates Mersenne Twister RNG settings
pub fn generate_mersenne_twister(
    _data: &AnalysisData,
    config: &KnnConfig
) -> Result<SystemSettings, String> {
    let seed = match config.partition.seed {
        Some(seed) => seed,
        None => rand::random::<i64>(),
    };

    Ok(SystemSettings {
        rng: RngSetting {
            keyword: "RNG".to_string(),
            description: "Random number generator".to_string(),
            setting: "MT (Mersenne Twister)".to_string(),
        },
    })
}

// Calculates basic processing summary (case counts)
pub fn basic_processing_summary(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<CaseProcessingSummary, String> {
    // Calculate the number of cases in each partition
    let total_cases = if !data.target_data.is_empty() {
        data.target_data[0].len()
    } else {
        return Err("No data available for processing".to_string());
    };

    // Calculate training/holdout split
    let training_percent = config.partition.training_number as f64;
    let holdout_percent = 100.0 - training_percent;
    let training_n = (((total_cases as f64) * training_percent) / 100.0).round() as usize;
    let holdout_n = total_cases - training_n;

    // Create summary
    Ok(CaseProcessingSummary {
        training: ProcessingSummaryDetail {
            n: Some(training_n),
            percent: Some(training_percent),
        },
        holdout: ProcessingSummaryDetail {
            n: Some(holdout_n),
            percent: Some(holdout_percent),
        },
        valid: ProcessingSummaryDetail {
            n: Some(total_cases),
            percent: Some(100.0),
        },
        excluded: ProcessingSummaryDetail {
            n: Some(0),
            percent: None,
        },
        total: ProcessingSummaryDetail {
            n: Some(total_cases),
            percent: None,
        },
    })
}

// Structure to hold preprocessed data for KNN
struct KnnData {
    features: Vec<String>,
    data_matrix: Vec<Vec<f64>>,
    target_values: Vec<DataValue>,
    case_identifiers: Vec<i32>,
    training_indices: Vec<usize>,
    holdout_indices: Vec<usize>,
    focal_indices: Vec<usize>,
}

// Preprocesses data for KNN calculation
fn preprocess_knn_data(data: &AnalysisData, config: &KnnConfig) -> Result<KnnData, String> {
    // Extract feature variables
    let features = match &config.main.feature_var {
        Some(vars) => vars.clone(),
        None => {
            // Auto-detect numeric features from first dataset
            if data.target_data.is_empty() {
                return Err("No data provided".to_string());
            }

            let mut feature_vars = HashSet::new();
            for record in &data.target_data[0] {
                for (key, value) in &record.values {
                    if matches!(value, DataValue::Number(_)) {
                        feature_vars.insert(key.clone());
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
    let dep_var = match &config.main.dep_var {
        Some(var) => var.clone(),
        None => {
            return Err("No dependent variable specified".to_string());
        }
    };

    // Get number of cases
    let num_cases = if !data.target_data.is_empty() { data.target_data[0].len() } else { 0 };

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
        let mut has_missing = false;

        // Extract feature values for current case
        for var in &features {
            let mut var_value: Option<f64> = None;

            // Look for value in the datasets
            for dataset in &data.target_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(val)) = dataset[case_idx].values.get(var) {
                        var_value = Some(*val);
                        break;
                    }
                }
            }

            // Add the value to the row or mark as missing
            match var_value {
                Some(val) => row.push(val),
                None => {
                    has_missing = true;
                    if !config.options.exclude {
                        // If not excluding, use a default value (0.0)
                        row.push(0.0);
                    } else {
                        break;
                    }
                }
            }
        }

        // Get target value
        let mut target_value = DataValue::Null;
        for dataset in &data.target_data {
            if case_idx < dataset.len() {
                if let Some(val) = dataset[case_idx].values.get(&dep_var) {
                    target_value = val.clone();
                    break;
                }
            }
        }

        // Get case identifier
        let mut case_id = (case_idx + 1) as i32;
        if let Some(id_var) = case_ident_var {
            for dataset in &data.target_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(id)) = dataset[case_idx].values.get(id_var) {
                        case_id = *id as i32;
                        break;
                    }
                }
            }
        }

        // Add the row if it's complete or if we're not excluding incomplete cases
        if (!has_missing || !config.options.exclude) && row.len() == features.len() {
            data_matrix.push(row);
            target_values.push(target_value);
            case_identifiers.push(case_id);
        }
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

// Normalizes features using adjusted normalization
fn normalize_features(data_matrix: &mut Vec<Vec<f64>>) {
    if data_matrix.is_empty() {
        return;
    }

    let n_features = data_matrix[0].len();

    for feature_idx in 0..n_features {
        // Find min and max
        let mut min_val = f64::MAX;
        let mut max_val = f64::MIN;

        for row in data_matrix.iter() {
            if feature_idx < row.len() {
                let val = row[feature_idx];
                if val < min_val {
                    min_val = val;
                }
                if val > max_val {
                    max_val = val;
                }
            }
        }

        // Normalize if there's a range
        if max_val > min_val {
            for row in data_matrix.iter_mut() {
                if feature_idx < row.len() {
                    // Apply adjusted normalization: [2*(x-min)/(max-min)]-1
                    row[feature_idx] =
                        (2.0 * (row[feature_idx] - min_val)) / (max_val - min_val) - 1.0;
                }
            }
        }
    }
}

// Splits data into training and holdout sets
fn split_training_holdout(
    total_cases: usize,
    training_percent: i32,
    use_seed: bool,
    seed: Option<i64>
) -> (Vec<usize>, Vec<usize>) {
    let training_size = (
        ((total_cases as f64) * (training_percent as f64)) /
        100.0
    ).round() as usize;

    // Create indices
    let mut indices: Vec<usize> = (0..total_cases).collect();

    // Shuffle indices if random assignment
    if use_seed {
        let mut rng = match seed {
            Some(s) => Mt64::seed_from_u64(s as u64),
            None => Mt64::new(rand::random::<u64>()),
        };

        // Fisher-Yates shuffle
        for i in (1..indices.len()).rev() {
            let j = rng.random_range(0..=i);
            indices.swap(i, j);
        }
    }

    // Split into training and holdout
    let training_indices = indices[..training_size].to_vec();
    let holdout_indices = indices[training_size..].to_vec();

    (training_indices, holdout_indices)
}

// Calculates Euclidean distance between two data points
fn calculate_euclidean_distance(
    point1: &[f64],
    point2: &[f64],
    feature_weights: Option<&[f64]>
) -> f64 {
    let mut sum_squared = 0.0;

    for i in 0..point1.len().min(point2.len()) {
        let diff = point1[i] - point2[i];
        let weight = match feature_weights {
            Some(weights) if i < weights.len() => weights[i],
            _ => 1.0,
        };
        sum_squared += weight * diff * diff;
    }

    sum_squared.sqrt()
}

// Calculates Manhattan (cityblock) distance between two data points
fn calculate_manhattan_distance(
    point1: &[f64],
    point2: &[f64],
    feature_weights: Option<&[f64]>
) -> f64 {
    let mut sum_abs = 0.0;

    for i in 0..point1.len().min(point2.len()) {
        let diff = (point1[i] - point2[i]).abs();
        let weight = match feature_weights {
            Some(weights) if i < weights.len() => weights[i],
            _ => 1.0,
        };
        sum_abs += weight * diff;
    }

    sum_abs
}

// Finds k nearest neighbors for a query point
fn find_k_nearest_neighbors(
    query_point: &[f64],
    data_matrix: &[Vec<f64>],
    indices: &[usize],
    k: usize,
    use_euclidean: bool,
    feature_weights: Option<&[f64]>
) -> Vec<(usize, f64)> {
    let mut distances = Vec::new();

    // Calculate distances from query point to all points in the dataset
    for &idx in indices {
        if idx >= data_matrix.len() {
            continue;
        }

        let distance = if use_euclidean {
            calculate_euclidean_distance(query_point, &data_matrix[idx], feature_weights)
        } else {
            calculate_manhattan_distance(query_point, &data_matrix[idx], feature_weights)
        };

        distances.push((idx, distance));
    }

    // Sort by distance
    distances.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));

    // Return k nearest
    distances.into_iter().take(k).collect()
}

// Calculates nearest neighbors for the whole dataset
pub fn calculate_nearest_neighbors(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<NearestNeighbors, String> {
    // Preprocess data
    let knn_data = preprocess_knn_data(data, config)?;

    // Determine k value
    let k = if config.neighbors.specify {
        config.neighbors.specify_k as usize
    } else if config.neighbors.auto_selection {
        // Auto selection - for now just use the min_k
        config.neighbors.min_k as usize
    } else {
        3 // Default k value
    };

    // Get focal case info
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

    Ok(NearestNeighbors {
        focal_record,
        neighbors: neighbor_details,
        distances,
    })
}

// Calculate classification table (confusion matrix)
pub fn calculate_classification_table(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<ClassificationTable, String> {
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

// Calculate predictor importance
pub fn calculate_predictor_importance(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<PredictorImportance, String> {
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

    // Get target variable
    let dep_var = match &config.main.dep_var {
        Some(var) => var.clone(),
        None => {
            return Err("No dependent variable specified".to_string());
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

// Calculate error rate for KNN model
fn calculate_knn_error(
    knn_data: &KnnData,
    k: usize,
    use_euclidean: bool,
    excluded_features: Option<&[usize]>,
    weights: Option<&[f64]>
) -> Result<f64, String> {
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

// Calculate predictor space visualization data
pub fn calculate_predictor_space(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<PredictorSpace, String> {
    // Preprocess data
    let knn_data = preprocess_knn_data(data, config)?;

    // Need at least 2 features for visualization
    if knn_data.features.len() < 2 {
        return Err("At least 2 features are needed for predictor space visualization".to_string());
    }

    // Determine k value
    let k = if config.neighbors.specify {
        config.neighbors.specify_k as usize
    } else if config.neighbors.auto_selection {
        config.neighbors.min_k as usize
    } else {
        3 // Default k value
    };

    // For simplicity, use the first two features for visualization
    let feature1_idx = 0;
    let feature2_idx = 1;

    // Create dimensions for x and y axes
    let mut dimensions = Vec::new();
    let mut points = Vec::new();

    // Add points for each case
    for (idx, point) in knn_data.data_matrix.iter().enumerate() {
        if feature1_idx >= point.len() || feature2_idx >= point.len() {
            continue;
        }

        let x = point[feature1_idx];
        let y = point[feature2_idx];

        // Determine point type
        let point_type = if knn_data.training_indices.contains(&idx) {
            "Training".to_string()
        } else if knn_data.holdout_indices.contains(&idx) {
            "Holdout".to_string()
        } else {
            "Unknown".to_string()
        };

        // Determine focal status
        let focal = knn_data.focal_indices.contains(&idx);

        // Determine target outcome
        let purchase_outcome = match &knn_data.target_values[idx] {
            DataValue::Number(n) => *n > 0.5,
            DataValue::Boolean(b) => *b,
            DataValue::Text(s) => s == "1" || s.to_lowercase() == "true",
            DataValue::Null => false,
        };

        points.push(DataPoint {
            x,
            y,
            focal,
            purchase_outcome,
            point_type,
        });
    }

    // Create dimension for first two features
    dimensions.push(PredictorDimension {
        name: format!("{} vs {}", knn_data.features[feature1_idx], knn_data.features[feature2_idx]),
        points,
    });

    Ok(PredictorSpace {
        model_predictors: knn_data.features.len(),
        k_value: k,
        dimensions,
    })
}

// Calculate peers chart
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

    // Use simplified charts for the common variables
    // In a real implementation, we would extract actual data for each variable

    Ok(PeersChart {
        purchase_outcome: PeerChartData {
            focal_records: vec![focal_record],
            neighbors: neighbor_ids.clone(),
        },
        customer_age: PeerChartData {
            focal_records: vec![focal_record],
            neighbors: neighbor_ids.clone(),
        },
        total_purchase_amount: PeerChartData {
            focal_records: vec![focal_record],
            neighbors: neighbor_ids,
        },
    })
}

// Calculate quadrant map
pub fn calculate_quadrant_map(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<QuadrantMap, String> {
    // Reuse logic from peers chart with minor modifications
    let peers_chart = calculate_peers_chart(data, config)?;

    Ok(QuadrantMap {
        purchase_outcome: QuadrantMapData {
            focal_records: peers_chart.purchase_outcome.focal_records,
            neighbors: peers_chart.purchase_outcome.neighbors,
        },
        customer_age: QuadrantMapData {
            focal_records: peers_chart.customer_age.focal_records,
            neighbors: peers_chart.customer_age.neighbors,
        },
        total_purchase_amount: QuadrantMapData {
            focal_records: peers_chart.total_purchase_amount.focal_records,
            neighbors: peers_chart.total_purchase_amount.neighbors,
        },
    })
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

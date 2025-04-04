use rand_mt::Mt64;

// Normalizes features using adjusted normalization
pub fn normalize_features(data_matrix: &mut Vec<Vec<f64>>) {
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
pub fn split_training_holdout(
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
            Some(s) => Mt64::new(s as u64),
            None => Mt64::new(rand::random::<u64>()),
        };

        for i in (1..indices.len()).rev() {
            let j = (rng.next_u64() % ((i + 1) as u64)) as usize;
            indices.swap(i, j);
        }
    }

    // Split into training and holdout
    let training_indices = indices[..training_size].to_vec();
    let holdout_indices = indices[training_size..].to_vec();

    (training_indices, holdout_indices)
}

// Calculates Euclidean distance between two data points
pub fn calculate_euclidean_distance(
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
pub fn calculate_manhattan_distance(
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
pub fn find_k_nearest_neighbors(
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

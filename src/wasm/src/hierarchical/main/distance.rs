use super::types::{ClusteringError, DistanceMetric, BinaryOptions, DistanceTransformation};
use std::f64;

/// Calculate distance between two points using specified metric
///
/// # Arguments
/// * `point1` - First data point as slice of f64
/// * `point2` - Second data point as slice of f64
/// * `metric` - Distance metric to use
/// * `params` - Optional parameters for specific metrics (e.g., p for Minkowski)
/// * `binary_options` - Options for binary distance metrics
///
/// # Returns
/// * Result with distance value or error
pub fn calculate_distance(
    point1: &[f64],
    point2: &[f64],
    metric: DistanceMetric,
    params: Option<f64>,
    binary_options: Option<&BinaryOptions>,
) -> Result<f64, ClusteringError> {
    // Check that points have same dimension
    if point1.len() != point2.len() {
        return Err(ClusteringError::DistanceCalculationError(
            format!("Points have different dimensions: {} vs {}", point1.len(), point2.len())
        ));
    }

    // Return appropriate distance based on metric
    match metric {
        DistanceMetric::Euclidean => calculate_euclidean(point1, point2),
        DistanceMetric::SquaredEuclidean => calculate_squared_euclidean(point1, point2),
        DistanceMetric::Manhattan => calculate_manhattan(point1, point2),
        DistanceMetric::Chebyshev => calculate_chebyshev(point1, point2),
        DistanceMetric::Cosine => calculate_cosine(point1, point2),
        DistanceMetric::Correlation => calculate_correlation(point1, point2),
        DistanceMetric::Jaccard => calculate_jaccard(point1, point2, binary_options),
        DistanceMetric::ChiSquare => calculate_chi_square(point1, point2),
        DistanceMetric::Minkowski => calculate_minkowski(point1, point2, params),
    }
}

/// Calculate Euclidean distance
fn calculate_euclidean(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let sum_sq = calculate_squared_euclidean(point1, point2)?;
    
    Ok(sum_sq.sqrt())
}

/// Calculate squared Euclidean distance (no square root)
fn calculate_squared_euclidean(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut sum_sq = 0.0;
    
    for i in 0..point1.len() {
        let diff = point1[i] - point2[i];
        sum_sq += diff * diff;
    }
    
    if sum_sq.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in squared Euclidean distance calculation".to_string()
        ));
    }
    
    Ok(sum_sq)
}

/// Calculate Manhattan (city block) distance
fn calculate_manhattan(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut sum = 0.0;
    
    for i in 0..point1.len() {
        sum += (point1[i] - point2[i]).abs();
    }
    
    if sum.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in Manhattan distance calculation".to_string()
        ));
    }
    
    Ok(sum)
}

/// Calculate Chebyshev distance (maximum coordinate difference)
fn calculate_chebyshev(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut max_diff = 0.0;
    
    for i in 0..point1.len() {
        let diff = (point1[i] - point2[i]).abs();
        if diff > max_diff {
            max_diff = diff;
        }
    }
    
    if max_diff.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in Chebyshev distance calculation".to_string()
        ));
    }
    
    Ok(max_diff)
}

/// Calculate cosine distance (1 - cosine similarity)
fn calculate_cosine(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut dot_product = 0.0;
    let mut norm1 = 0.0;
    let mut norm2 = 0.0;
    
    for i in 0..point1.len() {
        dot_product += point1[i] * point2[i];
        norm1 += point1[i] * point1[i];
        norm2 += point2[i] * point2[i];
    }
    
    if norm1 == 0.0 || norm2 == 0.0 {
        return Err(ClusteringError::DistanceCalculationError(
            "Zero vector encountered in cosine distance calculation".to_string()
        ));
    }
    
    let similarity = dot_product / (norm1.sqrt() * norm2.sqrt());
    
    // Handle numerical errors
    if similarity > 1.0 && similarity < 1.0 + 1e-10 {
        return Ok(0.0);
    }
    
    if similarity < -1.0 && similarity > -1.0 - 1e-10 {
        return Ok(2.0);
    }
    
    if similarity.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in cosine distance calculation".to_string()
        ));
    }
    
    // Cosine distance is 1 - cosine similarity
    Ok(1.0 - similarity)
}

/// Calculate Pearson correlation distance
fn calculate_correlation(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    // Check if all values are identical in either vector
    let all_identical1 = point1.windows(2).all(|w| (w[0] - w[1]).abs() < f64::EPSILON);
    let all_identical2 = point2.windows(2).all(|w| (w[0] - w[1]).abs() < f64::EPSILON);
    
    if all_identical1 && all_identical2 {
        // Both vectors are constant
        return if (point1[0] - point2[0]).abs() < f64::EPSILON {
            Ok(0.0) // Perfect correlation for identical constant vectors
        } else {
            Ok(1.0) // No correlation for different constant vectors
        };
    } else if all_identical1 || all_identical2 {
        // One vector is constant - correlation is undefined
        return Ok(1.0); // Set to maximum distance as a convention
    }
    
    // Calculate means
    let mean1: f64 = point1.iter().sum::<f64>() / point1.len() as f64;
    let mean2: f64 = point2.iter().sum::<f64>() / point2.len() as f64;
    
    let mut numerator = 0.0;
    let mut denom1 = 0.0;
    let mut denom2 = 0.0;
    
    // Calculate correlation
    for i in 0..point1.len() {
        let diff1 = point1[i] - mean1;
        let diff2 = point2[i] - mean2;
        
        numerator += diff1 * diff2;
        denom1 += diff1 * diff1;
        denom2 += diff2 * diff2;
    }
    
    if denom1 <= f64::EPSILON || denom2 <= f64::EPSILON {
        return Err(ClusteringError::DistanceCalculationError(
            "Zero variance encountered in correlation distance calculation".to_string()
        ));
    }
    
    let correlation = numerator / (denom1.sqrt() * denom2.sqrt());
    
    // Handle numerical errors
    if correlation > 1.0 && correlation < 1.0 + 1e-10 {
        return Ok(0.0);
    }
    
    if correlation < -1.0 && correlation > -1.0 - 1e-10 {
        return Ok(2.0);
    }
    
    if correlation.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in correlation distance calculation".to_string()
        ));
    }
    
    // Correlation distance is 1 - correlation
    Ok(1.0 - correlation)
}

/// Calculate Jaccard distance for binary data
fn calculate_jaccard(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let options = binary_options.ok_or_else(|| 
        ClusteringError::DistanceCalculationError(
            "Binary options required for Jaccard distance".to_string()
        )
    )?;
    
    let present = options.present_value;
    
    let mut count_both_present = 0;
    let mut count_any_present = 0;
    
    for i in 0..point1.len() {
        let p1_present = (point1[i] - present).abs() < f64::EPSILON;
        let p2_present = (point2[i] - present).abs() < f64::EPSILON;
        
        if p1_present && p2_present {
            count_both_present += 1;
        }
        
        if p1_present || p2_present {
            count_any_present += 1;
        }
    }
    
    if count_any_present == 0 {
        return Ok(0.0); // All absent in both vectors
    }
    
    let jaccard_similarity = count_both_present as f64 / count_any_present as f64;
    
    Ok(1.0 - jaccard_similarity)
}

/// Calculate Chi-square distance for count data
fn calculate_chi_square(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut distance = 0.0;
    
    for i in 0..point1.len() {
        let sum = point1[i] + point2[i];
        
        if sum > 0.0 {
            let diff = point1[i] - point2[i];
            distance += (diff * diff) / sum;
        }
    }
    
    if distance.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in Chi-square distance calculation".to_string()
        ));
    }
    
    Ok(distance.sqrt())
}

/// Calculate Minkowski distance with parameter p
fn calculate_minkowski(
    point1: &[f64], 
    point2: &[f64], 
    p_param: Option<f64>
) -> Result<f64, ClusteringError> {
    let p = p_param.unwrap_or(2.0); // Default to Euclidean (p=2) if not specified
    
    if p <= 0.0 {
        return Err(ClusteringError::DistanceCalculationError(
            "Minkowski parameter p must be positive".to_string()
        ));
    }
    
    // For p=1, it's Manhattan distance
    if (p - 1.0).abs() < f64::EPSILON {
        return calculate_manhattan(point1, point2);
    }
    
    // For p=2, it's Euclidean distance
    if (p - 2.0).abs() < f64::EPSILON {
        return calculate_euclidean(point1, point2);
    }
    
    // For p=∞, it's Chebyshev distance
    if p.is_infinite() && p.is_sign_positive() {
        return calculate_chebyshev(point1, point2);
    }
    
    // Calculate general Minkowski distance
    let mut sum = 0.0;
    
    for i in 0..point1.len() {
        sum += (point1[i] - point2[i]).abs().powf(p);
    }
    
    if sum.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in Minkowski distance calculation".to_string()
        ));
    }
    
    Ok(sum.powf(1.0 / p))
}

/// Pre-compute values for distance calculations where applicable
fn precompute_distance_values(
    data: &[Vec<f64>],
    metric: DistanceMetric
) -> Result<Option<Vec<Vec<f64>>>, ClusteringError> {
    match metric {
        DistanceMetric::Correlation => {
            // Pre-compute means for each vector
            let mut means = Vec::with_capacity(data.len());
            for point in data {
                if point.is_empty() {
                    return Err(ClusteringError::DistanceCalculationError(
                        "Empty point encountered when pre-computing means".to_string()
                    ));
                }
                let mean = point.iter().sum::<f64>() / point.len() as f64;
                means.push(vec![mean]);
            }
            Ok(Some(means))
        },
        DistanceMetric::Cosine => {
            // Pre-compute norms for each vector
            let mut norms = Vec::with_capacity(data.len());
            for point in data {
                let norm = point.iter().map(|&x| x * x).sum::<f64>().sqrt();
                norms.push(vec![norm]);
            }
            Ok(Some(norms))
        },
        _ => Ok(None)
    }
}

/// Calculate distance matrix for a set of points
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `metric` - Distance metric to use
/// * `params` - Optional parameters for specific metrics
/// * `binary_options` - Options for binary metrics
///
/// # Returns
/// * Result containing distance matrix or error
pub fn calculate_distance_matrix(
    data: &[Vec<f64>],
    metric: DistanceMetric,
    params: Option<f64>,
    binary_options: Option<&BinaryOptions>,
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    let n = data.len();
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "Empty data provided for distance matrix calculation".to_string()
        ));
    }
    
    let mut distance_matrix = vec![vec![0.0; n]; n];
    
    // Pre-compute values for certain metrics if needed
    let precomputed = precompute_distance_values(data, metric)?;
    
    for i in 0..n {
        for j in (i+1)..n {
            let dist = calculate_distance(&data[i], &data[j], metric, params, binary_options)?;
            distance_matrix[i][j] = dist;
            distance_matrix[j][i] = dist; // Distance matrix is symmetric
        }
    }
    
    Ok(distance_matrix)
}

/// Transform distance matrix based on specified transformation
///
/// # Arguments
/// * `distance_matrix` - Input distance matrix to transform
/// * `transformation` - Transformation to apply
///
/// # Returns
/// * Transformed distance matrix
pub fn transform_distance_matrix(
    distance_matrix: &[Vec<f64>],
    transformation: DistanceTransformation,
) -> Vec<Vec<f64>> {
    let n = distance_matrix.len();
    let mut transformed = vec![vec![0.0; n]; n];
    
    match transformation {
        DistanceTransformation::AbsoluteValue => {
            for i in 0..n {
                for j in 0..n {
                    transformed[i][j] = distance_matrix[i][j].abs();
                }
            }
        },
        DistanceTransformation::ChangeSign => {
            for i in 0..n {
                for j in 0..n {
                    transformed[i][j] = -distance_matrix[i][j];
                }
            }
        },
        DistanceTransformation::RescaleZeroToOne => {
            // Find min and max values
            let mut min_val = f64::INFINITY;
            let mut max_val = f64::NEG_INFINITY;
            
            for i in 0..n {
                for j in 0..n {
                    let val = distance_matrix[i][j];
                    if !val.is_nan() && i != j { // Exclude diagonal elements
                        min_val = min_val.min(val);
                        max_val = max_val.max(val);
                    }
                }
            }
            
            let range = max_val - min_val;
            
            if range > f64::EPSILON {
                for i in 0..n {
                    for j in 0..n {
                        if i == j {
                            transformed[i][j] = 0.0;
                        } else {
                            transformed[i][j] = (distance_matrix[i][j] - min_val) / range;
                        }
                    }
                }
            } else {
                // All non-diagonal elements are the same
                for i in 0..n {
                    for j in 0..n {
                        transformed[i][j] = if i == j { 0.0 } else { 0.5 };
                    }
                }
            }
        },
        DistanceTransformation::None => {
            // Just copy the matrix
            for i in 0..n {
                for j in 0..n {
                    transformed[i][j] = distance_matrix[i][j];
                }
            }
        },
    }
    
    transformed
}

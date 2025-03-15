use crate::hierarchical::types::{ClusteringError, DistanceMetric, BinaryOptions};
use crate::hierarchical::utils::missing::has_valid_values_for_distance;
use std::f64;

/// Calculate distance between two points using specified metric
///
/// # Arguments
/// * `point1` - First data point as slice of f64
/// * `point2` - Second data point as slice of f64
/// * `metric` - Distance metric to use
/// * `params` - Optional parameters for specific metrics (e.g., p for Minkowski)
/// * `binary_options` - Options for binary distance metrics
/// * `custom_power` - Optional power parameter for Customized metric
/// * `custom_root` - Optional root parameter for Customized metric
///
/// # Returns
/// * Result with distance value or error
pub fn calculate_distance(
    point1: &[f64],
    point2: &[f64],
    metric: DistanceMetric,
    params: Option<f64>,
    binary_options: Option<&BinaryOptions>,
    custom_power: Option<f64>,
    custom_root: Option<f64>,
) -> Result<f64, ClusteringError> {
    // Check that points have same dimension
    if point1.len() != point2.len() {
        return Err(ClusteringError::DistanceCalculationError(
            format!("Points have different dimensions: {} vs {}", point1.len(), point2.len())
        ));
    }
    
    // Check if we have valid values to compare
    if !has_valid_values_for_distance(point1, point2) {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate distance".to_string()
        ));
    }

    // Return appropriate distance based on metric
    match metric {
        // Interval metrics
        DistanceMetric::Euclidean => calculate_euclidean(point1, point2),
        DistanceMetric::SquaredEuclidean => calculate_squared_euclidean(point1, point2),
        DistanceMetric::Manhattan => calculate_manhattan(point1, point2),
        DistanceMetric::Chebyshev => calculate_chebyshev(point1, point2),
        DistanceMetric::Cosine => calculate_cosine(point1, point2),
        DistanceMetric::Correlation => calculate_correlation(point1, point2),
        DistanceMetric::Minkowski => calculate_minkowski(point1, point2, params),
        DistanceMetric::Customized => calculate_customized(point1, point2, custom_power, custom_root),
        
        // Count metrics
        DistanceMetric::ChiSquare => calculate_chi_square(point1, point2),
        DistanceMetric::PhiSquare => calculate_phi_square(point1, point2),
        
        // Binary metrics
        DistanceMetric::Jaccard => calculate_jaccard(point1, point2, binary_options),
        DistanceMetric::BinaryEuclidean => calculate_binary_euclidean(point1, point2, binary_options),
        DistanceMetric::BinarySquaredEuclidean => calculate_binary_squared_euclidean(point1, point2, binary_options),
        DistanceMetric::SizeDifference => calculate_size_difference(point1, point2, binary_options),
        DistanceMetric::PatternDifference => calculate_pattern_difference(point1, point2, binary_options),
        DistanceMetric::Variance => calculate_binary_variance(point1, point2, binary_options),
        DistanceMetric::Dispersion => calculate_binary_dispersion(point1, point2, binary_options),
        DistanceMetric::Shape => calculate_binary_shape(point1, point2, binary_options),
        DistanceMetric::SimpleMatching => calculate_simple_matching(point1, point2, binary_options),
        DistanceMetric::Phi4PointCorrelation => calculate_phi_correlation(point1, point2, binary_options),
        DistanceMetric::Lambda => calculate_lambda(point1, point2, binary_options),
        DistanceMetric::AnderbergD => calculate_anderberg_d(point1, point2, binary_options),
        DistanceMetric::Dice => calculate_dice(point1, point2, binary_options),
        DistanceMetric::Hamann => calculate_hamann(point1, point2, binary_options),
        DistanceMetric::Kulczynski1 => calculate_kulczynski1(point1, point2, binary_options),
        DistanceMetric::Kulczynski2 => calculate_kulczynski2(point1, point2, binary_options),
        DistanceMetric::LanceWilliams => calculate_lance_williams(point1, point2, binary_options),
        DistanceMetric::Ochiai => calculate_ochiai(point1, point2, binary_options),
        DistanceMetric::RogersTanimoto => calculate_rogers_tanimoto(point1, point2, binary_options),
        DistanceMetric::RussellRao => calculate_russell_rao(point1, point2, binary_options),
        DistanceMetric::SokalSneath1 => calculate_sokal_sneath1(point1, point2, binary_options),
        DistanceMetric::SokalSneath2 => calculate_sokal_sneath2(point1, point2, binary_options),
        DistanceMetric::SokalSneath3 => calculate_sokal_sneath3(point1, point2, binary_options),
        DistanceMetric::SokalSneath4 => calculate_sokal_sneath4(point1, point2, binary_options),
        DistanceMetric::SokalSneath5 => calculate_sokal_sneath5(point1, point2, binary_options),
        DistanceMetric::YuleY => calculate_yule_y(point1, point2, binary_options),
        DistanceMetric::YuleQ => calculate_yule_q(point1, point2, binary_options),
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
    let mut valid_dims = 0;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        let diff = point1[i] - point2[i];
        sum_sq += diff * diff;
        valid_dims += 1;
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate squared Euclidean distance".to_string()
        ));
    }
    
    // Adjust for missing dimensions by scaling up
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    let scaled_sum_sq = sum_sq * scale_factor;
    
    if scaled_sum_sq.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in squared Euclidean distance calculation".to_string()
        ));
    }
    
    Ok(scaled_sum_sq)
}

/// Calculate Manhattan (city block) distance
fn calculate_manhattan(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut sum = 0.0;
    let mut valid_dims = 0;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        sum += (point1[i] - point2[i]).abs();
        valid_dims += 1;
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate Manhattan distance".to_string()
        ));
    }
    
    // Adjust for missing dimensions by scaling up
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    let scaled_sum = sum * scale_factor;
    
    if scaled_sum.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in Manhattan distance calculation".to_string()
        ));
    }
    
    Ok(scaled_sum)
}

/// Calculate Chebyshev distance (maximum coordinate difference)
fn calculate_chebyshev(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut max_diff = 0.0;
    let mut found_valid = false;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        let diff = (point1[i] - point2[i]).abs();
        if diff > max_diff || !found_valid {
            max_diff = diff;
            found_valid = true;
        }
    }
    
    if !found_valid {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate Chebyshev distance".to_string()
        ));
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
    let mut valid_dims = 0;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        dot_product += point1[i] * point2[i];
        norm1 += point1[i] * point1[i];
        norm2 += point2[i] * point2[i];
        valid_dims += 1;
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate cosine distance".to_string()
        ));
    }
    
    if norm1 <= f64::EPSILON || norm2 <= f64::EPSILON {
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
    // Filter out missing values and create vectors of valid pairs
    let mut valid_pairs = Vec::new();
    
    for i in 0..point1.len() {
        if !point1[i].is_nan() && !point2[i].is_nan() {
            valid_pairs.push((point1[i], point2[i]));
        }
    }
    
    if valid_pairs.is_empty() {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate correlation distance".to_string()
        ));
    }
    
    // Check if all values are identical in either vector
    let all_identical1 = valid_pairs.windows(2).all(|w| (w[0].0 - w[1].0).abs() < f64::EPSILON);
    let all_identical2 = valid_pairs.windows(2).all(|w| (w[0].1 - w[1].1).abs() < f64::EPSILON);
    
    if all_identical1 && all_identical2 {
        // Both vectors are constant
        return if (valid_pairs[0].0 - valid_pairs[0].1).abs() < f64::EPSILON {
            Ok(0.0) // Perfect correlation for identical constant vectors
        } else {
            Ok(1.0) // No correlation for different constant vectors
        };
    } else if all_identical1 || all_identical2 {
        // One vector is constant - correlation is undefined
        return Ok(1.0); // Set to maximum distance as a convention
    }
    
    // Calculate means
    let n = valid_pairs.len() as f64;
    let mean1: f64 = valid_pairs.iter().map(|&(x, _)| x).sum::<f64>() / n;
    let mean2: f64 = valid_pairs.iter().map(|&(_, y)| y).sum::<f64>() / n;
    
    let mut numerator = 0.0;
    let mut denom1 = 0.0;
    let mut denom2 = 0.0;
    
    // Calculate correlation
    for &(x1, x2) in &valid_pairs {
        let diff1 = x1 - mean1;
        let diff2 = x2 - mean2;
        
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

/// Calculate contingency table for binary data
/// 
/// Returns (a, b, c, d) where:
/// - a = count of attributes where both objects have present value (1,1)
/// - b = count of attributes where first object has present, second has absent (1,0)
/// - c = count of attributes where first object has absent, second has present (0,1)
/// - d = count of attributes where both objects have absent values (0,0)
fn calculate_binary_contingency(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<(usize, usize, usize, usize, usize), ClusteringError> {
    let options = binary_options.ok_or_else(|| 
        ClusteringError::DistanceCalculationError(
            "Binary options required for binary distance metrics".to_string()
        )
    )?;
    
    let present = options.present_value;
    
    let mut a = 0; // Both present (1,1)
    let mut b = 0; // First present, second absent (1,0)
    let mut c = 0; // First absent, second present (0,1)
    let mut d = 0; // Both absent (0,0)
    let mut valid_dims = 0;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        valid_dims += 1;
        
        let p1_present = (point1[i] - present).abs() < f64::EPSILON;
        let p2_present = (point2[i] - present).abs() < f64::EPSILON;
        
        if p1_present && p2_present {
            a += 1;     // (1,1)
        } else if p1_present && !p2_present {
            b += 1;     // (1,0)
        } else if !p1_present && p2_present {
            c += 1;     // (0,1)
        } else {
            d += 1;     // (0,0)
        }
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate binary distances".to_string()
        ));
    }
    
    Ok((a, b, c, d, valid_dims))
}

/// Calculate Jaccard distance for binary data
fn calculate_jaccard(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, _) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let count_any_present = a + b + c;
    
    if count_any_present == 0 {
        return Ok(0.0); // All absent in both vectors
    }
    
    let jaccard_similarity = a as f64 / count_any_present as f64;
    
    Ok(1.0 - jaccard_similarity)
}

/// Calculate Binary Euclidean distance
fn calculate_binary_euclidean(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (_, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let distance = ((b + c) as f64).sqrt();
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor.sqrt())
}

/// Calculate Binary Squared Euclidean distance
fn calculate_binary_squared_euclidean(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (_, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let distance = (b + c) as f64;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Size Difference distance
fn calculate_size_difference(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let p1_size = a + b;
    let p2_size = a + c;
    
    let distance = ((p1_size as isize) - (p2_size as isize)).abs() as f64;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Pattern Difference distance
fn calculate_pattern_difference(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (_, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let distance = 2.0 * (b.min(c)) as f64;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Binary Variance distance
fn calculate_binary_variance(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for variance distance".to_string()
        ));
    }
    
    let p1_freq = (a + b) as f64 / n as f64;
    let p2_freq = (a + c) as f64 / n as f64;
    
    let distance = (p1_freq * (1.0 - p1_freq) + p2_freq * (1.0 - p2_freq)) / 2.0;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Binary Dispersion distance
fn calculate_binary_dispersion(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for dispersion distance".to_string()
        ));
    }
    
    let distance = (b + c) as f64 / n as f64;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Binary Shape distance
fn calculate_binary_shape(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for shape distance".to_string()
        ));
    }
    
    let n_f64 = n as f64;
    let distance = (n_f64 * (b + c) as f64 - ((a + b) as f64 - (a + c) as f64).powi(2)) / 
                 (n_f64 * n_f64);
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Simple Matching distance
fn calculate_simple_matching(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for simple matching distance".to_string()
        ));
    }
    
    // SM similarity = (a + d) / (a + b + c + d)
    // SM distance = 1 - SM similarity = (b + c) / (a + b + c + d)
    let distance = (b + c) as f64 / n as f64;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}


/// Calculate Phi 4-Point Correlation distance
fn calculate_phi_correlation(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (a * d - b * c) as f64;
    let den_sq = ((a + b) * (a + c) * (b + d) * (c + d)) as f64;
    
    let distance = if den_sq > f64::EPSILON {
        let phi = num / den_sq.sqrt();
        (1.0 - phi) / 2.0 // Scale to [0,1]
    } else {
        0.5 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Lambda distance
fn calculate_lambda(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = 2.0 * (b * c) as f64;
    let den = (a * d + b * c) as f64;
    
    let distance = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Anderberg's D distance
fn calculate_anderberg_d(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (b + c) as f64;
    let den = (a + b + c + d) as f64;
    
    let distance = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Dice distance
fn calculate_dice(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (b + c) as f64;
    let den = (2.0 * a as f64 + b as f64 + c as f64);
    
    let distance = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Hamann distance
fn calculate_hamann(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for Hamann distance".to_string()
        ));
    }
    
    // HAMANN = ((a + d) - (b + c)) / (a + b + c + d)
    // Distance = (1 - HAMANN) / 2 to scale to [0,1]
    
    let similarity = ((a + d) as isize - (b + c) as isize) as f64 / n as f64;
    let distance = (1.0 - similarity) / 2.0; // Scale to [0,1]
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Kulczynski 1 distance
fn calculate_kulczynski1(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    if a == 0 {
        return Ok(1.0); // Maximum distance if no matches
    }
    
    let distance = (b + c) as f64 / a as f64;
    
    // Normalize to [0,1] using 1/(1+x) transform
    let normalized = 1.0 - (1.0 / (1.0 + distance));
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(normalized * scale_factor)
}

/// Calculate Kulczynski 2 distance
fn calculate_kulczynski2(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let p1 = a + b;
    let p2 = a + c;
    
    if p1 == 0 || p2 == 0 {
        return Ok(1.0); // Maximum distance if any vector has no present values
    }
    
    let similarity = 0.5 * (a as f64 / p1 as f64 + a as f64 / p2 as f64);
    let distance = 1.0 - similarity;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Lance and Williams (Bray-Curtis) distance
fn calculate_lance_williams(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    // DICE = 2a / (2a + b + c)
    // Distance = 1 - DICE = (b + c) / (2a + b + c)
    
    let denominator = (2 * a + b + c) as f64;
    
    let distance = if denominator > f64::EPSILON {
        (b + c) as f64 / denominator
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Ochiai distance
fn calculate_ochiai(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    // OCHIAI = a / √((a+b)(a+c))
    
    let denominator = ((a + b) * (a + c)) as f64;
    
    let similarity = if denominator > f64::EPSILON {
        a as f64 / denominator.sqrt()
    } else {
        0.0 // Default when undefined
    };
    
    // Distance is complement of similarity
    let distance = 1.0 - similarity;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Rogers and Tanimoto distance
fn calculate_rogers_tanimoto(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (2.0 * (b + c) as f64) as f64;
    let den = (a + d) as f64 + num;
    
    let distance = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Russell and Rao distance
fn calculate_russell_rao(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for Russell and Rao distance".to_string()
        ));
    }
    
    let similarity = a as f64 / n as f64;
    let distance = 1.0 - similarity;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Sokal and Sneath 1 distance
fn calculate_sokal_sneath1(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, _, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (2.0 * (b + c) as f64) as f64;
    let den = num + a as f64;
    
    let distance = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Sokal and Sneath 2 distance
fn calculate_sokal_sneath2(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (a + d) as f64;
    let den = num + 2.0 * (b + c) as f64;
    
    let similarity = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    let distance = 1.0 - similarity;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Sokal and Sneath 3 distance
fn calculate_sokal_sneath3(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let p1 = a + b;
    let p2 = a + c;
    let q1 = c + d;
    let q2 = b + d;
    
    let sim_term1 = if p1 > 0 && p2 > 0 { a as f64 / ((p1 * p2) as f64).sqrt() } else { 0.0 };
    let sim_term2 = if q1 > 0 && q2 > 0 { d as f64 / ((q1 * q2) as f64).sqrt() } else { 0.0 };
    
    let similarity = (sim_term1 + sim_term2) / 2.0;
    let distance = 1.0 - similarity;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Sokal and Sneath 4 distance
fn calculate_sokal_sneath4(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let n = a + b + c + d;
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid binary data for Sokal and Sneath 4 distance".to_string()
        ));
    }
    
    // SS4 = (a/(a+b) + a/(a+c) + d/(b+d) + d/(c+d)) / 4
    // Calculate the conditional probabilities terms
    let term1 = if a + b > 0 { a as f64 / (a + b) as f64 } else { 0.0 };
    let term2 = if a + c > 0 { a as f64 / (a + c) as f64 } else { 0.0 };
    let term3 = if b + d > 0 { d as f64 / (b + d) as f64 } else { 0.0 };
    let term4 = if c + d > 0 { d as f64 / (c + d) as f64 } else { 0.0 };
    
    let similarity = (term1 + term2 + term3 + term4) / 4.0;
    let distance = 1.0 - similarity;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Sokal and Sneath 5 distance
fn calculate_sokal_sneath5(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    let num = (b + c) as f64;
    let den = (a + b + c) as f64;
    
    let distance = if den > f64::EPSILON {
        num / den
    } else {
        0.0 // Default when undefined
    };
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Yule's Y distance
fn calculate_yule_y(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    // Y = (√(ad) - √(bc)) / (√(ad) + √(bc))
    
    let ad_sqrt = ((a * d) as f64).sqrt();
    let bc_sqrt = ((b * c) as f64).sqrt();
    
    let denominator = ad_sqrt + bc_sqrt;
    
    let similarity = if denominator > f64::EPSILON {
        (ad_sqrt - bc_sqrt) / denominator
    } else {
        0.0 // Default when undefined
    };
    
    // Convert to distance [0,1] range
    let distance = (1.0 - similarity) / 2.0;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Yule's Q distance
fn calculate_yule_q(
    point1: &[f64], 
    point2: &[f64], 
    binary_options: Option<&BinaryOptions>
) -> Result<f64, ClusteringError> {
    let (a, b, c, d, valid_dims) = calculate_binary_contingency(point1, point2, binary_options)?;
    
    // Q = (ad - bc) / (ad + bc)
    
    let ad = (a * d) as f64;
    let bc = (b * c) as f64;
    let denominator = ad + bc;
    
    let similarity = if denominator > f64::EPSILON {
        (ad - bc) / denominator
    } else {
        0.0 // Default when undefined
    };
    
    // Convert to distance [0,1] range
    let distance = (1.0 - similarity) / 2.0;
    
    // Scale for dimensionality
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    Ok(distance * scale_factor)
}

/// Calculate Chi-square distance for count data
fn calculate_chi_square(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    let mut chi_square = 0.0;
    let mut valid_dims = 0;
    
    // First calculate expected values based on the model of independence
    // For each dimension, expected value is based on row and column totals
    let mut total_sum1 = 0.0;
    let mut total_sum2 = 0.0;
    
    for i in 0..point1.len() {
        if !point1[i].is_nan() && !point2[i].is_nan() {
            total_sum1 += point1[i];
            total_sum2 += point2[i];
        }
    }
    
    let total_sum = total_sum1 + total_sum2;
    
    if total_sum < f64::EPSILON {
        return Err(ClusteringError::DistanceCalculationError(
            "Zero total sum encountered in Chi-square distance calculation".to_string()
        ));
    }
    
    // Calculate Chi-square distance
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        valid_dims += 1;
        
        // Calculate expected values for the model of independence
        let expected1 = total_sum1 * (point1[i] + point2[i]) / total_sum;
        let expected2 = total_sum2 * (point1[i] + point2[i]) / total_sum;
        
        // Add terms to chi-square sum
        if expected1 > f64::EPSILON {
            chi_square += (point1[i] - expected1).powi(2) / expected1;
        }
        
        if expected2 > f64::EPSILON {
            chi_square += (point2[i] - expected2).powi(2) / expected2;
        }
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate Chi-square distance".to_string()
        ));
    }
    
    // Take the square root as per the formula
    Ok(chi_square.sqrt())
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
    let mut valid_dims = 0;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        sum += (point1[i] - point2[i]).abs().powf(p);
        valid_dims += 1;
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate Minkowski distance".to_string()
        ));
    }
    
    // Adjust for missing dimensions
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    let scaled_sum = sum * scale_factor;
    
    if scaled_sum.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in Minkowski distance calculation".to_string()
        ));
    }
    
    Ok(scaled_sum.powf(1.0 / p))
}

/// Calculate customized distance with power and root parameters
fn calculate_customized(
    point1: &[f64], 
    point2: &[f64], 
    power_param: Option<f64>,
    root_param: Option<f64>
) -> Result<f64, ClusteringError> {
    let power = power_param.unwrap_or(2.0); // Default to 2 if not specified
    let root = root_param.unwrap_or(2.0);   // Default to 2 if not specified
    
    if power <= 0.0 {
        return Err(ClusteringError::DistanceCalculationError(
            "Customized power parameter must be positive".to_string()
        ));
    }
    
    if root <= 0.0 {
        return Err(ClusteringError::DistanceCalculationError(
            "Customized root parameter must be positive".to_string()
        ));
    }
    
    // Calculate customized distance
    let mut sum = 0.0;
    let mut valid_dims = 0;
    
    for i in 0..point1.len() {
        // Skip missing values
        if point1[i].is_nan() || point2[i].is_nan() {
            continue;
        }
        
        sum += (point1[i] - point2[i]).abs().powf(power);
        valid_dims += 1;
    }
    
    if valid_dims == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate customized distance".to_string()
        ));
    }
    
    // Adjust for missing dimensions
    let scale_factor = point1.len() as f64 / valid_dims as f64;
    let scaled_sum = sum * scale_factor;
    
    if scaled_sum.is_nan() {
        return Err(ClusteringError::DistanceCalculationError(
            "NaN encountered in customized distance calculation".to_string()
        ));
    }
    
    Ok(scaled_sum.powf(1.0 / root))
}

/// Calculate Phi-Square distance for count data
fn calculate_phi_square(point1: &[f64], point2: &[f64]) -> Result<f64, ClusteringError> {
    // First calculate the Chi-Square distance
    let chi_square = calculate_chi_square(point1, point2)?;
    
    // Count the number of valid dimensions
    let mut n = 0;
    for i in 0..point1.len() {
        if !point1[i].is_nan() && !point2[i].is_nan() {
            n += 1;
        }
    }
    
    if n == 0 {
        return Err(ClusteringError::DistanceCalculationError(
            "No valid dimensions to calculate Phi-square distance".to_string()
        ));
    }
    
    // Normalize by the square root of N as per the formula
    Ok(chi_square / (n as f64).sqrt())
}

/// Pre-compute values for distance calculations where applicable
pub fn precompute_distance_values(
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
                
                // Menghitung rata-rata, mengabaikan NaN
                let mut sum = 0.0;
                let mut count = 0;
                for &val in point {
                    if !val.is_nan() {
                        sum += val;
                        count += 1;
                    }
                }
                
                if count == 0 {
                    means.push(vec![f64::NAN]);
                } else {
                    means.push(vec![sum / count as f64]);
                }
            }
            Ok(Some(means))
        },
        DistanceMetric::Cosine => {
            // Pre-compute norms for each vector
            let mut norms = Vec::with_capacity(data.len());
            for point in data {
                // Menghitung norm, mengabaikan NaN
                let mut sum_sq = 0.0;
                for &val in point {
                    if !val.is_nan() {
                        sum_sq += val * val;
                    }
                }
                
                norms.push(vec![sum_sq.sqrt()]);
            }
            Ok(Some(norms))
        },
        _ => Ok(None)
    }
}
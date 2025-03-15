/// Calculate the Euclidean distance between two vectors.
///
/// # Arguments
/// * `v1` - First vector
/// * `v2` - Second vector
///
/// # Returns
/// * `f64` - The Euclidean distance between the vectors or NaN if dimensions don't match
pub fn euclidean_distance(v1: &[f64], v2: &[f64]) -> f64 {
    if v1.len() != v2.len() {
        return f64::NAN; // Return NaN for vectors of different dimensions
    }
    
    // Untuk mencegah underflow/overflow, gunakan teknik yang lebih stabil
    let mut sum_squares = 0.0;
    for i in 0..v1.len() {
        let diff = v1[i] - v2[i];
        sum_squares += diff * diff;
    }
    
    // Round to 3 decimal places for SPSS compatibility
    let distance = sum_squares.sqrt();
    (distance * 1000.0).round() / 1000.0
}

/// Find the minimum distance between any two cluster centers.
///
/// # Arguments
/// * `centers` - Vector of cluster centers
///
/// # Returns
/// * `(f64, usize, usize)` - The minimum distance and indices of the two closest centers
pub fn min_cluster_distance(centers: &[Vec<f64>]) -> (f64, usize, usize) {
    let mut min_dist = f64::INFINITY;
    let mut closest_pair = (0, 0);
    
    for i in 0..centers.len() {
        for j in (i+1)..centers.len() {
            let dist = euclidean_distance(&centers[i], &centers[j]);
            if dist < min_dist {
                min_dist = dist;
                closest_pair = (i, j);
            }
        }
    }
    
    (min_dist, closest_pair.0, closest_pair.1)
}

/// Find the closest cluster center to a data point.
///
/// # Arguments
/// * `point` - The data point
/// * `centers` - Vector of cluster centers
///
/// # Returns
/// * `(usize, f64)` - The index of the closest center and the distance to it
pub fn closest_cluster(point: &[f64], centers: &[Vec<f64>]) -> (usize, f64) {
    centers
        .iter()
        .enumerate()
        .map(|(i, center)| (i, euclidean_distance(point, center)))
        .min_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal))
        .unwrap_or((0, f64::INFINITY))
}

/// Find the two closest cluster centers to a data point.
///
/// # Arguments
/// * `point` - The data point
/// * `centers` - Vector of cluster centers
///
/// # Returns
/// * `((usize, f64), (usize, f64))` - The indices and distances for the two closest centers
pub fn two_closest_clusters(point: &[f64], centers: &[Vec<f64>]) -> ((usize, f64), (usize, f64)) {
    let mut distances: Vec<(usize, f64)> = centers
        .iter()
        .enumerate()
        .map(|(i, center)| (i, euclidean_distance(point, center)))
        .collect();
    
    distances.sort_by(|a, b| a.1.partial_cmp(&b.1).unwrap_or(std::cmp::Ordering::Equal));
    
    if distances.len() >= 2 {
        (distances[0], distances[1])
    } else if distances.len() == 1 {
        (distances[0], (0, f64::INFINITY))
    } else {
        ((0, f64::INFINITY), (0, f64::INFINITY))
    }
}
use crate::hierarchical::types::DistanceTransformation;

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
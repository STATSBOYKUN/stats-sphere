use std::collections::HashMap;

pub fn euclidean_distance(a: &[f64], b: &[f64]) -> f64 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y).powi(2))
        .sum::<f64>()
        .sqrt()
}

pub fn find_nearest_cluster(point: &[f64], centers: &[Vec<f64>]) -> (usize, f64) {
    let mut min_dist = f64::MAX;
    let mut nearest = 0;

    for (i, center) in centers.iter().enumerate() {
        let dist = euclidean_distance(point, center);
        if dist < min_dist {
            min_dist = dist;
            nearest = i;
        }
    }

    (nearest, min_dist)
}

pub fn find_closest_cluster(point: &[f64], centers: &[Vec<f64>]) -> usize {
    let (closest, _) = find_nearest_cluster(point, centers);
    closest
}

pub fn find_second_closest_cluster(point: &[f64], centers: &[Vec<f64>], closest: usize) -> usize {
    let mut min_dist = f64::MAX;
    let mut second_closest = if closest == 0 { 1 } else { 0 };

    for (i, center) in centers.iter().enumerate() {
        if i != closest {
            let dist = euclidean_distance(point, center);
            if dist < min_dist {
                min_dist = dist;
                second_closest = i;
            }
        }
    }

    second_closest
}

pub fn min_distance_between_centers(centers: &[Vec<f64>]) -> (f64, usize, usize) {
    let mut min_dist = f64::MAX;
    let mut min_i = 0;
    let mut min_j = 1;

    for i in 0..centers.len() {
        for j in i + 1..centers.len() {
            let dist = euclidean_distance(&centers[i], &centers[j]);
            if dist < min_dist {
                min_dist = dist;
                min_i = i;
                min_j = j;
            }
        }
    }

    (min_dist, min_i, min_j)
}

pub fn min_distance_from_cluster(centers: &[Vec<f64>], cluster_idx: usize) -> f64 {
    let mut min_dist = f64::MAX;

    for (i, center) in centers.iter().enumerate() {
        if i != cluster_idx {
            let dist = euclidean_distance(&centers[cluster_idx], center);
            if dist < min_dist {
                min_dist = dist;
            }
        }
    }

    min_dist
}

pub fn convert_map_to_matrix(
    centers_map: &HashMap<String, Vec<f64>>,
    variables: &[String]
) -> Vec<Vec<f64>> {
    let num_clusters = if centers_map.is_empty() {
        0
    } else {
        centers_map.values().next().unwrap().len()
    };

    let mut matrix = vec![vec![0.0; variables.len()]; num_clusters];

    for (var_idx, var) in variables.iter().enumerate() {
        if let Some(values) = centers_map.get(var) {
            for (cluster_idx, value) in values.iter().enumerate() {
                if cluster_idx < matrix.len() {
                    matrix[cluster_idx][var_idx] = *value;
                }
            }
        }
    }

    matrix
}

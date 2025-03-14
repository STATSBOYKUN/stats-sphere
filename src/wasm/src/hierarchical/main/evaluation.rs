use super::types::{ClusterMembership, ClusterEvaluation, ClusteringError};
use statrs::distribution::{ChiSquared, ContinuousCDF};
use statrs::distribution::{FisherSnedecor, StudentsT};
use std::collections::HashMap;

/// Calculate evaluation metrics for a clustering solution
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
/// * `distance_matrix` - Pre-computed distance matrix
///
/// # Returns
/// * Result with evaluation metrics or error
pub fn evaluate_clustering(
    data: &[Vec<f64>],
    membership: &ClusterMembership,
    distance_matrix: &[Vec<f64>]
) -> Result<ClusterEvaluation, ClusteringError> {
    let silhouette = calculate_silhouette(distance_matrix, membership)?;
    let (sse, ssb) = calculate_sum_of_squares(data, membership)?;
    let predictor_importance = calculate_predictor_importance(data, membership)?;
    
    Ok(ClusterEvaluation {
        silhouette,
        sse,
        ssb,
        predictor_importance,
    })
}

/// Calculate Silhouette coefficient
///
/// # Arguments
/// * `distance_matrix` - Pre-computed distance matrix
/// * `membership` - Cluster membership information
///
/// # Returns
/// * Result with Silhouette coefficient or error
fn calculate_silhouette(
    distance_matrix: &[Vec<f64>],
    membership: &ClusterMembership
) -> Result<f64, ClusteringError> {
    let n_cases = membership.case_ids.len();
    let num_clusters = membership.num_clusters;
    
    // Check if we have at least 2 clusters
    if num_clusters < 2 {
        return Err(ClusteringError::EvaluationError(
            "Silhouette coefficient requires at least 2 clusters".to_string()
        ));
    }
    
    // Count cases per cluster
    let mut cluster_sizes = vec![0; num_clusters];
    for &cluster_id in &membership.cluster_ids {
        cluster_sizes[cluster_id] += 1;
    }
    
    // Check if all clusters have at least one member
    if cluster_sizes.iter().any(|&size| size == 0) {
        return Err(ClusteringError::EvaluationError(
            "All clusters must have at least one member".to_string()
        ));
    }
    
    // Pre-calculate cluster assignments for faster lookup
    let mut cluster_members: Vec<Vec<usize>> = vec![Vec::new(); num_clusters];
    for (i, &cluster_id) in membership.cluster_ids.iter().enumerate() {
        cluster_members[cluster_id].push(i);
    }
    
    // Calculate silhouette for each case
    let mut silhouette_values = Vec::with_capacity(n_cases);
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        // Calculate average distance to cases in the same cluster (a_i)
        let mut same_cluster_dist_sum = 0.0;
        let mut same_cluster_count = 0;
        
        for &j in &cluster_members[cluster_id] {
            if i == j {
                continue; // Skip self
            }
            
            same_cluster_dist_sum += distance_matrix[case_id][membership.case_ids[j]];
            same_cluster_count += 1;
        }
        
        // If this is the only point in the cluster, use a default value
        let a_i = if same_cluster_count > 0 {
            same_cluster_dist_sum / same_cluster_count as f64
        } else {
            0.0 // Singleton cluster
        };
        
        // Calculate average distance to cases in the nearest cluster (b_i)
        let mut min_other_cluster_dist = f64::INFINITY;
        
        for other_cluster in 0..num_clusters {
            if other_cluster == cluster_id {
                continue; // Skip own cluster
            }
            
            let mut other_cluster_dist_sum = 0.0;
            let other_cluster_count = cluster_members[other_cluster].len();
            
            if other_cluster_count > 0 {
                for &j in &cluster_members[other_cluster] {
                    other_cluster_dist_sum += distance_matrix[case_id][membership.case_ids[j]];
                }
                
                let avg_dist = other_cluster_dist_sum / other_cluster_count as f64;
                min_other_cluster_dist = min_other_cluster_dist.min(avg_dist);
            }
        }
        
        let b_i = min_other_cluster_dist;
        
        // Calculate silhouette value for this case
        let silhouette_i = if same_cluster_count == 0 {
            0.0 // Singleton cluster
        } else if a_i < b_i {
            1.0 - (a_i / b_i)
        } else if a_i > b_i {
            (b_i / a_i) - 1.0
        } else {
            0.0 // a_i == b_i
        };
        
        silhouette_values.push(silhouette_i);
    }
    
    // Calculate average silhouette
    let avg_silhouette = silhouette_values.iter().sum::<f64>() / n_cases as f64;
    
    Ok(avg_silhouette)
}

/// Calculate Sum of Squares Error (SSE) and Sum of Squares Between (SSB)
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
///
/// # Returns
/// * Result with (SSE, SSB) or error
fn calculate_sum_of_squares(
    data: &[Vec<f64>],
    membership: &ClusterMembership
) -> Result<(f64, f64), ClusteringError> {
    let n_cases = membership.case_ids.len();
    
    if n_cases == 0 {
        return Err(ClusteringError::EvaluationError(
            "No valid cases for sum of squares calculation".to_string()
        ));
    }
    
    let n_vars = data[0].len();
    let num_clusters = membership.num_clusters;
    
    // Calculate overall mean (centroid)
    let mut overall_mean = vec![0.0; n_vars];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        for j in 0..n_vars {
            overall_mean[j] += data[case_id][j];
        }
    }
    
    for j in 0..n_vars {
        overall_mean[j] /= n_cases as f64;
    }
    
    // Calculate cluster centroids
    let mut cluster_centroids = vec![vec![0.0; n_vars]; num_clusters];
    let mut cluster_sizes = vec![0; num_clusters];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        for j in 0..n_vars {
            cluster_centroids[cluster_id][j] += data[case_id][j];
        }
        
        cluster_sizes[cluster_id] += 1;
    }
    
    for cluster_id in 0..num_clusters {
        let size = cluster_sizes[cluster_id] as f64;
        if size > 0.0 {
            for j in 0..n_vars {
                cluster_centroids[cluster_id][j] /= size;
            }
        }
    }
    
    // Calculate SSE (Sum of Squared Errors)
    let mut sse = 0.0;
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        let mut squared_dist = 0.0;
        for j in 0..n_vars {
            let diff = data[case_id][j] - cluster_centroids[cluster_id][j];
            squared_dist += diff * diff;
        }
        
        sse += squared_dist;
    }
    
    // Calculate SSB (Sum of Squares Between clusters)
    let mut ssb = 0.0;
    
    for cluster_id in 0..num_clusters {
        let size = cluster_sizes[cluster_id] as f64;
        let mut squared_dist = 0.0;
        
        for j in 0..n_vars {
            let diff = cluster_centroids[cluster_id][j] - overall_mean[j];
            squared_dist += diff * diff;
        }
        
        ssb += size * squared_dist;
    }
    
    // Return average values for comparability
    Ok((sse / n_cases as f64, ssb / n_cases as f64))
}

/// Calculate predictor importance for variables
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
///
/// # Returns
/// * Result with predictor importance scores or error
fn calculate_predictor_importance(
    data: &[Vec<f64>],
    membership: &ClusterMembership
) -> Result<Vec<f64>, ClusteringError> {
    let n_cases = membership.case_ids.len();
    
    if n_cases == 0 || data.is_empty() || data[0].is_empty() {
        return Err(ClusteringError::EvaluationError(
            "Empty data provided for predictor importance calculation".to_string()
        ));
    }
    
    let n_vars = data[0].len();
    let num_clusters = membership.num_clusters;
    
    // Check if we have at least 2 clusters
    if num_clusters < 2 {
        return Err(ClusteringError::EvaluationError(
            "Predictor importance requires at least 2 clusters".to_string()
        ));
    }
    
    // Calculate F-statistics and p-values for each variable
    let mut p_values = Vec::with_capacity(n_vars);
    
    for var in 0..n_vars {
        let p_value = calculate_f_test_p_value(data, membership, var)?;
        p_values.push(p_value);
    }
    
    // Convert p-values to importance scores
    let max_neg_log_p = p_values.iter()
        .map(|&p| -p.log10())
        .fold(0.0, f64::max);
    
    let importance_scores = if max_neg_log_p > 0.0 {
        p_values.iter()
            .map(|&p| (-p.log10()) / max_neg_log_p)
            .collect()
    } else {
        // If all p-values are 1.0, all variables have equal (no) importance
        vec![0.0; n_vars]
    };
    
    Ok(importance_scores)
}

/// Calculate F-test p-value for a variable
fn calculate_f_test_p_value(
    data: &[Vec<f64>],
    membership: &ClusterMembership,
    var_idx: usize
) -> Result<f64, ClusteringError> {
    let n_cases = membership.case_ids.len();
    let num_clusters = membership.num_clusters;
    
    // Calculate overall mean
    let mut overall_sum = 0.0;
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        overall_sum += data[case_id][var_idx];
    }
    
    let overall_mean = overall_sum / n_cases as f64;
    
    // Calculate between-groups sum of squares
    let mut cluster_means = vec![0.0; num_clusters];
    let mut cluster_sizes = vec![0; num_clusters];
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        cluster_means[cluster_id] += data[case_id][var_idx];
        cluster_sizes[cluster_id] += 1;
    }
    
    for cluster_id in 0..num_clusters {
        if cluster_sizes[cluster_id] > 0 {
            cluster_means[cluster_id] /= cluster_sizes[cluster_id] as f64;
        }
    }
    
    let mut between_ss = 0.0;
    
    for cluster_id in 0..num_clusters {
        let size = cluster_sizes[cluster_id] as f64;
        let diff = cluster_means[cluster_id] - overall_mean;
        between_ss += size * diff * diff;
    }
    
    // Calculate within-groups sum of squares
    let mut within_ss = 0.0;
    
    for i in 0..n_cases {
        let case_id = membership.case_ids[i];
        let cluster_id = membership.cluster_ids[i];
        
        let diff = data[case_id][var_idx] - cluster_means[cluster_id];
        within_ss += diff * diff;
    }
    
    // Calculate degrees of freedom
    let df_between = num_clusters - 1;
    let df_within = n_cases - num_clusters;
    
    if df_within <= 0 {
        return Ok(1.0); // Not enough data points for F-test
    }
    
    // Calculate mean squares
    let ms_between = between_ss / df_between as f64;
    let ms_within = within_ss / df_within as f64;
    
    // Calculate F-statistic
    let f_statistic = if ms_within > 0.0 {
        ms_between / ms_within
    } else if ms_between > 0.0 {
        f64::INFINITY // Perfect separation
    } else {
        0.0 // No variation
    };
    
    // Calculate p-value using F-distribution
    let p_value = if f_statistic.is_finite() && f_statistic > 0.0 {
        let f_dist = match FisherSnedecor::new(df_between as f64, df_within as f64) {
            Ok(dist) => dist,
            Err(_) => return Err(ClusteringError::EvaluationError(
                "Failed to create F-distribution for p-value calculation".to_string()
            ))
        };
        
        1.0 - f_dist.cdf(f_statistic)
    } else if f_statistic.is_infinite() {
        0.0 // Perfect separation - extremely significant
    } else {
        1.0 // No variation - not significant
    };
    
    Ok(p_value)
}

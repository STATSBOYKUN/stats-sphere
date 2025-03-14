use crate::hierarchical::types::{ClusterMembership, ClusteringError};
use statrs::distribution::{FisherSnedecor, ContinuousCDF};
use crate::ensure;

/// Calculate predictor importance for variables
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `membership` - Cluster membership information
///
/// # Returns
/// * Result with predictor importance scores or error
pub(crate) fn calculate_predictor_importance(
    data: &[Vec<f64>],
    membership: &ClusterMembership
) -> Result<Vec<f64>, ClusteringError> {
    let n_cases = membership.case_ids.len();
    
    ensure!(!data.is_empty() && !data[0].is_empty() && n_cases > 0,
        ClusteringError::EvaluationError,
        "Empty data provided for predictor importance calculation"
    );
    
    let n_vars = data[0].len();
    let num_clusters = membership.num_clusters;
    
    // Check if we have at least 2 clusters
    ensure!(num_clusters >= 2,
        ClusteringError::EvaluationError,
        "Predictor importance requires at least 2 clusters"
    );
    
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
        match FisherSnedecor::new(df_between as f64, df_within as f64) {
            Ok(dist) => 1.0 - dist.cdf(f_statistic),
            Err(_) => {
                return Err(ClusteringError::EvaluationError(
                    "Failed to create F-distribution for p-value calculation".to_string()
                ))
            }
        }
    } else if f_statistic.is_infinite() {
        0.0 // Perfect separation - extremely significant
    } else {
        1.0 // No variation - not significant
    };
    
    Ok(p_value)
}
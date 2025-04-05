use std::collections::HashMap;

use crate::twostep::models::{
    config::ClusterConfig,
    result::{ PredictorImportance, ProcessedData },
};

pub fn calculate_predictor_importance(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<PredictorImportance, String> {
    let mut predictors = HashMap::new();

    // Calculate F-statistic based importance for each variable
    for (var_idx, var_name) in processed_data.continuous_variables.iter().enumerate() {
        // Calculate overall mean
        let mut overall_sum = 0.0;
        for row in &processed_data.data_matrix {
            overall_sum += row[var_idx];
        }
        let overall_mean = overall_sum / (processed_data.data_matrix.len() as f64);

        // Calculate between-group and within-group sum of squares
        let mut between_ss = 0.0;
        let mut within_ss = 0.0;

        // Calculate cluster means
        let mut cluster_means = vec![0.0; processed_data.num_clusters as usize];
        let mut cluster_counts = vec![0; processed_data.num_clusters as usize];

        for (i, &cluster) in processed_data.clusters.iter().enumerate() {
            cluster_means[cluster] += processed_data.data_matrix[i][var_idx];
            cluster_counts[cluster] += 1;
        }

        for i in 0..cluster_means.len() {
            if cluster_counts[i] > 0 {
                cluster_means[i] /= cluster_counts[i] as f64;
            }
        }

        // Calculate between-group sum of squares
        for (i, &mean) in cluster_means.iter().enumerate() {
            if cluster_counts[i] > 0 {
                between_ss += (cluster_counts[i] as f64) * (mean - overall_mean).powi(2);
            }
        }

        // Calculate within-group sum of squares
        for (i, &cluster) in processed_data.clusters.iter().enumerate() {
            let cluster_mean = cluster_means[cluster];
            within_ss += (processed_data.data_matrix[i][var_idx] - cluster_mean).powi(2);
        }

        // Calculate F-statistic
        let between_df = (processed_data.num_clusters - 1) as f64;
        let within_df = (processed_data.data_matrix.len() -
            (processed_data.num_clusters as usize)) as f64;

        let between_ms = if between_df > 0.0 { between_ss / between_df } else { 0.0 };
        let within_ms = if within_df > 0.0 { within_ss / within_df } else { 1.0 };

        let f_stat = between_ms / within_ms;

        // Calculate importance (normalized so max importance is 1.0)
        predictors.insert(var_name.clone(), f_stat);
    }

    // For categorical variables, calculate Chi-square based importance
    for (var_idx, var_name) in processed_data.categorical_variables.iter().enumerate() {
        let mut chi_square = 0.0;

        // Get all unique categories
        let mut categories = std::collections::HashSet::new();
        for row in &processed_data.categorical_matrix {
            categories.insert(row[var_idx].clone());
        }

        // Calculate observed and expected frequencies
        let mut observed = vec![vec![0; categories.len()]; processed_data.num_clusters as usize];
        let mut row_totals = vec![0; processed_data.num_clusters as usize];
        let mut col_totals = vec![0; categories.len()];
        let mut total = 0;

        // Create category index map
        let mut cat_indices = HashMap::new();
        for (i, cat) in categories.iter().enumerate() {
            cat_indices.insert(cat.clone(), i);
        }

        // Count occurrences
        for (i, &cluster) in processed_data.clusters.iter().enumerate() {
            let category = &processed_data.categorical_matrix[i][var_idx];
            let cat_idx = *cat_indices.get(category).unwrap_or(&0);

            observed[cluster][cat_idx] += 1;
            row_totals[cluster] += 1;
            col_totals[cat_idx] += 1;
            total += 1;
        }

        // Calculate chi-square
        for i in 0..processed_data.num_clusters as usize {
            for j in 0..categories.len() {
                let expected = ((row_totals[i] as f64) * (col_totals[j] as f64)) / (total as f64);
                if expected > 0.0 {
                    chi_square += ((observed[i][j] as f64) - expected).powi(2) / expected;
                }
            }
        }

        // Calculate Cramer's V as normalized importance
        let min_dim = ((processed_data.num_clusters as usize) - 1).min(categories.len() - 1);
        let importance = if min_dim > 0 && total > 0 {
            (chi_square / ((total as f64) * (min_dim as f64))).sqrt()
        } else {
            0.0
        };

        predictors.insert(var_name.clone(), importance);
    }

    // Normalize to [0, 1] range
    let max_importance = predictors.values().cloned().fold(0.0, f64::max);
    if max_importance > 0.0 {
        for importance in predictors.values_mut() {
            *importance /= max_importance;
        }
    }

    Ok(PredictorImportance {
        predictors,
    })
}

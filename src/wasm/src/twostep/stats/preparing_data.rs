use std::collections::HashMap;

use crate::twostep::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::ProcessedData,
};

use super::core::{ build_cf_tree, determine_optimal_clusters, hierarchical_clustering };

pub fn prepare_clustering_data(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<ProcessedData, String> {
    // Get variables from config
    let categorical_variables = match &config.main.categorical_var {
        Some(vars) => vars.clone(),
        None => Vec::new(),
    };

    let continuous_variables = match &config.main.continuous_var {
        Some(vars) => vars.clone(),
        None => Vec::new(),
    };

    if categorical_variables.is_empty() && continuous_variables.is_empty() {
        return Err("No variables specified for clustering".to_string());
    }

    // Determine number of records
    let record_count = if !data.continuous_data.is_empty() && !data.continuous_data[0].is_empty() {
        data.continuous_data[0].len()
    } else if !data.categorical_data.is_empty() && !data.categorical_data[0].is_empty() {
        data.categorical_data[0].len()
    } else {
        return Err("No data provided".to_string());
    };

    // Initialize data structures
    let mut data_matrix = Vec::new();
    let mut categorical_matrix = Vec::new();
    let mut case_numbers = Vec::new();

    // First pass: collect data and handle missing values
    for case_idx in 0..record_count {
        let mut row = Vec::with_capacity(continuous_variables.len());
        let mut cat_row = Vec::with_capacity(categorical_variables.len());
        let mut has_missing = false;

        // Process continuous variables
        for var_name in &continuous_variables {
            let mut var_value: Option<f64> = None;

            // Search in all datasets
            for dataset in &data.continuous_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(val)) = dataset[case_idx].values.get(var_name) {
                        var_value = Some(*val);
                        break;
                    }
                }
            }

            match var_value {
                Some(val) => row.push(val),
                None => {
                    has_missing = true;
                    break;
                }
            }
        }

        // Skip if continuous data has missing values
        if has_missing {
            continue;
        }

        // Process categorical variables
        for var_name in &categorical_variables {
            let mut var_value: Option<String> = None;

            // Search in all datasets
            for dataset in &data.categorical_data {
                if case_idx < dataset.len() {
                    if let Some(val) = dataset[case_idx].values.get(var_name) {
                        match val {
                            DataValue::Text(text) => {
                                var_value = Some(text.clone());
                            }
                            DataValue::Number(num) => {
                                var_value = Some(num.to_string());
                            }
                            _ => {}
                        }
                        break;
                    }
                }
            }

            match var_value {
                Some(val) => cat_row.push(val),
                None => {
                    has_missing = true;
                    break;
                }
            }
        }

        // Skip if categorical data has missing values
        if has_missing {
            continue;
        }

        data_matrix.push(row);
        categorical_matrix.push(cat_row);
        case_numbers.push((case_idx + 1) as i32);
    }

    if data_matrix.is_empty() {
        return Err("No valid data after preprocessing".to_string());
    }

    // Calculate means and standard deviations for continuous variables
    let mut means = vec![0.0; continuous_variables.len()];
    let mut std_devs = vec![0.0; continuous_variables.len()];

    if !continuous_variables.is_empty() {
        // Calculate means
        for row in &data_matrix {
            for (i, &val) in row.iter().enumerate() {
                means[i] += val;
            }
        }

        let n = data_matrix.len() as f64;
        for i in 0..means.len() {
            means[i] /= n;
        }

        // Calculate standard deviations
        for row in &data_matrix {
            for (i, &val) in row.iter().enumerate() {
                std_devs[i] += (val - means[i]).powi(2);
            }
        }

        for i in 0..std_devs.len() {
            std_devs[i] = (std_devs[i] / n).sqrt();
        }

        // Standardize continuous data if required
        if
            config.main.to_standardized.unwrap_or(true) &&
            !config.main.assumed_standardized.unwrap_or(false)
        {
            for row in &mut data_matrix {
                for i in 0..continuous_variables.len() {
                    if std_devs[i] > 0.0 {
                        row[i] = (row[i] - means[i]) / std_devs[i];
                    }
                }
            }
        }
    }

    // Perform pre-clustering using CF tree
    let sub_clusters = build_cf_tree(
        &data_matrix,
        &categorical_matrix,
        config.main.euclidean,
        config.options.noise,
        config.options.noise_threshold,
        config.options.mx_branch,
        config.options.mx_depth,
        0.0 // Initial threshold (using default since not in config)
    );

    // Determine number of clusters
    let num_clusters = if config.main.fixed {
        config.main.num_cluster
    } else if config.main.auto {
        let optimal_clusters = determine_optimal_clusters(
            &sub_clusters,
            config.main.max_cluster,
            config.main.bic,
            config.main.euclidean
        );
        optimal_clusters
    } else {
        2 // Default
    };

    // Initialize cluster assignments
    let mut clusters = vec![0; data_matrix.len()];

    // Perform hierarchical clustering of sub-clusters
    if sub_clusters.len() > 1 && num_clusters > 0 && num_clusters < (sub_clusters.len() as i32) {
        let cluster_assignments = hierarchical_clustering(
            &sub_clusters,
            num_clusters as usize,
            config.main.euclidean
        );

        // Assign cases to final clusters
        for (sc_idx, sc) in sub_clusters.iter().enumerate() {
            let cluster_id = cluster_assignments[sc_idx];
            for &case_idx in &sc.cases {
                clusters[case_idx] = cluster_id;
            }
        }
    } else {
        // If only one sub-cluster or num_clusters >= sub_clusters.len(), assign all to cluster 0
        for (sc_idx, sc) in sub_clusters.iter().enumerate() {
            let cluster_id = if sc_idx < (num_clusters as usize) { sc_idx } else { 0 };
            for &case_idx in &sc.cases {
                clusters[case_idx] = cluster_id;
            }
        }
    }

    // Initialize variable importance (will be calculated properly later)
    let variable_importance = HashMap::new();

    Ok(ProcessedData {
        categorical_variables,
        continuous_variables,
        data_matrix: data_matrix.clone(),
        categorical_matrix,
        case_numbers,
        clusters,
        sub_clusters,
        means,
        std_devs,
        num_clusters,
        total_cases: data_matrix.len(),
        variable_importance,
    })
}

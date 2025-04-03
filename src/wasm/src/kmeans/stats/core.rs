// Implementation of K-means Clustering Algorithm Core Functions

use std::collections::HashMap;
use serde::{ Deserialize, Serialize };

use crate::kmeans::models::{
    config::ClusterConfig,
    data::{ AnalysisData, DataValue },
    result::{
        ANOVACluster,
        ANOVATable,
        CaseCountTable,
        ClusterMembership,
        DistancesBetweenCenters,
        FinalClusterCenters,
        InitialClusterCenters,
        IterationHistory,
        IterationStep,
    },
};

// Internal data structure for processed data
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProcessedData {
    pub variables: Vec<String>,
    pub data_matrix: Vec<Vec<f64>>,
    pub case_numbers: Vec<i32>,
}

// ============== Helper Functions ==============

fn euclidean_distance(a: &[f64], b: &[f64]) -> f64 {
    a.iter()
        .zip(b.iter())
        .map(|(x, y)| (x - y).powi(2))
        .sum::<f64>()
        .sqrt()
}

fn find_nearest_cluster(point: &[f64], centers: &[Vec<f64>]) -> (usize, f64) {
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

fn find_closest_cluster(point: &[f64], centers: &[Vec<f64>]) -> usize {
    let (closest, _) = find_nearest_cluster(point, centers);
    closest
}

fn find_second_closest_cluster(point: &[f64], centers: &[Vec<f64>], closest: usize) -> usize {
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

fn min_distance_between_centers(centers: &[Vec<f64>]) -> (f64, usize, usize) {
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

fn min_distance_from_cluster(centers: &[Vec<f64>], cluster_idx: usize) -> f64 {
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

fn convert_map_to_matrix(
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

// ============== Core Implementation Functions ==============

pub fn preprocess_data(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<ProcessedData, String> {
    if data.target_data.is_empty() {
        return Err("No target data provided".to_string());
    }

    // Use target_var from config if provided, otherwise collect all numeric variables from all datasets
    let variables = if let Some(target_var) = &config.main.target_var {
        target_var.clone()
    } else {
        // Collect all numeric variables from all datasets
        data.target_data
            .iter()
            .flat_map(|dataset| {
                dataset.iter().flat_map(|record| {
                    record.values
                        .iter()
                        .filter(|(_, value)| matches!(value, DataValue::Number(_)))
                        .map(|(key, _)| key.clone())
                })
            })
            .collect::<std::collections::HashSet<String>>()
            .into_iter()
            .collect::<Vec<String>>()
    };

    if variables.is_empty() {
        return Err("No valid clustering variables found".to_string());
    }

    // Get the number of cases (assuming all datasets have the same length)
    let num_cases = if !data.target_data.is_empty() { data.target_data[0].len() } else { 0 };

    if num_cases == 0 {
        return Err("No cases found in data".to_string());
    }

    let mut data_matrix = Vec::new();
    let mut case_numbers = Vec::new();

    // Process each case
    for case_idx in 0..num_cases {
        let mut row = Vec::new();
        let mut has_missing = false;

        // For each variable, find its value across all datasets
        for var in &variables {
            let mut var_value: Option<f64> = None;

            // Check each dataset for this variable
            for dataset in &data.target_data {
                if case_idx < dataset.len() {
                    if let Some(DataValue::Number(val)) = dataset[case_idx].values.get(var) {
                        var_value = Some(*val);
                        break;
                    }
                }
            }

            // Add the value to the row or mark as missing
            match var_value {
                Some(val) => row.push(val),
                None => {
                    has_missing = true;
                    if !config.options.exclude_list_wise {
                        // If not excluding list-wise, use a default value (0.0)
                        row.push(0.0);
                    } else {
                        break;
                    }
                }
            }
        }

        // Add the row if it's complete or if we're not doing list-wise exclusion
        if !has_missing || !config.options.exclude_list_wise {
            if row.len() == variables.len() {
                data_matrix.push(row);
                case_numbers.push((case_idx + 1) as i32);
            }
        }
    }

    if data_matrix.is_empty() {
        return Err("No valid data records after preprocessing".to_string());
    }

    Ok(ProcessedData {
        variables,
        data_matrix,
        case_numbers,
    })
}

pub fn initialize_clusters(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<InitialClusterCenters, String> {
    let num_clusters = config.main.cluster as usize;

    if num_clusters <= 0 {
        return Err("Number of clusters must be positive".to_string());
    }

    if data.data_matrix.len() < num_clusters {
        return Err(
            format!(
                "Not enough data points ({}) for requested clusters ({})",
                data.data_matrix.len(),
                num_clusters
            )
        );
    }

    let mut initial_centers = vec![vec![0.0; data.variables.len()]; num_clusters];

    if config.main.read_initial {
        for i in 0..num_clusters {
            initial_centers[i] = data.data_matrix[i].clone();
        }
    } else {
        for i in 0..num_clusters {
            initial_centers[i] = data.data_matrix[i].clone();
        }

        for k in num_clusters..data.data_matrix.len() {
            let x_k = &data.data_matrix[k];

            let (closest, min_dist) = find_nearest_cluster(x_k, &initial_centers);
            let second_closest = find_second_closest_cluster(x_k, &initial_centers, closest);

            let (min_center_dist, m, n) = min_distance_between_centers(&initial_centers);

            if min_dist > min_center_dist {
                if
                    euclidean_distance(x_k, &initial_centers[m]) >
                    euclidean_distance(x_k, &initial_centers[n])
                {
                    initial_centers[m] = x_k.clone();
                } else {
                    initial_centers[n] = x_k.clone();
                }
            } else {
                let dist_to_second = euclidean_distance(x_k, &initial_centers[second_closest]);
                let min_dist_from_closest = min_distance_from_cluster(&initial_centers, closest);

                if dist_to_second > min_dist_from_closest {
                    initial_centers[closest] = x_k.clone();
                }
            }
        }
    }

    let mut centers_map = HashMap::new();

    for (i, var) in data.variables.iter().enumerate() {
        let mut var_values = Vec::new();
        for j in 0..num_clusters {
            var_values.push(initial_centers[j][i]);
        }
        centers_map.insert(var.clone(), var_values);
    }

    Ok(InitialClusterCenters { centers: centers_map })
}

pub fn generate_iteration_history(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<IterationHistory, String> {
    let num_clusters = config.main.cluster as usize;
    let max_iterations = config.iterate.maximum_iterations;
    let convergence_criterion = config.iterate.convergence_criterion;
    let use_running_means = config.iterate.use_running_means;

    let initial_centers_result = initialize_clusters(data, config)?;
    let mut current_centers = convert_map_to_matrix(
        &initial_centers_result.centers,
        &data.variables
    );

    let (min_center_dist, _, _) = min_distance_between_centers(&current_centers);
    let min_change_threshold = convergence_criterion * min_center_dist;

    let mut iterations = Vec::new();
    let mut convergence_note = None;

    for iteration in 1..=max_iterations {
        let mut new_centers = vec![vec![0.0; data.variables.len()]; num_clusters];
        let mut cluster_counts = vec![0; num_clusters];
        let mut changes = HashMap::new();

        for case in &data.data_matrix {
            let closest = find_closest_cluster(case, &current_centers);

            if use_running_means {
                cluster_counts[closest] += 1;
                let count = cluster_counts[closest] as f64;

                for j in 0..case.len() {
                    new_centers[closest][j] =
                        (new_centers[closest][j] * (count - 1.0) + case[j]) / count;
                }
            } else {
                cluster_counts[closest] += 1;

                for j in 0..case.len() {
                    new_centers[closest][j] += case[j];
                }
            }
        }

        if !use_running_means {
            for i in 0..num_clusters {
                if cluster_counts[i] > 0 {
                    for j in 0..data.variables.len() {
                        new_centers[i][j] /= cluster_counts[i] as f64;
                    }
                }
            }
        }

        let mut max_change = 0.0;

        for i in 0..num_clusters {
            let mut cluster_change = 0.0;

            for j in 0..data.variables.len() {
                let change = (new_centers[i][j] - current_centers[i][j]).abs();
                if change > cluster_change {
                    cluster_change = change;
                }
            }

            changes.insert(format!("{}", i + 1), cluster_change);

            if cluster_change > max_change {
                max_change = cluster_change;
            }
        }

        iterations.push(IterationStep {
            iteration,
            changes,
        });

        if max_change <= min_change_threshold {
            convergence_note = Some(
                format!(
                    "Convergence achieved due to no or small change in cluster centers. The maximum absolute coordinate change for any center is {:.3}. The current iteration is {}. The minimum distance between initial centers is {:.3}.",
                    max_change,
                    iteration,
                    min_center_dist
                )
            );
            break;
        }

        current_centers = new_centers;
    }

    if convergence_note.is_none() {
        convergence_note = Some(
            format!("Maximum number of iterations ({}) reached without convergence.", max_iterations)
        );
    }

    Ok(IterationHistory {
        iterations,
        convergence_note,
    })
}

pub fn generate_cluster_membership(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<Vec<ClusterMembership>, String> {
    let final_centers_result = generate_final_cluster_centers(data, config)?;
    let final_centers = convert_map_to_matrix(&final_centers_result.centers, &data.variables);

    let mut membership = Vec::new();

    for (idx, case) in data.data_matrix.iter().enumerate() {
        let (cluster, distance) = find_nearest_cluster(case, &final_centers);

        membership.push(ClusterMembership {
            case_number: data.case_numbers[idx],
            cluster: (cluster + 1) as i32,
            distance,
        });
    }

    Ok(membership)
}

pub fn generate_final_cluster_centers(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<FinalClusterCenters, String> {
    let num_clusters = config.main.cluster as usize;
    let max_iterations = config.iterate.maximum_iterations;
    let convergence_criterion = config.iterate.convergence_criterion;

    let initial_centers_result = initialize_clusters(data, config)?;
    let mut current_centers = convert_map_to_matrix(
        &initial_centers_result.centers,
        &data.variables
    );

    let (min_center_dist, _, _) = min_distance_between_centers(&current_centers);
    let min_change_threshold = convergence_criterion * min_center_dist;

    for _ in 1..=max_iterations {
        let mut new_centers = vec![vec![0.0; data.variables.len()]; num_clusters];
        let mut cluster_counts = vec![0; num_clusters];
        let mut max_change = 0.0;

        for case in &data.data_matrix {
            let closest = find_closest_cluster(case, &current_centers);

            cluster_counts[closest] += 1;

            for j in 0..case.len() {
                new_centers[closest][j] += case[j];
            }
        }

        for i in 0..num_clusters {
            if cluster_counts[i] > 0 {
                for j in 0..data.variables.len() {
                    new_centers[i][j] /= cluster_counts[i] as f64;
                }
            }
        }

        for i in 0..num_clusters {
            for j in 0..data.variables.len() {
                let change = (new_centers[i][j] - current_centers[i][j]).abs();
                if change > max_change {
                    max_change = change;
                }
            }
        }

        if max_change <= min_change_threshold {
            break;
        }

        current_centers = new_centers;
    }

    let mut centers_map = HashMap::new();

    for (i, var) in data.variables.iter().enumerate() {
        let mut var_values = Vec::new();

        for j in 0..num_clusters {
            var_values.push(current_centers[j][i]);
        }

        centers_map.insert(var.clone(), var_values);
    }

    Ok(FinalClusterCenters { centers: centers_map })
}

pub fn calculate_distances_between_centers(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<DistancesBetweenCenters, String> {
    let num_clusters = config.main.cluster as usize;

    let final_centers_result = generate_final_cluster_centers(data, config)?;
    let final_centers = convert_map_to_matrix(&final_centers_result.centers, &data.variables);

    let mut distances = vec![vec![0.0; num_clusters]; num_clusters];

    for i in 0..num_clusters {
        for j in 0..num_clusters {
            distances[i][j] = if i == j {
                0.0
            } else {
                euclidean_distance(&final_centers[i], &final_centers[j])
            };
        }
    }

    Ok(DistancesBetweenCenters { distances })
}

pub fn calculate_anova(data: &ProcessedData, config: &ClusterConfig) -> Result<ANOVATable, String> {
    let num_clusters = config.main.cluster as usize;

    let membership = generate_cluster_membership(data, config)?;

    let mut anova_clusters = HashMap::new();

    for (var_idx, var_name) in data.variables.iter().enumerate() {
        let overall_mean: f64 =
            data.data_matrix
                .iter()
                .map(|row| row[var_idx])
                .sum::<f64>() / (data.data_matrix.len() as f64);

        let mut cluster_data: Vec<Vec<f64>> = vec![Vec::new(); num_clusters];

        for (idx, case) in data.data_matrix.iter().enumerate() {
            let cluster = (membership[idx].cluster as usize) - 1;
            cluster_data[cluster].push(case[var_idx]);
        }

        let cluster_means: Vec<f64> = cluster_data
            .iter()
            .map(|cluster| {
                if cluster.is_empty() {
                    overall_mean
                } else {
                    cluster.iter().sum::<f64>() / (cluster.len() as f64)
                }
            })
            .collect();

        let ssb: f64 = cluster_data
            .iter()
            .enumerate()
            .map(|(i, cluster)| {
                (cluster.len() as f64) * (cluster_means[i] - overall_mean).powi(2)
            })
            .sum();

        let ssw: f64 = cluster_data
            .iter()
            .enumerate()
            .map(|(i, cluster)| {
                cluster
                    .iter()
                    .map(|value| (*value - cluster_means[i]).powi(2))
                    .sum::<f64>()
            })
            .sum();

        let df_between = (num_clusters as i32) - 1;
        let df_within = (data.data_matrix.len() as i32) - (num_clusters as i32);

        let mean_square_between = ssb / (df_between as f64);
        let mean_square_within = if df_within > 0 { ssw / (df_within as f64) } else { 0.0 };

        let f_statistic = if mean_square_within > 0.0 {
            mean_square_between / mean_square_within
        } else {
            f64::MAX
        };

        let significance = if f_statistic > 1000.0 {
            0.001
        } else if f_statistic > 500.0 {
            0.01
        } else if f_statistic > 100.0 {
            0.05
        } else {
            0.1
        };

        anova_clusters.insert(var_name.clone(), ANOVACluster {
            mean_square: mean_square_between,
            df: df_between,
            f: f_statistic,
            significance,
        });
    }

    Ok(ANOVATable { clusters: anova_clusters })
}

pub fn generate_case_count(
    data: &ProcessedData,
    config: &ClusterConfig
) -> Result<CaseCountTable, String> {
    let num_clusters = config.main.cluster as usize;

    let membership = generate_cluster_membership(data, config)?;

    let mut cluster_counts = HashMap::new();

    for i in 1..=num_clusters {
        let count = membership
            .iter()
            .filter(|m| m.cluster == (i as i32))
            .count();

        cluster_counts.insert(i.to_string(), count);
    }

    let valid = membership.len();
    let missing = 0;

    Ok(CaseCountTable {
        valid,
        missing,
        clusters: cluster_counts,
    })
}

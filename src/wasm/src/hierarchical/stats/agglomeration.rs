// agglomeration.rs - proper implementation
use std::collections::HashMap;

use crate::hierarchical::models::{
    config::{ ClusMethod, ClusterConfig },
    data::{ AnalysisData, DataValue },
    result::{ AgglomerationSchedule, AgglomerationStage, ClusterState },
};

use super::core::{
    calculate_distance,
    calculate_variable_distance,
    extract_case_label,
    find_closest_clusters,
    merge_clusters,
};

pub fn generate_agglomeration_schedule_wrapper(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    if config.main.cluster_cases {
        generate_case_agglomeration_schedule(data, config)
    } else if config.main.cluster_var {
        generate_variable_agglomeration_schedule(data, config)
    } else {
        Err("Neither case nor variable clustering specified".to_string())
    }
}

fn generate_case_agglomeration_schedule(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    // Get variables to use for calculating distances
    let variables = config.main.variables
        .as_ref()
        .ok_or_else(|| "No variables specified for clustering".to_string())?;

    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }

    // Extract values and create cluster state
    let cluster_state = initialize_case_cluster_state(data, config, variables)?;

    // Generate the agglomeration schedule
    generate_agglomeration_schedule(&mut cluster_state.clone(), config)
}

fn generate_variable_agglomeration_schedule(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    // Get variables to use in clustering
    let variables = config.main.variables
        .as_ref()
        .ok_or_else(|| "No variables specified for clustering".to_string())?;

    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }

    // Extract values and create cluster state
    let variable_values = extract_variable_data(data, variables)?;
    let cluster_state = initialize_variable_cluster_state(&variable_values, variables, config)?;

    // Generate the agglomeration schedule
    generate_agglomeration_schedule(&mut cluster_state.clone(), config)
}

fn initialize_case_cluster_state(
    data: &AnalysisData,
    config: &ClusterConfig,
    variables: &[String]
) -> Result<ClusterState, String> {
    let case_count = data.cluster_data
        .get(0)
        .map(|d| d.len())
        .ok_or_else(|| "No data available for clustering".to_string())?;

    // Extract case data
    let case_values: Vec<HashMap<String, DataValue>> = (0..case_count)
        .map(|case_idx| {
            let mut values = HashMap::new();
            for var in variables {
                for dataset in &data.cluster_data {
                    if case_idx < dataset.len() {
                        if let Some(value) = dataset[case_idx].values.get(var) {
                            values.insert(var.clone(), value.clone());
                            break;
                        }
                    }
                }
            }
            values
        })
        .collect();

    // Create case labels using our existing function
    let case_labels: Vec<String> = (0..case_count)
        .map(|case_idx| extract_case_label(data, config, case_idx))
        .collect();

    // Initialize clusters - each case starts as its own cluster
    let clusters = (0..case_count).map(|i| vec![i]).collect::<Vec<_>>();

    // Calculate initial distance matrix
    let mut distances = vec![vec![0.0; case_count]; case_count];
    for i in 0..case_count {
        for j in i..case_count {
            if i == j {
                distances[i][j] = 0.0;
                continue;
            }

            let distance = calculate_distance(&case_values[i], &case_values[j], variables, config);
            distances[i][j] = distance;
            distances[j][i] = distance; // Ensure symmetry
        }
    }

    Ok(ClusterState {
        clusters,
        distances,
        case_labels,
        variables: variables.to_vec(),
        method: config.method.clus_method.clone(),
    })
}

fn extract_variable_data(
    data: &AnalysisData,
    variables: &[String]
) -> Result<HashMap<String, Vec<f64>>, String> {
    let case_count = data.cluster_data
        .get(0)
        .map(|d| d.len())
        .ok_or_else(|| "No data available for clustering".to_string())?;

    let mut variable_values = HashMap::new();

    // For each variable, collect its values across all cases
    for var in variables {
        let mut values = Vec::with_capacity(case_count);

        for i in 0..case_count {
            // Try to find this value in any dataset
            let value = data.cluster_data
                .iter()
                .filter_map(|dataset| {
                    if i < dataset.len() {
                        if let Some(DataValue::Number(val)) = dataset[i].values.get(var) {
                            Some(*val)
                        } else {
                            None
                        }
                    } else {
                        None
                    }
                })
                .next();

            if let Some(val) = value {
                values.push(val);
            }
        }

        variable_values.insert(var.clone(), values);
    }

    Ok(variable_values)
}

fn initialize_variable_cluster_state(
    variable_values: &HashMap<String, Vec<f64>>,
    variables: &Vec<String>,
    config: &ClusterConfig
) -> Result<ClusterState, String> {
    let var_count = variables.len();

    // Initialize clusters - each variable starts as its own cluster
    let clusters = (0..var_count).map(|i| vec![i]).collect::<Vec<_>>();

    // Calculate initial distance matrix between variables
    let mut distances = vec![vec![0.0; var_count]; var_count];
    for i in 0..var_count {
        for j in i..var_count {
            if i == j {
                distances[i][j] = 0.0;
                continue;
            }

            let var_i = &variables[i];
            let var_j = &variables[j];
            let distance = calculate_variable_distance(variable_values, var_i, var_j, config);

            distances[i][j] = distance;
            distances[j][i] = distance; // Ensure symmetry
        }
    }

    Ok(ClusterState {
        clusters,
        distances,
        case_labels: variables.clone(), // Variable names serve as labels
        variables: variables.to_vec(),
        method: config.method.clus_method.clone(),
    })
}

// Generate agglomeration schedule for hierarchical clustering
pub fn generate_agglomeration_schedule(
    state: &mut ClusterState,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    let original_count = state.clusters.len();
    let stages_count = original_count - 1;

    // Check if using Ward's method
    let is_ward_method = matches!(state.method, ClusMethod::Ward);

    // Initialize tracking structures
    let mut stages = Vec::with_capacity(stages_count);
    let mut ward_coefficient = 0.0;

    // Store active cluster IDs (1-indexed)
    let mut active_clusters: Vec<usize> = (1..=original_count).collect();

    // Track when clusters first appear in the schedule
    let mut first_appears: HashMap<usize, usize> = HashMap::new();

    // Process stages
    for stage_idx in 0..stages_count {
        let stage = stage_idx + 1; // 1-indexed stage number

        // Find closest clusters
        if let Some((idx1, idx2, distance)) = find_closest_clusters(state) {
            // Get cluster IDs (1-indexed)
            let cluster1_id = active_clusters[idx1];
            let cluster2_id = active_clusters[idx2];

            // For Ward's method, update coefficient
            let coefficient = if is_ward_method {
                ward_coefficient += 0.5 * distance;
                ward_coefficient
            } else {
                distance
            };

            // Calculate when clusters first appeared
            let cluster1_first_stage = *first_appears.get(&cluster1_id).unwrap_or(&0);
            let cluster2_first_stage = *first_appears.get(&cluster2_id).unwrap_or(&0);

            // Calculate next stage
            let next_stage = if stage == stages_count { 0 } else { stage + 1 };

            // Create stage entry
            stages.push(AgglomerationStage {
                stage,
                clusters_combined: (cluster1_id, cluster2_id),
                coefficients: coefficient,
                cluster_first_appears: (cluster1_first_stage, cluster2_first_stage),
                next_stage: next_stage,
            });

            // Merge the clusters - idx1 remains, idx2 is removed
            merge_clusters(state, idx1, idx2);

            // Update active clusters
            active_clusters.remove(idx2); // Remove the second cluster

            // Record when merged cluster appears
            first_appears.insert(cluster1_id, stage);
        } else {
            return Err(format!("Failed to find closest clusters at stage {}", stage_idx));
        }
    }

    Ok(AgglomerationSchedule { stages })
}

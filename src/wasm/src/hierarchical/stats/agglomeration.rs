// agglomeration.rs
use std::collections::HashMap;

use crate::hierarchical::models::{
    config::{ ClusterConfig, ClusMethod },
    data::{ AnalysisData, DataValue },
    result::{ AgglomerationSchedule, ClusterState },
};

use super::{
    calculate_distance,
    calculate_variable_distance,
    cluster_method::generate_agglomeration_schedule,
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
    let variables = match &config.main.variables {
        Some(vars) => vars.clone(),
        None => {
            return Err("No variables specified for clustering".to_string());
        }
    };

    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }

    // Extract values for each case and variable
    let case_count = data.cluster_data[0].len();
    let mut case_values = Vec::with_capacity(case_count);
    let mut case_labels = Vec::with_capacity(case_count);

    for case_idx in 0..case_count {
        let mut values = HashMap::new();

        // Get values for all specified variables
        for var in &variables {
            for dataset_idx in 0..data.cluster_data.len() {
                let dataset = &data.cluster_data[dataset_idx];
                if case_idx < dataset.len() {
                    if let Some(value) = dataset[case_idx].values.get(var) {
                        values.insert(var.clone(), value.clone());
                        break;
                    }
                }
            }
        }

        // Create case label
        let label = if let Some(label_var) = &config.main.label_cases {
            let mut label_value = String::new();

            // First try to find the label in label data
            for dataset in &data.label_data {
                if case_idx < dataset.len() {
                    if let Some(value) = dataset[case_idx].values.get(label_var) {
                        match value {
                            DataValue::Text(text) => {
                                label_value = text.clone();
                                break;
                            }
                            DataValue::Number(num) => {
                                label_value = num.to_string();
                                break;
                            }
                            _ => {}
                        }
                    }
                }
            }

            if label_value.is_empty() {
                format!("Case {}", case_idx + 1)
            } else {
                format!("{}", label_value)
            }
        } else {
            format!("Case {}", case_idx + 1)
        };

        case_values.push(values);
        case_labels.push(label);
    }

    // Initialize clusters - each case is its own cluster
    let mut clusters = Vec::with_capacity(case_count);
    for i in 0..case_count {
        clusters.push(vec![i]);
    }

    // Calculate initial distance matrix
    let mut distances = vec![vec![0.0; case_count]; case_count];
    for i in 0..case_count {
        for j in 0..case_count {
            if i == j {
                distances[i][j] = 0.0;
                continue;
            }

            let distance = calculate_distance(&case_values[i], &case_values[j], &variables, config);
            distances[i][j] = distance;
        }
    }

    // Initialize cluster state
    let mut cluster_state = ClusterState {
        clusters,
        distances,
        case_labels,
        variables,
        method: config.method.clus_method.clone(),
    };

    // Check if Ward's method is being used
    let is_ward_method = matches!(config.method.clus_method, ClusMethod::Ward);

    // Generate the agglomeration schedule
    let result = generate_agglomeration_schedule(&mut cluster_state, is_ward_method)?;

    Ok(result)
}

fn generate_variable_agglomeration_schedule(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<AgglomerationSchedule, String> {
    // Get variables to use in clustering
    let variables = match &config.main.variables {
        Some(vars) => vars.clone(),
        None => {
            return Err("No variables specified for clustering".to_string());
        }
    };

    if data.cluster_data.is_empty() {
        return Err("No data available for clustering".to_string());
    }

    let case_count = data.cluster_data[0].len();
    let var_count = variables.len();

    // For each variable, collect its values across all cases
    let mut variable_values = HashMap::new();
    for var in &variables {
        let mut values = Vec::with_capacity(case_count);
        for i in 0..case_count {
            for dataset in &data.cluster_data {
                if i < dataset.len() {
                    if let Some(DataValue::Number(value)) = dataset[i].values.get(var) {
                        values.push(*value);
                        break;
                    }
                }
            }
        }
        variable_values.insert(var.clone(), values);
    }

    // Initialize clusters - each variable is its own cluster
    let mut clusters = Vec::with_capacity(var_count);
    for i in 0..var_count {
        clusters.push(vec![i]);
    }

    // Calculate initial distance matrix between variables
    let mut distances = vec![vec![0.0; var_count]; var_count];
    for i in 0..var_count {
        for j in 0..var_count {
            if i == j {
                distances[i][j] = 0.0;
                continue;
            }

            let var_i = &variables[i];
            let var_j = &variables[j];
            let distance = calculate_variable_distance(&variable_values, var_i, var_j, config);
            distances[i][j] = distance;
        }
    }

    // Initialize cluster state with variable names as labels
    let mut cluster_state = ClusterState {
        clusters,
        distances,
        case_labels: variables.clone(), // Variable names serve as labels
        variables: variables.clone(),
        method: config.method.clus_method.clone(),
    };

    // Check if Ward's method is being used
    let is_ward_method = matches!(config.method.clus_method, ClusMethod::Ward);

    // Generate the agglomeration schedule
    let result = generate_agglomeration_schedule(&mut cluster_state, is_ward_method)?;

    Ok(result)
}

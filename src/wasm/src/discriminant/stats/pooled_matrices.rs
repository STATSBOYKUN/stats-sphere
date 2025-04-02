use std::collections::HashMap;
use nalgebra::DMatrix;

use crate::discriminant::models::{
    data::DataValue,
    result::PooledMatrices,
    AnalysisData,
    DataRecord,
    DiscriminantConfig,
};

pub fn calculate_pooled_matrices(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<PooledMatrices, String> {
    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;
    let num_vars = independent_variables.len();

    // Initialize result structures
    let mut covariance: HashMap<String, HashMap<String, f64>> = HashMap::new();
    let mut correlation: HashMap<String, HashMap<String, f64>> = HashMap::new();

    // Flatten the group data for easier processing
    let flattened_group_data: Vec<&DataRecord> = data.group_data
        .iter()
        .flat_map(|records| records.iter())
        .collect();

    // Extract group values by index and track unique groups
    let mut record_groups: HashMap<usize, String> = HashMap::new();
    let mut unique_groups = Vec::new();

    for (i, record) in flattened_group_data.iter().enumerate() {
        for (key, value) in &record.values {
            // Check if this is the grouping variable
            if key == grouping_variable {
                let group_label = match value {
                    DataValue::Number(num) => num.to_string(),
                    DataValue::Text(text) => text.clone(),
                    _ => {
                        continue;
                    }
                };

                record_groups.insert(i, group_label.clone());

                if !unique_groups.contains(&group_label) {
                    unique_groups.push(group_label);
                }

                break;
            }
        }
    }

    // Group data by group and variable
    let mut grouped_data: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();

    // Initialize the data structure
    for group in &unique_groups {
        grouped_data.insert(group.clone(), HashMap::new());
        for variable in independent_variables {
            grouped_data.get_mut(group).unwrap().insert(variable.clone(), Vec::new());
        }
    }

    // Collect data for each group and variable
    for (var_idx, variable) in independent_variables.iter().enumerate() {
        if var_idx >= data.independent_data.len() {
            continue;
        }

        let var_records = &data.independent_data[var_idx];

        for (i, record) in var_records.iter().enumerate() {
            if let Some(group) = record_groups.get(&i) {
                if let Some(DataValue::Number(value)) = record.values.get(variable) {
                    grouped_data.get_mut(group).unwrap().get_mut(variable).unwrap().push(*value);
                }
            }
        }
    }

    // Calculate group means and sizes
    let mut group_means: HashMap<String, HashMap<String, f64>> = HashMap::new();
    let mut group_sizes: HashMap<String, usize> = HashMap::new();

    for group in &unique_groups {
        group_means.insert(group.clone(), HashMap::new());
        let mut group_size = 0;

        for variable in independent_variables {
            let values = &grouped_data[group][variable];
            if !values.is_empty() {
                let mean = values.iter().sum::<f64>() / (values.len() as f64);
                group_means.get_mut(group).unwrap().insert(variable.clone(), mean);
                group_size = values.len(); // Assuming consistent size within group
            }
        }

        group_sizes.insert(group.clone(), group_size);
    }

    // Initialize pooled covariance matrix
    let mut pooled_cov_matrix = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    // Calculate pooled covariance matrix
    for group in &unique_groups {
        let n = *group_sizes.get(group).unwrap_or(&0);
        if n <= 1 {
            continue; // Skip groups with insufficient data
        }

        let df = n - 1; // Degrees of freedom
        total_df += df;

        // Calculate group covariance matrix
        for (i, var1) in independent_variables.iter().enumerate() {
            for (j, var2) in independent_variables.iter().enumerate() {
                let values1 = &grouped_data[group][var1];
                let values2 = &grouped_data[group][var2];

                if values1.is_empty() || values2.is_empty() || values1.len() != values2.len() {
                    continue;
                }

                let mean1 = group_means[group][var1];
                let mean2 = group_means[group][var2];

                // Calculate covariance for this group
                let mut cov_sum = 0.0;
                for k in 0..values1.len() {
                    cov_sum += (values1[k] - mean1) * (values2[k] - mean2);
                }

                let group_cov = cov_sum / (df as f64);

                // Add to pooled covariance matrix weighted by degrees of freedom
                pooled_cov_matrix[(i, j)] += (df as f64) * group_cov;
            }
        }
    }

    // Normalize pooled covariance matrix
    if total_df > 0 {
        for i in 0..num_vars {
            for j in 0..num_vars {
                pooled_cov_matrix[(i, j)] /= total_df as f64;
            }
        }
    }

    // Calculate correlation matrix from covariance matrix
    let mut pooled_corr_matrix = DMatrix::zeros(num_vars, num_vars);

    for i in 0..num_vars {
        for j in 0..num_vars {
            if i == j {
                pooled_corr_matrix[(i, j)] = 1.0;
            } else {
                let var_i: f64 = pooled_cov_matrix[(i, i)];
                let var_j: f64 = pooled_cov_matrix[(j, j)];

                if var_i > 0.0 && var_j > 0.0 {
                    let std_i = var_i.sqrt();
                    let std_j = var_j.sqrt();
                    pooled_corr_matrix[(i, j)] = pooled_cov_matrix[(i, j)] / (std_i * std_j);
                } else {
                    pooled_corr_matrix[(i, j)] = 0.0;
                }
            }
        }
    }

    // Convert matrices to HashMaps for the result structure
    for (i, var1) in independent_variables.iter().enumerate() {
        let mut cov_map = HashMap::new();
        let mut corr_map = HashMap::new();

        for (j, var2) in independent_variables.iter().enumerate() {
            cov_map.insert(var2.clone(), pooled_cov_matrix[(i, j)]);
            corr_map.insert(var2.clone(), pooled_corr_matrix[(i, j)]);
        }

        covariance.insert(var1.clone(), cov_map);
        correlation.insert(var1.clone(), corr_map);
    }

    Ok(PooledMatrices {
        variables: independent_variables.clone(),
        covariance,
        correlation,
    })
}

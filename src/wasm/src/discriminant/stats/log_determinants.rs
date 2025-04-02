use nalgebra::DMatrix;
use std::collections::HashMap;
use crate::discriminant::models::{
    result::LogDeterminants,
    AnalysisData,
    DiscriminantConfig,
    DataRecord,
    DataValue,
};

pub fn calculate_log_determinants(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<LogDeterminants, String> {
    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;
    let num_vars = independent_variables.len();

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

    unique_groups.sort();

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

    // Initialize results
    let mut ranks = Vec::with_capacity(unique_groups.len());
    let mut log_determinants = Vec::with_capacity(unique_groups.len());

    // Calculate log determinants for each group
    for group in &unique_groups {
        let mut covariance_matrix = DMatrix::zeros(num_vars, num_vars);

        for (var1_idx, var1) in independent_variables.iter().enumerate() {
            for (var2_idx, var2) in independent_variables.iter().enumerate() {
                let values1 = &grouped_data[group][var1];
                let values2 = &grouped_data[group][var2];

                if values1.len() > 1 && values1.len() == values2.len() {
                    let mean1 = group_means[group][var1];
                    let mean2 = group_means[group][var2];

                    // Calculate covariance
                    let cov =
                        values1
                            .iter()
                            .zip(values2.iter())
                            .map(|(&v1, &v2)| (v1 - mean1) * (v2 - mean2))
                            .sum::<f64>() / ((values1.len() - 1) as f64);

                    covariance_matrix[(var1_idx, var2_idx)] = cov;
                }
            }
        }

        // Calculate determinant and rank
        let svd = nalgebra::SVD::new(covariance_matrix.clone(), true, true);

        // Determine rank based on singular values
        let max_singular_value = svd.singular_values
            .iter()
            .fold(0.0, |max, &val| f64::max(max, val));
        let epsilon = 1e-10 * max_singular_value;

        let rank = svd.singular_values
            .iter()
            .filter(|&v| *v > epsilon)
            .count() as i32;

        // Calculate log determinant
        let log_det = svd.singular_values
            .iter()
            .filter(|&v| *v > epsilon)
            .map(|v| v.ln())
            .sum();

        ranks.push(rank);
        log_determinants.push(log_det);
    }

    // Calculate pooled log determinant
    let pooled_cov_matrix = calculate_pooled_covariance_matrix(
        &grouped_data,
        independent_variables,
        &group_means
    );

    let (rank_pooled, pooled_log_determinant) = calculate_rank_and_log_det(&pooled_cov_matrix);

    Ok(LogDeterminants {
        groups: unique_groups,
        ranks,
        log_determinants,
        rank_pooled,
        pooled_log_determinant,
    })
}

// Helper function to calculate pooled covariance matrix
fn calculate_pooled_covariance_matrix(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    variables: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>
) -> DMatrix<f64> {
    let num_vars = variables.len();
    let mut pooled_cov = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0;

    for (group, group_data) in grouped_data {
        let n = group_data[&variables[0]].len(); // Assuming consistent group sizes
        if n <= 1 {
            continue; // Skip groups with insufficient data
        }

        let df = n - 1; // Degrees of freedom
        total_df += df;

        // Calculate group covariance matrix
        for (var1_idx, var1) in variables.iter().enumerate() {
            for (var2_idx, var2) in variables.iter().enumerate() {
                let values1 = &group_data[var1];
                let values2 = &group_data[var2];

                if values1.len() > 1 && values1.len() == values2.len() {
                    let mean1 = group_means[group][var1];
                    let mean2 = group_means[group][var2];

                    // Calculate covariance for this group
                    let cov =
                        values1
                            .iter()
                            .zip(values2.iter())
                            .map(|(&v1, &v2)| (v1 - mean1) * (v2 - mean2))
                            .sum::<f64>() / ((values1.len() - 1) as f64);

                    // Add to pooled covariance matrix weighted by degrees of freedom
                    pooled_cov[(var1_idx, var2_idx)] += (df as f64) * cov;
                }
            }
        }
    }

    // Normalize pooled covariance matrix
    if total_df > 0 {
        for i in 0..num_vars {
            for j in 0..num_vars {
                pooled_cov[(i, j)] /= total_df as f64;
            }
        }
    }

    pooled_cov
}

fn calculate_rank_and_log_det(matrix: &DMatrix<f64>) -> (i32, f64) {
    let svd = nalgebra::SVD::new(matrix.clone(), false, false);
    let singular_values = svd.singular_values;

    let max_singular_value = singular_values.iter().fold(0.0, |max, &val| f64::max(max, val));
    let epsilon = 1e-10 * max_singular_value;

    let rank = singular_values
        .iter()
        .filter(|&v| *v > epsilon)
        .count() as i32;

    let log_det = singular_values
        .iter()
        .filter(|&v| *v > epsilon)
        .map(|v| v.ln())
        .sum();

    (rank, log_det)
}

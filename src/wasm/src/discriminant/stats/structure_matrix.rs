use std::collections::HashMap;
use nalgebra::DMatrix;

use crate::discriminant::models::{
    result::StructureMatrix,
    AnalysisData,
    DiscriminantConfig,
    DataRecord,
    data::DataValue,
};
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;
use crate::discriminant::stats::stepwise::stepwise_statistics::calculate_stepwise_statistics;

pub fn calculate_structure_matrix(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StructureMatrix, String> {
    web_sys::console::log_1(&"Executing calculate_structure_matrix".into());

    // Get variables to use - handle stepwise selection if enabled
    let variables = if config.main.stepwise {
        get_stepwise_selected_variables(data, config)?
    } else {
        config.main.independent_variables.clone()
    };

    let num_vars = variables.len();
    let grouping_variable = &config.main.grouping_variable;

    // First, calculate canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Number of discriminant functions
    let (grouped_data, unique_groups) = extract_grouped_data(data, grouping_variable, &variables);
    let num_groups = unique_groups.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for structure matrix".to_string());
    }

    // Calculate pooled within-groups covariance matrix
    let pooled_within = calculate_pooled_within_matrix(&grouped_data, &variables);

    // Get eigenvectors from canonical functions
    let mut eigenvectors = vec![vec![0.0; num_functions]; num_vars];
    for (i, var) in variables.iter().enumerate() {
        if let Some(coef_values) = canonical_functions.coefficients.get(var) {
            for j in 0..num_functions {
                if j < coef_values.len() {
                    eigenvectors[i][j] = coef_values[j];
                }
            }
        }
    }

    // Calculate within-groups correlation matrix
    let mut within_corr = DMatrix::zeros(num_vars, num_vars);
    for i in 0..num_vars {
        for j in 0..num_vars {
            if i == j {
                within_corr[(i, j)] = 1.0;
            } else {
                let std_i = pooled_within[(i, i)].sqrt();
                let std_j = pooled_within[(j, j)].sqrt();

                if std_i > 0.0 && std_j > 0.0 {
                    within_corr[(i, j)] = pooled_within[(i, j)] / (std_i * std_j);
                } else {
                    within_corr[(i, j)] = 0.0;
                }
            }
        }
    }

    // Calculate structure matrix (pooled within-groups correlations)
    let mut correlations = HashMap::new();

    for (i, var) in variables.iter().enumerate() {
        let mut corr_values = Vec::with_capacity(num_functions);

        for j in 0..num_functions {
            // Calculate correlation between variable i and discriminant function j
            let mut correlation = 0.0;

            for k in 0..num_vars {
                correlation += within_corr[(i, k)] * eigenvectors[k][j];
            }

            corr_values.push(correlation);
        }

        correlations.insert(var.clone(), corr_values);
    }

    // Sort variables by absolute magnitude of correlation with first function
    let mut sorted_variables = variables.clone();
    sorted_variables.sort_by(|a, b| {
        let corr_a = correlations.get(a).unwrap_or(&vec![0.0])[0].abs();
        let corr_b = correlations.get(b).unwrap_or(&vec![0.0])[0].abs();
        corr_b.partial_cmp(&corr_a).unwrap_or(std::cmp::Ordering::Equal) // Sort by descending absolute correlation
    });

    Ok(StructureMatrix {
        variables: sorted_variables,
        correlations,
    })
}

fn extract_grouped_data(
    data: &AnalysisData,
    grouping_variable: &str,
    independent_variables: &[String]
) -> (HashMap<String, HashMap<String, Vec<f64>>>, Vec<String>) {
    let flattened_group_data: Vec<&DataRecord> = data.group_data
        .iter()
        .flat_map(|records| records.iter())
        .collect();

    let mut record_groups: HashMap<usize, String> = HashMap::new();
    let mut unique_groups = Vec::new();

    for (i, record) in flattened_group_data.iter().enumerate() {
        for (key, value) in &record.values {
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

    // Sort the groups for consistent results
    unique_groups.sort();

    // Group data by group and variable
    let mut grouped_data: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();

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

    (grouped_data, unique_groups)
}

fn calculate_pooled_within_matrix(
    grouped_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    independent_variables: &[String]
) -> DMatrix<f64> {
    let num_vars = independent_variables.len();
    let mut pooled_within = DMatrix::zeros(num_vars, num_vars);
    let mut total_df = 0.0;

    for (group, group_vars) in grouped_data {
        let n = if let Some(values) = group_vars.get(&independent_variables[0]) {
            values.len()
        } else {
            continue;
        };

        if n <= 1 {
            continue;
        }

        let df = (n - 1) as f64;
        total_df += df;

        // Calculate group means
        let group_means: HashMap<String, f64> = independent_variables
            .iter()
            .map(|var| {
                let values = &group_vars[var];
                let mean = if values.is_empty() {
                    0.0
                } else {
                    values.iter().sum::<f64>() / (values.len() as f64)
                };
                (var.clone(), mean)
            })
            .collect();

        // Calculate group covariance matrix
        for (i, var1) in independent_variables.iter().enumerate() {
            for (j, var2) in independent_variables.iter().enumerate() {
                let values1 = &group_vars[var1];
                let values2 = &group_vars[var2];

                if values1.is_empty() || values2.is_empty() {
                    continue;
                }

                let mean1 = group_means[var1];
                let mean2 = group_means[var2];

                let mut cov_sum = 0.0;
                let min_len = std::cmp::min(values1.len(), values2.len());
                for k in 0..min_len {
                    cov_sum += (values1[k] - mean1) * (values2[k] - mean2);
                }

                let group_cov = cov_sum / df;
                pooled_within[(i, j)] += df * group_cov;
            }
        }
    }

    if total_df > 0.0 {
        pooled_within /= total_df;
    }

    // Add small regularization to ensure invertibility
    let epsilon = 1e-8;
    for i in 0..num_vars {
        pooled_within[(i, i)] += epsilon;
    }

    pooled_within
}

fn get_stepwise_selected_variables(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<Vec<String>, String> {
    // If stepwise mode is not enabled, return all variables
    if !config.main.stepwise {
        return Ok(config.main.independent_variables.clone());
    }

    // Calculate stepwise statistics to get the final selected variables
    match calculate_stepwise_statistics(data, config) {
        Ok(stepwise_stats) => {
            // Get the variables in the final step
            let final_step = stepwise_stats.variables_in_analysis
                .keys()
                .map(|k| k.parse::<i32>().unwrap_or(0))
                .max()
                .unwrap_or(0)
                .to_string();

            if let Some(vars_in_model) = stepwise_stats.variables_in_analysis.get(&final_step) {
                let selected_vars: Vec<String> = vars_in_model
                    .iter()
                    .map(|v| v.variable.clone())
                    .collect();

                if selected_vars.is_empty() {
                    // If no variables selected, return all variables
                    Ok(config.main.independent_variables.clone())
                } else {
                    Ok(selected_vars)
                }
            } else {
                // If no final step found, return all variables
                Ok(config.main.independent_variables.clone())
            }
        }
        Err(_) => {
            // If stepwise analysis fails, use all variables
            Ok(config.main.independent_variables.clone())
        }
    }
}

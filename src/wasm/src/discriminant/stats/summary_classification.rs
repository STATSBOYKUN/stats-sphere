use std::collections::HashMap;

use crate::discriminant::models::{
    AnalysisData,
    DiscriminantConfig,
    result::ClassificationFunctionCoefficients,
};
use super::core::{
    calculate_pooled_within_matrix,
    extract_analyzed_dataset,
    get_stepwise_selected_variables,
};

pub fn calculate_summary_classification(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<ClassificationFunctionCoefficients, String> {
    web_sys::console::log_1(&"Executing calculate_summary_classification".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Determine which variables to use based on stepwise analysis
    let independent_variables = if config.main.stepwise {
        // Get variables selected by stepwise procedure
        get_stepwise_selected_variables(data, config)?
    } else {
        // Use all variables
        config.main.independent_variables.clone()
    };

    // Convert group labels to usize where possible
    let groups: Vec<usize> = dataset.group_labels
        .iter()
        .filter_map(|label| label.parse::<usize>().ok())
        .collect();

    if groups.is_empty() {
        return Err("No valid group labels found for classification".to_string());
    }

    // Calculate pooled within-groups covariance matrix
    let pooled_within = calculate_pooled_within_matrix(&dataset, &independent_variables);

    // Get pooled inverse matrix
    let pooled_inverse = match pooled_within.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // If matrix is not invertible, add small regularization and try again
            let mut regularized = pooled_within.clone();
            for i in 0..regularized.nrows() {
                regularized[(i, i)] += 1e-8;
            }

            regularized
                .try_inverse()
                .ok_or_else(||
                    "Could not invert pooled within-groups covariance matrix".to_string()
                )?
        }
    };

    // Initialize coefficient map and constant terms
    let mut coefficients: HashMap<String, Vec<f64>> = HashMap::new();
    let mut constant_terms = vec![0.0; groups.len()];

    // Calculate Fisher's linear discriminant function coefficients for each group and variable
    for (var_idx, var_name) in independent_variables.iter().enumerate() {
        let mut var_coefficients = vec![0.0; groups.len()];

        for (group_idx, group) in dataset.group_labels.iter().enumerate() {
            if group_idx >= groups.len() {
                continue;
            }

            // Get group means
            let group_means = match dataset.group_means.get(group) {
                Some(means) => means,
                None => {
                    continue;
                }
            };

            // Calculate coefficient
            let mut coefficient = 0.0;

            for (j, var_j) in independent_variables.iter().enumerate() {
                if j >= pooled_inverse.ncols() || var_idx >= pooled_inverse.nrows() {
                    continue;
                }

                if let Some(mean_j) = group_means.get(var_j) {
                    coefficient += pooled_inverse[(var_idx, j)] * mean_j;
                }
            }

            // Scale coefficient by (n-g)
            coefficient *= (dataset.total_cases - dataset.num_groups) as f64;

            // Store coefficient
            var_coefficients[group_idx] = coefficient;

            // Calculate partial contribution to constant term
            if let Some(mean) = group_means.get(var_name) {
                constant_terms[group_idx] -= 0.5 * coefficient * mean;
            }
        }

        // Add coefficients for this variable
        coefficients.insert(var_name.clone(), var_coefficients);
    }

    Ok(ClassificationFunctionCoefficients {
        groups,
        variables: independent_variables,
        coefficients,
        constant_terms,
    })
}

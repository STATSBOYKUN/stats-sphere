// structure_matrix.rs
use std::collections::HashMap;
use nalgebra::{ DMatrix, DVector };

use crate::discriminant::models::{ result::StructureMatrix, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    calculate_pooled_within_matrix,
    calculate_between_groups_matrix,
    solve_eigenvalue_problem,
    extract_values_by_index,
    extract_group_values,
    calculate_group_means,
};
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;

pub fn calculate_structure_matrix(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StructureMatrix, String> {
    web_sys::console::log_1(&"Executing calculate_structure_matrix".into());

    let variables = config.main.independent_variables.clone();
    let num_vars = variables.len();

    // First, calculate canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Number of discriminant functions
    let num_groups = data.group_data.len();
    let num_functions = std::cmp::min(num_groups - 1, num_vars);

    if num_functions == 0 {
        return Err("Not enough groups or variables for structure matrix".to_string());
    }

    // Calculate pooled within-groups covariance matrix
    let pooled_within = calculate_pooled_within_matrix(data, &variables);

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

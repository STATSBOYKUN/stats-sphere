// log_determinants.rs
use nalgebra::DMatrix;
use crate::discriminant::models::{ result::LogDeterminants, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_covariance,
    calculate_rank_and_log_det,
    calculate_pooled_covariance_matrix,
    calculate_group_means,
    extract_group_values,
    vec_to_matrix,
};

pub fn calculate_log_determinants(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<LogDeterminants, String> {
    web_sys::console::log_1(&"Executing calculate_log_determinants".into());

    // Extract group names
    let groups: Vec<String> = (0..data.group_data.len()).map(|i| (i + 1).to_string()).collect();

    // Variables
    let variables = &config.main.independent_variables;
    let num_vars = variables.len();

    // Initialize results
    let mut ranks = Vec::with_capacity(groups.len());
    let mut log_determinants = Vec::with_capacity(groups.len());

    // Calculate covariance matrices and their log determinants for each group
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        if group_data.len() <= num_vars {
            // Not enough cases for a reliable covariance matrix
            ranks.push(0);
            log_determinants.push(0.0);
            continue;
        }

        // Calculate means for this group
        let means = calculate_group_means(group_data, variables);

        // Calculate covariance matrix
        let mut cov_matrix = DMatrix::zeros(num_vars, num_vars);

        for var1_idx in 0..num_vars {
            for var2_idx in 0..num_vars {
                let values1 = extract_group_values(group_data, var1_idx, variables);
                let values2 = extract_group_values(group_data, var2_idx, variables);

                cov_matrix[(var1_idx, var2_idx)] = calculate_covariance(
                    &values1,
                    &values2,
                    means[var1_idx],
                    means[var2_idx]
                );
            }
        }

        // Determine rank and calculate log determinant
        let (rank, log_det) = calculate_rank_and_log_det(&cov_matrix);

        ranks.push(rank);
        log_determinants.push(log_det);
    }

    // Calculate pooled covariance matrix
    let pooled_cov_matrix = calculate_pooled_covariance_matrix(data, variables);
    let (_, pooled_log_determinant) = calculate_rank_and_log_det(&pooled_cov_matrix);

    Ok(LogDeterminants {
        groups,
        ranks,
        log_determinants,
        pooled_log_determinant,
    })
}

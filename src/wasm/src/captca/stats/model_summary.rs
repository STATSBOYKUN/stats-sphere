use crate::captca::models::{
    config::CATPCAConfig,
    data::AnalysisData,
    result::{ ModelSummary, ModelSummaryTotal },
};

use super::core::{ calculate_variance_per_dimension, create_data_matrix };

/// Calculate model summary statistics
pub fn calculate_model_summary(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<ModelSummary, String> {
    // Get analysis variables
    let analysis_vars = match &config.main.analysis_vars {
        Some(vars) => vars,
        None => {
            return Err("No analysis variables specified".to_string());
        }
    };

    let dimensions = config.main.dimensions as usize;

    // Create data matrix
    let (data_matrix, row_indices, category_mappings) = create_data_matrix(data, analysis_vars);

    if data_matrix.nrows() == 0 || data_matrix.ncols() == 0 {
        return Err("No valid data for analysis".to_string());
    }

    // Calculate variance accounted for per dimension
    let var_per_dim = calculate_variance_per_dimension(
        &data_matrix,
        dimensions,
        &category_mappings,
        config
    );

    // Create dimensions vector
    let dimensions_vec: Vec<i32> = (1..=dimensions as i32).collect();

    // Calculate Cronbach's alpha per dimension
    let mut cronbachs_alpha = Vec::with_capacity(dimensions);
    let mut variance_accounted = Vec::with_capacity(dimensions);
    let mut variance_percentage = Vec::with_capacity(dimensions);

    let total_variables = analysis_vars.len() as f64;
    let total_variance: f64 = var_per_dim.iter().sum();

    for &var in &var_per_dim {
        // Calculate Cronbach's Alpha using the formula:
        // alpha = k / (k-1) * (1 - sum(var_i) / var_total)
        let alpha = if total_variables > 1.0 {
            (total_variables / (total_variables - 1.0)) * (var / total_variance)
        } else {
            var / total_variance
        };

        cronbachs_alpha.push(alpha);
        variance_accounted.push(var);
        variance_percentage.push((var * 100.0) / total_variance);
    }

    // Calculate total Cronbach's Alpha
    let total_alpha = if total_variables > 1.0 {
        let weighted_alpha: f64 = cronbachs_alpha.iter().sum();
        weighted_alpha / (cronbachs_alpha.len() as f64)
    } else {
        cronbachs_alpha[0]
    };

    // Create model summary
    Ok(ModelSummary {
        dimensions: dimensions_vec,
        cronbachs_alpha,
        variance_accounted,
        variance_percentage,
        total: ModelSummaryTotal {
            cronbachs_alpha: total_alpha,
            variance_total: total_variance,
            variance_percentage: 100.0,
        },
    })
}

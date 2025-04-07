use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::captca::models::{
    config::{ CATPCAConfig, NormalizationMethod },
    data::AnalysisData,
    result::ComponentLoadings,
};

use super::core::{
    calculate_loading,
    create_data_matrix,
    initialize_object_scores,
    optimal_scale_variable,
};

/// Calculate component loadings
pub fn calculate_component_loadings(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<ComponentLoadings, String> {
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

    // Initialize object scores
    let mut object_scores = initialize_object_scores(data_matrix.nrows(), dimensions, config);

    // Initialize quantifications
    let mut all_quantifications = Vec::with_capacity(analysis_vars.len());

    for j in 0..analysis_vars.len() {
        let (quant, _) = optimal_scale_variable(
            &data_matrix,
            j,
            &category_mappings[j],
            config,
            dimensions,
            &object_scores
        );
        all_quantifications.push(quant);
    }

    // Create transformed variable matrix
    let mut transformed_matrix = DMatrix::zeros(data_matrix.nrows(), data_matrix.ncols());

    for i in 0..data_matrix.nrows() {
        for j in 0..data_matrix.ncols() {
            let cat_val = data_matrix[(i, j)];
            if let Some(&cat_idx) = category_mappings[j].get(&cat_val) {
                if cat_idx < all_quantifications[j].len() {
                    transformed_matrix[(i, j)] = all_quantifications[j][cat_idx];
                }
            }
        }
    }

    // Calculate loadings (correlations between transformed variables and object scores)
    let mut dimensions_data = HashMap::new();

    for (var_idx, var_name) in analysis_vars.iter().enumerate() {
        let mut loadings = Vec::with_capacity(dimensions);

        for d in 0..dimensions {
            let loading = calculate_loading(&transformed_matrix, var_idx, &object_scores, d);
            loadings.push(loading);
        }

        dimensions_data.insert(var_name.clone(), loadings);
    }

    // Apply normalization if needed
    match config.options.normalization_method {
        NormalizationMethod::VariablePrincipal => {
            // Scale loadings
            for loadings in dimensions_data.values_mut() {
                let sum_sq: f64 = loadings
                    .iter()
                    .map(|&l| l * l)
                    .sum();
                if sum_sq > 0.0 {
                    let scale = 1.0 / sum_sq.sqrt();
                    for loading in loadings {
                        *loading *= scale;
                    }
                }
            }
        }
        _ => {}
    }

    Ok(ComponentLoadings {
        variables: analysis_vars.clone(),
        dimensions: dimensions_data,
    })
}

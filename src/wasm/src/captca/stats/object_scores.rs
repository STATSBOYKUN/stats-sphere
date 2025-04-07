use nalgebra::DMatrix;
use rand::Rng;

use crate::captca::models::{
    config::{ CATPCAConfig, ConfigurationMethod },
    data::AnalysisData,
    result::ObjectScores,
};

use super::core::{
    apply_normalization,
    center_and_orthonormalize,
    create_data_matrix,
    optimal_scale_variable,
};

/// Initialize object scores randomly or from configuration
pub fn initialize_object_scores(
    n_objects: usize,
    dimensions: usize,
    config: &CATPCAConfig
) -> DMatrix<f64> {
    let mut rng = rand::thread_rng();
    let mut object_scores = DMatrix::zeros(n_objects, dimensions);

    if let ConfigurationMethod::Initial = config.options.configuration_method {
        if let Some(config_file) = &config.options.config_file {
            // In a real implementation, would load from file
            // For now, initialize randomly
            for i in 0..n_objects {
                for j in 0..dimensions {
                    object_scores[(i, j)] = rng.gen_range(-1.0..1.0);
                }
            }
        } else {
            // Random initialization
            for i in 0..n_objects {
                for j in 0..dimensions {
                    object_scores[(i, j)] = rng.gen_range(-1.0..1.0);
                }
            }
        }
    } else {
        // Random initialization
        for i in 0..n_objects {
            for j in 0..dimensions {
                object_scores[(i, j)] = rng.gen_range(-1.0..1.0);
            }
        }
    }

    // Center and orthonormalize
    center_and_orthonormalize(&mut object_scores);

    object_scores
}

/// Calculate object scores
pub fn calculate_object_scores(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<ObjectScores, String> {
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

    // Initialize and calculate object scores
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

    // Update object scores based on quantifications
    let n_rows = object_scores.nrows();
    let n_cols = object_scores.ncols();

    for i in 0..n_rows {
        for d in 0..n_cols {
            let mut score_sum = 0.0;
            let mut count = 0;

            for j in 0..analysis_vars.len() {
                let cat_val = data_matrix[(i, j)];
                if let Some(&cat_idx) = category_mappings[j].get(&cat_val) {
                    if cat_idx < all_quantifications[j].len() {
                        score_sum += all_quantifications[j][cat_idx];
                        count += 1;
                    }
                }
            }

            if count > 0 {
                object_scores[(i, d)] = score_sum / (count as f64);
            }
        }
    }

    // Apply normalization according to config
    apply_normalization(&mut object_scores, &config.options.normalization_method);

    // Format result
    let mut clusters = Vec::with_capacity(n_rows);
    let mut dimensions_data = Vec::with_capacity(n_rows);

    for i in 0..n_rows {
        // Assign cluster label (simplified - would use actual clustering in real impl)
        clusters.push((i + 1).to_string());

        // Extract scores for all dimensions
        let scores: Vec<f64> = (0..n_cols).map(|d| object_scores[(i, d)]).collect();
        dimensions_data.push(scores);
    }

    Ok(ObjectScores {
        clusters,
        dimensions: dimensions_data,
    })
}

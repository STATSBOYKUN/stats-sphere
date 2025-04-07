use crate::captca::models::{ config::CATPCAConfig, data::AnalysisData, result::IterationHistory };

use super::core::{
    calculate_loss,
    center_and_orthonormalize,
    create_data_matrix,
    initialize_object_scores,
    optimal_scale_variable,
};

/// Calculate iteration history
pub fn calculate_iteration_history(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<IterationHistory, String> {
    // Get analysis variables
    let analysis_vars = match &config.main.analysis_vars {
        Some(vars) => vars,
        None => {
            return Err("No analysis variables specified".to_string());
        }
    };

    let dimensions = config.main.dimensions as usize;
    let max_iterations = config.options.maximum_iterations;
    let convergence_criterion = config.options.convergence;

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

    // Initialize history vectors
    let mut iteration_number = Vec::new();
    let mut variance_accounted_total = Vec::new();
    let mut variance_accounted_increase = Vec::new();
    let mut loss = Vec::new();
    let mut centroid_coordinates = Vec::new();
    let mut restriction_coordinates = Vec::new();

    // Initial iteration
    let initial_loss = calculate_loss(
        &data_matrix,
        &object_scores,
        &all_quantifications,
        &category_mappings
    );
    let initial_vaf = (data_matrix.ncols() as f64) - initial_loss;

    iteration_number.push(0);
    variance_accounted_total.push(initial_vaf);
    variance_accounted_increase.push(0.0);
    loss.push(initial_loss);
    centroid_coordinates.push(initial_vaf * 0.8); // Approximation
    restriction_coordinates.push(initial_vaf * 0.2); // Approximation

    // Iterate
    let mut current_vaf = initial_vaf;
    let mut current_loss = initial_loss;

    for iter in 1..=max_iterations {
        // Update quantifications
        for j in 0..analysis_vars.len() {
            let (quant, _) = optimal_scale_variable(
                &data_matrix,
                j,
                &category_mappings[j],
                config,
                dimensions,
                &object_scores
            );
            all_quantifications[j] = quant;
        }

        // Update object scores (simplified - in reality would use regression)
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

        // Center and orthonormalize
        center_and_orthonormalize(&mut object_scores);

        // Calculate new loss
        let new_loss = calculate_loss(
            &data_matrix,
            &object_scores,
            &all_quantifications,
            &category_mappings
        );
        let new_vaf = (data_matrix.ncols() as f64) - new_loss;
        let vaf_increase = new_vaf - current_vaf;

        // Record history
        iteration_number.push(iter);
        variance_accounted_total.push(new_vaf);
        variance_accounted_increase.push(vaf_increase);
        loss.push(new_loss);
        centroid_coordinates.push(new_vaf * 0.8); // Approximation
        restriction_coordinates.push(new_vaf * 0.2); // Approximation

        // Update current values
        current_vaf = new_vaf;
        current_loss = new_loss;

        // Check convergence
        if vaf_increase.abs() < convergence_criterion {
            break;
        }
    }

    Ok(IterationHistory {
        iteration_number,
        variance_accounted_total,
        variance_accounted_increase,
        loss,
        centroid_coordinates,
        restriction_coordinates,
    })
}

use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::captca::models::{
    config::CATPCAConfig,
    data::AnalysisData,
    result::{ CategoryQuantification, Quantifications },
};

use super::core::{ create_data_matrix, create_indicator_matrix, initialize_object_scores };

/// Perform optimal scaling for a variable
pub fn optimal_scale_variable(
    data_matrix: &DMatrix<f64>,
    var_idx: usize,
    category_mapping: &HashMap<String, usize>,
    config: &CATPCAConfig,
    dimensions: usize,
    object_scores: &DMatrix<f64>
) -> (Vec<f64>, Vec<Vec<f64>>) {
    // Create indicator matrix
    let indicator = create_indicator_matrix(data_matrix, var_idx, category_mapping);

    // Calculate frequencies for categories
    let mut frequencies = vec![0; category_mapping.len()];
    for i in 0..data_matrix.nrows() {
        let val = data_matrix[(i, var_idx)];
        let val_str = val.to_string();
        if let Some(&cat_idx) = category_mapping.get(&val_str) {
            frequencies[cat_idx] += 1;
        }
    }

    // Calculate quantifications
    let mut quantifications = Vec::new();
    let mut centroid_coordinates = Vec::with_capacity(category_mapping.len());

    // Initialize with centroids
    for cat_idx in 0..category_mapping.len() {
        let mut category_sum = vec![0.0; dimensions];
        let mut category_count = 0;

        for i in 0..data_matrix.nrows() {
            let val = data_matrix[(i, var_idx)];
            let val_str = val.to_string();
            if let Some(&mapped_idx) = category_mapping.get(&val_str) {
                if mapped_idx == cat_idx {
                    for d in 0..dimensions {
                        category_sum[d] += object_scores[(i, d)];
                    }
                    category_count += 1;
                }
            }
        }

        let coords: Vec<f64> = if category_count > 0 {
            category_sum
                .iter()
                .map(|&sum| sum / (category_count as f64))
                .collect()
        } else {
            vec![0.0; dimensions]
        };

        centroid_coordinates.push(coords);

        // Use first dimension for single quantification
        quantifications.push(if !coords.is_empty() { coords[0] } else { 0.0 });
    }

    // Apply scale-specific transformations
    // Create a mapping from internal indices to original category values
    let cat_to_original: HashMap<usize, f64> = category_mapping
        .iter()
        .map(|(val_str, &idx)| {
            let val = val_str.parse::<f64>().unwrap_or(0.0);
            (idx, val)
        })
        .collect();

    // Apply appropriate scaling based on config
    if config.define_scale.ordinal {
        // Sort quantifications by original category values
        let mut sorted_quant: Vec<(usize, f64)> = quantifications
            .iter()
            .enumerate()
            .map(|(idx, &q)| (idx, q))
            .collect();

        sorted_quant.sort_by(|a, b| {
            let cat_a = cat_to_original.get(&a.0).unwrap_or(&0.0);
            let cat_b = cat_to_original.get(&b.0).unwrap_or(&0.0);
            cat_a.partial_cmp(cat_b).unwrap_or(std::cmp::Ordering::Equal)
        });

        // Apply monotonicity (up-and-down-blocks algorithm)
        let mut monotonic_quant = vec![0.0; quantifications.len()];

        if !sorted_quant.is_empty() {
            let mut block_sum = sorted_quant[0].1;
            let mut block_size = 1;
            let mut start_idx = 0;

            for i in 1..sorted_quant.len() {
                if sorted_quant[i].1 < sorted_quant[i - 1].1 {
                    // Violation of monotonicity - average the block
                    let block_avg = block_sum / (block_size as f64);
                    for j in start_idx..i {
                        monotonic_quant[sorted_quant[j].0] = block_avg;
                    }

                    // Start new block
                    block_sum = sorted_quant[i].1;
                    block_size = 1;
                    start_idx = i;
                } else {
                    // Continue block
                    block_sum += sorted_quant[i].1;
                    block_size += 1;
                }
            }

            // Process last block
            let block_avg = block_sum / (block_size as f64);
            for j in start_idx..sorted_quant.len() {
                monotonic_quant[sorted_quant[j].0] = block_avg;
            }
        }

        // Replace with monotonic quantifications
        for (i, &q) in monotonic_quant.iter().enumerate() {
            quantifications[i] = q;
        }
    } else if config.define_scale.spline_ordinal {
        // Would implement spline transformation with monotonicity constraint
        // For simplicity, we're keeping the centroid-based quantifications
    } else if config.define_scale.spline_nominal {
        // Would implement spline transformation without monotonicity constraint
        // For simplicity, we're keeping the centroid-based quantifications
    } else if config.define_scale.multiple_nominal {
        // Multiple nominal variables use the centroid coordinates directly
        // No additional processing needed
    }

    // Normalize quantifications
    let sum_sq = quantifications
        .iter()
        .map(|q| q * q)
        .sum::<f64>();
    if sum_sq > 0.0 {
        let norm_factor = 1.0 / sum_sq.sqrt();
        for q in &mut quantifications {
            *q *= norm_factor;
        }
    }

    (quantifications, centroid_coordinates)
}

/// Calculate loss function
pub fn calculate_loss(
    data_matrix: &DMatrix<f64>,
    object_scores: &DMatrix<f64>,
    quantifications: &Vec<Vec<f64>>,
    category_mappings: &Vec<HashMap<String, usize>>
) -> f64 {
    let n_rows = data_matrix.nrows();
    let n_cols = data_matrix.ncols();
    let n_dims = object_scores.ncols();

    let mut total_loss = 0.0;

    for j in 0..n_cols {
        let mapping = &category_mappings[j];
        let quant = &quantifications[j];

        for i in 0..n_rows {
            let cat_val = data_matrix[(i, j)];
            let cat_str = cat_val.to_string();
            if let Some(&cat_idx) = mapping.get(&cat_str) {
                let cat_quant = quant[cat_idx];

                // Calculate squared distance to first dimension
                let diff = object_scores[(i, 0)] - cat_quant;
                total_loss += diff * diff;
            }
        }
    }

    total_loss
}

/// Apply optimal scaling to all data
pub fn apply_optimal_scaling(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<Quantifications, String> {
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
    let mut all_centroid_coordinates = Vec::with_capacity(analysis_vars.len());

    // Initial scaling
    for j in 0..analysis_vars.len() {
        let (quant, centroids) = optimal_scale_variable(
            &data_matrix,
            j,
            &category_mappings[j],
            config,
            dimensions,
            &object_scores
        );
        all_quantifications.push(quant);
        all_centroid_coordinates.push(centroids);
    }

    // Create category quantifications for result
    let mut result_categories = Vec::new();

    for (var_idx, var_name) in analysis_vars.iter().enumerate() {
        let cat_mapping = &category_mappings[var_idx];
        let quantifications = &all_quantifications[var_idx];
        let centroids = &all_centroid_coordinates[var_idx];

        // Map from internal indices back to original category values
        let cat_to_original: HashMap<usize, f64> = cat_mapping
            .iter()
            .map(|(&val, &idx)| (idx, val))
            .collect();

        for (cat_idx, &quant) in quantifications.iter().enumerate() {
            if let Some(&original_cat) = cat_to_original.get(&cat_idx) {
                // Count frequency
                let mut frequency = 0;
                for i in 0..data_matrix.nrows() {
                    if data_matrix[(i, var_idx)] == original_cat {
                        frequency += 1;
                    }
                }

                // Create centroid and vector coordinates
                let centroid = if cat_idx < centroids.len() {
                    centroids[cat_idx].clone()
                } else {
                    vec![0.0; dimensions]
                };

                // Create vector coordinates (simplified)
                let vector: Vec<f64> = (0..dimensions)
                    .map(|d| quant * (if d == 0 { 1.0 } else { 0.1 * (d as f64) }))
                    .collect();

                result_categories.push(CategoryQuantification {
                    category: original_cat.to_string(),
                    frequency,
                    quantification: quant,
                    centroid_coordinates: centroid,
                    vector_coordinates: vector,
                });
            }
        }
    }

    Ok(Quantifications { categories: result_categories })
}

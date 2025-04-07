use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::captca::models::{ config::CATPCAConfig, data::AnalysisData, result::VarianceAccounted };

use super::core::{ create_data_matrix, initialize_object_scores, optimal_scale_variable };

/// Calculate variance per dimension
pub fn calculate_variance_per_dimension(
    data_matrix: &DMatrix<f64>,
    dimensions: usize,
    category_mappings: &Vec<HashMap<f64, usize>>,
    config: &CATPCAConfig
) -> Vec<f64> {
    let n_vars = data_matrix.ncols();
    let n_objects = data_matrix.nrows();

    // Initialize object scores
    let mut object_scores = initialize_object_scores(n_objects, dimensions, config);

    // Initialize quantifications
    let mut all_quantifications = Vec::with_capacity(n_vars);

    for j in 0..n_vars {
        let (quant, _) = optimal_scale_variable(
            data_matrix,
            j,
            &category_mappings[j],
            config,
            dimensions,
            &object_scores
        );
        all_quantifications.push(quant);
    }

    // Calculate variance explained per dimension
    let mut variance_per_dim = vec![0.0; dimensions];

    for d in 0..dimensions {
        let mut var_explained = 0.0;

        for j in 0..n_vars {
            let mut sum_squared_diff = 0.0;

            for i in 0..n_objects {
                let cat_val = data_matrix[(i, j)];
                if let Some(&cat_idx) = category_mappings[j].get(&cat_val) {
                    if cat_idx < all_quantifications[j].len() {
                        let diff = object_scores[(i, d)] - all_quantifications[j][cat_idx];
                        sum_squared_diff += diff * diff;
                    }
                }
            }

            // Variance explained is the total variance minus the unexplained variance
            let total_variance = object_scores
                .column(d)
                .iter()
                .map(|&val| val * val)
                .sum::<f64>();

            var_explained += total_variance - sum_squared_diff / (n_objects as f64);
        }

        variance_per_dim[d] = var_explained;
    }

    variance_per_dim
}

/// Calculate variance accounted for by variables and dimensions
pub fn calculate_variance_accounted(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<VarianceAccounted, String> {
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

    // Initialize quantifications and centroids
    let mut all_quantifications = Vec::with_capacity(analysis_vars.len());
    let mut all_centroid_coordinates = Vec::with_capacity(analysis_vars.len());

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

    // Calculate variance accounted for per variable and dimension
    let mut centroid_coordinates = HashMap::new();
    let mut vector_coordinates = HashMap::new();
    let mut means = HashMap::new();
    let mut totals = HashMap::new();

    for (var_idx, var_name) in analysis_vars.iter().enumerate() {
        let mut centroid_var = Vec::with_capacity(dimensions);
        let mut vector_var = Vec::with_capacity(dimensions);

        for d in 0..dimensions {
            // Calculate centroid variance
            let centroid_variance = calculate_centroid_variance(
                &data_matrix,
                var_idx,
                d,
                &object_scores,
                &category_mappings[var_idx]
            );

            // Calculate vector variance (simplified)
            let vector_variance = centroid_variance * 0.95;

            centroid_var.push(centroid_variance);
            vector_var.push(vector_variance);
        }

        centroid_coordinates.insert(var_name.clone(), centroid_var.clone());
        vector_coordinates.insert(var_name.clone(), vector_var.clone());

        // Calculate mean and total
        let mean_val = centroid_var.iter().sum::<f64>() / (dimensions as f64);
        let total_val = vector_var.iter().sum::<f64>();

        means.insert(var_name.clone(), mean_val);
        totals.insert(var_name.clone(), total_val);
    }

    Ok(VarianceAccounted {
        variables: analysis_vars.clone(),
        centroid_coordinates,
        vector_coordinates,
        means,
        totals,
    })
}

/// Calculate centroid variance for a variable and dimension
pub fn calculate_centroid_variance(
    data_matrix: &DMatrix<f64>,
    var_idx: usize,
    dim_idx: usize,
    object_scores: &DMatrix<f64>,
    category_mapping: &HashMap<String, usize>
) -> f64 {
    let n_objects = data_matrix.nrows();

    // Calculate category centroids
    let mut category_sums = HashMap::new();
    let mut category_counts = HashMap::new();

    for i in 0..n_objects {
        let cat_val = data_matrix[(i, var_idx)];
        let cat_str = cat_val.to_string();
        if let Some(&cat_idx) = category_mapping.get(&cat_str) {
            *category_sums.entry(cat_idx).or_insert(0.0) += object_scores[(i, dim_idx)];
            *category_counts.entry(cat_idx).or_insert(0) += 1;
        }
    }

    // Calculate centroids
    let mut centroids = HashMap::new();
    for (cat_idx, &sum) in &category_sums {
        if let Some(&count) = category_counts.get(cat_idx) {
            if count > 0 {
                centroids.insert(*cat_idx, sum / (count as f64));
            }
        }
    }

    // Calculate explained variance
    let mut explained_sum_sq = 0.0;
    let mut total_sum_sq = 0.0;

    for i in 0..n_objects {
        let score = object_scores[(i, dim_idx)];
        total_sum_sq += score * score;

        let cat_val = data_matrix[(i, var_idx)];
        let cat_str = cat_val.to_string();
        if let Some(&cat_idx) = category_mapping.get(&cat_str) {
            if let Some(&centroid) = centroids.get(&cat_idx) {
                let diff = score - centroid;
                explained_sum_sq += diff * diff;
            }
        }
    }

    // Variance explained is the proportion of variance not left unexplained
    if total_sum_sq > 0.0 {
        1.0 - explained_sum_sq / total_sum_sq
    } else {
        0.0
    }
}

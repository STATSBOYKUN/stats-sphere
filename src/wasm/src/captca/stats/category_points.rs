use std::collections::HashMap;

use crate::captca::models::{
    config::CATPCAConfig,
    data::AnalysisData,
    result::{ CategoryPoints, Point },
};

use super::core::{ create_data_matrix, initialize_object_scores };

/// Calculate category points
pub fn calculate_category_points(
    data: &AnalysisData,
    config: &CATPCAConfig
) -> Result<CategoryPoints, String> {
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

    // Calculate category points
    let mut centroid_coordinates = HashMap::new();
    let mut vector_coordinates = HashMap::new();

    for (var_idx, var_name) in analysis_vars.iter().enumerate() {
        // Skip if this variable is not requested
        if let Some(cat_plots_vars) = &config.category_plots.cat_plots_var {
            if !cat_plots_vars.contains(var_name) {
                continue;
            }
        }

        // Calculate centroids for each category
        let mut category_centroids = Vec::new();
        let mut category_vectors = Vec::new();

        let cat_mapping = &category_mappings[var_idx];

        // Map from internal indices back to original category values
        let cat_to_original: HashMap<usize, f64> = cat_mapping
            .iter()
            .map(|(val_str, &idx)| {
                let val = val_str.parse::<f64>().unwrap_or(0.0);
                (idx, val)
            })
            .collect();

        // For each category, calculate centroid and vector coordinates
        for (cat_idx, original_cat) in &cat_to_original {
            // Calculate centroid
            let mut cat_coords = vec![0.0; dimensions];
            let mut cat_count = 0;

            for i in 0..data_matrix.nrows() {
                let val = data_matrix[(i, var_idx)];
                let val_str = val.to_string();
                if let Some(&stored_idx) = cat_mapping.get(&val_str) {
                    if stored_idx == *cat_idx {
                        for d in 0..dimensions {
                            cat_coords[d] += object_scores[(i, d)];
                        }
                        cat_count += 1;
                    }
                }
            }

            if cat_count > 0 {
                for d in 0..dimensions {
                    cat_coords[d] /= cat_count as f64;
                }
            }

            // Calculate vector coordinates (simplified)
            let mut vector_coords = Vec::with_capacity(dimensions);

            // In a full implementation, this would be based on linear regression
            // For now, we're using a simplified approach
            for d in 0..dimensions {
                vector_coords.push(cat_coords[d] * 0.95);
            }

            // Create Point objects
            if dimensions >= 2 {
                category_centroids.push(Point {
                    x: cat_coords[0],
                    y: cat_coords[1],
                    category: original_cat.to_string(),
                });

                category_vectors.push(Point {
                    x: vector_coords[0],
                    y: vector_coords[1],
                    category: original_cat.to_string(),
                });
            }
        }

        centroid_coordinates.insert(var_name.clone(), category_centroids);
        vector_coordinates.insert(var_name.clone(), category_vectors);
    }

    Ok(CategoryPoints {
        variables: analysis_vars.clone(),
        centroid_coordinates,
        vector_coordinates,
    })
}

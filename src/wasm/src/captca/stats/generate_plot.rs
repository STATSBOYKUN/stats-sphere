use crate::captca::models::{
    config::CATPCAConfig,
    data::AnalysisData,
    result::{ Biplot, BiplotPoint },
};

use super::core::{ calculate_category_points, calculate_object_scores, create_data_matrix };

/// Generate object plots
pub fn generate_object_plots(data: &AnalysisData, config: &CATPCAConfig) -> Result<(), String> {
    // This function would generate and save plots
    // In a pure backend implementation, this might prepare data for frontend rendering
    // or save plot files

    // For this implementation, we'll return success without actually creating plots
    Ok(())
}

/// Generate biplot
pub fn generate_biplot(data: &AnalysisData, config: &CATPCAConfig) -> Result<Biplot, String> {
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

    // Calculate object scores
    let object_scores_result = calculate_object_scores(data, config)?;

    // Calculate category points
    let category_points_result = calculate_category_points(data, config)?;

    // Combine into biplot points
    let mut points = Vec::new();
    let mut centroid_types = Vec::new();

    // Add object points
    for (i, cluster) in object_scores_result.clusters.iter().enumerate() {
        if
            i < object_scores_result.dimensions.len() &&
            object_scores_result.dimensions[i].len() >= 2
        {
            points.push(BiplotPoint {
                x: object_scores_result.dimensions[i][0],
                y: object_scores_result.dimensions[i][1],
                point_type: "object".to_string(),
                label: cluster.clone(),
                cluster: Some(cluster.clone()),
            });
        }
    }

    // Add category centroids
    for (var_name, centroids) in &category_points_result.centroid_coordinates {
        centroid_types.push(var_name.clone());

        for centroid in centroids {
            points.push(BiplotPoint {
                x: centroid.x,
                y: centroid.y,
                point_type: format!("centroid_{}", var_name),
                label: centroid.category.clone(),
                cluster: None,
            });
        }
    }

    Ok(Biplot {
        points,
        centroid_types,
    })
}

use crate::correspondence::models::{
    config::CorrespondenceAnalysisConfig,
    data::AnalysisData,
    result::{ ConfidencePoints, PointContributions, PointsAnalysis },
};

use super::core::{
    apply_normalization,
    calculate_column_inertia,
    calculate_column_profiles,
    calculate_row_inertia,
    calculate_row_profiles,
    calculate_score_correlation,
    create_correspondence_table,
    get_normalization_parameters,
    normalize_contributions,
};

pub fn calculate_row_points(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<PointsAnalysis, String> {
    // Get row profiles for masses
    let row_profiles = calculate_row_profiles(data, config)?;

    // Get normalized scores
    let (singular_values, row_scores, _) = apply_normalization(data, config)?;

    // Calculate inertia for each row
    let inertia = calculate_row_inertia(data, config)?;

    // Get normalization parameters
    let (alpha, _) = get_normalization_parameters(config);

    // Calculate dimensions to use
    let dimensions = row_scores[0].len();

    // Calculate contribution of point to inertia of dimension
    let mut of_point_to_inertia: Vec<Vec<f64>> =
        vec![vec![0.0; dimensions]; row_profiles.mass.len()];

    for i in 0..row_profiles.mass.len() {
        for j in 0..dimensions {
            if j < singular_values.len() {
                // tau_is = (f_i+/N) * r_is^2 * lambda_s^(2*alpha-2)
                of_point_to_inertia[i][j] =
                    row_profiles.mass[i] *
                    row_scores[i][j].powi(2) *
                    singular_values[j].powf(2.0 * alpha - 2.0);
            }
        }
    }

    // Normalize contributions to sum to 1.0 for each dimension
    normalize_contributions(&mut of_point_to_inertia);

    // Calculate contribution of dimension to inertia of point
    let mut of_dimension_to_inertia: Vec<Vec<f64>> =
        vec![vec![0.0; dimensions]; row_profiles.mass.len()];

    for i in 0..row_profiles.mass.len() {
        if inertia[i] > 0.0 {
            for j in 0..dimensions {
                if j < singular_values.len() {
                    // sigma_is = (f_i+/N) * r_is^2 * lambda_s^(2-2*alpha) / I_i
                    of_dimension_to_inertia[i][j] =
                        (row_profiles.mass[i] *
                            row_scores[i][j].powi(2) *
                            singular_values[j].powf(2.0 - 2.0 * alpha)) /
                        inertia[i];
                }
            }
        }
    }

    Ok(PointsAnalysis {
        mass: row_profiles.mass,
        scores: row_scores,
        inertia,
        contributions: PointContributions {
            of_point_to_inertia,
            of_dimension_to_inertia,
        },
    })
}

// Calculate column points overview
pub fn calculate_column_points(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<PointsAnalysis, String> {
    // Get column profiles for masses
    let column_profiles = calculate_column_profiles(data, config)?;

    // Get normalized scores
    let (singular_values, _, column_scores) = apply_normalization(data, config)?;

    // Calculate inertia for each column
    let inertia = calculate_column_inertia(data, config)?;

    // Get normalization parameters
    let (_, beta) = get_normalization_parameters(config);

    // Calculate dimensions to use
    let dimensions = column_scores[0].len();

    // Calculate contribution of point to inertia of dimension
    let mut of_point_to_inertia: Vec<Vec<f64>> =
        vec![vec![0.0; dimensions]; column_profiles.mass.len()];

    for i in 0..column_profiles.mass.len() {
        for j in 0..dimensions {
            if j < singular_values.len() {
                // tau_js = (f_+j/N) * c_js^2 * lambda_s^(2*beta-2)
                of_point_to_inertia[i][j] =
                    column_profiles.mass[i] *
                    column_scores[i][j].powi(2) *
                    singular_values[j].powf(2.0 * beta - 2.0);
            }
        }
    }

    // Normalize contributions to sum to 1.0 for each dimension
    normalize_contributions(&mut of_point_to_inertia);

    // Calculate contribution of dimension to inertia of point
    let mut of_dimension_to_inertia: Vec<Vec<f64>> =
        vec![vec![0.0; dimensions]; column_profiles.mass.len()];

    for i in 0..column_profiles.mass.len() {
        if inertia[i] > 0.0 {
            for j in 0..dimensions {
                if j < singular_values.len() {
                    // sigma_js = (f_+j/N) * c_js^2 * lambda_s^(2-2*beta) / I_j
                    of_dimension_to_inertia[i][j] =
                        (column_profiles.mass[i] *
                            column_scores[i][j].powi(2) *
                            singular_values[j].powf(2.0 - 2.0 * beta)) /
                        inertia[i];
                }
            }
        }
    }

    Ok(PointsAnalysis {
        mass: column_profiles.mass,
        scores: column_scores,
        inertia,
        contributions: PointContributions {
            of_point_to_inertia,
            of_dimension_to_inertia,
        },
    })
}

pub fn calculate_confidence_row_points(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<ConfidencePoints, String> {
    // Get row points analysis
    let row_points = calculate_row_points(data, config)?;

    // Get correspondence table and profiles for calculations
    let correspondence_table = create_correspondence_table(data, config)?;
    let row_profiles = calculate_row_profiles(data, config)?;

    // Calculate standard deviations for row scores using delta method
    let dimensions = row_points.scores[0].len();
    let mut standard_deviation = vec![vec![0.0; dimensions]; row_points.mass.len()];
    let mut correlation = vec![0.0; row_points.mass.len()];

    // Get singular values for calculations
    let (singular_values, _, _) = apply_normalization(data, config)?;

    // Calculate grand total
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();

    // Apply delta method for variance estimation
    for i in 0..row_points.mass.len() {
        // Calculate standard deviations based on delta method (approximation)
        for d in 0..dimensions {
            if row_profiles.mass[i] > 0.0 && d < singular_values.len() {
                // Basic delta method approximation for standard deviation
                // SD is inversely proportional to sqrt(N*mass) and proportional to the singular value
                standard_deviation[i][d] =
                    singular_values[d] / (grand_total * row_profiles.mass[i]).sqrt();
            }
        }

        // Calculate correlations between first two dimensions
        if dimensions >= 2 {
            // Calculate correlation between first two dimensions using covariance formula
            correlation[i] = calculate_score_correlation(
                &row_points.scores[i],
                &singular_values,
                0,
                1
            );
        }
    }

    Ok(ConfidencePoints {
        standard_deviation,
        correlation,
    })
}

// Calculate confidence points for column points
pub fn calculate_confidence_column_points(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<ConfidencePoints, String> {
    // Get column points analysis
    let column_points = calculate_column_points(data, config)?;

    // Get correspondence table and profiles for calculations
    let correspondence_table = create_correspondence_table(data, config)?;
    let column_profiles = calculate_column_profiles(data, config)?;

    // Calculate standard deviations for column scores using delta method
    let dimensions = column_points.scores[0].len();
    let mut standard_deviation = vec![vec![0.0; dimensions]; column_points.mass.len()];
    let mut correlation = vec![0.0; column_points.mass.len()];

    // Get singular values for calculations
    let (singular_values, _, _) = apply_normalization(data, config)?;

    // Calculate grand total
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();

    // Apply delta method for variance estimation
    for i in 0..column_points.mass.len() {
        // Calculate standard deviations based on delta method (approximation)
        for d in 0..dimensions {
            if column_profiles.mass[i] > 0.0 && d < singular_values.len() {
                // Basic delta method approximation for standard deviation
                // SD is inversely proportional to sqrt(N*mass) and proportional to the singular value
                standard_deviation[i][d] =
                    singular_values[d] / (grand_total * column_profiles.mass[i]).sqrt();
            }
        }

        // Calculate correlations between first two dimensions
        if dimensions >= 2 {
            // Calculate correlation between first two dimensions using covariance formula
            correlation[i] = calculate_score_correlation(
                &column_points.scores[i],
                &singular_values,
                0,
                1
            );
        }
    }

    Ok(ConfidencePoints {
        standard_deviation,
        correlation,
    })
}

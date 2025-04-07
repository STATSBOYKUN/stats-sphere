use crate::factor::models::{
    config::FactorAnalysisConfig,
    data::AnalysisData,
    result::{
        AntiImageMatrices,
        Communalities,
        ComponentMatrix,
        ComponentScoreCoefficientMatrix,
        ComponentScoreCovarianceMatrix,
        ComponentTransformationMatrix,
        CorrelationMatrix,
        DescriptiveStatistic,
        InverseCorrelationMatrix,
        KMOBartlettsTest,
        ReproducedCorrelations,
        RotatedComponentMatrix,
        ScreePlot,
        TotalVarianceExplained,
    },
};

use super::core::{
    calculate_anti_image_matrices,
    calculate_descriptive_statistics,
    calculate_kmo_bartletts_test,
    calculate_matrix,
    calculate_reproduced_correlations,
    calculate_score_coefficients,
    create_communalities,
    create_component_matrix,
    create_component_transformation_matrix,
    create_correlation_matrix,
    create_inverse_correlation_matrix,
    create_rotated_component_matrix,
    create_scree_plot,
    create_total_variance_explained,
    extract_data_matrix,
    extract_factors,
    rotate_factors,
};

pub fn calculate_correlation_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<CorrelationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    Ok(create_correlation_matrix(&corr_matrix, &var_names))
}

// calculate_covariance_matrix_wrapper - Adapter function
pub fn calculate_covariance_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<CorrelationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let cov_matrix = calculate_matrix(&data_matrix, "covariance")?;
    Ok(create_correlation_matrix(&cov_matrix, &var_names))
}

// calculate_inverse_correlation_matrix_wrapper - Adapter function
pub fn calculate_inverse_correlation_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<InverseCorrelationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let inverse = match corr_matrix.try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Could not invert correlation matrix".to_string());
        }
    };
    Ok(create_inverse_correlation_matrix(&inverse, &var_names))
}

// calculate_descriptive_statistics_wrapper - Adapter function
pub fn calculate_descriptive_statistics_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<Vec<DescriptiveStatistic>, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    Ok(calculate_descriptive_statistics(&data_matrix, &var_names))
}

// calculate_kmo_bartletts_test_wrapper - Adapter function
pub fn calculate_kmo_bartletts_test_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<KMOBartlettsTest, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    Ok(calculate_kmo_bartletts_test(&corr_matrix, &data_matrix))
}

// calculate_anti_image_matrices_wrapper - Adapter function
pub fn calculate_anti_image_matrices_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<AntiImageMatrices, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let inverse = match corr_matrix.try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Could not invert correlation matrix".to_string());
        }
    };
    Ok(calculate_anti_image_matrices(&inverse, &var_names))
}

// calculate_communalities_wrapper - Adapter function
pub fn calculate_communalities_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<Communalities, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_communalities(&extraction_result, &var_names))
}

// calculate_total_variance_explained_wrapper - Adapter function
pub fn calculate_total_variance_explained_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<TotalVarianceExplained, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_total_variance_explained(&extraction_result))
}

// calculate_component_matrix_wrapper - Adapter function
pub fn calculate_component_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_component_matrix(&extraction_result, &var_names))
}

// calculate_scree_plot_wrapper - Adapter function
pub fn calculate_scree_plot_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ScreePlot, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_scree_plot(&extraction_result))
}

// calculate_reproduced_correlations_wrapper - Adapter function
pub fn calculate_reproduced_correlations_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ReproducedCorrelations, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(calculate_reproduced_correlations(&extraction_result, &corr_matrix, &var_names))
}

// calculate_rotated_component_matrix_wrapper - Adapter function
pub fn calculate_rotated_component_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<RotatedComponentMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let rotation_result = rotate_factors(&extraction_result, config)?;
    Ok(create_rotated_component_matrix(&rotation_result, &var_names))
}

// calculate_component_transformation_matrix_wrapper - Adapter function
pub fn calculate_component_transformation_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentTransformationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let rotation_result = rotate_factors(&extraction_result, config)?;
    Ok(create_component_transformation_matrix(&rotation_result))
}

// calculate_component_score_coefficient_matrix_wrapper - Adapter function
pub fn calculate_component_score_coefficient_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentScoreCoefficientMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let (coefficient_matrix, _) = calculate_score_coefficients(
        &corr_matrix,
        &extraction_result,
        config,
        &var_names
    )?;
    Ok(coefficient_matrix)
}

// calculate_component_score_covariance_matrix_wrapper - Adapter function
pub fn calculate_component_score_covariance_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentScoreCovarianceMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let (_, covariance_matrix) = calculate_score_coefficients(
        &corr_matrix,
        &extraction_result,
        config,
        &var_names
    )?;
    Ok(covariance_matrix)
}

// generate_loading_plots_wrapper - Placeholder function
pub fn generate_loading_plots_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<(), String> {
    // Implementation would depend on specific requirements
    Ok(())
}

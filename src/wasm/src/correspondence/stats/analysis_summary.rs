use crate::correspondence::models::{
    config::CorrespondenceAnalysisConfig,
    data::AnalysisData,
    result::{ AnalysisSummary, ProportionOfInertia },
};

use super::{
    core::{ apply_normalization, calculate_chi_square_significance, create_correspondence_table },
};

pub fn calculate_analysis_summary(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<AnalysisSummary, String> {
    // Apply normalization to get singular values
    let (singular_values, _, _) = apply_normalization(data, config)?;

    // Calculate inertia (square of singular values)
    let inertia: Vec<f64> = singular_values
        .iter()
        .map(|&sv| sv * sv)
        .collect();

    // Calculate total inertia
    let total_inertia: f64 = inertia.iter().sum();
    if total_inertia <= 0.0 {
        return Err("Total inertia is zero or negative".to_string());
    }

    // Calculate proportion of inertia (explained variance)
    let accounted_for: Vec<f64> = inertia
        .iter()
        .map(|&i| i / total_inertia)
        .collect();

    // Calculate cumulative proportion
    let mut cumulative: Vec<f64> = Vec::with_capacity(accounted_for.len());
    let mut cumul_sum = 0.0;

    for &prop in &accounted_for {
        cumul_sum += prop;
        cumulative.push(cumul_sum);
    }

    // Calculate chi-square (inertia * grand total)
    let correspondence_table = create_correspondence_table(data, config)?;
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();
    let chi_square: Vec<f64> = inertia
        .iter()
        .map(|&i| i * grand_total)
        .collect();

    // Calculate significance (p-values) using chi-square distribution
    let df = (correspondence_table.data.len() - 1) * (correspondence_table.data[0].len() - 1);
    let significance = calculate_chi_square_significance(&chi_square, df)?;

    Ok(AnalysisSummary {
        singular_values,
        inertia,
        chi_square,
        significance,
        proportion_of_inertia: ProportionOfInertia {
            accounted_for,
            cumulative,
        },
    })
}

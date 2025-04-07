use crate::correspondence::models::{ config::CorrespondenceAnalysisConfig, data::AnalysisData };

use super::core::calculate_analysis_summary;

pub fn perform_permutation_test(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<Vec<f64>, String> {
    // In a real implementation, this would perform many random permutations of the data
    // and calculate the test statistic each time to build a null distribution

    // For now, we approximate using the already calculated chi-square values and significance
    let summary = calculate_analysis_summary(data, config)?;

    // Number of permutations would be used to determine convergence/precision
    let max_permutations = config.statistics.max_permutations;

    // Return the significance values from the analysis summary
    Ok(summary.significance)
}

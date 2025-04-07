use crate::univariate::models::{
    config::UnivariateConfig,
    data::AnalysisData,
    result::{ SpreadVsLevelPlots, SpreadVsLevelPoint },
};

use super::core::{ extract_dependent_value, get_factor_combinations, matches_combination };

/// Calculate spread vs. level plots if requested
pub fn calculate_spread_vs_level_plots(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<SpreadVsLevelPlots>, String> {
    if !config.options.spr_vs_level {
        return Ok(None);
    }

    let dep_var_name = match &config.main.dep_var {
        Some(name) => name.clone(),
        None => {
            return Err("No dependent variable specified in configuration".to_string());
        }
    };

    let mut points = Vec::new();
    let factor_combinations = get_factor_combinations(data, config)?;

    for combo in &factor_combinations {
        let mut values = Vec::new();

        for records in &data.dependent_data {
            for record in records {
                if matches_combination(record, combo, data, config) {
                    if let Some(value) = extract_dependent_value(record, &dep_var_name) {
                        values.push(value);
                    }
                }
            }
        }

        if values.len() > 1 {
            let level_mean = values.iter().sum::<f64>() / (values.len() as f64);
            let variance =
                values
                    .iter()
                    .map(|v| (v - level_mean).powi(2))
                    .sum::<f64>() / ((values.len() - 1) as f64);
            let std_deviation = variance.sqrt();

            points.push(SpreadVsLevelPoint {
                level_mean,
                spread_standard_deviation: std_deviation,
            });
        }
    }

    Ok(Some(SpreadVsLevelPlots { points }))
}

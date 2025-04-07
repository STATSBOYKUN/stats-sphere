use crate::univariate::models::{
    config::UnivariateConfig,
    data::AnalysisData,
    result::GeneralEstimableFunction,
};

use super::core::get_factor_levels;

/// Calculate general estimable function if requested
pub fn calculate_general_estimable_function(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<GeneralEstimableFunction>, String> {
    if !config.options.general_fun {
        return Ok(None);
    }

    let mut matrix = Vec::new();
    let mut row = Vec::new();

    // Add intercept term
    if config.model.intercept {
        row.push(1);
    }

    // Add zeros for factor parameters
    if let Some(factor_str) = &config.main.fix_factor {
        let factors: Vec<&str> = factor_str
            .split(',')
            .map(|s| s.trim())
            .collect();

        for factor in &factors {
            let factor_levels = get_factor_levels(data, factor)?;
            for _ in 0..factor_levels.len() - 1 {
                row.push(0);
            }
        }
    }

    matrix.push(row);

    // Add rows for each factor level
    if let Some(factor_str) = &config.main.fix_factor {
        let factors: Vec<&str> = factor_str
            .split(',')
            .map(|s| s.trim())
            .collect();

        for (f_idx, factor) in factors.iter().enumerate() {
            let factor_levels = get_factor_levels(data, factor)?;

            let mut base_idx = 1; // Start after intercept
            if config.model.intercept {
                // Skip parameters for factors before this one
                for i in 0..f_idx {
                    let prev_factor = factors[i];
                    let prev_levels = get_factor_levels(data, prev_factor)?;
                    base_idx += prev_levels.len() - 1;
                }
            }

            for (l_idx, level) in factor_levels.iter().enumerate() {
                if l_idx == factor_levels.len() - 1 {
                    continue; // Skip reference level
                }

                let mut row = vec![0; matrix[0].len()];
                let param_idx = base_idx + l_idx;
                if param_idx < row.len() {
                    row[param_idx] = 1;
                    matrix.push(row);
                }
            }
        }
    }

    Ok(Some(GeneralEstimableFunction { matrix }))
}

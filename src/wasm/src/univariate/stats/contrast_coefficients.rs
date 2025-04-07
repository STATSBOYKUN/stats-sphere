use crate::univariate::models::{
    config::{ ContrastMethod, UnivariateConfig },
    data::AnalysisData,
    result::ContrastCoefficients,
};

use super::core::get_factor_levels;

/// Calculate contrast coefficients if requested
pub fn calculate_contrast_coefficients(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<ContrastCoefficients>, String> {
    let mut parameter = Vec::new();
    let mut coefficients = Vec::new();

    // Add intercept parameter
    if config.model.intercept {
        parameter.push("Intercept".to_string());
    }

    // Add factor parameters
    if let Some(factor_str) = &config.main.fix_factor {
        let factors: Vec<&str> = factor_str
            .split(',')
            .map(|s| s.trim())
            .collect();

        for factor in &factors {
            let factor_levels = get_factor_levels(data, factor)?;
            for level in &factor_levels {
                parameter.push(format!("{}={}", factor, level));
            }
        }
    }

    // Generate contrast coefficients based on method
    match &config.contrast.contrast_method {
        ContrastMethod::Deviation => {
            // Deviation contrasts: compare each level to the grand mean
            coefficients = vec![0.0; parameter.len()];

            // Set intercept coefficient
            if config.model.intercept {
                coefficients[0] = 1.0;
            }

            // Set factor coefficients
            let mut param_idx = if config.model.intercept { 1 } else { 0 };
            if let Some(factor_str) = &config.main.fix_factor {
                let factors: Vec<&str> = factor_str
                    .split(',')
                    .map(|s| s.trim())
                    .collect();

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let level_count = factor_levels.len();

                    // Set deviation contrast for each level except last
                    for i in 0..level_count - 1 {
                        coefficients[param_idx + i] = 1.0 - 1.0 / (level_count as f64);
                    }

                    // Last level gets -1
                    if param_idx + level_count - 1 < coefficients.len() {
                        coefficients[param_idx + level_count - 1] = -1.0;
                    }

                    param_idx += level_count;
                }
            }
        }
        ContrastMethod::Simple => {
            // Simple contrasts: compare each level to the reference level
            coefficients = vec![0.0; parameter.len()];

            // Set intercept coefficient
            if config.model.intercept {
                coefficients[0] = 1.0;
            }

            // Set factor coefficients
            let mut param_idx = if config.model.intercept { 1 } else { 0 };
            if let Some(factor_str) = &config.main.fix_factor {
                let factors: Vec<&str> = factor_str
                    .split(',')
                    .map(|s| s.trim())
                    .collect();

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let level_count = factor_levels.len();
                    let ref_level = if config.contrast.first { 0 } else { level_count - 1 };

                    // Set contrast for each level
                    for i in 0..level_count {
                        if i == ref_level {
                            coefficients[param_idx + i] = 0.0; // Reference level
                        } else {
                            coefficients[param_idx + i] = 1.0; // Comparison level
                            coefficients[param_idx + ref_level] = -1.0; // Reference level
                        }
                    }

                    param_idx += level_count;
                }
            }
        }
        ContrastMethod::Difference => {
            // Difference contrasts: compare each level to the mean of previous levels
            coefficients = vec![0.0; parameter.len()];

            // Set intercept coefficient
            if config.model.intercept {
                coefficients[0] = 1.0;
            }

            // Set factor coefficients
            let mut param_idx = if config.model.intercept { 1 } else { 0 };
            if let Some(factor_str) = &config.main.fix_factor {
                let factors: Vec<&str> = factor_str
                    .split(',')
                    .map(|s| s.trim())
                    .collect();

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let level_count = factor_levels.len();

                    // For each level (except first)
                    for i in 1..level_count {
                        // Current level gets weight 1
                        coefficients[param_idx + i] = 1.0;

                        // Previous levels each get weight -1/i
                        for j in 0..i {
                            coefficients[param_idx + j] = -1.0 / (i as f64);
                        }
                    }

                    param_idx += level_count;
                }
            }
        }
        ContrastMethod::Helmert => {
            // Helmert contrasts: compare each level to the mean of subsequent levels
            coefficients = vec![0.0; parameter.len()];

            // Set intercept coefficient
            if config.model.intercept {
                coefficients[0] = 1.0;
            }

            // Set factor coefficients
            let mut param_idx = if config.model.intercept { 1 } else { 0 };
            if let Some(factor_str) = &config.main.fix_factor {
                let factors: Vec<&str> = factor_str
                    .split(',')
                    .map(|s| s.trim())
                    .collect();

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let level_count = factor_levels.len();

                    // For each level (except last)
                    for i in 0..level_count - 1 {
                        // Current level gets weight 1
                        coefficients[param_idx + i] = 1.0;

                        // Subsequent levels each get weight -1/(level_count-i-1)
                        for j in i + 1..level_count {
                            coefficients[param_idx + j] = -1.0 / ((level_count - i - 1) as f64);
                        }
                    }

                    param_idx += level_count;
                }
            }
        }
        ContrastMethod::Repeated => {
            // Repeated contrasts: compare each level to the next level
            coefficients = vec![0.0; parameter.len()];

            // Set intercept coefficient
            if config.model.intercept {
                coefficients[0] = 1.0;
            }

            // Set factor coefficients
            let mut param_idx = if config.model.intercept { 1 } else { 0 };
            if let Some(factor_str) = &config.main.fix_factor {
                let factors: Vec<&str> = factor_str
                    .split(',')
                    .map(|s| s.trim())
                    .collect();

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let level_count = factor_levels.len();

                    // For each level (except last)
                    for i in 0..level_count - 1 {
                        // Current level gets weight 1
                        coefficients[param_idx + i] = 1.0;

                        // Next level gets weight -1
                        coefficients[param_idx + i + 1] = -1.0;
                    }

                    param_idx += level_count;
                }
            }
        }
        ContrastMethod::Polynomial => {
            // Polynomial contrasts: orthogonal polynomials across levels
            coefficients = vec![0.0; parameter.len()];

            // Set intercept coefficient
            if config.model.intercept {
                coefficients[0] = 1.0;
            }

            // Set factor coefficients
            let mut param_idx = if config.model.intercept { 1 } else { 0 };
            if let Some(factor_str) = &config.main.fix_factor {
                let factors: Vec<&str> = factor_str
                    .split(',')
                    .map(|s| s.trim())
                    .collect();

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let level_count = factor_levels.len();

                    // Generate polynomial contrasts
                    // Linear trend: equally spaced contrast
                    let linear_contrast = generate_polynomial_contrast(level_count, 1);

                    // Apply the contrast
                    for i in 0..level_count {
                        if param_idx + i < coefficients.len() {
                            coefficients[param_idx + i] = linear_contrast[i];
                        }
                    }

                    param_idx += level_count;
                }
            }
        }
        ContrastMethod::None => {
            // No contrasts - already handled by early return
        }
    }

    Ok(
        Some(ContrastCoefficients {
            parameter,
            coefficients,
        })
    )
}

/// Generate polynomial contrasts of specified degree for a given number of levels
pub fn generate_polynomial_contrast(level_count: usize, degree: usize) -> Vec<f64> {
    let mut contrasts = vec![0.0; level_count];

    // Generate simple linear contrast for degree 1
    if degree == 1 {
        let denominator = ((level_count * level_count - 1) as f64) / 12.0;
        let scale = 1.0 / denominator.sqrt();

        // For equally spaced values from -1 to 1
        for i in 0..level_count {
            let x = -1.0 + (2.0 * (i as f64)) / ((level_count - 1) as f64);
            contrasts[i] = x * scale;
        }
    } else {
        // Higher degree polynomials would need Gram-Schmidt orthogonalization
        // Simplified implementation for higher degrees
        for i in 0..level_count {
            let x = -1.0 + (2.0 * (i as f64)) / ((level_count - 1) as f64);
            contrasts[i] = x.powi(degree as i32);
        }

        // Normalize
        let sum_sq = contrasts
            .iter()
            .map(|x| x * x)
            .sum::<f64>()
            .sqrt();
        if sum_sq > 0.0 {
            for i in 0..level_count {
                contrasts[i] /= sum_sq;
            }
        }
    }

    contrasts
}

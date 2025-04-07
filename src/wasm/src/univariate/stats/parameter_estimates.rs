use crate::univariate::models::{
    config::UnivariateConfig,
    data::AnalysisData,
    result::{ ConfidenceInterval, ParameterEstimateEntry, ParameterEstimates },
};

use super::core::{
    calculate_observed_power_t,
    calculate_t_critical,
    calculate_t_significance,
    count_total_cases,
    extract_dependent_value,
    get_factor_levels,
    get_level_values,
};

/// Calculate parameter estimates if requested
pub fn calculate_parameter_estimates(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<ParameterEstimates>, String> {
    if !config.options.param_est {
        return Ok(None);
    }

    let dep_var_name = match &config.main.dep_var {
        Some(name) => name.clone(),
        None => {
            return Err("No dependent variable specified in configuration".to_string());
        }
    };

    let mut estimates = Vec::new();
    let n_total = count_total_cases(data);

    // Extract all dependent values for calculations
    let mut all_values = Vec::new();
    for records in &data.dependent_data {
        for record in records {
            if let Some(value) = extract_dependent_value(record, &dep_var_name) {
                all_values.push(value);
            }
        }
    }

    let grand_mean = all_values.iter().sum::<f64>() / (all_values.len() as f64);
    let error_variance =
        all_values
            .iter()
            .map(|val| (val - grand_mean).powi(2))
            .sum::<f64>() / ((n_total - 1) as f64);

    // Add intercept parameter
    if config.model.intercept {
        let intercept_value = grand_mean;
        let std_error = (error_variance / (n_total as f64)).sqrt();
        let t_value = intercept_value / std_error;
        let sig_level = calculate_t_significance(n_total - 1, t_value);
        let ci_width =
            std_error * calculate_t_critical(n_total - 1, config.options.sig_level / 2.0);
        let lower_bound = intercept_value - ci_width;
        let upper_bound = intercept_value + ci_width;
        let partial_eta_squared = t_value.powi(2) / (t_value.powi(2) + ((n_total - 1) as f64));
        let noncent_parameter = t_value.abs();
        let observed_power = calculate_observed_power_t(
            n_total - 1,
            t_value,
            config.options.sig_level
        );

        estimates.push(ParameterEstimateEntry {
            parameter: "Intercept".to_string(),
            b: intercept_value,
            std_error,
            t_value,
            significance: sig_level,
            confidence_interval: ConfidenceInterval {
                lower_bound,
                upper_bound,
            },
            partial_eta_squared,
            noncent_parameter,
            observed_power,
        });
    }

    // Add parameters for factors
    if let Some(factor_str) = &config.main.fix_factor {
        let factors: Vec<&str> = factor_str
            .split(',')
            .map(|s| s.trim())
            .collect();

        for factor in &factors {
            let factor_levels = get_factor_levels(data, factor)?;
            let reference_level = factor_levels.last().unwrap().clone(); // Use last level as reference

            // For each level except the reference level
            for i in 0..factor_levels.len() - 1 {
                let level = &factor_levels[i];

                // Get values for this level and reference level
                let level_values = get_level_values(data, factor, level, &dep_var_name)?;
                let ref_values = get_level_values(data, factor, &reference_level, &dep_var_name)?;

                // Calculate parameter estimate (difference from reference level)
                let level_mean = level_values.iter().sum::<f64>() / (level_values.len() as f64);
                let ref_mean = ref_values.iter().sum::<f64>() / (ref_values.len() as f64);
                let effect = level_mean - ref_mean;

                // Calculate standard error
                let level_n = level_values.len() as f64;
                let ref_n = ref_values.len() as f64;
                let std_error = (error_variance * (1.0 / level_n + 1.0 / ref_n)).sqrt();

                // Calculate t-statistic and significance
                let t_value = effect / std_error;
                let df = n_total - factors.len();
                let sig_level = calculate_t_significance(df, t_value);

                // Calculate confidence interval
                let ci_width = std_error * calculate_t_critical(df, config.options.sig_level / 2.0);
                let lower_bound = effect - ci_width;
                let upper_bound = effect + ci_width;

                // Calculate effect size and power
                let partial_eta_squared = t_value.powi(2) / (t_value.powi(2) + (df as f64));
                let noncent_parameter = t_value.abs();
                let observed_power = calculate_observed_power_t(
                    df,
                    t_value,
                    config.options.sig_level
                );

                estimates.push(ParameterEstimateEntry {
                    parameter: format!("{}={}", factor, level),
                    b: effect,
                    std_error,
                    t_value,
                    significance: sig_level,
                    confidence_interval: ConfidenceInterval {
                        lower_bound,
                        upper_bound,
                    },
                    partial_eta_squared,
                    noncent_parameter,
                    observed_power,
                });
            }

            // Add null parameter for reference level
            estimates.push(ParameterEstimateEntry {
                parameter: format!("{}={}", factor, reference_level),
                b: 0.0,
                std_error: 0.0,
                t_value: 0.0,
                significance: 0.0,
                confidence_interval: ConfidenceInterval {
                    lower_bound: 0.0,
                    upper_bound: 0.0,
                },
                partial_eta_squared: 0.0,
                noncent_parameter: 0.0,
                observed_power: 0.0,
            });
        }
    }

    Ok(Some(ParameterEstimates { estimates }))
}

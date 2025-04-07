use std::collections::HashMap;

use crate::univariate::models::{
    config::{ SumOfSquaresMethod, UnivariateConfig },
    data::{ AnalysisData, DataValue },
    result::{ TestEffectEntry, TestsBetweenSubjectsEffects },
};

use super::core::{
    calculate_f_significance,
    calculate_factor_ss,
    calculate_observed_power,
    calculate_type2_ss,
    count_total_cases,
    extract_dependent_value,
    get_factor_combinations,
    get_factor_levels,
    get_level_values_adjusted,
};

/// Calculate tests of between-subjects effects (ANOVA)
pub fn calculate_tests_between_subjects_effects(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<TestsBetweenSubjectsEffects>, String> {
    if data.dependent_data.is_empty() {
        return Ok(None);
    }

    let dep_var_name = match &config.main.dep_var {
        Some(name) => name.clone(),
        None => {
            return Err("No dependent variable specified in configuration".to_string());
        }
    };

    let mut source = HashMap::new();
    let n_total = count_total_cases(data);

    // Extract all dependent values
    let mut all_values = Vec::new();
    for records in &data.dependent_data {
        for record in records {
            if let Some(value) = extract_dependent_value(record, &dep_var_name) {
                all_values.push(value);
            }
        }
    }

    // Calculate grand mean and total sum of squares
    let grand_mean = all_values.iter().sum::<f64>() / (all_values.len() as f64);
    let ss_total = all_values
        .iter()
        .map(|val| (val - grand_mean).powi(2))
        .sum::<f64>();

    // Calculate sum of squares based on the requested method
    let mut ss_model = 0.0;
    let factor_combinations = get_factor_combinations(data, config)?;

    // Add intercept
    if config.model.intercept {
        let ss_intercept = (n_total as f64) * grand_mean.powi(2);
        let ms_intercept = ss_intercept;
        let f_value = if ss_total > 0.0 {
            ss_intercept / (ss_total / ((n_total - 1) as f64))
        } else {
            0.0
        };
        let significance = calculate_f_significance(1, n_total - 1, f_value);
        let partial_eta_squared = if ss_intercept + ss_total > 0.0 {
            ss_intercept / (ss_intercept + ss_total)
        } else {
            0.0
        };
        let noncent_parameter = f_value;
        let observed_power = calculate_observed_power(
            1,
            n_total - 1,
            f_value,
            config.options.sig_level
        );

        source.insert("Intercept".to_string(), TestEffectEntry {
            sum_of_squares: ss_intercept,
            df: 1,
            mean_square: ms_intercept,
            f_value,
            significance,
            partial_eta_squared,
            noncent_parameter,
            observed_power,
        });
    }

    // Calculate main effects based on selected sum of squares method
    if let Some(factor_str) = &config.main.fix_factor {
        let factors:  = factor_str.clone();

        match config.model.sum_of_square_method {
            SumOfSquaresMethod::TypeI => {
                // Type I: Sequential SS - each term adjusted for terms that precede it
                let mut residual_values = all_values.clone();
                let mut residual_mean = grand_mean;

                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let df = factor_levels.len() - 1;

                    // Calculate the factor effect
                    let mut factor_ss = 0.0;
                    let level_means = factor_levels
                        .iter()
                        .map(|level| {
                            let level_values = get_level_values_adjusted(
                                &residual_values,
                                data,
                                factor,
                                level,
                                &dep_var_name
                            )?;
                            let level_mean = if !level_values.is_empty() {
                                level_values.iter().sum::<f64>() / (level_values.len() as f64)
                            } else {
                                0.0
                            };
                            Ok((level.clone(), level_mean, level_values.len()))
                        })
                        .collect::<Result<Vec<_>, String>>()?;

                    for (level, level_mean, count) in &level_means {
                        factor_ss += (*count as f64) * (level_mean - residual_mean).powi(2);
                    }

                    // Adjust residuals for this factor
                    for (i, record) in data.dependent_data.iter().flatten().enumerate() {
                        if i >= residual_values.len() {
                            continue;
                        }
                        for (key, value) in &record.values {
                            if key == *factor {
                                let level = match value {
                                    DataValue::Number(n) => n.to_string(),
                                    DataValue::Text(t) => t.clone(),
                                    DataValue::Boolean(b) => b.to_string(),
                                    DataValue::Null => "null".to_string(),
                                };
                                if
                                    let Some((_, level_mean, _)) = level_means
                                        .iter()
                                        .find(|(l, _, _)| l == &level)
                                {
                                    residual_values[i] =
                                        residual_values[i] - (level_mean - residual_mean);
                                }
                            }
                        }
                    }

                    // Update residual mean
                    residual_mean =
                        residual_values.iter().sum::<f64>() / (residual_values.len() as f64);

                    // Add factor to model SS
                    ss_model += factor_ss;

                    // Create test effect entry
                    let ms_factor = factor_ss / (df as f64);
                    let f_value = if ss_total - ss_model > 0.0 {
                        ms_factor / ((ss_total - ss_model) / ((n_total - factors.len() - 1) as f64))
                    } else {
                        0.0
                    };
                    let significance = calculate_f_significance(
                        df,
                        n_total - factors.len(),
                        f_value
                    );
                    let partial_eta_squared = if factor_ss + (ss_total - ss_model) > 0.0 {
                        factor_ss / (factor_ss + (ss_total - ss_model))
                    } else {
                        0.0
                    };
                    let noncent_parameter = f_value * (df as f64);
                    let observed_power = calculate_observed_power(
                        df,
                        n_total - factors.len(),
                        f_value,
                        config.options.sig_level
                    );

                    source.insert(factor.to_string(), TestEffectEntry {
                        sum_of_squares: factor_ss,
                        df,
                        mean_square: ms_factor,
                        f_value,
                        significance,
                        partial_eta_squared,
                        noncent_parameter,
                        observed_power,
                    });
                }
            }
            SumOfSquaresMethod::TypeII => {
                // Type II: Each effect adjusted for all other "appropriate" effects
                for factor in &factors {
                    let other_factors: Vec<&str> = factors
                        .iter()
                        .filter(|&f| f != factor)
                        .copied()
                        .collect();

                    let factor_levels = get_factor_levels(data, factor)?;
                    let df = factor_levels.len() - 1;

                    // Calculate SS for the factor
                    let ss_factor = calculate_type2_ss(
                        data,
                        factor,
                        &other_factors,
                        &dep_var_name,
                        grand_mean
                    )?;
                    ss_model += ss_factor;

                    // Create test effect entry
                    let ms_factor = ss_factor / (df as f64);
                    let f_value = if ss_total - ss_model > 0.0 {
                        ms_factor / ((ss_total - ss_model) / ((n_total - factors.len() - 1) as f64))
                    } else {
                        0.0
                    };
                    let significance = calculate_f_significance(
                        df,
                        n_total - factors.len(),
                        f_value
                    );
                    let partial_eta_squared = if ss_factor + (ss_total - ss_model) > 0.0 {
                        ss_factor / (ss_factor + (ss_total - ss_model))
                    } else {
                        0.0
                    };
                    let noncent_parameter = f_value * (df as f64);
                    let observed_power = calculate_observed_power(
                        df,
                        n_total - factors.len(),
                        f_value,
                        config.options.sig_level
                    );

                    source.insert(factor.to_string(), TestEffectEntry {
                        sum_of_squares: ss_factor,
                        df,
                        mean_square: ms_factor,
                        f_value,
                        significance,
                        partial_eta_squared,
                        noncent_parameter,
                        observed_power,
                    });
                }
            }
            SumOfSquaresMethod::TypeIII | SumOfSquaresMethod::TypeIV => {
                // Type III/IV: Orthogonal to any effects that contain it
                for factor in &factors {
                    let factor_levels = get_factor_levels(data, factor)?;
                    let df = factor_levels.len() - 1;

                    // For Type III, assume balanced design
                    let ss_factor = calculate_factor_ss(data, factor, &dep_var_name, grand_mean)?;
                    ss_model += ss_factor;

                    // Create test effect entry
                    let ms_factor = ss_factor / (df as f64);
                    let error_df = n_total - factors.len();
                    let error_ms = (ss_total - ss_model) / (error_df as f64);
                    let f_value = if error_ms > 0.0 { ms_factor / error_ms } else { 0.0 };
                    let significance = calculate_f_significance(df, error_df, f_value);
                    let partial_eta_squared = if ss_factor + (ss_total - ss_model) > 0.0 {
                        ss_factor / (ss_factor + (ss_total - ss_model))
                    } else {
                        0.0
                    };
                    let noncent_parameter = f_value * (df as f64);
                    let observed_power = calculate_observed_power(
                        df,
                        error_df,
                        f_value,
                        config.options.sig_level
                    );

                    source.insert(factor.to_string(), TestEffectEntry {
                        sum_of_squares: ss_factor,
                        df,
                        mean_square: ms_factor,
                        f_value,
                        significance,
                        partial_eta_squared,
                        noncent_parameter,
                        observed_power,
                    });
                }
            }
        }

        // Add interaction terms if there are multiple factors
        if factors.len() > 1 {
            // TODO: Implement interaction terms calculation based on SS method
        }
    }

    // Add error
    let ss_error = ss_total - ss_model;
    let df_error = n_total - factor_combinations.len();
    let ms_error = if df_error > 0 { ss_error / (df_error as f64) } else { 0.0 };

    source.insert("Error".to_string(), TestEffectEntry {
        sum_of_squares: ss_error,
        df: df_error,
        mean_square: ms_error,
        f_value: 0.0, // Not applicable for error
        significance: 0.0, // Not applicable for error
        partial_eta_squared: 0.0, // Not applicable for error
        noncent_parameter: 0.0, // Not applicable for error
        observed_power: 0.0, // Not applicable for error
    });

    // Add total
    source.insert("Total".to_string(), TestEffectEntry {
        sum_of_squares: all_values
            .iter()
            .map(|x| x.powi(2))
            .sum::<f64>(),
        df: n_total,
        mean_square: 0.0, // Not applicable for total
        f_value: 0.0, // Not applicable for total
        significance: 0.0, // Not applicable for total
        partial_eta_squared: 0.0, // Not applicable for total
        noncent_parameter: 0.0, // Not applicable for total
        observed_power: 0.0, // Not applicable for total
    });

    // Add corrected total
    source.insert("Corrected Total".to_string(), TestEffectEntry {
        sum_of_squares: ss_total,
        df: n_total - 1,
        mean_square: 0.0, // Not applicable for corrected total
        f_value: 0.0, // Not applicable for corrected total
        significance: 0.0, // Not applicable for corrected total
        partial_eta_squared: 0.0, // Not applicable for corrected total
        noncent_parameter: 0.0, // Not applicable for corrected total
        observed_power: 0.0, // Not applicable for corrected total
    });

    // Add corrected model
    let model_df = factor_combinations.len() - 1;
    let model_ms = if model_df > 0 { ss_model / (model_df as f64) } else { 0.0 };
    let model_f = if ms_error > 0.0 { model_ms / ms_error } else { 0.0 };
    let model_sig = calculate_f_significance(model_df, df_error, model_f);
    let model_eta = if ss_total > 0.0 { ss_model / ss_total } else { 0.0 };
    let model_noncent = model_f * (model_df as f64);
    let model_power = calculate_observed_power(
        model_df,
        df_error,
        model_f,
        config.options.sig_level
    );

    source.insert("Corrected Model".to_string(), TestEffectEntry {
        sum_of_squares: ss_model,
        df: model_df,
        mean_square: model_ms,
        f_value: model_f,
        significance: model_sig,
        partial_eta_squared: model_eta,
        noncent_parameter: model_noncent,
        observed_power: model_power,
    });

    let r_squared = if ss_total > 0.0 { ss_model / ss_total } else { 0.0 };
    let adjusted_r_squared =
        1.0 -
        (1.0 - r_squared) *
            (((n_total - 1) as f64) / ((n_total - factor_combinations.len()) as f64));

    Ok(
        Some(TestsBetweenSubjectsEffects {
            source,
            r_squared,
            adjusted_r_squared,
        })
    )
}

use std::collections::HashMap;

use crate::univariate::models::{
    config::UnivariateConfig,
    data::{ AnalysisData, DataRecord, DataValue },
    result::LackOfFitTests,
};

use super::core::{
    calculate_f_significance,
    calculate_observed_power,
    count_total_cases,
    extract_dependent_value,
    matches_combination,
};

/// Calculate lack of fit tests if requested
pub fn calculate_lack_of_fit_tests(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<LackOfFitTests>, String> {
    if !config.options.lack_of_fit {
        return Ok(None);
    }

    let dep_var_name = match &config.main.dep_var {
        Some(name) => name.clone(),
        None => {
            return Err("No dependent variable specified in configuration".to_string());
        }
    };

    // Identify unique combinations of predictor values
    let predictor_combinations = get_unique_predictor_combinations(data, config)?;
    let n_unique = predictor_combinations.len();
    let n_total = count_total_cases(data);

    // Extract all dependent values and fitted values
    let mut all_values = Vec::new();
    let mut fitted_values = Vec::new();

    // In a real implementation, we would calculate fitted values from the model
    // Here we'll use the mean of each predictor combination as the fitted value
    for combo in &predictor_combinations {
        let mut combo_values = Vec::new();

        for records in &data.dependent_data {
            for record in records {
                if matches_predictor_combination(record, combo, data, config) {
                    if let Some(value) = extract_dependent_value(record, &dep_var_name) {
                        combo_values.push(value);
                    }
                }
            }
        }

        if !combo_values.is_empty() {
            let combo_mean = combo_values.iter().sum::<f64>() / (combo_values.len() as f64);
            for val in &combo_values {
                all_values.push(*val);
                fitted_values.push(combo_mean);
            }
        }
    }

    // Calculate pure error sum of squares
    let mut pure_error_ss = 0.0;
    for combo in &predictor_combinations {
        let mut combo_values = Vec::new();

        for records in &data.dependent_data {
            for record in records {
                if matches_predictor_combination(record, combo, data, config) {
                    if let Some(value) = extract_dependent_value(record, &dep_var_name) {
                        combo_values.push(value);
                    }
                }
            }
        }

        if !combo_values.is_empty() {
            let combo_mean = combo_values.iter().sum::<f64>() / (combo_values.len() as f64);
            pure_error_ss += combo_values
                .iter()
                .map(|val| (val - combo_mean).powi(2))
                .sum::<f64>();
        }
    }

    // Calculate residual sum of squares
    let residual_ss = all_values
        .iter()
        .zip(fitted_values.iter())
        .map(|(y, yhat)| (y - yhat).powi(2))
        .sum::<f64>();

    // Calculate lack of fit sum of squares
    let lack_of_fit_ss = residual_ss - pure_error_ss;

    // Calculate degrees of freedom
    let df_lack_of_fit = if config.model.factors_var.len() > 0 {
        n_unique - (config.model.factors_var.len() + 1) // +1 for intercept
    } else {
        n_unique - 1 // Just intercept
    };

    let df_pure_error = n_total - n_unique;

    // Calculate mean squares
    let ms_lack_of_fit = if df_lack_of_fit > 0 {
        lack_of_fit_ss / (df_lack_of_fit as f64)
    } else {
        0.0
    };

    let ms_pure_error = if df_pure_error > 0 {
        pure_error_ss / (df_pure_error as f64)
    } else {
        0.0
    };

    // Calculate F statistic
    let f_value = if ms_pure_error > 0.0 { ms_lack_of_fit / ms_pure_error } else { 0.0 };

    // Calculate significance
    let significance = calculate_f_significance(df_lack_of_fit, df_pure_error, f_value);

    // Calculate effect size
    let partial_eta_squared = if lack_of_fit_ss + pure_error_ss > 0.0 {
        lack_of_fit_ss / (lack_of_fit_ss + pure_error_ss)
    } else {
        0.0
    };

    // Calculate noncentrality parameter
    let noncent_parameter = (df_lack_of_fit as f64) * f_value;

    // Calculate observed power
    let observed_power = calculate_observed_power(
        df_lack_of_fit,
        df_pure_error,
        f_value,
        config.options.sig_level
    );

    Ok(
        Some(LackOfFitTests {
            sum_of_squares: lack_of_fit_ss,
            df: df_lack_of_fit,
            mean_square: ms_lack_of_fit,
            f_value,
            significance,
            partial_eta_squared,
            noncent_parameter,
            observed_power,
        })
    )
}

/// Get unique predictor combinations for lack of fit tests
pub fn get_unique_predictor_combinations(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Vec<HashMap<String, String>>, String> {
    let mut combinations = Vec::new();
    let mut unique_combos = std::collections::HashSet::new();

    if let Some(factor_str) = &config.main.fix_factor {
        let factors: Vec<&str> = factor_str
            .split(',')
            .map(|s| s.trim())
            .collect();

        for records in &data.fix_factor_data {
            for record in records.iter().flatten() {
                let mut combo = HashMap::new();

                for factor in &factors {
                    if let Some(value) = record.values.get(*factor) {
                        let level = match value {
                            DataValue::Number(n) => n.to_string(),
                            DataValue::Text(t) => t.clone(),
                            DataValue::Boolean(b) => b.to_string(),
                            DataValue::Null => "null".to_string(),
                        };

                        combo.insert(factor.to_string(), level);
                    }
                }

                // Generate a unique key for this combination
                let mut key = String::new();
                for factor in &factors {
                    if let Some(level) = combo.get(*factor) {
                        key.push_str(&format!("{}:{},", factor, level));
                    }
                }

                if !unique_combos.contains(&key) {
                    unique_combos.insert(key);
                    combinations.push(combo);
                }
            }
        }
    }

    Ok(combinations)
}

/// Check if a record matches a predictor combination for lack of fit tests
pub fn matches_predictor_combination(
    record: &DataRecord,
    combo: &HashMap<String, String>,
    data: &AnalysisData,
    config: &UnivariateConfig
) -> bool {
    // Similar to matches_combination, but focus on predictors
    matches_combination(record, combo, data, config)
}

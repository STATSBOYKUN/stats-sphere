use std::collections::HashMap;

use statrs::distribution::{ ContinuousCDF, FisherSnedecor, StudentsT };

use crate::univariate::models::data::{ AnalysisData, DataValue };

use super::core::{ extract_dependent_value, get_factor_levels, get_level_values };

/// Count total cases in the data
pub fn count_total_cases(data: &AnalysisData) -> usize {
    if data.dependent_data.is_empty() {
        return 0;
    }

    data.dependent_data
        .iter()
        .map(|records| records.len())
        .sum()
}

/// Calculate F significance (p-value) for F statistic
pub fn calculate_f_significance(df1: usize, df2: usize, f_value: f64) -> f64 {
    if df1 == 0 || df2 == 0 || f_value.is_nan() {
        return 0.0;
    }

    match FisherSnedecor::new(df1 as f64, df2 as f64) {
        Ok(dist) => 1.0 - dist.cdf(f_value),
        Err(_) => 0.0,
    }
}

/// Calculate t significance (p-value) for t statistic
pub fn calculate_t_significance(df: usize, t_value: f64) -> f64 {
    if df == 0 || t_value.is_nan() {
        return 0.0;
    }

    match StudentsT::new(0.0, 1.0, df as f64) {
        Ok(dist) => 2.0 * (1.0 - dist.cdf(t_value.abs())),
        Err(_) => 0.0,
    }
}

/// Calculate critical t value for confidence intervals
pub fn calculate_t_critical(df: usize, alpha: f64) -> f64 {
    if df == 0 {
        return 1.96; // Default to normal approximation
    }

    match StudentsT::new(0.0, 1.0, df as f64) {
        Ok(dist) => {
            let p = 1.0 - alpha;
            // Approximate inverse CDF
            let mut low = -10.0;
            let mut high = 10.0;
            let mut mid = 0.0;
            let tol = 1e-6;

            for _ in 0..50 {
                mid = (low + high) / 2.0;
                let prob = dist.cdf(mid);

                if (prob - p).abs() < tol {
                    break;
                }

                if prob < p {
                    low = mid;
                } else {
                    high = mid;
                }
            }

            mid
        }
        Err(_) => 1.96, // Default to normal approximation
    }
}

/// Calculate observed power for F-test
pub fn calculate_observed_power(df1: usize, df2: usize, f_value: f64, alpha: f64) -> f64 {
    if df1 == 0 || df2 == 0 || f_value <= 0.0 || alpha <= 0.0 || alpha >= 1.0 {
        return 0.0;
    }

    // For a simplified implementation, we'll use a heuristic approximation
    // In practice, this should use a non-central F distribution
    let ncp = f_value * (df1 as f64);

    // Basic approximation
    1.0 - (-ncp * 0.5).exp()
}

/// Calculate observed power for t-test
pub fn calculate_observed_power_t(df: usize, t_value: f64, alpha: f64) -> f64 {
    if df == 0 || t_value.abs() <= 0.0 || alpha <= 0.0 || alpha >= 1.0 {
        return 0.0;
    }

    // For a simplified implementation, we'll use a heuristic approximation
    // In practice, this should use a non-central t distribution
    let ncp = t_value.abs();

    // Basic approximation
    1.0 - (-ncp * 0.5).exp()
}

/// Calculate sum of squares for a factor (Type III approach)
pub fn calculate_factor_ss(
    data: &AnalysisData,
    factor: &str,
    dep_var_name: &str,
    grand_mean: f64
) -> Result<f64, String> {
    let mut ss = 0.0;
    let levels = get_factor_levels(data, factor)?;

    for level in &levels {
        let level_values = get_level_values(data, factor, level, dep_var_name)?;
        if !level_values.is_empty() {
            let level_mean = level_values.iter().sum::<f64>() / (level_values.len() as f64);
            ss += (level_values.len() as f64) * (level_mean - grand_mean).powi(2);
        }
    }

    Ok(ss)
}

/// Calculate Type II SS for a factor (adjusted for all other effects but not higher-order ones)
pub fn calculate_type2_ss(
    data: &AnalysisData,
    factor: &str,
    other_factors: &[&str],
    dep_var_name: &str,
    grand_mean: f64
) -> Result<f64, String> {
    // Get all levels for the factor
    let factor_levels = get_factor_levels(data, factor)?;

    // For each level of the factor, calculate means adjusted for other factors
    let mut adjusted_level_means = Vec::new();
    let mut adjusted_level_counts = Vec::new();

    for level in &factor_levels {
        // Get values for this level
        let mut level_values = Vec::new();
        let mut level_groups = HashMap::new();

        // Group the values by the combination of other factors
        for records in &data.dependent_data {
            for record in records {
                // Check if the record matches the current level
                let mut matches_level = false;
                for (key, value) in &record.values {
                    if key == factor {
                        let record_level = match value {
                            DataValue::Number(n) => n.to_string(),
                            DataValue::Text(t) => t.clone(),
                            DataValue::Boolean(b) => b.to_string(),
                            DataValue::Null => "null".to_string(),
                        };

                        if record_level == *level {
                            matches_level = true;
                        }
                        break;
                    }
                }

                if matches_level {
                    if let Some(value) = extract_dependent_value(record, dep_var_name) {
                        // Build a key for the combination of other factors
                        let mut other_factor_key = String::new();
                        for other_factor in other_factors {
                            for (key, value) in &record.values {
                                if key == *other_factor {
                                    let other_level = match value {
                                        DataValue::Number(n) => n.to_string(),
                                        DataValue::Text(t) => t.clone(),
                                        DataValue::Boolean(b) => b.to_string(),
                                        DataValue::Null => "null".to_string(),
                                    };
                                    other_factor_key.push_str(
                                        &format!("{}:{},", other_factor, other_level)
                                    );
                                    break;
                                }
                            }
                        }

                        level_groups.entry(other_factor_key).or_insert_with(Vec::new).push(value);
                    }
                }
            }
        }

        // Calculate adjusted mean for this level
        let mut level_sum = 0.0;
        let mut level_count = 0;

        for values in level_groups.values() {
            if !values.is_empty() {
                let group_mean = values.iter().sum::<f64>() / (values.len() as f64);
                level_sum += group_mean;
                level_count += 1;
            }
        }

        if level_count > 0 {
            let adjusted_mean = level_sum / (level_count as f64);
            adjusted_level_means.push(adjusted_mean);
            adjusted_level_counts.push(level_count);
        }
    }

    // Calculate the Type II SS
    let mut ss = 0.0;

    // Calculate the weighted grand mean of the adjusted means
    let total_count: usize = adjusted_level_counts.iter().sum();
    let weighted_mean =
        adjusted_level_means
            .iter()
            .zip(adjusted_level_counts.iter())
            .map(|(mean, &count)| mean * (count as f64))
            .sum::<f64>() / (total_count as f64);

    // Calculate the sum of squares
    for (mean, &count) in adjusted_level_means.iter().zip(adjusted_level_counts.iter()) {
        ss += (count as f64) * (mean - weighted_mean).powi(2);
    }

    Ok(ss)
}

/// Chi-square CDF approximation for p-value calculations
pub fn chi_square_cdf(x: f64, df: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    // Using the fact that Chi-square distribution with df degrees of freedom
    // is a gamma distribution with shape parameter df/2 and scale parameter 2
    let shape = df / 2.0;
    let scale = 2.0;

    // Approximation using the relation to the normal distribution
    // when df is large enough
    if df > 30.0 {
        let z = (x / df).sqrt();
        let t = z - (1.0 - 2.0 / (9.0 * df)) / (3.0 * df.sqrt());

        // Approximate normal CDF
        0.5 * (1.0 + (0.5 * t.sqrt() * t).tanh())
    } else {
        // Simple approximation for lower df values
        // In a production environment, use a proper gamma function
        let mut p = 0.0;
        let mut term = (-x / 2.0).exp() * x.powf(shape - 1.0);
        p += term;

        for i in 1..100 {
            term *= x / (shape + (i as f64) - 1.0);
            p += term;
            if term < 1e-10 * p {
                break;
            }
        }

        p *= 1.0 / ((2.0_f64).powf(shape) * shape.exp_gamma());
        1.0 - p
    }
}

/// F distribution CDF approximation for p-value calculations
pub fn f_distribution_cdf(x: f64, df1: f64, df2: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    // This would use a statistical library function in a real implementation
    // Using the Fisher-Snedecor distribution from statrs if available
    match FisherSnedecor::new(df1, df2) {
        Ok(dist) => dist.cdf(x),
        Err(_) => {
            // Fallback approximation if the proper distribution can't be created
            let v1 = df1;
            let v2 = df2;
            let z = (v1 * x) / (v1 * x + v2);

            // Beta incomplete approximation (simplified)
            z.min(1.0).max(0.0)
        }
    }
}

use statrs::distribution::{ ContinuousCDF, FisherSnedecor };

use crate::univariate::models::{ config::UnivariateConfig, data::AnalysisData, result::LeveneTest };

use super::core::{ extract_dependent_value, get_factor_combinations, matches_combination };

/// Calculate Levene's Test for homogeneity of variances if requested
pub fn calculate_levene_test(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<LeveneTest>, String> {
    if !config.options.homogen_test {
        return Ok(None);
    }

    let dep_var_name = match &config.main.dep_var {
        Some(name) => name.clone(),
        None => {
            return Err("No dependent variable specified in configuration".to_string());
        }
    };

    // Extract values by group
    let mut groups: Vec<Vec<f64>> = Vec::new();
    let factor_combinations = get_factor_combinations(data, config)?;

    for combo in &factor_combinations {
        let mut group_values = Vec::new();

        for records in &data.dependent_data {
            for record in records {
                if matches_combination(record, combo, data, config) {
                    if let Some(value) = extract_dependent_value(record, &dep_var_name) {
                        group_values.push(value);
                    }
                }
            }
        }

        if !group_values.is_empty() {
            groups.push(group_values);
        }
    }

    // Calculate group means
    let group_means: Vec<f64> = groups
        .iter()
        .map(|group| group.iter().sum::<f64>() / (group.len() as f64))
        .collect();

    // Calculate absolute deviations from group means
    let mut abs_deviations: Vec<Vec<f64>> = Vec::new();
    for (i, group) in groups.iter().enumerate() {
        let mean = group_means[i];
        let deviations: Vec<f64> = group
            .iter()
            .map(|val| (val - mean).abs())
            .collect();
        abs_deviations.push(deviations);
    }

    // Calculate the overall mean of absolute deviations
    let all_deviations: Vec<f64> = abs_deviations.iter().flatten().cloned().collect();
    let overall_mean = all_deviations.iter().sum::<f64>() / (all_deviations.len() as f64);

    // Calculate sum of squares between groups
    let ss_between = abs_deviations
        .iter()
        .enumerate()
        .map(|(i, group)| {
            let group_mean = group.iter().sum::<f64>() / (group.len() as f64);
            (group.len() as f64) * (group_mean - overall_mean).powi(2)
        })
        .sum::<f64>();

    // Calculate sum of squares within groups
    let ss_within = abs_deviations
        .iter()
        .enumerate()
        .map(|(i, group)| {
            let group_mean = group.iter().sum::<f64>() / (group.len() as f64);
            group
                .iter()
                .map(|val| (val - group_mean).powi(2))
                .sum::<f64>()
        })
        .sum::<f64>();

    // Calculate degrees of freedom
    let df1 = groups.len() - 1;
    let df2 = all_deviations.len() - groups.len();

    // Calculate F statistic
    let ms_between = ss_between / (df1 as f64);
    let ms_within = ss_within / (df2 as f64);
    let f_statistic = ms_between / ms_within;

    // Calculate significance
    let f_dist = FisherSnedecor::new(df1 as f64, df2 as f64).unwrap();
    let significance = 1.0 - f_dist.cdf(f_statistic);

    Ok(
        Some(LeveneTest {
            dependent_variable: dep_var_name,
            f_statistic,
            df1,
            df2,
            significance,
        })
    )
}

use std::collections::HashMap;

use crate::roc_analysis::models::{
    config::{ DistributionMethod, RocConfig },
    data::AnalysisData,
    result::{ AreaUnderRocCurve, Interval },
};

use super::core::{
    calculate_binegexp_std_error,
    calculate_nonparametric_std_error,
    extract_grouped_values,
    extract_values,
    normal_cdf,
    normal_quantile,
};

pub fn calculate_area_under_roc_curve(
    data: &AnalysisData,
    config: &RocConfig
) -> Result<HashMap<String, AreaUnderRocCurve>, String> {
    if config.main.test_target_variable.is_none() {
        return Err("Test target variables are not specified".to_string());
    }
    let test_target_vars = config.main.test_target_variable.as_ref().unwrap();

    if test_target_vars.is_empty() {
        return Err("No test target variables specified".to_string());
    }

    let mut auc_map: HashMap<String, AreaUnderRocCurve> = HashMap::new();

    for test_var in test_target_vars {
        let auc_result = calculate_area_under_roc_curve_for_variable(data, config, test_var)?;
        auc_map.insert(test_var.clone(), auc_result);
    }

    Ok(auc_map)
}

pub fn calculate_area_under_roc_curve_for_variable(
    data: &AnalysisData,
    config: &RocConfig,
    test_var: &str
) -> Result<AreaUnderRocCurve, String> {
    if config.main.paired_sample {
        let (positive_values, negative_values) = extract_values(data, config, test_var)?;
        return calculate_auc_from_values(&positive_values, &negative_values, config);
    }

    if config.main.target_group_var.is_some() {
        let (group1_pos, group1_neg, _, _) = extract_grouped_values(data, config, test_var)?;
        return calculate_auc_from_values(&group1_pos, &group1_neg, config);
    }

    let (positive_values, negative_values) = extract_values(data, config, test_var)?;
    calculate_auc_from_values(&positive_values, &negative_values, config)
}

pub fn calculate_auc_from_values(
    positive_values: &[f64],
    negative_values: &[f64],
    config: &RocConfig
) -> Result<AreaUnderRocCurve, String> {
    let m = positive_values.len();
    let n = negative_values.len();

    let mut rank_sum = 0.0;

    for &pos_val in positive_values {
        for &neg_val in negative_values {
            if config.options.larger_test {
                if pos_val > neg_val {
                    rank_sum += 1.0;
                } else if pos_val == neg_val {
                    rank_sum += 0.5;
                }
            } else {
                if pos_val < neg_val {
                    rank_sum += 1.0;
                } else if pos_val == neg_val {
                    rank_sum += 0.5;
                }
            }
        }
    }

    let auc = rank_sum / ((m as f64) * (n as f64));

    let is_nonparametric = match config.options.dist_assumpt_method {
        DistributionMethod::Nonparametric => true,
        _ => false,
    };

    let std_error = if is_nonparametric {
        calculate_nonparametric_std_error(
            positive_values,
            negative_values,
            auc,
            config.options.larger_test
        )
    } else {
        calculate_binegexp_std_error(positive_values, negative_values, auc)
    };

    let z_statistic = (auc - 0.5) / std_error;
    let asymptotic_sig = 2.0 * (1.0 - normal_cdf(z_statistic.abs()));

    let conf_level = (config.options.conf_level as f64) / 100.0;
    let alpha = 1.0 - conf_level;
    let z_alpha = normal_quantile(1.0 - alpha / 2.0);

    let margin = z_alpha * std_error;
    let lower_bound = (auc - margin).max(0.0);
    let upper_bound = (auc + margin).min(1.0);

    Ok(AreaUnderRocCurve {
        area: auc,
        std_error,
        asymptotic_sig,
        asymptotic_95_confidence_interval: Interval {
            lower_bound,
            upper_bound,
        },
    })
}

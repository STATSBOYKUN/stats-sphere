// group_statistics.rs
use std::collections::HashMap;

use crate::discriminant::models::{
    result::GroupStatistics,
    AnalysisData,
    DiscriminantConfig,
    data::DataValue,
};
use crate::discriminant::stats::common::extract_group_values;

pub fn calculate_group_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<GroupStatistics, String> {
    web_sys::console::log_1(&"Executing calculate_group_statistics".into());

    // Extract the grouping variable from the config
    let group_var = &config.main.grouping_variable;
    let independent_vars = &config.main.independent_variables;

    // Extract unique groups
    let mut unique_groups = Vec::new();
    let min_range = config.define_range.min_range.unwrap_or(f64::NEG_INFINITY);
    let max_range = config.define_range.max_range.unwrap_or(f64::INFINITY);

    for group in &data.group_data {
        for record in group {
            if let Some(DataValue::Number(val)) = record.values.get(group_var) {
                if *val >= min_range && *val <= max_range {
                    let group_str = val.to_string();
                    if !unique_groups.contains(&group_str) {
                        unique_groups.push(group_str);
                    }
                }
            }
        }
    }

    // Sort groups numerically
    unique_groups.sort_by(|a, b| {
        let a_val = a.parse::<f64>().unwrap_or(0.0);
        let b_val = b.parse::<f64>().unwrap_or(0.0);
        a_val.partial_cmp(&b_val).unwrap()
    });

    // Initialize statistics maps
    let mut means: HashMap<String, Vec<f64>> = HashMap::new();
    let mut std_deviations: HashMap<String, Vec<f64>> = HashMap::new();

    // Initialize data structures for each group
    for group in &unique_groups {
        means.insert(group.clone(), vec![0.0; independent_vars.len()]);
        std_deviations.insert(group.clone(), vec![0.0; independent_vars.len()]);
    }

    // Data structures to hold sum and sum of squares for each variable in each group
    let mut sums: HashMap<String, Vec<f64>> = HashMap::new();
    let mut sum_squares: HashMap<String, Vec<f64>> = HashMap::new();
    let mut counts: HashMap<String, Vec<usize>> = HashMap::new();

    for group in &unique_groups {
        sums.insert(group.clone(), vec![0.0; independent_vars.len()]);
        sum_squares.insert(group.clone(), vec![0.0; independent_vars.len()]);
        counts.insert(group.clone(), vec![0; independent_vars.len()]);
    }

    // Process records to calculate sums and counts
    for group_data in &data.group_data {
        for record in group_data {
            if let Some(DataValue::Number(group_val)) = record.values.get(group_var) {
                if *group_val >= min_range && *group_val <= max_range {
                    let group_str = group_val.to_string();

                    for (i, var) in independent_vars.iter().enumerate() {
                        if let Some(DataValue::Number(val)) = record.values.get(var) {
                            if !val.is_nan() {
                                let sums_for_group = sums.get_mut(&group_str).unwrap();
                                sums_for_group[i] += val;

                                let squares_for_group = sum_squares.get_mut(&group_str).unwrap();
                                squares_for_group[i] += val * val;

                                let counts_for_group = counts.get_mut(&group_str).unwrap();
                                counts_for_group[i] += 1;
                            }
                        }
                    }
                }
            }
        }
    }

    // Calculate means and standard deviations
    for group in &unique_groups {
        let group_sums = sums.get(group).unwrap();
        let group_sum_squares = sum_squares.get(group).unwrap();
        let group_counts = counts.get(group).unwrap();

        let group_means = means.get_mut(group).unwrap();
        let group_stds = std_deviations.get_mut(group).unwrap();

        for i in 0..independent_vars.len() {
            if group_counts[i] > 0 {
                group_means[i] = group_sums[i] / (group_counts[i] as f64);

                if group_counts[i] > 1 {
                    // Calculate standard deviation: sqrt((sum_squares - sum²/n) / (n-1))
                    let variance =
                        (group_sum_squares[i] -
                            (group_sums[i] * group_sums[i]) / (group_counts[i] as f64)) /
                        ((group_counts[i] - 1) as f64);
                    group_stds[i] = if variance > 0.0 { variance.sqrt() } else { 0.0 };
                }
            }
        }
    }

    Ok(GroupStatistics {
        groups: unique_groups,
        variables: independent_vars.clone(),
        means,
        std_deviations,
    })
}

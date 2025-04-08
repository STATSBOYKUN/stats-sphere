use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };
use crate::discriminant::models::result::{
    CanonicalFunctions,
    DiscriminantHistograms,
    GroupHistogram,
};
use crate::discriminant::stats::canonical_functions::{
    calculate_canonical_functions,
    calculate_eigen_statistics,
};
use super::core::{ extract_case_values, calculate_mean, calculate_variance };

pub fn generate_discriminant_histograms(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<DiscriminantHistograms, String> {
    web_sys::console::log_1(&"Executing generate_discriminant_histograms".into());

    // Get eigenvalues
    let eigen_stats = calculate_eigen_statistics(data, config)?;
    let num_functions = eigen_stats.eigenvalue.len();

    // Calculate canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;
    let variables = &config.main.independent_variables;

    // Get number of groups
    let num_groups = data.group_data.len();

    let functions: Vec<String> = (1..=num_functions).map(|i| i.to_string()).collect();
    let groups: Vec<String> = (1..=num_groups).map(|i| i.to_string()).collect();

    // Initialize histograms
    let mut histograms = HashMap::new();

    // For each group and discriminant function
    for group_idx in 0..num_groups {
        let group_name = &groups[group_idx];
        let group_data = &data.group_data[group_idx];

        if group_data.is_empty() {
            continue;
        }

        for func_idx in 0..num_functions {
            let func_name = &functions[func_idx];
            let histogram_key = format!("{}_{}", group_name, func_name);

            // Calculate discriminant scores
            let scores = calculate_discriminant_scores(
                group_data,
                func_idx,
                &canonical_functions,
                variables
            );

            if scores.is_empty() {
                continue;
            }

            // Create histogram
            let histogram = create_histogram(&scores);
            histograms.insert(histogram_key, histogram);
        }
    }

    Ok(DiscriminantHistograms {
        functions,
        groups,
        histograms,
    })
}

fn calculate_discriminant_scores(
    group_data: &[crate::discriminant::models::DataRecord],
    func_idx: usize,
    canonical_functions: &CanonicalFunctions,
    variables: &[String]
) -> Vec<f64> {
    group_data
        .iter()
        .filter_map(|case| {
            let case_values = extract_case_values(case, variables);

            if case_values.len() != variables.len() {
                return None;
            }

            let score = variables
                .iter()
                .enumerate()
                .fold(0.0, |acc, (var_idx, var_name)| {
                    if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                        if func_idx < coefs.len() && var_idx < case_values.len() {
                            acc + case_values[var_idx] * coefs[func_idx]
                        } else {
                            acc
                        }
                    } else {
                        acc
                    }
                });

            Some(score)
        })
        .collect()
}

fn create_histogram(scores: &[f64]) -> GroupHistogram {
    if scores.is_empty() {
        return GroupHistogram {
            bin_count: 0,
            bin_width: 0.0,
            min_value: 0.0,
            max_value: 0.0,
            mean: 0.0,
            std_dev: 0.0,
            sample_size: 0,
            bin_frequencies: vec![],
            bin_edges: vec![],
        };
    }

    // Calculate statistics
    let sample_size = scores.len();
    let mean = calculate_mean(scores);
    let variance = calculate_variance(scores, Some(mean));
    let std_dev = variance.sqrt();

    // Find min and max
    let min_value = scores.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max_value = scores.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

    // Calculate bin width using Scott's rule
    let bin_width = if std_dev > 0.0 && sample_size > 0 {
        (3.5 * std_dev) / (sample_size as f64).powf(1.0 / 3.0)
    } else {
        1.0
    };

    // Calculate number of bins
    let bin_count = if max_value > min_value && bin_width > 0.0 {
        ((max_value - min_value) / bin_width).ceil() as usize
    } else {
        10
    };

    // Use a reasonable number of bins
    let bin_count = bin_count.max(5).min(20);

    // Recalculate bin width
    let bin_width = if max_value > min_value {
        (max_value - min_value) / (bin_count as f64)
    } else {
        1.0
    };

    // Create bin edges
    let bin_edges = (0..=bin_count).map(|i| min_value + (i as f64) * bin_width).collect();

    // Count frequencies
    let mut bin_frequencies = vec![0; bin_count];

    for &score in scores {
        let bin_idx = if score == max_value {
            bin_count - 1 // Put maximum value in the last bin
        } else {
            ((score - min_value) / bin_width).floor() as usize
        };

        if bin_idx < bin_count {
            bin_frequencies[bin_idx] += 1;
        }
    }

    GroupHistogram {
        bin_count: bin_count as i32,
        bin_width,
        min_value,
        max_value,
        mean,
        std_dev,
        sample_size: sample_size as i32,
        bin_frequencies,
        bin_edges,
    }
}

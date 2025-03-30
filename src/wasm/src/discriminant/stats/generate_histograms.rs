use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };
use crate::discriminant::models::result::{ DiscriminantHistograms, GroupHistogram };
use crate::discriminant::canonical_functions::calculate_canonical_functions;

pub fn generate_discriminant_histograms(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<DiscriminantHistograms, String> {
    web_sys::console::log_1(&"Executing generate_discriminant_histograms".into());

    // Calculate canonical functions to get discriminant scores
    let canonical_functions_result = calculate_canonical_functions(data, config)?;

    // Number of functions
    let num_functions = canonical_functions_result.eigenvalues.len();
    let functions: Vec<String> = (1..=num_functions).map(|i| i.to_string()).collect();

    // Number of groups
    let num_groups = data.group_data.len();
    let groups: Vec<String> = (1..=num_groups).map(|i| i.to_string()).collect();

    // Initialize histograms
    let mut histograms = HashMap::new();

    // For each group and discriminant function
    for group_idx in 0..num_groups {
        let group_name = &groups[group_idx];

        for func_idx in 0..num_functions {
            let func_name = &functions[func_idx];
            let histogram_key = format!("{}_{}", group_name, func_name);

            // Calculate discriminant scores for all cases in this group
            let scores = calculate_discriminant_scores(
                &data.group_data[group_idx],
                func_idx,
                &canonical_functions_result,
                config
            );

            if scores.is_empty() {
                continue;
            }

            // Calculate histogram data
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

// Calculate discriminant scores for cases in a group
fn calculate_discriminant_scores(
    group_data: &[Vec<f64>],
    func_idx: usize,
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions,
    config: &DiscriminantConfig
) -> Vec<f64> {
    let variables = &config.main.independent_variables;
    let mut scores = Vec::with_capacity(group_data.len());

    for case in group_data {
        let mut score = 0.0;

        // Apply coefficients to calculate discriminant score
        for (var_idx, var_name) in variables.iter().enumerate() {
            if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                if func_idx < coefs.len() {
                    score += case[var_idx] * coefs[func_idx];
                }
            }
        }

        scores.push(score);
    }

    scores
}

// Create histogram from scores
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

    // Calculate basic statistics
    let sample_size = scores.len();
    let mean = scores.iter().sum::<f64>() / (sample_size as f64);

    let variance = if sample_size > 1 {
        scores
            .iter()
            .map(|&x| (x - mean).powi(2))
            .sum::<f64>() / ((sample_size - 1) as f64)
    } else {
        0.0
    };

    let std_dev = variance.sqrt();

    // Find min and max
    let min_value = scores.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max_value = scores.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

    // Create bins - use Sturges' rule to determine number of bins
    let bin_count = ((sample_size as f64).log2().ceil() as usize) + 1;
    let bin_count = bin_count.max(5).min(12); // Ensure reasonable range

    let bin_width = if max_value > min_value {
        (max_value - min_value) / (bin_count as f64)
    } else {
        1.0 // Default if all values are the same
    };

    // Create bin edges
    let mut bin_edges = Vec::with_capacity(bin_count + 1);
    for i in 0..=bin_count {
        bin_edges.push(min_value + (i as f64) * bin_width);
    }

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

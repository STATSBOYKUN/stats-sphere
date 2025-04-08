use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig, result::PriorProbabilities };
use super::core::extract_analyzed_dataset;

pub fn calculate_prior_probabilities(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<PriorProbabilities, String> {
    web_sys::console::log_1(&"Executing calculate_prior_probabilities".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Extract groups and convert to usize where possible
    let groups: Vec<usize> = dataset.group_labels
        .iter()
        .filter_map(|label| label.parse::<usize>().ok())
        .collect();

    if groups.is_empty() {
        return Err("No valid group labels found for prior probabilities".to_string());
    }

    // Calculate prior probabilities
    let mut prior_probabilities = Vec::with_capacity(groups.len());
    let mut unweighted_counts = Vec::with_capacity(groups.len());
    let mut weighted_counts = Vec::with_capacity(groups.len());

    // Determine whether to use equal probabilities or compute from group sizes
    if config.classify.all_group_equal {
        // Equal probabilities for all groups
        let equal_prob = 1.0 / (groups.len() as f64);

        for group_idx in 0..groups.len() {
            let group_label = &dataset.group_labels[group_idx];
            let group_size = dataset.group_data
                .values()
                .next()
                .and_then(|g| g.get(group_label))
                .map_or(0, |v| v.len());

            prior_probabilities.push(equal_prob);
            unweighted_counts.push(group_size);
            weighted_counts.push((group_size * 1000) / group_size); // Multiply by 1000 for display purposes
        }
    } else {
        // Calculate based on group sizes
        let total_cases = dataset.total_cases;

        for group_idx in 0..groups.len() {
            let group_label = &dataset.group_labels[group_idx];
            let group_size = dataset.group_data
                .values()
                .next()
                .and_then(|g| g.get(group_label))
                .map_or(0, |v| v.len());

            let prob = if total_cases > 0 {
                (group_size as f64) / (total_cases as f64)
            } else {
                1.0 / (groups.len() as f64)
            };

            prior_probabilities.push(prob);
            unweighted_counts.push(group_size);
            weighted_counts.push((group_size * 1000) / group_size); // Multiply by 1000 for display purposes
        }
    }

    // Calculate total probability
    let total = prior_probabilities.iter().sum();

    // Store case counts in hashmap
    let mut cases_used = HashMap::new();
    cases_used.insert("Unweighted".to_string(), unweighted_counts);
    cases_used.insert("Weighted".to_string(), weighted_counts);

    Ok(PriorProbabilities {
        groups,
        prior_probabilities,
        cases_used,
        total,
    })
}

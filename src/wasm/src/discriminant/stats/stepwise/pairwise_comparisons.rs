// pairwise_comparisons.rs
use std::collections::HashMap;

use crate::discriminant::models::result::PairwiseComparison;

use super::{
    matrix_calculations::calculate_mahalanobis_distance,
    statistical_tests::calculate_p_value_from_f,
};

// Generate pairwise comparisons between groups
pub fn generate_pairwise_comparisons(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    variables: &[String],
    step: i32,
    num_groups: usize,
    total_cases: usize
) -> HashMap<String, Vec<PairwiseComparison>> {
    let mut comparison_map = HashMap::new();

    // Skip if no variables in model
    if variables.is_empty() {
        return comparison_map;
    }

    // Generate comparisons for each pair of groups
    for i in 0..group_labels.len() {
        let group_i = &group_labels[i];
        let mut group_comparisons = Vec::new();

        for j in 0..group_labels.len() {
            if i == j {
                // Skip same group comparison (diagonal)
                continue;
            }

            let group_j = &group_labels[j];

            // Calculate Mahalanobis distance between these groups
            let d2 = calculate_mahalanobis_distance(
                group_data,
                group_means,
                group_i,
                group_j,
                variables
            );

            // Convert to F value
            let n_i = group_data
                .get(&variables[0])
                .and_then(|g| g.get(group_i.as_str()))
                .map_or(0, |v| v.len());

            let n_j = group_data
                .get(&variables[0])
                .and_then(|g| g.get(group_j.as_str()))
                .map_or(0, |v| v.len());

            if n_i > 0 && n_j > 0 {
                let p = variables.len() as f64;
                let n = total_cases as f64;
                let g = num_groups as f64;

                let f_value =
                    (d2 * (n - g - p + 1.0) * ((n_i * n_j) as f64)) /
                    (p * (n - g) * ((n_i + n_j) as f64));

                // Calculate significance
                let p_value = calculate_p_value_from_f(f_value, p, n - g - p + 1.0);

                group_comparisons.push(PairwiseComparison {
                    step,
                    group_name: group_j.clone(), // Target group name
                    f_value,
                    significance: p_value,
                });
            }
        }

        // Add this group's comparisons to the map
        if !group_comparisons.is_empty() {
            comparison_map.insert(group_i.clone(), group_comparisons);
        }
    }

    comparison_map
}

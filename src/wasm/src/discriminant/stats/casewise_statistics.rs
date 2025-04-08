use std::collections::HashMap;

use crate::discriminant::models::{
    result::{ CanonicalFunctions, CasewiseStatistics, HighestGroupStatistics },
    AnalysisData,
    DiscriminantConfig,
};
use super::core::{
    calculate_canonical_functions,
    calculate_eigen_statistics,
    calculate_p_value_from_chi_square,
    extract_analyzed_dataset,
    extract_case_values,
    extract_record_groups,
    get_stepwise_selected_variables,
    AnalyzedDataset,
};

pub fn calculate_casewise_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CasewiseStatistics, String> {
    web_sys::console::log_1(&"Executing calculate_casewise_statistics".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Determine which variables to use based on stepwise analysis
    let independent_variables = if config.main.stepwise {
        get_stepwise_selected_variables(data, config)?
    } else {
        config.main.independent_variables.clone()
    };

    // Get eigenvalues
    let eigen_stats = calculate_eigen_statistics(data, config)?;
    let num_functions = eigen_stats.eigenvalue.len();

    // Calculate discriminant functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    if num_functions == 0 {
        return Err("No valid discriminant functions available".to_string());
    }

    // Get number of cases to process (apply limit if configured)
    let limit_cases = if config.classify.limit {
        config.classify.limit_value.unwrap_or(100) as usize
    } else {
        usize::MAX
    };

    // Prepare vectors for results
    let mut case_number = Vec::new();
    let mut actual_group = Vec::new();
    let mut predicted_group = Vec::new();

    // Prepare highest group statistics
    let mut highest_p_value = Vec::new();
    let mut highest_df = Vec::new();
    let mut highest_p_g_equals_d = Vec::new();
    let mut highest_squared_mahalanobis_distance = Vec::new();
    let mut highest_group = Vec::new();

    // Prepare second highest group statistics
    let mut second_p_value = Vec::new();
    let mut second_df = Vec::new();
    let mut second_p_g_equals_d = Vec::new();
    let mut second_squared_mahalanobis_distance = Vec::new();
    let mut second_group = Vec::new();

    // Prepare discriminant scores
    let mut discriminant_scores: HashMap<String, Vec<f64>> = HashMap::new();
    for i in 0..num_functions {
        discriminant_scores.insert(format!("Function {}", i + 1), Vec::new());
    }

    // Extract record groups mapping
    let record_groups = extract_record_groups(data, &config.main.grouping_variable);

    // Convert group labels to numeric values
    let numeric_groups: HashMap<String, usize> = dataset.group_labels
        .iter()
        .enumerate()
        .map(|(i, g)| (g.clone(), i + 1))
        .collect();

    // Process cases (with group data)
    let mut case_idx = 0;
    let mut processed_cases = 0;

    // Process each group
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        if processed_cases >= limit_cases {
            break;
        }

        if let Some(group_name) = record_groups.get(&group_idx) {
            if !dataset.group_labels.contains(group_name) {
                continue;
            }

            // Process each case in this group
            for (_case_in_group_idx, case) in group_data.iter().enumerate() {
                if processed_cases >= limit_cases {
                    break;
                }

                // Extract case values for independent variables
                let case_values = extract_case_values(case, &independent_variables);

                // Skip if missing values
                if case_values.len() != independent_variables.len() {
                    continue;
                }

                // Calculate discriminant function scores for this case
                let scores = calculate_discriminant_scores(
                    &case_values,
                    &canonical_functions,
                    &independent_variables,
                    num_functions
                );

                // Calculate group probabilities and Mahalanobis distances
                let (probs, mahalanobis_distances) = calculate_group_probabilities(
                    &scores,
                    &canonical_functions,
                    &dataset,
                    config
                );

                // Sort groups by probability to find highest and second highest
                let mut group_info: Vec<(usize, f64, f64)> = probs
                    .iter()
                    .zip(mahalanobis_distances.iter())
                    .enumerate()
                    .map(|(i, ((_, prob), &dist))| (i + 1, *prob, dist))
                    .collect();

                group_info.sort_by(|a, b|
                    b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal)
                );

                // Determine highest and second highest groups
                let (highest_idx, highest_prob, highest_dist) = group_info[0];
                let (second_idx, second_prob, second_dist) = if group_info.len() > 1 {
                    group_info[1]
                } else {
                    group_info[0]
                };

                // Determine actual and predicted groups
                let actual = *numeric_groups.get(group_name).unwrap_or(&0);
                let predicted = highest_idx;

                // Add case data
                case_number.push(case_idx);
                actual_group.push(actual);
                predicted_group.push(predicted);

                // Add highest group data
                highest_group.push(highest_idx);
                highest_squared_mahalanobis_distance.push(highest_dist);
                highest_p_g_equals_d.push(highest_prob);

                // Calculate p-value for chi-square distribution
                let p_value = calculate_p_value_from_chi_square(highest_dist, num_functions);
                highest_p_value.push(p_value);
                highest_df.push(num_functions);

                // Add second highest group data
                second_group.push(second_idx);
                second_squared_mahalanobis_distance.push(second_dist);
                second_p_g_equals_d.push(second_prob);

                // Calculate p-value for chi-square distribution
                let p_value = calculate_p_value_from_chi_square(second_dist, num_functions);
                second_p_value.push(p_value);
                second_df.push(num_functions);

                // Add discriminant scores
                for i in 0..num_functions {
                    if
                        let Some(function_scores) = discriminant_scores.get_mut(
                            &format!("Function {}", i + 1)
                        )
                    {
                        if i < scores.len() {
                            function_scores.push(scores[i]);
                        } else {
                            function_scores.push(0.0);
                        }
                    }
                }

                case_idx += 1;
                processed_cases += 1;
            }
        }
    }

    // Create and return the result
    Ok(CasewiseStatistics {
        case_number,
        actual_group,
        predicted_group,
        highest_group: HighestGroupStatistics {
            p_value: highest_p_value,
            df: highest_df,
            p_g_equals_d: highest_p_g_equals_d,
            squared_mahalanobis_distance: highest_squared_mahalanobis_distance,
            group: highest_group,
        },
        second_highest_group: HighestGroupStatistics {
            p_value: second_p_value,
            df: second_df,
            p_g_equals_d: second_p_g_equals_d,
            squared_mahalanobis_distance: second_squared_mahalanobis_distance,
            group: second_group,
        },
        discriminant_scores,
    })
}

fn calculate_discriminant_scores(
    case_values: &[f64],
    canonical_functions: &CanonicalFunctions,
    variables: &[String],
    num_functions: usize
) -> Vec<f64> {
    let mut scores = vec![0.0; num_functions];

    // Calculate scores using coefficients
    for (var_idx, var_name) in variables.iter().enumerate() {
        if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
            for func_idx in 0..num_functions {
                if func_idx < coefs.len() && var_idx < case_values.len() {
                    scores[func_idx] += case_values[var_idx] * coefs[func_idx];
                }
            }
        }
    }

    // Add constants
    if let Some(constants) = canonical_functions.coefficients.get("(Constant)") {
        for func_idx in 0..num_functions.min(constants.len()) {
            scores[func_idx] += constants[func_idx];
        }
    }

    scores
}

fn calculate_group_probabilities(
    scores: &[f64],
    canonical_functions: &CanonicalFunctions,
    dataset: &AnalyzedDataset,
    config: &DiscriminantConfig
) -> (Vec<(String, f64)>, Vec<f64>) {
    let num_groups = dataset.group_labels.len();
    let num_functions = scores.len();

    let mut probabilities = Vec::with_capacity(num_groups);
    let mut mahalanobis_distances = Vec::with_capacity(num_groups);

    // Calculate prior probabilities
    let priors = if config.classify.all_group_equal {
        vec![1.0 / (num_groups as f64); num_groups]
    } else {
        // Calculate based on group sizes
        let total_cases = dataset.total_cases as f64;
        dataset.group_labels
            .iter()
            .map(|group| {
                let group_size = dataset.group_data
                    .values()
                    .next()
                    .and_then(|g| g.get(group))
                    .map_or(0, |v| v.len()) as f64;

                if total_cases > 0.0 {
                    group_size / total_cases
                } else {
                    1.0 / (num_groups as f64)
                }
            })
            .collect()
    };

    // Calculate squared Mahalanobis distance to each group centroid
    for (group_idx, group) in dataset.group_labels.iter().enumerate() {
        if let Some(centroid) = canonical_functions.function_at_centroids.get(group) {
            // Calculate squared distance to this centroid
            let mut distance = 0.0;
            for i in 0..num_functions {
                if i < centroid.len() && i < scores.len() {
                    distance += (scores[i] - centroid[i]).powi(2);
                }
            }

            mahalanobis_distances.push(distance);

            // Calculate posterior probability (using Bayes' theorem)
            let prior = if group_idx < priors.len() {
                priors[group_idx]
            } else {
                1.0 / (num_groups as f64)
            };

            // Store group and probability for this case
            probabilities.push((group.clone(), prior * (-0.5 * distance).exp()));
        } else {
            mahalanobis_distances.push(f64::MAX);
            probabilities.push((group.clone(), 0.0));
        }
    }

    // Normalize probabilities
    let sum_probs: f64 = probabilities
        .iter()
        .map(|(_, p)| *p)
        .sum();
    if sum_probs > 0.0 {
        for (_, prob) in &mut probabilities {
            *prob /= sum_probs;
        }
    }

    (probabilities, mahalanobis_distances)
}

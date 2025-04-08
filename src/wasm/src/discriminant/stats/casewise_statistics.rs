// casewise_statistics.rs
use std::collections::HashMap;

use crate::discriminant::models::{
    result::{ CanonicalFunctions, CasewiseStatistics, HighestGroupStatistics },
    AnalysisData,
    DiscriminantConfig,
    DataValue,
};
use super::core::{
    calculate_canonical_functions,
    calculate_eigen_statistics,
    calculate_p_value_from_chi_square,
    extract_analyzed_dataset,
    AnalyzedDataset,
};

pub fn calculate_casewise_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<CasewiseStatistics, String> {
    web_sys::console::log_1(&"Executing calculate_casewise_statistics".into());

    // Extract analyzed dataset
    let dataset = match extract_analyzed_dataset(data, config) {
        Ok(ds) => {
            web_sys::console::log_1(
                &format!("Dataset extracted with {} groups", ds.group_labels.len()).into()
            );
            ds
        }
        Err(e) => {
            return Err(format!("Dataset extraction failed: {}", e));
        }
    };

    if dataset.group_labels.is_empty() {
        return Err("No valid group labels found".to_string());
    }

    web_sys::console::log_1(&format!("Group labels: {:?}", dataset.group_labels).into());

    // Determine which variables to use
    let independent_variables = if config.main.stepwise {
        // In a stepwise analysis, we would get the selected variables
        // Since we don't have the implementation, we'll use all for now
        config.main.independent_variables.clone()
    } else {
        config.main.independent_variables.clone()
    };

    if independent_variables.is_empty() {
        return Err("No independent variables selected".to_string());
    }

    web_sys::console::log_1(&format!("Using variables: {:?}", independent_variables).into());

    // Get eigenvalues and canonical functions
    let eigen_stats = match calculate_eigen_statistics(data, config) {
        Ok(stats) => {
            web_sys::console::log_1(
                &format!("Found {} eigenvalues", stats.eigenvalue.len()).into()
            );
            stats
        }
        Err(e) => {
            return Err(format!("Eigen statistics calculation failed: {}", e));
        }
    };

    if eigen_stats.eigenvalue.is_empty() {
        return Err("No eigenvalues found".to_string());
    }

    let num_functions = eigen_stats.eigenvalue.len();

    // Calculate discriminant functions
    let canonical_functions = match calculate_canonical_functions(data, config) {
        Ok(cf) => {
            web_sys::console::log_1(&"Canonical functions calculated successfully".into());
            cf
        }
        Err(e) => {
            return Err(format!("Canonical function calculation failed: {}", e));
        }
    };

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

    // Process cases in their original order
    let mut processed_cases = 0;

    // Process all cases in their original order from the data
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        if processed_cases >= limit_cases {
            break;
        }

        web_sys::console::log_1(
            &format!("Processing group {} with {} cases", group_idx, group_data.len()).into()
        );

        for (case_idx, record) in group_data.iter().enumerate() {
            if processed_cases >= limit_cases {
                break;
            }

            // Get the group value directly from the record
            let group_name = match record.values.get(&config.main.grouping_variable) {
                Some(DataValue::Number(num)) => num.to_string(),
                Some(DataValue::Text(text)) => text.clone(),
                _ => {
                    web_sys::console::log_1(
                        &format!("Record at index {} missing group value, skipping", case_idx).into()
                    );
                    continue;
                }
            };

            if !dataset.group_labels.contains(&group_name) {
                web_sys::console::log_1(
                    &format!("Group '{}' not in group_labels, skipping", group_name).into()
                );
                continue;
            }

            // Get values for all variables for this case
            let mut case_values = Vec::with_capacity(independent_variables.len());

            // For each independent variable
            for (var_idx, var_name) in independent_variables.iter().enumerate() {
                if var_idx >= data.independent_data.len() {
                    web_sys::console::log_1(
                        &format!("Variable index {} out of bounds, skipping case", var_idx).into()
                    );
                    continue;
                }

                // Get the record from the appropriate independent data array
                if case_idx < data.independent_data[var_idx].len() {
                    if
                        let Some(DataValue::Number(value)) =
                            data.independent_data[var_idx][case_idx].values.get(var_name)
                    {
                        case_values.push(*value);
                    } else {
                        web_sys::console::log_1(
                            &format!(
                                "Missing value for var {} in case {}, skipping",
                                var_name,
                                case_idx
                            ).into()
                        );
                        continue;
                    }
                } else {
                    web_sys::console::log_1(
                        &format!(
                            "Case index {} out of bounds for var {}, skipping",
                            case_idx,
                            var_name
                        ).into()
                    );
                    continue;
                }
            }

            // Skip if we don't have all values
            if case_values.len() != independent_variables.len() {
                web_sys::console::log_1(
                    &format!(
                        "Case {} has {} values, expected {}, skipping",
                        case_idx,
                        case_values.len(),
                        independent_variables.len()
                    ).into()
                );
                continue;
            }

            web_sys::console::log_1(
                &format!(
                    "Processing case {} in group {}: values = {:?}",
                    case_idx,
                    group_name,
                    case_values
                ).into()
            );

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

            // Find highest probability group without reordering
            let mut highest_idx = 0;
            let mut highest_prob = f64::MIN;
            let mut highest_dist = f64::MAX;

            for (i, ((grp, prob), &dist)) in probs
                .iter()
                .zip(mahalanobis_distances.iter())
                .enumerate() {
                if *prob > highest_prob {
                    highest_idx = i;
                    highest_prob = *prob;
                    highest_dist = dist;
                }
            }

            // Find second highest probability group without reordering
            let mut second_idx = if probs.len() > 1 {
                if highest_idx == 0 { 1 } else { 0 }
            } else {
                highest_idx
            };
            let mut second_prob = f64::MIN;
            let mut second_dist = f64::MAX;

            for (i, ((grp, prob), &dist)) in probs
                .iter()
                .zip(mahalanobis_distances.iter())
                .enumerate() {
                if i != highest_idx && *prob > second_prob {
                    second_idx = i;
                    second_prob = *prob;
                    second_dist = dist;
                }
            }

            let highest_grp = if highest_idx < probs.len() {
                probs[highest_idx].0.clone()
            } else {
                "".to_string()
            };
            let second_grp = if second_idx < probs.len() {
                probs[second_idx].0.clone()
            } else {
                "".to_string()
            };

            // Add case data - preserve original case number
            case_number.push(case_idx + 1); // 1-based case numbering
            actual_group.push(group_name.clone());
            predicted_group.push(highest_grp.clone());

            // Add highest group data
            highest_group.push(highest_grp);
            highest_squared_mahalanobis_distance.push(highest_dist);
            highest_p_g_equals_d.push(highest_prob);

            // Calculate p-value for chi-square distribution
            let p_value = calculate_p_value_from_chi_square(highest_dist, num_functions);
            highest_p_value.push(p_value);
            highest_df.push(num_functions);

            // Add second highest group data
            second_group.push(second_grp);
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

            processed_cases += 1;
        }
    }

    web_sys::console::log_1(&format!("Processed {} cases total", processed_cases).into());

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
    let priors: HashMap<String, f64> = if config.classify.all_group_equal {
        dataset.group_labels
            .iter()
            .map(|label| (label.clone(), 1.0 / (num_groups as f64)))
            .collect()
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

                let prior = if total_cases > 0.0 {
                    group_size / total_cases
                } else {
                    1.0 / (num_groups as f64)
                };

                (group.clone(), prior)
            })
            .collect()
    };

    // Calculate squared Mahalanobis distance to each group centroid
    for group in &dataset.group_labels {
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
            let prior = priors
                .get(group)
                .copied()
                .unwrap_or(1.0 / (num_groups as f64));

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

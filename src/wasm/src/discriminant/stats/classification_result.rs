use std::collections::HashMap;
use rayon::prelude::*;

use crate::discriminant::models::result::{ CanonicalFunctions, EigenDescription };
use crate::discriminant::models::{
    data::DataValue,
    result::ClassificationResults,
    AnalysisData,
    DiscriminantConfig,
};
use crate::discriminant::stats::canonical_functions::{
    calculate_canonical_functions,
    calculate_eigen_statistics,
};
use super::core::{ extract_analyzed_dataset, extract_case_values, AnalyzedDataset };

pub fn calculate_classification_results(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<ClassificationResults, String> {
    web_sys::console::log_1(&"Executing calculate_classification_results".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;
    let independent_variables = &config.main.independent_variables;

    // Extract record groups mapping
    let record_groups = extract_record_groups(data, &config.main.grouping_variable);

    // Get eigenvalues
    let eigen_stats = calculate_eigen_statistics(data, config)?;

    // Calculate discriminant functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Initialize classification matrices
    let mut original_classification = HashMap::new();
    let mut original_percentage = HashMap::new();

    for group in &dataset.group_labels {
        original_classification.insert(group.clone(), vec![0; dataset.group_labels.len()]);
        original_percentage.insert(group.clone(), vec![0.0; dataset.group_labels.len()]);
    }

    // Clone required data for parallel processing
    let canonical_functions_clone = canonical_functions.clone();
    let eigen_stats_clone = eigen_stats.clone();
    let dataset_clone = dataset.clone();

    // Classify each case and populate the matrices - parallel processing
    let classifications: Vec<(String, usize)> = data.group_data
        .par_iter()
        .enumerate()
        .flat_map(|(group_idx, group_data)| {
            if let Some(group_name) = record_groups.get(&group_idx) {
                if !dataset_clone.group_labels.contains(group_name) {
                    return vec![];
                }

                let cf = canonical_functions_clone.clone();
                let es = eigen_stats_clone.clone();
                let ds = dataset_clone.clone();

                group_data
                    .par_iter()
                    .filter_map(move |case| {
                        let case_values = extract_case_values(case, independent_variables);

                        if case_values.len() == independent_variables.len() {
                            let predicted_idx = classify_case(&case_values, &cf, &es, &ds, config);

                            Some((group_name.clone(), predicted_idx))
                        } else {
                            None
                        }
                    })
                    .collect::<Vec<_>>()
            } else {
                vec![]
            }
        })
        .collect();

    // Update classification counts
    for (group_name, predicted_idx) in classifications {
        if let Some(counts) = original_classification.get_mut(&group_name) {
            if predicted_idx < counts.len() {
                counts[predicted_idx] += 1;
            }
        }
    }

    // Calculate percentages
    for group in &dataset.group_labels {
        if let Some(counts) = original_classification.get(group) {
            let total_cases = counts.iter().sum::<i32>() as f64;
            if total_cases > 0.0 {
                if let Some(percentages) = original_percentage.get_mut(group) {
                    for (i, &count) in counts.iter().enumerate() {
                        percentages[i] = ((count as f64) * 100.0) / total_cases;
                    }
                }
            }
        }
    }

    // Cross-validation results only if requested
    let (cross_validated_classification, cross_validated_percentage) = if config.classify.leave {
        calculate_cross_validation(data, config, &dataset, &record_groups)?
    } else {
        (None, None)
    };

    Ok(ClassificationResults {
        original_classification,
        cross_validated_classification,
        original_percentage,
        cross_validated_percentage,
    })
}

pub fn extract_record_groups(
    data: &AnalysisData,
    grouping_variable: &str
) -> HashMap<usize, String> {
    let mut case_groups = HashMap::new();
    let mut case_idx = 0;

    for group_data in &data.group_data {
        for record in group_data {
            if let Some(value) = record.values.get(grouping_variable) {
                let group_label = match value {
                    DataValue::Number(num) => num.to_string(),
                    DataValue::Text(text) => text.clone(),
                    _ => {
                        continue;
                    }
                };

                case_groups.insert(case_idx, group_label);
            }
            case_idx += 1;
        }
    }

    case_groups
}

fn calculate_cross_validation(
    data: &AnalysisData,
    config: &DiscriminantConfig,
    dataset: &AnalyzedDataset,
    record_groups: &HashMap<usize, String>
) -> Result<(Option<HashMap<String, Vec<i32>>>, Option<HashMap<String, Vec<f64>>>), String> {
    let independent_variables = &config.main.independent_variables;
    let mut cross_validated_classification = HashMap::new();
    let mut cross_validated_percentage = HashMap::new();

    // Initialize with zeros for all possible combinations
    for group in &dataset.group_labels {
        cross_validated_classification.insert(group.clone(), vec![0; dataset.group_labels.len()]);
        cross_validated_percentage.insert(group.clone(), vec![0.0; dataset.group_labels.len()]);
    }

    // Clone dataset for parallel processing
    let dataset_clone = dataset.clone();

    // Use parallel processing for cross-validation
    let cv_results: Vec<(String, usize)> = data.group_data
        .par_iter()
        .enumerate()
        .flat_map(|(group_idx, group_data)| {
            let group_name = match record_groups.get(&group_idx) {
                Some(name) if dataset_clone.group_labels.contains(name) => name.clone(),
                _ => {
                    return vec![];
                }
            };

            (0..group_data.len())
                .into_par_iter()
                .filter_map(|case_idx| {
                    // Skip if we don't have enough data
                    if group_data.len() <= 1 {
                        return None;
                    }

                    let case = &group_data[case_idx];
                    let case_values = extract_case_values(case, independent_variables);

                    if case_values.len() != independent_variables.len() {
                        return None;
                    }

                    // Create a temporary dataset excluding this case
                    let mut temp_data = data.clone();

                    // Only remove if index is valid
                    if case_idx < temp_data.group_data[group_idx].len() {
                        // Remove the case from the temporary dataset
                        temp_data.group_data[group_idx].remove(case_idx);

                        // Calculate new eigen statistics for leave-one-out
                        let leave_one_out_eigen_stats = match
                            calculate_eigen_statistics(&temp_data, config)
                        {
                            Ok(eigen_stats) => eigen_stats,
                            Err(_) => {
                                return None;
                            }
                        };

                        // Calculate new discriminant functions for leave-one-out
                        let leave_one_out_functions = match
                            calculate_canonical_functions(&temp_data, config)
                        {
                            Ok(functions) => functions,
                            Err(_) => {
                                return None;
                            }
                        };

                        // Get temporary dataset
                        let temp_dataset = match extract_analyzed_dataset(&temp_data, config) {
                            Ok(ds) => ds,
                            Err(_) => {
                                return None;
                            }
                        };

                        // Classify the case using leave-one-out functions
                        let predicted_idx = classify_case(
                            &case_values,
                            &leave_one_out_functions,
                            &leave_one_out_eigen_stats,
                            &temp_dataset,
                            config
                        );

                        Some((group_name.clone(), predicted_idx))
                    } else {
                        None
                    }
                })
                .collect::<Vec<_>>()
        })
        .collect();

    // Update cross-validation counts
    for (group_name, predicted_idx) in cv_results {
        if let Some(counts) = cross_validated_classification.get_mut(&group_name) {
            if predicted_idx < counts.len() {
                counts[predicted_idx] += 1;
            }
        }
    }

    // Calculate percentages
    for group in &dataset.group_labels {
        if let Some(counts) = cross_validated_classification.get(group) {
            let total_cases = counts.iter().sum::<i32>() as f64;
            if total_cases > 0.0 {
                if let Some(percentages) = cross_validated_percentage.get_mut(group) {
                    for (i, &count) in counts.iter().enumerate() {
                        percentages[i] = ((count as f64) * 100.0) / total_cases;
                    }
                }
            }
        }
    }

    Ok((Some(cross_validated_classification), Some(cross_validated_percentage)))
}

fn classify_case(
    case_values: &[f64],
    canonical_functions: &CanonicalFunctions,
    eigen_stats: &EigenDescription,
    dataset: &AnalyzedDataset,
    config: &DiscriminantConfig
) -> usize {
    let variables = &config.main.independent_variables;
    let num_functions = eigen_stats.eigenvalue.len();
    let num_groups = dataset.group_labels.len();

    // Calculate discriminant scores
    let mut discriminant_scores = variables
        .iter()
        .enumerate()
        .fold(vec![0.0; num_functions], |mut scores, (var_idx, var_name)| {
            if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                for func_idx in 0..num_functions {
                    if func_idx < coefs.len() && var_idx < case_values.len() {
                        scores[func_idx] += case_values[var_idx] * coefs[func_idx];
                    }
                }
            }
            scores
        });

    // Add constants
    if let Some(constants) = canonical_functions.coefficients.get("(Constant)") {
        for func_idx in 0..num_functions.min(constants.len()) {
            discriminant_scores[func_idx] += constants[func_idx];
        }
    }

    // Calculate squared distances to each group centroid
    let mut distances = Vec::with_capacity(num_groups);

    for group_name in &dataset.group_labels {
        if let Some(centroid) = canonical_functions.function_at_centroids.get(group_name) {
            let distance = discriminant_scores
                .iter()
                .enumerate()
                .fold(0.0, |sum, (i, &score)| {
                    if i < centroid.len() { sum + (score - centroid[i]).powi(2) } else { sum }
                });
            distances.push(distance);
        } else {
            distances.push(f64::MAX);
        }
    }

    // Calculate prior probabilities
    let priors = if config.classify.all_group_equal {
        vec![1.0 / (num_groups as f64); num_groups]
    } else {
        calculate_group_priors(dataset)
    };

    // Calculate posterior probabilities
    let mut posteriors = Vec::with_capacity(num_groups);
    let mut sum_exp = 0.0;

    for i in 0..num_groups {
        let scaled_dist = -0.5 * distances[i];
        let exp_val = scaled_dist.exp() * priors[i];
        posteriors.push(exp_val);
        sum_exp += exp_val;
    }

    // Normalize posteriors
    if sum_exp > 0.0 {
        for i in 0..num_groups {
            posteriors[i] /= sum_exp;
        }
    }

    // Find group with maximum posterior probability
    posteriors
        .iter()
        .enumerate()
        .max_by(|a, b| a.1.partial_cmp(b.1).unwrap_or(std::cmp::Ordering::Equal))
        .map(|(idx, _)| idx)
        .unwrap_or(0)
}

fn calculate_group_priors(dataset: &AnalyzedDataset) -> Vec<f64> {
    let num_groups = dataset.group_labels.len();

    // Count cases in each group
    let group_sizes: Vec<usize> = dataset.group_labels
        .iter()
        .map(|group| {
            dataset.group_data
                .get(dataset.group_data.keys().next().unwrap_or(&String::new()))
                .and_then(|g| g.get(group))
                .map_or(0, |v| v.len())
        })
        .collect();

    let total_cases: usize = group_sizes.iter().sum();

    if total_cases == 0 {
        return vec![1.0 / (num_groups as f64); num_groups];
    }

    // Calculate priors based on group sizes
    group_sizes
        .into_iter()
        .map(|size| (size as f64) / (total_cases as f64))
        .collect()
}

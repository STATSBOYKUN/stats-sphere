use std::collections::HashMap;

use crate::discriminant::models::{
    data::DataValue,
    result::ClassificationResults,
    AnalysisData,
    DiscriminantConfig,
    DataRecord,
};
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;
use crate::discriminant::stats::common::extract_case_values;

pub fn calculate_classification_results(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<ClassificationResults, String> {
    web_sys::console::log_1(&"Executing calculate_classification_results".into());

    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;

    // Flatten the group data for easier processing
    let flattened_group_data: Vec<&DataRecord> = data.group_data
        .iter()
        .flat_map(|records| records.iter())
        .collect();

    // Extract group values by index and track unique groups
    let mut record_groups: HashMap<usize, String> = HashMap::new();
    let mut unique_groups = Vec::new();

    for (i, record) in flattened_group_data.iter().enumerate() {
        for (key, value) in &record.values {
            // Check if this is the grouping variable
            if key == grouping_variable {
                let group_label = match value {
                    DataValue::Number(num) => num.to_string(),
                    DataValue::Text(text) => text.clone(),
                    _ => {
                        continue;
                    }
                };

                record_groups.insert(i, group_label.clone());

                if !unique_groups.contains(&group_label) {
                    unique_groups.push(group_label);
                }

                break;
            }
        }
    }

    // Sort the groups for consistency
    unique_groups.sort();

    // Create a mapping from group indices in data.group_data to the actual group names
    let mut group_idx_to_name = HashMap::new();
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        if group_data.is_empty() {
            continue;
        }

        for record in group_data {
            if let Some(DataValue::Number(value)) = record.values.get(grouping_variable) {
                group_idx_to_name.insert(group_idx, value.to_string());
                break;
            } else if let Some(DataValue::Text(value)) = record.values.get(grouping_variable) {
                group_idx_to_name.insert(group_idx, value.clone());
                break;
            }
        }
    }

    // Calculate discriminant functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Initialize classification matrices
    let mut original_classification = HashMap::new();
    let mut original_percentage = HashMap::new();

    // Initialize with zeros for all possible combinations
    for group in &unique_groups {
        original_classification.insert(group.clone(), vec![0; unique_groups.len()]);
        original_percentage.insert(group.clone(), vec![0.0; unique_groups.len()]);
    }

    // Classify each case and populate the matrices
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        if let Some(group_name) = group_idx_to_name.get(&group_idx) {
            if !unique_groups.contains(group_name) {
                continue;
            }

            let group_position = unique_groups
                .iter()
                .position(|g| g == group_name)
                .unwrap();

            // For each case in this group
            for case in group_data {
                // Extract numeric values from case
                let case_values = extract_case_values(case, independent_variables);

                // Classify this case
                let predicted_idx = classify_case(
                    &case_values,
                    &canonical_functions,
                    data,
                    config,
                    &unique_groups
                );

                // Update the appropriate count in the matrix
                if let Some(counts) = original_classification.get_mut(group_name) {
                    counts[predicted_idx] += 1;
                }
            }

            // Calculate percentages
            if let Some(counts) = original_classification.get(group_name) {
                let total_cases = counts.iter().sum::<i32>() as f64;
                if total_cases > 0.0 {
                    if let Some(percentages) = original_percentage.get_mut(group_name) {
                        for (i, &count) in counts.iter().enumerate() {
                            percentages[i] = ((count as f64) * 100.0) / total_cases;
                        }
                    }
                }
            }
        }
    }

    // Cross-validation results, only if leave-one-out is requested
    let (cross_validated_classification, cross_validated_percentage) = if config.classify.leave {
        let mut cross_validated_classification = HashMap::new();
        let mut cross_validated_percentage = HashMap::new();

        // Initialize with zeros for all possible combinations
        for group in &unique_groups {
            cross_validated_classification.insert(group.clone(), vec![0; unique_groups.len()]);
            cross_validated_percentage.insert(group.clone(), vec![0.0; unique_groups.len()]);
        }

        // For each group
        for (group_idx, group_data) in data.group_data.iter().enumerate() {
            if let Some(group_name) = group_idx_to_name.get(&group_idx) {
                if !unique_groups.contains(group_name) || group_data.is_empty() {
                    continue;
                }

                // For each case in this group
                for (case_idx, case) in group_data.iter().enumerate() {
                    // Create a temporary dataset excluding this case
                    let mut temp_data = data.clone();

                    if case_idx < temp_data.group_data[group_idx].len() {
                        // Remove the case from the temporary dataset
                        temp_data.group_data[group_idx].remove(case_idx);

                        // Recalculate discriminant functions
                        let leave_one_out_functions = calculate_canonical_functions(
                            &temp_data,
                            config
                        ).unwrap_or_else(|_| canonical_functions.clone());

                        // Extract case values and classify
                        let case_values = extract_case_values(case, independent_variables);
                        let predicted_idx = classify_case(
                            &case_values,
                            &leave_one_out_functions,
                            &temp_data,
                            config,
                            &unique_groups
                        );

                        // Update the cross-validation matrix
                        if let Some(counts) = cross_validated_classification.get_mut(group_name) {
                            counts[predicted_idx] += 1;
                        }
                    }
                }

                // Calculate percentages
                if let Some(counts) = cross_validated_classification.get(group_name) {
                    let total_cases = counts.iter().sum::<i32>() as f64;
                    if total_cases > 0.0 {
                        if let Some(percentages) = cross_validated_percentage.get_mut(group_name) {
                            for (i, &count) in counts.iter().enumerate() {
                                percentages[i] = ((count as f64) * 100.0) / total_cases;
                            }
                        }
                    }
                }
            }
        }

        (Some(cross_validated_classification), Some(cross_validated_percentage))
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

fn classify_case(
    case_values: &[f64],
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions,
    data: &AnalysisData,
    config: &DiscriminantConfig,
    group_labels: &[String]
) -> usize {
    let num_groups = group_labels.len();
    let variables = &config.main.independent_variables;
    let num_functions = canonical_functions.eigenvalues.len();

    // Calculate discriminant scores for this case
    let mut discriminant_scores = Vec::with_capacity(num_functions);

    // For each function
    for func_idx in 0..num_functions {
        let mut score = 0.0;

        // Apply coefficients
        for (var_idx, var_name) in variables.iter().enumerate() {
            if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                if func_idx < coefs.len() && var_idx < case_values.len() {
                    score += case_values[var_idx] * coefs[func_idx];
                }
            }
        }

        discriminant_scores.push(score);
    }

    // Calculate squared Mahalanobis distances to each group
    let mut distances = Vec::with_capacity(num_groups);

    for group_name in group_labels {
        if let Some(centroid) = canonical_functions.function_at_centroids.get(group_name) {
            // Calculate squared Euclidean distance to centroid
            let mut distance = 0.0;
            for (i, &score) in discriminant_scores.iter().enumerate() {
                if i < centroid.len() {
                    let diff = score - centroid[i];
                    distance += diff * diff;
                }
            }

            distances.push(distance);
        } else {
            distances.push(f64::MAX); // Very large distance if group not found
        }
    }

    // Prior probabilities - use either equal or estimated from group sizes
    let mut priors = vec![0.0; num_groups];

    if config.classify.all_group_equal {
        // Equal priors
        for i in 0..num_groups {
            priors[i] = 1.0 / (num_groups as f64);
        }
    } else {
        // Priors based on group sizes
        let mut group_sizes = HashMap::new();
        let mut total_cases = 0;

        // Count cases in each group
        for (group_idx, group_data) in data.group_data.iter().enumerate() {
            let group_size = group_data.len();
            total_cases += group_size;

            for record in group_data {
                if
                    let Some(DataValue::Number(value)) = record.values.get(
                        &config.main.grouping_variable
                    )
                {
                    let group_name = value.to_string();
                    group_sizes.insert(group_name, group_size);
                    break;
                } else if
                    let Some(DataValue::Text(value)) = record.values.get(
                        &config.main.grouping_variable
                    )
                {
                    group_sizes.insert(value.clone(), group_size);
                    break;
                }
            }
        }

        // Set priors based on group sizes
        for (i, group_name) in group_labels.iter().enumerate() {
            priors[i] = if let Some(size) = group_sizes.get(group_name) {
                if total_cases > 0 {
                    (*size as f64) / (total_cases as f64)
                } else {
                    1.0 / (num_groups as f64)
                }
            } else {
                1.0 / (num_groups as f64)
            };
        }
    }

    // Calculate posterior probabilities using Bayes' rule
    let mut posteriors = Vec::with_capacity(num_groups);
    let mut sum_exp = 0.0;

    // Use exponential transformation to convert distances to probabilities
    for i in 0..num_groups {
        // Scale distances to prevent overflow
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
    let mut max_prob = posteriors[0];
    let mut predicted_group = 0;

    for i in 1..num_groups {
        if posteriors[i] > max_prob {
            max_prob = posteriors[i];
            predicted_group = i;
        }
    }

    predicted_group
}

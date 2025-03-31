// classification_result.rs
use std::collections::HashMap;
use nalgebra::{ DMatrix, DVector };

use crate::discriminant::models::{
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

    let num_groups = data.group_data.len();
    let variables = &config.main.independent_variables;

    // Create group labels
    let group_labels: Vec<String> = (1..=num_groups).map(|i| i.to_string()).collect();

    // Calculate discriminant functions first
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Original classification confusion matrix
    let mut original_classification = HashMap::new();

    // Original classification percentage
    let mut original_percentage = HashMap::new();

    // Classify each case
    for (group_idx, group_data) in data.group_data.iter().enumerate() {
        let group_name = group_labels[group_idx].clone();

        // Initialize counts and percentages
        let mut counts = vec![0; num_groups];
        let mut percentages = vec![0.0; num_groups];

        // For each case in this group
        for case in group_data {
            // Extract numeric values from DataRecord
            let case_values = extract_case_values(case, variables);

            // Classify this case
            let predicted_group = classify_case(
                &case_values,
                &canonical_functions,
                data,
                config,
                &group_labels
            );

            // Update counts
            counts[predicted_group] += 1;
        }

        // Calculate percentages
        let total_cases = group_data.len() as f64;
        if total_cases > 0.0 {
            for i in 0..num_groups {
                percentages[i] = (100.0 * (counts[i] as f64)) / total_cases;
            }
        }

        original_classification.insert(group_name.clone(), counts);
        original_percentage.insert(group_name, percentages);
    }

    // Cross-validation results, only if leave-one-out is requested
    let (cross_validated_classification, cross_validated_percentage) = if config.classify.leave {
        // Initialize cross-validation matrices
        let mut cross_validated_classification = HashMap::new();
        let mut cross_validated_percentage = HashMap::new();

        // For each group
        for (group_idx, group_data) in data.group_data.iter().enumerate() {
            if group_data.is_empty() {
                continue;
            }

            let group_name = group_labels[group_idx].clone();

            // Initialize counts and percentages
            let mut counts = vec![0; num_groups];
            let mut percentages = vec![0.0; num_groups];

            // For each case in this group
            for (case_idx, case) in group_data.iter().enumerate() {
                // Create a temporary dataset excluding this case
                let mut temp_data = data.clone();

                // Store the case and then remove it from the dataset
                let case_to_classify = group_data[case_idx].clone();

                // Remove case (safely)
                if
                    group_idx < temp_data.group_data.len() &&
                    case_idx < temp_data.group_data[group_idx].len()
                {
                    temp_data.group_data[group_idx].remove(case_idx);

                    // Calculate discriminant functions on this reduced dataset
                    let leave_one_out_functions = calculate_canonical_functions(
                        &temp_data,
                        config
                    ).unwrap_or_else(|_| canonical_functions.clone());

                    // Extract numeric values from the case
                    let case_values = extract_case_values(&case_to_classify, variables);

                    // Classify the left-out case
                    let predicted_group = classify_case(
                        &case_values,
                        &leave_one_out_functions,
                        &temp_data,
                        config,
                        &group_labels
                    );

                    // Update counts
                    counts[predicted_group] += 1;
                }
            }

            // Calculate percentages
            let total_cases = group_data.len() as f64;
            if total_cases > 0.0 {
                for i in 0..num_groups {
                    percentages[i] = (100.0 * (counts[i] as f64)) / total_cases;
                }
            }

            cross_validated_classification.insert(group_name.clone(), counts);
            cross_validated_percentage.insert(group_name, percentages);
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

// Function to classify a case using the discriminant functions
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

    for group_idx in 0..num_groups {
        let group_name = &group_labels[group_idx];

        if let Some(centroid) = canonical_functions.function_at_centroids.get(group_name) {
            // Calculate squared Euclidean distance to centroid (approximation of Mahalanobis in canonical space)
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
        let total_cases: usize = data.group_data
            .iter()
            .map(|g| g.len())
            .sum();
        for i in 0..num_groups {
            priors[i] = if total_cases > 0 {
                (data.group_data[i].len() as f64) / (total_cases as f64)
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

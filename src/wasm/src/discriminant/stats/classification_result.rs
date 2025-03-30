use std::collections::HashMap;

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
    let group_labels: Vec<String> = (0..num_groups).map(|i| format!("Group_{}", i + 1)).collect();

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
            let predicted_group = classify_case(&case_values, &canonical_functions, data, config);

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
            let group_name = group_labels[group_idx].clone();

            // Initialize counts and percentages
            let mut counts = vec![0; num_groups];
            let mut percentages = vec![0.0; num_groups];

            // For each case in this group
            for (case_idx, case) in group_data.iter().enumerate() {
                // Create a temporary dataset excluding this case
                let mut temp_data = data.clone();
                let case_to_classify = temp_data.group_data[group_idx].remove(case_idx);

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
                    config
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
    config: &DiscriminantConfig
) -> usize {
    let num_groups = data.group_data.len();
    let variables = &config.main.independent_variables;

    // Calculate discriminant scores for this case
    let mut scores = Vec::new();

    // For each function
    for func_idx in 0..canonical_functions.eigenvalues.len() {
        let mut score = 0.0;

        // Apply coefficients
        for (var_idx, var_name) in variables.iter().enumerate() {
            if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                if func_idx < coefs.len() && var_idx < case_values.len() {
                    score += case_values[var_idx] * coefs[func_idx];
                }
            }
        }

        scores.push(score);
    }

    // Calculate squared Mahalanobis distances to each group
    let mut distances = Vec::with_capacity(num_groups);

    for group_idx in 0..num_groups {
        let group_name = (group_idx + 1).to_string();

        if let Some(centroid) = canonical_functions.function_at_centroids.get(&group_name) {
            // Calculate squared distance
            let mut distance = 0.0;
            for (i, &score) in scores.iter().enumerate() {
                if i < centroid.len() {
                    distance += (score - centroid[i]).powi(2);
                }
            }

            distances.push(distance);
        } else {
            distances.push(f64::MAX); // Very large distance if group not found
        }
    }

    // Find group with minimum distance
    let mut min_distance = f64::MAX;
    let mut min_group = 0;

    for (group_idx, &distance) in distances.iter().enumerate() {
        if distance < min_distance {
            min_distance = distance;
            min_group = group_idx;
        }
    }

    min_group
}

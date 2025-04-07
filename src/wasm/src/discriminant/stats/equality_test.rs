use rayon::prelude::*;

use crate::discriminant::models::{ result::EqualityTests, AnalysisData, DiscriminantConfig };
use super::core::{ extract_analyzed_dataset, calculate_p_value_from_f, AnalyzedDataset };

pub fn calculate_equality_tests(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<EqualityTests, String> {
    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;
    let independent_variables = config.main.independent_variables.clone();

    // Use parallel processing for variables
    let results: Vec<(f64, f64, i32, i32, f64)> = independent_variables
        .par_iter()
        .map(|variable| calculate_variable_f_test(variable, &dataset))
        .collect();

    // Extract results into separate vectors
    let mut wilks_lambda = Vec::with_capacity(independent_variables.len());
    let mut f_values = Vec::with_capacity(independent_variables.len());
    let mut df1 = Vec::with_capacity(independent_variables.len());
    let mut df2 = Vec::with_capacity(independent_variables.len());
    let mut significance = Vec::with_capacity(independent_variables.len());

    for (lambda, f_value, df1_val, df2_val, p_value) in results {
        wilks_lambda.push(lambda);
        f_values.push(f_value);
        df1.push(df1_val);
        df2.push(df2_val);
        significance.push(p_value);
    }

    Ok(EqualityTests {
        variables: independent_variables,
        wilks_lambda,
        f_values,
        df1,
        df2,
        significance,
    })
}

fn calculate_variable_f_test(
    variable: &str,
    dataset: &AnalyzedDataset
) -> (f64, f64, i32, i32, f64) {
    // Collect all values for this variable
    let mut all_values = Vec::new();
    for group in &dataset.group_labels {
        if let Some(values) = dataset.group_data.get(variable).and_then(|g| g.get(group)) {
            all_values.extend(values.clone());
        }
    }

    if all_values.is_empty() {
        return (1.0, 0.0, 0, 0, 1.0);
    }

    // Get overall mean
    let overall_mean = dataset.overall_means.get(variable).unwrap_or(&0.0);

    // Calculate between-groups and within-groups sums of squares
    let mut between_ss = 0.0;
    let mut within_ss = 0.0;
    let mut valid_groups = 0;
    let mut valid_cases = 0;

    for group in &dataset.group_labels {
        if let Some(values) = dataset.group_data.get(variable).and_then(|g| g.get(group)) {
            if values.is_empty() {
                continue;
            }

            valid_groups += 1;
            valid_cases += values.len();

            let group_mean = dataset.group_means
                .get(group)
                .and_then(|m| m.get(variable))
                .unwrap_or(&0.0);

            // Between-groups SS
            between_ss += (values.len() as f64) * (group_mean - overall_mean).powi(2);

            // Within-groups SS
            within_ss += values
                .iter()
                .map(|&val| (val - group_mean).powi(2))
                .sum::<f64>();
        }
    }

    // Calculate F statistic
    let f_value = if within_ss > 0.0 && valid_groups > 1 {
        let between_df = valid_groups - 1;
        let within_df = valid_cases - valid_groups;

        between_ss / (between_df as f64) / (within_ss / (within_df as f64))
    } else {
        0.0
    };

    // Calculate Wilks' lambda
    let lambda = if between_ss + within_ss > 0.0 {
        within_ss / (between_ss + within_ss)
    } else {
        1.0
    };

    // Calculate p-value
    let df1_val = valid_groups - 1;
    let df2_val = valid_cases - valid_groups;
    let p_value = calculate_p_value_from_f(f_value, df1_val as f64, df2_val as f64);

    (lambda, f_value, df1_val as i32, df2_val as i32, p_value)
}

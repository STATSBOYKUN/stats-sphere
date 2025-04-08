use crate::discriminant::stats::core::AnalyzedDataset;

use super::{
    matrix_calculations::{
        calculate_min_f_ratio,
        calculate_min_mahalanobis_distance,
        calculate_raos_v,
        calculate_total_unexplained_variation,
    },
    statistical_tests::{ calculate_overall_wilks_lambda, calculate_univariate_f },
    stepwise_statistics::MethodType,
};

/// Calculate F-to-enter for a variable based on the selected method
pub fn calculate_variable_f_to_enter(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String],
    method_type: MethodType
) -> (f64, f64) {
    match method_type {
        MethodType::Wilks => calculate_f_to_enter_wilks(variable, dataset, current_variables),
        MethodType::Unexplained =>
            calculate_f_to_enter_unexplained(variable, dataset, current_variables),
        MethodType::Mahalanobis =>
            calculate_f_to_enter_mahalanobis(variable, dataset, current_variables),
        MethodType::FRatio => calculate_f_to_enter_fratio(variable, dataset, current_variables),
        MethodType::Raos => calculate_f_to_enter_raos(variable, dataset, current_variables),
    }
}

/// Calculate F-to-remove for a variable based on the selected method
pub fn calculate_variable_f_to_remove(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String],
    method_type: MethodType
) -> (f64, f64) {
    match method_type {
        MethodType::Wilks => calculate_f_to_remove_wilks(variable, dataset, current_variables),
        MethodType::Unexplained =>
            calculate_f_to_remove_unexplained(variable, dataset, current_variables),
        MethodType::Mahalanobis =>
            calculate_f_to_remove_mahalanobis(variable, dataset, current_variables),
        MethodType::FRatio => calculate_f_to_remove_fratio(variable, dataset, current_variables),
        MethodType::Raos => calculate_f_to_remove_raos(variable, dataset, current_variables),
    }
}

// Calculate F-to-enter using Wilks' lambda method
fn calculate_f_to_enter_wilks(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(variable, dataset);
    }

    // Calculate Wilks' lambda for current model
    let current_wilks = calculate_overall_wilks_lambda(dataset, current_variables);

    // Calculate Wilks' lambda with new variable added
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let new_wilks = calculate_overall_wilks_lambda(dataset, &new_variables);

    // Calculate F-to-enter
    let df1 = dataset.num_groups - 1;
    let df2 = dataset.total_cases - current_variables.len() - 1 - df1;

    let f_value = if df2 > 0 && new_wilks < current_wilks {
        (((current_wilks - new_wilks) / new_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, new_wilks)
}

// Calculate F-to-remove using Wilks' lambda method
fn calculate_f_to_remove_wilks(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // Calculate Wilks' lambda for current model
    let current_wilks = calculate_overall_wilks_lambda(dataset, current_variables);

    // Calculate Wilks' lambda with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_wilks = if reduced_variables.is_empty() {
        1.0
    } else {
        calculate_overall_wilks_lambda(dataset, &reduced_variables)
    };

    // Calculate F-to-remove
    let df1 = dataset.num_groups - 1;
    let df2 = dataset.total_cases - current_variables.len() + 1 - df1;

    let f_value = if df2 > 0 && reduced_wilks > current_wilks && current_wilks > 0.0 {
        (((reduced_wilks - current_wilks) / current_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, reduced_wilks)
}

// Calculate F-to-enter using Unexplained Variance method
fn calculate_f_to_enter_unexplained(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // Calculate current unexplained variation
    let current_sum = if current_variables.is_empty() {
        calculate_total_unexplained_variation(dataset, &[])
    } else {
        calculate_total_unexplained_variation(dataset, current_variables)
    };

    // Calculate unexplained variation with the new variable
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let new_sum = calculate_total_unexplained_variation(dataset, &new_variables);

    // Calculate reduction in unexplained variation
    let reduction = current_sum - new_sum;

    // Calculate F value based on reduction
    let df1 = dataset.num_groups - 1;
    let df2 = dataset.total_cases - current_variables.len() - 1 - df1;

    let f_value = if df2 > 0 && new_sum > 0.0 {
        ((reduction / new_sum) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    // For Wilks' lambda, estimate based on F
    let wilks_lambda = if f_value > 0.0 {
        (df2 as f64) / ((df2 as f64) + (df1 as f64) * f_value)
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-remove using Unexplained Variance method
fn calculate_f_to_remove_unexplained(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // Calculate current unexplained variation
    let current_sum = calculate_total_unexplained_variation(dataset, current_variables);

    // Calculate unexplained variation with the variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_sum = if reduced_variables.is_empty() {
        calculate_total_unexplained_variation(dataset, &[])
    } else {
        calculate_total_unexplained_variation(dataset, &reduced_variables)
    };

    // Calculate increase in unexplained variation
    let increase = reduced_sum - current_sum;

    // Calculate F value based on increase
    let df1 = dataset.num_groups - 1;
    let df2 = dataset.total_cases - current_variables.len() + 1 - df1;

    let f_value = if df2 > 0 && current_sum > 0.0 {
        ((increase / current_sum) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    // For Wilks' lambda, estimate based on F
    let wilks_lambda = if reduced_variables.is_empty() {
        1.0
    } else if f_value > 0.0 {
        (df2 as f64) / ((df2 as f64) + (df1 as f64) * f_value)
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-enter using Mahalanobis Distance method
fn calculate_f_to_enter_mahalanobis(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(variable, dataset);
    }

    // Add the new variable to the set
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    // Calculate minimum Mahalanobis distance between any two groups
    let min_d2 = calculate_min_mahalanobis_distance(dataset, &new_variables);

    // Convert to F statistic
    let p = new_variables.len() as f64;
    let n = dataset.total_cases as f64;
    let g = dataset.num_groups as f64;

    // F value formula
    let f_value = (min_d2 * (n - g - p + 1.0)) / (p * (n - g));

    // Estimate Wilks' lambda from F
    let wilks_lambda = if f_value > 0.0 {
        (n - g - p + 1.0) / (n - g - p + 1.0 + p * f_value)
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-remove using Mahalanobis Distance method
fn calculate_f_to_remove_mahalanobis(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // Calculate current minimum Mahalanobis distance
    let current_min_d2 = calculate_min_mahalanobis_distance(dataset, current_variables);

    // Calculate minimum distance with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_min_d2 = if reduced_variables.is_empty() {
        0.0
    } else {
        calculate_min_mahalanobis_distance(dataset, &reduced_variables)
    };

    // Calculate decrease in Mahalanobis distance
    let decrease = current_min_d2 - reduced_min_d2;

    // Convert to F statistic
    let p = current_variables.len() as f64;
    let n = dataset.total_cases as f64;
    let g = dataset.num_groups as f64;

    // F value formula
    let f_value = (decrease * (n - g - p + 2.0)) / ((n - g) * (1.0 + decrease / (n - g)));

    // Estimate Wilks' lambda from F
    let wilks_lambda = if reduced_variables.is_empty() {
        1.0
    } else if f_value > 0.0 {
        (n - g - p + 2.0) / (n - g - p + 2.0 + f_value)
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-enter using Smallest F Ratio method
fn calculate_f_to_enter_fratio(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(variable, dataset);
    }

    // Add the new variable to the set
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    // Calculate minimum F ratio between any two groups
    let min_f_ratio = calculate_min_f_ratio(dataset, &new_variables);

    // For Wilks' lambda, estimate from F
    let _df1 = 1; // For pairwise comparisons
    let df2 = dataset.total_cases - dataset.num_groups - new_variables.len() + 1;

    let wilks_lambda = if min_f_ratio > 0.0 && df2 > 0 {
        (df2 as f64) / ((df2 as f64) + min_f_ratio)
    } else {
        1.0
    };

    (min_f_ratio, wilks_lambda)
}

// Calculate F-to-remove using Smallest F Ratio method
fn calculate_f_to_remove_fratio(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // Calculate current minimum F ratio
    let current_min_f = calculate_min_f_ratio(dataset, current_variables);

    // Calculate minimum F ratio with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_min_f = if reduced_variables.is_empty() {
        0.0
    } else {
        calculate_min_f_ratio(dataset, &reduced_variables)
    };

    // Calculate decrease in minimum F ratio
    let f_value = current_min_f - reduced_min_f;

    // For Wilks' lambda, estimate from F
    let wilks_lambda = if reduced_variables.is_empty() {
        1.0
    } else {
        let _df1 = 1; // For pairwise comparisons
        let df2 = dataset.total_cases - dataset.num_groups - reduced_variables.len() + 1;

        if reduced_min_f > 0.0 && df2 > 0 {
            (df2 as f64) / ((df2 as f64) + reduced_min_f)
        } else {
            1.0
        }
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-enter using Rao's V method
fn calculate_f_to_enter_raos(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(variable, dataset);
    }

    // Calculate current Rao's V
    let current_v = calculate_raos_v(dataset, current_variables);

    // Calculate Rao's V with new variable
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let new_v = calculate_raos_v(dataset, &new_variables);

    // Calculate increase in Rao's V
    let increase = new_v - current_v;

    // Calculate approximate F value for the increase
    let df1 = dataset.num_groups - 1;
    let df2 = dataset.total_cases - current_variables.len() - dataset.num_groups;

    let f_value = if df2 > 0 { increase / (df1 as f64) } else { 0.0 };

    // For Wilks' lambda, estimate from Rao's V
    let wilks_lambda = if new_v > 0.0 {
        1.0 / (1.0 + new_v / (dataset.total_cases as f64))
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-remove using Rao's V method
fn calculate_f_to_remove_raos(
    variable: &str,
    dataset: &AnalyzedDataset,
    current_variables: &[String]
) -> (f64, f64) {
    // Calculate current Rao's V
    let current_v = calculate_raos_v(dataset, current_variables);

    // Calculate Rao's V with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_v = if reduced_variables.is_empty() {
        0.0
    } else {
        calculate_raos_v(dataset, &reduced_variables)
    };

    // Calculate decrease in Rao's V
    let decrease = current_v - reduced_v;

    // Calculate F value for the decrease
    let df1 = dataset.num_groups - 1;
    let df2 = dataset.total_cases - current_variables.len() + 1 - dataset.num_groups;

    let f_value = if df2 > 0 { decrease / (df1 as f64) } else { 0.0 };

    // For Wilks' lambda, estimate from Rao's V
    let wilks_lambda = if reduced_variables.is_empty() {
        1.0
    } else if reduced_v > 0.0 {
        1.0 / (1.0 + reduced_v / (dataset.total_cases as f64))
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

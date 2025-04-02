use std::collections::HashMap;

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

// Calculate F-to-enter for a variable based on the selected method
pub fn calculate_variable_f_to_enter(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize,
    method_type: MethodType
) -> (f64, f64) {
    match method_type {
        MethodType::Wilks =>
            calculate_f_to_enter_wilks(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::Unexplained =>
            calculate_f_to_enter_unexplained(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::Mahalanobis =>
            calculate_f_to_enter_mahalanobis(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::FRatio =>
            calculate_f_to_enter_fratio(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::Raos =>
            calculate_f_to_enter_raos(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
    }
}

// Calculate F-to-remove for a variable based on the selected method
pub fn calculate_variable_f_to_remove(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize,
    method_type: MethodType
) -> (f64, f64) {
    match method_type {
        MethodType::Wilks =>
            calculate_f_to_remove_wilks(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::Unexplained =>
            calculate_f_to_remove_unexplained(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::Mahalanobis =>
            calculate_f_to_remove_mahalanobis(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::FRatio =>
            calculate_f_to_remove_fratio(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
        MethodType::Raos =>
            calculate_f_to_remove_raos(
                variable,
                group_data,
                group_labels,
                group_means,
                overall_means,
                current_variables,
                num_groups,
                total_cases
            ),
    }
}

// Calculate F-to-enter using Wilks' lambda method
pub fn calculate_f_to_enter_wilks(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(
            variable,
            group_data,
            group_labels,
            group_means,
            overall_means,
            num_groups,
            total_cases
        );
    }

    // Calculate Wilks' lambda for current model
    let current_wilks = calculate_overall_wilks_lambda(
        group_data,
        group_labels,
        group_means,
        overall_means,
        current_variables,
        num_groups,
        total_cases
    );

    // Calculate Wilks' lambda with new variable added
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let new_wilks = calculate_overall_wilks_lambda(
        group_data,
        group_labels,
        group_means,
        overall_means,
        &new_variables,
        num_groups,
        total_cases
    );

    // Calculate F-to-enter
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() - 1 - df1;

    let f_value = if df2 > 0 && new_wilks < current_wilks {
        (((current_wilks - new_wilks) / new_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, new_wilks)
}

// Calculate F-to-remove using Wilks' lambda method
pub fn calculate_f_to_remove_wilks(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Calculate Wilks' lambda for current model
    let current_wilks = calculate_overall_wilks_lambda(
        group_data,
        group_labels,
        group_means,
        overall_means,
        current_variables,
        num_groups,
        total_cases
    );

    // Calculate Wilks' lambda with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_wilks = if reduced_variables.is_empty() {
        1.0
    } else {
        calculate_overall_wilks_lambda(
            group_data,
            group_labels,
            group_means,
            overall_means,
            &reduced_variables,
            num_groups,
            total_cases
        )
    };

    // Calculate F-to-remove
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() + 1 - df1;

    let f_value = if df2 > 0 && reduced_wilks > current_wilks && current_wilks > 0.0 {
        (((reduced_wilks - current_wilks) / current_wilks) * (df2 as f64)) / (df1 as f64)
    } else {
        0.0
    };

    (f_value, reduced_wilks)
}

// Calculate F-to-enter using Unexplained Variance method
pub fn calculate_f_to_enter_unexplained(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // For unexplained variance method, we calculate the sum of unexplained variation
    // between groups, then select the variable that minimizes this sum

    // Calculate current unexplained variation
    let current_sum = if current_variables.is_empty() {
        calculate_total_unexplained_variation(
            group_data,
            group_labels,
            group_means,
            &[],
            num_groups
        )
    } else {
        calculate_total_unexplained_variation(
            group_data,
            group_labels,
            group_means,
            current_variables,
            num_groups
        )
    };

    // Calculate unexplained variation with the new variable
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let new_sum = calculate_total_unexplained_variation(
        group_data,
        group_labels,
        group_means,
        &new_variables,
        num_groups
    );

    // Calculate reduction in unexplained variation
    let reduction = current_sum - new_sum;

    // Calculate F value based on reduction
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() - 1 - df1;

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
pub fn calculate_f_to_remove_unexplained(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Calculate current unexplained variation
    let current_sum = calculate_total_unexplained_variation(
        group_data,
        group_labels,
        group_means,
        current_variables,
        num_groups
    );

    // Calculate unexplained variation with the variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_sum = if reduced_variables.is_empty() {
        calculate_total_unexplained_variation(
            group_data,
            group_labels,
            group_means,
            &[],
            num_groups
        )
    } else {
        calculate_total_unexplained_variation(
            group_data,
            group_labels,
            group_means,
            &reduced_variables,
            num_groups
        )
    };

    // Calculate increase in unexplained variation
    let increase = reduced_sum - current_sum;

    // Calculate F value based on increase
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() + 1 - df1;

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
pub fn calculate_f_to_enter_mahalanobis(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // For Mahalanobis method, we maximize the Mahalanobis distance between the two closest groups

    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(
            variable,
            group_data,
            group_labels,
            group_means,
            overall_means,
            num_groups,
            total_cases
        );
    }

    // Add the new variable to the set
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    // Calculate minimum Mahalanobis distance between any two groups
    let min_d2 = calculate_min_mahalanobis_distance(
        group_data,
        group_labels,
        group_means,
        &new_variables,
        num_groups
    );

    // Convert to F statistic
    let p = new_variables.len() as f64;
    let n = total_cases as f64;
    let g = num_groups as f64;

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
pub fn calculate_f_to_remove_mahalanobis(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Calculate current minimum Mahalanobis distance
    let current_min_d2 = calculate_min_mahalanobis_distance(
        group_data,
        group_labels,
        group_means,
        current_variables,
        num_groups
    );

    // Calculate minimum distance with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_min_d2 = if reduced_variables.is_empty() {
        0.0
    } else {
        calculate_min_mahalanobis_distance(
            group_data,
            group_labels,
            group_means,
            &reduced_variables,
            num_groups
        )
    };

    // Calculate decrease in Mahalanobis distance
    let decrease = current_min_d2 - reduced_min_d2;

    // Convert to F statistic
    let p = current_variables.len() as f64;
    let n = total_cases as f64;
    let g = num_groups as f64;

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
pub fn calculate_f_to_enter_fratio(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // For FRatio method, we maximize the smallest F ratio among all pairs of groups

    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(
            variable,
            group_data,
            group_labels,
            group_means,
            overall_means,
            num_groups,
            total_cases
        );
    }

    // Add the new variable to the set
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    // Calculate minimum F ratio between any two groups
    let min_f_ratio = calculate_min_f_ratio(
        group_data,
        group_labels,
        group_means,
        &new_variables,
        num_groups,
        total_cases
    );

    // For Wilks' lambda, estimate from F
    let df1 = 1; // For pairwise comparisons
    let df2 = total_cases - num_groups - new_variables.len() + 1;

    let wilks_lambda = if min_f_ratio > 0.0 && df2 > 0 {
        (df2 as f64) / ((df2 as f64) + min_f_ratio)
    } else {
        1.0
    };

    (min_f_ratio, wilks_lambda)
}

// Calculate F-to-remove using Smallest F Ratio method
pub fn calculate_f_to_remove_fratio(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Calculate current minimum F ratio
    let current_min_f = calculate_min_f_ratio(
        group_data,
        group_labels,
        group_means,
        current_variables,
        num_groups,
        total_cases
    );

    // Calculate minimum F ratio with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_min_f = if reduced_variables.is_empty() {
        0.0
    } else {
        calculate_min_f_ratio(
            group_data,
            group_labels,
            group_means,
            &reduced_variables,
            num_groups,
            total_cases
        )
    };

    // Calculate decrease in minimum F ratio
    let decrease = current_min_f - reduced_min_f;

    // F-to-remove is the decrease
    let f_value = decrease;

    // For Wilks' lambda, estimate from F
    let wilks_lambda = if reduced_variables.is_empty() {
        1.0
    } else {
        let df1 = 1; // For pairwise comparisons
        let df2 = total_cases - num_groups - reduced_variables.len() + 1;

        if reduced_min_f > 0.0 && df2 > 0 {
            (df2 as f64) / ((df2 as f64) + reduced_min_f)
        } else {
            1.0
        }
    };

    (f_value, wilks_lambda)
}

// Calculate F-to-enter using Rao's V method
pub fn calculate_f_to_enter_raos(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // If no current variables, use univariate F test
    if current_variables.is_empty() {
        return calculate_univariate_f(
            variable,
            group_data,
            group_labels,
            group_means,
            overall_means,
            num_groups,
            total_cases
        );
    }

    // Calculate current Rao's V
    let current_v = calculate_raos_v(
        group_data,
        group_labels,
        group_means,
        overall_means,
        current_variables,
        num_groups,
        total_cases
    );

    // Calculate Rao's V with new variable
    let mut new_variables = current_variables.to_vec();
    new_variables.push(variable.to_string());

    let new_v = calculate_raos_v(
        group_data,
        group_labels,
        group_means,
        overall_means,
        &new_variables,
        num_groups,
        total_cases
    );

    // Calculate increase in Rao's V
    let increase = new_v - current_v;

    // Calculate approximate F value for the increase
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() - num_groups;

    let f_value = if df2 > 0 { increase / (df1 as f64) } else { 0.0 };

    // For Wilks' lambda, estimate from Rao's V
    let wilks_lambda = if new_v > 0.0 { 1.0 / (1.0 + new_v / (total_cases as f64)) } else { 1.0 };

    (f_value, wilks_lambda)
}

// Calculate F-to-remove using Rao's V method
pub fn calculate_f_to_remove_raos(
    variable: &str,
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    group_means: &HashMap<String, HashMap<String, f64>>,
    overall_means: &HashMap<String, f64>,
    current_variables: &[String],
    num_groups: usize,
    total_cases: usize
) -> (f64, f64) {
    // Calculate current Rao's V
    let current_v = calculate_raos_v(
        group_data,
        group_labels,
        group_means,
        overall_means,
        current_variables,
        num_groups,
        total_cases
    );

    // Calculate Rao's V with variable removed
    let reduced_variables: Vec<String> = current_variables
        .iter()
        .filter(|&v| v != variable)
        .cloned()
        .collect();

    let reduced_v = if reduced_variables.is_empty() {
        0.0
    } else {
        calculate_raos_v(
            group_data,
            group_labels,
            group_means,
            overall_means,
            &reduced_variables,
            num_groups,
            total_cases
        )
    };

    // Calculate decrease in Rao's V
    let decrease = current_v - reduced_v;

    // Calculate F value for the decrease
    let df1 = num_groups - 1;
    let df2 = total_cases - current_variables.len() + 1 - num_groups;

    let f_value = if df2 > 0 { decrease / (df1 as f64) } else { 0.0 };

    // For Wilks' lambda, estimate from Rao's V
    let wilks_lambda = if reduced_variables.is_empty() {
        1.0
    } else if reduced_v > 0.0 {
        1.0 / (1.0 + reduced_v / (total_cases as f64))
    } else {
        1.0
    };

    (f_value, wilks_lambda)
}

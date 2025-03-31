// wilks_lambda.rs
use nalgebra::DMatrix;
use crate::discriminant::models::{ result::WilksLambdaTest, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_pooled_covariance_matrix,
    calculate_p_value_from_chi_square,
    extract_values_by_index,
};
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;

pub fn calculate_wilks_lambda_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<WilksLambdaTest, String> {
    web_sys::console::log_1(&"Executing calculate_wilks_lambda_test".into());

    // First, get canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Variables to use
    let variables = &config.main.independent_variables;
    let num_vars = variables.len();

    // Number of groups and functions
    let num_groups = data.group_data.len();
    let num_functions = canonical_functions.eigenvalues.len();

    // Total number of cases
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    // Calculate Wilks' Lambda from eigenvalues
    let mut wilks_lambda = 1.0;
    for eigenvalue in &canonical_functions.eigenvalues {
        wilks_lambda *= 1.0 / (1.0 + eigenvalue);
    }

    // Calculate chi-square statistic
    let n = total_cases as f64;
    let p = num_vars as f64;
    let g = num_groups as f64;

    // Use Bartlett's approximation
    let chi_square = -(n - 1.0 - (p + g) / 2.0) * wilks_lambda.ln();

    // Degrees of freedom
    let df = (p * (g - 1.0)) as i32;

    // Calculate significance (p-value)
    let significance = calculate_p_value_from_chi_square(chi_square, df as usize);

    // For multiple functions, we need to test remaining functions
    let mut test_of_functions = Vec::with_capacity(num_functions);
    let mut wilks_values = Vec::with_capacity(num_functions);
    let mut chi_squares = Vec::with_capacity(num_functions);
    let mut dfs = Vec::with_capacity(num_functions);
    let mut significances = Vec::with_capacity(num_functions);

    // Overall test (all functions)
    test_of_functions.push("1 through ".to_string() + &num_functions.to_string());
    wilks_values.push(wilks_lambda);
    chi_squares.push(chi_square);
    dfs.push(df);
    significances.push(significance);

    // Test for remaining functions
    let mut current_lambda = wilks_lambda;
    for i in 1..num_functions {
        // Calculate lambda for functions i+1 to k
        let mut lambda_remaining = 1.0;
        for j in i..num_functions {
            lambda_remaining *= 1.0 / (1.0 + canonical_functions.eigenvalues[j]);
        }

        // Calculate chi-square for remaining functions
        let chi_sq = -(n - 1.0 - (p + g) / 2.0) * lambda_remaining.ln();

        // Degrees of freedom for remaining functions
        let df_remaining = (p - (i as f64) + 1.0) * (g - (i as f64) - 1.0);

        // Calculate significance
        let sig = calculate_p_value_from_chi_square(chi_sq, df_remaining as usize);

        test_of_functions.push((i + 1).to_string() + " through " + &num_functions.to_string());
        wilks_values.push(lambda_remaining);
        chi_squares.push(chi_sq);
        dfs.push(df_remaining as i32);
        significances.push(sig);
    }

    Ok(WilksLambdaTest {
        test_of_functions,
        wilks_lambda: wilks_values,
        chi_square: chi_squares,
        df: dfs,
        significance: significances,
    })
}

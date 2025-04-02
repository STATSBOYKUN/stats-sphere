use statrs::distribution::ContinuousCDF;
use crate::discriminant::models::{
    result::WilksLambdaTest,
    AnalysisData,
    DiscriminantConfig,
    data::DataValue,
};
use crate::discriminant::stats::stepwise::stepwise_statistics::calculate_stepwise_statistics;
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;

pub fn calculate_wilks_lambda_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<WilksLambdaTest, String> {
    web_sys::console::log_1(&"Executing calculate_wilks_lambda_test".into());

    // First, get canonical functions which contains eigenvalues
    // This will already handle stepwise variables correctly if enabled
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Get variables to use (handled by canonical_functions already)
    // Get independent variables and grouping variable from the config
    let grouping_variable = &config.main.grouping_variable;

    // Get valid eigenvalues (filter out zeros and negligible values)
    let eigenvalues: Vec<f64> = canonical_functions.eigenvalues
        .into_iter()
        .filter(|&e| e > 1e-10)
        .collect();

    if eigenvalues.is_empty() {
        return Err("No significant eigenvalues found".to_string());
    }

    let num_functions = eigenvalues.len();

    // For stepwise, use only the selected variables' count
    let num_vars = if config.main.stepwise {
        get_stepwise_selected_variables_count(data, config)?
    } else {
        config.main.independent_variables.len()
    };

    // Extract unique groups by analyzing the actual data
    let unique_groups = extract_unique_groups(data, grouping_variable);
    let num_groups = unique_groups.len();

    if num_groups < 2 {
        return Err("At least 2 groups are required for discriminant analysis".to_string());
    }

    // Count total valid cases
    let total_cases: usize = data.group_data
        .iter()
        .map(|g| g.len())
        .sum();

    let n = total_cases as f64;
    let p = num_vars as f64;
    let g = num_groups as f64;

    // Prepare result containers
    let mut test_of_functions = Vec::with_capacity(num_functions);
    let mut wilks_values = Vec::with_capacity(num_functions);
    let mut chi_squares = Vec::with_capacity(num_functions);
    let mut dfs = Vec::with_capacity(num_functions);
    let mut significances = Vec::with_capacity(num_functions);

    // Calculate Wilks' Lambda for all functions together
    let mut lambda = 1.0;
    for eigenvalue in &eigenvalues {
        lambda *= 1.0 / (1.0 + eigenvalue);
    }

    // Calculate degrees of freedom - must be positive
    let df = (p * (g - 1.0)) as i32;
    if df <= 0 {
        return Err(format!("Invalid degrees of freedom: {}", df));
    }

    // Calculate chi-square using Bartlett's approximation
    let chi_square = -(n - 1.0 - (p + g) / 2.0) * lambda.ln();
    let significance = calculate_p_value_from_chi_square(chi_square, df as usize);

    test_of_functions.push(format!("1 through {}", num_functions));
    wilks_values.push(lambda);
    chi_squares.push(chi_square);
    dfs.push(df);
    significances.push(significance);

    // Test remaining functions (2 through m, 3 through m, etc.)
    for i in 1..num_functions {
        // Calculate lambda for functions i+1 to end
        let mut remaining_lambda = 1.0;
        for j in i..num_functions {
            remaining_lambda *= 1.0 / (1.0 + eigenvalues[j]);
        }

        // Degrees of freedom for remaining functions
        let df_remaining = ((p - (i as f64)) * (g - 1.0 - (i as f64))) as i32;

        // Skip if degrees of freedom is invalid
        if df_remaining <= 0 {
            continue;
        }

        let chi_sq = -(n - 1.0 - (p + g) / 2.0) * remaining_lambda.ln();
        let sig = calculate_p_value_from_chi_square(chi_sq, df_remaining as usize);

        test_of_functions.push(format!("{} through {}", i + 1, num_functions));
        wilks_values.push(remaining_lambda);
        chi_squares.push(chi_sq);
        dfs.push(df_remaining);
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

// Get count of variables selected by stepwise procedure
fn get_stepwise_selected_variables_count(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<usize, String> {
    // If stepwise mode is not enabled, return all variables count
    if !config.main.stepwise {
        return Ok(config.main.independent_variables.len());
    }

    // Calculate stepwise statistics to get the final selected variables
    match calculate_stepwise_statistics(data, config) {
        Ok(stepwise_stats) => {
            // Get the variables in the final step
            let final_step = stepwise_stats.variables_in_analysis
                .keys()
                .map(|k| k.parse::<i32>().unwrap_or(0))
                .max()
                .unwrap_or(0)
                .to_string();

            if let Some(vars_in_model) = stepwise_stats.variables_in_analysis.get(&final_step) {
                Ok(vars_in_model.len())
            } else {
                // If no final step found, return all variables count
                Ok(config.main.independent_variables.len())
            }
        }
        Err(_) => {
            // If stepwise analysis fails, use all variables
            Ok(config.main.independent_variables.len())
        }
    }
}

// Extract unique groups from the data
fn extract_unique_groups(data: &AnalysisData, grouping_variable: &str) -> Vec<String> {
    let mut unique_groups = Vec::new();

    for group_records in &data.group_data {
        for record in group_records {
            if let Some(value) = record.values.get(grouping_variable) {
                let group_label = match value {
                    DataValue::Number(num) => num.to_string(),
                    DataValue::Text(text) => text.clone(),
                    _ => {
                        continue;
                    }
                };

                if !unique_groups.contains(&group_label) {
                    unique_groups.push(group_label);
                }
            }
        }
    }

    // Sort groups for consistent results
    unique_groups.sort();
    unique_groups
}

// Calculate p-value from chi-square
fn calculate_p_value_from_chi_square(chi_square: f64, df: usize) -> f64 {
    if chi_square <= 0.0 || df == 0 {
        return 1.0;
    }

    match statrs::distribution::ChiSquared::new(df as f64) {
        Ok(dist) => dist.sf(chi_square),
        Err(_) => 1.0,
    }
}

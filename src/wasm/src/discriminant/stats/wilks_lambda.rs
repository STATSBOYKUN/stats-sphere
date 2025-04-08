use crate::discriminant::models::{ result::WilksLambdaTest, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::stepwise::stepwise_statistics::calculate_stepwise_statistics;
use crate::discriminant::stats::canonical_functions::{
    calculate_canonical_functions,
    calculate_eigen_statistics,
};
use super::core::{ extract_analyzed_dataset, calculate_p_value_from_chi_square };

pub fn calculate_wilks_lambda_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<WilksLambdaTest, String> {
    web_sys::console::log_1(&"Executing calculate_wilks_lambda_test".into());

    // Extract analyzed dataset
    let dataset = extract_analyzed_dataset(data, config)?;

    // Get eigenvalues
    let eigen_stats = calculate_eigen_statistics(data, config)?;

    // Get canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Get valid eigenvalues
    let eigenvalues: Vec<f64> = eigen_stats.eigenvalue
        .into_iter()
        .filter(|&e| e > 1e-10)
        .collect();

    if eigenvalues.is_empty() {
        return Err("No significant eigenvalues found".to_string());
    }

    let num_functions = eigenvalues.len();

    // Get number of variables (handle stepwise)
    let num_vars = if config.main.stepwise {
        get_stepwise_selected_variables_count(data, config)?
    } else {
        config.main.independent_variables.len()
    };

    if dataset.num_groups < 2 {
        return Err("At least 2 groups are required".to_string());
    }

    // Prepare result containers
    let mut test_of_functions = Vec::with_capacity(num_functions);
    let mut wilks_values = Vec::with_capacity(num_functions);
    let mut chi_squares = Vec::with_capacity(num_functions);
    let mut dfs = Vec::with_capacity(num_functions);
    let mut significances = Vec::with_capacity(num_functions);

    // Calculate parameters
    let n = dataset.total_cases as f64;
    let p = num_vars as f64;
    let g = dataset.num_groups as f64;

    // Calculate Wilks' Lambda for all functions together
    let mut lambda = 1.0;
    for eigenvalue in &eigenvalues {
        lambda *= 1.0 / (1.0 + eigenvalue);
    }

    // Calculate degrees of freedom
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

    // Test remaining functions
    for i in 1..num_functions {
        // Calculate lambda for functions i+1 to end
        let mut remaining_lambda = 1.0;
        for j in i..num_functions {
            remaining_lambda *= 1.0 / (1.0 + eigenvalues[j]);
        }

        // Degrees of freedom for remaining functions
        let df_remaining = ((p - (i as f64)) * (g - 1.0 - (i as f64))) as i32;
        if df_remaining <= 0 {
            continue;
        }

        // wilks_lambda.rs (continued)
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

fn get_stepwise_selected_variables_count(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<usize, String> {
    if !config.main.stepwise {
        return Ok(config.main.independent_variables.len());
    }

    match calculate_stepwise_statistics(data, config) {
        Ok(stepwise_stats) => {
            let final_step = stepwise_stats.variables_in_analysis
                .keys()
                .filter_map(|k| k.parse::<i32>().ok())
                .max()
                .unwrap_or(0)
                .to_string();

            if let Some(vars_in_model) = stepwise_stats.variables_in_analysis.get(&final_step) {
                Ok(vars_in_model.len())
            } else {
                Ok(config.main.independent_variables.len())
            }
        }
        Err(_) => Ok(config.main.independent_variables.len()),
    }
}

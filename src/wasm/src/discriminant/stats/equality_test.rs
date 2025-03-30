use crate::discriminant::models::{ result::EqualityTests, AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::common::{
    calculate_p_value_from_f,
    extract_values_by_index,
    extract_group_values,
};

pub fn calculate_equality_tests(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<EqualityTests, String> {
    web_sys::console::log_1(&"Executing calculate_equality_tests".into());

    // Extract variable names
    let variables = config.main.independent_variables.clone();

    // Initialize result arrays
    let mut wilks_lambda = Vec::with_capacity(variables.len());
    let mut f_values = Vec::with_capacity(variables.len());
    let mut df1 = Vec::with_capacity(variables.len());
    let mut df2 = Vec::with_capacity(variables.len());
    let mut significance = Vec::with_capacity(variables.len());

    // Number of groups
    let num_groups = data.group_data.len();

    // Total number of cases
    let total_cases: usize = data.group_data
        .iter()
        .map(|group| group.len())
        .sum();

    // For each variable, perform univariate F test
    for (var_idx, _) in variables.iter().enumerate() {
        // Calculate total sum of squares
        let all_values = extract_values_by_index(&data.group_data, var_idx, &variables);

        let overall_mean = all_values.iter().sum::<f64>() / (all_values.len() as f64);
        let total_ss = all_values
            .iter()
            .map(|&value| (value - overall_mean).powi(2))
            .sum::<f64>();

        // Calculate between-groups sum of squares
        let mut between_ss = 0.0;
        for group_data in data.group_data.iter() {
            let group_values = extract_group_values(group_data, var_idx, &variables);

            if !group_values.is_empty() {
                let group_mean = group_values.iter().sum::<f64>() / (group_values.len() as f64);
                between_ss += (group_values.len() as f64) * (group_mean - overall_mean).powi(2);
            }
        }

        // Calculate within-groups sum of squares
        let within_ss = total_ss - between_ss;

        // Degrees of freedom
        let df1_val = num_groups - 1;
        let df2_val = total_cases - num_groups;

        // Calculate F value
        let f_value = if within_ss > 0.0 && df1_val > 0 && df2_val > 0 {
            between_ss / (df1_val as f64) / (within_ss / (df2_val as f64))
        } else {
            0.0
        };

        // Calculate Wilks' lambda
        let lambda = if total_ss > 0.0 { within_ss / total_ss } else { 1.0 };

        // Calculate p-value (significance)
        let p_value = calculate_p_value_from_f(f_value, df1_val as f64, df2_val as f64);

        wilks_lambda.push(lambda);
        f_values.push(f_value);
        df1.push(df1_val as i32);
        df2.push(df2_val as i32);
        significance.push(p_value);
    }

    Ok(EqualityTests {
        variables,
        wilks_lambda,
        f_values,
        df1,
        df2,
        significance,
    })
}

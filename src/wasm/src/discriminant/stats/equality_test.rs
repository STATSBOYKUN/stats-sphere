use std::collections::HashMap;
use crate::discriminant::models::{
    result::EqualityTests,
    AnalysisData,
    DiscriminantConfig,
    DataValue,
    DataRecord,
};
use crate::discriminant::stats::common::calculate_p_value_from_f;

pub fn calculate_equality_tests(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<EqualityTests, String> {
    // Extract variable names
    let independent_variables = config.main.independent_variables.clone();
    let grouping_variable = &config.main.grouping_variable;

    // Initialize result arrays
    let mut wilks_lambda = Vec::with_capacity(independent_variables.len());
    let mut f_values = Vec::with_capacity(independent_variables.len());
    let mut df1 = Vec::with_capacity(independent_variables.len());
    let mut df2 = Vec::with_capacity(independent_variables.len());
    let mut significance = Vec::with_capacity(independent_variables.len());

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

    // Sort the groups
    unique_groups.sort();

    // Calculate the actual number of groups
    let num_groups = unique_groups.len();

    // Group data by group and variable
    let mut grouped_data: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();

    // Initialize the data structure
    for group in &unique_groups {
        for variable in &independent_variables {
            grouped_data
                .entry(group.clone())
                .or_insert_with(HashMap::new)
                .entry(variable.clone())
                .or_insert_with(Vec::new);
        }
    }

    // Collect data for each group and variable
    for (var_idx, variable) in independent_variables.iter().enumerate() {
        if var_idx >= data.independent_data.len() {
            continue;
        }

        let var_records = &data.independent_data[var_idx];

        for (i, record) in var_records.iter().enumerate() {
            if let Some(group) = record_groups.get(&i) {
                if let Some(DataValue::Number(value)) = record.values.get(variable) {
                    // Add to specific group
                    grouped_data.get_mut(group).unwrap().get_mut(variable).unwrap().push(*value);
                }
            }
        }
    }

    // For each variable, perform univariate F test
    for variable in &independent_variables {
        // Calculate total statistics
        let mut all_values = Vec::new();
        for group in &unique_groups {
            all_values.extend(grouped_data[group][variable].clone());
        }

        if all_values.is_empty() {
            wilks_lambda.push(1.0);
            f_values.push(0.0);
            df1.push(0);
            df2.push(0);
            significance.push(1.0);
            continue;
        }

        let overall_mean = all_values.iter().sum::<f64>() / (all_values.len() as f64);
        let total_ss = all_values
            .iter()
            .map(|&value| (value - overall_mean).powi(2))
            .sum::<f64>();

        // Calculate between-groups sum of squares
        let mut between_ss = 0.0;
        for group in &unique_groups {
            let group_values = &grouped_data[group][variable];

            if !group_values.is_empty() {
                let group_mean = group_values.iter().sum::<f64>() / (group_values.len() as f64);
                between_ss += (group_values.len() as f64) * (group_mean - overall_mean).powi(2);
            }
        }

        // Calculate within-groups sum of squares
        let within_ss = total_ss - between_ss;

        // Degrees of freedom
        let df1_val = num_groups - 1;
        let df2_val = all_values.len() - num_groups;

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
        variables: independent_variables,
        wilks_lambda,
        f_values,
        df1,
        df2,
        significance,
    })
}

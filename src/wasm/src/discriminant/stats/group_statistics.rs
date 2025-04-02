use std::collections::HashMap;

use crate::discriminant::models::{
    data::DataValue,
    result::GroupStatistics,
    AnalysisData,
    DataRecord,
    DiscriminantConfig,
};

pub fn calculate_group_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<GroupStatistics, String> {
    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;

    let mut result = GroupStatistics {
        groups: Vec::new(),
        variables: independent_variables.clone(),
        means: HashMap::new(),
        std_deviations: HashMap::new(),
    };

    for variable in independent_variables {
        result.means.insert(variable.clone(), Vec::new());
        result.std_deviations.insert(variable.clone(), Vec::new());
    }

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

    // Add "Total" group first
    if !unique_groups.contains(&"Total".to_string()) {
        unique_groups.insert(0, "Total".to_string());
    }

    result.groups = unique_groups.clone();

    // Group data by group and variable
    let mut grouped_data: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();

    // Initialize the data structure
    for group in &unique_groups {
        for variable in independent_variables {
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

                    // Add to "Total" group
                    grouped_data.get_mut("Total").unwrap().get_mut(variable).unwrap().push(*value);
                }
            }
        }
    }

    // Calculate statistics
    for variable in independent_variables {
        for group in &unique_groups {
            let values = &grouped_data[group][variable];

            if !values.is_empty() {
                let mean = values.iter().sum::<f64>() / (values.len() as f64);

                let variance = if values.len() > 1 {
                    values
                        .iter()
                        .map(|v| (v - mean).powi(2))
                        .sum::<f64>() / ((values.len() - 1) as f64)
                } else {
                    0.0
                };

                let std_dev = variance.sqrt();

                result.means.get_mut(variable).unwrap().push(mean);
                result.std_deviations.get_mut(variable).unwrap().push(std_dev);
            } else {
                result.means.get_mut(variable).unwrap().push(0.0);
                result.std_deviations.get_mut(variable).unwrap().push(0.0);
            }
        }
    }

    Ok(result)
}

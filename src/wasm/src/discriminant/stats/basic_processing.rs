use crate::discriminant::models::{ result::ProcessingSummary, AnalysisData, DiscriminantConfig };
use crate::discriminant::models::data::DataValue;

pub fn basic_processing_summary(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<ProcessingSummary, String> {
    web_sys::console::log_1(&"Executing basic_processing_summary".into());

    // Count total cases from group data
    let total_cases: usize = data.group_data
        .iter()
        .map(|group| group.len())
        .sum();

    // Get the min and max range from config
    let min_range = config.define_range.min_range;
    let max_range = config.define_range.max_range;

    // Get the grouping and independent variables from config
    let group_var = &config.main.grouping_variable;
    let independent_vars = &config.main.independent_variables;

    // Initialize counters for different exclusion categories
    let mut missing_group_codes = 0;
    let mut missing_disc_vars = 0;
    let mut both_missing = 0;

    // Flatten all independent data for easier access
    let all_independent_records = data.independent_data.iter().flatten().collect::<Vec<_>>();

    // Process each record in group_data to check group variable
    for (_idx_group, group) in data.group_data.iter().enumerate() {
        for (_idx_record, record) in group.iter().enumerate() {
            // Check if group code is missing or out of range
            let has_missing_group = match record.values.get(group_var) {
                Some(DataValue::Number(val)) => {
                    // Check if value is outside defined range
                    (min_range.is_some() && val < &min_range.unwrap()) ||
                        (max_range.is_some() && val > &max_range.unwrap())
                }
                Some(DataValue::Null) => true,
                Some(DataValue::Text(s)) if s.trim().is_empty() => true,
                None => true,
                _ => false,
            };

            // Check if all independent variables exist in any independent record
            let mut has_missing_disc = false;

            // For each independent variable in the config
            for var_name in independent_vars {
                // Look for this variable in all independent records
                let mut found_valid_value = false;

                for ind_record in &all_independent_records {
                    // Check if this independent record has the variable with a valid value
                    match ind_record.values.get(var_name) {
                        Some(DataValue::Number(val)) if !val.is_nan() => {
                            found_valid_value = true;
                            break;
                        }
                        Some(DataValue::Text(s)) if !s.trim().is_empty() => {
                            found_valid_value = true;
                            break;
                        }
                        Some(other_value) if !matches!(other_value, DataValue::Null) => {
                            found_valid_value = true;
                            break;
                        }
                        _ => {}
                    }
                }

                // If we couldn't find a valid value for this variable in any record
                if !found_valid_value {
                    has_missing_disc = true;
                }
            }

            // Categorize the case based on both conditions
            if has_missing_group && has_missing_disc {
                both_missing += 1;
            } else if has_missing_group {
                missing_group_codes += 1;
            } else if has_missing_disc {
                missing_disc_vars += 1;
            }
        }
    }

    // Calculate total excluded cases
    let excluded_cases = missing_group_codes + missing_disc_vars + both_missing;

    // Calculate valid cases
    let valid_cases = total_cases - excluded_cases;

    // Calculate percentages (avoid division by zero)
    let calc_percent = |value: usize| -> f64 {
        if total_cases == 0 { 0.0 } else { ((value as f64) / (total_cases as f64)) * 100.0 }
    };

    // Create the enhanced ProcessingSummary
    Ok(ProcessingSummary {
        valid_cases,
        excluded_cases,
        total_cases,
        valid_percent: Some(calc_percent(valid_cases)),
        missing_group_codes: Some(missing_group_codes),
        missing_group_percent: Some(calc_percent(missing_group_codes)),
        missing_disc_vars: Some(missing_disc_vars),
        missing_disc_percent: Some(calc_percent(missing_disc_vars)),
        both_missing: Some(both_missing),
        both_missing_percent: Some(calc_percent(both_missing)),
        total_excluded_percent: Some(calc_percent(excluded_cases)),
    })
}

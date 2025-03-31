// basic_processing.rs
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

    // Process each record to check for missing values
    for group in data.group_data.iter() {
        for record in group.iter() {
            // Check if group code is missing or out of range
            let has_missing_group = match record.values.get(group_var) {
                Some(DataValue::Number(val)) => {
                    (min_range.is_some() && val < &min_range.unwrap()) ||
                        (max_range.is_some() && val > &max_range.unwrap())
                }
                Some(DataValue::Null) => true,
                Some(DataValue::Text(s)) if s.trim().is_empty() => true,
                None => true,
                _ => false,
            };

            // Check if any independent variable is missing
            let mut has_missing_disc = false;

            for var_name in independent_vars {
                match record.values.get(var_name) {
                    Some(DataValue::Number(val)) if !val.is_nan() => {}
                    Some(DataValue::Text(s)) if !s.trim().is_empty() => {}
                    Some(DataValue::Boolean(_)) => {}
                    _ => {
                        has_missing_disc = true;
                        break;
                    }
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

    // Calculate percentages
    let calc_percent = |value: usize| -> f64 {
        if total_cases == 0 { 0.0 } else { ((value as f64) / (total_cases as f64)) * 100.0 }
    };

    // Create the ProcessingSummary
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

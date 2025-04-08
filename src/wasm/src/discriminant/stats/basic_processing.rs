use crate::discriminant::models::{ result::ProcessingSummary, AnalysisData, DiscriminantConfig };
use crate::discriminant::models::data::DataValue;

pub fn basic_processing_summary(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<ProcessingSummary, String> {
    web_sys::console::log_1(&"Executing basic_processing_summary".into());

    let total_cases: usize = data.group_data
        .iter()
        .map(|group| group.len())
        .sum();
    let min_range = config.define_range.min_range;
    let max_range = config.define_range.max_range;
    let group_var = &config.main.grouping_variable;
    let independent_vars = &config.main.independent_variables;

    let mut missing_group_codes = 0;
    let mut missing_disc_vars = 0;
    let mut both_missing = 0;

    for group in &data.group_data {
        for record in group {
            let has_missing_group = match record.values.get(group_var) {
                Some(DataValue::Number(val)) =>
                    (min_range.is_some() && val < &min_range.unwrap()) ||
                        (max_range.is_some() && val > &max_range.unwrap()),
                Some(DataValue::Null) => true,
                Some(DataValue::Text(s)) if s.trim().is_empty() => true,
                None => true,
                _ => false,
            };

            let has_missing_disc = independent_vars.iter().any(|var_name| {
                // Check if the variable exists in any of the independent record groups
                data.independent_data.iter().all(|group|
                    group.iter().any(|ind_record| {
                        match ind_record.values.get(var_name) {
                            Some(DataValue::Number(val)) => val.is_nan(),
                            Some(DataValue::Text(s)) => s.trim().is_empty(),
                            Some(DataValue::Null) => true,
                            None => true,
                            _ => false,
                        }
                    })
                )
            });

            if has_missing_group && has_missing_disc {
                both_missing += 1;
            } else if has_missing_group {
                missing_group_codes += 1;
            } else if has_missing_disc {
                missing_disc_vars += 1;
            }
        }
    }

    let excluded_cases = missing_group_codes + missing_disc_vars + both_missing;
    let valid_cases = total_cases - excluded_cases;

    let calc_percent = |value: usize| -> f64 {
        if total_cases == 0 { 0.0 } else { ((value as f64) * 100.0) / (total_cases as f64) }
    };

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

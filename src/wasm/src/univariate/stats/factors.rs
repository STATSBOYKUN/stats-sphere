use std::collections::HashMap;

use crate::univariate::models::{
    config::UnivariateConfig,
    data::{ AnalysisData, DataRecord, DataValue },
};

/// Get factor combinations for analysis
pub fn get_factor_combinations(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Vec<HashMap<String, String>>, String> {
    let mut combinations = Vec::new();

    if let Some(factor_str) = &config.main.fix_factor {
        let factors: Vec<&str> = factor_str
            .split(',')
            .map(|s| s.trim())
            .collect();

        if factors.is_empty() {
            return Ok(vec![HashMap::new()]);
        }

        // Get levels for each factor
        let mut factor_levels = Vec::new();
        for factor in &factors {
            factor_levels.push(get_factor_levels(data, factor)?);
        }

        // Generate all combinations
        pub fn generate_combinations(
            current: &mut HashMap<String, String>,
            factors: &[&str],
            levels: &[Vec<String>],
            index: usize,
            result: &mut Vec<HashMap<String, String>>
        ) {
            if index == factors.len() {
                result.push(current.clone());
                return;
            }

            for level in &levels[index] {
                current.insert(factors[index].to_string(), level.clone());
                generate_combinations(current, factors, levels, index + 1, result);
            }
        }

        let mut current = HashMap::new();
        generate_combinations(&mut current, &factors, &factor_levels, 0, &mut combinations);
    } else {
        combinations.push(HashMap::new()); // No factors case
    }

    Ok(combinations)
}

/// Get factor levels from the data
pub fn get_factor_levels(data: &AnalysisData, factor: &str) -> Result<Vec<String>, String> {
    let mut levels = Vec::new();
    let mut level_set = std::collections::HashSet::new();

    for (i, factor_defs) in data.fix_factor_data_defs.iter().enumerate() {
        for factor_def in factor_defs {
            if factor_def.name == factor {
                // Found our factor, extract levels
                for records in &data.fix_factor_data[i] {
                    for record in records {
                        if let Some(value) = record.values.get(factor) {
                            let level = match value {
                                DataValue::Number(n) => n.to_string(),
                                DataValue::Text(t) => t.clone(),
                                DataValue::Boolean(b) => b.to_string(),
                                DataValue::Null => "null".to_string(),
                            };

                            if !level_set.contains(&level) {
                                level_set.insert(level.clone());
                                levels.push(level);
                            }
                        }
                    }
                }

                return Ok(levels);
            }
        }
    }

    Err(format!("Factor '{}' not found in the data", factor))
}

/// Check if a record matches a particular factor combination
pub fn matches_combination(
    record: &DataRecord,
    combo: &HashMap<String, String>,
    data: &AnalysisData,
    config: &UnivariateConfig
) -> bool {
    for (factor, level) in combo {
        let mut found = false;

        for (key, value) in &record.values {
            if key == factor {
                let record_level = match value {
                    DataValue::Number(n) => n.to_string(),
                    DataValue::Text(t) => t.clone(),
                    DataValue::Boolean(b) => b.to_string(),
                    DataValue::Null => "null".to_string(),
                };

                if record_level != *level {
                    return false;
                }

                found = true;
                break;
            }
        }

        if !found {
            return false;
        }
    }

    true
}

/// Extract dependent variable value from a record
pub fn extract_dependent_value(record: &DataRecord, dep_var_name: &str) -> Option<f64> {
    for (key, value) in &record.values {
        if key == dep_var_name {
            match value {
                DataValue::Number(n) => {
                    return Some(*n);
                }
                _ => {
                    return None;
                }
            }
        }
    }

    None
}

/// Get values for a specific factor level in the dependent variable
pub fn get_level_values(
    data: &AnalysisData,
    factor: &str,
    level: &str,
    dep_var_name: &str
) -> Result<Vec<f64>, String> {
    let mut values = Vec::new();

    for records in &data.dependent_data {
        for record in records {
            let mut matches = false;

            for (key, value) in &record.values {
                if key == factor {
                    let record_level = match value {
                        DataValue::Number(n) => n.to_string(),
                        DataValue::Text(t) => t.clone(),
                        DataValue::Boolean(b) => b.to_string(),
                        DataValue::Null => "null".to_string(),
                    };

                    matches = record_level == *level;
                    break;
                }
            }

            if matches {
                if let Some(value) = extract_dependent_value(record, dep_var_name) {
                    values.push(value);
                }
            }
        }
    }

    Ok(values)
}

/// Get values adjusted for previous factors (for Type I SS)
pub fn get_level_values_adjusted(
    values: &[f64],
    data: &AnalysisData,
    factor: &str,
    level: &str,
    dep_var_name: &str
) -> Result<Vec<f64>, String> {
    let mut level_values = Vec::new();
    let mut i = 0;

    for records in &data.dependent_data {
        for record in records {
            if i >= values.len() {
                continue;
            }

            let mut matches = false;

            for (key, value) in &record.values {
                if key == factor {
                    let record_level = match value {
                        DataValue::Number(n) => n.to_string(),
                        DataValue::Text(t) => t.clone(),
                        DataValue::Boolean(b) => b.to_string(),
                        DataValue::Null => "null".to_string(),
                    };

                    matches = record_level == *level;
                    break;
                }
            }

            if matches {
                level_values.push(values[i]);
            }

            i += 1;
        }
    }

    Ok(level_values)
}

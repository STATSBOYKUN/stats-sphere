use std::collections::HashMap;

use crate::univariate::models::{
    config::UnivariateConfig,
    data::{ AnalysisData, DataValue },
    result::BetweenSubjectFactors,
};

/// Process basic data summary - always executed
pub fn basic_processing_summary(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<HashMap<String, BetweenSubjectFactors>>, String> {
    if data.fix_factor_data.is_empty() {
        return Ok(None);
    }

    let mut result = HashMap::new();
    let factor_names = match &config.main.fix_factor {
        Some(names) =>
            names
                .split(',')
                .map(|s| s.trim().to_string())
                .collect::<Vec<String>>(),
        None => {
            return Err("No fixed factors specified in configuration".to_string());
        }
    };

    for (i, factor_name) in factor_names.iter().enumerate() {
        if i >= data.fix_factor_data.len() {
            continue;
        }

        let mut level_counts = HashMap::new();
        for records in &data.fix_factor_data[i] {
            for record in records {
                for (key, value) in &record.values {
                    if key == factor_name {
                        let level = match value {
                            DataValue::Number(n) => n.to_string(),
                            DataValue::Text(t) => t.clone(),
                            DataValue::Boolean(b) => b.to_string(),
                            DataValue::Null => "null".to_string(),
                        };
                        *level_counts.entry(level).or_insert(0) += 1;
                    }
                }
            }
        }

        result.insert(factor_name.clone(), BetweenSubjectFactors { factors: level_counts });
    }

    Ok(Some(result))
}

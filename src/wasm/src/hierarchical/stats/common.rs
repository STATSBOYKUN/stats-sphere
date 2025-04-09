// stats_utils.rs
use statrs::statistics::{ Data, Distribution, Max, Min };
use std::collections::HashMap;
use crate::hierarchical::models::{ config::ClusterConfig, data::{ AnalysisData, DataValue } };

pub struct DataStats {
    pub mean: f64,
    pub std_dev: f64,
    pub min: f64,
    pub max: f64,
    pub range: f64,
    pub abs_max: f64,
}

pub fn calculate_statistics(values: &[f64]) -> DataStats {
    if values.is_empty() {
        return DataStats {
            mean: 0.0,
            std_dev: 1.0,
            min: 0.0,
            max: 0.0,
            range: 1.0,
            abs_max: 1.0,
        };
    }

    let data = Data::new(values.to_vec());
    // Safely unwrap Option values with defaults
    let mean = data.mean().unwrap_or(0.0);
    let std_dev = data.std_dev().unwrap_or(1.0);
    let min = data.min();
    let max = data.max();
    let range = max - min;
    let abs_max = values
        .iter()
        .map(|x| x.abs())
        .fold(0.0, f64::max);

    DataStats {
        mean,
        std_dev,
        min,
        max,
        range,
        abs_max,
    }
}

pub fn extract_numeric_values(case: &HashMap<String, DataValue>, variables: &[String]) -> Vec<f64> {
    variables
        .iter()
        .filter_map(|var| {
            if let Some(DataValue::Number(val)) = case.get(var) { Some(*val) } else { None }
        })
        .collect()
}

// Updated extract_case_label function that produces labels in the format "{case_number} {label_value}"
pub fn extract_case_label(data: &AnalysisData, config: &ClusterConfig, case_idx: usize) -> String {
    let case_number = case_idx + 1;
    let mut label_value = String::new();

    if let Some(label_var) = &config.main.label_cases {
        // Try to find the label in label data
        for dataset in &data.label_data {
            if case_idx < dataset.len() {
                if let Some(value) = dataset[case_idx].values.get(label_var) {
                    match value {
                        DataValue::Text(text) => {
                            label_value = text.clone();
                            break;
                        }
                        DataValue::Number(num) => {
                            label_value = num.to_string();
                            break;
                        }
                        _ => {}
                    }
                }
            }
        }
    }

    if label_value.is_empty() {
        // If no label value was found, just use the case number
        format!("Case {}", case_number)
    } else {
        // Format as "{case_number} {label_value}"
        format!("{}: {}", case_number, label_value)
    }
}

pub fn euclidean_distance(v1: &[f64], v2: &[f64]) -> f64 {
    v1.iter()
        .zip(v2.iter())
        .map(|(a, b)| (a - b).powi(2))
        .sum::<f64>()
        .sqrt()
}

pub fn squared_euclidean_distance(v1: &[f64], v2: &[f64]) -> f64 {
    v1.iter()
        .zip(v2.iter())
        .map(|(a, b)| (a - b).powi(2))
        .sum()
}

pub fn manhattan_distance(v1: &[f64], v2: &[f64]) -> f64 {
    v1.iter()
        .zip(v2.iter())
        .map(|(a, b)| (a - b).abs())
        .sum()
}

pub fn chebyshev_distance(v1: &[f64], v2: &[f64]) -> f64 {
    v1.iter()
        .zip(v2.iter())
        .map(|(a, b)| (a - b).abs())
        .fold(0.0, f64::max)
}

pub fn minkowski_distance(v1: &[f64], v2: &[f64], p: f64) -> f64 {
    v1.iter()
        .zip(v2.iter())
        .map(|(a, b)| (a - b).abs().powf(p))
        .sum::<f64>()
        .powf(1.0 / p)
}

pub fn power_distance(v1: &[f64], v2: &[f64], p: f64, r: f64) -> f64 {
    v1.iter()
        .zip(v2.iter())
        .map(|(a, b)| (a - b).abs().powf(p))
        .sum::<f64>()
        .powf(1.0 / r)
}

pub fn cosine_similarity(v1: &[f64], v2: &[f64]) -> f64 {
    let dot_product: f64 = v1
        .iter()
        .zip(v2.iter())
        .map(|(a, b)| a * b)
        .sum();

    let mag1: f64 = v1
        .iter()
        .map(|x| x.powi(2))
        .sum::<f64>()
        .sqrt();
    let mag2: f64 = v2
        .iter()
        .map(|x| x.powi(2))
        .sum::<f64>()
        .sqrt();

    if mag1 > 0.0 && mag2 > 0.0 {
        dot_product / (mag1 * mag2)
    } else {
        0.0
    }
}

pub fn correlation_distance(v1: &[f64], v2: &[f64]) -> f64 {
    let n = v1.len() as f64;
    if n == 0.0 {
        return 1.0;
    }

    let data1 = Data::new(v1.to_vec());
    let data2 = Data::new(v2.to_vec());

    // Safely unwrap Option values with defaults
    let mean1 = data1.mean().unwrap_or(0.0);
    let mean2 = data2.mean().unwrap_or(0.0);

    let mut numerator = 0.0;
    let mut denom1 = 0.0;
    let mut denom2 = 0.0;

    for (&x, &y) in v1.iter().zip(v2.iter()) {
        let x_dev = x - mean1;
        let y_dev = y - mean2;
        numerator += x_dev * y_dev;
        denom1 += x_dev.powi(2);
        denom2 += y_dev.powi(2);
    }

    if denom1 > 0.0 && denom2 > 0.0 {
        1.0 - numerator / (denom1.sqrt() * denom2.sqrt())
    } else {
        1.0
    }
}

// Binary distance functions
pub fn compute_contingency_table(
    values1: &[f64],
    values2: &[f64],
    present_val: f64
) -> (f64, f64, f64, f64) {
    let mut a = 0.0; // Both present
    let mut b = 0.0; // Present in values1, absent in values2
    let mut c = 0.0; // Absent in values1, present in values2
    let mut d = 0.0; // Both absent

    for (&val1, &val2) in values1.iter().zip(values2.iter()) {
        match (val1 == present_val, val2 == present_val) {
            (true, true) => {
                a += 1.0;
            }
            (true, false) => {
                b += 1.0;
            }
            (false, true) => {
                c += 1.0;
            }
            (false, false) => {
                d += 1.0;
            }
        }
    }

    (a, b, c, d)
}

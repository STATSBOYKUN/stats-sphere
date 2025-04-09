// calculate_distance.rs
use std::collections::HashMap;
use crate::hierarchical::models::{
    config::{ ClusterConfig, IntervalMethod, CountsMethod, BinaryMethod },
    data::DataValue,
};
use super::core::{
    chebyshev_distance,
    compute_contingency_table,
    correlation_distance,
    cosine_similarity,
    euclidean_distance,
    manhattan_distance,
    minkowski_distance,
    power_distance,
    squared_euclidean_distance,
};

pub fn calculate_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    config: &ClusterConfig
) -> f64 {
    if config.method.interval {
        calculate_interval_distance(case1, case2, variables, &config.method.interval_method, config)
    } else if config.method.counts {
        calculate_counts_distance(case1, case2, variables, &config.method.counts_method, config)
    } else if config.method.binary {
        calculate_binary_distance(case1, case2, variables, &config.method.binary_method, config)
    } else {
        // Default to squared Euclidean distance
        calculate_interval_distance(
            case1,
            case2,
            variables,
            &IntervalMethod::SquaredEuclidean,
            config
        )
    }
}

fn extract_numeric_values(case: &HashMap<String, DataValue>, variables: &[String]) -> Vec<f64> {
    variables
        .iter()
        .filter_map(|var| {
            if let Some(DataValue::Number(val)) = case.get(var) { Some(*val) } else { None }
        })
        .collect()
}

fn calculate_interval_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    measure: &IntervalMethod,
    config: &ClusterConfig
) -> f64 {
    let values1 = extract_numeric_values(case1, variables);
    let values2 = extract_numeric_values(case2, variables);

    compute_interval_distance(&values1, &values2, measure, config)
}

fn calculate_counts_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    method: &CountsMethod,
    _config: &ClusterConfig
) -> f64 {
    let values1 = extract_numeric_values(case1, variables);
    let values2 = extract_numeric_values(case2, variables);

    compute_counts_distance(&values1, &values2, method)
}

fn calculate_binary_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    method: &BinaryMethod,
    config: &ClusterConfig
) -> f64 {
    let values1 = extract_numeric_values(case1, variables);
    let values2 = extract_numeric_values(case2, variables);

    compute_binary_distance(&values1, &values2, method, config)
}

pub fn calculate_variable_distance(
    variable_values: &HashMap<String, Vec<f64>>,
    var1: &str,
    var2: &str,
    config: &ClusterConfig
) -> f64 {
    if let (Some(values1), Some(values2)) = (variable_values.get(var1), variable_values.get(var2)) {
        if config.method.interval {
            compute_interval_distance(values1, values2, &config.method.interval_method, config)
        } else if config.method.counts {
            compute_counts_distance(values1, values2, &config.method.counts_method)
        } else if config.method.binary {
            compute_binary_distance(values1, values2, &config.method.binary_method, config)
        } else {
            // Default to squared Euclidean
            compute_interval_distance(values1, values2, &IntervalMethod::SquaredEuclidean, config)
        }
    } else {
        0.0 // Default if no values found
    }
}

// Simplified distance calculation functions
pub fn compute_interval_distance(
    values1: &[f64],
    values2: &[f64],
    measure: &IntervalMethod,
    config: &ClusterConfig
) -> f64 {
    match measure {
        IntervalMethod::SquaredEuclidean => squared_euclidean_distance(values1, values2),
        IntervalMethod::Euclidean => euclidean_distance(values1, values2),
        IntervalMethod::Manhattan => manhattan_distance(values1, values2),
        IntervalMethod::Chebychev => chebyshev_distance(values1, values2),
        IntervalMethod::Correlation => correlation_distance(values1, values2),
        IntervalMethod::Cosine => 1.0 - cosine_similarity(values1, values2),
        IntervalMethod::Minkowski => {
            let p = config.method.power.parse::<f64>().unwrap_or(2.0);
            minkowski_distance(values1, values2, p)
        }
        IntervalMethod::Customized => {
            let p = config.method.power.parse::<f64>().unwrap_or(2.0);
            let r = config.method.root.parse::<f64>().unwrap_or(2.0);
            power_distance(values1, values2, p, r)
        }
    }
}

fn compute_counts_distance(values1: &[f64], values2: &[f64], method: &CountsMethod) -> f64 {
    match method {
        CountsMethod::CHISQ => {
            let mut chisq_sum = 0.0;
            for (val1, val2) in values1.iter().zip(values2.iter()) {
                let e_x = (val1 + val2) / 2.0;
                if e_x != 0.0 {
                    chisq_sum += (val1 - e_x).powi(2) / e_x;
                    chisq_sum += (val2 - e_x).powi(2) / e_x;
                }
            }
            chisq_sum.sqrt()
        }
        CountsMethod::PH2 => {
            let n = values1.len() as f64;
            let mut chisq_sum = 0.0;

            for (val1, val2) in values1.iter().zip(values2.iter()) {
                let e_x = (val1 + val2) / 2.0;
                if e_x != 0.0 {
                    chisq_sum += (val1 - e_x).powi(2) / e_x;
                    chisq_sum += (val2 - e_x).powi(2) / e_x;
                }
            }

            if n > 0.0 {
                chisq_sum / n.sqrt()
            } else {
                0.0
            }
        }
    }
}

fn compute_binary_distance(
    values1: &[f64],
    values2: &[f64],
    method: &BinaryMethod,
    config: &ClusterConfig
) -> f64 {
    // Build the 2x2 contingency table (a, b, c, d)
    let (a, b, c, d) = compute_contingency_table(values1, values2, config.method.present as f64);

    // Apply the appropriate formula based on the method
    match method {
        BinaryMethod::BSEUCLID => b + c,
        BinaryMethod::SIZE => (b - c).powi(2) / (a + b + c + d).powi(2),
        BinaryMethod::PATTERN => (b * c) / (a + b + c + d).powi(2),
        BinaryMethod::VARIANCE => (b + c) / (4.0 * (a + b + c + d)),
        BinaryMethod::DISPER => (a * d - b * c) / (a + b + c + d).powi(2),
        BinaryMethod::BSHAPE =>
            ((a + b + c + d) * (b + c) - (b - c).powi(2)) / (a + b + c + d).powi(2),
        BinaryMethod::SM => (a + d) / (a + b + c + d),
        BinaryMethod::PHI => (a * d - b * c) / ((a + b) * (a + c) * (b + d) * (c + d)).sqrt(),
        BinaryMethod::LAMBDA => {
            let t1 = a.max(b).max(c.max(d)) + (a + c).max(b + d);
            let t2 = (a + b).max(c + d) + (a + c).max(b + d);
            if t2 > 0.0 {
                (t1 - t2) / (2.0 * (a + b + c + d) - t2)
            } else {
                0.0
            }
        }
        BinaryMethod::D => {
            let t1 = a.max(b).max(c.max(d)) + (a + c).max(b + d);
            let t2 = (a + b).max(c + d) + (a + c).max(b + d);
            if a + b + c + d > 0.0 {
                (t1 - t2) / (2.0 * (a + b + c + d))
            } else {
                0.0
            }
        }
        BinaryMethod::DICE => (2.0 * a) / (2.0 * a + b + c),
        BinaryMethod::HAMANN => (a + d - (b + c)) / (a + b + c + d),
        BinaryMethod::JACCARD => a / (a + b + c),
        BinaryMethod::K1 => if b + c > 0.0 { a / (b + c) } else { 9999.999 }
        BinaryMethod::K2 => (a / (a + b) + a / (a + c)) / 2.0,
        BinaryMethod::BLWMN => (b + c) / (2.0 * a + b + c),
        BinaryMethod::OCHIAI => a / ((a + b) * (a + c)).sqrt(),
        BinaryMethod::RT => (a + d) / (a + d + 2.0 * (b + c)),
        BinaryMethod::RR => a / (a + b + c + d),
        BinaryMethod::SS1 => (2.0 * (a + d)) / (2.0 * (a + d) + b + c),
        BinaryMethod::SS2 => a / (a + 2.0 * (b + c)),
        BinaryMethod::SS3 => if b + c > 0.0 { (a + d) / (b + c) } else { 9999.999 }
        BinaryMethod::SS4 => (a / (a + b) + a / (a + c) + d / (b + d) + d / (c + d)) / 4.0,
        BinaryMethod::Y => ((a * d).sqrt() - (b * c).sqrt()) / ((a * d).sqrt() + (b * c).sqrt()),
        BinaryMethod::Q => if a * d + b * c > 0.0 { (a * d - b * c) / (a * d + b * c) } else { 0.0 }
    }
}

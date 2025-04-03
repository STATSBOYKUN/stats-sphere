use std::collections::HashMap;
use crate::hierarchical::models::{
    config::{ ClusterConfig, IntervalMethod, CountsMethod, BinaryMethod },
    data::DataValue,
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

fn calculate_interval_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    measure: &IntervalMethod,
    config: &ClusterConfig
) -> f64 {
    // Extract the values as vectors
    let mut values1 = Vec::new();
    let mut values2 = Vec::new();
    for var in variables {
        if
            let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                case1.get(var),
                case2.get(var),
            )
        {
            values1.push(*val1);
            values2.push(*val2);
        }
    }

    compute_interval_distance(&values1, &values2, measure, config)
}

fn calculate_counts_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    method: &CountsMethod,
    _config: &ClusterConfig
) -> f64 {
    // Extract the values as vectors
    let mut values1 = Vec::new();
    let mut values2 = Vec::new();
    for var in variables {
        if
            let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                case1.get(var),
                case2.get(var),
            )
        {
            values1.push(*val1);
            values2.push(*val2);
        }
    }

    compute_counts_distance(&values1, &values2, method)
}

fn calculate_binary_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    method: &BinaryMethod,
    config: &ClusterConfig
) -> f64 {
    // Extract the values as vectors
    let mut values1 = Vec::new();
    let mut values2 = Vec::new();
    for var in variables {
        if
            let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                case1.get(var),
                case2.get(var),
            )
        {
            values1.push(*val1);
            values2.push(*val2);
        }
    }

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

// Generic functions to compute distances given value vectors
fn compute_interval_distance(
    values1: &[f64],
    values2: &[f64],
    measure: &IntervalMethod,
    config: &ClusterConfig
) -> f64 {
    let mut distance = 0.0;
    match measure {
        IntervalMethod::SquaredEuclidean => {
            for (val1, val2) in values1.iter().zip(values2.iter()) {
                distance += (val1 - val2).powi(2);
            }
        }
        IntervalMethod::Euclidean => {
            for (val1, val2) in values1.iter().zip(values2.iter()) {
                distance += (val1 - val2).powi(2);
            }
            distance = distance.sqrt();
        }
        IntervalMethod::Manhattan => {
            for (val1, val2) in values1.iter().zip(values2.iter()) {
                distance += (val1 - val2).abs();
            }
        }
        IntervalMethod::Chebychev => {
            for (val1, val2) in values1.iter().zip(values2.iter()) {
                let diff = (val1 - val2).abs();
                distance = distance.max(diff);
            }
        }
        IntervalMethod::Correlation => {
            // Correlation as a distance measure
            let n = values1.len() as f64;

            let sum_x: f64 = values1.iter().sum();
            let sum_y: f64 = values2.iter().sum();

            let sum_xy: f64 = values1
                .iter()
                .zip(values2.iter())
                .map(|(x, y)| x * y)
                .sum();

            let sum_x2: f64 = values1
                .iter()
                .map(|x| x.powi(2))
                .sum();
            let sum_y2: f64 = values2
                .iter()
                .map(|y| y.powi(2))
                .sum();

            let numerator = sum_xy - (sum_x * sum_y) / n;
            let denominator = ((sum_x2 - sum_x.powi(2) / n) * (sum_y2 - sum_y.powi(2) / n)).sqrt();

            if denominator != 0.0 {
                distance = 1.0 - numerator / denominator;
            } else {
                distance = 1.0; // Maximum distance when correlation is undefined
            }
        }
        IntervalMethod::Cosine => {
            let mut dot_product = 0.0;
            let mut mag1 = 0.0;
            let mut mag2 = 0.0;

            for (val1, val2) in values1.iter().zip(values2.iter()) {
                dot_product += val1 * val2;
                mag1 += val1.powi(2);
                mag2 += val2.powi(2);
            }

            if mag1 > 0.0 && mag2 > 0.0 {
                distance = 1.0 - dot_product / (mag1.sqrt() * mag2.sqrt());
            } else {
                distance = 1.0; // Maximum distance when vectors are zero
            }
        }
        IntervalMethod::Minkowski => {
            let p = match config.method.power.parse::<f64>() {
                Ok(val) => val,
                Err(_) => 2.0, // Default to Euclidean
            };

            for (val1, val2) in values1.iter().zip(values2.iter()) {
                distance += (val1 - val2).abs().powf(p);
            }

            distance = distance.powf(1.0 / p);
        }
        IntervalMethod::Customized => {
            let p = match config.method.power.parse::<f64>() {
                Ok(val) => val,
                Err(_) => 2.0,
            };

            let r = match config.method.root.parse::<f64>() {
                Ok(val) => val,
                Err(_) => 2.0,
            };

            for (val1, val2) in values1.iter().zip(values2.iter()) {
                distance += (val1 - val2).abs().powf(p);
            }

            distance = distance.powf(1.0 / r);
        }
    }

    distance
}

fn compute_counts_distance(values1: &[f64], values2: &[f64], method: &CountsMethod) -> f64 {
    match method {
        CountsMethod::CHISQ => {
            let mut chisq_sum = 0.0;
            for (val1, val2) in values1.iter().zip(values2.iter()) {
                // Expected values under independence model
                let e_x = (val1 + val2) / 2.0;

                if e_x != 0.0 {
                    chisq_sum += (val1 - e_x).powi(2) / e_x;
                    chisq_sum += (val2 - e_x).powi(2) / e_x;
                }
            }

            chisq_sum.sqrt()
        }
        CountsMethod::PH2 => {
            let mut chisq_sum = 0.0;
            let n = values1.len() as f64;

            for (val1, val2) in values1.iter().zip(values2.iter()) {
                // Expected values under independence model
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
    let (a, b, c, d) = compute_contingency_table(values1, values2, config);
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

// Helper function to compute the contingency table for binary data
fn compute_contingency_table(
    values1: &[f64],
    values2: &[f64],
    config: &ClusterConfig
) -> (f64, f64, f64, f64) {
    let present_val = config.method.present as f64;
    let mut a = 0.0; // Both present
    let mut b = 0.0; // Present in values1, absent in values2
    let mut c = 0.0; // Absent in values1, present in values2
    let mut d = 0.0; // Both absent

    for (val1, val2) in values1.iter().zip(values2.iter()) {
        let is_present1 = *val1 == present_val;
        let is_present2 = *val2 == present_val;

        if is_present1 && is_present2 {
            a += 1.0;
        } else if is_present1 && !is_present2 {
            b += 1.0;
        } else if !is_present1 && is_present2 {
            c += 1.0;
        } else {
            d += 1.0;
        }
    }

    (a, b, c, d)
}

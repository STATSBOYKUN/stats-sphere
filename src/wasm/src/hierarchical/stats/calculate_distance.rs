use std::collections::HashMap;
use crate::hierarchical::models::{ config::{ ClusterConfig, IntervalMethod }, data::DataValue };

pub fn calculate_distance(
    case1: &HashMap<String, DataValue>,
    case2: &HashMap<String, DataValue>,
    variables: &[String],
    measure: &IntervalMethod,
    config: &ClusterConfig
) -> f64 {
    let mut distance = 0.0;
    match measure {
        IntervalMethod::SquaredEuclidean => {
            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    distance += (val1 - val2).powi(2);
                }
            }
        }
        IntervalMethod::Euclidean => {
            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    distance += (val1 - val2).powi(2);
                }
            }
            distance = distance.sqrt();
        }
        IntervalMethod::Manhattan => {
            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    distance += (val1 - val2).abs();
                }
            }
        }
        IntervalMethod::Chebychev => {
            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    let diff = (val1 - val2).abs();
                    distance = distance.max(diff);
                }
            }
        }
        IntervalMethod::Cosine => {
            let mut dot_product = 0.0;
            let mut norm1 = 0.0;
            let mut norm2 = 0.0;

            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    dot_product += val1 * val2;
                    norm1 += val1.powi(2);
                    norm2 += val2.powi(2);
                }
            }

            if norm1 > 0.0 && norm2 > 0.0 {
                distance = 1.0 - dot_product / (norm1.sqrt() * norm2.sqrt());
            } else {
                distance = 1.0;
            }
        }
        IntervalMethod::Correlation => {
            let mut sum_x = 0.0;
            let mut sum_y = 0.0;
            let mut sum_xy = 0.0;
            let mut sum_x_sq = 0.0;
            let mut sum_y_sq = 0.0;
            let mut n = 0.0;

            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    sum_x += val1;
                    sum_y += val2;
                    sum_xy += val1 * val2;
                    sum_x_sq += val1.powi(2);
                    sum_y_sq += val2.powi(2);
                    n += 1.0;
                }
            }

            if n > 0.0 {
                let numerator = sum_xy - (sum_x * sum_y) / n;
                let denominator = (
                    (sum_x_sq - sum_x.powi(2) / n) *
                    (sum_y_sq - sum_y.powi(2) / n)
                ).sqrt();

                if denominator != 0.0 {
                    distance = 1.0 - numerator / denominator;
                } else {
                    distance = 1.0;
                }
            } else {
                distance = 1.0;
            }
        }
        IntervalMethod::Minkowski => {
            let p = match config.method.power.parse::<f64>() {
                Ok(val) => val,
                Err(_) => 2.0,
            };

            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    distance += (val1 - val2).abs().powf(p);
                }
            }

            if p != 0.0 {
                distance = distance.powf(1.0 / p);
            }
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

            for var in variables {
                if
                    let (Some(DataValue::Number(val1)), Some(DataValue::Number(val2))) = (
                        case1.get(var),
                        case2.get(var),
                    )
                {
                    distance += (val1 - val2).abs().powf(p);
                }
            }

            if r != 0.0 {
                distance = distance.powf(1.0 / r);
            }
        }
    }

    distance
}

pub fn calculate_variable_distance(
    variable_values: &HashMap<String, Vec<f64>>,
    var1: &str,
    var2: &str,
    config: &ClusterConfig
) -> f64 {
    if let (Some(values1), Some(values2)) = (variable_values.get(var1), variable_values.get(var2)) {
        let mut distance = 0.0;

        match config.method.interval_method {
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
                let denominator = (
                    (sum_x2 - sum_x.powi(2) / n) *
                    (sum_y2 - sum_y.powi(2) / n)
                ).sqrt();

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
    } else {
        0.0 // Default if no values found
    }
}

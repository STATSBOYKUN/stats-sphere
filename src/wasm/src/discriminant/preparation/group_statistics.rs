use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use std::collections::HashMap;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct RangeStats {
    count_in_group: Vec<u32>,       // Jumlah kemunculan per independent group
    valid_in_independent: Vec<u32>, // Jumlah nilai valid per independent group
    indices_found: Vec<Vec<usize>>, // Indeks-indeks tempat nilai ditemukan
}

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct Statistics {
    total_cases_per_group: Vec<u32>, // Total kasus per independent group
    total_cases_all: u32,            // Total semua kasus
    ranges: HashMap<i64, RangeStats>, // Menyimpan statistik untuk setiap rentang
}

#[wasm_bindgen]
pub fn group_statistics(group_variable: JsValue, independent_variable: JsValue, min_range: f64, max_range: f64) -> JsValue {
    // Deserialize input data
    let mut group_data: Vec<Vec<HashMap<String, Value>>> = group_variable.into_serde().unwrap_or_default();
    let independent_data: Vec<Vec<HashMap<String, Value>>> = independent_variable.into_serde().unwrap_or_default();

    // Pastikan jumlah grup sama
    if group_data.len() != independent_data.len() {
        let new_group_data: Vec<Vec<HashMap<String, Value>>> = (0..independent_data.len())
            .map(|_| group_data.clone().into_iter().flatten().collect())
            .collect();

        group_data = new_group_data;
    }

    let min_range = min_range.round() as i64;
    let max_range = max_range.round() as i64;

    let mut ranges_stats: HashMap<i64, RangeStats> = HashMap::new();
    let mut total_cases_per_group = vec![0; independent_data.len()];
    let mut total_cases_all = 0;

    for range in min_range..=max_range {
        let mut count_in_group = vec![0; independent_data.len()];
        let mut valid_in_independent = vec![0; independent_data.len()];
        let mut indices_found: Vec<Vec<usize>> = vec![vec![]; independent_data.len()];

        // Iterasi untuk setiap independent group
        for group_index in 0..group_data.len() {
            let mut indices_for_group: Vec<usize> = vec![];

            let group = &group_data[group_index];
            let independent = &independent_data[group_index];

            for (item_index, group_item) in group.iter().enumerate() {
                let group_value: Option<i64> = group_item.values().find_map(|v| {
                    if let Value::Number(n) = v {
                        Some(n.as_i64().unwrap_or(0))
                    } else {
                        None
                    }
                });

                if let Some(value) = group_value {
                    if value == range {
                        count_in_group[group_index] += 1;

                        if let Some(independent_item) = independent.get(item_index) {
                            let is_valid = independent_item.values().any(|v| {
                                if let Value::Number(n) = v {
                                    !n.as_f64().unwrap_or(f64::NAN).is_nan()
                                } else {
                                    false
                                }
                            });

                            if is_valid {
                                valid_in_independent[group_index] += 1;
                                indices_for_group.push(item_index);
                            }
                        }
                    }
                }
            }

            if !indices_for_group.is_empty() {
                indices_found[group_index] = indices_for_group;
            }
        }

        if count_in_group.iter().any(|&count| count > 0) || valid_in_independent.iter().any(|&valid| valid > 0) {
            ranges_stats.insert(
                range,
                RangeStats {
                    count_in_group: count_in_group.clone(),
                    valid_in_independent: valid_in_independent.clone(),
                    indices_found: indices_found.clone(),
                },
            );

            for i in 0..count_in_group.len() {
                total_cases_per_group[i] += count_in_group[i];
            }
        }
    }

    total_cases_all = total_cases_per_group.iter().sum();

    JsValue::from_serde(&Statistics {
        total_cases_per_group,
        total_cases_all,
        ranges: ranges_stats,
    })
    .unwrap()
}
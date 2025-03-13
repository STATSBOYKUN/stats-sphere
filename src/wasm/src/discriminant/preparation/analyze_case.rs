use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use std::collections::HashMap;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct SlicedData {
    valid_cases: u32,
    excluded_cases: u32,
    total_cases: u32,
}

#[wasm_bindgen]
pub fn check_sliced_data(sliced_data: JsValue) -> JsValue {
    // Convert JsValue into a Vec<Vec<HashMap<String, Value>>>
    let data: Vec<Vec<HashMap<String, Value>>> = sliced_data.into_serde().unwrap_or_default();

    let mut valid_cases = 0;
    let mut excluded_cases = 0;

    for row in data {
        for item in row {
            // Extract the first numeric field from the object
            let mut found_value = None;
            for value in item.values() {
                if let Some(num) = value.as_f64() {
                    found_value = Some(num);
                    break; // Stop after finding the first numeric value
                }
            }

            match found_value {
                Some(_) => valid_cases += 1,  // Valid if it's a number
                None => excluded_cases += 1,  // Excluded if no number is found
            }
        }
    }

    let total_cases = valid_cases + excluded_cases;

    let result = SlicedData {
        valid_cases,
        excluded_cases,
        total_cases,
    };

    JsValue::from_serde(&result).unwrap()
}
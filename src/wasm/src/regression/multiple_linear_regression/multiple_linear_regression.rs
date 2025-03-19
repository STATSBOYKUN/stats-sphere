// Removed js_sys::Boolean as it is not used anymore
use wasm_bindgen::prelude::*;
use serde_wasm_bindgen::{to_value, from_value}; // Untuk mengonversi ke dan dari JsValue
use serde::{Serialize, Deserialize}; // Untuk serialisasi

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct MultipleLinearRegression {
    x: Vec<Vec<f64>>,
    y: Vec<f64>,
    y_prediction: Vec<f64>,
    beta: Vec<f64>,
    constant: bool,
}

#[wasm_bindgen]
impl MultipleLinearRegression {
    #[wasm_bindgen(constructor)]
    pub fn new(x:JsValue, y: Vec<f64>) -> MultipleLinearRegression {
        let x: Vec<Vec<f64>> = from_value(x).unwrap(); 
        MultipleLinearRegression {
            x,
            y,
            y_prediction: Vec::new(),
            beta: Vec::new(),
            constant: true,
        }
    }

    #[wasm_bindgen(getter)]
    pub fn get_x(&self) -> JsValue {
        to_value(&self.x).unwrap() // Mengonversi ke JsValue agar bisa dikembalikan ke JavaScript
    }
    pub fn get_y(&self) -> Vec<f64> {
        self.y.clone()
    }
    pub fn get_y_prediction(&self) -> Vec<f64> {
        self.y_prediction.clone()
    }
    pub fn get_beta(&self) -> Vec<f64> {
        self.beta.clone()
    }
    pub fn get_constant(&self) -> bool {
        self.constant.clone()
    }

    // Setters
    pub fn set_y_prediction(&mut self, y_prediction: Vec<f64>) {
        self.y_prediction = y_prediction;
    }
    pub fn set_beta(&mut self, beta: Vec<f64>) {
        self.beta = beta;
    }
    pub fn set_constant(&mut self, constant: bool) {
        self.constant = constant;
    }
}
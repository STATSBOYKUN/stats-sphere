use wasm_bindgen::prelude::*;
use crate::SimpleLinearRegression;

#[wasm_bindgen]
impl SimpleLinearRegression {
    pub fn calculate_standard_error(&self) -> f64 {
        // Initialize the variables
        let y_values: Vec<f64> = self.get_y().clone();
        let y_prediction: Vec<f64> = self.get_y_prediction().clone();
        let n:usize = y_values.len();

        let e_2: Vec<f64> = y_values.iter().zip(y_prediction.iter()).map(|(y, y_hat)| (y - y_hat).powi(2)).collect();
        let sse: f64 = e_2.iter().sum();
        let mse: f64 = sse / (n as f64 - 2.0);
        let se: f64 = mse.sqrt();
        se
    }
}
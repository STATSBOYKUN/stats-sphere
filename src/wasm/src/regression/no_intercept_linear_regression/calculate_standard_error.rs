use wasm_bindgen::prelude::*;
use crate::NoInterceptLinearRegression;

#[wasm_bindgen]
impl NoInterceptLinearRegression {
    pub fn calculate_standard_error(&self) -> f64 {
        // Initialize the variables
        let x_values: Vec<f64> = self.get_x().clone();
        let y_values: Vec<f64> = self.get_y().clone();
        let y_prediction: Vec<f64> = self.get_y_prediction().clone();
        let n:usize = y_values.len();

        let mut e_2: Vec<f64> = Vec::new();
        let mut x_2: Vec<f64> = Vec::new();
        for i in 0..n {
            e_2.push((y_values[i] - y_prediction[i]).powi(2));
            x_2.push(x_values[i].powi(2));
        }
        let x_2_sum: f64 = x_2.iter().sum::<f64>();
        let sse: f64 = e_2.iter().sum::<f64>();
        let mse: f64 = sse / (n as f64 - 1.0);
        let se: f64 = (mse / x_2_sum).sqrt();
        se
    }
}

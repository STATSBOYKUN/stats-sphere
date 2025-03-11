use wasm_bindgen::prelude::*;
use crate::SimpleLinearRegression;

#[wasm_bindgen]
impl SimpleLinearRegression {
    pub fn calculate_standard_error(&self) -> Vec<f64> {
        // Initialize the variables
        let y_values: Vec<f64> = self.get_y().clone();
        let x_values: Vec<f64> = self.get_x().clone();
        let y_prediction: Vec<f64> = self.get_y_prediction().clone();
        let n:usize = y_values.len();

        let e_2: Vec<f64> = y_values.iter().zip(y_prediction.iter()).map(|(y, y_hat)| (y - y_hat).powi(2)).collect();
        let sse: f64 = e_2.iter().sum();
        let mse: f64 = sse / (n as f64 - 2.0);

        let x_sum: f64 = x_values.iter().sum();
        let x_sum_2: f64 = x_sum.powi(2);
        let x_sum_2_mean: f64 = x_sum_2 / (n as f64);

        let x_2_sum: f64 = x_values.iter().map(|x| x.powi(2)).sum();
        
        let sxx: f64 = x_2_sum - x_sum_2_mean;

        let se_b1 = (mse / sxx).sqrt();

        let se_b0 = (mse * (1.0 / n as f64 + (x_sum / n as f64).powi(2) / sxx)).sqrt();

        vec![se_b0, se_b1]
    }
}
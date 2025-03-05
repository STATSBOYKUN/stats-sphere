use wasm_bindgen::prelude::*;
use crate::NoInterceptLinearRegression;

#[wasm_bindgen]
impl NoInterceptLinearRegression{
    pub fn calculate_regression(&mut self) {
        // Initialize the variables
        let x_values: Vec<f64> = self.get_x().clone();
        let y_values: Vec<f64> = self.get_y().clone();
        let mut x_pow_2: Vec<f64> = Vec::new();
        let mut xy: Vec<f64> = Vec::new();
        let mut x_pow_2_sum: f64 = 0.0;
        let mut xy_sum: f64 = 0.0;
        let b: f64;
        let mut y_prediction: Vec<f64> = Vec::new();

        // Calculate the sum of x, y, x^2, and xy
        for i in 0..x_values.len(){
            x_pow_2.push(x_values[i].powi(2));
            xy.push(x_values[i] * y_values[i]);
            x_pow_2_sum += x_pow_2[i];
            xy_sum += xy[i];
        }

        // Calculate the parameter a and b
        b = xy_sum / x_pow_2_sum;

        // Calculate the prediction
        for i in 0..x_values.len(){
            y_prediction.push(b * x_values[i]);
        }

        // Set the b0, b1, and y_prediction
        self.set_b(b);
        self.set_y_prediction(y_prediction);
    }
}
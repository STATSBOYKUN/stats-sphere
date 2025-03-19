use wasm_bindgen::prelude::*;
use crate::SimpleExponentialRegression;

#[wasm_bindgen]
impl SimpleExponentialRegression{
    // Calculate the simple exponential regression
    pub fn calculate_regression(&mut self) {
        let x_values: Vec<f64> = self.get_x();
        let y_values: Vec<f64> = self.get_y().iter().map(|x| x.ln()).collect();
        let mut x_pow_2: Vec<f64> = Vec::new();
        let mut xy: Vec<f64> = Vec::new();
        let mut x_sum: f64 = 0.0;
        let mut y_sum: f64 = 0.0;
        let mut x_pow_2_sum: f64 = 0.0;
        let mut xy_sum: f64 = 0.0;
        let b0: f64;
        let b1: f64;
        let mut y_prediction: Vec<f64> = Vec::new();

        // Calculate the sum of x, y, x^2, and xy
        for i in 0..x_values.len(){
            x_pow_2.push(x_values[i].powi(2));
            xy.push(x_values[i] * y_values[i]);
            x_sum += x_values[i];
            y_sum += y_values[i];
            x_pow_2_sum += x_pow_2[i];
            xy_sum += xy[i];
        }

        // Calculate the parameter a and b
        b0 = (y_sum * x_pow_2_sum - x_sum * xy_sum) / (x_values.len() as f64 * x_pow_2_sum - x_sum.powi(2));
        b1 = (x_values.len() as f64 * xy_sum - x_sum * y_sum) / (x_values.len() as f64 * x_pow_2_sum - x_sum.powi(2));

        // Calculate the prediction
        for i in 0..x_values.len(){
            y_prediction.push((b0 + b1 * x_values[i]).exp());
        }

        // Set the b0, b1, and y_prediction
        self.set_b0(b0);
        self.set_b1(b1);
        self.set_y_prediction(y_prediction);
    }
}
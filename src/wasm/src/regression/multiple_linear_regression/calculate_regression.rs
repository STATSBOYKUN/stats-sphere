use wasm_bindgen::prelude::*;
use crate::{transpose, multiply_matrix, invert_matrix, multiply_matrix_vector};
use crate::MultipleLinearRegression;

#[wasm_bindgen]
impl MultipleLinearRegression{
    // Calculate the multiple linear regression
    pub fn calculate_regression(&mut self) {
        // Initialize the variables
        let x_values: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(self.get_x()).unwrap();
        let y_values: Vec<f64> = self.get_y().clone();
        let mut y_prediction: Vec<f64> = Vec::new();
        let m: usize = x_values.len();
        let n: usize = x_values[0].len();
        let mut design_matrix: Vec<Vec<f64>> = vec![vec![1.0; n + 1]; m];
        for i in 0..m {
            for j in 0..n {
                design_matrix[i][j + 1] = x_values[i][j];
            }
        }
        let xt: Vec<Vec<f64>> = transpose(&design_matrix);
        let xtx: Vec<Vec<f64>> = multiply_matrix(&xt, &design_matrix);
        let xtx_inv: Vec<Vec<f64>> = invert_matrix(&xtx).unwrap();
        let xt_y: Vec<f64> = multiply_matrix_vector(&xt, &y_values);
        let beta: Vec<f64> = multiply_matrix_vector(&xtx_inv, &xt_y);

        for i in 0..m{
            let mut y_pred: f64 = beta[0];
            for j in 1..n + 1{
                y_pred += beta[j] * design_matrix[i][j];
            }
            y_prediction.push(y_pred);
        }

        self.set_y_prediction(y_prediction.clone());
        self.set_beta(beta);
    }
}
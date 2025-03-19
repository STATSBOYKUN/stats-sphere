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
        let mut design_matrix: Vec<Vec<f64>> = Vec::new();
        let mut first_column = Vec::new();
        if self.get_constant() {
            for _ in 0..n{
                first_column.push(1.0);
            }
            design_matrix.push(first_column);
        }
        for i in 0..m{
            design_matrix.push(x_values[i].clone());
        }
        
        let xt: Vec<Vec<f64>> = transpose(&design_matrix);
        let xtx: Vec<Vec<f64>> = multiply_matrix(&xt, &design_matrix);
        let xtx_inv: Vec<Vec<f64>> = invert_matrix(&xtx).unwrap();
        let xt_y: Vec<f64> = multiply_matrix_vector(&xt, &y_values);
        let beta: Vec<f64> = multiply_matrix_vector(&xtx_inv, &xt_y);
        for i in 0..n{
            let mut y_pred: f64 = 0.0;
            if self.get_constant(){
                y_pred += beta[0];
                for j in 1..beta.len(){
                    y_pred += beta[j] * design_matrix[j][i];
                }
            }else {
                for j in 0..beta.len(){
                    y_pred += beta[j] * design_matrix[j][i];
                }
            }
            y_prediction.push(y_pred);
        }
        self.set_y_prediction(y_prediction.clone());
        self.set_beta(beta);
    }
}
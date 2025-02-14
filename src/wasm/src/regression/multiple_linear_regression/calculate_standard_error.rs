use wasm_bindgen::prelude::*;
use crate::{invert_matrix, multiply_matrix, multiply_matrix_vector, transpose };
use crate::MultipleLinearRegression;


#[wasm_bindgen]
impl MultipleLinearRegression {
    pub fn calculate_standard_error(&self) -> Vec<f64> {
        // Initialize the variables
        let x_values: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(self.get_x()).unwrap();
        let y_values: Vec<f64> = self.get_y().clone();
        let beta: Vec<f64> = self.get_beta().clone();
        let p:usize = x_values.len();
        let n:usize = x_values[0].len();
        let mut design_matrix: Vec<Vec<f64>> = vec![vec![1.0; n + 1]; p];
        for i in 0..p {
            for j in 0..n {
                design_matrix[i][j + 1] = x_values[i][j];
            }
        }
        // Prepare the components for calculation
        let xt: Vec<Vec<f64>> = transpose(&design_matrix);
        let xtx: Vec<Vec<f64>> = multiply_matrix(&xt, &design_matrix);
        let xtx_inv: Vec<Vec<f64>> = invert_matrix(&xtx).unwrap();
        let mut yty: f64 = 0.0;
        for i in 0..n{
            yty += y_values[i] * y_values[i];
        }
        let xt_y: Vec<f64> = multiply_matrix_vector(&xt, &y_values);
        let mut bt_xt_y: f64 = 0.0;
        for i in 0..p{
            bt_xt_y += beta[i] * xt_y[i];
        }
        // Calculate sse dan mse
        let ss_res: f64 = yty - bt_xt_y;
        let ms_res: f64 = ss_res / (n as f64 - p as f64);
        // Calculate standard error
        let mut se: Vec<f64> = Vec::new();
        for i in 0..p{
            se.push((ms_res * xtx_inv[i][i]).sqrt());
        }
        se
    }
}
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
        for i in 0..beta.len(){
            bt_xt_y += beta[i] * xt_y[i];
        }

        // Calculate sse dan mse
        let ss_res: f64 = yty - bt_xt_y;
        let ms_res: f64 = ss_res / (n as f64 - beta.len() as f64);

        // Calculate standard error
        let mut se: Vec<f64> = Vec::new();
        for i in 0..beta.len(){
            se.push((ms_res * xtx_inv[i][i]).sqrt());
        }
        se
    }
}
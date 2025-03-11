use wasm_bindgen::prelude::*;
use crate::MultipleLinearRegression;
use crate::{transpose, multiply_matrix_vector};

#[wasm_bindgen]
impl MultipleLinearRegression{
    pub fn calculate_sse(&self)-> f64 {
        // prepare the transpose matrix x
        let x_values: Vec<Vec<f64>> = serde_wasm_bindgen::from_value(self.get_x()).unwrap();
        let m: usize = x_values.len();
        let n: usize = x_values[0].len();
        let mut design_matrix: Vec<Vec<f64>> = Vec::new();
        let mut first_column = Vec::new();
        for _ in 0..n{
            first_column.push(1.0);
        }
        design_matrix.push(first_column);
        for i in 0..m{
            design_matrix.push(x_values[i].clone());
        }
        let x_transpose: Vec<Vec<f64>> = transpose(&design_matrix);

        // prepare b vector
        let b_vector: Vec<f64> = self.get_beta().clone();

        // prepare y scalar
        let y_vector: Vec<f64> = self.get_y();
        let mut y_scalar = 0.0;
        for i in 0..y_vector.len(){
            y_scalar += y_vector[i] * y_vector[i];
        }

        // Multiply x_transpose and y_vector
        let x_transpose_y: Vec<f64> = multiply_matrix_vector(&x_transpose, &y_vector);

        // Multiply x_transpose_y and b_vector
        let mut b_vector_x_transpose_y: f64 = 0.0;
        for i in 0..b_vector.len(){
            b_vector_x_transpose_y += b_vector[i] * x_transpose_y[i];
        }

        // Calculate sse
        let sse = y_scalar - b_vector_x_transpose_y;
        sse
    }

    pub fn calculate_mse(&self)-> f64 {
        let sse = self.calculate_sse();
        let n = self.get_y().len() as f64;
        let mse = sse / (n - self.get_beta().len() as f64);
        mse
    }

    pub fn calculate_sst(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
        let y_sum: f64 = y_values.iter().sum::<f64>();
        let y_sum_2 = y_sum * y_sum;
        let y_sum_2_mean = y_sum_2 / y_values.len() as f64;
        let y_scalar = y_values.iter().map(|x| x * x).sum::<f64>();
        let sst = y_scalar - y_sum_2_mean;
        sst
    }

    pub fn calculate_r2(&self)-> f64 {
        let sse = self.calculate_sse();
        let sst = self.calculate_sst();
        let r2 = 1.0 - sse / sst;
        r2
    }

    pub fn calculate_r2_adj(&self)-> f64 {
        let r2 = self.calculate_r2();
        let n = self.get_y().len() as f64;
        let k = self.get_beta().len() as f64;
        let r2_adj = 1.0 - (1.0 - r2) * (n - 1.0) / (n - k);
        r2_adj
    }
}
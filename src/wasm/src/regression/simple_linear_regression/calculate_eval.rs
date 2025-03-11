use wasm_bindgen::prelude::*;
use crate::SimpleLinearRegression;

#[wasm_bindgen]
impl SimpleLinearRegression{
    pub fn calculate_sse(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
        let y_prediction: Vec<f64> = self.get_y_prediction().clone();
        let n:usize = y_values.len();
        let mut e_2: Vec<f64> = Vec::new();
        for i in 0..n {
            e_2.push((y_values[i] - y_prediction[i]).powi(2));
        }
        let sse: f64 = e_2.iter().sum::<f64>();
        sse
    }

    pub fn calculate_mse(&self)-> f64 {
        let sse = self.calculate_sse();
        let n = self.get_y().len() as f64;
        let mse = sse / (n - 2.0);
        mse
    }

    pub fn calculate_sst(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
        let y_mean: f64 = y_values.iter().sum::<f64>() / y_values.len() as f64;
        let n:usize = y_values.len();
        let mut e_2: Vec<f64> = Vec::new();
        for i in 0..n {
            e_2.push(y_values[i].powi(2) - n as f64 * y_mean.powi(2));
        }
        let sst: f64 = e_2.iter().sum::<f64>();
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
        let k = 2.0;
        let r2_adj = 1.0 - (1.0 - r2) * (n - 1.0) / (n - k);
        r2_adj
    }
}
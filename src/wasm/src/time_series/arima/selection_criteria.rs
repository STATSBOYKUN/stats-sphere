use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference};
use std::f64::consts::PI;

#[wasm_bindgen]
impl Arima{
    pub fn ln_likelihood(&self) -> f64 {
        let n = self.get_data().len() as f64 - self.get_ar_order() as f64;
        let css = self.res_sum_of_square();
        let var_res = self.res_variance();
        -n / 2.0 * (2.0 * PI * var_res).ln() - css / (2.0 * var_res)
    }

    pub fn aic(&self) -> f64 {
        let m = 1.0 + self.get_ar_order() as f64 + self.get_ma_order() as f64 + self.get_i_order() as f64;
        let ln_likelihood = self.ln_likelihood();
        -2.0 * ln_likelihood + 2.0 * m
    }

    pub fn bic(&self) -> f64 {
        let var_res = self.res_variance();
        let mut data = self.get_data();
        if self.get_i_order() > 0 {
            for _ in 0..self.get_i_order(){
                data = first_difference(data);
            }
        }
        let n = data.len() as f64;
        let m = 1.0 + self.get_ma_order() as f64 + self.get_i_order() as f64;
        let mean_data = data.iter().sum::<f64>() / n;
        let var_data = data.iter().map(|x| (x - mean_data).powi(2)).sum::<f64>() / (n - m);
        n * var_res.ln() - (n - m) * (1.0 - m / n).ln() + m * n.ln() + m * ((var_res / var_data + 1.0) / m).ln()
    }

    pub fn sbc(&self) -> f64 {
        let n = self.get_data().len() as f64 - self.get_ar_order() as f64;
        let m = 1.0 + self.get_ar_order() as f64 + self.get_ma_order() as f64 + self.get_i_order() as f64;
        let var_res = self.res_variance();
        n * var_res.ln() + m * n.ln()
    }
}
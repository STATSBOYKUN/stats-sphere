use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference};

#[wasm_bindgen]
impl Arima {
    pub fn est_res(&self, intercept: f64, ar: Vec<f64>, ma: Vec<f64>, data: Vec<f64>) -> Vec<f64> {
        let mut residuals = Vec::new();
        let p = self.get_ar_order() as usize;
        let q = self.get_ma_order() as usize;
        if p > 0 && q > 0 {
            for i in 0..data.len() {
                let mut sum_ar = 0.0;
                for j in 1..=p as usize {
                    if i + 1 > j {
                        sum_ar += ar[j - 1] * (data[i - j] - intercept);
                    }
                }
                let mut sum_ma = 0.0;
                for j in 1..=q as usize {
                    if i + 1 > j {
                        sum_ma += ma[j - 1] * residuals[i - j];
                    }
                }
                residuals.push(data[i] - intercept - sum_ar + sum_ma);
            }
        } else if p > 0 {
            for i in 0..data.len() {
                let mut sum_ar = 0.0;
                for j in 1..=p as usize {
                    if i + 1 > j {
                        sum_ar += ar[j - 1] * (data[i - j] - intercept);
                    }
                }
                residuals.push(data[i] - intercept - sum_ar);
            }
        } else if q > 0 {
            for i in 0..data.len() {
                let mut sum_ma = 0.0;
                for j in 1..=q as usize {
                    if i + 1 > j {
                        sum_ma += ma[j - 1] * residuals[i - j];
                    }
                }
                residuals.push(data[i] - intercept + sum_ma);
            }
        } else {
            for i in 0..data.len() {
                residuals.push(data[i] - intercept);
            }
        }
        residuals
    }

    pub fn res_sum_of_square(&self)-> f64{
        let mut data = self.get_data();
        let d = self.get_i_order();
        if d > 0 {
            for _ in 0..d{
                let diff = first_difference(data.clone());
                data = diff;
            }
        }
        let intercept = self.get_constant();
        let ma_coef = self.get_ma_coef();
        let ar_coef = self.get_ar_coef();
        let residual = self.est_res(intercept, ar_coef, ma_coef, data);
        let res_sum_of_square = residual.iter().map(|x| x.powi(2)).sum::<f64>();
        res_sum_of_square
    }

    pub fn res_variance(&self)-> f64{
        let sum_of_square = self.res_sum_of_square();
        let p = self.get_ar_order() as usize;
        let q = self.get_ma_order() as usize;
        let d = self.get_i_order() as usize;
        let n = self.get_data().len();
        let res_variance = sum_of_square / (n - 2 * p - q - d - 1) as f64;
        res_variance
    }
}
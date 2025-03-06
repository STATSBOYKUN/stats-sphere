use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference};
use arima::estimate;

#[wasm_bindgen]
impl Arima{
    pub fn estimate_residual(&self)-> Vec<f64>{
        let mut data = self.get_data();
        let d = self.get_i_order();
        if d > 0 {
            for _ in 0..d{
                data = first_difference(data);
            }
        }
        let constanta = self.get_constant();
        let ma_coef = self.get_ma_coef();
        let ar_coef = self.get_ar_coef();
        let residual = estimate::residuals(&data, constanta, Some(&ar_coef), Some(&ma_coef)).unwrap();
        residual
    }

    pub fn res_sum_of_square(&self)-> f64{
        let residual = self.estimate_residual();
        let res_sum_of_square = residual.iter().map(|x| x.powi(2)).sum::<f64>();
        res_sum_of_square
    }

    pub fn res_variance(&self)-> f64{
        let sum_of_square = self.res_sum_of_square();
        let p = self.get_ar_order() as usize;
        let q = self.get_ma_order() as usize;
        let d = self.get_i_order() as usize;
        let n = self.get_data().len();
        let res_variance = sum_of_square / (n - p - q - d - 1) as f64;
        res_variance
    }
}
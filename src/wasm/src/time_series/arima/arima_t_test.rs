use wasm_bindgen::prelude::*;
use crate::Arima;
use statrs::distribution::{StudentsT, ContinuousCDF};

#[wasm_bindgen]
impl Arima {
    pub fn t_stat(&mut self) -> Vec<f64> {
        let coef = self.estimate_coef();
        let se = self.estimate_se();
        let t_stat = coef.iter().zip(se.iter()).map(|(coef, se)| coef / se).collect();
        t_stat
    }

    pub fn p_value(&mut self) -> Vec<f64> {
        let t_stat = self.t_stat();
        let n = self.get_data().len() as f64;
        let p = self.get_ar_order() as f64;
        let d = self.get_i_order() as f64;
        let q = self.get_ma_order() as f64;
        let df = n - p - d - q - 1.0;
        let t_dist = StudentsT::new(0.0, 1.0, df).unwrap();
        let p_value = t_stat.iter().map(|t| 2.0 * (1.0 - t_dist.cdf(t.abs()))).collect();
        p_value
    }
}
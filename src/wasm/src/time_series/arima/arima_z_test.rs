use wasm_bindgen::prelude::*;
use crate::Arima;
use statrs::distribution::{Normal, ContinuousCDF};

#[wasm_bindgen]
impl Arima {
    pub fn z_stat(&mut self) -> Vec<f64> {
        let coef = self.estimate_coef();
        let se = self.estimate_se();
        let z_stat = coef.iter().zip(se.iter()).map(|(coef, se)| coef / se).collect();
        z_stat
    }

    pub fn p_value(&mut self) -> Vec<f64> {
        let z_stat = self.z_stat();
        let normal = Normal::new(0.0, 1.0).unwrap();
        let p_value = z_stat.iter().map(|z| normal.cdf(2.0 * (1.0 - normal.cdf(z.abs())))).collect();
        p_value
    }
}
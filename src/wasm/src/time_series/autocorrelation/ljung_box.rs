use wasm_bindgen::prelude::*;
use crate::Autocorrelation;
use statrs::distribution::{ChiSquared, ContinuousCDF};


#[wasm_bindgen]
impl Autocorrelation{
    pub fn calculate_ljung_box(&self, autocorrelate: Vec<f64>) -> Vec<f64>{
        let mut ljung_box = Vec::new();
        let n = self.get_data().len() as f64;
        for i in 1..self.get_lag() + 1{
            let mut var_corr = 0.0;
            for j in 0..i{
                var_corr += autocorrelate[j as usize].powi(2) / (n - j as f64 - 1.0);
            }
            let q = n * (n + 2.0) * var_corr;
            ljung_box.push(q);
        }
        ljung_box
    }

    pub fn pvalue_ljung_box(&self, ljung_box: Vec<f64>) -> Vec<f64>{
        let mut pvalue = Vec::new();
        for i in 0..ljung_box.len(){
            let chi_sq = ChiSquared::new(i as f64 + 1.0).unwrap();
            let p = 1.0 - chi_sq.cdf(ljung_box[i]);
            pvalue.push(p);
        }
        pvalue
    }

    pub fn df_ljung_box(&self) -> Vec<usize>{
        let mut df = Vec::new();
        for i in 0..self.get_lag(){
            df.push(i as usize + 1);
        }
        df
    }
}
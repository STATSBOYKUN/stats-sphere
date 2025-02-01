use wasm_bindgen::prelude::*;
use crate::Autocorrelation;


#[wasm_bindgen]
impl Autocorrelation{
    pub fn calculate_ljung_box(&self, autocorrelate: Vec<f64>) -> Vec<f64>{
        let mut ljung_box = Vec::new();
        for i in 0..self.get_lag(){
            let mut var_corr = 0.0;
            for j in 0..i{
                var_corr += autocorrelate[j as usize].powi(2) / (self.get_data().len() as f64 - j as f64 + 1.0);
            }
            let q = self.get_data().len() as f64 * (self.get_data().len() as f64 + 2.0) * var_corr;
            ljung_box.push(q);
        }
        ljung_box
    }
}
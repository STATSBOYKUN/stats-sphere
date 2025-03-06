use wasm_bindgen::prelude::*;
use crate::Arima;
use arima::estimate;

#[wasm_bindgen]
impl Arima{
    pub fn estimate_coef(&mut self) -> Vec<f64> {
        let data = self.get_data();
        let p = self.get_ar_order() as usize;
        let q = self.get_ma_order() as usize;
        let d = self.get_i_order() as usize;
        let coef = estimate::fit(&data, p, d, q).unwrap();

        if d == 0 {
            self.set_constant(coef[0]);
            if p == 0 {
                self.set_ma_coef(coef[1..].to_vec());
            } else if q == 0 {
                self.set_ar_coef(coef[1..].to_vec());
            } else {
                self.set_ar_coef(coef[1..p+1].to_vec());
                self.set_ma_coef(coef[p+1..].to_vec());
            }
        } else {
            if p == 0 {
                self.set_ma_coef(coef[0..].to_vec());
            } else if q == 0 {
                self.set_ar_coef(coef[0..].to_vec());
            } else {
                self.set_ar_coef(coef[0..p+1].to_vec());
                self.set_ma_coef(coef[p+1..].to_vec());
            }
        }

        coef
    }
}
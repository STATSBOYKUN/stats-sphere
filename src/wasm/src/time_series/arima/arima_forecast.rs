use wasm_bindgen::prelude::*;
use crate::Arima;
use arima::sim;
use rand_distr::{Distribution, Normal};
use rand::thread_rng;

#[wasm_bindgen]
impl Arima{
    pub fn forecast(&self, n: usize) -> Vec<f64> {
        let data = self.get_data();
        let var_res = self.res_variance();
        let normal = Normal::new(0.0, var_res).unwrap();
        let forecast = sim::arima_forecast(
            &data, 
            n, 
            Some(&self.get_ar_coef()), 
            Some(&self.get_ma_coef()), 
            self.get_i_order() as usize, 
            &|_, mut rng| { normal.sample(&mut rng) },
            &mut thread_rng()
        ).unwrap();
        forecast
    }
}
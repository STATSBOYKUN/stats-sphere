use wasm_bindgen::prelude::*;
use crate::Autocorrelation;
use statrs::distribution::{Normal, ContinuousCDF};

#[wasm_bindgen]
impl Autocorrelation{
    pub fn calculate_bartlet_left(&self, r: Vec<f64>, se: Vec<f64>, alpha: f64) -> Vec<f64>{
        let mut bartlet_left = Vec::new();
        let lag = self.get_lag() as usize;
        let normal = Normal::new(0.0, 1.0).unwrap();
        let z_alpha_2 = normal.inverse_cdf(1.0 - alpha / 2.0);
        for i in 0..lag{
            let bartlet = r[i] - z_alpha_2 * se[i];
            bartlet_left.push(bartlet);
        }
        bartlet_left
    }
    
    pub fn calculate_bartlet_right(&self, r: Vec<f64>, se: Vec<f64>, alpha: f64) -> Vec<f64>{
        let mut bartlet_right = Vec::new();
        let lag = self.get_lag() as usize;
        let normal = Normal::new(0.0, 1.0).unwrap();
        let z_alpha_2 = normal.inverse_cdf(1.0 - alpha / 2.0);
        for i in 0..lag{
            let bartlet = r[i] + z_alpha_2 * se[i];
            bartlet_right.push(bartlet);
        }
        bartlet_right
    }
}
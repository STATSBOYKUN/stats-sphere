use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference, invert_matrix};
use arima::estimate;
use finitediff::FiniteDiff;

#[wasm_bindgen]
impl Arima{
    pub fn estimate_se(&mut self) -> Vec<f64>{
        let mut data = self.get_data();
        let p = self.get_ar_coef().len();
        let q = self.get_ma_coef().len();
        let d = self.get_i_order();
        if d > 0 {
            for _ in 0..d{
                data = first_difference(data);
            }
        }
        
        let total_size = 1 + p + q;
        let f = move |coef: &Vec<f64>| {
            assert_eq!(coef.len(), total_size);
    
            let intercept = coef[0];
            let phi = &coef[1..p + 1];
            let theta = &coef[p + 1..];
    
            let residuals = estimate::residuals(&data, intercept, Some(phi), Some(theta)).unwrap();
    
            let mut css: f64 = 0.0;
            for residual in &residuals {
                css += residual * residual;
            }
            css
        };

        let coef = self.estimate_coef();
        let hessian: Vec<Vec<f64>> = coef.forward_hessian_nograd(&f);
        let inv_hessian = invert_matrix(&hessian).unwrap();
        let var_res = self.res_variance();
        let mut se = Vec::new();
        for i in 0..total_size{
            se.push((2.0 * var_res * inv_hessian[i][i]).sqrt());
        }
        se
    }
}
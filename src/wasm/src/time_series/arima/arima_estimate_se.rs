use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference, invert_matrix};
use nalgebra::DMatrix;
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
                let diff = first_difference(data.clone());
                data = diff;
            }
        }
        
        let total_size = 1 + p + q;
        let f = |coef: &Vec<f64>| {
            assert_eq!(coef.len(), total_size);
    
            let intercept = coef[0];
            let phi = &coef[1..p + 1];
            let theta = &coef[p + 1..];
    
            let residuals: Vec<f64> = if p == 0 && q > 0 {
                estimate::residuals(&data, intercept, None, Some(theta)).unwrap()
            } else if q == 0 && p > 0 {
                estimate::residuals(&data, intercept, Some(phi), None).unwrap()
            } else if p > 0 && q > 0 {
                estimate::residuals(&data, intercept, Some(phi), Some(theta)).unwrap()
            } else {
                estimate::residuals(&data, intercept, None, None).unwrap()
            };

            let mut css: f64 = 0.0;
            for residual in &residuals {
                css += residual * residual;
            }
            css
        };

        let coef = self.estimate_coef();
        // let g = |coef: &Vec<f64>| coef.forward_diff(&f);
        // let hessian = coef.forward_hessian(&g);
        let hessian: Vec<Vec<f64>> = coef.forward_hessian_nograd(&f);
        let n = hessian.len(); // Ukuran matriks (n x n)
        let flat_hessian: Vec<f64> = hessian.clone().into_iter().flatten().collect();
        let matrix = DMatrix::from_row_slice(n, n, &flat_hessian);
        let det = matrix.determinant();
        // let det = 0.0;

        if det == 0.0 {
            vec![0.0]
        } else {
            let inv_hessian = invert_matrix(&hessian).unwrap();
            let var_res = self.res_variance();
            let mut se = Vec::new();
            for i in 0..total_size{
                se.push((2.0 * var_res * inv_hessian[i][i].abs()).sqrt());
            }
            se
            // vec![0.0]
        }
    }
}
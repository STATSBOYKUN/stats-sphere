use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference, invert_matrix, autocov_int};
use nalgebra::DMatrix;
use finitediff::FiniteDiff;

#[wasm_bindgen]
impl Arima{
    pub fn intercept_se(&self) -> f64{
        let mut data = self.get_data();
        
        let d = self.get_i_order();
        if d > 0 {
            for _ in 0..d{
                let diff = first_difference(data.clone());
                data = diff;
            }
        } 
        let var;
        if self.get_ar_order() > 0 || self.get_ma_order() > 0{
            let mut acov = Vec::new();
            let mut rho = Vec::new();
            let mut sum = 0.0;
            for i in 0..=self.get_ar_order() as usize + self.get_ma_order() as usize{
                acov.push(autocov_int(i, &data, self.get_constant()));
                rho.push(acov[i] / acov[0]);
                if i > 0 {
                    sum += 2.0*(1.0 - i as f64 / data.len() as f64)*rho[i];
                }
            }
            var = acov[0] / (data.len() as f64 - 1.0) * (1.0 + sum);
        } else{
            let acov = autocov_int(0, &data, self.get_constant());
            var = acov / (data.len() as f64);
        }
        var.abs().sqrt()
    }

    pub fn coeficient_se(&self) -> Vec<f64>{
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
        let f = |coef: &Vec<f64>| {
            let intercept = coef[0];
            let ar = &coef[1..p+1];
            let ma = &coef[p+1..];
            let residuals = self.est_res(intercept, ar.to_vec(), ma.to_vec(), data.clone());
            let css = residuals.iter().map(|x| x.powi(2)).sum::<f64>();
            css
        };

        let mut coef = Vec::new();
        coef.push(self.get_constant());
        if p > 0 {
            let ar = self.get_ar_coef();
            for i in 0..p{
                coef.push(ar[i]);
            };
        }
        if q > 0 {
            let ma = self.get_ma_coef();
            for i in 0..q{
                coef.push(ma[i]);
            };
        }
        let coef = coef;
        let hessian: Vec<Vec<f64>> = coef.forward_hessian_nograd(&f);
        let n = hessian.len(); // Ukuran matriks (n x n)
        let flat_hessian: Vec<f64> = hessian.clone().into_iter().flatten().collect();
        let matrix = DMatrix::from_row_slice(n, n, &flat_hessian);
        let det = matrix.determinant();

        if det == 0.0 {
            vec![f64::NAN; coef.len()-1]
        } else {
            let inv_hessian = invert_matrix(&hessian).unwrap();
            let var_res = self.res_variance();
            let mut se = Vec::new();
            for i in 1..coef.len(){
                se.push((2.0 * var_res * inv_hessian[i][i].abs()).sqrt());
            }
            se
        }
    }

    pub fn estimate_se(&self) -> Vec<f64>{
        let mut se = Vec::new();
        let intercept_se = self.intercept_se();
        se.push(intercept_se);
        if self.get_ar_order() > 0 || self.get_ma_order() > 0{
            let coef_se = self.coeficient_se();
            for coef_se_value in coef_se{
                se.push(coef_se_value);
            }
        }
        se
    }
}
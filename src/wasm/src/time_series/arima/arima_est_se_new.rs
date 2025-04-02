use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference, invert_matrix};
use nalgebra::DMatrix;
use finitediff::FiniteDiff;
use arima::{estimate, util};

#[wasm_bindgen]
impl Arima {
    pub fn est_se_new(&self) -> Vec<f64> {
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
        let n_estimated = 1 + p + q;
        let n_used = data.len() as f64 - p as f64 - q as f64 - 1.0;
        let f = |coef: &Vec<f64>| {
            let intercept = coef[0];
            let ar = &coef[1..p+1];
            let ma = &coef[p+1..];
            let residuals = self.est_res2(intercept, ar.to_vec(), ma.to_vec(), data.clone());
            let css = residuals.iter().map(|x| x.powi(2)).sum::<f64>();
            // let n = data.len() as f64;
            // let df = n - p as f64 - n_estimated as f64;
            // let var_res = css / df;
            // let log_like = - n / 2.0 * (2.0 * std::f64::consts::PI * var_res).ln() - css / (2.0 * var_res);
            // log_like
            -css
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
        let matrix_hessian = DMatrix::from_row_slice(n, n, &flat_hessian);
        let scaled_hessian = matrix_hessian * n_used;
        let inv_hessian = 
        match scaled_hessian.clone().try_inverse(){
            Some(inv) => inv,
            None => {
                eprintln!("Warning: Hessian matrix is singular, using pseudoinverse instead");
                // Use pseudoinverse or other regularization approach
                let svd = scaled_hessian.svd(true, true);
                let singular_values = svd.singular_values;
                
                let mut s_inv = DMatrix::zeros(n_estimated, n_estimated);
                for i in 0..n_estimated {
                    if singular_values[i] > 1e-10 {
                        s_inv[(i, i)] = 1.0 / singular_values[i];
                    }
                }
                
                svd.v_t.unwrap().transpose() * s_inv * svd.u.unwrap().transpose()
            }
        };
        let var_res = self.res_variance();
        let se = inv_hessian.diagonal().iter().map(|x| (2.0*var_res*x.abs()).sqrt()).collect::<Vec<f64>>();
        se
    }

    pub fn intercept_se_old(&self) -> f64{
        let mut data = self.get_data();
        let p = self.get_ar_coef().len();
        let q = self.get_ma_coef().len();
        let d = self.get_i_order();
        if d > 0 {
            data = util::diff(&data, d as usize);
        }
        let data = data;
        let total_size = 1 + p + q;
        let f = |coef: &Vec<f64>| {
            let intercept = coef[0];
            let ar = &coef[1..p+1];
            let ma = &coef[p+1..];
            let residuals = estimate::residuals(&data, intercept, Some(ar), Some(ma)).unwrap();
            // let residuals = self.est_res2(intercept, ar.to_vec(), ma.to_vec(), data.clone());
            let css = residuals.iter().map(|x| x.powi(2)).sum::<f64>();
            let n = data.len() as f64;
            let df = n - p as f64 - total_size as f64;
            let var_res = css / df;
            let log_like = - n / 2.0 * (2.0 * std::f64::consts::PI * var_res).ln() - css / (2.0 * var_res);
            log_like
        };

        let mut coef = Vec::new();
        coef.push(self.get_constant());
        if p > 0 {
            for ar in self.get_ar_coef() {
                coef.push(ar);
            };
        }
        if q > 0 {
            for ma in self.get_ma_coef(){
                coef.push(ma);
            };
        }
        let hessian: Vec<Vec<f64>> = coef.forward_hessian_nograd(&f);
        let n = hessian.len(); // Ukuran matriks (n x n)
        let flat_hessian: Vec<f64> = hessian.clone().into_iter().flatten().collect();
        let matrix = DMatrix::from_row_slice(n, n, &flat_hessian);
        let det = matrix.determinant();

        if det == 0.0 {
            0.0
        } else {
            let var_res = self.res_variance();
            let inv_hessian = invert_matrix(&hessian).unwrap();
            (2.0 * var_res * inv_hessian[0][0].abs()).sqrt()
        }
    }
}
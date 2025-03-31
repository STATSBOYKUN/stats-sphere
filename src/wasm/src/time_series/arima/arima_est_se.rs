use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference, invert_matrix, autocov};
use nalgebra::DMatrix;
use finitediff::FiniteDiff;
use arima::{estimate, util};

#[wasm_bindgen]
impl Arima{
    pub fn intercept_se(&self) -> Vec<f64>{
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
            vec![0.0]
        } else {
            let var_res = self.res_variance();
            let mut se = Vec::new();
            let inv_hessian = invert_matrix(&hessian).unwrap();
            se.push((2.0 * var_res * inv_hessian[0][0].abs()).sqrt());
            se
        }
    }

    pub fn intercept_se2(&self) -> f64{
        let mut data = self.get_data();
        let d = self.get_i_order();
        if d > 0 {
            for _ in 0..d{
                let diff = first_difference(data.clone());
                data = diff;
            }
        } 
        let mut acov = Vec::new();
        let mut rho = Vec::new();
        let mut sum = 0.0;
        for i in 0..data.len(){
            acov.push(autocov(i, &data));
            rho.push(acov[i] / acov[0]);
            if i > 0 {
                sum += 2.0*(1.0 - i as f64 / data.len() as f64)*rho[i];
            }
        }
        let var = acov[0] / data.len() as f64 * (1.0 + sum);
        // let var = acov[0] / data.len() as f64;
        // let var = sum;
        var.sqrt()
    }

    pub fn intercept_se3(&self) -> f64{
        let intercept = self.get_constant();
        let ar = self.get_ar_coef();
        let ma = self.get_ma_coef();
        let mut data = self.get_data();
        if self.get_i_order() > 0 {
            for _ in 0..self.get_i_order() {
                let diff = first_difference(data.clone());
                data = diff;
            }
        }
        let residual = self.est_res2(intercept, ar.clone(), ma.clone(), data.clone());
        let var_res = residual.iter().map(|x| x.powi(2)).sum::<f64>() / (data.len() as f64 - self.get_ar_order() as f64 - self.get_ma_order() as f64 - 1.0);
        let var = var_res * (2.0*data.len() as f64 + 1.0) * (data.len() as f64 + 1.0) / 6.0*data.len() as f64;
        var.sqrt()
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
        
        let total_size = 1 + p + q;
        let f = |coef: &Vec<f64>| {
            assert_eq!(coef.len(), total_size);

            let intercept = coef[0];
            let ar = &coef[1..p+1];
            let ma = &coef[p+1..];
            let residuals = estimate::residuals(&data, intercept, Some(ar), Some(ma)).unwrap();
            let css = residuals.iter().map(|x| x.powi(2)).sum::<f64>();
            css
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
            vec![0.0]
        } else {
            let inv_hessian = invert_matrix(&hessian).unwrap();
            let var_res = self.res_variance();
            let mut se = Vec::new();
            for i in 1..total_size{
                se.push((2.0 * var_res * inv_hessian[i][i].abs()).sqrt());
            }
            se
        }
    }

    pub fn estimate_se(&self) -> Vec<f64>{
        let mut se = Vec::new();
        let intercept_se = self.intercept_se2();
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
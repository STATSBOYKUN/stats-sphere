use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference};
use std::f64::consts::PI;
use statrs::distribution::{ContinuousCDF, FisherSnedecor};

#[wasm_bindgen]
impl Arima{
    pub fn selection_criteria(&self) -> Vec<f64>{
        let mut sel_crit = Vec::new();
        if self.get_ar_order() > 0 || self.get_ma_order() > 0 {
            sel_crit.push(self.calculate_r2());
            sel_crit.push(self.calculate_r2_adj());
        }
        sel_crit.push(self.calculate_se_reg());
        sel_crit.push(self.calculate_sse());
        sel_crit.push(self.calculate_log_likelihood());
        if self.get_ar_order() > 0 || self.get_ma_order() > 0 { 
            sel_crit.push(self.calculate_f_stat());
            sel_crit.push(self.calculate_f_prob());
        }
        sel_crit.push(self.calculate_mean_dep());
        sel_crit.push(self.calculate_sd_dep());
        sel_crit.push(self.calculate_aic());
        sel_crit.push(self.calculate_sbc());
        sel_crit.push(self.calculate_hqc());
        sel_crit.push(self.calculate_dw());
        sel_crit
    }
    pub fn calculate_sse(&self)-> f64 {
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
        let residual = self.est_res(intercept, ar.clone(), ma.clone(), data);
        let sse = residual.iter().map(|x| x.powi(2)).sum::<f64>();
        sse
    }

    pub fn calculate_mse(&self)-> f64 {
        let sse = self.calculate_sse();
        let n = self.get_data().len() as f64;
        let p = self.get_ar_order() as f64;
        let q = self.get_ma_order() as f64;
        let d = self.get_i_order() as f64;
        let mse = sse / (n - p - q - d - 1.0);
        mse
    }

    pub fn calculate_sst(&self)-> f64 {
        let y_values: Vec<f64> = self.get_data();
        let y_mean: f64 = y_values.iter().sum::<f64>() / y_values.len() as f64;
        let n:usize = y_values.len();
        let mut e_2: Vec<f64> = Vec::new();
        for i in 0..n {
            e_2.push((y_values[i] - y_mean).powi(2));
        }
        let sst: f64 = e_2.iter().sum::<f64>();
        sst
    }

    pub fn calculate_r2(&self)-> f64 {
        let sse = self.calculate_sse();
        let sst = self.calculate_sst();
        let r2 = 1.0 - sse / sst;
        r2
    }

    pub fn calculate_r2_adj(&self)-> f64 {
        let r2 = self.calculate_r2();
        let n = self.get_data().len() as f64;
        let k = (self.get_ar_order() + self.get_ma_order() + self.get_i_order() + 1) as f64;
        let r2_adj = 1.0 - (1.0 - r2) * (n - 1.0) / (n - k);
        r2_adj
    }

    pub fn calculate_se_reg(&self)-> f64{
        let mse = self.calculate_mse();
        let se = mse.sqrt();
        se
    }

    pub fn calculate_log_likelihood(&self)-> f64{
        let n = self.get_data().len() as f64;
        let sse = self.calculate_sse();
        let var = sse / n;
        let log_likelihood = -n / 2.0 * (2.0 * PI).ln() - n * (var.sqrt()).ln() - 1.0 / (2.0 * var) * sse;
        log_likelihood
    }

    pub fn calculate_f_stat(&self)-> f64 {
        let sst = self.calculate_sst();
        let sse = self.calculate_sse();
        let n = self.get_data().len() as f64;
        let ssr = sst - sse;
        let k = (self.get_ar_order() + self.get_ma_order() + self.get_i_order() + 1) as f64;
        let f_stat = (ssr / 1.0) / (sse / (n - k));
        f_stat
    }

    pub fn calculate_f_prob(&self)-> f64 {
        let f_stat = self.calculate_f_stat();
        let n = self.get_data().len() as f64;
        let k = (self.get_ar_order() + self.get_ma_order() + self.get_i_order() + 1) as f64;
        let f = FisherSnedecor::new(1.0, n - k).unwrap();
        let f_prob = 1.0 - f.cdf(f_stat);
        f_prob
    }

    pub fn calculate_mean_dep (&self)-> f64 {
        let y_values: Vec<f64> = self.get_data().clone();
        let y_mean: f64 = y_values.iter().sum::<f64>() / y_values.len() as f64;
        y_mean
    }

    pub fn calculate_sd_dep(&self)-> f64 {
        let y_values: Vec<f64> = self.get_data().clone();
        let n:f64 = y_values.len() as f64;
        let y_mean: f64 = y_values.iter().sum::<f64>() / n;
        let mut e_2: Vec<f64> = Vec::new();
        for i in 0..n as usize {
            e_2.push((y_values[i] - y_mean).powi(2));
        }
        let var_dep: f64 = e_2.iter().sum::<f64>() / (n - 1.0);
        let sd_dep = var_dep.sqrt();
        sd_dep
    }

    pub fn calculate_aic(&self)-> f64 {
        let n = self.get_data().len() as f64;
        let p = (self.get_ar_order() + self.get_ma_order() + 1) as f64;
        let likelihood = self.calculate_log_likelihood();
        let aic = -2.0 * likelihood + 2.0 * p;
        aic / n
    }

    pub fn calculate_sbc(&self)-> f64 {
        let n = self.get_data().len() as f64;
        let p = (self.get_ar_order() + self.get_ma_order() + 1) as f64;
        let likelihood = self.calculate_log_likelihood();
        let bic = -2.0 * likelihood + p * (n.ln());
        bic / n
    }

    pub fn calculate_dw(&self)-> f64 {
        let mut data = self.get_data();
        let d = self.get_i_order();
        if d > 0 {
            for _ in 0..d{
                let diff = first_difference(data.clone());
                data = diff;
            }
        }
        let intercept = self.get_constant();
        let ma_coef = self.get_ma_coef();
        let ar_coef = self.get_ar_coef();
        let residual = self.est_res(intercept, ar_coef, ma_coef, data);
        let mut residual_2 = Vec::new();
        for i in 1..residual.len(){
            residual_2.push((residual[i] - residual[i - 1]).powi(2));
        }
        let dw = residual_2.iter().sum::<f64>() / residual.iter().map(|x| x * x).sum::<f64>();
        dw
    }

    pub fn calculate_hqc(&self)-> f64 {
        let likelihood = self.calculate_log_likelihood();
        let n = self.get_data().len() as f64;
        let k = (self.get_ar_order() + self.get_ma_order() + 1) as f64;
        let hc = -2.0 * likelihood + 2.0 * k * (n.ln()).ln();
        hc / n
    }
}
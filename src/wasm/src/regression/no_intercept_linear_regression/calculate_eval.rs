use wasm_bindgen::prelude::*;
use crate::NoInterceptLinearRegression;
use std::f64::consts::PI;
use statrs::distribution::{ContinuousCDF, FisherSnedecor};

#[wasm_bindgen]
impl NoInterceptLinearRegression{
    pub fn calculate_sse(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
        let y_prediction: Vec<f64> = self.get_y_prediction().clone();
        let n:usize = y_values.len();
        let mut e_2: Vec<f64> = Vec::new();
        for i in 0..n {
            e_2.push((y_values[i] - y_prediction[i]).powi(2));
        }
        let sse: f64 = e_2.iter().sum::<f64>();
        sse
    }

    pub fn calculate_mse(&self)-> f64 {
        let sse = self.calculate_sse();
        let n = self.get_y().len() as f64;
        let mse = sse / (n - 1.0);
        mse
    }

    pub fn calculate_sst(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
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
        let n = self.get_y().len() as f64;
        let k = 1.0;
        let r2_adj = 1.0 - (1.0 - r2) * (n - 1.0) / (n - k);
        r2_adj
    }

    pub fn calculate_se_reg(&self)-> f64{
        let mse = self.calculate_mse();
        let se = mse.sqrt();
        se
    }

    pub fn calculate_log_likelihood(&self)-> f64{
        let n = self.get_y().len() as f64;
        let sse = self.calculate_sse();
        let var = sse / n;
        let log_likelihood = -n / 2.0 * (2.0 * PI).ln() - n * (var.sqrt()).ln() - 1.0 / (2.0 * var) * sse;
        log_likelihood
    }

    pub fn calculate_f_stat(&self)-> f64 {
        let sst = self.calculate_sst();
        let sse = self.calculate_sse();
        let n = self.get_y().len() as f64;
        let ssr = sst - sse;
        let k = 1.0;
        let f_stat = (ssr / k) / (sse / (n - k));
        f_stat
    }

    pub fn calculate_f_prob(&self)-> f64 {
        let f_stat = self.calculate_f_stat();
        let n = self.get_y().len() as f64;
        let k = 1.0;
        let f = FisherSnedecor::new(k, n - k).unwrap();
        let f_prob = 1.0 - f.cdf(f_stat);
        f_prob
    }

    pub fn calculate_mean_dep (&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
        let y_mean: f64 = y_values.iter().sum::<f64>() / y_values.len() as f64;
        y_mean
    }

    pub fn calculate_sd_dep(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y().clone();
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
        let n = self.get_y().len() as f64;
        let p = 1.0;
        let likelihood = self.calculate_log_likelihood();
        let aic = -2.0 * likelihood + 2.0 * p;
        aic / n
    }

    pub fn calculate_sbc(&self)-> f64 {
        let n = self.get_y().len() as f64;
        let p = 1.0;
        let likelihood = self.calculate_log_likelihood();
        let bic = -2.0 * likelihood + p * (n.ln());
        bic / n
    }

    pub fn calculate_dw(&self)-> f64 {
        let y_values: Vec<f64> = self.get_y();
        let y_predict: Vec<f64> = self.get_y_prediction();
        let mut e_values: Vec<f64> = Vec::new();
        let mut e_diff_2: Vec<f64> = Vec::new();
        for i in 0..y_values.len(){
            e_values.push(y_values[i] - y_predict[i]);
            if i > 0 {
                e_diff_2.push((e_values[i] - e_values[i - 1]).powi(2));
            }
        }
        let dw = e_diff_2.iter().sum::<f64>() / e_values.iter().map(|x| x * x).sum::<f64>();
        dw
    }

    pub fn calculate_hqc(&self)-> f64 {
        let likelihood = self.calculate_log_likelihood();
        let n = self.get_y().len() as f64;
        let k = 1.0;
        let hc = -2.0 * likelihood + 2.0 * k * (n.ln()).ln();
        hc / n
    }
}
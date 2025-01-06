use wasm_bindgen::prelude::*;
use crate::Decomposition;

#[wasm_bindgen]
impl Decomposition{
    pub fn detrended(&self, method: String, deseasonalize_value: Vec<f64>)->Vec<f64>{
        let detrended_values: Vec<f64>;
        match method.as_str(){
            "linear" => detrended_values =  self.linear_trend(deseasonalize_value),
            "quadratic" => detrended_values = self.quadratic_trend(deseasonalize_value),
            "exponential" => detrended_values = self.exponential_trend(deseasonalize_value),
            _ => panic!("Unknown method: {}", method),
        }
        detrended_values
    }

    // Calculate linear trend
    pub fn linear_trend(&self, deseasonalize_value: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let mut trend_values: Vec<f64> = Vec::new();
        let data = deseasonalize_value;

        // Calculate parameter a and b
        let par_a: f64 = data.iter().sum::<f64>() / data.len() as f64;
        let mut b_numerator:Vec<f64> = Vec::new();
        let mut b_denumerator: Vec<f64> = Vec::new();
        for i in 0..data.len(){
            b_numerator.push(data[i] * ((i as f64) + 1.0));
            b_denumerator.push((i as f64).powi(2));
        }
        let par_b: f64 = b_numerator.iter().sum::<f64>() / b_denumerator.iter().sum::<f64>();

        // Calculate trend values
        for i in 0..data.len(){
            trend_values.push(par_a + par_b * (i as f64));
        }
        trend_values
    }

    // Calculate quadratic trend
    pub fn quadratic_trend(&self, deseasonalize_value: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let mut trend_values: Vec<f64> = Vec::new();
        let data = deseasonalize_value;
        
        // Calculate parameter a
        let mut t_pow_4: Vec<f64> = Vec::new();
        let mut t_pow_2_data: Vec<f64> = Vec::new();
        let mut t_pow_2: Vec<f64> = Vec::new();
        for i in 0..data.len(){
            t_pow_4.push((i as f64 + 1.0).powi(4));
            t_pow_2_data.push((i as f64 + 1.0).powi(2) * data[i]);
            t_pow_2.push((i as f64 + 1.0).powi(2));
        }
        let data_sum:f64 = data.iter().sum::<f64>();
        let t_pow_4_sum:f64 = t_pow_4.iter().sum::<f64>();
        let t_pow_2_data_sum:f64 = t_pow_2_data.iter().sum::<f64>();
        let t_pow_2_sum:f64 = t_pow_2.iter().sum::<f64>();
        let par_a: f64 = (data_sum * t_pow_4_sum - t_pow_2_data_sum * t_pow_2_sum) / (data.len() as f64 * t_pow_4_sum - t_pow_2_sum.powi(2));
        
        // Calculate parameter b
        let mut t_data: Vec<f64> = Vec::new();
        for i in 0..data.len(){
            t_data.push((i as f64 + 1.0) * data[i]);
        }
        let t_data_sum:f64 = t_data.iter().sum::<f64>();
        let par_b: f64 = t_data_sum / t_pow_2_sum;

        // Calculate parameter c
        let par_c: f64 = (data.len() as f64 * t_pow_2_data_sum - t_pow_2_sum * data_sum) / (data.len() as f64 * t_pow_4_sum - t_pow_2_sum.powi(2));

        // Calculate trend values
        for i in 0..data.len(){
            trend_values.push(par_a + par_b * (i as f64 + 1.0) + par_c * (i as f64 + 1.0).powi(2));
        }
        trend_values
    }

    // Calculate exponential trend
    pub fn exponential_trend(&self, deseasonalize_value: Vec<f64>)->Vec<f64>{
        let mut trend_values: Vec<f64> = Vec::new();
        let data = deseasonalize_value;

        // Calculate parameter ln(a) and ln(b)
        let mut ln_data: Vec<f64> = Vec::new();
        let mut t: Vec<f64> = Vec::new();
        let mut t_pow_2: Vec<f64> = Vec::new();
        let mut t_ln_data: Vec<f64> = Vec::new();
        for i in 0..data.len(){
            ln_data.push(data[i].ln());
            t.push(i as f64 + 1.0);
            t_pow_2.push((i as f64 + 1.0).powi(2));
            t_ln_data.push((i as f64 + 1.0) * data[i].ln());
        }
        let ln_data_sum:f64 = ln_data.iter().sum::<f64>();
        let t_sum:f64 = t.iter().sum::<f64>();
        let t_pow_2_sum:f64 = t_pow_2.iter().sum::<f64>();
        let t_ln_data_sum:f64 = t_ln_data.iter().sum::<f64>();
        let ln_a = (data.len() as f64 * t_ln_data_sum - t_sum * ln_data_sum) / (data.len() as f64 * t_pow_2_sum - t_sum.powi(2));
        let ln_b = (ln_data_sum - ln_a * t_sum) / (data.len() as f64);

        // Calculate trend values
        let a_par = ln_a.exp();
        let b_par = ln_b.exp();
        for i in 0..data.len(){
            trend_values.push(a_par * b_par.powf(i as f64 + 1.0));
        }
        trend_values
    }
}
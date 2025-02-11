use wasm_bindgen::prelude::*;
use js_sys::Math::sqrt;
use crate::Autocorrelation;

#[wasm_bindgen]
impl Autocorrelation{
    pub fn calculate_acf(&self, difference: Vec<f64>) -> Vec<f64>{
        let data = difference.clone();
        let lag = self.get_lag();
        let mut autocorrelation = Vec::new();
        let n = data.len();
        let mean = data.iter().sum::<f64>() / n as f64;
        let mut numerator = 0.0;
        let mut denominator = 0.0;
        // Calculate the autocorrelation
        for i in 0..n{
            denominator += (data[i] - mean).powi(2);
        }
        for i in 1..lag + 1{
            for j in 0..n - i as usize{
                numerator += (data[j] - mean) * (data[j + i as usize] - mean);
            }
            autocorrelation.push(numerator / denominator);
            numerator = 0.0;
        }
        autocorrelation
    }

    pub fn calculate_acf_se(&self, autocorelate: Vec<f64>) -> Vec<f64>{
        let mut autocorrelation_se: Vec<f64> = Vec::new();
        for i in 0..self.get_lag(){
            let autocorelate_pow_2 = autocorelate[0..i as usize].iter().map(|x| x.powi(2)).collect::<Vec<f64>>();
            let total = autocorelate_pow_2[0..i as usize].iter().sum::<f64>();
            let se = sqrt((1.0 + (2.0 * total)) / self.get_data().len() as f64) as f64;
            autocorrelation_se.push(se);
        }
        autocorrelation_se
    }
}
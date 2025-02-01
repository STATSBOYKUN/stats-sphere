use wasm_bindgen::prelude::*;
use js_sys::Math::sqrt;
use crate::Autocorrelation;

#[wasm_bindgen]
impl Autocorrelation{
    pub fn calculate_autocorrelation(&self) -> Vec<f64>{
        let data = self.get_data();
        let lag = self.get_lag();
        let mut autocorrelation = Vec::new();
        let n = data.len();
        let mean = data.iter().sum::<f64>() / n as f64;
        let mut numerator = 0.0;
        let mut denominator = 0.0;
        for i in 0..lag{
            for j in 0..n-i as usize{
                numerator += (data[j] - mean) * (data[j + i as usize] - mean);
                denominator += (data[j] - mean).powi(2);
            }
            autocorrelation.push(numerator / denominator);
            numerator = 0.0;
            denominator = 0.0;
        }
        autocorrelation
    }

    pub fn calculate_autocorrelatione_se(&self, autocorelate: Vec<f64>) -> Vec<f64>{
        let mut autocorrelation_se: Vec<f64> = Vec::new();
        for i in 0..autocorelate.len(){
            let total = autocorelate[0..i].iter().sum::<f64>();
            let se = sqrt((1.0 - (2.0 * total)) / self.get_data().len() as f64) as f64;
            autocorrelation_se.push(se);
        }
        autocorrelation_se
    }
}
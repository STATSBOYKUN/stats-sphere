use wasm_bindgen::prelude::*;
use js_sys::Math::sqrt;
use crate::Autocorrelation;

#[wasm_bindgen]
pub fn partial_kj(k: i32, j: i32, autocorrelate: Vec<f64>) -> f64{
    if k == j {
        return autocorrelate[k as usize];
    }
    else {
        let part_kj = partial_kj(k - 1, j, autocorrelate.clone()) - partial_kj(k, k, autocorrelate.clone()) * partial_kj(k - 1, k - j - 1, autocorrelate.clone());
        return part_kj;
    }
}

#[wasm_bindgen]
impl Autocorrelation{
    pub fn calculate_pacf(&self, autocorrelate: Vec<f64>) -> Vec<f64>{
        let mut partial_autocorrelate = Vec::new();
        for k in 0..self.get_lag(){
            if k == 0{
                partial_autocorrelate.push(autocorrelate[k as usize]);
            }else if k == 1{
                let pac = (autocorrelate[1 as usize] - autocorrelate[0 as usize].powi(2)) / (1.0 - autocorrelate[0 as usize].powi(2));
                partial_autocorrelate.push(pac);
            }else{
                let mut total_numerator = 0.0;
                let mut total_denumerator = 0.0;
                for j in 0..k{
                    total_numerator += partial_kj(k - 1, j, autocorrelate.clone()) * autocorrelate[k as usize - j as usize - 1];
                    total_denumerator += partial_kj(k - 1, j, autocorrelate.clone()) * autocorrelate[j as usize];
                }
                let pac = (autocorrelate[k as usize] - total_numerator) / (1.0 - total_denumerator);
                partial_autocorrelate.push(pac);
            }
        }
        partial_autocorrelate
    }

    pub fn calculate_pacf_se(&self, partial_autocorelate: Vec<f64>) -> Vec<f64>{
        let mut partial_autocorrelation_se: Vec<f64> = Vec::new();
        for _i in 0..partial_autocorelate.len(){
            let se = sqrt(1.0 / self.get_data().len() as f64) as f64;
            partial_autocorrelation_se.push(se);
        }
        partial_autocorrelation_se
    }
}
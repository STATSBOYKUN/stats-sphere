use wasm_bindgen::prelude::*;
use crate::Decomposition;

// Calculate decomposition
#[wasm_bindgen]
impl Decomposition{
    pub fn decompose(&self, method: String, deseasonalize_confirm: bool, periodic: usize)->Vec<f64>{
        let mut forecast: Vec<f64> = Vec::new();
        if deseasonalize_confirm{
            let seasonal_index = self.calculate_seasonal_index(periodic);
            let deseasonalize_value = self.deseasonalize(periodic);
            let detrended = self.detrended(method, deseasonalize_value);
            for i in 0..self.get_data().len(){
                forecast.push(seasonal_index[i] * detrended[i]);
            }
            forecast
        }else{
            let detrended = self.detrended(method, self.get_data());
            for i in 0..self.get_data().len(){
                forecast.push(detrended[i]);
            }
            forecast
        }
    }
}
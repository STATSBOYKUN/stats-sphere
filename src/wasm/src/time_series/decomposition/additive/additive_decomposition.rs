use wasm_bindgen::prelude::*;
use crate::Decomposition;

// Calculate Additive Decomposition
#[wasm_bindgen]
impl Decomposition{
    pub fn additive_decomposition(&mut self)->Vec<f64>{
        // Initialize the variables
        let data: Vec<f64> = self.get_data();
        let mut detrended: Vec<f64> = Vec::new();
        let mut irregular_component: Vec<f64> = Vec::new();
        let mut forecast: Vec<f64> = Vec::new();

        // Calculate centered moving average
        let centered_ma = self.calculate_centered_moving_average();

        // Calculate trend component
        let trend_component = self.calculate_additive_trend_component(centered_ma.clone());
        
        // Calculate detrended values
        for i in 0..data.len(){
            detrended.push(data[i] - trend_component[i]);
        }

        // Calculate seasonal component
        let seasonal_component = self.calculate_additive_seasonal_component(detrended.clone());

        // Calculate irregular component
        for i in 0..data.len(){
            irregular_component.push(detrended[i] - seasonal_component[i]);
        }
        self.set_irregular_component(irregular_component.clone());

        // Calculate forecast
        for i in 0..data.len(){
            forecast.push(trend_component[i] + seasonal_component[i]);
        }
        forecast
    }
}


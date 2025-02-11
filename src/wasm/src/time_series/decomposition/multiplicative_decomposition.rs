use wasm_bindgen::prelude::*;
use crate::Decomposition;

// Calculate Multiplicative Decomposition
#[wasm_bindgen]
impl Decomposition{
    pub fn multiplicative_decomposition(&mut self, trend: String)->Vec<f64>{
        // Initialize the variables
        let data: Vec<f64> = self.get_data();
        let mut deseasonalizing: Vec<f64> = Vec::new();
        let mut irregular_component: Vec<f64> = Vec::new();
        let mut forecast: Vec<f64> = Vec::new();

        // Calculate centered moving average
        let centered_ma = self.calculate_centered_moving_average();

        // Calculate seasonal component
        let seasonal_component = self.calculate_multiplicative_seasonal_component(centered_ma.clone());
        
        // Calculate deseasonalizing values
        for i in 0..data.len(){
            deseasonalizing.push(data[i] / seasonal_component[i]);
        }

        // Calculate trend component
        let trend_component = self.calculate_multiplicative_trend_component(trend, deseasonalizing.clone());

        // Calculate irregular component
        for i in 0..data.len(){
            irregular_component.push(deseasonalizing[i] / trend_component[i]);
        }
        self.set_irregular_component(irregular_component.clone());

        // Calculate forecast
        for i in 0..data.len(){
            forecast.push(trend_component[i] * seasonal_component[i]);
        }
        forecast
    }
}


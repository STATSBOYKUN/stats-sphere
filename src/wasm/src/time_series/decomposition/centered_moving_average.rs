use wasm_bindgen::prelude::*;
use crate::{time_series::smoothing::Smoothing, Decomposition};

// Calculate Centered Moving Average
#[wasm_bindgen]
impl Decomposition{
    pub fn calculate_centered_moving_average(&self)->Vec<f64>{
        // Initialize the variables
        let period = self.get_period() as usize;
        let mut centered_ma: Vec<f64>;
        let data = Smoothing::new(self.get_data_header(), self.get_data(), self.get_time_header(), self.get_time());
        
        // Calculate Moving Average
        if period%2 == 0{ // if the period is even
            let moving_average = data.calculate_sma(period);
            let second_moving_average = Smoothing::new(data.get_data_header(), moving_average.clone(), data.get_time_header(), data.get_time());
            centered_ma = second_moving_average.calculate_sma(2);
        }else{ // if the period is odd
            centered_ma = data.calculate_sma(period);
        }

        // Move the moving average values to the center
        let position = (period - (period%2)) / 2;
        for _i in 0..position{
            centered_ma.remove(0);
            centered_ma.insert(centered_ma.len(), 0.0);
        }

        // Make sure values if even
        if period%2 == 0{
            centered_ma[position-1] = 0.0;
        }

        centered_ma
    }
}
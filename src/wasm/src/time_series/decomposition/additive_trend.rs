use wasm_bindgen::prelude::*;
use crate::Decomposition;

// Calculate Centered Moving Average
#[wasm_bindgen]
impl Decomposition{
    pub fn calculate_additive_trend_component(&mut self, centered_ma: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let mut trend_prediction: Vec<f64> = Vec::new();
        let mut centered_ma_values: Vec<f64> = centered_ma.clone();
        let position = ((self.get_period() - (self.get_period() % 2)) / 2) as usize;

        // Calculate trend values
        for i in 0..centered_ma_values.len(){
            // Given zero values for the first and last values
            if i == 0 || i == centered_ma_values.len() - 1{
                trend_prediction.push(0.0);
            }
            // Calculate Reducing Window Average
            else if i < position{
                trend_prediction.push(self.get_data()[0..i + 1].iter().sum::<f64>() / (i as f64 + 1.0));
            }
            // Calculate Reducing Window Average
            else if i >= centered_ma_values.len() - position{
                trend_prediction.push(self.get_data()[i..].iter().sum::<f64>() / ((centered_ma_values.len() - i) as f64));
            }
            // Write the Moving Average Values
            else {
                trend_prediction.push(centered_ma_values[i]);
            }
        }

        // Calculate extrapolation for the first and last values with equal weights
        let len = trend_prediction.len();
        trend_prediction[0] = trend_prediction[1] - 0.5 * (trend_prediction[1] - trend_prediction[2]);
        trend_prediction[len - 1] = trend_prediction[len - 3] - 0.5 * (trend_prediction[len - 3] - trend_prediction[len - 2]);

        // Write the trend equation
        let equation: String = format!("-");
        self.set_trend_equation(equation);

        // Fill the first and last values with prediction
        for i in 0..centered_ma_values.len(){
            if i < position{
                centered_ma_values[i] = trend_prediction[i];
            }else if i >= centered_ma_values.len() - position{
                centered_ma_values[i] = trend_prediction[i];
            }
        }

        // Set the trend component and trend prediction
        self.set_trend_component(trend_prediction.clone());

        // Return the trend prediction
        trend_prediction
    }
}
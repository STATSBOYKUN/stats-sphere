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

        // Calculate parameter a and b
        let par_a: f64 = centered_ma_values[position-1..centered_ma_values.len()-position].iter().sum::<f64>() / (centered_ma_values.len() - position * 2) as f64;
        let mut b_numerator:Vec<f64> = Vec::new();
        let mut b_denumerator: Vec<f64> = Vec::new();
        for i in position-1..centered_ma_values.len()-position{
            b_numerator.push(centered_ma_values[i] * ((i as f64) + 1.0));
            b_denumerator.push((i as f64).powi(2));
        }
        let par_b: f64 = b_numerator.iter().sum::<f64>() / b_denumerator.iter().sum::<f64>();

        // Calculate trend values
        for i in 0..centered_ma_values.len(){
            trend_prediction.push(par_a + par_b * (i as f64));
        }

        // Write the trend equation
        let equation: String = format!("y = {} + {}t", par_a, par_b);
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
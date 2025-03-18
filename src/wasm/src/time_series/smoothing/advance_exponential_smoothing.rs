use wasm_bindgen::prelude::*;
use crate::Smoothing;

#[wasm_bindgen]
impl Smoothing{
    // Holt's Method
    pub fn calculate_holt(&self, alpha:f64, beta:f64) -> Vec<f64> {
        let mut level: Vec<f64> = Vec::new();
        let mut trend: Vec<f64> = Vec::new();
        let mut holt_values: Vec<f64> = Vec::new();
        for i in 0..self.get_data().len(){
            if i == 0{
                level.push(0.0);
                trend.push(0.0);
                holt_values.push(0.0);
            } else if i == 1{
                level.push(self.get_data()[1]);
                trend.push(self.get_data()[1] - self.get_data()[0]);
                holt_values.push(0.0);
            }
            else{
                level.push((alpha * self.get_data()[i]) + ((1.0 - alpha) * (level[i-1] - trend[i-1])));
                trend.push(beta * (level[i] - level[i-1]) + (1.0 - beta) * trend[i-1]);
                holt_values.push(level[i-1] + trend[i-1]);
            }
        }
        holt_values
    }

    // Winter's Method
    pub fn calculate_winter(&self, alpha:f64, beta:f64, gamma:f64, period:usize) -> Vec<f64> {
        let mut level: Vec<f64> = Vec::new();
        let mut trend: Vec<f64> = Vec::new();
        let mut seasonal: Vec<f64> = Vec::new();
        let data: Vec<f64> = self.get_data();
        let mut winter_values: Vec<f64> = Vec::new();
        for i in 0..data.len(){
            if i == 0{
                level.push(data[i]);
                trend.push(0.0);
                seasonal.push(1.0);
                winter_values.push(data[i]);
            }
            else if i < period{
                level.push(alpha * (data[i] / seasonal[0]) + (1.0 - alpha) * (level[i-1] + trend[i-1]));
                trend.push(beta * (level[i] - level[i-1]) + (1.0 - beta) * trend[i-1]);
                seasonal.push(gamma * (data[i] / level[i]) + (1.0 - gamma) * seasonal[0]);
                winter_values.push(data[0]);
            } 
            else{
                level.push(alpha * (data[i] / seasonal[i-period]) + (1.0 - alpha) * (level[i-1] + trend[i-1]));
                trend.push(beta * (level[i] - level[i-1]) + (1.0 - beta) * trend[i-1]);
                seasonal.push(gamma * (data[i] / level[i]) + (1.0 - gamma) * seasonal[i-period]);
                winter_values.push((level[i-1] + trend[i-1]) * seasonal[i-period]);
            }
        }
        winter_values
    }
}
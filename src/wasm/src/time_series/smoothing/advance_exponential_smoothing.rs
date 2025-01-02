use wasm_bindgen::prelude::*;
pub use crate::Smoothing;

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
        let level_12_avg: f64 = self.get_data()[0..period].iter().sum::<f64>() / period as f64;
        let mut trend_period: Vec<f64> = Vec::new();
        let mut winter_values: Vec<f64> = Vec::new();
        for i in 0..period{
            trend_period.push(self.get_data()[i+period] - self.get_data()[i]);
        }
        for i in 0..self.get_data().len(){
            if i < period-1{
                level.push(0.0);
                trend.push(0.0);
                seasonal.push(self.get_data()[i]/level_12_avg);
                winter_values.push(0.0);
            } else if i == period-1{
                level.push(level_12_avg);
                trend.push(trend_period.iter().sum::<f64>() / (period*period) as f64);
                seasonal.push(self.get_data()[i]/level_12_avg);
                winter_values.push(0.0);
            }
            else{
                level.push(alpha * self.get_data()[i] / seasonal[i - period as usize] + (1.0 - alpha) * (level[i-1] + trend[i-1]));
                trend.push(beta * (level[i] - level[i-1]) + (1.0 - beta) * trend[i-1]);
                seasonal.push(gamma * self.get_data()[i] / level[i] + (1.0 - gamma) * seasonal[i - period as usize]);
                winter_values.push((level[i-1] - trend[i-1]) * seasonal[i - period as usize]);
            }
        }
        winter_values
    }
}
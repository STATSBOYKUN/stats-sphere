use wasm_bindgen::prelude::*;
use crate::Smoothing;

#[wasm_bindgen]
impl Smoothing {
    // Simple Moving Average Method
    pub fn calculate_sma(&self, distance: usize) -> Vec<f64> {
        let data: Vec<f64> = self.get_data();
        let mut sma_values: Vec<f64> = Vec::new();
        let mut avg: f64;
        for i in 0..data.len(){
            if i < distance-1{
                sma_values.push(0.0);
            }else{
                avg = data[i-distance+1..i+1].iter().sum::<f64>() / distance as f64;
                sma_values.push(avg);
            }
        }
        sma_values
    }

    // Double Moving Average Method
    pub fn calculate_dma(&self, distance: usize) -> Vec<f64> {
        let mut dma_values: Vec<f64> = Vec::new();
        // fisrt moving average
        let ma_st: Smoothing = Smoothing::new(self.get_data_header(), self.get_data(), self.get_time_header(), self.get_time());
        let ma_st_values:Vec<f64> = ma_st.calculate_sma(distance);
        // second moving average
        let ma_nd: Smoothing = Smoothing::new(ma_st.get_data_header(), ma_st_values.clone(), ma_st.get_time_header(), ma_st.get_time());
        let ma_nd_values:Vec<f64> = ma_nd.calculate_sma(distance);
        for i in 0..self.get_data().len(){
            if i >= 2*(distance-1){
                let a: f64 = 2.0 * ma_st_values[i] - ma_nd_values[i];
                let b: f64 = (2.0 / (distance as f64 - 1.0)) * (ma_st_values[i] - ma_nd_values[i]);
                dma_values.push(a + b);
            } 
            else{
                dma_values.push(0.0);
            }
        }
        dma_values
    }

    // Weighted Moving Average Method
    pub fn calculate_wma(&self, distance: usize) -> Vec<f64> {
        let data: Vec<f64> = self.get_data();
        let mut wma_values: Vec<f64> = Vec::new();
        let avg: f64 = data[0..distance].iter().sum::<f64>() / distance as f64;
        let mut dev: Vec<f64> = Vec::new();
        let mut weight: Vec<f64> = Vec::new();
        let mut norm_weight: Vec<f64> = Vec::new();
        for i in 0..distance{
            dev.push((data[i] - avg).abs() as f64);
            weight.push((1.0 / dev[i]) as f64);
        }
        let sum_weight = weight.iter().sum::<f64>() as f64;
        for i in 0..distance{
            norm_weight.push(weight[i] / sum_weight as f64);
        }
        for i in 0..data.len(){
            if i < distance-1{
                wma_values.push(0.0);
            }else{
                let mut sum_temp = 0.0;
                for j in 0..distance{
                    sum_temp += data[i-distance+j+1] * norm_weight[j] as f64;
                }
                wma_values.push(sum_temp);
            }
        }
        wma_values
    }
}
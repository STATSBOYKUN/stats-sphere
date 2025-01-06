use wasm_bindgen::prelude::*;
use crate::Decomposition;
use crate::time_series::smoothing::smoothing::Smoothing;

#[wasm_bindgen]
impl Decomposition{
    // Calculate seasonal index
    pub fn calculate_seasonal_index(&self, period: usize)->Vec<f64>{
        // Initialize the variables
        let mut seasonal_index_values: Vec<f64> = Vec::new();
        let mut seasonal_values: Vec<f64> = Vec::new();
        let mut smoothing = Smoothing::new(self.get_data_header(), self.get_data(), self.get_time_header(), self.get_time());
        let mut new_period = period;

        // Calculate Moving Average
        let mut ma_fixed:Vec<f64>;
        if period%2 == 0{
            let ma_first = smoothing.calculate_sma(period);
            smoothing.set_data(ma_first);
            ma_fixed = smoothing.calculate_sma(2);
            new_period = period + 1;
        }else{
            ma_fixed = smoothing.calculate_sma(period);
        }

        // Move the moving average values to the center
        let position = (new_period - (new_period%2)) / 2;
        for _i in 0..position{
            ma_fixed.remove(0);
            ma_fixed.insert(ma_fixed.len(), 0.0);
        }

        // Calculate seasonal values
        for i in 0..self.get_data().len(){
            if self.get_data()[i] == 0.0{
                seasonal_values.push(0.0);
            }else{
                seasonal_values.push(self.get_data()[i] / ma_fixed[i]);
            }
        }

        // Create vector index
        let mut index: Vec<usize> = Vec::new();
        let mut index_values = 0;
        for _i in 0..self.get_data().len(){
            if index_values == period{
                index_values = 0;
            }
            index.push(index_values);
            index_values += 1;
        }

        // Calculate seasonal index
        let mut seasonal_index: Vec<f64> = Vec::new();
        for i in 0..period{
            let mut sum = 0.0;
            let mut count = 0;
            for j in 0..self.get_data().len(){
                if index[j] == i{
                    sum += seasonal_values[j];
                    if seasonal_values[j] != 0.0{
                        count += 1;
                    }
                }
            }
            seasonal_index.push(sum / count as f64);
        }

        // Adjust the seasonal index
        let sum: f64 = seasonal_index.iter().sum::<f64>();
        for i in 0..seasonal_index.len(){
            seasonal_index[i] = seasonal_index[i] / sum * period as f64;
        }

        // Iterate the seasonal index to seasonal index values
        index_values = 0;
        for _i in 0..self.get_data().len(){
            if index_values == period{
                index_values = 0;
            }
            // deseasonalize_values.push(self.get_data()[i] / seasonal_index[index_values]);
            seasonal_index_values.push(seasonal_index[index_values]);
            index_values += 1;
        }

        // Return the result
        seasonal_index_values
    }

    // Deseasonalize the data
    pub fn deseasonalize(&self, period: usize)->Vec<f64>{
        // Initialize the variables
        let mut deseasonalize_values: Vec<f64> = Vec::new();
        let seasonal_index_values: Vec<f64> = self.calculate_seasonal_index(period);

        // Calculate deseasonalize values
        for i in 0..self.get_data().len(){
            deseasonalize_values.push(self.get_data()[i] / seasonal_index_values[i]);
        }

        // Return the result
        deseasonalize_values
    }
}
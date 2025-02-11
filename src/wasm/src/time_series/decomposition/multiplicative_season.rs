use wasm_bindgen::prelude::*;
use crate::Decomposition;

#[wasm_bindgen]
impl Decomposition{
    // Calculate seasonal index
    pub fn calculate_multiplicative_seasonal_component(&mut self, centered_ma: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let mut seasonal_indices: Vec<f64> = Vec::new(); // seasonal indices
        let mut seasonal_component: Vec<f64> = Vec::new(); // seasonal components
        let centered_ma_values: Vec<f64> = centered_ma.clone();

        // Create vector index
        let mut index: Vec<usize> = Vec::new();
        let mut index_values = 0;
        for _i in 0..self.get_data().len(){
            if index_values == self.get_period(){
                index_values = 0;
            }
            index.push(index_values as usize);
            index_values += 1;
        }

        // Calculate seasonal indices
        let mut centered_index = Vec::new();
        let position = ((self.get_period() - (self.get_period() % 2)) / 2) as usize;
        for i in 0..self.get_data().len(){
            centered_index.push(i as usize + 1);
        }
        for i in 0..self.get_period(){
            let mut sum = 0.0;
            let mut count = 0;
            for j in 0..self.get_data().len(){
                if index[j] == i as usize{
                    if centered_index[j] > position && centered_index[j] <= centered_ma_values.len() - position{
                        sum += self.get_data()[j]/centered_ma_values[j];
                        count += 1;
                    }
                }
            }
            seasonal_indices.push(sum / count as f64);
        }

        // Calculate seasonal indices correction
        let seasonal_indices_total: f64 = seasonal_indices.iter().sum();
        let seasonal_indices_correction: f64 = self.get_period() as f64;
        for i in 0..self.get_period() as usize{
            seasonal_indices[i] = seasonal_indices[i] * seasonal_indices_correction / seasonal_indices_total;
        }

        // Iterate the seasonal index to seasonal components
        index_values = 0;
        for _i in 0..self.get_data().len(){
            if index_values == self.get_period(){
                index_values = 0;
            }
            seasonal_component.push(seasonal_indices[index_values as usize]);
            index_values += 1;
        }

        // Set the seasonal indices and seasonal components
        self.set_seasonal_indices(seasonal_indices.clone());
        self.set_seasonal_component(seasonal_component.clone());

        seasonal_component
    }
}
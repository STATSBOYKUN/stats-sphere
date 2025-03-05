use wasm_bindgen::prelude::*;
use crate::Decomposition;

// Calculate Centered Moving Average
#[wasm_bindgen]
impl Decomposition{
    pub fn calculate_additive_seasonal_component(&mut self, detrended: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let mut seasonal_indices: Vec<f64> = Vec::new(); // seasonal indices
        let mut seasonal_component: Vec<f64> = Vec::new(); // seasonal components
        let detrended_values: Vec<f64> = detrended.clone();

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
        for i in 0..self.get_period(){
            let mut sum = 0.0;
            let mut count = 0;
            for j in 0..self.get_data().len(){
                if index[j] == i as usize{
                    sum += detrended_values[j];
                    count += 1;
                }
            }
            seasonal_indices.push(sum / count as f64);
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
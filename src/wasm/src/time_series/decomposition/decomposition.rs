use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Decomposition {
    data: Vec<f64>,
    data_header: String,
    time: Vec<String>,
    time_header: String,
}

#[wasm_bindgen]
impl Decomposition{
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<f64>, data_header: String, time: Vec<String>, time_header: String) -> Decomposition{
        Decomposition{
            data,
            data_header,
            time,
            time_header,
        }
    }

    // Getters
    pub fn get_data(&self) -> Vec<f64>{
        self.data.clone()
    }
    pub fn get_data_header(&self) -> String{
        self.data_header.clone()
    }
    pub fn get_time(&self) -> Vec<String>{
        self.time.clone()
    }   
    pub fn get_time_header(&self) -> String{
        self.time_header.clone()
    }
}
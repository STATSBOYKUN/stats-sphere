use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Smoothing {
    data_header: String, // Header data
    data: Vec<f64>,      // Data input
    time_header: String, // Header waktu
    time: Vec<String>,   // Waktu terkait data
}

#[wasm_bindgen]
impl Smoothing{
    #[wasm_bindgen(constructor)]
    pub fn new(data_header: String, data: Vec<f64>, time_header: String, time: Vec<String>) -> Smoothing {
        Smoothing {
            data_header,
            data,
            time_header,
            time,
        }
    }

    // Getter
    pub fn get_data_header(&self) -> String {
        self.data_header.clone()
    }
    pub fn get_data(&self) -> Vec<f64> {
        self.data.clone()
    }
    pub fn get_time(&self) -> Vec<String> {
        self.time.clone()
    }
    pub fn get_time_header(&self) -> String {
        self.time_header.clone()
    }
}
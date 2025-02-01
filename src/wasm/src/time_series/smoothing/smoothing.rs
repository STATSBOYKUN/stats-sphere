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

    // Setter
    pub fn set_data_header(&mut self, data_header: String) {
        self.data_header = data_header;
    }
    pub fn set_data(&mut self, data: Vec<f64>) {
        self.data = data;
    }
    pub fn set_time(&mut self, time: Vec<String>) {
        self.time = time;
    }
    pub fn set_time_header(&mut self, time_header: String) {
        self.time_header = time_header;
    }
}
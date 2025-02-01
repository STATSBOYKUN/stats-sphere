use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Autocorrelation {
    data: Vec<f64>,
    data_header: String,
    lag: i32,
    significance_level: f64,
}

#[wasm_bindgen]
impl Autocorrelation{
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<f64>, data_header: String, lag: i32, significance_level: f64) -> Autocorrelation{
        Autocorrelation{
            data,
            data_header,
            lag,
            significance_level,
        }
    }

    // Getters
    pub fn get_data(&self) -> Vec<f64>{
        self.data.clone()
    }
    pub fn get_data_header(&self) -> String{
        self.data_header.clone()
    }
    pub fn get_lag(&self) -> i32{
        self.lag
    }
    pub fn get_significance_level(&self) -> f64{
        self.significance_level
    }

    // Setters
    pub fn set_data(&mut self, data: Vec<f64>){
        self.data = data;
    }
    pub fn set_data_header(&mut self, data_header: String){
        self.data_header = data_header;
    }
    pub fn set_lag(&mut self, lag: i32){
        self.lag = lag;
    }
}
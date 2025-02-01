use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Decomposition {
    data: Vec<f64>,
    data_header: String,
    time: Vec<String>,
    time_header: String,
    seasonal_component: Vec<f64>,
    trend_component: Vec<f64>,
    irregular_component: Vec<f64>,
    seasonal_indices: Vec<f64>,
    period: i32,
    trend_equation: String,
}

#[wasm_bindgen]
impl Decomposition{
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<f64>, data_header: String, time: Vec<String>, time_header: String, period: i32) -> Decomposition{
        Decomposition{
            data,
            data_header,
            time,
            time_header,
            seasonal_component: Vec::new(),
            trend_component: Vec::new(),
            irregular_component: Vec::new(),
            seasonal_indices: Vec::new(),
            period,
            trend_equation: String::new(),
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
    pub fn get_seasonal_component(&self) -> Vec<f64>{
        self.seasonal_component.clone()
    }
    pub fn get_trend_component(&self) -> Vec<f64>{
        self.trend_component.clone()
    }
    pub fn get_irregular_component(&self) -> Vec<f64>{
        self.irregular_component.clone()
    }
    pub fn get_seasonal_indices(&self) -> Vec<f64>{
        self.seasonal_indices.clone()
    }
    pub fn get_period(&self) -> i32{
        self.period
    }
    pub fn get_trend_equation(&self) -> String{
        self.trend_equation.clone()
    }

    // Setters
    pub fn set_seasonal_component(&mut self, seasonal_component: Vec<f64>){
        self.seasonal_component = seasonal_component.clone();
    }
    pub fn set_trend_component(&mut self, trend_component: Vec<f64>){
        self.trend_component = trend_component.clone();
    }
    pub fn set_irregular_component(&mut self, irregular_component: Vec<f64>){
        self.irregular_component = irregular_component.clone();
    }
    pub fn set_seasonal_indices(&mut self, seasonal_indices: Vec<f64>){
        self.seasonal_indices = seasonal_indices.clone();
    }
    pub fn set_trend_equation(&mut self, trend_equation: String){
        self.trend_equation = trend_equation.clone();
    }
}
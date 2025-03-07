use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Arima {
    data: Vec<f64>,
    ar_order: i32,
    i_order: i32,
    ma_order: i32,
    res_var: f64,
    constant: f64,
    ar_coef: Vec<f64>,
    ma_coef: Vec<f64>,
}

#[wasm_bindgen]
impl Arima{
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<f64>, ar_order: i32, i_order: i32, ma_order: i32) -> Arima{
        Arima{
            data,
            ar_order,
            i_order,
            ma_order,
            res_var: 0.0,
            constant: 0.0,
            ar_coef: Vec::new(),
            ma_coef: Vec::new(),
        }
    }

    // Getters
    pub fn get_data(&self) -> Vec<f64>{
        self.data.clone()
    }
    pub fn get_ar_order(&self) -> i32{
        self.ar_order
    }
    pub fn get_i_order(&self) -> i32{
        self.i_order
    }
    pub fn get_ma_order(&self) -> i32{
        self.ma_order
    }
    pub fn get_res_var(&self) -> f64{
        self.res_var
    }
    pub fn get_constant(&self) -> f64{
        self.constant
    }
    pub fn get_ar_coef(&self) -> Vec<f64>{
        self.ar_coef.clone()
    }
    pub fn get_ma_coef(&self) -> Vec<f64>{
        self.ma_coef.clone()
    }

    // Setters
    pub fn set_data(&mut self, data: Vec<f64>){
        self.data = data;
    }
    pub fn set_res_var(&mut self, res_var: f64){
        self.res_var = res_var;
    }
    pub fn set_constant(&mut self, constant: f64){
        self.constant = constant;
    }
    pub fn set_ar_coef(&mut self, ar_coef: Vec<f64>){
        self.ar_coef = ar_coef;
    }
    pub fn set_ma_coef(&mut self, ma_coef: Vec<f64>){
        self.ma_coef = ma_coef;
    }
}
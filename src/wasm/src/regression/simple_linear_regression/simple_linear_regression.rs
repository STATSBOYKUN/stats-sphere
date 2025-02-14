use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SimpleLinearRegression{
    x: Vec<f64>,
    y: Vec<f64>,
    y_prediction: Vec<f64>,
    b0: f64,
    b1: f64,
}

#[wasm_bindgen]
impl SimpleLinearRegression{
    #[wasm_bindgen(constructor)]
    pub fn new(x: Vec<f64>, y: Vec<f64>) -> SimpleLinearRegression{
        SimpleLinearRegression{
            x,
            y,
            y_prediction: Vec::new(),
            b0: 0.0,
            b1: 0.0,
        }
    }

    // Getters
    pub fn get_x(&self) -> Vec<f64>{
        self.x.clone()
    }
    pub fn get_y(&self) -> Vec<f64>{
        self.y.clone()
    }
    pub fn get_y_prediction(&self) -> Vec<f64>{
        self.y_prediction.clone()
    }
    pub fn get_b0(&self) -> f64{
        self.b0
    }
    pub fn get_b1(&self) -> f64{
        self.b1
    }

    // Setters
    pub fn set_y_prediction(&mut self, y_prediction: Vec<f64>){
        self.y_prediction = y_prediction;
    }
    pub fn set_b0(&mut self, b0: f64){
        self.b0 = b0;
    }
    pub fn set_b1(&mut self, b1: f64){
        self.b1 = b1;
    }
}
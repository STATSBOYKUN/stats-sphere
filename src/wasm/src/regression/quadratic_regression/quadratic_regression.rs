use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct QuadraticRegression {
    x: Vec<f64>,
    y: Vec<f64>,
    y_prediction: Vec<f64>,
    beta: Vec<f64>,
}

#[wasm_bindgen]
impl QuadraticRegression {
    #[wasm_bindgen(constructor)]
    pub fn new(x: Vec<f64>, y: Vec<f64>) -> QuadraticRegression {
        QuadraticRegression {
            x,
            y,
            y_prediction: Vec::new(),
            beta: Vec::new(),
        }
    }

    #[wasm_bindgen(getter)]
    pub fn get_x(&self) -> Vec<f64> {
        self.x.clone()
    }
    pub fn get_y(&self) -> Vec<f64> {
        self.y.clone()
    }
    pub fn get_y_prediction(&self) -> Vec<f64> {
        self.y_prediction.clone()
    }
    pub fn get_beta(&self) -> Vec<f64> {
        self.beta.clone()
    }

    // Setters
    pub fn set_y_prediction(&mut self, y_prediction: Vec<f64>) {
        self.y_prediction = y_prediction;
    }
    pub fn set_beta(&mut self, beta: Vec<f64>) {
        self.beta = beta;
    }
}
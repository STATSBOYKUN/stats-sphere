use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct NoInterceptLinearRegression {
    x: Vec<f64>,
    y: Vec<f64>,
    y_prediction: Vec<f64>,
    b: f64,
}

#[wasm_bindgen]
impl NoInterceptLinearRegression {
    #[wasm_bindgen(constructor)]
    pub fn new(x: Vec<f64>, y: Vec<f64>) -> NoInterceptLinearRegression {
        NoInterceptLinearRegression {
            x,
            y,
            y_prediction: Vec::new(),
            b: 0.0,
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

    pub fn get_b(&self) -> f64 {
        self.b
    }

    pub fn set_y_prediction(&mut self, y_prediction: Vec<f64>) {
        self.y_prediction = y_prediction;
    }

    pub fn set_b(&mut self, b: f64) {
        self.b = b;
    }
}
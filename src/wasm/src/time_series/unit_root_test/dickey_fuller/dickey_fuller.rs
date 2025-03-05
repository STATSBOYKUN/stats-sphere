use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DickeyFuller {
    data: Vec<f64>,
    equation: String,
    level: String,
    b: f64,
    se: f64,
    test_stat: f64,
}

#[wasm_bindgen]
impl DickeyFuller {
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<f64>, equation: String, level: String) -> DickeyFuller {
        DickeyFuller {
            data,
            equation,
            level,
            b: 0.0,
            se: 0.0,
            test_stat: 0.0,
        }
    }

    // Getters
    pub fn get_data(&self) -> Vec<f64> {
        self.data.clone()
    }
    pub fn get_equation(&self) -> String {
        self.equation.clone()
    }
    pub fn get_level(&self) -> String {
        self.level.clone()
    }
    pub fn get_b(&self) -> f64 {
        self.b
    }
    pub fn get_se(&self) -> f64 {
        self.se
    }
    pub fn get_test_stat(&self) -> f64 {
        self.test_stat
    }

    // Setters
    pub fn set_data(&mut self, data: Vec<f64>) {
        self.data = data;
    }
    pub fn set_equation(&mut self, equation: String) {
        self.equation = equation;
    }
    pub fn set_level(&mut self, level: String) {
        self.level = level;
    }
    pub fn set_b(&mut self, b: f64) {
        self.b = b;
    }
    pub fn set_se(&mut self, se: f64) {
        self.se = se;
    }
    pub fn set_test_stat(&mut self, test_stat: f64) {
        self.test_stat = test_stat;
    }
}
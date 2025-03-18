use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DickeyFuller {
    data: Vec<f64>,
    equation: String,
    level: String,
    b: f64,
    se: f64,
    test_stat: f64,
    b_vec: Vec<f64>,
    se_vec: Vec<f64>,
    test_stat_vec: Vec<f64>,
    p_value_vec: Vec<f64>,
    sel_crit: Vec<f64>,
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
            b_vec: Vec::new(),
            se_vec: Vec::new(),
            test_stat_vec: Vec::new(),
            p_value_vec: Vec::new(),
            sel_crit: Vec::new(),
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
    pub fn get_b_vec(&self) -> Vec<f64> {
        self.b_vec.clone()
    }
    pub fn get_se_vec(&self) -> Vec<f64> {
        self.se_vec.clone()
    }
    pub fn get_test_stat_vec(&self) -> Vec<f64> {
        self.test_stat_vec.clone()
    }
    pub fn get_p_value_vec(&self) -> Vec<f64> {
        self.p_value_vec.clone()
    }
    pub fn get_sel_crit(&self) -> Vec<f64> {
        self.sel_crit.clone()
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
    pub fn set_b_vec(&mut self, b_vec: Vec<f64>) {
        self.b_vec = b_vec;
    }
    pub fn set_se_vec(&mut self, se_vec: Vec<f64>) {
        self.se_vec = se_vec;
    }
    pub fn set_test_stat_vec(&mut self, test_stat_vec: Vec<f64>) {
        self.test_stat_vec = test_stat_vec;
    }
    pub fn set_p_value_vec(&mut self, p_value_vec: Vec<f64>) {
        self.p_value_vec = p_value_vec;
    }
    pub fn set_sel_crit(&mut self, sel_crit: Vec<f64>) {
        self.sel_crit = sel_crit;
    }
}
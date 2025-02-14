use wasm_bindgen::prelude::*;
use crate::{MultipleLinearRegression, NoInterceptLinearRegression, SimpleLinearRegression};
use crate::time_series::difference::difference::{first_difference, second_difference};

#[wasm_bindgen]
pub struct DickeyFuller {
    data: Vec<f64>,
    equation: String,
    level: String,
    b: f64,
    se: f64,
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
    pub fn get_t_statistic(&self) -> f64 {
        self.get_b() / self.get_se()
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

    // Calculate the Dickey-Fuller test
    pub fn calculate_df(&mut self){
        // Initialize the variables
        let data: Vec<f64> = self.get_data().clone();
        let mut t: Vec<f64> = Vec::new();
        let mut x: Vec<f64> = Vec::new();
        let mut y: Vec<f64> = Vec::new();
        let b: f64;
        let se: f64;     

        match self.get_level().as_str() {
            "first-difference" => {
                let difference = first_difference(data.clone());
                for i in 1..difference.len(){
                    t.push(i as f64 + 1.0);
                    x.push(difference[i - 1]);
                    y.push(difference[i]);
                }
            },
            "second-difference" => {
                let difference = second_difference(data.clone());
                for i in 1..difference.len(){
                    t.push(i as f64 + 1.0);
                    x.push(difference[i - 1]);
                    y.push(difference[i]);
                }
            },
            _ => {
                for i in 1..data.len(){
                    t.push(i as f64 + 1.0);
                    x.push(data[i - 1]);
                    y.push(data[i]);
                }
            },
        }
        
        match self.get_equation().as_str() {
            "none" => {
                let mut none = NoInterceptLinearRegression::new(x.clone(), y.clone());
                none.calculate_regression();
                b = none.get_b();
                se = none.calculate_standard_error();
            },
            "intercept" => {
                let mut intercept = SimpleLinearRegression::new(x.clone(), y.clone());
                intercept.calculate_regression();
                b = intercept.get_b1();
                se = intercept.calculate_standard_error();
            },
            "trend-and-intercept" => {
                let mut trend_and_intercept;
                let mut x_matriks: Vec<Vec<f64>> = Vec::new();
                x_matriks.push(t.clone());
                x_matriks.push(x.clone());
                let x_matriks_js = serde_wasm_bindgen::to_value(&x_matriks).unwrap();
                trend_and_intercept = MultipleLinearRegression::new(x_matriks_js, y.clone());
                trend_and_intercept.calculate_regression();
                let b_vector: Vec<f64> = trend_and_intercept.get_beta();
                let se_vector: Vec<f64> = trend_and_intercept.calculate_standard_error();
                b = b_vector[2];
                se = se_vector[2];
            }
            _ => {
                b = 0.0;
                se = 0.0;
            },
        }

        self.set_b(b);
        self.set_se(se);
    }
}
use wasm_bindgen::prelude::*;
use crate::DickeyFuller;
use crate::{mckinnon_p_value, mckinnon_critical_values, MultipleLinearRegression, NoInterceptLinearRegression, SimpleLinearRegression};
use crate::time_series::difference::difference::{first_difference, second_difference};

#[wasm_bindgen]
impl DickeyFuller{
    // Calculate P-Value
    pub fn calculate_pvalue(&self) -> f64 {
        let p_value = mckinnon_p_value(self.get_test_stat(), 1, &self.get_equation(), self.get_data().len() as f64);
        p_value
    }

    // Calculate Critical Value
    pub fn calculate_critical_value(&self) -> Vec<f64> {
        let mut critical_values: Vec<f64> = Vec::new();
        for level in ["1%", "5%", "10%"].iter() {
            let c_hat = mckinnon_critical_values(1, &self.get_equation(), level, self.get_data().len() as f64).unwrap();
            critical_values.push(c_hat);
        }
        critical_values
    }

    // Calculate the Dickey-Fuller test
    pub fn calculate_test_stat(&mut self) -> f64 {
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
                self.set_data(difference.clone());
                for i in 1..difference.len(){
                    t.push(i as f64 + 1.0);
                    x.push(difference[i - 1]);
                    y.push(difference[i]);
                }
            },
            "second-difference" => {
                let difference = second_difference(data.clone());
                self.set_data(difference.clone());
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
            "no_constant" => {
                let mut none = NoInterceptLinearRegression::new(x.clone(), y.clone());
                none.calculate_regression();
                b = none.get_b();
                se = none.calculate_standard_error();
            },
            "no_trend" => {
                let mut intercept = SimpleLinearRegression::new(x.clone(), y.clone());
                intercept.calculate_regression();
                b = intercept.get_b1();
                se = intercept.calculate_standard_error();
            },
            "with_trend" => {
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
        self.set_test_stat(b / se);
        b / se
    }
}
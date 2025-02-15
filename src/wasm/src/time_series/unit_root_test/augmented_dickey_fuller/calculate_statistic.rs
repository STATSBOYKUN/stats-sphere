use wasm_bindgen::prelude::*;
use crate::AugmentedDickeyFuller;
use crate::{mckinnon_p_value, mckinnon_critical_values, MultipleLinearRegression};
use crate::time_series::difference::difference::{first_difference, second_difference};

#[wasm_bindgen]
impl AugmentedDickeyFuller {
    pub fn calculate_get_pvalue(&self) -> f64 {
        let p_value = mckinnon_p_value(self.get_test_stat(), self.get_lag() + 1, &self.get_equation(), self.get_data().len() as f64);
        p_value
    }

    pub fn calculate_critical_value(&self) -> Vec<f64> {
        let mut critical_values: Vec<f64> = Vec::new();
        for level in ["1%", "5%", "10%"].iter() {
            let c_hat = mckinnon_critical_values(self.get_lag() + 1, &self.get_equation(), level, self.get_data().len() as f64).unwrap();
            critical_values.push(c_hat);
        }
        critical_values
    }

    pub fn calculate_test_stat(&mut self) -> f64 {
        // Initialize the variables
        let data: Vec<f64> = self.get_data().clone();
        let mut t: Vec<f64> = Vec::new();
        let mut x: Vec<f64> = Vec::new();
        let mut y: Vec<f64> = Vec::new();
        let mut lag_values: Vec<Vec<f64>> = Vec::new();
        let b: f64;
        let se: f64;     

        match self.get_level().as_str() {
            "first-difference" => {
                let mut difference: Vec<f64> = first_difference(data.clone());
                self.set_data(difference.clone());
                for i in 1..self.get_lag() + 1{
                    difference.remove(0);
                    let mut lag_tmp = difference.clone();
                    if self.get_lag() - i > 0{
                        for _ in 0..self.get_lag() - i{
                            lag_tmp.remove(lag_tmp.len() - 1);    
                        }  
                    }
                    lag_values.push(lag_tmp.clone());    
                }
                for i in 1..difference.len(){
                    t.push(i as f64 + 1.0);
                    x.push(difference[i - 1]);
                    y.push(difference[i]);
                }
            },
            "second-difference" => {
                let mut difference = second_difference(data.clone());
                self.set_data(difference.clone());
                for i in 1..self.get_lag() + 1{
                    difference.remove(0);
                    let mut lag_tmp = difference.clone();
                    if self.get_lag() - i > 0{
                        for _ in 0..self.get_lag() - i{
                            lag_tmp.remove(lag_tmp.len() - 1);    
                        }  
                    }
                    lag_values.push(lag_tmp.clone());    
                }
                for i in 1..difference.len(){
                    t.push(i as f64 + 1.0);
                    x.push(difference[i - 1]);
                    y.push(difference[i]);
                }
            },
            _ => {
                let mut difference = data.clone();
                self.set_data(difference.clone());
                for i in 1..self.get_lag() + 1{
                    difference.remove(0);
                    let mut lag_tmp = difference.clone();
                    if self.get_lag() - i > 0{
                        for _ in 0..self.get_lag() - i{
                            lag_tmp.remove(lag_tmp.len() - 1);    
                        }  
                    }
                    lag_values.push(lag_tmp.clone());    
                }
                for i in 1..difference.len(){
                    t.push(i as f64 + 1.0);
                    x.push(difference[i - 1]);
                    y.push(difference[i]);
                }
            },
        }

        match self.get_equation().as_str() {
            "no_trend" => {
                let mut intercept: MultipleLinearRegression;
                let mut x_matriks: Vec<Vec<f64>> = Vec::new();
                for i in 0..self.get_lag() as usize{
                    x_matriks.push(lag_values[i].clone());
                }
                x_matriks.push(x.clone());
                intercept = MultipleLinearRegression::new(serde_wasm_bindgen::to_value(&x_matriks).unwrap(), y.clone());
                intercept.calculate_regression();
                b = intercept.get_beta()[self.get_lag() as usize + 1];
                se = intercept.calculate_standard_error()[self.get_lag() as usize + 1];
            },
            "with_trend" => {
                let mut trend_and_intercept;
                let mut x_matriks: Vec<Vec<f64>> = Vec::new();
                for i in 0..self.get_lag() as usize{
                    x_matriks.push(lag_values[i].clone());
                }
                x_matriks.push(t.clone());
                x_matriks.push(x.clone());
                trend_and_intercept = MultipleLinearRegression::new(serde_wasm_bindgen::to_value(&x_matriks).unwrap(), y.clone());
                trend_and_intercept.calculate_regression();
                b = trend_and_intercept.get_beta()[self.get_lag() as usize + 2];
                se = trend_and_intercept.calculate_standard_error()[self.get_lag() as usize + 2];
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
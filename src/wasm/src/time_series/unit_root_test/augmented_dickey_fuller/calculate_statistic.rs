use wasm_bindgen::prelude::*;
use crate::AugmentedDickeyFuller;
use crate::{calculate_p_value, calculate_critical_values, MultipleLinearRegression};
use crate::time_series::difference::difference::{first_difference, second_difference};

#[wasm_bindgen]
impl AugmentedDickeyFuller {
    pub fn calculate_pvalue(&self) -> f64 {
        let p_value = calculate_p_value(self.get_test_stat(), 1 + self.get_lag(), &self.get_equation());
        p_value
    }

    pub fn calculate_critical_value(&self) -> Vec<f64> {
        let mut critical_values: Vec<f64> = Vec::new();
        for level in ["1%", "5%", "10%"].iter() {
            let c_hat = calculate_critical_values(1 + self.get_lag() as u8, &self.get_equation(), level, self.get_data().len() as f64);
            critical_values.push(c_hat);
        }
        critical_values
    }

    pub fn calculate_test_stat(&mut self) -> f64 {
        let mut t: Vec<f64> = Vec::new();
        let mut x: Vec<f64> = Vec::new();
        let mut y: Vec<f64> = Vec::new();
    
        match self.get_level().as_str() {
            "first-difference" => {
                let diff_data = first_difference(self.get_data().clone());
                self.set_data(diff_data);
            },
            "second-difference" => {
                let diff_data = second_difference(self.get_data().clone());
                self.set_data(diff_data);
            },
            _ => {}
        }
    
        let data = self.get_data();  // Simpan reference agar lebih efisien
        let difference: Vec<f64> = first_difference(data.clone());
        let mut lag_values: Vec<Vec<f64>> = Vec::new();
    
        for i in 1..=self.get_lag(){
            let mut lag_tmp = Vec::new();
            for j in self.get_lag() as usize - i as usize..difference.len() - i as usize {
                lag_tmp.push(data[j]);
            }            
            lag_values.push(lag_tmp.clone());    
        }
        for i in self.get_lag() as usize..difference.len() {
            t.push(i as f64 + 1.0);
            x.push(self.get_data()[i]);
            y.push(difference[i]);
        }
    
        if lag_values[0].len() as usize != x.len() as usize {
            return lag_values[0].len() as f64 / x.len() as f64;
        }
        let (b, se) = match self.get_equation().as_str() {
            "no_trend" => {
                let mut x_matriks: Vec<Vec<f64>> = lag_values.clone();
                x_matriks.push(x.clone());
    
                // Konversi ke nilai JS; jika gagal, panik dengan pesan jelas
                let x_matriks_js = serde_wasm_bindgen::to_value(&x_matriks).expect("Gagal mengkonversi x_matriks ke JS value");
                let mut reg = MultipleLinearRegression::new(x_matriks_js, y.clone());
                reg.calculate_regression();
                let b_vector = reg.get_beta();
                let se_vector = reg.calculate_standard_error();
                (b_vector[x_matriks.len()], se_vector[x_matriks.len()])
            },
            "with_trend" => {
                let mut x_matriks: Vec<Vec<f64>> = lag_values.clone();
                x_matriks.push(t.clone());
                x_matriks.push(x.clone());
    
                // Konversi ke nilai JS; jika gagal, panik dengan pesan jelas
                let x_matriks_js = serde_wasm_bindgen::to_value(&x_matriks).expect("Gagal mengkonversi x_matriks ke JS value");
                let mut reg = MultipleLinearRegression::new(x_matriks_js, y.clone());
                reg.calculate_regression();
                let b_vector = reg.get_beta();
                let se_vector = reg.calculate_standard_error();
                (b_vector[x_matriks.len()], se_vector[x_matriks.len()])
            }
            _ => {(0.0, 0.0)}
        };
        let test_stat = if se != 0.0 { b / se } else { 0.0 };
        self.set_b(b);
        self.set_se(se);
        self.set_test_stat(test_stat);
        test_stat
    }    
}
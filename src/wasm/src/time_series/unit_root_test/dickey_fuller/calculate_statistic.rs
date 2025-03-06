use wasm_bindgen::prelude::*;
use crate::DickeyFuller;
use crate::{calculate_p_value, calculate_critical_values, MultipleLinearRegression, NoInterceptLinearRegression, SimpleLinearRegression};
use crate::{first_difference, second_difference};

#[wasm_bindgen]
impl DickeyFuller{
    // Calculate P-Value
    pub fn calculate_pvalue(&self) -> f64 {
        let p_value = calculate_p_value(self.get_test_stat(), 1, &self.get_equation());
        p_value
    }

    // Calculate Critical Value
    pub fn calculate_critical_value(&self) -> Vec<f64> {
        let mut critical_values: Vec<f64> = Vec::new();
        for level in ["1%", "5%", "10%"].iter() {
            let c_hat = calculate_critical_values(1, &self.get_equation(), level, self.get_data().len() as f64);
            critical_values.push(c_hat);
        }
        critical_values
    }

    // Calculate the Dickey-Fuller test
    pub fn calculate_test_stat(&mut self) -> f64 {
        // Initialize the variables
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

        let difference = first_difference(self.get_data().clone());
        for i in 0..difference.len(){
            t.push(i as f64 + 2.0);
            x.push(self.get_data()[i]);
            y.push(difference[i]);
        }
        
        let (b, se) = match self.get_equation().as_str() {
            "no_constant" => {
                let mut reg = NoInterceptLinearRegression::new(x.clone(), y.clone());
                reg.calculate_regression();
                (reg.get_b(), reg.calculate_standard_error())
            },
            "no_trend" => {
                let mut reg = SimpleLinearRegression::new(x.clone(), y.clone());
                reg.calculate_regression();
                (reg.get_b1(), reg.calculate_standard_error())
            },
            "with_trend" => {
                // Buat matriks X dengan tren (t) dan data (x)
                let x_matriks = vec![t.clone(), x.clone()];
                // Konversi ke nilai JS; jika gagal, panik dengan pesan jelas
                let x_matriks_js = serde_wasm_bindgen::to_value(&x_matriks)
                    .expect("Gagal mengkonversi x_matriks ke JS value");
                let mut reg = MultipleLinearRegression::new(x_matriks_js, y.clone());
                reg.calculate_regression();
                let b_vector = reg.get_beta();
                let se_vector = reg.calculate_standard_error();
                // Pastikan indeks 2 ada dan standard error tidak nol
                (b_vector[2] as f64, se_vector[2] as f64)
            },
            _ => (0.0, 0.0),
        };

        // Hindari pembagian dengan nol
        let test_stat = if se != 0.0 { b / se } else { 0.0 };
        self.set_b(b);
        self.set_se(se);
        self.set_test_stat(test_stat);
        test_stat
    }
}
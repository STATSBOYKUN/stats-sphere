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
        let n = self.get_data().len() - 1;
        for level in ["1%", "5%", "10%"].iter() {
            let c_hat = calculate_critical_values(n as u8, &self.get_equation(), level);
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
        let mut data_prepare = self.get_data();
    
        match self.get_level().as_str() {
            "first-difference" => {
                let diff_data = first_difference(data_prepare.clone());
                data_prepare = diff_data;
            },
            "second-difference" => {
                let diff_data = second_difference(data_prepare.clone());
                data_prepare = diff_data;
            },
            _ => {}
        }
    
        let data = data_prepare; 
        let difference = first_difference(data.clone());
        for i in 0..difference.len(){
            t.push(i as f64 + 2.0);
            x.push(data[i]);
            y.push(difference[i]);
        }
        
        let (b, se, b_vec, se_vec, stat_test_vec, p_value_vec, sel_crit) = match self.get_equation().as_str() {
            "no_constant" => {
                let mut reg = NoInterceptLinearRegression::new(x.clone(), y.clone());
                reg.calculate_regression();
                let b = reg.get_b();
                let se = reg.calculate_standard_error();
                let test_stat = reg.calculate_t_stat();
                let p_value = reg.calculate_pvalue();
                let sel_crit = vec![
                    reg.calculate_r2(), reg.calculate_r2_adj(),
                    reg.calculate_se_reg(), reg.calculate_sse(),
                    reg.calculate_log_likelihood(), reg.calculate_mean_dep(), reg.calculate_sd_dep(),
                    reg.calculate_aic(), reg.calculate_sbc(), reg.calculate_hqc(), reg.calculate_dw()
                ];
                (b, se, vec![b], vec![se], vec![test_stat], vec![p_value], sel_crit)
            },
            "no_trend" => {
                let mut reg = SimpleLinearRegression::new(x.clone(), y.clone());
                reg.calculate_regression();
                let b = vec![reg.get_b0(), reg.get_b1()];
                let se = reg.calculate_standard_error();
                let test_stat = reg.calculate_t_stat();
                let p_value = reg.calculate_pvalue();
                let sel_crit = vec![
                    reg.calculate_r2(), reg.calculate_r2_adj(),
                    reg.calculate_se_reg(), reg.calculate_sse(),
                    reg.calculate_log_likelihood(), reg.calculate_f_stat(),
                    reg.calculate_f_prob(), reg.calculate_mean_dep(), reg.calculate_sd_dep(),
                    reg.calculate_aic(), reg.calculate_sbc(), reg.calculate_hqc(), reg.calculate_dw()
                ];
                (b[1], se[1], b, se, test_stat, p_value, sel_crit)
            },
            "with_trend" => {
                // Buat matriks X dengan tren (t) dan data (x)
                let x_matriks = vec![t.clone(), x.clone()];
                // Konversi ke nilai JS; jika gagal, panik dengan pesan jelas
                let x_matriks_js = serde_wasm_bindgen::to_value(&x_matriks)
                    .expect("Gagal mengkonversi x_matriks ke JS value");
                let mut reg = MultipleLinearRegression::new(x_matriks_js, y.clone());
                reg.calculate_regression();
                let b = reg.get_beta();
                let se = reg.calculate_standard_error();
                let test_stat = reg.calculate_t_stat();
                let p_value = reg.calculate_pvalue();
                let sel_crit = vec![
                    reg.calculate_r2(), reg.calculate_r2_adj(),
                    reg.calculate_se_reg(), reg.calculate_sse(),
                    reg.calculate_log_likelihood(), reg.calculate_f_stat(),
                    reg.calculate_f_prob(), reg.calculate_mean_dep(), reg.calculate_sd_dep(),
                    reg.calculate_aic(), reg.calculate_sbc(), reg.calculate_hqc(), reg.calculate_dw()
                ];
                // Pastikan indeks 2 ada dan standard error tidak nol
                (b[2], se[2], b, se, test_stat, p_value, sel_crit)
            },
            _ => (0.0, 0.0, vec![0.0], vec![0.0], vec![0.0], vec![0.0], vec![0.0, 0.0]),
        };

        // Hindari pembagian dengan nol
        let test_stat = if se != 0.0 { b / se } else { 0.0 };
        self.set_b(b);
        self.set_se(se);
        self.set_test_stat(test_stat);
        self.set_b_vec(b_vec);
        self.set_se_vec(se_vec);
        self.set_test_stat_vec(stat_test_vec);
        self.set_p_value_vec(p_value_vec);
        self.set_sel_crit(sel_crit);
        test_stat
    }
}
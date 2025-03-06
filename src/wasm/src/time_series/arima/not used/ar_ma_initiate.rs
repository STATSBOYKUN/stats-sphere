use wasm_bindgen::prelude::*;
use crate::{Arima, Autocorrelation, ma_newton_rapson};
use arima::acf;

#[wasm_bindgen]
impl Arima{
    pub fn initiate_ar_coef(&self)-> Vec<f64>{
        let data = self.get_data();
        let ar_order: usize = self.get_ar_order() as usize;
        let (ar_coef,_var) = acf::ar(&data, Some(ar_order)).unwrap();
        ar_coef
    }

    pub fn initiate_ma_coef_ma(&self)-> Vec<f64>{
        let ma_order: usize = self.get_ma_order() as usize;
        ma_newton_rapson(ma_order)
    }

    pub fn initiate_ma_coef_arma(&mut self)-> Vec<f64>{
        let data = self.get_data();
        let mut ar_coef = self.initiate_ar_coef();
        ar_coef.insert(0, -1.0);
        let ar_order: usize = self.get_ar_order() as usize;
        let ma_order: usize = self.get_ma_order() as usize;
        
        let autocorrelation = Autocorrelation::new(data.clone(), "data".to_string(), (ar_order + ma_order) as i32);
        let mut rho = autocorrelation.calculate_acf(data.clone());
        rho.insert(0, 0.0);
        
        // Calculate rho_aposthrope
        let mut rho_aposthrope = Vec::new();
        for i in 0..ma_order + 1{
            let mut sum_ar_rho = 0.0;
            for j in 0..ar_order + 1{
                sum_ar_rho += ar_coef[j].powi(2) * rho[i];
            }
            let mut ar_ar_lag_rho_rho_lag = 0.0;
            for j in 1..ar_order + 1{
                let mut ar_ar_lag = 0.0;
                let mut ind: usize = 0; 
                for k in j..ar_order + 1{
                    ar_ar_lag += ar_coef[ind] * ar_coef[k];
                    ind += 1;
                }
                let rho_rho_lag ;
                if i < j{
                    rho_rho_lag = rho[i+j];
                }else {
                    rho_rho_lag = rho[i+j]+rho[i-j];
                }
                ar_ar_lag_rho_rho_lag += ar_ar_lag * rho_rho_lag;
            }
            rho_aposthrope.push(sum_ar_rho + ar_ar_lag_rho_rho_lag);
        }
        
        // Initiate ma_coef_init
        let mut ma_coef_init = Vec::new();
        for _ in 0..ma_order + 1{
            ma_coef_init.push(0.0);
        }
        let mut ma_coef_init_sum = 0.0;
        for i in 0..ma_order + 1{
            if i == 0{
                ma_coef_init_sum += 1.0;
            } else {
                ma_coef_init_sum += ma_coef_init[i];
            }
        }
        let mut var_init = rho_aposthrope[0] / ma_coef_init_sum;

        // Loop to calculate ma_coef_init
        loop{
            let mut ma_coef_tmp = Vec::new();
            ma_coef_tmp.push(0.0);
            let q = ma_order;
            for i in 1..q + 1{
                let mut comp = rho_aposthrope[i] / var_init;
                for j in i..q + 1{
                    if j == q{
                        comp -= 0.0;
                    }
                    comp -= ma_coef_init[q - j] * ma_coef_init[q];
                }
                ma_coef_tmp.push(-comp);
            }
            let mut ma_coef_tmp_sum = 0.0;
            for i in 0..q + 1{
                if i == 0{
                    ma_coef_tmp_sum += 1.0;
                } else {
                    ma_coef_tmp_sum += ma_coef_tmp[i];
                }
            }
            let var_tmp = rho_aposthrope[0] / ma_coef_tmp_sum;
            let diff_var = (var_tmp - var_init).abs();

            if diff_var < 1e-7{
                var_init = var_tmp;
                ma_coef_init = ma_coef_tmp.clone();
                break;
            }
            var_init = var_tmp;
            ma_coef_init = ma_coef_tmp.clone();
        }
        self.set_res_var(var_init);
        ma_coef_init
    }
}
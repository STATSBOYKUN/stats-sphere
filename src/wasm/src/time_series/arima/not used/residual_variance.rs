use wasm_bindgen::prelude::*;
use crate::Arima;
use crate::Autocorrelation;

#[wasm_bindgen]
impl Arima{
    pub fn calculate_res_var_ar(&mut self) -> f64{
        let data = self.get_data();
        let ar_coef = self.initiate_ar_coef();
        let ar_order: usize = self.get_ar_order() as usize;
        let autocorrelation = Autocorrelation::new(data.clone(), "data".to_string(), ar_order as i32);
        let rho = autocorrelation.calculate_acf(data.clone());

        // Calculate Data Variance
        let data_bar = data.iter().sum::<f64>() / data.len() as f64;
        let var_data = data.iter().map(|x| (x - data_bar).powi(2)).sum::<f64>() / data.len() as f64 - 1.0;

        // Calculate Residual Variance
        let ar_coef_rho_sum = (0..ar_order).map(|i| ar_coef[i] * rho[i]).sum::<f64>();
        let res_var = var_data * (1.0 - ar_coef_rho_sum);
        self.set_res_var(res_var);
        res_var
    }

    pub fn calculate_res_var_ma(&mut self) -> f64{
        let ma_order: usize = self.get_ma_order() as usize;
        let ma_coef = self.initiate_ma_coef_ma();
        let mut sum_ma_coef = 0.0;
        for i in 0..=ma_order{
            if i == 0{
                sum_ma_coef += 1.0;
            }else{
                sum_ma_coef += ma_coef[i].powi(2);
            }
        }

        // Calculate Data Variance
        let data = self.get_data();
        let data_bar = data.iter().sum::<f64>() / data.len() as f64;
        let var_data = data.iter().map(|x| (x - data_bar).powi(2)).sum::<f64>() / data.len() as f64 - 1.0;

        // Calculate Residual Variance
        let res_var = var_data / sum_ma_coef;
        self.set_res_var(res_var);
        res_var
    }

    pub fn calculate_res_var_wn(&mut self) -> f64{
        let data = self.get_data();

        // Calculate Data Variance = Residual Variance
        let data_bar = data.iter().sum::<f64>() / data.len() as f64;
        let res_var = data.iter().map(|x| (x - data_bar).powi(2)).sum::<f64>() / data.len() as f64 - 1.0;
        self.set_res_var(res_var);
        res_var
    }
}
use wasm_bindgen::prelude::*;
use crate::Arima;
// use arima::sim;
// use rand_distr::{Distribution, Normal};
// use rand::thread_rng;

#[wasm_bindgen]
impl Arima{
    pub fn forecast(&self) -> Vec<f64> {
        let intercept = self.get_constant();
        let ar = self.get_ar_coef();
        let ma = self.get_ma_coef();
        let data = self.get_data();
        let residual = self.est_res(intercept, ar.clone(), ma.clone(), data.clone());
        let mut forecast = Vec::new();
        if self.get_i_order() == 0 {
            for i in 0..data.len(){
                let mut sum = intercept;
                for j in 1..=ar.len(){
                    if i >= j {
                        sum += ar[j-1] * data[i-j];
                    }
                }
                for j in 1..=ma.len(){
                    if i >= j {
                        sum -= ma[j-1] * residual[i-j];
                    }
                }
                forecast.push(sum);
            }
        } else {
            let mut ar_adj = Vec::new();
            for i in 0..=ar.len(){
                if i == 0{
                    ar_adj.push(1.0 + ar[i]);
                } else if i == ar.len(){
                    ar_adj.push(ar[i-1]);
                } else {
                    ar_adj.push(ar[i-1] - ar[i]);
                }
            }
            for i in 0..data.len(){
                let mut sum = intercept;
                for j in 1..=ar_adj.len(){
                    if i >= j {
                        if j == 1 {
                            sum += ar_adj[j-1] * data[i-j];
                        }else {
                            sum -= ar_adj[j-1] * data[i-j];
                        }
                    }
                }
                for j in 1..=ma.len(){
                    if i >= j {
                        sum += ma[j-1] * residual[i-j];
                    }
                }
                forecast.push(sum);
            }
        }
        forecast
        // let var_res = self.res_variance();
        // let normal = Normal::new(0.0, var_res).unwrap();
        // let forecast = sim::arima_forecast(
        //     &data, 
        //     n, 
        //     Some(&self.get_ar_coef()), 
        //     Some(&self.get_ma_coef()), 
        //     self.get_i_order() as usize, 
        //     &|_, mut rng| { normal.sample(&mut rng) },
        //     &mut thread_rng()
        // ).unwrap();
        // forecast
    }
}
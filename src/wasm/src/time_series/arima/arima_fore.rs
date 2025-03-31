use wasm_bindgen::prelude::*;
use crate::{Arima, first_difference};
// use arima::sim;
// use rand_distr::{Distribution, Normal};
// use rand::thread_rng;

#[wasm_bindgen]
impl Arima{
    pub fn forecast(&self) -> Vec<f64> {
        let intercept = self.get_constant();
        let ar = self.get_ar_coef();
        let ma = self.get_ma_coef();
        let mut data = self.get_data();
        if self.get_i_order() > 0 {
            for _ in 0..self.get_i_order() {
                let diff = first_difference(data.clone());
                data = diff;
            }
        }
        let residual = self.est_res2(intercept, ar.clone(), ma.clone(), data);
        let data = self.get_data();
        let mut forecast = Vec::new();
        if ar.len() == 0 && ma.len() == 0 {
            for i in 0..data.len(){
                let mut sum = intercept;
                if i < residual.len() {
                    sum += residual[i];
                }
                forecast.push(sum);
            }
        } else if self.get_i_order() == 0 {
            for i in 0..data.len(){
                let mut sum = intercept;
                for j in 1..=ar.len(){
                    if i >= j {
                        sum += ar[j-1] * data[i-j];
                    }
                }
                for j in 1..=ma.len(){
                    if i >= j && i < residual.len() {
                        sum -= ma[j-1] * residual[i-j];
                    }
                }
                forecast.push(sum);
            }
        } else if self.get_i_order() == 1 {
            let mut ar_adj = Vec::new();
            if ar.len() > 0{
                for i in 0..=ar.len(){
                    if i == 0{
                        ar_adj.push(1.0 + ar[i]);
                    } else if i == ar.len(){
                        ar_adj.push(ar[i-1]);
                    } else {
                        ar_adj.push(ar[i-1] - ar[i]);
                    }
                }
            }
            for i in 0..data.len(){
                let mut sum = intercept;
                if ar.len() > 0{
                    for j in 1..=ar_adj.len(){
                        if i >= j {
                            if j == 1 {
                                sum += ar_adj[j-1] * data[i-j];
                            }else {
                                sum -= ar_adj[j-1] * data[i-j];
                            }
                        }
                    }
                }
                for j in 1..=ma.len(){
                    if i >= j {
                        sum -= ma[j-1] * residual[i-j];
                    }
                }
                forecast.push(sum);
            }
        } else if self.get_i_order() == 2 {
            let mut ar_tmp = Vec::new();
            if ar.len() > 0 {
                for i in 0..ar.len()+2{
                    if i == 0 {
                        ar_tmp.push(-1.0);
                    } else if i == ar.len()+1 {
                        ar_tmp.push(0.0);
                    } else {
                        ar_tmp.push(ar[i-1]);
                    }
                }
            }
            let mut ar_adj = Vec::new();
            if ar.len() > 0 {
                for i in 0..ar_tmp.len(){
                    if i == 0 {
                        ar_adj.push(2.0 + ar[0]);
                    } else if i == ar_tmp.len()-1 {
                        ar_adj.push(ar[ar.len()-1]);
                    } else {
                        ar_adj.push (ar_tmp[i] - 2.0*ar_tmp[i-1] - ar_tmp[i-2]);
                    }
                }
            }
            for i in 0..data.len(){
                let mut sum = intercept;
                if ar.len() > 0 {
                    for j in 1..=ar_adj.len(){
                        if i >= j {
                            if j == ar_adj.len() {
                                sum -= ar_adj[j-1] * data[i-j];
                            } else {
                                sum += ar_adj[j-1] * data[i-j];
                            }
                        }
                    }
                }
                for j in 1..=ma.len(){
                    if i >= j && i < residual.len() {
                        sum -= ma[j-1] * residual[i-j];
                    }
                }
                forecast.push(sum);
            }
        }
        forecast
        // let data = self.get_data();
        // let sse = self.res_variance();
        // let var_res = sse / data.len() as f64;
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
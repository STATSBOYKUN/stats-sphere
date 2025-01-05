use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use js_sys::{Object, Reflect};
use crate::Smoothing;
use crate::time_series::evaluation::evaluation::*;

#[wasm_bindgen]
impl Smoothing {
    pub fn smoothing_evaluation(&self, forecast: Vec<f64>) -> JsValue {
        let mut data_copy = self.get_data().clone();
        let mut forecast_copy = forecast.clone();
        for i in 0..forecast_copy.len(){
            if forecast_copy[i] == 0.0{
                forecast_copy.remove(i);
                data_copy.remove(i);
            }
            else{
                break;
            }
        }
        let mse = mse(data_copy.clone(), forecast.clone()) as f64;
        let rmse = rmse(data_copy.clone(), forecast.clone()) as f64;
        let mae = mae(data_copy.clone(), forecast.clone()) as f64;
        let mpe = mpe(data_copy.clone(), forecast.clone()) as f64;
        let mape = mape(data_copy.clone(), forecast.clone()) as f64;
        
        let results = Object::new();
        Reflect::set(&results, &"MSE".into(), &mse.into()).unwrap();
        Reflect::set(&results, &"RMSE".into(), &rmse.into()).unwrap();
        Reflect::set(&results, &"MAE".into(), &mae.into()).unwrap();
        Reflect::set(&results, &"MPE".into(), &mpe.into()).unwrap();
        Reflect::set(&results, &"MAPE".into(), &mape.into()).unwrap();

        // Mengembalikan objek JavaScript sebagai JsValue
        JsValue::from(results)
    }
}

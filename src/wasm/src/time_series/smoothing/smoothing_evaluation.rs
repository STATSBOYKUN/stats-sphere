use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use js_sys::{Object, Reflect};
use crate::Smoothing;
use crate::time_series::evaluation::basic_evaluation::*;

#[wasm_bindgen]
impl Smoothing {
    pub fn smoothing_evaluation(&self, forecast: Vec<f64>) -> JsValue {
        let mut data_copy = self.get_data();
        let mut forecast_copy = forecast;
        let mut count = 0;
        for i in 0..forecast_copy.len(){
            if forecast_copy[i] == 0.0{
                count += 1;
            }
            else{
                break;
            }
        }
        for _i in 0..count{
            data_copy.remove(0);
            forecast_copy.remove(0);
        }
        let mse = mse(data_copy.clone(), forecast_copy.clone()) as f64;
        let rmse = rmse(data_copy.clone(), forecast_copy.clone()) as f64;
        let mae = mae(data_copy.clone(), forecast_copy.clone()) as f64;
        let mpe = mpe(data_copy.clone(), forecast_copy.clone()) as f64;
        let mape = mape(data_copy.clone(), forecast_copy.clone()) as f64;
        
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

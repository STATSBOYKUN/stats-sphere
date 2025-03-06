use wasm_bindgen::prelude::*;
use wasm_bindgen::JsValue;
use js_sys::{Object, Reflect};
use crate::Arima;
use crate::time_series::evaluation::basic_evaluation::*;

#[wasm_bindgen]
impl Arima{
    pub fn forecasting_evaluation(&self)-> JsValue{
        let data = self.get_data();
        let forecast = self.forecast(data.len());
        assert_eq!(data.len(), forecast.len());

        let mse = mse(data.clone(), forecast.clone()) as f64;
        let rmse = rmse(data.clone(), forecast.clone()) as f64;
        let mae = mae(data.clone(), forecast.clone()) as f64;
        let mpe = mpe(data.clone(), forecast.clone()) as f64;
        let mape = mape(data.clone(), forecast.clone()) as f64;
        
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
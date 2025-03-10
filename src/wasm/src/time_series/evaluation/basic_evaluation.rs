use wasm_bindgen::prelude::*;

// Mean Squared Error
#[wasm_bindgen]
pub fn mse(data: Vec<f64>, forecast: Vec<f64>) -> f64{
    let mut sum: f64 = 0.0;
    for i in 0..data.len(){
        sum += (data[i] - forecast[i]).powi(2);
    }
    sum / data.len() as f64
}

// Root Mean Square Error
#[wasm_bindgen]
pub fn rmse(data: Vec<f64>, forecast: Vec<f64>) -> f64{
    mse(data, forecast).sqrt() as f64
}

// Mean Absolute Error
#[wasm_bindgen]
pub fn mae(data: Vec<f64>, forecast: Vec<f64>) -> f64{
    let mut sum: f64 = 0.0;
    for i in 0..data.len(){
        sum += (data[i] - forecast[i]).abs();
    }
    sum / data.len() as f64
}

// Mean Percentage Error
#[wasm_bindgen]
pub fn mpe(data: Vec<f64>, forecast: Vec<f64>) -> f64{
    let mut sum: f64 = 0.0;
    for i in 0..data.len(){
        sum += (data[i] - forecast[i]) / data[i];
    }
    sum / data.len() as f64
}

// Mean Absolute Percentage Error
#[wasm_bindgen]
pub fn mape(data: Vec<f64>, forecast: Vec<f64>) -> f64{
    let mut sum: f64 = 0.0;
    for i in 0..data.len(){
        sum += ((data[i] - forecast[i]) / data[i]).abs();
    }
    sum / data.len() as f64
}
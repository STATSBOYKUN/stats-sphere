use wasm_bindgen::prelude::*;

// Enable the linear_regression function to be called from JavaScript
#[wasm_bindgen]
pub fn linear_regression(x_vals: Vec<f64>, y_vals: Vec<f64>) -> Vec<f64> {
    let n = x_vals.len();

    if n != y_vals.len() || n == 0 {
        panic!("Vectors must be of the same length and not empty!");
    }

    // Summation of x, y, x^2, and xy
    let sum_x: f64 = x_vals.iter().sum();
    let sum_y: f64 = y_vals.iter().sum();
    let sum_xy: f64 = x_vals.iter().zip(&y_vals).map(|(x, y)| x * y).sum();
    let sum_x_squared: f64 = x_vals.iter().map(|x| x * x).sum();

    // Mean values
    let mean_x = sum_x / n as f64;
    let mean_y = sum_y / n as f64;

    // Slope (m)
    let numerator = sum_xy - (n as f64 * mean_x * mean_y);
    let denominator = sum_x_squared - (n as f64 * mean_x * mean_x);
    let m = numerator / denominator;

    // Intercept (b)
    let b = mean_y - m * mean_x;

    // Return the slope and intercept as a vector [m, b]
    vec![m, b]
}

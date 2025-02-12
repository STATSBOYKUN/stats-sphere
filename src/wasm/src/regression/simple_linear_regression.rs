use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct SimpleLinearRegression{
    x: Vec<f64>,
    y: Vec<f64>,
    y_prediction: Vec<f64>,
    b0: f64,
    b1: f64,
}

#[wasm_bindgen]
impl SimpleLinearRegression{
    #[wasm_bindgen(constructor)]
    pub fn new(x: Vec<f64>, y: Vec<f64>) -> SimpleLinearRegression{
        SimpleLinearRegression{
            x,
            y,
            y_prediction: Vec::new(),
            b0: 0.0,
            b1: 0.0,
        }
    }

    // Getters
    pub fn get_x(&self) -> Vec<f64>{
        self.x.clone()
    }
    pub fn get_y(&self) -> Vec<f64>{
        self.y.clone()
    }
    pub fn get_y_prediction(&self) -> Vec<f64>{
        self.y_prediction.clone()
    }
    pub fn get_b0(&self) -> f64{
        self.b0
    }
    pub fn get_b1(&self) -> f64{
        self.b1
    }

    // Setters
    pub fn set_y_prediction(&mut self, y_prediction: Vec<f64>){
        self.y_prediction = y_prediction;
    }
    pub fn set_b0(&mut self, b0: f64){
        self.b0 = b0;
    }
    pub fn set_b1(&mut self, b1: f64){
        self.b1 = b1;
    }

    // Calculate the simple linear regression
    pub fn calculate_regression(&mut self) {
        // Initialize the variables
        let x_values: Vec<f64> = self.get_x().clone();
        let y_values: Vec<f64> = self.get_y().clone();
        let mut x_pow_2: Vec<f64> = Vec::new();
        let mut xy: Vec<f64> = Vec::new();
        let mut x_sum: f64 = 0.0;
        let mut y_sum: f64 = 0.0;
        let mut x_pow_2_sum: f64 = 0.0;
        let mut xy_sum: f64 = 0.0;
        let b0: f64;
        let b1: f64;
        let mut y_prediction: Vec<f64> = Vec::new();

        // Calculate the sum of x, y, x^2, and xy
        for i in 0..x_values.len(){
            x_pow_2.push(x_values[i].powi(2));
            xy.push(x_values[i] * y_values[i]);
            x_sum += x_values[i];
            y_sum += y_values[i];
            x_pow_2_sum += x_pow_2[i];
            xy_sum += xy[i];
        }

        // Calculate the parameter a and b
        b0 = (y_sum * x_pow_2_sum - x_sum * xy_sum) / (x_values.len() as f64 * x_pow_2_sum - x_sum.powi(2));
        b1 = (x_values.len() as f64 * xy_sum - x_sum * y_sum) / (x_values.len() as f64 * x_pow_2_sum - x_sum.powi(2));

        // Calculate the prediction
        for i in 0..x_values.len(){
            y_prediction.push(b0 + b1 * x_values[i]);
        }

        // Set the b0, b1, and y_prediction
        self.set_b0(b0);
        self.set_b1(b1);
        self.set_y_prediction(y_prediction);
    }
}
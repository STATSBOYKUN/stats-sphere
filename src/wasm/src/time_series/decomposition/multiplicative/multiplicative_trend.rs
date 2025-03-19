use wasm_bindgen::prelude::*;
use crate::Decomposition;
use crate::SimpleLinearRegression;
use crate::QuadraticRegression;
use crate::SimpleExponentialRegression;

#[wasm_bindgen]
impl Decomposition{
    pub fn calculate_multiplicative_trend_component(&mut self, trend: String, deseasonalizing: Vec<f64>)->Vec<f64>{
        let trend_component: Vec<f64>;
        match trend.as_str(){
            "linear" => trend_component =  self.linear_trend(deseasonalizing),
            "quadratic" => trend_component = self.quadratic_trend(deseasonalizing),
            "exponential" => trend_component = self.exponential_trend(deseasonalizing),
            _ => panic!("Unknown trend: {}", trend),
        }
        trend_component
    }

    // Calculate linear trend
    pub fn linear_trend(&mut self, deseasonalizing: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let trend_prediction: Vec<f64>;
        let par_a: f64;
        let par_b: f64;
        let deseasonalizing_values = deseasonalizing.clone();
        let mut t: Vec<f64> = Vec::new();
        for i in 0..deseasonalizing_values.len(){
            t.push(i as f64 + 1.0);
        }

        let mut regression = SimpleLinearRegression::new(t.clone(), deseasonalizing_values.clone());
        regression.calculate_regression();
        par_a = regression.get_b0();
        par_b = regression.get_b1();
        trend_prediction = regression.get_y_prediction();
        
        // Write the trend equation
        let equation: String;
        if par_b < 0 as f64 {
            equation = format!("y = {} - {}t", (par_a * 1000.0).round() / 1000.0, (par_b.abs()* 1000.0).round() / 1000.0);
        } else {
            equation = format!("y = {} + {}t", (par_a * 1000.0).round() / 1000.0, (par_b * 1000.0).round() / 1000.0);
        }
        
        // Set 
        self.set_trend_equation(equation);
        self.set_trend_component(trend_prediction.clone());

        trend_prediction
    }

    // Calculate quadratic trend
    pub fn quadratic_trend(&mut self, deseasonalizing: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let trend_prediction: Vec<f64>;
        let par_a: f64;
        let par_b: f64;
        let par_c: f64;
        let deseasonalizing_values = deseasonalizing.clone();
        let mut t: Vec<f64> = Vec::new();
        for i in 0..deseasonalizing_values.len(){
            t.push(i as f64 + 1.0);
        }

        let mut regression = QuadraticRegression::new(t.clone(), deseasonalizing_values.clone());
        regression.calculate_regression();
        par_a = regression.get_beta()[0];
        par_b = regression.get_beta()[1];
        par_c = regression.get_beta()[2];
        trend_prediction = regression.get_y_prediction();

        // Write the trend equation
        let equation: String;
        if par_b < 0 as f64 && par_c < 0 as f64 {
            equation = format!("y = {} - {}t - {}t^2", (par_a * 1000.0).round() / 1000.0, (par_b.abs() * 1000.0).round() / 1000.0, (par_c.abs() * 1000.0).round() / 1000.0);
        } else if par_b < 0 as f64 && par_c >= 0 as f64 {
            equation = format!("y = {} - {}t + {}t^2", (par_a * 1000.0).round() / 1000.0, (par_b.abs() * 1000.0).round() / 1000.0, (par_c * 1000.0).round() / 1000.0);
        } else if par_b >= 0 as f64 && par_c < 0 as f64 {
            equation = format!("y = {} + {}t - {}t^2", (par_a * 1000.0).round() / 1000.0, (par_b * 1000.0).round() / 1000.0, (par_c.abs() * 1000.0).round() / 1000.0);
        } else {
            equation = format!("y = {} + {}t + {}t^2", (par_a * 1000.0).round() / 1000.0, (par_b * 1000.0).round() / 1000.0, (par_c * 1000.0).round() / 1000.0);
        }

        // Set the trend component
        self.set_trend_equation(equation);
        self.set_trend_component(trend_prediction.clone());

        trend_prediction
    }

    // Calculate exponential trend
    pub fn exponential_trend(&mut self, deseasonalizing: Vec<f64>)->Vec<f64>{
         // Initialize the variables
        let trend_prediction: Vec<f64>;
        let par_a: f64;
        let par_b: f64;
        let deseasonalizing_values = deseasonalizing.clone();
        let mut t: Vec<f64> = Vec::new();
        for i in 0..deseasonalizing_values.len(){
            t.push(i as f64 + 1.0);
        }

        let mut regression = SimpleExponentialRegression::new(t.clone(), deseasonalizing_values.clone());
        regression.calculate_regression();
        par_a = regression.get_b0();
        par_b = regression.get_b1();
        trend_prediction = regression.get_y_prediction();

        // Write the trend equation
        let equation: String;
        if par_b < 0 as f64 {
            equation = format!("y =  e^({} - {} * t)", (par_a * 1000.0).round() / 1000.0, (par_b.abs() * 1000.0).round() / 1000.0);
        } else {
            equation = format!("y =  e^({} + {} * t)", (par_a * 1000.0).round() / 1000.0, (par_b * 1000.0).round() / 1000.0);
        }
        
        // Set the trend component
        self.set_trend_equation(equation);
        self.set_trend_component(trend_prediction.clone());

        trend_prediction
    }
}
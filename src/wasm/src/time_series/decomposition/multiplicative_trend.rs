use wasm_bindgen::prelude::*;
use crate::Decomposition;

#[wasm_bindgen]
impl Decomposition{
    pub fn calculate_multiplicative_trend_component(&mut self, trend: String, deseasonalizing: Vec<f64>)->Vec<f64>{
        let trend_component: Vec<f64>;
        match trend.as_str(){
            "linear" => trend_component =  self.linear_trend(deseasonalizing),
            "exponential" => trend_component = self.exponential_trend(deseasonalizing),
            _ => panic!("Unknown trend: {}", trend),
        }
        trend_component
    }

    // Calculate linear trend
    pub fn linear_trend(&mut self, deseasonalizing: Vec<f64>)->Vec<f64>{
        // Initialize the variables
        let mut trend_prediction: Vec<f64> = Vec::new();
        let deseasonalizing_values = deseasonalizing.clone();

        // Calculate parameter a and b
        let mut t_deseasonalizing_values: Vec<f64> = Vec::new();
        let mut t: Vec<f64> = Vec::new();
        let mut t_pow_2: Vec<f64> = Vec::new();
        for i in 0..deseasonalizing_values.len(){
            t_deseasonalizing_values.push((i as f64 + 1.0) * deseasonalizing_values[i]);
            t.push(i as f64 + 1.0);
            t_pow_2.push((i as f64 + 1.0).powi(2));
        }
        let t_deseasonalizing_values_sum:f64 = t_deseasonalizing_values.iter().sum::<f64>();
        let t_sum:f64 = t.iter().sum::<f64>();
        let t_pow_2_sum:f64 = t_pow_2.iter().sum::<f64>();
        let deseasonalizing_values_sum:f64 = deseasonalizing_values.iter().sum::<f64>();
        let par_b: f64 = (deseasonalizing_values.len() as f64 * t_deseasonalizing_values_sum - t_sum * deseasonalizing_values_sum) / (deseasonalizing_values.len() as f64 * t_pow_2_sum - t_sum.powi(2));
        let par_a: f64 = (deseasonalizing_values_sum - par_b * t_sum) / (deseasonalizing_values.len() as f64);

        // Calculate trend values
        for i in 0..deseasonalizing_values.len(){
            trend_prediction.push(par_a + par_b * (i as f64 + 1.0));
        }
        
        // Write the trend equation
        let equation: String;
        if par_b < 0 as f64 {
            equation = format!("y = {} - {}t", par_a, par_b.abs());
        } else {
            equation = format!("y = {} + {}t", par_a, par_b);
        }
        self.set_trend_equation(equation);

        // Set the trend component
        self.set_trend_component(trend_prediction.clone());

        trend_prediction
    }

    // Calculate exponential trend
    pub fn exponential_trend(&mut self, deseasonalizing: Vec<f64>)->Vec<f64>{
        let mut trend_prediction: Vec<f64> = Vec::new();
        let deseasonalizing_values = deseasonalizing;

        // Calculate parameter ln(a) and ln(b)
        let mut ln_deseasonalizing_values: Vec<f64> = Vec::new();
        let mut t: Vec<f64> = Vec::new();
        let mut t_pow_2: Vec<f64> = Vec::new();
        let mut t_ln_deseasonalizing_values: Vec<f64> = Vec::new();
        for i in 0..deseasonalizing_values.len(){
            ln_deseasonalizing_values.push(deseasonalizing_values[i].ln());
            t.push(i as f64 + 1.0);
            t_pow_2.push((i as f64 + 1.0).powi(2));
            t_ln_deseasonalizing_values.push((i as f64 + 1.0) * deseasonalizing_values[i].ln());
        }
        let ln_deseasonalizing_values_sum:f64 = ln_deseasonalizing_values.iter().sum::<f64>();
        let t_sum:f64 = t.iter().sum::<f64>();
        let t_pow_2_sum:f64 = t_pow_2.iter().sum::<f64>();
        let t_ln_deseasonalizing_values_sum:f64 = t_ln_deseasonalizing_values.iter().sum::<f64>();
        let ln_b = (deseasonalizing_values.len() as f64 * t_ln_deseasonalizing_values_sum - t_sum * ln_deseasonalizing_values_sum) / (deseasonalizing_values.len() as f64 * t_pow_2_sum - t_sum.powi(2));
        let ln_a = (ln_deseasonalizing_values_sum - ln_b * t_sum) / (deseasonalizing_values.len() as f64);

        // Calculate trend values
        let par_a = ln_a.exp();
        let par_b = ln_b;
        for i in 0..deseasonalizing_values.len(){
            trend_prediction.push(par_a * (par_b * (i as f64 + 1.0)).exp());
        }

        // Write the trend equation
        let equation: String;
        if par_b < 0 as f64 {
            equation = format!("y = {} * ({})^t", par_a, par_b);
        } else {
            equation = format!("y = {} * {}^t", par_a, par_b);
        }
        self.set_trend_equation(equation);

        // Set the trend component
        self.set_trend_component(trend_prediction.clone());

        trend_prediction
    }
}
use wasm_bindgen::prelude::*;
use crate::MultipleLinearRegression;
use statrs::distribution::{ContinuousCDF, StudentsT};

#[wasm_bindgen]
impl MultipleLinearRegression{
    pub fn calculate_t_stat(&self)-> Vec<f64>{
        let b = self.get_beta();
        let se = self.calculate_standard_error();
        let mut t_stat = Vec::new();
        for i in 0..b.len(){
            t_stat.push(b[i] / se[i]);
        }
        t_stat
    }

    pub fn calculate_pvalue(&self)-> Vec<f64>{
        let t_stat = self.calculate_t_stat();
        let df = self.get_y().len() as f64 - self.get_beta().len() as f64;
        let t_dist = StudentsT::new(0.0, 1.0, df).unwrap();
        let mut p_value = Vec::new();
        for t in t_stat.iter(){
            p_value.push(2.0 * (1.0 - t_dist.cdf(t.abs())));
        }
        p_value
    }
}
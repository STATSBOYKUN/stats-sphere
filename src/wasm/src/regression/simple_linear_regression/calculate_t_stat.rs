use wasm_bindgen::prelude::*;
use crate::SimpleLinearRegression;
use statrs::distribution::{ContinuousCDF, StudentsT};

#[wasm_bindgen]
impl SimpleLinearRegression{
    pub fn calculate_t_stat(&self)-> Vec<f64>{
        let mut b = Vec::new();
        b.push(self.get_b0());
        b.push(self.get_b1());
        let se = self.calculate_standard_error();
        let t_stat = vec![b[0] / se[0], b[1] / se[1]];
        t_stat
    }

    pub fn calculate_pvalue(&self)-> Vec<f64>{
        let t_stat = self.calculate_t_stat();
        let df = self.get_y().len() as f64 - 2.0;
        let t_dist = StudentsT::new(0.0, 1.0, df).unwrap();
        let mut p_value = Vec::new();
        for t in t_stat.iter(){
            p_value.push(2.0 * (1.0 - t_dist.cdf(t.abs())));
        }
        p_value
    }
}

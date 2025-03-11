use wasm_bindgen::prelude::*;
use crate::NoInterceptLinearRegression;
use statrs::distribution::{ContinuousCDF, StudentsT};

#[wasm_bindgen]
impl NoInterceptLinearRegression{
    pub fn calculate_t_stat(&self)-> f64{
        let b = self.get_b();
        let se = self.calculate_standard_error();
        let t_stat = b / se; 
        t_stat
    }

    pub fn calculate_pvalue(&self)-> f64{
        let t_stat = self.calculate_t_stat();
        let df = self.get_y().len() as f64 - 1.0;
        let t_dist = StudentsT::new(0.0, 1.0, df).unwrap();
        let p_value = 2.0 * (1.0 - t_dist.cdf(t_stat.abs()));
        p_value
    }
}

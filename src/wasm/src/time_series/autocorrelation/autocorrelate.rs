use wasm_bindgen::prelude::*;
use crate::Autocorrelation;
use crate::time_series::difference::difference::*;

#[wasm_bindgen]
impl Autocorrelation{
    pub fn autocorelate(&mut self, difference: String, seasonally: i32){
        let data = self.get_data();
        let fix_diff: Vec<f64>;
        if seasonally != 0{
            let season_diff = seasonal_difference(data, seasonally);
            match difference.as_str(){
                "level" => {
                    fix_diff = season_diff;
                },
                "first-difference" => {
                    fix_diff = first_difference(season_diff);
                },
                "second-difference" => {
                    fix_diff = second_difference(season_diff);
                },
                _ => {
                    fix_diff = vec![];
                }
            }
        } else {
            match difference.as_str(){
                "level" => {
                    fix_diff = data;
                },
                "first-difference" => {
                    fix_diff = first_difference(data);
                },
                "second-difference" => {
                    fix_diff = second_difference(data);
                },
                _ => {
                    fix_diff = vec![];
                }
            }
        }

        self.set_data(fix_diff.clone());

        let acf: Vec<f64> = self.calculate_acf(fix_diff.clone());
        let acf_se: Vec<f64> = self.calculate_acf_se(acf.clone());
        let pacf: Vec<f64> = self.calculate_pacf(acf.clone());
        let pacf_se: Vec<f64> = self.calculate_pacf_se(pacf.clone());
        let lb: Vec<f64> = self.calculate_ljung_box(acf.clone());
        let df_lb: Vec<usize> = self.df_ljung_box();
        let pvalue_lb: Vec<f64> = self.pvalue_ljung_box(lb.clone());

        // Round all values
        let acf_round = acf.iter().map(|x| (x * 1000.0).round() / 1000.0).collect::<Vec<f64>>();
        let pacf_round = pacf.iter().map(|x| (x * 1000.0).round() / 1000.0).collect::<Vec<f64>>();
        let acf_se_round = acf_se.iter().map(|x| (x * 1000.0).round() / 1000.0).collect::<Vec<f64>>();
        let pacf_se_round = pacf_se.iter().map(|x| (x * 1000.0).round() / 1000.0).collect::<Vec<f64>>();
        let lb_round = lb.iter().map(|x| (x * 1000.0).round() / 1000.0).collect::<Vec<f64>>();
        let pvalue_lb_round = pvalue_lb.iter().map(|x| (x * 1000.0).round() / 1000.0).collect::<Vec<f64>>();

        self.set_acf(acf_round.clone());
        self.set_acf_se(acf_se_round.clone());
        self.set_pacf(pacf_round.clone());
        self.set_pacf_se(pacf_se_round.clone());
        self.set_lb(lb_round.clone());
        self.set_df_lb(df_lb.clone());
        self.set_pvalue_lb(pvalue_lb_round.clone());  
    }
}
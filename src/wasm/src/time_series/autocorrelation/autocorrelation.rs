use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct Autocorrelation {
    data: Vec<f64>,
    data_header: String,
    lag: i32,
    acf: Vec<f64>,
    acf_se: Vec<f64>,
    pacf: Vec<f64>,
    pacf_se: Vec<f64>,
    lb: Vec<f64>, // Ljung-Box
    df_lb: Vec<usize>,
    pvalue_lb: Vec<f64>,
}

#[wasm_bindgen]
impl Autocorrelation{
    #[wasm_bindgen(constructor)]
    pub fn new(data: Vec<f64>, data_header: String, lag: i32) -> Autocorrelation{
        Autocorrelation{
            data,
            data_header,
            lag,
            acf: Vec::new(),
            acf_se: Vec::new(),
            pacf: Vec::new(),
            pacf_se: Vec::new(),
            lb: Vec::new(),
            df_lb: Vec::new(),
            pvalue_lb: Vec::new(),
        }
    }

    // Getters
    pub fn get_data(&self) -> Vec<f64>{
        self.data.clone()
    }
    pub fn get_data_header(&self) -> String{
        self.data_header.clone()
    }
    pub fn get_lag(&self) -> i32{
        self.lag
    }
    pub fn get_acf(&self) -> Vec<f64>{
        self.acf.clone()
    }
    pub fn get_acf_se(&self) -> Vec<f64>{
        self.acf_se.clone()
    }
    pub fn get_pacf(&self) -> Vec<f64>{
        self.pacf.clone()
    }
    pub fn get_pacf_se(&self) -> Vec<f64>{
        self.pacf_se.clone()
    }
    pub fn get_lb(&self) -> Vec<f64>{
        self.lb.clone()
    }
    pub fn get_df_lb(&self) -> Vec<usize>{
        self.df_lb.clone()
    }
    pub fn get_pvalue_lb(&self) -> Vec<f64>{
        self.pvalue_lb.clone()
    }

    // Setters
    pub fn set_data(&mut self, data: Vec<f64>){
        self.data = data;
    }
    pub fn set_data_header(&mut self, data_header: String){
        self.data_header = data_header;
    }
    pub fn set_lag(&mut self, lag: i32){
        self.lag = lag;
    }
    pub fn set_acf(&mut self, acf: Vec<f64>){
        self.acf = acf;
    }
    pub fn set_acf_se(&mut self, acf_se: Vec<f64>){
        self.acf_se = acf_se;
    }
    pub fn set_pacf(&mut self, pacf: Vec<f64>){
        self.pacf = pacf;
    }
    pub fn set_pacf_se(&mut self, pacf_se: Vec<f64>){
        self.pacf_se = pacf_se;
    }
    pub fn set_lb(&mut self, lb: Vec<f64>){
        self.lb = lb;
    }
    pub fn set_df_lb(&mut self, df_lb: Vec<usize>){
        self.df_lb = df_lb;
    }
    pub fn set_pvalue_lb(&mut self, pvalue_lb: Vec<f64>){
        self.pvalue_lb = pvalue_lb;
    }
}
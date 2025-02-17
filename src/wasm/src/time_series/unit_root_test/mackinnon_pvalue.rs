pub struct MacKinnonPValue {
    variant: String,
    n: u8,
    gamma_0_tab1: f64,
    gamma_1_tab1: f64,
    gamma_2_tab1: f64,
    gamma_0_tab2: f64,
    gamma_1_tab2: f64,
    gamma_2_tab2: f64,
    gamma_3_tab2: f64,
    tau_min: f64,
    tau_center: f64,
    tau_max: f64,
}

impl MacKinnonPValue {
    pub fn new(
        variant: String, 
        n: u8, 
        gamma_0_tab1: f64, 
        gamma_1_tab1: f64, 
        gamma_2_tab1: f64, 
        gamma_0_tab2: f64, 
        gamma_1_tab2: f64, 
        gamma_2_tab2: f64,
        gamma_3_tab2: f64,
        tau_min: f64,
        tau_center: f64,
        tau_max: f64,) -> MacKinnonPValue {
        MacKinnonPValue {
            variant,
            n,
            gamma_0_tab1,
            gamma_1_tab1,
            gamma_2_tab1,
            gamma_0_tab2,
            gamma_1_tab2,
            gamma_2_tab2,
            gamma_3_tab2,
            tau_min,
            tau_center,
            tau_max,
        }
    }

    // Getters
    pub fn get_variant(&self) -> String {
        self.variant.clone()
    }
    pub fn get_n(&self) -> u8 {
        self.n
    }
    pub fn get_gamma_0_tab1(&self) -> f64 {
        self.gamma_0_tab1
    }
    pub fn get_gamma_1_tab1(&self) -> f64 {
        self.gamma_1_tab1
    }
    pub fn get_gamma_2_tab1(&self) -> f64 {
        self.gamma_2_tab1
    }
    pub fn get_gamma_0_tab2(&self) -> f64 {
        self.gamma_0_tab2
    }
    pub fn get_gamma_1_tab2(&self) -> f64 {
        self.gamma_1_tab2
    }
    pub fn get_gamma_2_tab2(&self) -> f64 {
        self.gamma_2_tab2
    }
    pub fn get_gamma_3_tab2(&self) -> f64 {
        self.gamma_3_tab2
    }
    pub fn get_tau_min(&self) -> f64 {
        self.tau_min
    }
    pub fn get_tau_center(&self) -> f64 {
        self.tau_center
    }
    pub fn get_tau_max(&self) -> f64 {
        self.tau_max
    }
}
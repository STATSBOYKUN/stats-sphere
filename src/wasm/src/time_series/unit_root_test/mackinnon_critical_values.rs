pub struct MacKinnonCriticalValues {
    n: u8,
    variant: String,
    level: String,
    obs: u16,
    beta_inf: f64,
    beta_1: f64,
    beta_2: f64,
}

impl MacKinnonCriticalValues {
    pub fn new(n: u8, variant: String, level: String, obs: u16, beta_inf: f64, beta_1: f64, beta_2: f64) -> MacKinnonCriticalValues {
        MacKinnonCriticalValues {
            n,
            variant,
            level,
            obs,
            beta_inf,
            beta_1,
            beta_2,
        }
    }

    // Getters
    pub fn get_n(&self) -> u8 {
        self.n
    }
    pub fn get_variant(&self) -> String {
        self.variant.clone()
    }
    pub fn get_level(&self) -> String {
        self.level.clone()
    }
    pub fn get_obs(&self) -> u16 {
        self.obs
    }
    pub fn get_beta_inf(&self) -> f64 {
        self.beta_inf
    }
    pub fn get_beta_1(&self) -> f64 {
        self.beta_1
    }
    pub fn get_beta_2(&self) -> f64 {
        self.beta_2
    }
}
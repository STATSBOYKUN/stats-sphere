pub struct MacKinnonCriticalValues {
    variant: String,
    level: String,
    t: f64,
    u: f64,
    v: f64,
    w: f64,
}

impl MacKinnonCriticalValues {
    pub fn new(variant: String, level: String, t: f64, u: f64, v: f64, w: f64) -> MacKinnonCriticalValues {
        MacKinnonCriticalValues {
            variant,
            level,
            t,
            u,
            v,
            w,
        }
    }

    // Getters
    pub fn get_variant(&self) -> String {
        self.variant.clone()
    }
    pub fn get_level(&self) -> String {
        self.level.clone()
    }
    pub fn get_t(&self) -> f64 {
        self.t
    }
    pub fn get_u(&self) -> f64 {
        self.u
    }
    pub fn get_v(&self) -> f64 {
        self.v
    }
    pub fn get_w(&self) -> f64 {
        self.w
    }
}
use statrs::distribution::{ContinuousCDF, Normal};
use crate::read_pvalue;
use crate::MacKinnonPValue;


// Mendapatkan nilai p-value dari tabel McKinnon
pub fn mackinnon_get_gamma(n: u8,variant: &str,t_stat: f64) -> (String, Vec<f64>){
    // Baca seluruh record dari CSV
    let values: Vec<MacKinnonPValue> = read_pvalue().expect("Failed to read MacKinnon data");

    // Temukan record yang cocok
    if let Some(record) = values.iter().find(
        |v| 
        v.get_n() == n && 
        v.get_variant() == variant) {
            if t_stat <= record.get_tau_center() {
                return ("table1".to_string(),vec![record.get_gamma_0_tab1(), record.get_gamma_1_tab1(), record.get_gamma_2_tab1(), 0.0]);
            } else {
                return ("table2".to_string(),vec![record.get_gamma_0_tab2(), record.get_gamma_1_tab2(), record.get_gamma_2_tab2(), record.get_gamma_3_tab2()]);
            }
    } else {
        panic!("Record not found");
    }
}


/// Menghitung p-value berdasarkan model MacKinnon
pub fn calculate_p_value(t_stat: f64, n: u8, variant: &str) -> f64 {
    let (table, gamma) = mackinnon_get_gamma(n, variant, t_stat);
    let normal = Normal::new(0.0, 1.0).unwrap();
    let inverse_cdf ;
    if table == "table1" {
        inverse_cdf = gamma[0] + gamma[1] * t_stat + gamma[2] / 100.0 * t_stat.powi(2);
    } else {
        inverse_cdf = gamma[0] + gamma[1] / 10.0 * t_stat + gamma[2] / 10.0 * t_stat.powi(2) + gamma[3] / 100.0 * t_stat.powi(3);
    }
    normal.cdf(inverse_cdf) // Φ(γ0 + γ1τ + γ2τ² + γ3τ³)
}
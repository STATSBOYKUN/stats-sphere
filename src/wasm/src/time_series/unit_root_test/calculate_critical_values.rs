use crate::read_critical_values;
use crate::MacKinnonCriticalValues;

/// Fungsi untuk mendapatkan nilai beta dari tabel McKinnon
pub fn mackinnon_get_beta(
    n: u8,
    variant: &str,
    level: &str,
) -> Vec<f64> {
    // Baca seluruh record dari CSV
    let values: Vec<MacKinnonCriticalValues> = read_critical_values().expect("Failed to read MacKinnon data");

    // Temukan record yang cocok
    if let Some(record) = values.iter().find(
        |v| 
        v.get_n() == n && 
        v.get_variant() == variant && 
        v.get_level() == level) {
            return vec![record.get_beta_inf(), record.get_beta_1(), record.get_beta_2()];
    } else {
        panic!("Record not found");
    }
}


/// Fungsi untuk menghitung nilai kritis dari tabel McKinnon
pub fn calculate_critical_values(
    n: u8,
    variant: &str,
    level: &str,
    t: f64,
) -> f64 {
    let beta = mackinnon_get_beta(n, variant, level);
    let c_hat = beta[0] + beta[1] / t + beta[2] / t.powi(2);
    c_hat
}
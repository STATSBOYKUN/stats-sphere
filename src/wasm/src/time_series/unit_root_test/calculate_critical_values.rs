use crate::read_critical_values;
use crate::MacKinnonCriticalValues;

/// Fungsi untuk mendapatkan nilai beta dari tabel McKinnon
pub fn mackinnon_get_beta(
    variant: &str,
    level: &str,
) -> Vec<f64> {
    // Baca seluruh record dari CSV
    let values: Vec<MacKinnonCriticalValues> = read_critical_values().expect("Failed to read MacKinnon data");

    // Temukan record yang cocok
    if let Some(record) = values.iter().find(
        |v| 
        v.get_variant() == variant && 
        v.get_level() == level) {
            return vec![record.get_t(), record.get_u(), record.get_v(), record.get_w()];
    } else {
        panic!("Record not found");
    }
}

/// Fungsi untuk menghitung nilai kritis dari tabel McKinnon
pub fn calculate_critical_values(
    n: u8,
    variant: &str,
    level: &str,
) -> f64 {
    let beta = mackinnon_get_beta(variant, level);
    let n = n as f64;
    let c_hat = beta[0] + (beta[1] / n) + (beta[2] / n.powi(2)) + (beta[3] / n.powi(3));
    c_hat
}
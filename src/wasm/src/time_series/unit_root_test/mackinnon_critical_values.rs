use serde::Deserialize;
use std::error::Error;
use csv::Reader;
use nalgebra::{DMatrix, DVector, SVD};
use statrs::distribution::{ContinuousCDF, Normal};

use crate::SimpleLinearRegression;

#[derive(Debug, Deserialize)]
#[allow(dead_code)]
pub struct MacKinnonCriticalValue {
    #[serde(rename = "N")]
    n: u8,
    #[serde(rename = "Variant")]
    variant: String,
    #[serde(rename = "Level")]
    level: String,
    #[serde(rename = "Obs")]
    obs: u16,
    #[serde(rename = "Beta_Inf")]
    beta_inf: f64,
    #[serde(rename = "Beta_1")]
    beta_1: f64,
    #[serde(rename = "Beta_2")]
    beta_2: f64,
}


/// Fungsi untuk membaca nilai kritis dari tabel McKinnon
pub fn read_critical_values(file_path: &str) -> Result<Vec<MacKinnonCriticalValue>, Box<dyn Error>> {
    let mut rdr = Reader::from_path(file_path)?;
    let mut values = Vec::new();

    for result in rdr.deserialize() {
        let record: MacKinnonCriticalValue = result?;
        values.push(record);
    }
    
    Ok(values)
}


/// Fungsi untuk mendapatkan nilai beta dari tabel McKinnon
pub fn mckinnon_get_beta(
    n: u8,
    variant: &str,
    level: &str,
) -> Result<Vec<f64>, Box<dyn Error>> {
    // Baca seluruh record dari CSV
    let values = read_critical_values("mackinnon_critical_values.csv")?;

    // Temukan record yang cocok
    if let Some(record) = values.iter().find(
        |v| 
        v.n == n && 
        v.variant == variant && 
        v.level == level) {
            return Ok(vec![record.beta_inf, record.beta_1, record.beta_2]);
    }

    let mut reg_beta_inf = SimpleLinearRegression::new(values.iter().map(|v| v.n as f64).collect(), values.iter().map(|v| v.beta_inf).collect());
    let mut reg_beta_1 = SimpleLinearRegression::new(values.iter().map(|v| v.n as f64).collect(), values.iter().map(|v| v.beta_1).collect());
    let mut reg_beta_2 = SimpleLinearRegression::new(values.iter().map(|v| v.n as f64).collect(), values.iter().map(|v| v.beta_2).collect());
    reg_beta_inf.calculate_regression();
    reg_beta_1.calculate_regression();
    reg_beta_2.calculate_regression();

    let est_beta_inf = reg_beta_inf.get_b0() + reg_beta_inf.get_b1() * (n as f64);
    let est_beta_1 = reg_beta_1.get_b0() + reg_beta_1.get_b1() * (n as f64);
    let est_beta_2 = reg_beta_2.get_b0() + reg_beta_2.get_b1() * (n as f64);

    return Ok(vec![est_beta_inf, est_beta_1, est_beta_2]);
}


/// Fungsi untuk menghitung nilai kritis dari tabel McKinnon
pub fn mckinnon_critical_values(
    n: u8,
    variant: &str,
    level: &str,
    t: f64,
) -> Result<f64, Box<dyn Error>> {
    let beta = mckinnon_get_beta(n, variant, level)?;
    let c_hat = beta[0] + beta[1] / t + beta[2] / t.powi(2);
    Ok(c_hat)
}


/// Menentukan koefisien regresi polinomial untuk p-value
pub fn calculate_regression_coefficients(
    t_stats: &Vec<f64>, // Nilai t-statistik dari tabel
    p_values: &Vec<f64> // p-values yang bersesuaian
) -> (f64, f64, f64, f64) {
    let n = t_stats.len();
    // Membuat matriks desain untuk regresi polinomial orde 3
    let mut x = DMatrix::zeros(n, 4);
    let mut y = DVector::zeros(n);

    for i in 0..n {
        let t = t_stats[i];
        x[(i, 0)] = 1.0;  // Koefisien konstanta (γ0)
        x[(i, 1)] = t;    // γ1 * t
        x[(i, 2)] = t * t; // γ2 * t^2
        x[(i, 3)] = t * t * t; // γ3 * t^3
        y[i] = p_values[i]; // p-value aktual
    }

    // Menggunakan Singular Value Decomposition (SVD) untuk menyelesaikan regresi
    let svd = SVD::new(x.clone(), true, true);
    let coefficients = svd.solve(&y, 1e-10).expect("Regresi gagal");

    (
        coefficients[0], // γ0
        coefficients[1], // γ1
        coefficients[2], // γ2
        coefficients[3]  // γ3
    )
}


/// Menghitung p-value berdasarkan model MacKinnon
pub fn mckinnon_p_value(t_stat: f64, n: u8, variant: &str, t: f64) -> f64 {
    // Ambil nilai kritis dari tabel McKinnon
    let mut critical_values: Vec<f64> = Vec::new();
    for level in ["1%", "5%", "10%"].iter() {
        let c_hat = mckinnon_critical_values(n, variant, level, t).unwrap();
        critical_values.push(c_hat);
    }
    let (gamma_0, gamma_1, gamma_2, gamma_3) = calculate_regression_coefficients(
        &critical_values,
        &vec![0.01, 0.05, 0.10],
    );

    let normal = Normal::new(0.0, 1.0).unwrap();
    let inverse_cdf = gamma_0 + (gamma_1 * t_stat) + (gamma_2 * t_stat.powi(2)) + (gamma_3 * t_stat.powi(3));
    normal.cdf(inverse_cdf) // Φ(γ0 + γ1τ + γ2τ² + γ3τ³)
}
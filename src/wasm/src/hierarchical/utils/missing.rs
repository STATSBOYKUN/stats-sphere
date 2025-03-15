use crate::hierarchical::types::{MissingValueStrategy, ClusteringError};
use crate::hierarchical::utils::validation::validate_data_matrix;

/// Handle missing values in data matrix
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `strategy` - Strategy for handling missing values
///
/// # Returns
/// * Result with processed data matrix and array of valid case indices
pub fn handle_missing_values(
    data: &[Vec<f64>],
    strategy: MissingValueStrategy
) -> Result<(Vec<Vec<f64>>, Vec<usize>), ClusteringError> {
    // Validasi input
    validate_data_matrix(data, 1)?;
    
    let n_cases = data.len();
    let n_vars = data[0].len();
    
    // Vector to track which cases are valid
    let mut valid_cases = Vec::with_capacity(n_cases);
    
    match strategy {
        MissingValueStrategy::ExcludeListwise => {
            // A case is valid only if it has no missing values
            let mut cleaned_data = Vec::with_capacity(n_cases);
            
            for (i, row) in data.iter().enumerate() {
                let has_missing = row.iter().any(|&x| x.is_nan());
                
                if !has_missing {
                    cleaned_data.push(row.clone());
                    valid_cases.push(i);
                }
            }
            
            if cleaned_data.is_empty() {
                return Err(ClusteringError::DataPreparationError(
                    "No valid cases after excluding rows with missing values".to_string()
                ));
            }
            
            Ok((cleaned_data, valid_cases))
        },
        MissingValueStrategy::ExcludePairwise => {
            // Untuk ExcludePairwise, kita akan menerapkan strategi berikut:
            // 1. Tetap masukkan semua kasus ke hasil
            // 2. Saat menghitung jarak, kita hanya gunakan variabel yang valid di kedua kasus
            // 3. Jika tidak ada variabel valid, kita akan menandai jarak sebagai tidak valid
            
            // Pertama, cek apakah ada kasus yang sepenuhnya memiliki missing values
            let mut all_missing_cases = Vec::new();
            
            for (i, row) in data.iter().enumerate() {
                let all_missing = row.iter().all(|&x| x.is_nan());
                
                if all_missing {
                    all_missing_cases.push(i);
                } else {
                    valid_cases.push(i);
                }
            }
            
            if !all_missing_cases.is_empty() {
                // Log warning tentang kasus yang dihapus
                let warning = format!(
                    "Excluded {} cases with all missing values", 
                    all_missing_cases.len()
                );
                web_sys::console::warn_1(&wasm_bindgen::JsValue::from_str(&warning));
            }
            
            if valid_cases.is_empty() {
                return Err(ClusteringError::DataPreparationError(
                    "No valid cases after excluding rows with all missing values".to_string()
                ));
            }
            
            // Buat data baru hanya dengan kasus valid
            let mut cleaned_data = Vec::with_capacity(valid_cases.len());
            for &idx in &valid_cases {
                cleaned_data.push(data[idx].clone());
            }
            
            Ok((cleaned_data, valid_cases))
        },
    }
}

/// Periksa apakah dua vektor memiliki nilai yang valid untuk dihitung jaraknya
pub fn has_valid_values_for_distance(p1: &[f64], p2: &[f64]) -> bool {
    // Hitung jumlah dimensi yang valid (tidak NaN) pada kedua vektor
    let valid_dims = p1.iter().zip(p2.iter())
        .filter(|(&x1, &x2)| !x1.is_nan() && !x2.is_nan())
        .count();
        
    // Setidaknya harus ada satu dimensi valid
    valid_dims > 0
}

/// Impute missing values in data matrix with simple methods
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `method` - Imputation method (mean, median, mode, zero, etc.)
///
/// # Returns
/// * Result with imputed data matrix
pub fn impute_missing_values(
    data: &[Vec<f64>],
    method: &str
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    // Validasi input
    validate_data_matrix(data, 1)?;
    
    let n_cases = data.len();
    let n_vars = data[0].len();
    
    // Copy data untuk modifikasi
    let mut imputed_data = data.to_vec();
    
    match method {
        "mean" => {
            // Hitung mean untuk setiap variabel
            for var in 0..n_vars {
                let mut sum = 0.0;
                let mut count = 0;
                
                for case in 0..n_cases {
                    let value = data[case][var];
                    if !value.is_nan() {
                        sum += value;
                        count += 1;
                    }
                }
                
                if count > 0 {
                    let mean = sum / count as f64;
                    
                    // Impute missing values with mean
                    for case in 0..n_cases {
                        if data[case][var].is_nan() {
                            imputed_data[case][var] = mean;
                        }
                    }
                } else {
                    // Semua nilai dalam variabel ini adalah NaN
                    // Impute dengan 0 atau nilai default lainnya
                    for case in 0..n_cases {
                        imputed_data[case][var] = 0.0;
                    }
                }
            }
        },
        "zero" => {
            // Impute semua missing values dengan 0
            for case in 0..n_cases {
                for var in 0..n_vars {
                    if data[case][var].is_nan() {
                        imputed_data[case][var] = 0.0;
                    }
                }
            }
        },
        _ => {
            return Err(ClusteringError::DataPreparationError(
                format!("Unknown imputation method: {}", method)
            ));
        }
    }
    
    Ok(imputed_data)
}
use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::{Value};
use std::collections::HashMap;
use js_sys::{Array, Float64Array, Object};

// Struktur untuk menyimpan hasil analisis diskriminan
// Catatan: Kita tidak menggunakan #[wasm_bindgen] langsung pada struktur ini
// karena Vec<f64> dan nested vectors tidak mendukung wasm_bindgen
#[derive(Serialize, Deserialize)]
pub struct DiscriminantResult {
    // Matriks mean untuk setiap grup dan variabel
    pub group_means: Vec<Vec<f64>>,
    // Matriks mean keseluruhan untuk setiap variabel
    pub overall_means: Vec<f64>,
    // Matriks varians untuk setiap grup dan variabel
    pub group_variances: Vec<Vec<f64>>,
    // Matriks varians keseluruhan untuk setiap variabel
    pub overall_variances: Vec<f64>,
    // Matriks within-groups sums of squares and cross-product (W)
    pub w_matrix: Vec<Vec<f64>>,
    // Matriks total sums of squares and cross-product (T)
    pub t_matrix: Vec<Vec<f64>>,
    // Matriks within-groups covariance (C)
    pub c_matrix: Vec<Vec<f64>>,
    // Matriks kovarians untuk setiap grup
    pub group_covariance_matrices: Vec<Vec<Vec<f64>>>,
    // Matriks within-groups correlation (R)
    pub r_matrix: Vec<Vec<f64>>,
    // Matriks total covariance (T')
    pub t_prime_matrix: Vec<Vec<f64>>,
    // Univariate F dan Lambda untuk setiap variabel
    pub f_values: Vec<f64>,
    pub lambda_values: Vec<f64>,
    // Jumlah variabel yang dipilih
    pub selected_variables: Vec<usize>,
    // Informasi grup (nomor grup yang valid)
    pub valid_groups: Vec<i32>,
    // Status analisis (berhasil atau tidak)
    pub success: bool,
    // Pesan error jika ada
    pub error_message: String,
}

/// Struktur untuk input analisis diskriminan
#[derive(Deserialize, Serialize)]
struct DiscriminantInput {
    group_data: Vec<Vec<HashMap<String, Value>>>,         // Data kelompok (format dari JS)
    independent_data: Vec<Vec<HashMap<String, Value>>>, // Data variabel independen (format dari JS)
    min_range: f64,                                 // Nilai minimum untuk kelompok yang valid
    max_range: f64,                                 // Nilai maksimum untuk kelompok yang valid
}

/// Fungsi utama untuk melakukan analisis diskriminan
///
/// # Arguments
/// * `group_variable` - Data grup dalam format JsValue
/// * `independent_variable` - Data variabel independen dalam format JsValue
/// * `min_range` - Nilai minimum untuk kelompok yang valid
/// * `max_range` - Nilai maksimum untuk kelompok yang valid
///
/// # Returns
/// * JsValue - Hasil analisis diskriminan dalam format JSON
#[wasm_bindgen]
pub fn start_analysis(
    group_variable: JsValue,
    independent_variable: JsValue,
    min_range: f64,
    max_range: f64
) -> Result<JsValue, JsValue> {
    // Buat struktur input dari JavaScript values menggunakan serde_wasm_bindgen
    let mut group_data: Vec<Vec<HashMap<String, Value>>> = group_variable.into_serde().unwrap_or_default();
    let independent_data: Vec<Vec<HashMap<String, Value>>> = independent_variable.into_serde().unwrap_or_default();

    // Membuat struktur input
    let input = DiscriminantInput {
        group_data,
        independent_data,
        min_range,
        max_range,
    };

    // Jalankan analisis diskriminan
    let result = discriminant_analysis(&input)?;

    // Konversi hasil ke JsValue menggunakan serde_wasm_bindgen
    serde_wasm_bindgen::to_value(&result)
        .map_err(|e| JsValue::from_str(&format!("Error serializing result: {}", e)))
}

/// Fungsi untuk memproses data grup dan mengidentifikasi grup yang valid
///
/// # Arguments
/// * `group_data` - Data grup dalam format Vec<HashMap<String, Value>>
/// * `min_range` - Nilai minimum untuk kelompok yang valid
/// * `max_range` - Nilai maksimum untuk kelompok yang valid
///
/// # Returns
/// * HashMap<i32, Vec<usize>> - Pemetaan dari ID grup ke indeks kasus
/// * Vec<i32> - Daftar ID grup yang valid
fn process_group_data(
    group_data: &Vec<HashMap<String, Value>>,
    min_range: i32,
    max_range: i32
) -> Result<(HashMap<i32, Vec<usize>>, Vec<i32>), JsValue> {
    let mut group_map: HashMap<i32, Vec<usize>> = HashMap::new();

    // Identifikasi grup yang valid dan kasus yang termasuk dalam setiap grup
    for (idx, case) in group_data.iter().enumerate() {
        // Ambil nilai grup dari data
        if let Some(Value::Number(group_val)) = case.get("group") {
            if let Some(group_id) = group_val.as_i64() {
                let group_id = group_id as i32;

                // Cek apakah grup berada dalam rentang yang valid
                if group_id >= min_range && group_id <= max_range {
                    // Tambahkan indeks kasus ke grup yang sesuai
                    group_map.entry(group_id).or_insert_with(Vec::new).push(idx);
                }
            }
        }
    }

    // Konversi kunci HashMap menjadi vektor yang diurutkan
    let mut valid_groups: Vec<i32> = group_map.keys().cloned().collect();
    valid_groups.sort();

    Ok((group_map, valid_groups))
}

/// Fungsi untuk memproses data variabel independen
///
/// # Arguments
/// * `independent_data` - Data variabel independen dalam format Vec<Vec<HashMap<String, Value>>>
/// * `group_map` - Pemetaan dari ID grup ke indeks kasus
/// * `valid_groups` - Daftar ID grup yang valid
/// * `p` - Jumlah variabel
///
/// # Returns
/// * Tuple berisi (x_values, weights, group_sizes)
fn process_independent_data(
    independent_data: &Vec<Vec<HashMap<String, Value>>>,
    group_map: &HashMap<i32, Vec<usize>>,
    valid_groups: &Vec<i32>,
    p: usize
) -> Result<(Vec<Vec<Vec<f64>>>, Vec<Vec<f64>>, Vec<usize>), JsValue> {
    let g = valid_groups.len();

    // Inisialisasi struktur data output
    let mut x_values = vec![vec![vec![0.0; 0]; g]; p];
    let mut weights = vec![vec![0.0; 0]; g];
    let mut group_sizes = vec![0; g];

    // Isi ukuran grup dan alokasikan array
    for (j, &group_id) in valid_groups.iter().enumerate() {
        if let Some(case_indices) = group_map.get(&group_id) {
            let size = case_indices.len();
            group_sizes[j] = size;
            weights[j] = vec![1.0; size]; // Default bobot = 1.0

            // Alokasikan array untuk setiap variabel
            for i in 0..p {
                x_values[i][j] = vec![0.0; size];
            }

            // Isi bobot dari data
            for (k, &case_idx) in case_indices.iter().enumerate() {
                if case_idx < independent_data[0].len() {
                    if let Some(Value::Number(weight)) = independent_data[0][case_idx].get("weight") {
                        if let Some(w) = weight.as_f64() {
                            weights[j][k] = w;
                        }
                    }
                }
            }

            // Isi nilai variabel
            for i in 0..p {
                if i < independent_data.len() {
                    for (k, &case_idx) in case_indices.iter().enumerate() {
                        if case_idx < independent_data[i].len() {
                            if let Some(Value::Number(value)) = independent_data[i][case_idx].get("value") {
                                if let Some(v) = value.as_f64() {
                                    x_values[i][j][k] = v;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok((x_values, weights, group_sizes))
}

/// Fungsi untuk memvalidasi input
fn validate_input(
    g: usize,
    group_sizes: &Vec<usize>,
    weights: &Vec<Vec<f64>>,
    result: &mut DiscriminantResult
) -> bool {
    // Periksa jumlah kelompok yang tidak kosong
    let mut non_empty_groups = 0;
    for size in group_sizes {
        if *size > 0 {
            non_empty_groups += 1;
        }
    }

    // Validasi berdasarkan kondisi yang diberikan
    if non_empty_groups < 2 {
        result.success = false;
        result.error_message = "Jumlah kelompok yang tidak kosong kurang dari dua".to_string();
        return false;
    }

    // Hitung jumlah bobot kasus
    let n_j = calculate_group_weights(weights, group_sizes);
    if n_j.iter().sum::<f64>() <= non_empty_groups as f64 {
        result.success = false;
        result.error_message = "Jumlah bobot kasus tidak melebihi jumlah kelompok yang tidak kosong".to_string();
        return false;
    }

    true
}

/// Fungsi untuk menghitung jumlah bobot kasus di setiap grup (n_j)
fn calculate_group_weights(weights: &Vec<Vec<f64>>, group_sizes: &Vec<usize>) -> Vec<f64> {
    let mut n_j = vec![0.0; weights.len()];

    for j in 0..weights.len() {
        for k in 0..group_sizes[j] {
            if k < weights[j].len() {
                n_j[j] += weights[j][k];
            }
        }
    }

    n_j
}

/// Fungsi untuk melakukan analisis diskriminan
///
/// # Arguments
/// * `input` - Data input analisis diskriminan
///
/// # Returns
/// * DiscriminantResult - Hasil analisis diskriminan
fn discriminant_analysis(input: &DiscriminantInput) -> Result<DiscriminantResult, JsValue> {
    // Ekstrak rentang grup yang valid
    let min_range = input.min_range as i32;
    let max_range = input.max_range as i32;

    // Proses data grup untuk mengidentifikasi grup yang valid
    let (group_map, valid_groups) = process_group_data(&input.group_data, min_range, max_range)?;

    // Jumlah kelompok yang valid
    let g = valid_groups.len();

    // Jumlah variabel independen
    let p = input.independent_data.len();

    // Proses data variabel independen
    let (x_values, weights, group_sizes) = process_independent_data(&input.independent_data, &group_map, &valid_groups, p)?;

    // Inisialisasi result
    let mut result = DiscriminantResult {
        group_means: vec![vec![0.0; g]; p],
        overall_means: vec![0.0; p],
        group_variances: vec![vec![0.0; g]; p],
        overall_variances: vec![0.0; p],
        w_matrix: vec![vec![0.0; p]; p],
        t_matrix: vec![vec![0.0; p]; p],
        c_matrix: vec![vec![0.0; p]; p],
        group_covariance_matrices: vec![vec![vec![0.0; p]; p]; g],
        r_matrix: vec![vec![0.0; p]; p],
        t_prime_matrix: vec![vec![0.0; p]; p],
        f_values: vec![0.0; p],
        lambda_values: vec![0.0; p],
        selected_variables: vec![],
        valid_groups: valid_groups.clone(),
        success: true,
        error_message: String::new(),
    };

    // Validasi input
    if !validate_input(g, &group_sizes, &weights, &mut result) {
        return Ok(result);
    }

    // Hitung jumlah bobot kasus di setiap grup (n_j)
    let n_j = calculate_group_weights(&weights, &group_sizes);

    // Hitung total bobot kasus (n)
    let n: f64 = n_j.iter().sum();

    // 1. Hitung mean untuk setiap variabel dalam setiap grup dan keseluruhan
    for i in 0..p {
        // Mean per grup
        for j in 0..g {
            if group_sizes[j] > 0 {
                let mut sum = 0.0;
                for k in 0..group_sizes[j] {
                    sum += weights[j][k] * x_values[i][j][k];
                }
                result.group_means[i][j] = sum / n_j[j];
            }
        }

        // Mean keseluruhan
        let mut total_sum = 0.0;
        for j in 0..g {
            for k in 0..group_sizes[j] {
                total_sum += weights[j][k] * x_values[i][j][k];
            }
        }
        result.overall_means[i] = total_sum / n;
    }

    // 2. Hitung varians untuk setiap variabel dalam setiap grup dan keseluruhan
    for i in 0..p {
        // Varians per grup
        for j in 0..g {
            if group_sizes[j] > 0 && n_j[j] > 1.0 {
                let mut sum_squared = 0.0;
                for k in 0..group_sizes[j] {
                    sum_squared += weights[j][k] * x_values[i][j][k].powi(2);
                }
                result.group_variances[i][j] = (sum_squared - n_j[j] * result.group_means[i][j].powi(2)) / (n_j[j] - 1.0);
            }
        }

        // Varians keseluruhan
        let mut total_sum_squared = 0.0;
        for j in 0..g {
            for k in 0..group_sizes[j] {
                total_sum_squared += weights[j][k] * x_values[i][j][k].powi(2);
            }
        }
        result.overall_variances[i] = (total_sum_squared - n * result.overall_means[i].powi(2)) / (n - 1.0);
    }

    // 3. Hitung Within-Groups Sums of Squares and Cross-Product Matrix (W)
    for i in 0..p {
        for l in 0..p {
            let mut w_il = 0.0;
            for j in 0..g {
                let mut sum_x_ijk_x_ljk = 0.0;
                let mut sum_f_jk_x_ijk = 0.0;
                let mut sum_f_jk_x_ljk = 0.0;

                for k in 0..group_sizes[j] {
                    sum_x_ijk_x_ljk += weights[j][k] * x_values[i][j][k] * x_values[l][j][k];
                    sum_f_jk_x_ijk += weights[j][k] * x_values[i][j][k];
                    sum_f_jk_x_ljk += weights[j][k] * x_values[l][j][k];
                }

                w_il += sum_x_ijk_x_ljk - (sum_f_jk_x_ijk * sum_f_jk_x_ljk) / n_j[j];
            }
            result.w_matrix[i][l] = w_il;
        }
    }

    // 4. Hitung Total Sums of Squares and Cross-Product Matrix (T)
    for i in 0..p {
        for l in 0..p {
            let mut sum_x_ijk_x_ljk = 0.0;
            let mut sum_f_jk_x_ijk = 0.0;
            let mut sum_f_jk_x_ljk = 0.0;

            for j in 0..g {
                for k in 0..group_sizes[j] {
                    sum_x_ijk_x_ljk += weights[j][k] * x_values[i][j][k] * x_values[l][j][k];
                    sum_f_jk_x_ijk += weights[j][k] * x_values[i][j][k];
                    sum_f_jk_x_ljk += weights[j][k] * x_values[l][j][k];
                }
            }

            result.t_matrix[i][l] = sum_x_ijk_x_ljk - (sum_f_jk_x_ijk * sum_f_jk_x_ljk) / n;
        }
    }

    // 5. Hitung Within-Groups Covariance Matrix (C)
    if n > g as f64 {
        for i in 0..p {
            for l in 0..p {
                result.c_matrix[i][l] = result.w_matrix[i][l] / (n - g as f64);
            }
        }
    } else {
        result.success = false;
        result.error_message = "Jumlah bobot kasus tidak melebihi jumlah kelompok".to_string();
        return Ok(result);
    }

    // 6. Hitung Individual Group Covariance Matrices
    for j in 0..g {
        if n_j[j] > 1.0 {
            for i in 0..p {
                for l in 0..p {
                    let mut sum_x_ijk_x_ljk = 0.0;
                    for k in 0..group_sizes[j] {
                        sum_x_ijk_x_ljk += weights[j][k] * x_values[i][j][k] * x_values[l][j][k];
                    }

                    result.group_covariance_matrices[j][i][l] =
                        (sum_x_ijk_x_ljk - result.group_means[i][j] * result.group_means[l][j] * n_j[j]) / (n_j[j] - 1.0);
                }
            }
        }
    }

    // 7. Hitung Within-Groups Correlation Matrix (R)
    for i in 0..p {
        for l in 0..p {
            if result.w_matrix[i][i] > 0.0 && result.w_matrix[l][l] > 0.0 {
                result.r_matrix[i][l] = result.w_matrix[i][l] / (result.w_matrix[i][i] * result.w_matrix[l][l]).sqrt();
            } else {
                // SYSMIS dalam notasi, kita representasikan sebagai f64::NAN
                result.r_matrix[i][l] = f64::NAN;
            }
        }
    }

    // 8. Hitung Total Covariance Matrix (T')
    for i in 0..p {
        for l in 0..p {
            result.t_prime_matrix[i][l] = result.t_matrix[i][l] / (n - 1.0);
        }
    }

    // 9. Hitung Univariate F dan Lambda untuk setiap variabel
    for i in 0..p {
        if result.w_matrix[i][i] > 0.0 && result.t_matrix[i][i] > 0.0 {
            // F value
            result.f_values[i] = ((result.t_matrix[i][i] - result.w_matrix[i][i]) * (n - g as f64)) /
                                 (result.w_matrix[i][i] * ((g as f64) - 1.0));

            // Lambda value
            result.lambda_values[i] = result.w_matrix[i][i] / result.t_matrix[i][i];
        } else {
            result.f_values[i] = f64::NAN;
            result.lambda_values[i] = f64::NAN;
        }
    }

    // 10. Pilih variabel berdasarkan nilai F (contoh: pilih semua variabel dengan F > 1.0)
    for i in 0..p {
        if !result.f_values[i].is_nan() && result.f_values[i] > 1.0 {
            result.selected_variables.push(i);
        }
    }

    // Jika tidak ada variabel yang dipilih, hentikan analisis
    if result.selected_variables.is_empty() {
        result.success = false;
        result.error_message = "Tidak ada variabel yang dipilih selama pemilihan variabel".to_string();
    }

    Ok(result)
}

// Fungsi helper untuk konversi array f64 dari/ke JsValue
#[wasm_bindgen]
pub fn js_array_to_vec_f64(array: &JsValue) -> Result<Vec<f64>, JsValue> {
    let js_array = js_sys::Array::from(array);
    let mut result = Vec::with_capacity(js_array.length() as usize);

    for i in 0..js_array.length() {
        let value = js_array.get(i);
        result.push(value.as_f64().ok_or_else(|| {
            JsValue::from_str("Expected array of numbers")
        })?);
    }

    Ok(result)
}

// Fungsi helper untuk mendapatkan specific field dari result
#[wasm_bindgen]
pub fn get_group_means(result_js: &JsValue) -> Result<JsValue, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    serde_wasm_bindgen::to_value(&result.group_means)
        .map_err(|e| JsValue::from_str(&format!("Error serializing group_means: {}", e)))
}

#[wasm_bindgen]
pub fn get_overall_means(result_js: &JsValue) -> Result<JsValue, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    serde_wasm_bindgen::to_value(&result.overall_means)
        .map_err(|e| JsValue::from_str(&format!("Error serializing overall_means: {}", e)))
}

#[wasm_bindgen]
pub fn get_f_values(result_js: &JsValue) -> Result<JsValue, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    serde_wasm_bindgen::to_value(&result.f_values)
        .map_err(|e| JsValue::from_str(&format!("Error serializing f_values: {}", e)))
}

#[wasm_bindgen]
pub fn get_lambda_values(result_js: &JsValue) -> Result<JsValue, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    serde_wasm_bindgen::to_value(&result.lambda_values)
        .map_err(|e| JsValue::from_str(&format!("Error serializing lambda_values: {}", e)))
}

#[wasm_bindgen]
pub fn get_selected_variables(result_js: &JsValue) -> Result<JsValue, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    serde_wasm_bindgen::to_value(&result.selected_variables)
        .map_err(|e| JsValue::from_str(&format!("Error serializing selected_variables: {}", e)))
}

#[wasm_bindgen]
pub fn get_valid_groups(result_js: &JsValue) -> Result<JsValue, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    serde_wasm_bindgen::to_value(&result.valid_groups)
        .map_err(|e| JsValue::from_str(&format!("Error serializing valid_groups: {}", e)))
}

#[wasm_bindgen]
pub fn get_success_status(result_js: &JsValue) -> Result<bool, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    Ok(result.success)
}

#[wasm_bindgen]
pub fn get_error_message(result_js: &JsValue) -> Result<String, JsValue> {
    let result: DiscriminantResult = serde_wasm_bindgen::from_value(result_js.clone())?;
    Ok(result.error_message)
}
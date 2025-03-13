use wasm_bindgen::prelude::*;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use std::collections::HashMap;
use nalgebra::{DMatrix, DVector, SymmetricEigen, LU};
use statrs::distribution::{ChiSquared, ContinuousCDF};
use web_sys::console;

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct DiscriminantAnalysisResult {
    eigenvalues: Vec<f64>,
    wilks_lambda: f64,
    canonical_correlation: f64,
    chi_square: f64,
    df: u32,
    significance: f64,
    canonical_coefficients: Vec<Vec<f64>>,
    standardized_coefficients: Vec<Vec<f64>>,
    structure_matrix: Vec<Vec<f64>>,
}

#[wasm_bindgen]
pub fn discriminant_analysis(group_variable: JsValue, independent_variable: JsValue) -> JsValue {
    console::log_1(&"Starting Discriminant Analysis".into());

    let group_data: Vec<Vec<HashMap<String, Value>>> = group_variable.into_serde().unwrap_or_default();
    let independent_data: Vec<Vec<HashMap<String, Value>>> = independent_variable.into_serde().unwrap_or_default();

    let (x_matrix, y_vector) = process_input(&group_data, &independent_data);

    console::log_1(&format!("X Matrix: {:?}", x_matrix).into());
    console::log_1(&format!("Y Vector: {:?}", y_vector).into());

    let mean_vectors = compute_group_means(&x_matrix, &y_vector);
    console::log_1(&format!("Mean Vectors: {:?}", mean_vectors).into());

    let pooled_covariance = compute_pooled_covariance(&x_matrix, &y_vector, &mean_vectors);
    console::log_1(&format!("Pooled Covariance: {:?}", pooled_covariance).into());

    let (wilks_lambda, chi_square, df, significance) =
        compute_wilks_lambda(&x_matrix, &y_vector, &mean_vectors, &pooled_covariance);

    console::log_1(&format!(
        "Wilks Lambda: {}, Chi-Square: {}, DF: {}, Significance: {}",
        wilks_lambda, chi_square, df, significance
    ).into());

    let (eigenvalues, canonical_coefficients, canonical_correlation) =
        compute_eigenvalues_and_coefficients(&x_matrix);

    console::log_1(&format!("Eigenvalues: {:?}", eigenvalues).into());
    console::log_1(&format!("Canonical Coefficients: {:?}", canonical_coefficients).into());

    let standardized_coefficients =
        compute_standardized_coefficients(&pooled_covariance, &canonical_coefficients);
    console::log_1(&format!("Standardized Coefficients: {:?}", standardized_coefficients).into());

    let structure_matrix = compute_structure_matrix(&x_matrix, &canonical_coefficients);
    console::log_1(&format!("Structure Matrix: {:?}", structure_matrix).into());

    let result = DiscriminantAnalysisResult {
        eigenvalues,
        wilks_lambda,
        canonical_correlation,
        chi_square,
        df,
        significance,
        canonical_coefficients,
        standardized_coefficients,
        structure_matrix,
    };

    JsValue::from_serde(&result).unwrap()
}


// Fungsi untuk memproses data input ke dalam format numerik
fn process_input(group_data: &Vec<Vec<HashMap<String, Value>>>, independent_data: &Vec<Vec<HashMap<String, Value>>>) -> (DMatrix<f64>, DVector<i64>) {
    let mut x_values = vec![];
    let mut y_values = vec![];

    for (i, group) in group_data.iter().enumerate() {
        for (j, row) in group.iter().enumerate() {
            // Ambil nilai pertama (karena hanya ada satu key di setiap row)
            if let Some((_, Value::Number(g))) = row.iter().next() {
                if let Some(g_val) = g.as_i64() {
                    let mut x_row = vec![];
                    if let Some(ind_vars) = independent_data.get(i).and_then(|r| r.get(j)) {
                        for (_, value) in ind_vars.iter() {
                            if let Value::Number(num) = value {
                                if let Some(val) = num.as_f64() {
                                    x_row.push(val);
                                }
                            }
                        }
                    }
                    if !x_row.is_empty() {
                        x_values.push(x_row);
                        y_values.push(g_val);
                    }
                }
            }
        }
    }

    let n_rows = x_values.len();
    let n_cols = if !x_values.is_empty() { x_values[0].len() } else { 0 };

    let x_matrix = DMatrix::from_row_slice(n_rows, n_cols, &x_values.concat());
    let y_vector = DVector::from_vec(y_values);

    (x_matrix, y_vector)
}


// Hitung rata-rata setiap kelompok
fn compute_group_means(x_matrix: &DMatrix<f64>, y_vector: &DVector<i64>) -> HashMap<i64, DVector<f64>> {
    let mut group_sums: HashMap<i64, DVector<f64>> = HashMap::new();
    let mut group_counts: HashMap<i64, usize> = HashMap::new();

    for (i, &group) in y_vector.iter().enumerate() {
        let row = x_matrix.row(i).transpose();
        group_sums.entry(group).and_modify(|e| *e += &row).or_insert(row.clone());
        *group_counts.entry(group).or_insert(0) += 1;
    }

    group_sums.iter_mut().for_each(|(group, sum)| {
        let count = *group_counts.get(group).unwrap_or(&1) as f64;
        *sum /= count;
    });

    group_sums
}

// Hitung pooled covariance matrix
fn compute_pooled_covariance(x_matrix: &DMatrix<f64>, y_vector: &DVector<i64>, group_means: &HashMap<i64, DVector<f64>>) -> DMatrix<f64> {
    let n_features = x_matrix.ncols();
    let mut pooled_cov = DMatrix::<f64>::zeros(n_features, n_features);
    let mut total_samples = 0;

    for (i, &group) in y_vector.iter().enumerate() {
        if let Some(mean_vector) = group_means.get(&group) {
            let row = x_matrix.row(i).transpose();
            let diff = &row - mean_vector;
            pooled_cov += &diff * diff.transpose();
            total_samples += 1;
        }
    }

    pooled_cov / (total_samples as f64 - group_means.len() as f64)
}

// Hitung Wilks' Lambda
fn compute_wilks_lambda(x_matrix: &DMatrix<f64>, y_vector: &DVector<i64>, group_means: &HashMap<i64, DVector<f64>>, pooled_covariance: &DMatrix<f64>) -> (f64, f64, u32, f64) {
    let mut between_group_cov = DMatrix::<f64>::zeros(x_matrix.ncols(), x_matrix.ncols());
    let overall_mean = x_matrix.row_mean();

    for (group, mean_vector) in group_means.iter() {
        let mean_diff = mean_vector - &overall_mean.transpose();
        let n_group = y_vector.iter().filter(|&&g| g == *group).count() as f64;
        between_group_cov += n_group * (&mean_diff * mean_diff.transpose());
    }

    let determinant_pooled = pooled_covariance.clone().determinant();
    let determinant_total = (pooled_covariance.clone() + between_group_cov).determinant();
    let wilks_lambda = determinant_pooled / determinant_total;

    let p = x_matrix.ncols() as u32;
    let q = group_means.len() as u32;
    let n = y_vector.len() as u32;
    let df = p * q;
    let chi_square = -((n - 1 - ((p + q + 1) / 2)) as f64) * wilks_lambda.ln();
    let chi_sq_dist = ChiSquared::new(df as f64).unwrap();
    let significance = 1.0 - chi_sq_dist.cdf(chi_square);

    (wilks_lambda, chi_square, df, significance)
}

// Hitung Eigenvalues dan Canonical Discriminant Coefficients
fn compute_eigenvalues_and_coefficients(
    between_group_cov: &DMatrix<f64>,
) -> (Vec<f64>, Vec<Vec<f64>>, f64) {
    let symmetric_eigen = SymmetricEigen::new(between_group_cov.clone());

    let eigenvalues: Vec<f64> = symmetric_eigen.eigenvalues.iter().copied().collect();
    let coefficients = symmetric_eigen.eigenvectors.row_iter()
        .map(|row| row.iter().copied().collect())
        .collect();

    let canonical_correlation = (eigenvalues[0] / (1.0 + eigenvalues[0])).sqrt();

    (eigenvalues, coefficients, canonical_correlation)
}

// Menghitung Standardized Canonical Discriminant Function Coefficients
fn compute_standardized_coefficients(
    pooled_covariance: &DMatrix<f64>,
    canonical_coefficients: &Vec<Vec<f64>>,
) -> Vec<Vec<f64>> {
    let pooled_inv = pooled_covariance.clone().lu().try_inverse()
        .unwrap_or_else(|| DMatrix::zeros(pooled_covariance.nrows(), pooled_covariance.ncols()));

    let coefficients_matrix = DMatrix::from_row_slice(
        canonical_coefficients.len(),
        canonical_coefficients[0].len(),
        &canonical_coefficients.concat(),
    );

    let standardized_coefficients = pooled_inv * coefficients_matrix;

    standardized_coefficients.row_iter()
        .map(|row| row.iter().copied().collect())
        .collect()
}

// Menghitung Structure Matrix
fn compute_structure_matrix(
    x_matrix: &DMatrix<f64>,
    canonical_coefficients: &Vec<Vec<f64>>,
) -> Vec<Vec<f64>> {
    let canonical_matrix = DMatrix::from_row_slice(
        canonical_coefficients.len(),
        canonical_coefficients[0].len(),
        &canonical_coefficients.concat(),
    );

    let structure_matrix = x_matrix.transpose() * &canonical_matrix;

    structure_matrix.row_iter()
        .map(|row| row.iter().copied().collect())
        .collect()
}
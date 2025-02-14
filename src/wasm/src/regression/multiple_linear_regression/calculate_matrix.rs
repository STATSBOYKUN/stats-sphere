use nalgebra::DMatrix;

// Fungsi untuk transpose matriks
pub fn transpose(matrix: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let rows = matrix.len();
    let cols = matrix[0].len();
    let mut result = vec![vec![0.0; rows]; cols];
    for i in 0..rows {
        for j in 0..cols {
            result[j][i] = matrix[i][j];
        }
    }
    result
}

// Fungsi untuk mengalikan dua matriks
pub fn multiply_matrix(a: &Vec<Vec<f64>>, b: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let rows_a = a.len();
    let cols_a = a[0].len();
    let cols_b = b[0].len();
    let mut result = vec![vec![0.0; cols_b]; rows_a];
    for i in 0..rows_a {
        for j in 0..cols_b {
            for k in 0..cols_a {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }
    result
}

// Fungsi untuk mengalikan matriks dengan vektor
pub fn multiply_matrix_vector(matrix: &Vec<Vec<f64>>, vector: &Vec<f64>) -> Vec<f64> {
    let rows = matrix.len();
    let cols = matrix[0].len();
    let mut result = vec![0.0; rows];
    for i in 0..rows {
        for j in 0..cols {
            result[i] += matrix[i][j] * vector[j];
        }
    }
    result
}

// Fungsi untuk mengalikan vektor dengan matriks
pub fn multiply_vector_matrix(vector: &Vec<f64>, matrix: &Vec<Vec<f64>>) -> Vec<f64> {
    let cols = matrix[0].len();
    let rows = matrix.len();
    // Pastikan ukuran vektor cocok dengan jumlah baris matriks
    assert_eq!(vector.len(), rows, "Vector length must match matrix row count");
    let mut result = vec![0.0; cols];
    for j in 0..cols {
        for i in 0..rows {
            result[j] += vector[i] * matrix[i][j];
        }
    }
    result
}

// Fungsi untuk mencari invers matriks menggunakan eliminasi Gauss-Jordan
pub fn invert_matrix(matrix: &Vec<Vec<f64>>) -> Option<Vec<Vec<f64>>> {
    let n = matrix.len();
    
    // Konversi Vec<Vec<f64>> ke DMatrix
    let data: Vec<f64> = matrix.iter().flatten().cloned().collect();
    let mat = DMatrix::from_row_slice(n, n, &data);

    // Coba inversi menggunakan `try_inverse()`
    mat.try_inverse().map(|inv_mat| inv_mat.data.as_vec().chunks(n).map(|r| r.to_vec()).collect())
}
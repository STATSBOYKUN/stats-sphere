use nalgebra::DMatrix;
// Fungsi untuk transpose matriks
pub fn transpose(matrix: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let cols = matrix.len();
    let rows = matrix[0].len();
    let mut result: Vec<Vec<f64>> = Vec::new();
    for i in 0..rows {
        let mut col = Vec::new();
        for j in 0..cols {
            col.push(matrix[j][i]);
        }
        result.push(col);
    }
    result
}

// Fungsi untuk mengalikan dua matriks
pub fn multiply_matrix(a: &Vec<Vec<f64>>, b: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let rows_a = a[0].len();
    let cols_a = a.len();
    let _rows_b = b[0].len();
    let cols_b = b.len();
    let mut result = Vec::new();
    for i in 0..cols_b {
        let mut row = Vec::new();
        for j in 0..rows_a {
            let mut cell = 0.0;
            for k in 0..cols_a {
                cell += a[k][j] * b[i][k];
            }
            row.push(cell);
        }
        result.push(row);
    }
    result
}

// Fungsi untuk mengalikan matriks dengan vektor
pub fn multiply_matrix_vector(matrix: &Vec<Vec<f64>>, vector: &Vec<f64>) -> Vec<f64> {
    let rows_matrix = matrix[0].len();
    let cols_matrix = matrix.len();
    // let _rows_vector = vector[0].len();
    // let cols_vector = vector.len();
    let mut result = Vec::new();
    for j in 0..rows_matrix {
        let mut cell = 0.0;
        for k in 0..cols_matrix {
            cell += matrix[k][j] * vector[k];
        }
        result.push(cell);
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
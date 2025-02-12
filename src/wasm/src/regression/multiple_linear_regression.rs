// // Fungsi untuk transpose matriks
// fn transpose(matrix: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
//     let rows = matrix.len();
//     let cols = matrix[0].len();
//     let mut result = vec![vec![0.0; rows]; cols];
//     for i in 0..rows {
//         for j in 0..cols {
//             result[j][i] = matrix[i][j];
//         }
//     }
//     result
// }

// // Fungsi untuk mengalikan dua matriks
// fn multiply_matrix(a: &Vec<Vec<f64>>, b: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
//     let rows_a = a.len();
//     let cols_a = a[0].len();
//     let cols_b = b[0].len();
//     let mut result = vec![vec![0.0; cols_b]; rows_a];
//     for i in 0..rows_a {
//         for j in 0..cols_b {
//             for k in 0..cols_a {
//                 result[i][j] += a[i][k] * b[k][j];
//             }
//         }
//     }
//     result
// }

// // Fungsi untuk mengalikan matriks dengan vektor
// fn multiply_matrix_vector(matrix: &Vec<Vec<f64>>, vector: &Vec<f64>) -> Vec<f64> {
//     let rows = matrix.len();
//     let cols = matrix[0].len();
//     let mut result = vec![0.0; rows];
//     for i in 0..rows {
//         for j in 0..cols {
//             result[i] += matrix[i][j] * vector[j];
//         }
//     }
//     result
// }

// // Fungsi untuk mencari invers matriks menggunakan eliminasi Gauss-Jordan
// fn invert_matrix(matrix: &Vec<Vec<f64>>) -> Option<Vec<Vec<f64>>> {
//     let n = matrix.len();
//     let mut a = matrix.clone();
//     let mut inv = vec![vec![0.0; n]; n];
//     for i in 0..n {
//         inv[i][i] = 1.0;
//     }
//     for i in 0..n {
//         // Cari pivot
//         let mut pivot = a[i][i];
//         if pivot == 0.0 {
//             // Jika pivot nol, cari baris lain yang bisa ditukar
//             let mut found = false;
//             for j in i+1..n {
//                 if a[j][i] != 0.0 {
//                     a.swap(i, j);
//                     inv.swap(i, j);
//                     pivot = a[i][i];
//                     found = true;
//                     break;
//                 }
//             }
//             if !found {
//                 return None; // Matriks singular, tidak bisa diinvers
//             }
//         }
//         // Normalisasi baris pivot
//         for j in 0..n {
//             a[i][j] /= pivot;
//             inv[i][j] /= pivot;
//         }
//         // Eliminasi elemen kolom pivot pada baris lain
//         for k in 0..n {
//             if k != i {
//                 let factor = a[k][i];
//                 for j in 0..n {
//                     a[k][j] -= factor * a[i][j];
//                     inv[k][j] -= factor * inv[i][j];
//                 }
//             }
//         }
//     }
//     Some(inv)
// }

// // Fungsi untuk regresi linear berganda
// // x: setiap baris adalah observasi dan setiap kolom adalah fitur
// // y: vektor target
// fn multiple_linear_regression(x: Vec<Vec<f64>>, y: Vec<f64>) -> Option<Vec<f64>> {
//     let m = x.len();      // jumlah observasi
//     let n = x[0].len();   // jumlah fitur

//     // Membangun matriks desain X dengan kolom pertama sebagai 1 untuk intercept
//     let mut design_matrix = vec![vec![1.0; n + 1]; m];
//     for i in 0..m {
//         for j in 0..n {
//             design_matrix[i][j + 1] = x[i][j];
//         }
//     }

//     // Hitung X^T
//     let xt = transpose(&design_matrix);
//     // Hitung X^T * X
//     let xtx = multiply_matrix(&xt, &design_matrix);
//     // Cari invers dari X^T * X
//     let xtx_inv = invert_matrix(&xtx)?;
//     // Hitung X^T * y
//     let xt_y = multiply_matrix_vector(&xt, &y);
//     // Hitung koefisien: beta = (X^T * X)^{-1} * X^T * y
//     let beta = multiply_matrix_vector(&xtx_inv, &xt_y);
//     Some(beta)
// }
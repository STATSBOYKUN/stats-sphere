use crate::{yul_walk_est, invert_matrix, multiply_matrix, multiply_matrix_vector, transpose};

pub fn hann_ris_alg(p: usize, q: usize, data: Vec<f64>) -> Vec<f64> {
    let phi = yul_walk_est(p, data.clone());
    let mut z = Vec::new();
    let mut x = Vec::new();
    let n = data.len();
    for i in p..n{
        let mut sum = data[i];
        for j in 0..p{
            sum -= phi[j] * data[i-j-1];
        }
        z.push(sum);
        x.push(data[i-1]);
    }
    let mut z_matrix: Vec<Vec<f64>> = Vec::new();
    for i in 0..p+q{
        let mut row = Vec::new();
        if i < p{
            for j in 0..n-p{
                row.push(data[p+j-i]);
            }
        }else {
            for j in 0..n-p{
                row.push(z[p+j-i]);
            }
        }
        z_matrix.push(row);
    }
    let z_matrix_t = transpose(&z_matrix);
    let z_matrix_t_z_matrix = multiply_matrix(&z_matrix_t, &z_matrix);
    let inv_z_matrix_t_z_matrix = invert_matrix(&z_matrix_t_z_matrix).unwrap();
    let z_matrix_t_x = multiply_matrix_vector(&z_matrix_t, &x);
    let arma_coef = multiply_matrix_vector(&inv_z_matrix_t_z_matrix, &z_matrix_t_x);
    arma_coef
}
use crate::{invert_matrix, autocov, multiply_matrix_vector};

pub fn yul_walk_est(p: usize, data: Vec<f64>) -> Vec<f64> {
    let mut cov_matrix: Vec<Vec<f64>> = Vec::new();
    let mut acf_vec = Vec::new();
    let cov0 = autocov(0, &data);
    for i in 0..p {
        let mut row = Vec::new();
        for j in 0..p {
            let ind = ((i as f64) - (j as f64)).abs() as usize;
            let cov = autocov(ind, &data);
            row.push(cov);
        }
        cov_matrix.push(row);
        let covp= autocov(i+1, &data);
        acf_vec.push(covp/cov0);
    }
    let inv_cov_matrix = invert_matrix(&cov_matrix).unwrap();
    let phi = multiply_matrix_vector(&inv_cov_matrix, &acf_vec);
    phi
}
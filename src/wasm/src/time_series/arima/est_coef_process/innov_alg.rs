use crate::autocov;
use wasm_bindgen::prelude::*;
#[wasm_bindgen]
pub fn innov_alg(q: usize, data: Vec<f64>) -> Vec<f64> {
    let mut acv = Vec::new();
    let mut theta: Vec<Vec<f64>> = Vec::new();
    for i in 0..=q{
        acv.push(autocov(i, &data));
        let mut row = Vec::new();
        for _j in 0..=q{
            row.push(0.0);
        }
        theta.push(row);
    }
    let mut v = Vec::new();
    v.push(acv[0]);
    for n in 1..=q {
        for k in 0..n {
            let mut sum = 0.0;
            for j in 0..k {
                sum += theta[k][k-j] * theta[n][n-j] * v[j];
            }
            let acv_idx = n - k;
            theta[n][n-k] = (acv[acv_idx] - sum) / v[k];
        }
        let mut sum = 0.0;
        for j in 0..n{
            sum += theta[n][n-j].powi(2) * v[j];
        }
        v.push(acv[0] - sum);
    }
    let mut fix_theta = Vec::new();
    for i in 1..=q{
        fix_theta.push(theta[q][i]);
    }
    fix_theta
}
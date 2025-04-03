use crate::{css, durb_lev_alg, first_difference, innov_alg};
use finitediff::FiniteDiff;
use liblbfgs::lbfgs;
use anyhow::Result;

pub fn est_coef(p: usize, d: usize, q: usize, data: Vec<f64>) -> Result<Vec<f64>> {
    let mut data = data.clone();
    let mut coef = Vec::new();
    if d > 0 {
        for _ in 0..d{
            let diff = first_difference(data.clone());
            data = diff;
        }
    }
    let mean = data.iter().sum::<f64>() / data.len() as f64;
    coef.push(mean);
    if p > 0 && q > 0 {
        let phi = durb_lev_alg(p, data.clone());
        for i in 0..p{
            coef.push(phi[i]);
        }
        let theta = innov_alg(q, data.clone());
        for i in 0..q{
            coef.push(theta[i]);
        }
    } else if p > 0 {
        let phi = durb_lev_alg(p, data.clone());
        for i in 0..p{
            coef.push(phi[i]);
        }
    }else if q > 0 {
        let theta = innov_alg(q, data.clone());
        for i in 0..q{
            coef.push(theta[i]);
        }
    } 
    let f = |coef: &Vec<f64>| {
        let intercept = coef[0];
        let phi ;
        let theta ;
        if p > 0 && q > 0{
            phi = coef[1..p+1].to_vec();
            theta = coef[p+1..].to_vec();
        } else if p > 0 {
            phi = coef[1..].to_vec();
            theta = Vec::new();
        } else {
            phi = Vec::new();
            theta = coef[1..].to_vec();
        }
        // let cs = css(p, q, intercept, phi, theta, data.clone());
        // let n = data.len() as f64;
        // let df = n - 2.0*p as f64 - q as f64 - 1.0;
        // let var_res = cs / df;
        // let log_like = - n / 2.0 * (2.0 * std::f64::consts::PI * var_res).ln() - cs / (2.0 * var_res);
        // log_like
        css(p, q, intercept, phi, theta, data.clone())
    };
    let g = |coef: &Vec<f64>| coef.forward_diff(&f);
    let eval = |x: &[f64], gx: &mut [f64]| {
        let x_vec = x.to_vec();
        let fx = f(&x_vec);
        let gx_eval = g(&x_vec);
        // copy values from gx_eval into gx
        gx[..gx_eval.len()].copy_from_slice(&gx_eval[..]);
        Ok(fx)
    };
    let fmin = lbfgs().with_max_iterations(200);
    if let Err(e) = fmin.minimize(
        &mut coef, // input variables
        eval,  // define how to evaluate function
        |_prgr| {
            false // returning true will cancel optimization
        },
    ) {
        tracing::warn!("Got error during fit: {}", e);
    }
    Ok(coef)
}
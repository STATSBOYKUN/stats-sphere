use crate::autocov;

pub fn durb_lev_alg(p: usize, data: Vec<f64>) -> Vec<f64> {
    let mut v = Vec::new();
    let mut phi = Vec::new();
    for i in 0..p {
        if i == 0 {
            let autocov0 = autocov(0, &data);
            let autocov1 = autocov(1, &data);
            phi.push(autocov1 / autocov0);
            v.push(autocov0);
        } else {
            let mut sum = 0.0;
            for j in 0..i{
                sum += phi[i-1] * autocov(p-j-1, &data);
            }
            let autocovi = autocov(i, &data);
            let vi = v[i-1]*(1.0 - phi[i-1]*phi[i-1]);
            phi.push((autocovi - sum) / vi);
            v.push(vi);
        }
    }
    phi
}
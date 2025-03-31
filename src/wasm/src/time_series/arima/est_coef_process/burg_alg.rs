use crate::durb_lev_alg;

pub fn burg_alg(p: usize, data: Vec<f64>) -> Vec<f64> {
    let mut v = Vec::new();
    let mut u = Vec::new();
    let mut d = Vec::new();
    let mut phi_burg = Vec::new();
    let phi_durb_lev = durb_lev_alg(p, data.clone());
    for i in 0..data.len() - 1 {
        u.push(data[data.len() - 1 - i]);
        v.push(data[data.len() - 1 - i]);
    }
    let sum_2_data = data.clone().iter().map(|x| x * x).sum::<f64>();
    d.push(sum_2_data);
    for i in 0..p {
        let mut sum = 0.0;
        let mut utmp = Vec::new();
        let mut vtmp = Vec::new();
        for t in i+1..v.len(){
            utmp.push(u[t-1] - phi_durb_lev[i] * v[t]);
            vtmp.push(v[t-1] - phi_durb_lev[i] * u[t]);
        }
        for t in i+1..vtmp.len(){
            sum += utmp[t] * vtmp[t-1];
        }
        phi_burg.push(sum / d[i]);
        d.push((1.0 - phi_burg[i].powi(2)) * d[i] - vtmp[i+1] - utmp[utmp.len()-1]);
        u = utmp;
        v = vtmp;
    }
    phi_burg
}
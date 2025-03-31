pub fn css(p: usize, q: usize, intercept: f64, phi: Vec<f64>, theta: Vec<f64>, data: Vec<f64>) ->f64 {
    let mut residuals = Vec::new();
    if p > 0 && q > 0 {
        for i in 0..data.len() {
            let mut sum_phi = 0.0;
            for j in 1..=p as usize {
                if i + 1 > j {
                    sum_phi += phi[j - 1] * (data[i - j] - intercept);
                }
            }
            let mut sum_theta = 0.0;
            for j in 1..=q as usize {
                if i + 1 > j {
                    sum_theta += theta[j - 1] * residuals[i - j];
                }
            }
            residuals.push(data[i] - intercept - sum_phi + sum_theta);
        }
    } else if p > 0 {
        for i in 0..data.len() {
            let mut sum_phi = 0.0;
            for j in 1..=p as usize {
                if i + 1 > j {
                    sum_phi += phi[j - 1] * (data[i - j] - intercept);
                }
            }
            residuals.push(data[i] - intercept - sum_phi);
        }
    } else if q > 0 {
        for i in 0..data.len() {
            let mut sum_theta = 0.0;
            for j in 1..=q as usize {
                if i + 1 > j {
                    sum_theta += theta[j - 1] * residuals[i - j];
                }
            }
            residuals.push(data[i] - intercept + sum_theta);
        }
    } else {
        for i in 0..data.len() {
            residuals.push(data[i] - intercept);
        }
    }
    let css = residuals.iter().map(|x| x.powi(2)).sum::<f64>();
    css
}
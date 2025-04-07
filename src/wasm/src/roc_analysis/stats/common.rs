pub fn calculate_nonparametric_std_error(
    positive_values: &[f64],
    negative_values: &[f64],
    auc: f64,
    larger_is_positive: bool
) -> f64 {
    let m = positive_values.len();
    let n = negative_values.len();

    let mut q1_sum = 0.0;
    for i in 0..m {
        let mut count = 0.0;
        for j in 0..n {
            if larger_is_positive {
                if positive_values[i] > negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            } else {
                if positive_values[i] < negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            }
        }
        q1_sum += (count / (n as f64) - auc).powi(2);
    }
    let q1 = q1_sum / ((m - 1) as f64);

    let mut q2_sum = 0.0;
    for j in 0..n {
        let mut count = 0.0;
        for i in 0..m {
            if larger_is_positive {
                if positive_values[i] > negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            } else {
                if positive_values[i] < negative_values[j] {
                    count += 1.0;
                } else if positive_values[i] == negative_values[j] {
                    count += 0.5;
                }
            }
        }
        q2_sum += (count / (m as f64) - auc).powi(2);
    }
    let q2 = q2_sum / ((n - 1) as f64);

    ((auc * (1.0 - auc) + ((m - 1) as f64) * q1 + ((n - 1) as f64) * q2) / ((m * n) as f64)).sqrt()
}

pub fn calculate_binegexp_std_error(
    positive_values: &[f64],
    negative_values: &[f64],
    auc: f64
) -> f64 {
    let m = positive_values.len();
    let n = negative_values.len();

    if m != n {
        return calculate_nonparametric_std_error(positive_values, negative_values, auc, true);
    }

    let q3 = auc / (2.0 - auc);
    let q4 = (2.0 * auc.powi(2)) / (1.0 + auc);

    (
        (auc * (1.0 - auc) +
            ((m - 1) as f64) * (q3 - auc.powi(2)) +
            ((n - 1) as f64) * (q4 - auc.powi(2))) /
        ((m * n) as f64)
    ).sqrt()
}

pub fn normal_cdf(x: f64) -> f64 {
    0.5 * (1.0 + erf(x / (2.0_f64).sqrt()))
}

pub fn erf(x: f64) -> f64 {
    let sign = if x >= 0.0 { 1.0 } else { -1.0 };
    let x = x.abs();

    let a1 = 0.254829592;
    let a2 = -0.284496736;
    let a3 = 1.421413741;
    let a4 = -1.453152027;
    let a5 = 1.061405429;
    let p = 0.3275911;

    let t = 1.0 / (1.0 + p * x);
    let y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * (-x * x).exp();

    sign * y
}

pub fn normal_quantile(p: f64) -> f64 {
    if p <= 0.0 {
        return f64::NEG_INFINITY;
    }
    if p >= 1.0 {
        return f64::INFINITY;
    }

    if p == 0.5 {
        return 0.0;
    }

    let q = if p > 0.5 { 1.0 - p } else { p };

    let t = (-2.0 * q.ln()).sqrt();

    let c0 = 2.515517;
    let c1 = 0.802853;
    let c2 = 0.010328;
    let d1 = 1.432788;
    let d2 = 0.189269;
    let d3 = 0.001308;

    let x = t - (c0 + c1 * t + c2 * t.powi(2)) / (1.0 + d1 * t + d2 * t.powi(2) + d3 * t.powi(3));

    if p > 0.5 {
        x
    } else {
        -x
    }
}

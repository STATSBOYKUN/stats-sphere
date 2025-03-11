/// Statistical functions for discriminant analysis

use std::f64::consts::PI;

/// Chi-square CDF (Cumulative Distribution Function)
pub fn chi_square_cdf(x: f64, df: u32) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    match df {
        1 => {
            // For df=1, use normal distribution
            2.0 * normal_cdf(x.sqrt(), 0.0, 1.0) - 1.0
        },
        2 => {
            // For df=2, use exponential distribution
            1.0 - (-x / 2.0).exp()
        },
        _ => {
            // For df > 2, use Wilson-Hilferty approximation
            let df_f64 = df as f64;
            let z = ((x / df_f64).powf(1.0 / 3.0) - 1.0 + 2.0 / (9.0 * df_f64)) /
                    (2.0 / (9.0 * df_f64)).sqrt();

            normal_cdf(z, 0.0, 1.0)
        }
    }
}

/// Normal distribution CDF
pub fn normal_cdf(x: f64, mean: f64, std_dev: f64) -> f64 {
    let z = (x - mean) / std_dev;
    0.5 * (1.0 + erf(z / std::f64::consts::SQRT_2))
}

/// Error function (erf) approximation
pub fn erf(x: f64) -> f64 {
    // Constants for approximation
    let a1 =  0.254829592;
    let a2 = -0.284496736;
    let a3 =  1.421413741;
    let a4 = -1.453152027;
    let a5 =  1.061405429;
    let p  =  0.3275911;

    let sign = if x < 0.0 { -1.0 } else { 1.0 };
    let x = x.abs();

    let t = 1.0 / (1.0 + p * x);
    let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * (-x * x).exp();

    sign * y
}

/// F-distribution CDF
pub fn f_distribution_cdf(x: f64, df1: u32, df2: u32) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    // Approximation using beta distribution
    let v1 = df1 as f64;
    let v2 = df2 as f64;

    let beta_x = v1 * x / (v1 * x + v2);

    regularized_incomplete_beta(beta_x, v1 / 2.0, v2 / 2.0)
}

/// Compute p-value from F statistic
pub fn f_test_p_value(f: f64, df1: u32, df2: u32) -> f64 {
    if f <= 0.0 {
        return 1.0;
    }

    // Convert F-distribution to Beta distribution
    let v1 = df1 as f64;
    let v2 = df2 as f64;
    let x = v2 / (v2 + v1 * f);

    // P-value = I_x(v2/2, v1/2) where I_x is regularized incomplete beta function
    let p_value = regularized_incomplete_beta(x, v2/2.0, v1/2.0);

    p_value
}

/// Accurate implementation of regularized incomplete beta function
pub fn regularized_incomplete_beta(x: f64, a: f64, b: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }

    // For better numerical stability, use different methods depending on parameters
    if x > (a + 1.0)/(a + b + 2.0) {
        // Use symmetry relation for better numerical accuracy
        return 1.0 - regularized_incomplete_beta(1.0 - x, b, a);
    }

    // Calculate logarithm of Beta function for numerical stability
    let ln_beta = ln_gamma(a) + ln_gamma(b) - ln_gamma(a + b);

    // Calculate using continued fraction method (Lentz's algorithm)
    let cfrac = continued_fraction_beta(x, a, b);

    // Final formula
    let factor = (a * x.ln() + b * (1.0-x).ln() - ln_beta).exp() / a;
    factor * cfrac
}

fn continued_fraction_beta(x: f64, a: f64, b: f64) -> f64 {
    // Implementation based on Numerical Recipes
    // Uses Lentz's method for continued fraction evaluation

    let max_iterations = 200;
    let epsilon = 1.0e-14;
    let small = 1.0e-30;

    let qab = a + b;
    let qap = a + 1.0;
    let qam = a - 1.0;

    // First term
    let mut c = 1.0;
    let mut d = 1.0 - qab * x / qap;
    if d.abs() < small { d = small; }
    d = 1.0 / d;
    let mut h = d;

    // Continue with the fraction
    for m in 1..max_iterations {
        let m2 = 2 * m;

        // Even term
        let m_f = m as f64;
        let aa = m_f * (b - m_f) * x / ((qam + m2 as f64) * (a + m2 as f64));
        d = 1.0 + aa * d;
        if d.abs() < small { d = small; }
        c = 1.0 + aa / c;
        if c.abs() < small { c = small; }
        d = 1.0 / d;
        h *= d * c;

        // Odd term
        let aa = -(a + m_f) * (qab + m_f) * x / ((a + m2 as f64) * (qap + m2 as f64));
        d = 1.0 + aa * d;
        if d.abs() < small { d = small; }
        c = 1.0 + aa / c;
        if c.abs() < small { c = small; }
        d = 1.0 / d;
        let del = d * c;
        h *= del;

        // Check for convergence
        if (del - 1.0).abs() < epsilon {
            break;
        }
    }

    h
}

/// Calculate beta function B(a,b)
pub fn beta(a: f64, b: f64) -> f64 {
    // Using logarithms for better numerical stability
    let ln_gamma_a = ln_gamma(a);
    let ln_gamma_b = ln_gamma(b);
    let ln_gamma_ab = ln_gamma(a + b);

    (ln_gamma_a + ln_gamma_b - ln_gamma_ab).exp()
}

/// Gamma function approximation using Lanczos approximation
pub fn gamma(x: f64) -> f64 {
    // Reflection formula for negative x
    if x < 0.5 {
        PI / (PI * x).sin() / gamma(1.0 - x)
    } else {
        // Lanczos approximation
        let p = [
            676.5203681218851, -1259.1392167224028, 771.32342877765313,
            -176.61502916214059, 12.507343278686905, -0.13857109526572012,
            9.9843695780195716e-6, 1.5056327351493116e-7
        ];

        let mut x = x - 1.0;
        let mut y = 0.99999999999980993;

        for i in 0..p.len() {
            y += p[i] / (x + i as f64 + 1.0);
        }

        let t = x + p.len() as f64 - 0.5;

        std::f64::consts::SQRT_2 * t.powf(x + 0.5) * (-t).exp() * y
    }
}

/// Calculate natural logarithm of gamma function
/// Improved ln_gamma function using Lanczos approximation
pub fn ln_gamma(x: f64) -> f64 {
    // Constants for Lanczos approximation
    let p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313,
        -176.61502916214059, 12.507343278686905, -0.13857109526572012,
        9.9843695780195716e-6, 1.5056327351493116e-7
    ];

    let mut result;

    if x <= 0.0 {
        // Use reflection formula for negative values
        let pi = std::f64::consts::PI;
        let sinpx = (pi * (x - (x as i64) as f64)).sin().abs();
        if sinpx.abs() < 1e-10 {
            // Return infinity for negative integers (gamma function poles)
            return f64::INFINITY;
        }
        result = (pi / sinpx / gamma(1.0 - x)).ln();
    } else {
        // Lanczos approximation for positive values
        let mut z = x - 1.0;
        let mut a = 0.99999999999980993;
        for i in 0..p.len() {
            a += p[i] / (z + (i as f64) + 1.0);
        }
        let t = z + p.len() as f64 - 0.5;
        result = (2.0 * std::f64::consts::PI).sqrt().ln() + (z + 0.5) * t.ln() - t + a.ln();
    }

    result
}

/// Compute p-value from chi-square statistic
pub fn chi_square_p_value(chi_square: f64, df: u32) -> f64 {
    1.0 - chi_square_cdf(chi_square, df)
}

/// Compute Mahalanobis distance
pub fn mahalanobis_distance(x: &[f64], mean: &[f64], inv_cov: &[Vec<f64>]) -> f64 {
    if x.len() != mean.len() || x.len() != inv_cov.len() {
        return f64::NAN;
    }

    // Calculate (x - mean)
    let mut diff = vec![0.0; x.len()];
    for i in 0..x.len() {
        diff[i] = x[i] - mean[i];
    }

    // Calculate (x - mean)' * inv_cov * (x - mean)
    let mut distance = 0.0;
    for i in 0..diff.len() {
        for j in 0..diff.len() {
            distance += diff[i] * inv_cov[i][j] * diff[j];
        }
    }

    distance
}

/// Compute Wilks' Lambda significance test
pub fn wilks_lambda_significance(lambda: f64, p: usize, df_hypothesis: usize, df_error: usize) -> f64 {
    // Calculate approximation using chi-square or F distribution
    let n = df_error + df_hypothesis + 1;

    if p == 1 && df_hypothesis == 1 {
        // Direct F-test for univariate case
        let f = (1.0 - lambda) / lambda * df_error as f64 / df_hypothesis as f64;
        return f_test_p_value(f, df_hypothesis as u32, df_error as u32);
    } else if df_hypothesis == 1 || p == 1 {
        // Rao's F approximation
        let f = (1.0 - lambda.sqrt()) / lambda.sqrt() * df_error as f64 / df_hypothesis as f64;
        return f_test_p_value(f, df_hypothesis as u32, df_error as u32);
    } else if p == 2 {
        // Exact F for 2-variable case
        let ms = (p * df_hypothesis) as f64;
        let f = (1.0 - lambda.powf(1.0 / ms)) / lambda.powf(1.0 / ms) * (df_error as f64 - (p - 1) as f64 / 2.0 + 1.0) / ms;
        return f_test_p_value(f, 2 * df_hypothesis as u32, 2 * (df_error - 1) as u32);
    } else {
        // Chi-square approximation
        let chi2 = -(n as f64 - 0.5 * (p as f64 + df_hypothesis as f64 + 1.0)) * lambda.ln();
        return chi_square_p_value(chi2, (p * df_hypothesis) as u32);
    }
}

/// Compute Bartlett's test for homogeneity of variances
pub fn bartlett_test(variances: &[f64], sample_sizes: &[usize]) -> (f64, f64) {
    let k = variances.len();
    if k < 2 || sample_sizes.len() != k {
        return (f64::NAN, f64::NAN);
    }

    // Calculate total sample size and pooled variance
    let mut n_total = 0;
    for &n in sample_sizes {
        n_total += n;
    }

    let mut sum_var_weighted = 0.0;
    for i in 0..k {
        sum_var_weighted += (sample_sizes[i] - 1) as f64 * variances[i];
    }

    let pooled_var = sum_var_weighted / (n_total - k) as f64;

    // Calculate test statistic
    let mut sum_n_minus_1 = 0;
    let mut sum_ln_var_weighted = 0.0;

    for i in 0..k {
        sum_n_minus_1 += sample_sizes[i] - 1;
        sum_ln_var_weighted += (sample_sizes[i] - 1) as f64 * variances[i].ln();
    }

    let correction = 1.0 + (1.0 / (3.0 * (k - 1) as f64)) *
                        (1.0 / sum_n_minus_1 as f64 - 1.0 / (n_total - k) as f64);

    let test_statistic = ((n_total - k) as f64 * pooled_var.ln() - sum_ln_var_weighted) / correction;

    let p_value = chi_square_p_value(test_statistic, (k - 1) as u32);

    (test_statistic, p_value)
}

/// Compute variance of a vector
pub fn variance(x: &[f64]) -> f64 {
    if x.len() < 2 {
        return f64::NAN;
    }

    let mean = x.iter().sum::<f64>() / x.len() as f64;
    let sum_squared_diff = x.iter().map(|&val| (val - mean).powi(2)).sum::<f64>();

    sum_squared_diff / (x.len() - 1) as f64
}

/// Compute covariance between two vectors
pub fn covariance(x: &[f64], y: &[f64]) -> f64 {
    let n = x.len().min(y.len());
    if n < 2 {
        return f64::NAN;
    }

    let mean_x = x.iter().take(n).sum::<f64>() / n as f64;
    let mean_y = y.iter().take(n).sum::<f64>() / n as f64;

    let mut sum_product = 0.0;
    for i in 0..n {
        sum_product += (x[i] - mean_x) * (y[i] - mean_y);
    }

    sum_product / (n - 1) as f64
}

/// Compute correlation between two vectors
pub fn correlation(x: &[f64], y: &[f64]) -> f64 {
    let n = x.len().min(y.len());
    if n < 2 {
        return f64::NAN;
    }

    let var_x = variance(&x[0..n]);
    let var_y = variance(&y[0..n]);

    if var_x <= 0.0 || var_y <= 0.0 {
        return f64::NAN;
    }

    let cov_xy = covariance(&x[0..n], &y[0..n]);

    cov_xy / (var_x * var_y).sqrt()
}
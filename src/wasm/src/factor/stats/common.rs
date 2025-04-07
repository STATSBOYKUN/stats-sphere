use std::f64::consts::PI;

// Chi-square cumulative distribution function
pub fn chi_square_cdf(x: f64, df: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    // For chi-square, we use the relationship with gamma distribution
    // CDF(x; df) = P(df/2, x/2) where P is the regularized gamma function
    let a = df / 2.0;
    let y = x / 2.0;

    gamma_p(a, y)
}

// Regularized gamma function P(a,x)
pub fn gamma_p(a: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x < a + 1.0 {
        // Use series expansion
        let mut sum = 1.0 / a;
        let mut term = 1.0 / a;
        for i in 1..100 {
            term *= x / (a + (i as f64));
            sum += term;
            if term < 1e-10 * sum {
                break;
            }
        }
        let gamma_a = gamma_function(a);
        return (sum * (x.powf(a) * (-x).exp())) / gamma_a;
    } else {
        // Use continued fraction
        return 1.0 - gamma_q(a, x);
    }
}

// Regularized gamma function Q(a,x) = 1 - P(a,x)
pub fn gamma_q(a: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 1.0;
    }

    // Use continued fraction for Q
    let mut b = x + 1.0 - a;
    let mut c = 1.0 / 1e-30;
    let mut d = 1.0 / b;
    let mut h = d;

    for i in 1..100 {
        let an = (-i as f64) * ((i as f64) - a);
        b += 2.0;
        d = 1.0 / (b + an * d);
        c = b + an / c;
        let del = c * d;
        h *= del;
        if (del - 1.0).abs() < 1e-10 {
            break;
        }
    }

    let gamma_a = gamma_function(a);
    (h * (x.powf(a) * (-x).exp())) / gamma_a
}

// Gamma function approximation (Lanczos approximation)
pub fn gamma_function(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::MAX; // Singularity
    }

    // Lanczos coefficients
    let p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
        12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    let mut y = x;
    let mut result = 0.99999999999980993;

    for i in 0..8 {
        result += p[i] / (y + (i as f64));
    }

    let t = y + 7.5;
    let sqrt_2pi = ((2.0 * PI) as f64).sqrt();

    sqrt_2pi * t.powf(y - 0.5) * (-t).exp() * result
}

// Incomplete beta function for p-value calculations
pub fn incomplete_beta(a: f64, b: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }

    let lbeta_ab = ln_gamma(a) + ln_gamma(b) - ln_gamma(a + b);
    let front = (x.powf(a) * (1.0 - x).powf(b)) / (a * lbeta_ab.exp());

    if x < (a + 1.0) / (a + b + 2.0) {
        // Use series expansion
        let mut sum = 1.0;
        let mut term = 1.0;
        let mut n = 1.0;

        while n < 100.0 {
            term *= ((a + n - 1.0) * (a + b + n - 1.0) * x) / ((a + n) * n);
            sum += term;
            if term < 1e-10 * sum {
                break;
            }
            n += 1.0;
        }

        return front * sum;
    } else {
        // Use continued fraction representation
        return 1.0 - incomplete_beta(b, a, 1.0 - x);
    }
}

// Log gamma function
pub fn ln_gamma(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::NAN;
    }

    // Lanczos approximation
    let p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
        12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    let mut y = x;
    let mut result = 0.99999999999980993;

    for i in 0..8 {
        result += p[i] / (y + (i as f64));
    }

    let t = y + 7.5;
    let sqrt_2pi = ((2.0 * PI) as f64).sqrt();

    sqrt_2pi.ln() + (y - 0.5) * t.ln() - t + (result / y).ln()
}

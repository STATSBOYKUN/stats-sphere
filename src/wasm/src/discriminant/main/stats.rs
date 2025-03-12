/// Statistical functions for discriminant analysis
///
/// Implementation of statistical distributions and methods used in discriminant analysis
/// calculations, including chi-square, F-distribution, and related functions.

use crate::discriminant::main::matrix::basics::vector_norm;
use crate::discriminant::main::types::results::DiscriminantError;
use std::f64::consts::PI;

/// Chi-square CDF (Cumulative Distribution Function)
///
/// # Arguments
/// * `x` - Chi-square value
/// * `df` - Degrees of freedom
///
/// # Returns
/// * Probability P(X ≤ x) for chi-square distribution
pub fn chi_square_cdf(x: f64, df: u32) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    match df {
        0 => 0.0, // Invalid degrees of freedom
        1 => {
            // For df=1, use normal distribution
            2.0 * normal_cdf(x.sqrt(), 0.0, 1.0) - 1.0
        }
        2 => {
            // For df=2, use exponential distribution
            1.0 - (-x / 2.0).exp()
        }
        _ => {
            // For df > 2, use Wilson-Hilferty approximation
            let df_f64 = df as f64;
            let z = ((x / df_f64).powf(1.0 / 3.0) - 1.0 + 2.0 / (9.0 * df_f64))
                / (2.0 / (9.0 * df_f64)).sqrt();

            normal_cdf(z, 0.0, 1.0)
        }
    }
}

/// Normal distribution CDF
///
/// # Arguments
/// * `x` - Value
/// * `mean` - Mean of the distribution
/// * `std_dev` - Standard deviation of the distribution
///
/// # Returns
/// * Probability P(X ≤ x) for normal distribution
pub fn normal_cdf(x: f64, mean: f64, std_dev: f64) -> f64 {
    if std_dev <= 0.0 {
        return if x < mean { 0.0 } else { 1.0 };
    }
    
    let z = (x - mean) / std_dev;
    0.5 * (1.0 + erf(z / std::f64::consts::SQRT_2))
}

/// Error function (erf) approximation with improved accuracy
///
/// # Arguments
/// * `x` - Input value
///
/// # Returns
/// * Value of error function at x
pub fn erf(x: f64) -> f64 {
    // Constants for Abramowitz and Stegun approximation
    let a1 = 0.254829592;
    let a2 = -0.284496736;
    let a3 = 1.421413741;
    let a4 = -1.453152027;
    let a5 = 1.061405429;
    let p = 0.3275911;

    let sign = if x < 0.0 { -1.0 } else { 1.0 };
    let x = x.abs();

    let t = 1.0 / (1.0 + p * x);
    let y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * (-x * x).exp();

    sign * y
}

/// F-distribution CDF
///
/// # Arguments
/// * `x` - F-statistic value
/// * `df1` - Degrees of freedom (numerator)
/// * `df2` - Degrees of freedom (denominator)
///
/// # Returns
/// * Probability P(X ≤ x) for F distribution
pub fn f_distribution_cdf(x: f64, df1: u32, df2: u32) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    // Check for valid degrees of freedom
    if df1 == 0 || df2 == 0 {
        return 0.0;
    }

    // Approximation using beta distribution
    let v1 = df1 as f64;
    let v2 = df2 as f64;

    let beta_x = v1 * x / (v1 * x + v2);

    regularized_incomplete_beta(beta_x, v1 / 2.0, v2 / 2.0)
}

/// Compute p-value from F statistic
///
/// # Arguments
/// * `f` - F-statistic value
/// * `df1` - Degrees of freedom (numerator)
/// * `df2` - Degrees of freedom (denominator)
///
/// # Returns
/// * Right-tail probability P(X > f)
pub fn f_test_p_value(f: f64, df1: u32, df2: u32) -> f64 {
    if f <= 0.0 {
        return 1.0;
    }

    // Check for valid degrees of freedom
    if df1 == 0 || df2 == 0 {
        return 1.0;
    }

    // Convert F-distribution to Beta distribution
    let v1 = df1 as f64;
    let v2 = df2 as f64;
    let x = v2 / (v2 + v1 * f);

    // P-value = I_x(v2/2, v1/2) where I_x is regularized incomplete beta function
    regularized_incomplete_beta(x, v2 / 2.0, v1 / 2.0)
}

/// Accurate implementation of regularized incomplete beta function
///
/// # Arguments
/// * `x` - Value between 0 and 1
/// * `a` - First shape parameter
/// * `b` - Second shape parameter
///
/// # Returns
/// * Value of regularized incomplete beta function I_x(a,b)
pub fn regularized_incomplete_beta(x: f64, a: f64, b: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }

    // Check for valid shape parameters
    if a <= 0.0 || b <= 0.0 {
        return 0.0;
    }

    // For better numerical stability, use different methods depending on parameters
    if x > (a + 1.0) / (a + b + 2.0) {
        // Use symmetry relation for better numerical accuracy
        return 1.0 - regularized_incomplete_beta(1.0 - x, b, a);
    }

    // Calculate logarithm of Beta function for numerical stability
    let ln_beta = ln_gamma(a) + ln_gamma(b) - ln_gamma(a + b);

    // Calculate using continued fraction method (Lentz's algorithm)
    let cfrac = continued_fraction_beta(x, a, b);

    // Final formula
    let factor = (a * x.ln() + b * (1.0 - x).ln() - ln_beta).exp() / a;
    factor * cfrac
}

/// Continued fraction evaluation for beta function
///
/// # Arguments
/// * `x` - Value between 0 and 1
/// * `a` - First shape parameter
/// * `b` - Second shape parameter
///
/// # Returns
/// * Continued fraction evaluation
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
    if d.abs() < small {
        d = small;
    }
    d = 1.0 / d;
    let mut h = d;

    // Continue with the fraction
    for m in 1..max_iterations {
        let m2 = 2 * m;

        // Even term
        let m_f = m as f64;
        let aa = m_f * (b - m_f) * x / ((qam + m2 as f64) * (a + m2 as f64));
        d = 1.0 + aa * d;
        if d.abs() < small {
            d = small;
        }
        c = 1.0 + aa / c;
        if c.abs() < small {
            c = small;
        }
        d = 1.0 / d;
        h *= d * c;

        // Odd term
        let aa = -(a + m_f) * (qab + m_f) * x / ((a + m2 as f64) * (qap + m2 as f64));
        d = 1.0 + aa * d;
        if d.abs() < small {
            d = small;
        }
        c = 1.0 + aa / c;
        if c.abs() < small {
            c = small;
        }
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

/// Calculate natural logarithm of gamma function
/// Improved ln_gamma function using Lanczos approximation
///
/// # Arguments
/// * `x` - Input value
///
/// # Returns
/// * Natural logarithm of gamma function at x
pub fn ln_gamma(x: f64) -> f64 {
    // Constants for Lanczos approximation
    let p = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7,
    ];

    // Check for non-positive values and NaN
    if x <= 0.0 || x.is_nan() {
        // Use reflection formula for negative values
        if x < 0.0 && !x.is_nan() {
            let pi = std::f64::consts::PI;
            let sinpx = (pi * (x - (x as i64) as f64)).sin().abs();
            if sinpx.abs() < 1e-10 {
                // Return infinity for negative integers (gamma function poles)
                return f64::INFINITY;
            }
            let gamma_1_minus_x = gamma(1.0 - x);
            if gamma_1_minus_x == 0.0 {
                return f64::INFINITY;
            }
            return (pi / sinpx / gamma_1_minus_x).ln();
        } else {
            return f64::NAN;
        }
    }

    // Lanczos approximation for positive values
    let mut z = x - 1.0;
    let mut a = 0.99999999999980993;
    for i in 1..p.len() {
        a += p[i] / (z + (i as f64));
    }
    let t = z + p.len() as f64 - 0.5;
    let result = (2.0 * std::f64::consts::PI).sqrt().ln() + (z + 0.5) * t.ln() - t + a.ln();

    result
}

/// Gamma function approximation using Lanczos approximation
///
/// # Arguments
/// * `x` - Input value
///
/// # Returns
/// * Gamma function at x
pub fn gamma(x: f64) -> f64 {
    // Handle special cases
    if x.is_nan() {
        return f64::NAN;
    }
    
    // Integer and half-integer special cases for efficiency
    if x.fract() == 0.0 && x <= 0.0 {
        // Negative integers are poles
        return f64::NAN;
    }
    
    if x.fract() == 0.0 && x > 0.0 && x <= 20.0 {
        // Small positive integers
        let mut result = 1.0;
        for i in 2..(x as usize) {
            result *= i as f64;
        }
        return result;
    }
    
    // Reflection formula for negative x
    if x < 0.5 {
        let pi = std::f64::consts::PI;
        return pi / ((pi * x).sin() * gamma(1.0 - x));
    }
    
    // Lanczos approximation
    let p = [
        0.99999999999980993,
        676.5203681218851,
        -1259.1392167224028,
        771.32342877765313,
        -176.61502916214059,
        12.507343278686905,
        -0.13857109526572012,
        9.9843695780195716e-6,
        1.5056327351493116e-7,
    ];

    let mut x = x - 1.0;
    let mut y = 0.99999999999980993;

    for i in 1..p.len() {
        y += p[i] / (x + i as f64);
    }

    let t = x + p.len() as f64 - 0.5;

    std::f64::consts::SQRT_2 * t.powf(x + 0.5) * (-t).exp() * y
}

/// Compute p-value from chi-square statistic
///
/// # Arguments
/// * `chi_square` - Chi-square statistic value
/// * `df` - Degrees of freedom
///
/// # Returns
/// * Right-tail probability P(X > chi_square)
pub fn chi_square_p_value(chi_square: f64, df: u32) -> f64 {
    1.0 - chi_square_cdf(chi_square, df)
}

/// Compute Mahalanobis distance between a vector and a mean vector
/// using the inverse covariance matrix
///
/// # Arguments
/// * `x` - Input vector
/// * `mean` - Mean vector
/// * `inv_cov` - Inverse covariance matrix
///
/// # Returns
/// * Mahalanobis distance
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

/// Compute variance of a vector
///
/// # Arguments
/// * `x` - Input vector
///
/// # Returns
/// * Sample variance or error if insufficient data
pub fn variance(x: &[f64]) -> Result<f64, DiscriminantError> {
    if x.len() < 2 {
        return Err(DiscriminantError::InsufficientData);
    }

    let mean = x.iter().sum::<f64>() / x.len() as f64;
    let sum_squared_diff = x.iter().map(|&val| (val - mean).powi(2)).sum::<f64>();

    Ok(sum_squared_diff / (x.len() - 1) as f64)
}

/// Compute weighted variance of a vector
///
/// # Arguments
/// * `x` - Input vector
/// * `weights` - Weight vector
///
/// # Returns
/// * Weighted sample variance or error
pub fn weighted_variance(x: &[f64], weights: &[f64]) -> Result<f64, DiscriminantError> {
    if x.len() != weights.len() || x.len() < 2 {
        return Err(DiscriminantError::InsufficientData);
    }

    let sum_weights = weights.iter().sum::<f64>();
    if sum_weights <= 0.0 {
        return Err(DiscriminantError::InvalidInput(
            "Sum of weights must be positive".to_string(),
        ));
    }

    // Calculate weighted mean
    let mut weighted_sum = 0.0;
    for i in 0..x.len() {
        weighted_sum += weights[i] * x[i];
    }
    let weighted_mean = weighted_sum / sum_weights;

    // Calculate weighted variance
    let mut weighted_sq_sum = 0.0;
    for i in 0..x.len() {
        weighted_sq_sum += weights[i] * (x[i] - weighted_mean).powi(2);
    }

    // Bessel correction for sample variance
    let correction = sum_weights / (sum_weights - weights.iter().map(|w| w * w).sum::<f64>() / sum_weights);
    Ok(weighted_sq_sum / sum_weights * correction)
}

/// Compute covariance between two vectors
///
/// # Arguments
/// * `x` - First vector
/// * `y` - Second vector
///
/// # Returns
/// * Sample covariance or error
pub fn covariance(x: &[f64], y: &[f64]) -> Result<f64, DiscriminantError> {
    let n = x.len().min(y.len());
    if n < 2 {
        return Err(DiscriminantError::InsufficientData);
    }

    let mean_x = x.iter().take(n).sum::<f64>() / n as f64;
    let mean_y = y.iter().take(n).sum::<f64>() / n as f64;

    let mut sum_product = 0.0;
    for i in 0..n {
        sum_product += (x[i] - mean_x) * (y[i] - mean_y);
    }

    Ok(sum_product / (n - 1) as f64)
}

/// Compute correlation between two vectors
///
/// # Arguments
/// * `x` - First vector
/// * `y` - Second vector
///
/// # Returns
/// * Pearson correlation coefficient or error
pub fn correlation(x: &[f64], y: &[f64]) -> Result<f64, DiscriminantError> {
    let n = x.len().min(y.len());
    if n < 2 {
        return Err(DiscriminantError::InsufficientData);
    }

    let var_x = variance(&x[0..n])?;
    let var_y = variance(&y[0..n])?;

    if var_x <= 0.0 || var_y <= 0.0 {
        return Err(DiscriminantError::ComputationError(
            "Cannot compute correlation with zero variance".to_string(),
        ));
    }

    let cov_xy = covariance(&x[0..n], &y[0..n])?;

    Ok(cov_xy / (var_x * var_y).sqrt())
}

/// Compute standard error of a statistic
///
/// # Arguments
/// * `std_dev` - Standard deviation of the population/sample
/// * `n` - Sample size
///
/// # Returns
/// * Standard error
pub fn standard_error(std_dev: f64, n: usize) -> f64 {
    if n <= 1 {
        return f64::NAN;
    }
    std_dev / (n as f64).sqrt()
}

/// Calculate the t-value for a given degree of freedom and probability
///
/// # Arguments
/// * `df` - Degrees of freedom
/// * `p` - Probability (1-alpha)
///
/// # Returns
/// * t-value
pub fn t_distribution_inverse(df: u32, p: f64) -> f64 {
    if df == 0 || p <= 0.0 || p >= 1.0 {
        return f64::NAN;
    }
    
    // Approximation for large df
    if df > 100 {
        // Use normal approximation
        let alpha = 1.0 - p;
        let z = normal_distribution_inverse(1.0 - alpha / 2.0);
        return z;
    }
    
    // Initial guess based on normal distribution
    let mut t = normal_distribution_inverse(p);
    
    // Newton-Raphson iteration to improve accuracy
    let max_iter = 20;
    let tol = 1e-6;
    
    for _ in 0..max_iter {
        let t_cdf = t_distribution_cdf(t, df);
        if (t_cdf - p).abs() < tol {
            break;
        }
        
        // Derivative of CDF is the PDF
        let t_pdf = t_distribution_pdf(t, df);
        if t_pdf.abs() < tol {
            break;  // Avoid division by near-zero
        }
        
        t = t - (t_cdf - p) / t_pdf;
    }
    
    t
}

/// Calculate the t-distribution PDF
///
/// # Arguments
/// * `t` - t-value
/// * `df` - Degrees of freedom
///
/// # Returns
/// * PDF value
fn t_distribution_pdf(t: f64, df: u32) -> f64 {
    let df_f64 = df as f64;
    let numerator = gamma((df_f64 + 1.0) / 2.0);
    let denominator = (df_f64 * std::f64::consts::PI).sqrt() * gamma(df_f64 / 2.0);
    
    numerator / denominator * (1.0 + t*t/df_f64).powf(-(df_f64 + 1.0) / 2.0)
}

/// Calculate the t-distribution CDF
///
/// # Arguments
/// * `t` - t-value
/// * `df` - Degrees of freedom
///
/// # Returns
/// * CDF value
fn t_distribution_cdf(t: f64, df: u32) -> f64 {
    if df == 0 {
        return f64::NAN;
    }
    
    let df_f64 = df as f64;
    
    if t == 0.0 {
        return 0.5;
    }
    
    if t.is_infinite() {
        return if t > 0.0 { 1.0 } else { 0.0 };
    }
    
    // For t < 0, use symmetry
    if t < 0.0 {
        return 1.0 - t_distribution_cdf(-t, df);
    }
    
    // For df = 1, this is a Cauchy distribution
    if df == 1 {
        return 0.5 + t.atan() / std::f64::consts::PI;
    }
    
    // For df = 2, use direct formula
    if df == 2 {
        return 0.5 + t / (2.0 * (1.0 + t*t).sqrt());
    }
    
    // Use beta function approach for other cases
    let x = df_f64 / (df_f64 + t*t);
    let a = df_f64 / 2.0;
    let b = 0.5;
    
    1.0 - 0.5 * regularized_incomplete_beta(x, a, b)
}

/// Calculate the inverse of standard normal distribution (probit function)
///
/// # Arguments
/// * `p` - Probability (0 < p < 1)
///
/// # Returns
/// * z-value
fn normal_distribution_inverse(p: f64) -> f64 {
    if p <= 0.0 || p >= 1.0 {
        return f64::NAN;
    }
    
    // Approximation using Abramowitz and Stegun formula
    let q = if p <= 0.5 { p } else { 1.0 - p };
    let t = (-2.0 * q.ln()).sqrt();
    
    let c0 = 2.515517;
    let c1 = 0.802853;
    let c2 = 0.010328;
    let d1 = 1.432788;
    let d2 = 0.189269;
    let d3 = 0.001308;
    
    let num = c0 + c1*t + c2*t*t;
    let den = 1.0 + d1*t + d2*t*t + d3*t*t*t;
    let x = t - num / den;
    
    if p <= 0.5 {
        -x
    } else {
        x
    }
}
use nalgebra::DMatrix;

use crate::factor::models::result::KMOBartlettsTest;

use super::core::chi_square_cdf;

// Calculate KMO and Bartlett's test
pub fn calculate_kmo_bartletts_test(
    correlation_matrix: &DMatrix<f64>,
    data_matrix: &DMatrix<f64>
) -> KMOBartlettsTest {
    let n_vars = correlation_matrix.nrows();
    let n_obs = data_matrix.nrows();

    // Calculate inverse of correlation matrix
    let inverse = match correlation_matrix.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // If matrix is singular, return default values
            return KMOBartlettsTest {
                kaiser_meyer_olkin: 0.0,
                bartletts_test_chi_square: 0.0,
                df: (n_vars * (n_vars - 1)) / 2,
                significance: 1.0,
            };
        }
    };

    // Calculate anti-image correlation matrix
    let mut anti_image_corr = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        for j in 0..n_vars {
            if i == j {
                anti_image_corr[(i, j)] = 1.0;
            } else {
                anti_image_corr[(i, j)] =
                    -inverse[(i, j)] / (inverse[(i, i)] * inverse[(j, j)]).sqrt();
            }
        }
    }

    // Calculate individual KMO measures
    let mut kmo_measures = vec![0.0; n_vars];
    for i in 0..n_vars {
        let mut sum_squared_correlation = 0.0;
        let mut sum_squared_partial = 0.0;

        for j in 0..n_vars {
            if i != j {
                sum_squared_correlation += correlation_matrix[(i, j)].powi(2);
                sum_squared_partial += anti_image_corr[(i, j)].powi(2);
            }
        }

        if sum_squared_correlation + sum_squared_partial > 0.0 {
            kmo_measures[i] =
                sum_squared_correlation / (sum_squared_correlation + sum_squared_partial);
        }
    }

    // Calculate overall KMO
    let mut sum_squared_correlation = 0.0;
    let mut sum_squared_partial = 0.0;

    for i in 0..n_vars {
        for j in 0..n_vars {
            if i != j {
                sum_squared_correlation += correlation_matrix[(i, j)].powi(2);
                sum_squared_partial += anti_image_corr[(i, j)].powi(2);
            }
        }
    }

    let kmo = sum_squared_correlation / (sum_squared_correlation + sum_squared_partial);

    // Calculate Bartlett's test of sphericity
    let determinant = match correlation_matrix.determinant() {
        det if det > 0.0 => det,
        _ => 1e-10, // Avoid log of zero or negative
    };

    let chi_square =
        -((n_obs as f64) - 1.0 - (2.0 * (n_vars as f64) + 5.0) / 6.0) * determinant.ln();
    let df = (n_vars * (n_vars - 1)) / 2;

    // Calculate significance (p-value) using chi-square distribution
    let significance = chi_square_cdf(chi_square, df as f64);

    KMOBartlettsTest {
        kaiser_meyer_olkin: kmo,
        bartletts_test_chi_square: chi_square,
        df,
        significance: 1.0 - significance,
    }
}

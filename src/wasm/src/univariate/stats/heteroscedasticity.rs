use nalgebra::{ DMatrix, DVector };

use crate::univariate::models::{
    config::UnivariateConfig,
    data::{ AnalysisData, DataValue },
    result::{ BPTest, FTest, HeteroscedasticityTests, ModifiedBPTest, WhiteTest },
};

use super::core::{ chi_square_cdf, extract_dependent_value, f_distribution_cdf };

/// Calculate heteroscedasticity tests if requested
pub fn calculate_heteroscedasticity_tests(
    data: &AnalysisData,
    config: &UnivariateConfig
) -> Result<Option<HeteroscedasticityTests>, String> {
    if
        !config.options.brusch_pagan &&
        !config.options.white_test &&
        !config.options.mod_brusch_pagan &&
        !config.options.f_test
    {
        return Ok(None);
    }

    let dep_var_name = match &config.main.dep_var {
        Some(name) => name.clone(),
        None => {
            return Err("No dependent variable specified in configuration".to_string());
        }
    };

    // Extract data for analysis
    let mut y_values = Vec::new();
    let mut x_matrix = Vec::new();
    let mut predictor_names = Vec::new();

    // Identify predictors
    if let Some(factor_str) = &config.main.fix_factor {
        predictor_names = factor_str
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();
    }

    if let Some(covar_str) = &config.main.covar {
        for cov in covar_str.split(',').map(|s| s.trim()) {
            predictor_names.push(cov.to_string());
        }
    }

    if predictor_names.is_empty() {
        return Err("No predictors specified for heteroscedasticity tests".to_string());
    }

    // Extract y values and build X matrix
    for records in &data.dependent_data {
        for record in records {
            if let Some(y) = extract_dependent_value(record, &dep_var_name) {
                y_values.push(y);

                // Create a row for X matrix (include intercept)
                let mut x_row = vec![1.0]; // Intercept

                for pred in &predictor_names {
                    let mut value = 0.0;
                    for (key, val) in &record.values {
                        if key == pred {
                            value = match val {
                                DataValue::Number(n) => *n,
                                DataValue::Boolean(b) => if *b { 1.0 } else { 0.0 }
                                _ => 0.0,
                            };
                            break;
                        }
                    }
                    x_row.push(value);
                }

                x_matrix.push(x_row);
            }
        }
    }

    // Convert to nalgebra matrices for calculations
    let n = y_values.len();
    let p = predictor_names.len() + 1; // +1 for intercept

    if n == 0 {
        return Err("No valid data points for heteroscedasticity tests".to_string());
    }

    let y = DVector::from_vec(y_values);
    let x = DMatrix::from_fn(n, p, |i, j| x_matrix[i][j]);

    // Calculate OLS residuals
    let xtx = &x.transpose() * &x;
    if let Some(xtx_inv) = xtx.try_inverse() {
        let beta = &xtx_inv * &x.transpose() * &y;
        let y_hat = &x * &beta;
        let residuals = &y - &y_hat;
        let squared_residuals = residuals.map(|e| e.powi(2));

        let mut test_results = HeteroscedasticityTests {
            breusch_pagan: None,
            white: None,
            modified_breusch_pagan: None,
            f_test: None,
        };

        // Breusch-Pagan test
        if config.options.brusch_pagan {
            // Create Z matrix for BP test with original predictors
            let z = x.clone();
            let n = z.nrows();

            // Calculate the mean of squared residuals
            let e_mean = squared_residuals.sum() / (n as f64);

            // Normalize squared residuals by dividing by their mean
            let aux_y = &squared_residuals / e_mean;

            // Calculate fitted values from auxiliary regression
            let ztz_inv = match (z.transpose() * &z).try_inverse() {
                Some(inv) => inv,
                None => {
                    return Err("Matrix inversion failed in BP test".to_string());
                }
            };

            let fit = &z * (&ztz_inv * z.transpose() * &aux_y);

            // Calculate explained sum of squares
            let fit_mean = fit.sum() / (n as f64);
            let explained_ss = fit
                .iter()
                .map(|x| (x - fit_mean).powi(2))
                .sum::<f64>();
            let bp_stat = explained_ss / 2.0;

            // Degrees of freedom = number of predictors (excluding intercept)
            let df = p - 1;

            // Calculate p-value using chi-square distribution
            let p_value = 1.0 - chi_square_cdf(bp_stat, df as f64);

            test_results.breusch_pagan = Some(BPTest {
                statistic: bp_stat,
                df,
                p_value,
            });
        }

        // White test
        if config.options.white_test {
            // Create Z matrix for White test with original predictors, their squares and cross-products
            let mut z_data = Vec::new();

            for i in 0..n {
                let mut z_row = vec![1.0]; // Intercept

                // Add original predictors
                for j in 1..p {
                    z_row.push(x[(i, j)]);
                }

                // Add squares of predictors (excluding intercept)
                for j in 1..p {
                    z_row.push(x[(i, j)].powi(2));
                }

                // Add cross-products (excluding intercept)
                for j in 1..p {
                    for k in j + 1..p {
                        z_row.push(x[(i, j)] * x[(i, k)]);
                    }
                }

                z_data.push(z_row);
            }

            let z_cols = z_data[0].len();
            let z = DMatrix::from_fn(n, z_cols, |i, j| z_data[i][j]);

            // Estimate auxiliary regression
            let ztz = z.transpose() * &z;
            let ztz_inv = match ztz.try_inverse() {
                Some(inv) => inv,
                None => {
                    return Err("Matrix inversion failed in White test".to_string());
                }
            };

            let aux_y = squared_residuals.clone();
            let aux_params = &ztz_inv * z.transpose() * &aux_y;
            let predicted = &z * &aux_params;

            // Calculate R-squared
            let tss = aux_y
                .iter()
                .map(|&y| (y - aux_y.sum() / (n as f64)).powi(2))
                .sum::<f64>();
            let rss = (aux_y - predicted)
                .iter()
                .map(|e| e.powi(2))
                .sum::<f64>();
            let r_squared = 1.0 - rss / tss;

            // Calculate White statistic
            let white_stat = (n as f64) * r_squared;

            // Degrees of freedom = number of predictors in Z matrix (excluding intercept)
            let df = z_cols - 1;

            // Calculate p-value using chi-square distribution
            let p_value = 1.0 - chi_square_cdf(white_stat, df as f64);

            test_results.white = Some(WhiteTest {
                statistic: white_stat,
                df,
                p_value,
            });
        }

        // Modified Breusch-Pagan test
        if config.options.mod_brusch_pagan {
            // Create Z matrix same as Breusch-Pagan test
            let z = x.clone();

            // Estimate auxiliary regression with squared residuals directly
            let ztz = z.transpose() * &z;
            let ztz_inv = match ztz.try_inverse() {
                Some(inv) => inv,
                None => {
                    return Err("Matrix inversion failed in modified BP test".to_string());
                }
            };

            let aux_y = squared_residuals.clone();
            let aux_params = &ztz_inv * z.transpose() * &aux_y;
            let predicted = &z * &aux_params;

            // Calculate R-squared
            let tss = aux_y
                .iter()
                .map(|&y| (y - aux_y.sum() / (n as f64)).powi(2))
                .sum::<f64>();
            let rss = (aux_y - predicted)
                .iter()
                .map(|e| e.powi(2))
                .sum::<f64>();
            let r_squared = 1.0 - rss / tss;

            // Calculate modified BP statistic
            let mbp_stat = (n as f64) * r_squared;

            // Degrees of freedom = number of predictors (excluding intercept)
            let df = p - 1;

            // Calculate p-value using chi-square distribution
            let p_value = 1.0 - chi_square_cdf(mbp_stat, df as f64);

            test_results.modified_breusch_pagan = Some(ModifiedBPTest {
                statistic: mbp_stat,
                df,
                p_value,
            });
        }

        // F-test
        if config.options.f_test {
            // Create Z matrix for F-test with original predictors
            let z = x.clone();

            // Estimate auxiliary regression with squared residuals
            let ztz = z.transpose() * &z;
            let ztz_inv = match ztz.try_inverse() {
                Some(inv) => inv,
                None => {
                    return Err("Matrix inversion failed in F-test".to_string());
                }
            };

            let aux_y = squared_residuals.clone();
            let aux_params = &ztz_inv * z.transpose() * &aux_y;
            let predicted = &z * &aux_params;

            // Calculate explained and residual sum of squares
            let aux_mean = aux_y.sum() / (n as f64);
            let explained_ss = predicted
                .iter()
                .map(|&p| (p - aux_mean).powi(2))
                .sum::<f64>();
            let residual_ss = (aux_y - predicted)
                .iter()
                .map(|e| e.powi(2))
                .sum::<f64>();

            // Degrees of freedom
            let df1 = p - 1; // Excluding intercept
            let df2 = n - p;

            // Calculate F statistic
            let f_stat = if df1 > 0 && residual_ss > 0.0 {
                explained_ss / (df1 as f64) / (residual_ss / (df2 as f64))
            } else {
                0.0
            };

            // Calculate p-value
            let p_value = 1.0 - f_distribution_cdf(f_stat, df1 as f64, df2 as f64);

            test_results.f_test = Some(FTest {
                statistic: f_stat,
                df1,
                df2,
                p_value,
            });
        }

        return Ok(Some(test_results));
    } else {
        return Err("Matrix inversion failed".to_string());
    }
}

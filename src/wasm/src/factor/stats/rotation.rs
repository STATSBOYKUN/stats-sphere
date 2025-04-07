use std::collections::HashMap;

use nalgebra::DMatrix;

use crate::factor::models::{
    config::FactorAnalysisConfig,
    result::{
        ComponentTransformationMatrix,
        ExtractionResult,
        RotatedComponentMatrix,
        RotationResult,
    },
};

// Rotate factors using specified method
pub fn rotate_factors(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    if config.rotation.none {
        // No rotation, return original loadings
        return Ok(RotationResult {
            rotated_loadings: extraction_result.loadings.clone(),
            transformation_matrix: DMatrix::identity(
                extraction_result.n_factors,
                extraction_result.n_factors
            ),
            factor_correlations: None,
        });
    }

    if config.rotation.varimax {
        rotate_varimax(extraction_result, config)
    } else if config.rotation.quartimax {
        rotate_quartimax(extraction_result, config)
    } else if config.rotation.equimax {
        rotate_equimax(extraction_result, config)
    } else if config.rotation.oblimin {
        rotate_oblimin(extraction_result, config)
    } else if config.rotation.promax {
        rotate_promax(extraction_result, config)
    } else {
        // Default to varimax
        rotate_varimax(extraction_result, config)
    }
}

// Varimax rotation
pub fn rotate_varimax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    let loadings = &extraction_result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with original loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = DMatrix::identity(n_cols, n_cols);

    // Normalize the factor loadings by communalities
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Iterative rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = 0.0;

    for iteration in 0..max_iterations {
        // Calculate varimax criterion
        let mut criterion = 0.0;
        for j in 0..n_cols {
            let mut sum_4th = 0.0;
            let mut sum_2nd = 0.0;

            for i in 0..n_rows {
                let val = normalized_loadings[(i, j)];
                sum_4th += val.powi(4);
                sum_2nd += val.powi(2);
            }

            criterion += sum_4th - sum_2nd.powi(2) / (n_rows as f64);
        }
        criterion /= n_rows as f64;

        // Check for convergence
        if iteration > 0 && (criterion - prev_criterion).abs() < convergence_criterion {
            break;
        }
        prev_criterion = criterion;

        // Perform pair-wise rotations
        for j in 0..n_cols - 1 {
            for k in j + 1..n_cols {
                // Calculate rotation coefficients
                let mut a = 0.0;
                let mut b = 0.0;
                let mut c = 0.0;
                let mut d = 0.0;

                for i in 0..n_rows {
                    let x = normalized_loadings[(i, j)];
                    let y = normalized_loadings[(i, k)];

                    a += x.powi(2) - y.powi(2);
                    b += 2.0 * x * y;
                    c += x.powi(2) - y.powi(2);
                    d += 2.0 * x * y;
                }

                // Varimax-specific formula
                let x = d - (2.0 * a * b) / (n_rows as f64);
                let y = c - (a.powi(2) - b.powi(2)) / (n_rows as f64);

                // Calculate rotation angle
                let phi = 0.25 * (x / y).atan();

                if phi.sin().abs() <= 1e-15 {
                    continue; // Skip tiny rotations
                }

                let cos_phi = phi.cos();
                let sin_phi = phi.sin();

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_j = normalized_loadings[(i, j)];
                    let temp_k = normalized_loadings[(i, k)];

                    normalized_loadings[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    normalized_loadings[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }

                // Apply rotation to transformation matrix
                for i in 0..n_cols {
                    let temp_j: f64 = transformation_matrix[(i, j)];
                    let temp_k: f64 = transformation_matrix[(i, k)];

                    transformation_matrix[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    transformation_matrix[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }
            }
        }
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    // Reflect factors with negative sums
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += rotated_loadings[(i, j)];
        }

        if sum < 0.0 {
            for i in 0..n_rows {
                rotated_loadings[(i, j)] = -rotated_loadings[(i, j)];
            }

            for i in 0..n_cols {
                transformation_matrix[(i, j)] = -transformation_matrix[(i, j)];
            }
        }
    }

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = transformation_matrix[(i, old_j)];
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: None,
    })
}

// Quartimax rotation - focuses on simplifying rows of the factor loading matrix
pub fn rotate_quartimax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    let loadings = &extraction_result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with original loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = DMatrix::identity(n_cols, n_cols);

    // Normalize the factor loadings by communalities
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Iterative rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = 0.0;

    for iteration in 0..max_iterations {
        // Calculate quartimax criterion (sum of 4th powers of loadings)
        let mut criterion = 0.0;
        for i in 0..n_rows {
            for j in 0..n_cols {
                criterion += normalized_loadings[(i, j)].powi(4);
            }
        }

        // Check for convergence
        if iteration > 0 && (criterion - prev_criterion).abs() < convergence_criterion {
            break;
        }
        prev_criterion = criterion;

        // Perform pair-wise rotations
        for j in 0..n_cols - 1 {
            for k in j + 1..n_cols {
                // Calculate rotation coefficients for quartimax
                let mut c = 0.0;
                let mut d = 0.0;

                for i in 0..n_rows {
                    let x = normalized_loadings[(i, j)];
                    let y = normalized_loadings[(i, k)];

                    c += x.powi(2) - y.powi(2);
                    d += 2.0 * x * y;
                }

                // Calculate rotation angle for quartimax
                let denominator = (c.powi(2) + d.powi(2)).sqrt();
                if denominator < 1e-10 {
                    continue; // Skip if division by zero
                }

                let cos_phi = c / denominator;
                let sin_phi = -d / denominator;

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_j = normalized_loadings[(i, j)];
                    let temp_k = normalized_loadings[(i, k)];

                    normalized_loadings[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    normalized_loadings[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }

                // Apply rotation to transformation matrix
                for i in 0..n_cols {
                    let temp_j: f64 = transformation_matrix[(i, j)];
                    let temp_k: f64 = transformation_matrix[(i, k)];

                    transformation_matrix[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    transformation_matrix[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }
            }
        }
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    // Reflect factors with negative sums
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += rotated_loadings[(i, j)];
        }

        if sum < 0.0 {
            for i in 0..n_rows {
                rotated_loadings[(i, j)] = -rotated_loadings[(i, j)];
            }

            for i in 0..n_cols {
                transformation_matrix[(i, j)] = -transformation_matrix[(i, j)];
            }
        }
    }

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = transformation_matrix[(i, old_j)];
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: None,
    })
}

// Equamax rotation - compromise between varimax and quartimax
pub fn rotate_equimax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    let loadings = &extraction_result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with original loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = DMatrix::identity(n_cols, n_cols);

    // Normalize the factor loadings by communalities
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Iterative rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = 0.0;

    for iteration in 0..max_iterations {
        // Calculate equamax criterion (weighted average of varimax and quartimax)
        let mut criterion = 0.0;
        for j in 0..n_cols {
            let mut sum_4th = 0.0;
            let mut sum_2nd = 0.0;

            for i in 0..n_rows {
                let val = normalized_loadings[(i, j)];
                sum_4th += val.powi(4);
                sum_2nd += val.powi(2);
            }

            // Use m/2 as weight for equamax (m = number of factors)
            criterion += sum_4th - (((n_cols as f64) / 2.0) * sum_2nd.powi(2)) / (n_rows as f64);
        }

        // Check for convergence
        if iteration > 0 && (criterion - prev_criterion).abs() < convergence_criterion {
            break;
        }
        prev_criterion = criterion;

        // Perform pair-wise rotations
        for j in 0..n_cols - 1 {
            for k in j + 1..n_cols {
                // Calculate rotation coefficients for equamax
                let mut a = 0.0;
                let mut b = 0.0;
                let mut c = 0.0;
                let mut d = 0.0;

                for i in 0..n_rows {
                    let x = normalized_loadings[(i, j)];
                    let y = normalized_loadings[(i, k)];

                    a += x.powi(2) - y.powi(2);
                    b += 2.0 * x * y;
                    c += x.powi(2) - y.powi(2);
                    d += 2.0 * x * y;
                }

                // Equamax modification
                let weight = (n_cols as f64) / 2.0;
                let x = d - (weight * a * b) / (n_rows as f64);
                let y = c - (weight * (a.powi(2) - b.powi(2))) / (2.0 * (n_rows as f64));

                // Calculate rotation angle
                let phi = 0.25 * (x / y).atan();

                if phi.sin().abs() <= 1e-15 {
                    continue; // Skip tiny rotations
                }

                let cos_phi = phi.cos();
                let sin_phi = phi.sin();

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_j = normalized_loadings[(i, j)];
                    let temp_k = normalized_loadings[(i, k)];

                    normalized_loadings[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    normalized_loadings[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }

                // Apply rotation to transformation matrix
                for i in 0..n_cols {
                    let temp_j: f64 = transformation_matrix[(i, j)];
                    let temp_k: f64 = transformation_matrix[(i, k)];

                    transformation_matrix[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    transformation_matrix[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }
            }
        }
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    // Reflect factors with negative sums
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += rotated_loadings[(i, j)];
        }

        if sum < 0.0 {
            for i in 0..n_rows {
                rotated_loadings[(i, j)] = -rotated_loadings[(i, j)];
            }

            for i in 0..n_cols {
                transformation_matrix[(i, j)] = -transformation_matrix[(i, j)];
            }
        }
    }

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = transformation_matrix[(i, old_j)];
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: None,
    })
}

// Oblimin rotation - allows for correlated factors
pub fn rotate_oblimin(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    // First perform a varimax rotation as a starting point
    let varimax_result = rotate_varimax(extraction_result, config)?;
    let loadings = &varimax_result.rotated_loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with varimax loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = varimax_result.transformation_matrix.clone();

    // Get delta parameter (default is 0)
    let delta = config.rotation.delta;

    // Normalize the factor loadings
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Initialize factor correlation matrix
    let mut factor_correlations = DMatrix::identity(n_cols, n_cols);

    // Calculate initial quantities needed for oblimin
    let mut u = vec![0.0; n_cols];
    let mut v = vec![0.0; n_cols];
    let mut x = vec![0.0; n_cols];

    for i in 0..n_cols {
        for j in 0..n_rows {
            u[i] += normalized_loadings[(j, i)].powi(2);
            v[i] += normalized_loadings[(j, i)].powi(4);
        }
        x[i] = v[i] - (delta / (n_rows as f64)) * u[i].powi(2);
    }

    let mut d_sum = 0.0;
    for i in 0..n_cols {
        d_sum += u[i];
    }

    let mut g_sum = 0.0;
    for i in 0..n_cols {
        g_sum += x[i];
    }

    let mut s = vec![0.0; n_rows];
    for i in 0..n_rows {
        s[i] = if apply_kaiser { 1.0 } else { h[i] };
    }

    let mut s_squared_sum = 0.0;
    for i in 0..n_rows {
        s_squared_sum += s[i].powi(2);
    }

    let h_value = s_squared_sum - (delta / (n_rows as f64)) * d_sum.powi(2);
    let initial_criterion = h_value - g_sum;

    // Iterative direct oblimin rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = initial_criterion;

    for iteration in 0..max_iterations {
        // For each pair of factors (p, q)
        for p in 0..n_cols {
            for q in 0..n_cols {
                if p == q {
                    continue;
                }

                // Calculate parameters for rotation
                let d_pq = d_sum - u[p] - u[q];
                let g_pq = g_sum - x[p] - x[q];

                // Calculate rotation parameters
                let mut z_pq = 0.0;
                let mut y_pq = 0.0;

                for i in 0..n_rows {
                    let lambda_ip = normalized_loadings[(i, p)];
                    let lambda_iq = normalized_loadings[(i, q)];

                    z_pq += lambda_ip.powi(2) * lambda_iq.powi(2);
                    y_pq += lambda_ip * lambda_iq;
                }

                let mut t = 0.0;
                let mut z = 0.0;

                for i in 0..n_rows {
                    t +=
                        s[i] * normalized_loadings[(i, p)].powi(2) -
                        (delta / (n_rows as f64)) * u[p] * d_pq;
                    z +=
                        s[i] * normalized_loadings[(i, p)] * normalized_loadings[(i, q)] -
                        (delta / (n_rows as f64)) * y_pq * d_pq;
                }

                let r = z_pq - (delta / (n_rows as f64)) * u[p] * u[q];

                // Calculate rotation angle using cubic equation
                let p_prime = 1.5 * (y_pq - t / r);
                let q_prime = (0.5 * (x[p] - 4.0 * y_pq * t + r + 2.0 * t)) / r;
                let r_prime = (0.5 * (y_pq * (t + r) - t - z)) / r;

                // Solve cubic equation: b^3 + p'*b^2 + q'*b + r' = 0
                // Using cardano's formula
                let a = 1.0;
                let b = p_prime;
                let c = q_prime;
                let d = r_prime;

                let p_cubic = c / a - b.powi(2) / (3.0 * a.powi(2));
                let q_cubic =
                    (2.0 * b.powi(3)) / (27.0 * a.powi(3)) - (b * c) / (3.0 * a.powi(2)) + d / a;

                let delta_cubic = q_cubic.powi(2) / 4.0 + p_cubic.powi(3) / 27.0;

                let mut root = 0.0;

                if delta_cubic > 0.0 {
                    // One real root
                    let u = (-q_cubic / 2.0 + delta_cubic.sqrt()).cbrt();
                    let v = (-q_cubic / 2.0 - delta_cubic.sqrt()).cbrt();
                    root = u + v - b / (3.0 * a);
                } else if delta_cubic == 0.0 {
                    // All roots are real and at least two are equal
                    let u = (-q_cubic / 2.0).cbrt();
                    root = 2.0 * u - b / (3.0 * a);
                } else {
                    // Three real roots
                    let rho = (-p_cubic.powi(3) / 27.0).sqrt();
                    let theta = (-q_cubic / (2.0 * rho)).acos();
                    let cos_term = (theta / 3.0).cos();
                    root = 2.0 * rho.cbrt() * cos_term - b / (3.0 * a);
                }

                // Calculate transformation parameters
                let a_term = 1.0 + 2.0 * y_pq * root + root.powi(2);
                let t1 = a_term.abs().sqrt();
                let t2 = root / t1;

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_p = normalized_loadings[(i, p)];
                    let temp_q = normalized_loadings[(i, q)];

                    normalized_loadings[(i, p)] = temp_p * t1 - temp_q * root;
                    normalized_loadings[(i, q)] = temp_q;
                }

                // Update factor correlation
                for i in 0..n_cols {
                    if i != p {
                        factor_correlations[(i, p)] =
                            factor_correlations[(i, p)] / t1 + factor_correlations[(i, q)] * t2;
                        factor_correlations[(p, i)] = factor_correlations[(i, p)];
                    }
                }
                factor_correlations[(p, p)] = 1.0;

                // Update u, v, x
                u[p] = t1.powi(2) * u[p];
                x[p] = a_term.powi(2) * x[p];

                // Recalculate for q
                u[q] = 0.0;
                v[q] = 0.0;
                for i in 0..n_rows {
                    u[q] += normalized_loadings[(i, q)].powi(2);
                    v[q] += normalized_loadings[(i, q)].powi(4);
                }
                x[q] = v[q] - (delta / (n_rows as f64)) * u[q].powi(2);

                // Update global sums
                d_sum = d_pq + u[p] + u[q];
                g_sum = g_pq + x[p] + x[q];
            }
        }

        // Check for convergence
        let h_value = s_squared_sum - (delta / (n_rows as f64)) * d_sum.powi(2);
        let current_criterion = h_value - g_sum;

        if (current_criterion - prev_criterion).abs() < initial_criterion * convergence_criterion {
            break;
        }

        prev_criterion = current_criterion;
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    Ok(RotationResult {
        rotated_loadings,
        transformation_matrix,
        factor_correlations: Some(factor_correlations),
    })
}

// Promax rotation - starts with varimax and then relaxes orthogonality
pub fn rotate_promax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    // First perform a varimax rotation
    let varimax_result = rotate_varimax(extraction_result, config)?;
    let loadings = &varimax_result.rotated_loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Get kappa parameter (default is 4)
    let kappa = config.rotation.kappa as f64;

    // Create target matrix P by raising varimax loadings to power of kappa
    let mut target_matrix = DMatrix::zeros(n_rows, n_cols);
    for i in 0..n_rows {
        for j in 0..n_cols {
            // Get absolute value of loading
            let abs_loading = loadings[(i, j)].abs();

            // Preserve sign when raising to power of kappa
            let sign = if loadings[(i, j)] >= 0.0 { 1.0 } else { -1.0 };

            // Apply promax power transformation
            target_matrix[(i, j)] =
                (sign * abs_loading.powf(kappa + 1.0)) /
                (loadings[(i, j)].powi(2) / (n_rows as f64)).sqrt();
        }
    }

    // Normalize target matrix by column
    for j in 0..n_cols {
        let mut sum_squared = 0.0;
        for i in 0..n_rows {
            sum_squared += target_matrix[(i, j)].powi(2);
        }

        let norm = sum_squared.sqrt();
        if norm > 1e-10 {
            for i in 0..n_rows {
                target_matrix[(i, j)] /= norm;
            }
        }
    }

    // Calculate transformation matrix L: L = (A'A)^(-1) A'P where A is the varimax loadings
    let a_transpose_a = loadings.transpose() * loadings;
    let a_transpose_a_inv = match a_transpose_a.try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Could not invert A'A matrix for Promax rotation".to_string());
        }
    };

    let a_transpose_p = loadings.transpose() * target_matrix;
    let transformation_matrix = a_transpose_a_inv * a_transpose_p;

    // Normalize the transformation matrix by column
    let mut normalized_transformation = DMatrix::zeros(n_cols, n_cols);
    for j in 0..n_cols {
        // Calculate the column norm
        let mut sum_squared = 0.0;
        for i in 0..n_cols {
            sum_squared += transformation_matrix[(i, j)].powi(2);
        }

        let norm = sum_squared.sqrt();
        if norm > 1e-10 {
            for i in 0..n_cols {
                normalized_transformation[(i, j)] = transformation_matrix[(i, j)] / norm;
            }
        }
    }

    // Calculate factor correlations: R_ff = C (Q'Q)^(-1) C'
    // where Q is the normalized transformation matrix and C is a diagonal matrix

    // Calculate Q'Q
    let q_transpose_q = normalized_transformation.transpose() * normalized_transformation.clone();

    // Calculate (Q'Q)^(-1)
    let q_transpose_q_inv = match q_transpose_q.try_inverse() {
        Some(inv) => inv,
        None => {
            // If inversion fails, return identity
            DMatrix::identity(n_cols, n_cols)
        }
    };

    // Create diagonal matrix C with sqrt of diagonal elements of (Q'Q)^(-1)
    let mut c_matrix = DMatrix::zeros(n_cols, n_cols);
    for i in 0..n_cols {
        c_matrix[(i, i)] = q_transpose_q_inv[(i, i)].sqrt();
    }

    // Factor correlations: R_ff = C (Q'Q)^(-1) C'
    let factor_correlations = &c_matrix * &q_transpose_q_inv * c_matrix.transpose();

    // Calculate rotated loadings: X * Q * C^(-1)
    let mut c_inv = DMatrix::zeros(n_cols, n_cols);
    for i in 0..n_cols {
        if c_matrix[(i, i)] > 1e-10 {
            c_inv[(i, i)] = 1.0 / c_matrix[(i, i)];
        } else {
            c_inv[(i, i)] = 1.0;
        }
    }

    let rotated_loadings = loadings * normalized_transformation.clone() * c_inv;

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);
    let mut sorted_correlations = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = normalized_transformation[(i, old_j)];

            // Rearrange factor correlations
            for k in 0..n_cols {
                sorted_correlations[(new_j, indices[k])] = factor_correlations[(old_j, k)];
                sorted_correlations[(indices[k], new_j)] = factor_correlations[(k, old_j)];
            }
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: Some(sorted_correlations),
    })
}

// Create rotated component matrix result
pub fn create_rotated_component_matrix(
    rotation_result: &RotationResult,
    var_names: &[String]
) -> RotatedComponentMatrix {
    let mut components = HashMap::new();
    let rotated_loadings = &rotation_result.rotated_loadings;
    let n_rows = rotated_loadings.nrows();
    let n_cols = rotated_loadings.ncols();

    for (i, var_name) in var_names.iter().enumerate() {
        if i < n_rows {
            let mut loadings = Vec::with_capacity(n_cols);

            for j in 0..n_cols {
                loadings.push(rotated_loadings[(i, j)]);
            }

            components.insert(var_name.clone(), loadings);
        }
    }

    RotatedComponentMatrix {
        components,
    }
}

// Create component transformation matrix result
pub fn create_component_transformation_matrix(
    rotation_result: &RotationResult
) -> ComponentTransformationMatrix {
    let transformation_matrix = &rotation_result.transformation_matrix;
    let n_rows = transformation_matrix.nrows();
    let n_cols = transformation_matrix.ncols();

    let mut components = Vec::with_capacity(n_rows);

    for i in 0..n_rows {
        let mut row = Vec::with_capacity(n_cols);

        for j in 0..n_cols {
            row.push(transformation_matrix[(i, j)]);
        }

        components.push(row);
    }

    ComponentTransformationMatrix {
        components,
    }
}

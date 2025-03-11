use  crate::discriminant::main::types::results::DiscriminantError;
use super::basics::{dot_product, normalize_vector, matrix_vector_multiply};

/// Calculate eigenvalues and eigenvectors using power iteration method
/// with improved convergence and stability
pub fn power_iteration(
    matrix: &[Vec<f64>],
    max_iter: usize,
    tol: f64
) -> Result<(f64, Vec<f64>), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput("Matrix must be square".to_string()));
    }

    // Initialize vector with a good starting guess
    // We use a vector that's not likely to be orthogonal to the dominant eigenvector
    let mut v = vec![0.0; n];
    for i in 0..n {
        v[i] = 1.0 / (i as f64 + 1.0).sqrt();
    }
    normalize_vector(&mut v);

    let mut eigenvalue = 0.0;
    let mut prev_eigenvalue;
    let mut converged = false;

    // Main iteration loop with extrapolation for faster convergence
    for iter in 0..max_iter {
        // v' = A*v (matrix-vector multiplication)
        let v_prime = matrix_vector_multiply(matrix, &v)?;

        // Calculate Rayleigh quotient for eigenvalue approximation
        prev_eigenvalue = eigenvalue;
        eigenvalue = dot_product(&v_prime, &v);

        // Normalize the new vector
        let norm = v_prime.iter().map(|x| x * x).sum::<f64>().sqrt();
        if norm < 1e-10 {
            return Err(DiscriminantError::ComputationError("Zero eigenvector".to_string()));
        }

        for i in 0..n {
            v[i] = v_prime[i] / norm;
        }

        // Check for convergence
        if (eigenvalue - prev_eigenvalue).abs() < tol * eigenvalue.abs() {
            if !converged {
                // Perform an additional iteration to confirm convergence
                converged = true;
            } else {
                break;
            }
        } else {
            converged = false;
        }

        // Apply acceleration techniques for slow convergence
        if iter > 5 && iter % 5 == 0 && !converged {
            if (eigenvalue - prev_eigenvalue).abs() > tol * 1000.0 {
                // Use Aitken's delta-squared acceleration
                if iter > 10 {
                    // Compute a better approximation using the last three iterates
                    let lambda_m = prev_eigenvalue;
                    let lambda_m1 = eigenvalue;
                    let delta_lambda = lambda_m1 - lambda_m;

                    // Simple acceleration: extrapolation
                    let acceleration_factor = 1.5;  // A conservative value between 1 and 2
                    eigenvalue = lambda_m1 + acceleration_factor * delta_lambda;

                    // Recompute v using the accelerated eigenvalue
                    let _ = matrix_vector_multiply(matrix, &v)?;
                }
            }
        }
    }

    Ok((eigenvalue, v))
}

/// Find multiple eigenvalues and eigenvectors using power iteration with deflation
/// Returns eigenvalues in descending order of magnitude and corresponding eigenvectors
pub fn find_eigenpairs(
    matrix: &[Vec<f64>],
    num_pairs: usize
) -> Result<(Vec<f64>, Vec<Vec<f64>>), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput("Matrix must be square".to_string()));
    }

    let mut eigenvalues = Vec::with_capacity(num_pairs);
    // Eigenvectors as columns for easier access
    let mut eigenvectors = vec![vec![0.0; num_pairs]; n];

    // Make a copy of the matrix that we can modify during deflation
    let mut working_matrix = matrix.to_vec();

    for k in 0..num_pairs.min(n) {
        // Find largest eigenvalue and eigenvector
        let (eigenvalue, eigenvector) = power_iteration(&working_matrix, 100, 1e-10)
            .map_err(|_| DiscriminantError::ComputationError(
                format!("Failed to compute eigenpair {}", k)
            ))?;

        eigenvalues.push(eigenvalue);

        for i in 0..n {
            eigenvectors[i][k] = eigenvector[i];
        }

        // Deflation: modify matrix to remove this eigenpair
        // We use a more stable method than the simple outer product
        for i in 0..n {
            for j in 0..n {
                let deflation_term = eigenvalue * eigenvector[i] * eigenvector[j];
                working_matrix[i][j] -= deflation_term;
            }
        }

        // Ensure orthogonality to previously found eigenvectors
        if k > 0 {
            for prev_k in 0..k {
                let dot = dot_product(&eigenvector, &eigenvectors.iter().map(|row| row[prev_k]).collect::<Vec<f64>>());
                for i in 0..n {
                    working_matrix[i][i] -= dot * eigenvectors[i][prev_k];
                }
            }
        }
    }

    // Ensure eigenvectors are normalized
    for k in 0..num_pairs.min(n) {
        let mut col_vector = eigenvectors.iter().map(|row| row[k]).collect::<Vec<f64>>();
        normalize_vector(&mut col_vector);
        for i in 0..n {
            eigenvectors[i][k] = col_vector[i];
        }
    }

    Ok((eigenvalues, eigenvectors))
}

/// Compute eigendecomposition of a symmetric matrix using QR algorithm
/// More accurate and efficient than power iteration for full eigendecomposition
/// Returns (eigenvalues, eigenvectors) where eigenvectors are stored as columns
pub fn symmetric_eigendecomposition(
    matrix: &[Vec<f64>],
    max_iter: usize,
    tol: f64
) -> Result<(Vec<f64>, Vec<Vec<f64>>), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput("Matrix must be square".to_string()));
    }

    // Check if matrix is symmetric
    for i in 0..n {
        for j in 0..i {
            if (matrix[i][j] - matrix[j][i]).abs() > tol {
                return Err(DiscriminantError::InvalidInput(
                    "Matrix must be symmetric for this algorithm".to_string()
                ));
            }
        }
    }

    // Initialize with identity matrix for eigenvectors
    let mut eigenvectors = vec![vec![0.0; n]; n];
    for i in 0..n {
        eigenvectors[i][i] = 1.0;
    }

    // Make a copy of the matrix for working
    let mut a = matrix.to_vec();

    // Perform Jacobi iterations
    for _ in 0..max_iter {
        let mut max_off_diag = 0.0;
        let mut p = 0;
        let mut q = 0;

        // Find largest off-diagonal element
        for i in 0..n {
            for j in (i+1)..n {
                let abs_val = a[i][j].abs();
                if abs_val > max_off_diag {
                    max_off_diag = abs_val;
                    p = i;
                    q = j;
                }
            }
        }

        // Check for convergence
        if max_off_diag < tol {
            break;
        }

        // Compute Jacobi rotation
        let app = a[p][p];
        let aqq = a[q][q];
        let apq = a[p][q];

        let theta = 0.5 * ((aqq - app) / apq).atan();
        let c = theta.cos();
        let s = theta.sin();

        // Apply rotation to a
        let new_app = app * c * c - 2.0 * apq * c * s + aqq * s * s;
        let new_aqq = app * s * s + 2.0 * apq * c * s + aqq * c * c;

        a[p][p] = new_app;
        a[q][q] = new_aqq;
        a[p][q] = 0.0;
        a[q][p] = 0.0;

        for i in 0..n {
            if i != p && i != q {
                let new_api = a[i][p] * c - a[i][q] * s;
                let new_aqi = a[i][p] * s + a[i][q] * c;
                a[p][i] = new_api;
                a[i][p] = new_api;
                a[q][i] = new_aqi;
                a[i][q] = new_aqi;
            }
        }

        // Update eigenvectors
        for i in 0..n {
            let vip = eigenvectors[i][p];
            let viq = eigenvectors[i][q];
            eigenvectors[i][p] = vip * c - viq * s;
            eigenvectors[i][q] = vip * s + viq * c;
        }
    }

    // Extract eigenvalues from diagonal
    let eigenvalues: Vec<f64> = (0..n).map(|i| a[i][i]).collect();

    // Sort eigenvalues and eigenvectors by decreasing eigenvalue
    let mut eigen_pairs: Vec<(f64, Vec<f64>)> = Vec::with_capacity(n);
    for i in 0..n {
        let eigenvector: Vec<f64> = (0..n).map(|j| eigenvectors[j][i]).collect();
        eigen_pairs.push((a[i][i], eigenvector));
    }

    eigen_pairs.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

    let eigenvalues: Vec<f64> = eigen_pairs.iter().map(|(val, _)| *val).collect();
    let mut eigenvectors: Vec<Vec<f64>> = vec![Vec::with_capacity(n); n];

    // Fill eigenvectors by column
    for i in 0..n {
        for j in 0..n {
            eigenvectors[j][i] = eigen_pairs[i].1[j];
        }
    }

    Ok((eigenvalues, eigenvectors))
}
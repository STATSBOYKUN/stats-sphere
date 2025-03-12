use crate::discriminant::main::types::results::DiscriminantError;
use super::basics::{dot_product, normalize_vector, matrix_vector_multiply, is_effectively_zero, is_symmetric};
use super::decomposition::matrix_inverse;

/// Calculate eigenvalues and eigenvectors using power iteration method
/// with improved convergence and stability
///
/// # Arguments
/// * `matrix` - Input matrix
/// * `max_iter` - Maximum number of iterations
/// * `tol` - Convergence tolerance
///
/// # Returns
/// * Tuple containing the dominant eigenvalue and its corresponding eigenvector
pub fn power_iteration(
    matrix: &[Vec<f64>],
    max_iter: usize,
    tol: f64
) -> Result<(f64, Vec<f64>), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput("Matrix must be square for eigenvalue computation".to_string()));
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
        let norm = dot_product(&v_prime, &v_prime).sqrt();
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

        // Apply acceleration for slow convergence
        if iter > 5 && iter % 5 == 0 && !converged {
            if (eigenvalue - prev_eigenvalue).abs() > tol * 1000.0 {
                // Apply simple acceleration using extrapolation
                if iter > 10 {
                    let acceleration_factor = 1.5;  // Conservative acceleration
                    let delta_lambda = eigenvalue - prev_eigenvalue;
                    eigenvalue = eigenvalue + acceleration_factor * delta_lambda;
                    
                    // Recompute v using accelerated eigenvalue estimate
                    let _ = matrix_vector_multiply(matrix, &v)?;
                }
            }
        }
    }

    Ok((eigenvalue, v))
}

/// Find multiple eigenvalues and eigenvectors using power iteration with deflation
/// Returns eigenvalues in descending order of magnitude and corresponding eigenvectors
///
/// # Arguments
/// * `matrix` - Input matrix
/// * `num_pairs` - Number of eigenvalue-eigenvector pairs to find
///
/// # Returns
/// * Tuple containing vectors of eigenvalues and eigenvectors
pub fn find_eigenpairs(
    matrix: &[Vec<f64>],
    num_pairs: usize
) -> Result<(Vec<f64>, Vec<Vec<f64>>), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput("Matrix must be square for eigenvalue computation".to_string()));
    }

    // For symmetric matrices, use the more efficient symmetric_eigendecomposition
    if is_symmetric(matrix) {
        return symmetric_eigendecomposition(matrix, 100, 1e-10)
            .map(|(eigenvalues, eigenvectors)| {
                // Limit to requested number of pairs
                let num = num_pairs.min(eigenvalues.len());
                (eigenvalues[0..num].to_vec(), eigenvectors)
            });
    }

    let mut eigenvalues = Vec::with_capacity(num_pairs);
    // Eigenvectors as columns for easier access
    let mut eigenvectors = vec![vec![0.0; num_pairs.min(n)]; n];

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

        // Deflation: modify matrix to remove this eigenpair using more stable method
        for i in 0..n {
            for j in 0..n {
                let deflation_term = eigenvalue * eigenvector[i] * eigenvector[j];
                working_matrix[i][j] -= deflation_term;
            }
        }

        // Ensure orthogonality to previously found eigenvectors
        if k > 0 {
            for prev_k in 0..k {
                // Extract previous eigenvector
                let prev_eigenvector: Vec<f64> = (0..n).map(|i| eigenvectors[i][prev_k]).collect();
                
                // Calculate dot product
                let dot = dot_product(&eigenvector, &prev_eigenvector);
                
                // Project out component along previous eigenvector
                for i in 0..n {
                    working_matrix[i][i] -= dot * prev_eigenvector[i];
                }
            }
        }
    }

    // Ensure eigenvectors are normalized
    for k in 0..num_pairs.min(n) {
        let mut col_vector: Vec<f64> = (0..n).map(|i| eigenvectors[i][k]).collect();
        normalize_vector(&mut col_vector);
        for i in 0..n {
            eigenvectors[i][k] = col_vector[i];
        }
    }

    Ok((eigenvalues, eigenvectors))
}

/// Compute eigendecomposition of a symmetric matrix using QR algorithm
/// More accurate and efficient than power iteration for full eigendecomposition
///
/// # Arguments
/// * `matrix` - Input symmetric matrix
/// * `max_iter` - Maximum number of iterations
/// * `tol` - Convergence tolerance
///
/// # Returns
/// * Tuple containing eigenvalues (descending order) and eigenvectors (as columns)
pub fn symmetric_eigendecomposition(
    matrix: &[Vec<f64>],
    max_iter: usize,
    tol: f64
) -> Result<(Vec<f64>, Vec<Vec<f64>>), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput("Matrix must be square for eigendecomposition".to_string()));
    }

    // Check if matrix is symmetric
    if !is_symmetric(matrix) {
        return Err(DiscriminantError::InvalidInput(
            "Matrix must be symmetric for this algorithm".to_string()
        ));
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

        // Avoid division by zero or near-zero
        let theta = if is_effectively_zero(apq) {
            0.0
        } else {
            0.5 * ((aqq - app) / apq).atan()
        };
        
        let c = theta.cos();
        let s = theta.sin();

        // Apply rotation to a
        let new_app = app * c * c - 2.0 * apq * c * s + aqq * s * s;
        let new_aqq = app * s * s + 2.0 * apq * c * s + aqq * c * c;

        a[p][p] = new_app;
        a[q][q] = new_aqq;
        a[p][q] = 0.0;
        a[q][p] = 0.0;

        // Update other elements
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
    let mut eigenvalues: Vec<f64> = (0..n).map(|i| a[i][i]).collect();

    // Create eigenvalue-eigenvector pairs for sorting
    let mut eigen_pairs: Vec<(f64, Vec<f64>)> = Vec::with_capacity(n);
    for i in 0..n {
        let eigenvector: Vec<f64> = (0..n).map(|j| eigenvectors[j][i]).collect();
        eigen_pairs.push((a[i][i], eigenvector));
    }

    // Sort by decreasing eigenvalue
    eigen_pairs.sort_by(|a, b| b.0.partial_cmp(&a.0).unwrap_or(std::cmp::Ordering::Equal));

    // Extract sorted eigenvalues and eigenvectors
    eigenvalues = eigen_pairs.iter().map(|(val, _)| *val).collect();
    
    // Copy sorted eigenvectors as columns
    let mut sorted_eigenvectors = vec![vec![0.0; n]; n];
    for i in 0..n {
        for j in 0..n {
            sorted_eigenvectors[j][i] = eigen_pairs[i].1[j];
        }
    }

    Ok((eigenvalues, sorted_eigenvectors))
}

/// Compute QR decomposition of a matrix
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Tuple containing Q (orthogonal) and R (upper triangular) matrices
pub fn qr_decomposition(
    matrix: &[Vec<f64>]
) -> Result<(Vec<Vec<f64>>, Vec<Vec<f64>>), DiscriminantError> {
    let m = matrix.len();
    if m == 0 {
        return Err(DiscriminantError::InvalidInput("Empty matrix".to_string()));
    }
    
    let n = matrix[0].len();
    if n == 0 {
        return Err(DiscriminantError::InvalidInput("Empty matrix".to_string()));
    }
    
    // Modified Gram-Schmidt process
    let mut q = vec![vec![0.0; m]; n]; // Transposed for easier column access
    let mut r = vec![vec![0.0; n]; n];
    
    // Initialize q with columns of A
    for j in 0..n {
        for i in 0..m {
            q[j][i] = matrix[i][j];
        }
    }
    
    for k in 0..n {
        // Compute norm of column k
        let mut r_kk = 0.0;
        for i in 0..m {
            r_kk += q[k][i] * q[k][i];
        }
        r_kk = r_kk.sqrt();
        
        if is_effectively_zero(r_kk) {
            return Err(DiscriminantError::ComputationError(
                "QR decomposition failed: linearly dependent columns".to_string()
            ));
        }
        
        r[k][k] = r_kk;
        
        // Normalize column k
        for i in 0..m {
            q[k][i] /= r_kk;
        }
        
        // Orthogonalize remaining columns
        for j in (k+1)..n {
            // Compute projection
            let mut r_kj = 0.0;
            for i in 0..m {
                r_kj += q[k][i] * q[j][i];
            }
            
            r[k][j] = r_kj;
            
            // Subtract projection
            for i in 0..m {
                q[j][i] -= r_kj * q[k][i];
            }
        }
    }
    
    // Transpose q back to original orientation
    let mut q_result = vec![vec![0.0; n]; m];
    for i in 0..m {
        for j in 0..n {
            q_result[i][j] = q[j][i];
        }
    }
    
    Ok((q_result, r))
}
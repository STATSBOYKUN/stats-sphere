/// Matrix operations for discriminant analysis

/// Compute dot product between two vectors
pub fn dot_product(a: &[f64], b: &[f64]) -> f64 {
    let mut result = 0.0;
    for i in 0..a.len().min(b.len()) {
        result += a[i] * b[i];
    }
    result
}

/// Calculate inverse of a matrix using Gauss-Jordan elimination
pub fn matrix_inverse(matrix: &[Vec<f64>]) -> Result<Vec<Vec<f64>>, &'static str> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err("Matrix must be square");
    }

    // Create augmented matrix [A|I]
    let mut augmented = Vec::with_capacity(n);
    for i in 0..n {
        let mut row = Vec::with_capacity(2 * n);
        for j in 0..n {
            row.push(matrix[i][j]);
        }
        for j in 0..n {
            row.push(if i == j { 1.0 } else { 0.0 });
        }
        augmented.push(row);
    }

    // Gauss-Jordan elimination
    for i in 0..n {
        // Pivot selection (partial pivoting)
        let mut max_row = i;
        let mut max_val = augmented[i][i].abs();

        for j in (i + 1)..n {
            let abs_val = augmented[j][i].abs();
            if abs_val > max_val {
                max_row = j;
                max_val = abs_val;
            }
        }

        if max_val < 1e-10 {
            return Err("Matrix is singular");
        }

        if max_row != i {
            // Swap rows
            augmented.swap(i, max_row);
        }

        // Scale row so pivot = 1
        let pivot = augmented[i][i];
        for j in 0..(2 * n) {
            augmented[i][j] /= pivot;
        }

        // Eliminate other elements in pivot column
        for j in 0..n {
            if j != i {
                let factor = augmented[j][i];
                for k in 0..(2 * n) {
                    augmented[j][k] -= factor * augmented[i][k];
                }
            }
        }
    }

    // Extract inverse matrix part
    let mut inverse = vec![vec![0.0; n]; n];
    for i in 0..n {
        for j in 0..n {
            inverse[i][j] = augmented[i][j + n];
        }
    }

    Ok(inverse)
}

/// Calculate determinant of a matrix
pub fn matrix_determinant(matrix: &[Vec<f64>]) -> Option<f64> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return None; // Not a square matrix
    }

    if n == 1 {
        return Some(matrix[0][0]);
    }

    if n == 2 {
        return Some(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
    }

    // For larger matrices, use cofactor expansion along first row
    let mut result = 0.0;
    let mut sign = 1.0;

    for j in 0..n {
        // Create submatrix without first row and column j
        let mut submatrix = vec![vec![0.0; n - 1]; n - 1];
        for i in 1..n {
            let mut col_idx = 0;
            for k in 0..n {
                if k != j {
                    submatrix[i - 1][col_idx] = matrix[i][k];
                    col_idx += 1;
                }
            }
        }

        let sub_det = matrix_determinant(&submatrix).unwrap_or(0.0);
        result += sign * matrix[0][j] * sub_det;
        sign = -sign;
    }

    Some(result)
}

/// Multiply two matrices
pub fn matrix_multiply(a: &[Vec<f64>], b: &[Vec<f64>]) -> Option<Vec<Vec<f64>>> {
    let a_rows = a.len();
    if a_rows == 0 {
        return None;
    }

    let a_cols = a[0].len();
    let b_rows = b.len();
    if b_rows == 0 || b_rows != a_cols {
        return None;
    }

    let b_cols = b[0].len();

    let mut result = vec![vec![0.0; b_cols]; a_rows];

    for i in 0..a_rows {
        for j in 0..b_cols {
            for k in 0..a_cols {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    Some(result)
}

/// Calculate eigenvalues and eigenvectors using power iteration method
pub fn power_iteration(matrix: &[Vec<f64>], max_iter: usize, tol: f64) -> Result<(f64, Vec<f64>), &'static str> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err("Matrix must be square");
    }

    // Start with a random vector
    let mut v = vec![0.0; n];
    for i in 0..n {
        v[i] = (i as f64 + 1.0).sin(); // Simple but adequately random
    }

    // Normalize initial vector
    let norm = v.iter().map(|x| x * x).sum::<f64>().sqrt();
    for i in 0..n {
        v[i] /= norm;
    }

    let mut eigenvalue = 0.0;

    for _ in 0..max_iter {
        // v' = A*v
        let mut v_prime = vec![0.0; n];
        for i in 0..n {
            for j in 0..n {
                v_prime[i] += matrix[i][j] * v[j];
            }
        }

        // Calculate eigenvalue
        let new_eigenvalue = dot_product(&v_prime, &v);

        // Normalize v'
        let norm = v_prime.iter().map(|x| x * x).sum::<f64>().sqrt();
        if norm < 1e-10 {
            return Err("Zero eigenvector");
        }

        for i in 0..n {
            v_prime[i] /= norm;
        }

        // Check convergence
        let diff = (new_eigenvalue - eigenvalue).abs();
        eigenvalue = new_eigenvalue;
        v = v_prime;

        if diff < tol {
            break;
        }
    }

    Ok((eigenvalue, v))
}

/// Find multiple eigenvalues and eigenvectors using power iteration with deflation
pub fn find_eigenpairs(matrix: &[Vec<f64>], num_pairs: usize) -> Result<(Vec<f64>, Vec<Vec<f64>>), &'static str> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err("Matrix must be square");
    }

    let mut eigenvalues = Vec::with_capacity(num_pairs);
    let mut eigenvectors = vec![vec![0.0; num_pairs]; n];

    // Make a copy of the matrix that we can modify during deflation
    let mut working_matrix = matrix.to_vec();

    for k in 0..num_pairs.min(n) {
        // Find largest eigenvalue and eigenvector
        let (eigenvalue, eigenvector) = power_iteration(&working_matrix, 100, 1e-10)?;

        eigenvalues.push(eigenvalue);

        for i in 0..n {
            eigenvectors[i][k] = eigenvector[i];
        }

        // Deflation: modify matrix to remove this eigenpair
        for i in 0..n {
            for j in 0..n {
                let factor = eigenvector[i] * eigenvector[j] / dot_product(&eigenvector, &eigenvector);
                working_matrix[i][j] -= eigenvalue * factor;
            }
        }
    }

    Ok((eigenvalues, eigenvectors))
}

/// Compute matrix trace (sum of diagonal elements)
pub fn matrix_trace(matrix: &[Vec<f64>]) -> f64 {
    let mut trace = 0.0;
    for i in 0..matrix.len() {
        if i < matrix[i].len() {
            trace += matrix[i][i];
        }
    }
    trace
}

/// Calculate matrix LU decomposition using Doolittle algorithm
pub fn lu_decomposition(a: &[Vec<f64>]) -> Option<(Vec<Vec<f64>>, Vec<Vec<f64>>)> {
    let n = a.len();
    if n == 0 || a[0].len() != n {
        return None;
    }

    let mut l = vec![vec![0.0; n]; n];
    let mut u = vec![vec![0.0; n]; n];

    // Initialize L with 1's on diagonal
    for i in 0..n {
        l[i][i] = 1.0;
    }

    // Fill U and L
    for j in 0..n {
        // Upper triangular matrix U
        for i in 0..=j {
            let mut sum = 0.0;
            for k in 0..i {
                sum += l[i][k] * u[k][j];
            }
            u[i][j] = a[i][j] - sum;
        }

        // Lower triangular matrix L
        for i in (j+1)..n {
            let mut sum = 0.0;
            for k in 0..j {
                sum += l[i][k] * u[k][j];
            }

            if u[j][j].abs() < 1e-10 {
                return None; // Singular matrix
            }

            l[i][j] = (a[i][j] - sum) / u[j][j];
        }
    }

    Some((l, u))
}

/// Solve linear system Ax = b using LU decomposition
pub fn solve_linear_system(a: &[Vec<f64>], b: &[f64]) -> Option<Vec<f64>> {
    let n = a.len();
    if n == 0 || a[0].len() != n || b.len() != n {
        return None;
    }

    // Get LU decomposition
    let (l, u) = lu_decomposition(a)?;

    // Solve Ly = b for y (forward substitution)
    let mut y = vec![0.0; n];
    for i in 0..n {
        let mut sum = 0.0;
        for j in 0..i {
            sum += l[i][j] * y[j];
        }
        y[i] = b[i] - sum;
    }

    // Solve Ux = y for x (backward substitution)
    let mut x = vec![0.0; n];
    for i in (0..n).rev() {
        let mut sum = 0.0;
        for j in (i+1)..n {
            sum += u[i][j] * x[j];
        }

        if u[i][i].abs() < 1e-10 {
            return None; // Singular matrix
        }

        x[i] = (y[i] - sum) / u[i][i];
    }

    Some(x)
}

/// Calculate Cholesky decomposition of a positive definite matrix
pub fn cholesky_decomposition(a: &[Vec<f64>]) -> Option<Vec<Vec<f64>>> {
    let n = a.len();
    if n == 0 || a[0].len() != n {
        return None;
    }

    let mut l = vec![vec![0.0; n]; n];

    for i in 0..n {
        for j in 0..=i {
            let mut sum = 0.0;

            if j == i {
                // Diagonal elements
                for k in 0..j {
                    sum += l[j][k] * l[j][k];
                }
                let val = a[j][j] - sum;
                if val <= 0.0 {
                    return None; // Not positive definite
                }
                l[j][j] = val.sqrt();
            } else {
                // Off-diagonal elements
                for k in 0..j {
                    sum += l[i][k] * l[j][k];
                }
                if l[j][j] == 0.0 {
                    return None;
                }
                l[i][j] = (a[i][j] - sum) / l[j][j];
            }
        }
    }

    Some(l)
}

/// Check if a matrix is positive definite
pub fn is_positive_definite(matrix: &[Vec<f64>]) -> bool {
    cholesky_decomposition(matrix).is_some()
}

/// Calculate matrix logarithm of determinant using Cholesky decomposition
pub fn log_determinant(matrix: &[Vec<f64>]) -> Option<f64> {
    let cholesky = cholesky_decomposition(matrix)?;

    let mut log_det = 0.0;
    for i in 0..cholesky.len() {
        log_det += 2.0 * cholesky[i][i].ln();
    }

    Some(log_det)
}
use super::basics::{is_effectively_zero, is_symmetric};
use crate::discriminant::main::types::results::DiscriminantError;

/// Calculate inverse of a matrix using Gauss-Jordan elimination
/// with partial pivoting for improved numerical stability
///
/// # Arguments
/// * `matrix` - Input matrix to invert
///
/// # Returns
/// * Inverted matrix, or error if matrix is singular or not square
pub fn matrix_inverse(matrix: &[Vec<f64>]) -> Result<Vec<Vec<f64>>, DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput(
            "Matrix must be square for inversion".to_string(),
        ));
    }

    // Check for extremely large or small values
    let mut has_extreme_value = false;
    for row in matrix {
        for &val in row {
            if val.abs() > 1e50 || (val != 0.0 && val.abs() < 1e-50) {
                has_extreme_value = true;
                break;
            }
        }
        if has_extreme_value {
            break;
        }
    }

    // For better numerical stability with extreme values, use scaling
    let scale_factor = if has_extreme_value {
        // Find a reasonable scale factor
        let mut max_abs = 0.0;
        for row in matrix {
            for &val in row {
                if val.abs() > max_abs {
                    max_abs = val.abs();
                }
            }
        }

        // Target scaling to values around 1.0
        if max_abs > 0.0 {
            1.0 / max_abs
        } else {
            1.0
        }
    } else {
        1.0
    };

    // Create augmented matrix [A|I]
    let mut augmented = Vec::with_capacity(n);
    for i in 0..n {
        let mut row = Vec::with_capacity(2 * n);
        for j in 0..n {
            row.push(matrix[i][j] * scale_factor); // Apply scaling
        }
        for j in 0..n {
            row.push(if i == j { 1.0 } else { 0.0 });
        }
        augmented.push(row);
    }

    // Gauss-Jordan elimination with partial pivoting
    for i in 0..n {
        // Find pivot (maximum absolute value in current column)
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
            return Err(DiscriminantError::SingularMatrix);
        }

        // Swap rows if needed
        if max_row != i {
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

    // Rescale the inverse if we applied scaling
    if scale_factor != 1.0 {
        for i in 0..n {
            for j in 0..n {
                inverse[i][j] *= scale_factor;
            }
        }
    }

    Ok(inverse)
}

/// Calculate determinant of a matrix using LU decomposition
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Determinant value, or error if matrix is not square
pub fn matrix_determinant(matrix: &[Vec<f64>]) -> Result<f64, DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput(
            "Not a square matrix".to_string(),
        ));
    }

    // Check for extreme values that might cause numerical instability
    let mut has_extreme_value = false;
    for row in matrix {
        for &val in row {
            if val.abs() > 1e50 || (val != 0.0 && val.abs() < 1e-50) {
                has_extreme_value = true;
                break;
            }
        }
        if has_extreme_value {
            break;
        }
    }

    // Base cases for small matrices (handle directly for efficiency)
    if n == 1 {
        return Ok(matrix[0][0]);
    }

    if n == 2 {
        return Ok(matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]);
    }

    // Use LU decomposition for larger matrices (more efficient)
    // or for matrices with extreme values
    if n > 3 || has_extreme_value {
        match lu_decomposition_with_pivoting(matrix) {
            Ok((_, u, sign)) => {
                // Det(A) = sign * product of diagonal elements of U
                let mut det = sign;
                for i in 0..n {
                    det *= u[i][i];

                    // Early exit if determinant is approximately zero
                    if is_effectively_zero(det) {
                        return Ok(0.0);
                    }
                }
                Ok(det)
            }
            Err(e) => Err(e),
        }
    } else {
        // Use cofactor expansion for 3x3 matrices
        let mut det = 0.0;
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

            det += sign * matrix[0][j] * matrix_determinant(&submatrix)?;
            sign = -sign;
        }

        Ok(det)
    }
}

/// Calculate LU decomposition with pivoting (PA = LU)
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Tuple containing (L, U, sign) where:
///   - L is the lower triangular matrix
///   - U is the upper triangular matrix
///   - sign accounts for row swaps (-1 for odd number of swaps, 1 for even)
pub fn lu_decomposition_with_pivoting(
    matrix: &[Vec<f64>],
) -> Result<(Vec<Vec<f64>>, Vec<Vec<f64>>, f64), DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput(
            "Not a square matrix".to_string(),
        ));
    }

    // Create working copy of matrix
    let mut a = matrix.to_vec();

    // Initialize L and U matrices
    let mut l = vec![vec![0.0; n]; n];
    let mut u = vec![vec![0.0; n]; n];

    // Initialize pivot vector and sign of determinant
    let mut pivot = (0..n).collect::<Vec<usize>>();
    let mut det_sign = 1.0;

    // Perform LU decomposition with pivoting
    for k in 0..n {
        // Find pivot
        let mut p = k;
        let mut max_val = a[pivot[k]][k].abs();

        for i in (k + 1)..n {
            let val = a[pivot[i]][k].abs();
            if val > max_val {
                max_val = val;
                p = i;
            }
        }

        // Check for singular matrix
        if max_val < 1e-10 {
            return Err(DiscriminantError::SingularMatrix);
        }

        // Swap pivot rows if necessary
        if p != k {
            pivot.swap(p, k);
            det_sign = -det_sign; // Each swap changes sign of determinant
        }

        // Compute elimination factors and update
        for i in (k + 1)..n {
            a[pivot[i]][k] /= a[pivot[k]][k];

            for j in (k + 1)..n {
                a[pivot[i]][j] -= a[pivot[i]][k] * a[pivot[k]][j];
            }
        }
    }

    // Form L and U matrices
    for i in 0..n {
        // L has unit diagonal
        l[i][i] = 1.0;

        // Get strictly lower triangular part
        for j in 0..i {
            l[i][j] = a[pivot[i]][j];
        }

        // Get upper triangular part including diagonal
        for j in i..n {
            u[i][j] = a[pivot[i]][j];
        }
    }

    Ok((l, u, det_sign))
}

/// Calculate Cholesky decomposition (A = LL^T) for positive definite matrix
///
/// # Arguments
/// * `matrix` - Input symmetric positive definite matrix
///
/// # Returns
/// * Lower triangular matrix L such that A = LL^T, or error if matrix is not positive definite
pub fn cholesky_decomposition(matrix: &[Vec<f64>]) -> Result<Vec<Vec<f64>>, DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput(
            "Not a square matrix".to_string(),
        ));
    }

    // Check if matrix is symmetric
    if !is_symmetric(matrix) {
        return Err(DiscriminantError::InvalidInput(
            "Matrix must be symmetric for Cholesky decomposition".to_string(),
        ));
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
                let val = matrix[j][j] - sum;
                if val <= 0.0 {
                    return Err(DiscriminantError::InvalidInput(
                        "Matrix is not positive definite".to_string(),
                    ));
                }
                l[j][j] = val.sqrt();
            } else {
                // Off-diagonal elements
                for k in 0..j {
                    sum += l[i][k] * l[j][k];
                }
                if l[j][j] == 0.0 {
                    return Err(DiscriminantError::SingularMatrix);
                }
                l[i][j] = (matrix[i][j] - sum) / l[j][j];
            }
        }
    }

    Ok(l)
}

/// Calculate logarithm of determinant using LU decomposition
/// More numerically stable than computing determinant directly
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Natural logarithm of absolute determinant value, or error
pub fn log_determinant(matrix: &[Vec<f64>]) -> Result<f64, DiscriminantError> {
    let n = matrix.len();
    if n == 0 || matrix[0].len() != n {
        return Err(DiscriminantError::InvalidInput(
            "Not a square matrix".to_string(),
        ));
    }

    // For 2x2 matrices, use direct calculation
    if n == 2 {
        let det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
        if det <= 0.0 {
            return Err(DiscriminantError::InvalidInput(
                "Cannot compute log determinant of non-positive matrix".to_string(),
            ));
        }
        return Ok(det.ln());
    }

    // For larger matrices, use LU decomposition
    let (_, u, sign) = lu_decomposition_with_pivoting(matrix)?;

    // Sum logarithms of diagonal elements
    let mut log_det = 0.0;
    let mut has_negative = false;

    for i in 0..n {
        if u[i][i] <= 0.0 {
            has_negative = true;
            break;
        }
        log_det += u[i][i].ln();
    }

    if has_negative || sign < 0.0 {
        return Err(DiscriminantError::InvalidInput(
            "Cannot compute log determinant of non-positive matrix".to_string(),
        ));
    }

    Ok(log_det)
}

/// Solve linear system Ax = b using LU decomposition
///
/// # Arguments
/// * `a` - Coefficient matrix
/// * `b` - Right-hand side vector
///
/// # Returns
/// * Solution vector x such that Ax = b, or error
pub fn solve_linear_system(a: &[Vec<f64>], b: &[f64]) -> Result<Vec<f64>, DiscriminantError> {
    let n = a.len();
    if n == 0 || a[0].len() != n || b.len() != n {
        return Err(DiscriminantError::InvalidInput(
            "Dimensions mismatch in linear system".to_string(),
        ));
    }

    // Get LU decomposition
    let (l, u, _) = lu_decomposition_with_pivoting(a)?;

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
        for j in (i + 1)..n {
            sum += u[i][j] * x[j];
        }

        if is_effectively_zero(u[i][i]) {
            return Err(DiscriminantError::SingularMatrix);
        }

        x[i] = (y[i] - sum) / u[i][i];
    }

    Ok(x)
}

/// Compute trace of product of two matrices without explicitly computing the product
///
/// # Arguments
/// * `a` - First matrix
/// * `b` - Second matrix
///
/// # Returns
/// * Trace of the product A*B, or error if dimensions don't match
pub fn trace_of_product(a: &[Vec<f64>], b: &[Vec<f64>]) -> Result<f64, DiscriminantError> {
    let a_rows = a.len();
    if a_rows == 0 || a[0].is_empty() {
        return Err(DiscriminantError::InvalidInput(
            "Empty matrix input".to_string(),
        ));
    }

    let a_cols = a[0].len();
    let b_rows = b.len();

    if b_rows == 0 || b[0].is_empty() {
        return Err(DiscriminantError::InvalidInput(
            "Empty matrix input".to_string(),
        ));
    }

    let b_cols = b[0].len();

    if a_cols != b_rows || a_rows != b_cols {
        return Err(DiscriminantError::InvalidInput(format!(
            "Matrix dimensions incompatible for trace of product: {}x{} and {}x{}",
            a_rows, a_cols, b_rows, b_cols
        )));
    }

    let mut trace = 0.0;
    for i in 0..a_rows {
        for j in 0..a_cols {
            trace += a[i][j] * b[j][i];
        }
    }

    Ok(trace)
}

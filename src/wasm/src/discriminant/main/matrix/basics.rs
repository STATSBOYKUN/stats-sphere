use crate::discriminant::main::types::results::DiscriminantError;

/// Compute dot product between two vectors
///
/// # Arguments
/// * `a` - First vector
/// * `b` - Second vector
///
/// # Returns
/// * Dot product of the vectors
pub fn dot_product(a: &[f64], b: &[f64]) -> f64 {
    a.iter()
     .zip(b.iter())
     .map(|(&x, &y)| x * y)
     .sum()
}

/// Calculate vector norm (magnitude)
///
/// # Arguments
/// * `v` - Input vector
///
/// # Returns
/// * L2 norm (Euclidean length) of the vector
pub fn vector_norm(v: &[f64]) -> f64 {
    v.iter()
     .map(|&x| x.powi(2))
     .sum::<f64>()
     .sqrt()
}

/// Normalize a vector to unit length
///
/// # Arguments
/// * `v` - Vector to normalize (modified in-place)
pub fn normalize_vector(v: &mut [f64]) {
    let norm = vector_norm(v);
    if norm > 1e-10 {
        v.iter_mut().for_each(|val| *val /= norm);
    }
}

/// Multiply a matrix by a vector
///
/// # Arguments
/// * `matrix` - Input matrix
/// * `vector` - Input vector
///
/// # Returns
/// * Result vector of the multiplication, or error if dimensions don't match
pub fn matrix_vector_multiply(
    matrix: &[Vec<f64>],
    vector: &[f64]
) -> Result<Vec<f64>, DiscriminantError> {
    if matrix.is_empty() {
        return Err(DiscriminantError::InvalidInput("Empty matrix".to_string()));
    }

    let rows = matrix.len();
    let cols = matrix[0].len();

    if cols != vector.len() {
        return Err(DiscriminantError::InvalidInput(
            format!("Matrix columns ({}) must match vector length ({})", cols, vector.len())
        ));
    }

    let mut result = vec![0.0; rows];
    for i in 0..rows {
        result[i] = dot_product(&matrix[i], vector);
    }

    Ok(result)
}

/// Multiply two matrices
///
/// # Arguments
/// * `a` - First matrix
/// * `b` - Second matrix
///
/// # Returns
/// * Result matrix of the multiplication, or error if dimensions don't match
pub fn matrix_multiply(
    a: &[Vec<f64>],
    b: &[Vec<f64>]
) -> Result<Vec<Vec<f64>>, DiscriminantError> {
    if a.is_empty() || b.is_empty() {
        return Err(DiscriminantError::InvalidInput("Empty matrix input".to_string()));
    }

    let a_rows = a.len();
    let a_cols = a[0].len();
    let b_rows = b.len();
    let b_cols = b[0].len();

    if a_cols != b_rows {
        return Err(DiscriminantError::InvalidInput(
            format!("Matrix dimensions don't match for multiplication: {}x{} and {}x{}",
                    a_rows, a_cols, b_rows, b_cols)
        ));
    }

    let mut result = vec![vec![0.0; b_cols]; a_rows];

    for i in 0..a_rows {
        for j in 0..b_cols {
            for k in 0..a_cols {
                result[i][j] += a[i][k] * b[k][j];
            }
        }
    }

    Ok(result)
}

/// Compute the trace of a matrix (sum of diagonal elements)
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Trace value
pub fn matrix_trace(matrix: &[Vec<f64>]) -> f64 {
    matrix.iter()
          .enumerate()
          .filter_map(|(i, row)| row.get(i).copied())
          .sum()
}

/// Create an identity matrix of specified size
///
/// # Arguments
/// * `size` - Size of the square identity matrix
///
/// # Returns
/// * Identity matrix of the specified size
pub fn identity_matrix(size: usize) -> Vec<Vec<f64>> {
    let mut result = vec![vec![0.0; size]; size];
    for i in 0..size {
        result[i][i] = 1.0;
    }
    result
}

/// Transpose a matrix
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * Transposed matrix
pub fn matrix_transpose(matrix: &[Vec<f64>]) -> Vec<Vec<f64>> {
    if matrix.is_empty() || matrix[0].is_empty() {
        return Vec::new();
    }

    let rows = matrix.len();
    let cols = matrix[0].len();

    let mut result = vec![vec![0.0; rows]; cols];

    for i in 0..rows {
        for j in 0..cols {
            result[j][i] = matrix[i][j];
        }
    }

    result
}

/// Create a diagonal matrix from a vector
///
/// # Arguments
/// * `diagonal` - Vector of diagonal elements
///
/// # Returns
/// * Diagonal matrix
pub fn diagonal_matrix(diagonal: &[f64]) -> Vec<Vec<f64>> {
    let size = diagonal.len();
    let mut result = vec![vec![0.0; size]; size];

    for i in 0..size {
        result[i][i] = diagonal[i];
    }

    result
}

/// Check if a matrix is symmetric
///
/// # Arguments
/// * `matrix` - Input matrix
///
/// # Returns
/// * true if matrix is symmetric, false otherwise
pub fn is_symmetric(matrix: &[Vec<f64>]) -> bool {
    if matrix.is_empty() {
        return true;
    }

    let n = matrix.len();
    if matrix[0].len() != n {
        return false;
    }

    for i in 1..n {
        for j in 0..i {
            if (matrix[i][j] - matrix[j][i]).abs() > 1e-10 {
                return false;
            }
        }
    }

    true
}

/// Check if a value is effectively zero (within numerical precision)
///
/// # Arguments
/// * `value` - Value to check
///
/// # Returns
/// * true if value is effectively zero, false otherwise
pub fn is_effectively_zero(value: f64) -> bool {
    value.abs() < 1e-10
}

/// Add two matrices
///
/// # Arguments
/// * `a` - First matrix
/// * `b` - Second matrix
///
/// # Returns
/// * Result of a + b, or error if dimensions don't match
pub fn matrix_add(
    a: &[Vec<f64>],
    b: &[Vec<f64>]
) -> Result<Vec<Vec<f64>>, DiscriminantError> {
    if a.is_empty() || b.is_empty() {
        return Err(DiscriminantError::InvalidInput("Empty matrix input".to_string()));
    }

    let a_rows = a.len();
    let a_cols = a[0].len();
    let b_rows = b.len();
    let b_cols = b[0].len();

    if a_rows != b_rows || a_cols != b_cols {
        return Err(DiscriminantError::InvalidInput(
            format!("Matrix dimensions don't match for addition: {}x{} and {}x{}",
                    a_rows, a_cols, b_rows, b_cols)
        ));
    }

    let mut result = vec![vec![0.0; a_cols]; a_rows];

    for i in 0..a_rows {
        for j in 0..a_cols {
            result[i][j] = a[i][j] + b[i][j];
        }
    }

    Ok(result)
}

/// Subtract two matrices
///
/// # Arguments
/// * `a` - First matrix
/// * `b` - Second matrix
///
/// # Returns
/// * Result of a - b, or error if dimensions don't match
pub fn matrix_subtract(
    a: &[Vec<f64>],
    b: &[Vec<f64>]
) -> Result<Vec<Vec<f64>>, DiscriminantError> {
    if a.is_empty() || b.is_empty() {
        return Err(DiscriminantError::InvalidInput("Empty matrix input".to_string()));
    }

    let a_rows = a.len();
    let a_cols = a[0].len();
    let b_rows = b.len();
    let b_cols = b[0].len();

    if a_rows != b_rows || a_cols != b_cols {
        return Err(DiscriminantError::InvalidInput(
            format!("Matrix dimensions don't match for subtraction: {}x{} and {}x{}",
                    a_rows, a_cols, b_rows, b_cols)
        ));
    }

    let mut result = vec![vec![0.0; a_cols]; a_rows];

    for i in 0..a_rows {
        for j in 0..a_cols {
            result[i][j] = a[i][j] - b[i][j];
        }
    }

    Ok(result)
}

/// Scale a matrix by a scalar
///
/// # Arguments
/// * `matrix` - Input matrix
/// * `scalar` - Scaling factor
///
/// # Returns
/// * Scaled matrix
pub fn matrix_scale(matrix: &[Vec<f64>], scalar: f64) -> Vec<Vec<f64>> {
    if matrix.is_empty() {
        return Vec::new();
    }

    let rows = matrix.len();
    let cols = matrix[0].len();

    let mut result = vec![vec![0.0; cols]; rows];

    for i in 0..rows {
        for j in 0..cols {
            result[i][j] = matrix[i][j] * scalar;
        }
    }

    result
}
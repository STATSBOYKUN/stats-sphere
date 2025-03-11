use  crate::discriminant::main::types::results::DiscriminantError;

/// Compute dot product between two vectors
pub fn dot_product(a: &[f64], b: &[f64]) -> f64 {
    let mut result = 0.0;
    let min_len = a.len().min(b.len());
    for i in 0..min_len {
        result += a[i] * b[i];
    }
    result
}

/// Calculate vector norm (magnitude)
pub fn vector_norm(v: &[f64]) -> f64 {
    v.iter().map(|&x| x*x).sum::<f64>().sqrt()
}

/// Normalize a vector to unit length
pub fn normalize_vector(v: &mut [f64]) {
    let norm = vector_norm(v);
    if norm > 1e-10 {
        for val in v.iter_mut() {
            *val /= norm;
        }
    }
}

/// Multiply a matrix by a vector
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
        for j in 0..cols {
            result[i] += matrix[i][j] * vector[j];
        }
    }

    Ok(result)
}

/// Multiply two matrices
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
pub fn matrix_trace(matrix: &[Vec<f64>]) -> f64 {
    let mut trace = 0.0;
    for i in 0..matrix.len() {
        if i < matrix[i].len() {
            trace += matrix[i][i];
        }
    }
    trace
}

/// Create an identity matrix of specified size
pub fn identity_matrix(size: usize) -> Vec<Vec<f64>> {
    let mut result = vec![vec![0.0; size]; size];
    for i in 0..size {
        result[i][i] = 1.0;
    }
    result
}

/// Transpose a matrix
pub fn matrix_transpose(matrix: &[Vec<f64>]) -> Vec<Vec<f64>> {
    if matrix.is_empty() {
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
pub fn diagonal_matrix(diagonal: &[f64]) -> Vec<Vec<f64>> {
    let size = diagonal.len();
    let mut result = vec![vec![0.0; size]; size];

    for i in 0..size {
        result[i][i] = diagonal[i];
    }

    result
}

/// Check if a matrix is symmetric
pub fn is_symmetric(matrix: &[Vec<f64>]) -> bool {
    if matrix.is_empty() {
        return true;
    }

    let n = matrix.len();
    if matrix[0].len() != n {
        return false;
    }

    for i in 0..n {
        for j in 0..i {
            if (matrix[i][j] - matrix[j][i]).abs() > 1e-10 {
                return false;
            }
        }
    }

    true
}

/// Check if a value is effectively zero (within numerical precision)
pub fn is_effectively_zero(value: f64) -> bool {
    value.abs() < 1e-10
}
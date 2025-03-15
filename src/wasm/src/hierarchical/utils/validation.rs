use crate::hierarchical::types::ClusteringError;
use crate::hierarchical::utils::error::validate;

/// Memvalidasi data matriks tidak kosong dan memiliki ukuran yang konsisten
pub fn validate_data_matrix(
    data: &[Vec<f64>],
    min_cases: usize
) -> Result<(), ClusteringError> {
    // Validasi data tidak kosong
    validate(
        !data.is_empty(), 
        ClusteringError::DataPreparationError,
        "Empty data matrix"
    )?;
    
    // Validasi jumlah kasus
    validate(
        data.len() >= min_cases,
        ClusteringError::DataPreparationError,
        format!("Need at least {} cases for analysis", min_cases)
    )?;
    
    // Validasi data memiliki dimensi
    validate(
        !data[0].is_empty(),
        ClusteringError::DataPreparationError,
        "Data matrix has no variables (columns)"
    )?;
    
    // Validasi konsistensi dimensi
    let expected_dims = data[0].len();
    for (i, row) in data.iter().enumerate() {
        validate(
            row.len() == expected_dims,
            ClusteringError::DataPreparationError,
            format!("Inconsistent dimensions at row {}: expected {}, got {}", 
                i, expected_dims, row.len())
        )?;
    }
    
    Ok(())
}

/// Memvalidasi matriks jarak simetris dan memiliki dimensi yang benar
pub fn validate_distance_matrix(
    distances: &[Vec<f64>],
    expected_size: usize
) -> Result<(), ClusteringError> {
    // Validasi matriks tidak kosong
    validate(
        !distances.is_empty(),
        ClusteringError::DistanceCalculationError,
        "Empty distance matrix"
    )?;
    
    // Validasi ukuran
    validate(
        distances.len() == expected_size,
        ClusteringError::DistanceCalculationError,
        format!("Distance matrix size mismatch: expected {}, got {}", 
            expected_size, distances.len())
    )?;
    
    // Validasi dimensi konsisten
    for (i, row) in distances.iter().enumerate() {
        validate(
            row.len() == expected_size,
            ClusteringError::DistanceCalculationError,
            format!("Distance matrix row {} has inconsistent length: expected {}, got {}", 
                i, expected_size, row.len())
        )?;
    }
    
    // Validasi diagonal nol dan simetris (sampel saja untuk efisiensi)
    let sample_size = expected_size.min(10); // Validasi maksimal 10 sampel
    for i in 0..sample_size {
        // Diagonal harus nol
        validate(
            distances[i][i].abs() < std::f64::EPSILON,
            ClusteringError::DistanceCalculationError,
            format!("Distance matrix diagonal element [{}][{}] is not zero: {}", 
                i, i, distances[i][i])
        )?;
        
        // Simetris
        for j in (i+1)..sample_size {
            validate(
                (distances[i][j] - distances[j][i]).abs() < std::f64::EPSILON,
                ClusteringError::DistanceCalculationError,
                format!("Distance matrix is not symmetric: [{}][{}]={} != [{}][{}]={}", 
                    i, j, distances[i][j], j, i, distances[j][i])
            )?;
        }
    }
    
    Ok(())
}

/// Memvalidasi nilai finit dalam matriks jarak (tidak NaN atau Inf)
pub fn validate_finite_distances(
    distances: &mut [Vec<f64>]
) -> Result<(), ClusteringError> {
    let mut has_invalid = false;
    
    for i in 0..distances.len() {
        for j in 0..distances[i].len() {
            if i == j {
                // Diagonal harus selalu 0
                distances[i][j] = 0.0;
            } else if distances[i][j].is_nan() || distances[i][j].is_infinite() {
                has_invalid = true;
                // Gunakan nilai fallback
                distances[i][j] = f64::MAX / 2.0;
                distances[j][i] = f64::MAX / 2.0;
            }
        }
    }
    
    if has_invalid {
        Err(ClusteringError::DistanceCalculationError(
            "Invalid values (NaN/Inf) found in distance matrix and replaced with fallback values".to_string()
        ))
    } else {
        Ok(())
    }
}

/// Memvalidasi konfigurasi clustering
pub fn validate_clustering_config(
    data_len: usize,
    num_clusters: usize
) -> Result<(), ClusteringError> {
    validate(
        num_clusters >= 1,
        ClusteringError::InvalidConfiguration,
        "Number of clusters must be at least 1"
    )?;
    
    validate(
        num_clusters <= data_len,
        ClusteringError::InvalidConfiguration,
        format!("Number of clusters ({}) cannot exceed number of cases ({})", 
            num_clusters, data_len)
    )?;
    
    Ok(())
}
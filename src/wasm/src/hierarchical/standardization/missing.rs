use crate::hierarchical::types::{MissingValueStrategy, ClusteringError};
use crate::ensure;

/// Handle missing values in data matrix
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `strategy` - Strategy for handling missing values
///
/// # Returns
/// * Result with processed data matrix and array of valid case indices
pub fn handle_missing_values(
    data: &[Vec<f64>],
    strategy: MissingValueStrategy
) -> Result<(Vec<Vec<f64>>, Vec<usize>), ClusteringError> {
    ensure!(!data.is_empty(), 
        ClusteringError::DataPreparationError, 
        "Empty data matrix"
    );
    
    let n_cases = data.len();
    let n_vars = data[0].len();
    
    // Ensure all rows have the same number of variables
    for (i, row) in data.iter().enumerate() {
        ensure!(row.len() == n_vars,
            ClusteringError::DataPreparationError,
            "Row {} has {} variables, expected {}", i, row.len(), n_vars
        );
    }
    
    // Vector to track which cases are valid
    let mut valid_cases = Vec::with_capacity(n_cases);
    
    match strategy {
        MissingValueStrategy::ExcludeListwise => {
            // A case is valid only if it has no missing values
            let mut cleaned_data = Vec::with_capacity(n_cases);
            
            for (i, row) in data.iter().enumerate() {
                let has_missing = row.iter().any(|&x| x.is_nan());
                
                if !has_missing {
                    cleaned_data.push(row.clone());
                    valid_cases.push(i);
                }
            }
            
            ensure!(!cleaned_data.is_empty(),
                ClusteringError::DataPreparationError,
                "No valid cases after excluding rows with missing values"
            );
            
            Ok((cleaned_data, valid_cases))
        },
        MissingValueStrategy::ExcludePairwise => {
            // This is more complex and depends on the specific analysis
            // For hierarchical clustering, we need to handle missing values when calculating distances
            // For now, we'll just return the original data and mark all cases as valid
            valid_cases.extend(0..n_cases);
            Ok((data.to_vec(), valid_cases))
        },
    }
}
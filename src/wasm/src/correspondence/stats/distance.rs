use crate::correspondence::models::{ config::CorrespondenceAnalysisConfig, data::AnalysisData };

use super::core::{ calculate_column_sums, create_correspondence_table, standardize_data };

// Calculate chi-square distances
pub fn calculate_chi_square_distances(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<Vec<Vec<f64>>, String> {
    // Get the correspondence table
    let correspondence_table = create_correspondence_table(data, config)?;
    let col_sums = calculate_column_sums(&correspondence_table.data);

    let grand_total: f64 = correspondence_table.active_margin.iter().sum();
    if grand_total <= 0.0 {
        return Err("Grand total is zero or negative".to_string());
    }

    // Create matrix Z for singular value decomposition (per algorithm documentation)
    let mut z_matrix: Vec<Vec<f64>> =
        vec![vec![0.0; correspondence_table.data[0].len()]; correspondence_table.data.len()];

    for (i, row) in correspondence_table.data.iter().enumerate() {
        let row_margin = correspondence_table.active_margin[i];

        if row_margin > 0.0 {
            for (j, &val) in row.iter().enumerate() {
                let col_margin = col_sums[j];

                if col_margin > 0.0 {
                    // Calculate z-value following chi-square measure formula:
                    // z_ij = f_ij / sqrt(f_i+ * f_+j) - sqrt(f_i+ * f_+j) / N
                    z_matrix[i][j] =
                        val / (row_margin * col_margin).sqrt() -
                        (row_margin * col_margin).sqrt() / grand_total;
                }
            }
        }
    }

    Ok(z_matrix)
}

// Calculate Euclidean distances
pub fn calculate_euclidean_distances(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<Vec<Vec<f64>>, String> {
    // Get the correspondence table
    let correspondence_table = create_correspondence_table(data, config)?;

    // Apply chosen standardization method and create auxiliary matrix
    let (f_ij_tilde, f_i_plus_tilde, f_plus_j_tilde) = standardize_data(
        &correspondence_table,
        config
    )?;

    // Calculate grand total
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();
    if grand_total <= 0.0 {
        return Err("Grand total is zero or negative".to_string());
    }

    // Create matrix Z for singular value decomposition (per algorithm documentation)
    let mut z_matrix: Vec<Vec<f64>> =
        vec![vec![0.0; correspondence_table.data[0].len()]; correspondence_table.data.len()];

    for i in 0..correspondence_table.data.len() {
        for j in 0..correspondence_table.data[0].len() {
            // Calculate z_tilde per algorithm documentation:
            // z_tilde = f_ij_tilde - (f_i+_tilde * f_+j_tilde / N)
            let z_tilde = f_ij_tilde[i][j] - (f_i_plus_tilde[i] * f_plus_j_tilde[j]) / grand_total;

            // Normalize z_tilde by square root of product of marginals
            if f_i_plus_tilde[i] > 0.0 && f_plus_j_tilde[j] > 0.0 {
                z_matrix[i][j] = z_tilde / (f_i_plus_tilde[i] * f_plus_j_tilde[j]).sqrt();
            }
        }
    }

    Ok(z_matrix)
}

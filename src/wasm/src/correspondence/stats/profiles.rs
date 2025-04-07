use crate::correspondence::models::{
    config::CorrespondenceAnalysisConfig,
    data::AnalysisData,
    result::{ ColumnProfiles, RowProfiles },
};

use super::core::{ calculate_column_sums, create_correspondence_table };

// Calculate row profiles
pub fn calculate_row_profiles(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<RowProfiles, String> {
    // Get the correspondence table
    let correspondence_table = create_correspondence_table(data, config)?;

    // Calculate row profiles
    let mut profiles_data: Vec<Vec<f64>> = Vec::new();
    let mut mass: Vec<f64> = Vec::new();

    // Calculate the grand total
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();
    if grand_total <= 0.0 {
        return Err("Grand total is zero or negative".to_string());
    }

    // Calculate column sums
    let col_sums = calculate_column_sums(&correspondence_table.data);

    for (row_idx, row) in correspondence_table.data.iter().enumerate() {
        let row_sum = correspondence_table.active_margin[row_idx];

        if row_sum > 0.0 {
            // Calculate profile (row / row_sum)
            let profile: Vec<f64> = row
                .iter()
                .map(|&val| val / row_sum)
                .collect();
            profiles_data.push(profile);

            // Calculate mass (row_sum / grand_total)
            mass.push(row_sum / grand_total);
        } else {
            // For zero-sum rows, add zeros
            profiles_data.push(vec![0.0; row.len()]);
            mass.push(0.0);
        }
    }

    Ok(RowProfiles {
        data: profiles_data,
        mass,
    })
}

// Calculate column profiles
pub fn calculate_column_profiles(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<ColumnProfiles, String> {
    // Get the correspondence table
    let correspondence_table = create_correspondence_table(data, config)?;

    // Extract column sums
    let col_sums = calculate_column_sums(&correspondence_table.data);

    // Calculate column profiles
    let mut profiles_data: Vec<Vec<f64>> = Vec::new();
    let mut mass: Vec<f64> = Vec::new();

    // Calculate the grand total
    let grand_total: f64 = col_sums.iter().sum();
    if grand_total <= 0.0 {
        return Err("Grand total is zero or negative".to_string());
    }

    for col_idx in 0..correspondence_table.data[0].len() {
        let col_sum = col_sums[col_idx];

        if col_sum > 0.0 {
            // Extract the column
            let mut profile: Vec<f64> = Vec::new();
            for row in &correspondence_table.data {
                profile.push(row[col_idx] / col_sum);
            }
            profiles_data.push(profile);

            // Calculate mass
            mass.push(col_sum / grand_total);
        } else {
            // For zero-sum columns, add zeros
            profiles_data.push(vec![0.0; correspondence_table.data.len()]);
            mass.push(0.0);
        }
    }

    Ok(ColumnProfiles {
        data: profiles_data,
        mass,
    })
}

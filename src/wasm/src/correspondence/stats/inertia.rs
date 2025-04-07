use crate::correspondence::models::{ config::CorrespondenceAnalysisConfig, data::AnalysisData };

use super::core::{ calculate_column_profiles, calculate_row_profiles, create_correspondence_table };

pub fn calculate_row_inertia(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<Vec<f64>, String> {
    let correspondence_table = create_correspondence_table(data, config)?;
    let row_profiles = calculate_row_profiles(data, config)?;
    let column_profiles = calculate_column_profiles(data, config)?;

    let mut inertia = vec![0.0; row_profiles.mass.len()];
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();

    for (i, row) in correspondence_table.data.iter().enumerate() {
        for (j, &val) in row.iter().enumerate() {
            if row_profiles.mass[i] > 0.0 && column_profiles.mass[j] > 0.0 {
                // Calculate expected value under independence
                let expected = row_profiles.mass[i] * column_profiles.mass[j] * grand_total;

                // Calculate chi-square contribution
                if expected > 0.0 {
                    let contrib = ((val - expected) * (val - expected)) / expected;
                    inertia[i] += contrib / grand_total;
                }
            }
        }
    }

    Ok(inertia)
}

// Calculate inertia for each column
pub fn calculate_column_inertia(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<Vec<f64>, String> {
    let correspondence_table = create_correspondence_table(data, config)?;
    let row_profiles = calculate_row_profiles(data, config)?;
    let column_profiles = calculate_column_profiles(data, config)?;

    let mut inertia = vec![0.0; column_profiles.mass.len()];
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();

    for j in 0..correspondence_table.data[0].len() {
        for (i, row) in correspondence_table.data.iter().enumerate() {
            if column_profiles.mass[j] > 0.0 && row_profiles.mass[i] > 0.0 {
                // Calculate expected value under independence
                let expected = row_profiles.mass[i] * column_profiles.mass[j] * grand_total;

                // Calculate chi-square contribution
                if expected > 0.0 {
                    let contrib = ((row[j] - expected) * (row[j] - expected)) / expected;
                    inertia[j] += contrib / grand_total;
                }
            }
        }
    }

    Ok(inertia)
}

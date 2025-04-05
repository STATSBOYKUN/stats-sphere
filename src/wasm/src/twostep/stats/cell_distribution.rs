use std::collections::HashMap;

use crate::twostep::models::{
    config::ClusterConfig,
    result::{ CellDistribution, FrequencyPoint, ProcessedData, VariableDistribution },
};

pub fn calculate_cell_distribution(
    processed_data: &ProcessedData,
    config: &ClusterConfig
) -> Result<CellDistribution, String> {
    // Check if data is available
    if processed_data.data_matrix.is_empty() {
        return Err("No data available for distribution analysis".to_string());
    }

    let mut distributions = HashMap::new();

    // Create distributions for each continuous variable
    for (var_idx, var_name) in processed_data.continuous_variables.iter().enumerate() {
        // Determine min/max values
        let mut min_value = f64::MAX;
        let mut max_value = f64::MIN;

        for row in &processed_data.data_matrix {
            if var_idx < row.len() {
                let val = row[var_idx];
                min_value = min_value.min(val);
                max_value = max_value.max(val);
            }
        }

        // Create frequency bins
        let num_bins = 50;
        let bin_width = if max_value > min_value {
            (max_value - min_value) / (num_bins as f64)
        } else {
            1.0
        };

        let mut bins = vec![0.0; num_bins];

        // Count values in each bin
        for row in &processed_data.data_matrix {
            if var_idx < row.len() {
                let val = row[var_idx];
                let bin_index = ((val - min_value) / bin_width).floor() as usize;
                let bin_index = bin_index.min(num_bins - 1);
                bins[bin_index] += 1.0;
            }
        }

        // Create frequency points for visualization
        let mut frequency_data = Vec::new();
        for (i, &count) in bins.iter().enumerate() {
            if count > 0.0 {
                let x_value = min_value + ((i as f64) + 0.5) * bin_width;
                let frequency = count / (processed_data.data_matrix.len() as f64);

                frequency_data.push(FrequencyPoint {
                    x_value,
                    frequency,
                });
            }
        }

        // Add to distributions
        distributions.insert(var_name.clone(), VariableDistribution {
            x_axis: var_name.clone(),
            frequency_data,
        });
    }

    // Also create distributions for each categorical variable
    for (var_idx, var_name) in processed_data.categorical_variables.iter().enumerate() {
        if processed_data.categorical_matrix.is_empty() {
            continue;
        }

        // Count occurrences of each category
        let mut categories = HashMap::new();

        for row in &processed_data.categorical_matrix {
            if var_idx < row.len() {
                let cat = &row[var_idx];
                *categories.entry(cat.clone()).or_insert(0.0) += 1.0;
            }
        }

        // Convert to frequency points
        let mut frequency_data = Vec::new();
        let total = processed_data.categorical_matrix.len() as f64;

        // Assign numeric indices to categories for x-axis
        for (i, (_, count)) in categories.iter().enumerate() {
            frequency_data.push(FrequencyPoint {
                x_value: i as f64,
                frequency: count / total,
            });
        }

        // Add to distributions
        distributions.insert(var_name.clone(), VariableDistribution {
            x_axis: var_name.clone(),
            frequency_data,
        });
    }

    Ok(CellDistribution {
        distributions,
    })
}

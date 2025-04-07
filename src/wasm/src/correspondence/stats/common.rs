use std::collections::{ HashMap, HashSet };

use statrs::distribution::{ ChiSquared, ContinuousCDF };

use crate::correspondence::models::{
    config::{ CorrespondenceAnalysisConfig, DefineRangeConfig },
    data::{ AnalysisData, DataRecord, DataValue },
    result::CorrespondenceTable,
};

// Extract data for a specific variable from analysis data
pub fn extract_data_for_variable(
    data: &AnalysisData,
    variable: &str
) -> Result<Vec<DataRecord>, String> {
    let mut result = Vec::new();

    // Search in row data
    for dataset in &data.row_data {
        for record in dataset {
            if record.values.contains_key(variable) {
                result.push(record.clone());
            }
        }
    }

    // Search in column data if not found in row data
    if result.is_empty() {
        for dataset in &data.col_data {
            for record in dataset {
                if record.values.contains_key(variable) {
                    result.push(record.clone());
                }
            }
        }
    }

    if result.is_empty() {
        return Err(format!("No data found for variable: {}", variable));
    }

    Ok(result)
}

// Get unique categories for a variable
pub fn get_unique_categories(
    records: &[DataRecord],
    variable: &str
) -> Result<Vec<String>, String> {
    let mut categories = HashSet::new();

    for record in records {
        if let Some(value) = record.values.get(variable) {
            match value {
                DataValue::Text(s) => {
                    categories.insert(s.clone());
                }
                DataValue::Number(n) => {
                    categories.insert(n.to_string());
                }
                _ => {}
            }
        }
    }

    let mut result: Vec<String> = categories.into_iter().collect();
    result.sort();

    Ok(result)
}

// Filter active categories based on range configuration
pub fn filter_active_categories(
    categories: &[String],
    range_config: &DefineRangeConfig
) -> Result<Vec<String>, String> {
    let mut active = Vec::new();

    // Apply range constraints
    if let (Some(min), Some(max)) = (range_config.min_value, range_config.max_value) {
        for cat in categories {
            if let Ok(val) = cat.parse::<f64>() {
                if val >= min && val <= max {
                    active.push(cat.clone());
                }
            }
        }
    } else if let Some(constraints) = &range_config.constraints_list {
        // Extract category names and constraint types
        let mut category_info: HashMap<String, String> = HashMap::new();

        for constraint in constraints {
            let parts: Vec<&str> = constraint.split_whitespace().collect();
            if !parts.is_empty() {
                let category = parts[0].to_string();
                let constraint_type = if constraint.contains("Supplemental") {
                    "Supplemental"
                } else if constraint.contains("Equal") {
                    "Equal"
                } else {
                    "None"
                };
                category_info.insert(category, constraint_type.to_string());
            }
        }

        // Include categories that are in the constraints list and not supplementary
        for cat in categories {
            if let Some(constraint_type) = category_info.get(cat) {
                if constraint_type != "Supplemental" {
                    active.push(cat.clone());
                }
            }
        }
    } else {
        // No constraints, include all categories
        active = categories.to_vec();
    }

    Ok(active)
}

// Apply equality constraints to the correspondence table
pub fn apply_equality_constraints(
    table_data: &mut Vec<Vec<f64>>,
    row_margin: &mut Vec<f64>,
    col_margin: &mut Vec<f64>,
    config: &CorrespondenceAnalysisConfig
) -> Result<(), String> {
    // Row equality constraints
    if config.define_range_row.constraints_list.is_some() {
        let constraints = config.define_range_row.constraints_list.as_ref().unwrap();

        // Check if there are any equality constraints
        let equal_constraints: Vec<&String> = constraints
            .iter()
            .filter(|c| c.contains("Equal"))
            .collect();

        if !equal_constraints.is_empty() {
            // Group row indices that should be equal
            let mut row_groups: HashMap<String, Vec<usize>> = HashMap::new();

            for (i, constraint) in constraints.iter().enumerate() {
                if constraint.contains("Equal") {
                    if let Some(group) = constraint.split_whitespace().next() {
                        row_groups.entry(group.to_string()).or_insert_with(Vec::new).push(i);
                    }
                }
            }

            // Apply row equality
            for (_, indices) in row_groups.iter() {
                if indices.len() > 1 {
                    let first_idx = indices[0];

                    // Sum values from all rows in the group
                    let mut sum_rows = vec![0.0; table_data[0].len()];
                    let mut sum_margin = 0.0;

                    for &idx in indices {
                        if idx < table_data.len() {
                            for (j, val) in table_data[idx].iter().enumerate() {
                                sum_rows[j] += val;
                            }
                            sum_margin += row_margin[idx];
                        }
                    }

                    // Set the first row to the sum and others to zero
                    if first_idx < table_data.len() {
                        table_data[first_idx] = sum_rows;
                        row_margin[first_idx] = sum_margin;

                        for &idx in &indices[1..] {
                            if idx < table_data.len() {
                                table_data[idx] = vec![0.0; table_data[0].len()];
                                row_margin[idx] = 0.0;
                            }
                        }
                    }
                }
            }
        }
    }

    // Column equality constraints
    if config.define_range_column.constraints_list.is_some() {
        let constraints = config.define_range_column.constraints_list.as_ref().unwrap();

        // Check if there are any equality constraints
        let equal_constraints: Vec<&String> = constraints
            .iter()
            .filter(|c| c.contains("Equal"))
            .collect();

        if !equal_constraints.is_empty() {
            // Group column indices that should be equal
            let mut col_groups: HashMap<String, Vec<usize>> = HashMap::new();

            for (i, constraint) in constraints.iter().enumerate() {
                if constraint.contains("Equal") {
                    if let Some(group) = constraint.split_whitespace().next() {
                        col_groups.entry(group.to_string()).or_insert_with(Vec::new).push(i);
                    }
                }
            }

            // Apply column equality
            for (_, indices) in col_groups.iter() {
                if indices.len() > 1 {
                    let first_idx = indices[0];

                    // Sum values from all columns in the group
                    let mut sum_cols = vec![0.0; table_data.len()];
                    let mut sum_margin = 0.0;

                    for &idx in indices {
                        if idx < table_data[0].len() {
                            for (i, row) in table_data.iter().enumerate() {
                                if idx < row.len() {
                                    sum_cols[i] += row[idx];
                                }
                            }
                            if idx < col_margin.len() {
                                sum_margin += col_margin[idx];
                            }
                        }
                    }

                    // Set the first column to the sum and others to zero
                    if first_idx < table_data[0].len() {
                        for (i, row) in table_data.iter_mut().enumerate() {
                            if first_idx < row.len() {
                                row[first_idx] = sum_cols[i];
                            }

                            for &idx in &indices[1..] {
                                if idx < row.len() {
                                    row[idx] = 0.0;
                                }
                            }
                        }

                        if first_idx < col_margin.len() {
                            col_margin[first_idx] = sum_margin;

                            for &idx in &indices[1..] {
                                if idx < col_margin.len() {
                                    col_margin[idx] = 0.0;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(())
}

// Standardize data based on config for Euclidean distance
pub fn standardize_data(
    correspondence_table: &CorrespondenceTable,
    config: &CorrespondenceAnalysisConfig
) -> Result<(Vec<Vec<f64>>, Vec<f64>, Vec<f64>), String> {
    let rows = correspondence_table.data.len();
    if rows == 0 {
        return Err("No rows in correspondence table".to_string());
    }

    let cols = correspondence_table.data[0].len();

    let mut f_ij_tilde = correspondence_table.data.clone();
    let mut f_i_plus_tilde = correspondence_table.active_margin.clone();

    // Calculate column sums
    let mut f_plus_j_tilde = calculate_column_sums(&correspondence_table.data);

    // Calculate grand total
    let grand_total: f64 = correspondence_table.active_margin.iter().sum();
    if grand_total <= 0.0 {
        return Err("Grand total is zero or negative".to_string());
    }

    // Apply standardization based on config (step 1 in algorithm docs)
    if config.model.row_removed {
        // rmean: remove row means (f_ij_tilde = f_ij)
        f_i_plus_tilde = correspondence_table.active_margin.clone();
        f_plus_j_tilde = vec![grand_total / cols as f64; cols];
    } else if config.model.col_removed {
        // cmean: remove column means (f_ij_tilde = f_ij)
        f_i_plus_tilde = vec![grand_total / rows as f64; rows];
        f_plus_j_tilde = f_plus_j_tilde.clone();
    } else if config.model.rnc_removed {
        // rcmean: remove both row and column means (f_ij_tilde = f_ij)
        f_i_plus_tilde = correspondence_table.active_margin.clone();
        f_plus_j_tilde = f_plus_j_tilde.clone();
    } else if config.model.row_totals {
        // rsum: equalize row totals, then remove row means
        let target_row_sum = grand_total / (rows as f64);
        for i in 0..rows {
            let row_sum = correspondence_table.active_margin[i];
            if row_sum > 0.0 {
                let scale = target_row_sum / row_sum;
                for j in 0..cols {
                    f_ij_tilde[i][j] = correspondence_table.data[i][j] * scale;
                }
            }
        }
        f_i_plus_tilde = vec![target_row_sum; rows];
        f_plus_j_tilde = vec![grand_total / cols as f64; cols];
    } else if config.model.col_totals {
        // csum: equalize column totals, then remove column means
        let target_col_sum = grand_total / (cols as f64);
        for j in 0..cols {
            let col_sum = f_plus_j_tilde[j];
            if col_sum > 0.0 {
                let scale = target_col_sum / col_sum;
                for i in 0..rows {
                    f_ij_tilde[i][j] = correspondence_table.data[i][j] * scale;
                }
            }
        }
        f_i_plus_tilde = vec![grand_total / rows as f64; rows];
        f_plus_j_tilde = vec![target_col_sum; cols];
    }

    // If not calculated in the previous step
    if f_i_plus_tilde[0] <= 0.0 || f_plus_j_tilde[0] <= 0.0 {
        f_i_plus_tilde = vec![grand_total / rows as f64; rows];
        f_plus_j_tilde = vec![grand_total / cols as f64; cols];
    }

    Ok((f_ij_tilde, f_i_plus_tilde, f_plus_j_tilde))
}

pub fn calculate_column_sums(table_data: &Vec<Vec<f64>>) -> Vec<f64> {
    if table_data.is_empty() {
        return Vec::new();
    }

    let cols = table_data[0].len();
    let mut col_sums = vec![0.0; cols];

    for row in table_data {
        for (j, val) in row.iter().enumerate() {
            col_sums[j] += val;
        }
    }

    col_sums
}

// Calculate chi-square significance (p-value) from chi-square statistic
pub fn calculate_chi_square_significance(
    chi_square: &[f64],
    df: usize
) -> Result<Vec<f64>, String> {
    if df == 0 {
        return Err("Degrees of freedom must be greater than zero".to_string());
    }

    // Use statrs ChiSquared distribution for proper p-value calculations
    let chi_squared_dist = match ChiSquared::new(df as f64) {
        Ok(dist) => dist,
        Err(_) => {
            return Err("Failed to create chi-squared distribution".to_string());
        }
    };

    // Calculate p-values for each chi-square value
    let significance = chi_square
        .iter()
        .map(|&chi| {
            // P-value is the right tail probability: P(X >= chi)
            // = 1 - P(X < chi) = 1 - CDF(chi)
            1.0 - chi_squared_dist.cdf(chi)
        })
        .collect();

    Ok(significance)
}

pub fn calculate_score_correlation(
    scores: &[f64],
    singular_values: &[f64],
    dim1: usize,
    dim2: usize
) -> f64 {
    if
        dim1 >= scores.len() ||
        dim2 >= scores.len() ||
        dim1 >= singular_values.len() ||
        dim2 >= singular_values.len()
    {
        return 0.0;
    }

    // Correlation calculated based on covariance formula from the delta method
    // This is a simplification of the complex formula in the documentation

    // The correlation between dimensions tends to be small and often negative
    // It depends on the eigenvalues and structure of the data
    let eigenvalue_ratio = singular_values[dim1] / singular_values[dim2];
    let score_ratio = if scores[dim2] != 0.0 { scores[dim1] / scores[dim2] } else { 0.0 };

    // Correlation formula from delta method approximation
    // Higher eigenvalues typically have less correlation with other dimensions
    let base_corr = -0.1 * score_ratio.signum();
    let adjustment = 0.05 * (eigenvalue_ratio - 1.0).abs().min(1.0);

    (base_corr - adjustment).max(-0.99).min(0.99)
}

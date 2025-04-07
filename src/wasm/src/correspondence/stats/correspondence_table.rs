use crate::correspondence::models::{
    config::CorrespondenceAnalysisConfig,
    data::{ AnalysisData, DataValue },
    result::CorrespondenceTable,
};

use super::core::{
    apply_equality_constraints,
    extract_data_for_variable,
    filter_active_categories,
    get_unique_categories,
};

// Create correspondence table from the input data and configuration
pub fn create_correspondence_table(
    data: &AnalysisData,
    config: &CorrespondenceAnalysisConfig
) -> Result<CorrespondenceTable, String> {
    // Extract row and column variables from configuration
    let row_var = config.main.row_target_var.as_ref().ok_or("Row target variable not specified")?;
    let col_var = config.main.col_target_var
        .as_ref()
        .ok_or("Column target variable not specified")?;

    // Find the datasets containing the target variables
    let row_data = extract_data_for_variable(data, row_var)?;
    let col_data = extract_data_for_variable(data, col_var)?;

    // Get unique row and column categories
    let row_categories = get_unique_categories(&row_data, row_var)?;
    let col_categories = get_unique_categories(&col_data, col_var)?;

    // Determine active and supplementary categories
    let active_row_cats = filter_active_categories(&row_categories, &config.define_range_row)?;
    let active_col_cats = filter_active_categories(&col_categories, &config.define_range_column)?;

    // Create correspondence table matrix
    let mut table_data: Vec<Vec<f64>> =
        vec![vec![0.0; active_col_cats.len()]; active_row_cats.len()];
    let mut active_margin_row: Vec<f64> = vec![0.0; active_row_cats.len()];
    let mut active_margin_col: Vec<f64> = vec![0.0; active_col_cats.len()];

    // Fill the table with data counts
    for dataset in &data.row_data {
        for records in dataset {
            let row_value = match records.values.get(row_var) {
                Some(DataValue::Text(s)) => s.clone(),
                Some(DataValue::Number(n)) => n.to_string(),
                _ => {
                    continue;
                }
            };

            let col_value = match records.values.get(col_var) {
                Some(DataValue::Text(s)) => s.clone(),
                Some(DataValue::Number(n)) => n.to_string(),
                _ => {
                    continue;
                }
            };

            // Find indices in the active categories
            if
                let (Some(row_idx), Some(col_idx)) = (
                    active_row_cats.iter().position(|c| c == &row_value),
                    active_col_cats.iter().position(|c| c == &col_value),
                )
            {
                table_data[row_idx][col_idx] += 1.0;
                active_margin_row[row_idx] += 1.0;
                active_margin_col[col_idx] += 1.0;
            }
        }
    }

    // Apply equality constraints if specified
    apply_equality_constraints(
        &mut table_data,
        &mut active_margin_row,
        &mut active_margin_col,
        config
    )?;

    Ok(CorrespondenceTable {
        data: table_data,
        active_margin: active_margin_row,
    })
}

use nalgebra::{ DMatrix, SVD };
use statrs::distribution::{ ChiSquared, ContinuousCDF, FisherSnedecor };
use std::collections::HashMap;
use crate::discriminant::models::{ AnalysisData, DataRecord, DataValue, DiscriminantConfig };

// AnalyzedDataset struct to consolidate extracted data
#[derive(Debug, Clone)]
pub struct AnalyzedDataset {
    pub group_data: HashMap<String, HashMap<String, Vec<f64>>>,
    pub group_labels: Vec<String>,
    pub group_means: HashMap<String, HashMap<String, f64>>,
    pub overall_means: HashMap<String, f64>,
    pub num_groups: usize,
    pub total_cases: usize,
}

// Consolidated grouped data extraction with caching
pub fn extract_analyzed_dataset(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<AnalyzedDataset, String> {
    let independent_variables = &config.main.independent_variables;
    let grouping_variable = &config.main.grouping_variable;
    let min_range = config.define_range.min_range;
    let max_range = config.define_range.max_range;

    // Extract grouped data
    let (group_data, group_labels, total_cases) = extract_grouped_data(
        data,
        grouping_variable,
        independent_variables,
        min_range,
        max_range
    )?;

    let num_groups = group_labels.len();

    // Calculate group and overall means
    let group_means = calculate_group_means(&group_data, &group_labels, independent_variables);
    let overall_means = calculate_overall_means(&group_data, &group_labels, independent_variables);

    Ok(AnalyzedDataset {
        group_data,
        group_labels,
        group_means,
        overall_means,
        num_groups,
        total_cases,
    })
}

// Extract grouped data from analysis data
pub fn extract_grouped_data(
    data: &AnalysisData,
    grouping_variable: &str,
    independent_variables: &[String],
    min_range: Option<f64>,
    max_range: Option<f64>
) -> Result<(HashMap<String, HashMap<String, Vec<f64>>>, Vec<String>, usize), String> {
    let mut group_mappings: HashMap<String, Vec<usize>> = HashMap::new();

    // Extract group data with range checking
    for (i, record) in data.group_data.iter().flatten().enumerate() {
        if let Some(value) = record.values.get(grouping_variable) {
            let group_label = match value {
                DataValue::Number(num) => {
                    // Check if value is within range
                    if
                        min_range.map_or(true, |min| *num >= min) &&
                        max_range.map_or(true, |max| *num <= max)
                    {
                        num.to_string()
                    } else {
                        continue;
                    }
                }
                DataValue::Text(text) => text.clone(),
                _ => {
                    continue;
                }
            };

            group_mappings.entry(group_label).or_default().push(i);
        }
    }

    // Sort group labels for consistent processing
    let mut group_labels: Vec<String> = group_mappings.keys().cloned().collect();
    group_labels.sort();

    // Extract values for each variable by group
    let mut variable_values: HashMap<String, HashMap<String, Vec<f64>>> = HashMap::new();
    let mut total_cases = 0;

    for var_name in independent_variables {
        let mut group_values: HashMap<String, Vec<f64>> = HashMap::new();

        // Find this variable in independent_data
        if
            let Some((var_idx, _)) = data.independent_data
                .iter()
                .enumerate()
                .find(
                    |(idx, _)|
                        *idx < independent_variables.len() &&
                        &independent_variables[*idx] == var_name
                )
        {
            let var_data = &data.independent_data[var_idx];

            for group_label in &group_labels {
                let values = if let Some(indices) = group_mappings.get(group_label) {
                    indices
                        .iter()
                        .filter_map(|&idx| {
                            if idx < var_data.len() {
                                if
                                    let Some(DataValue::Number(val)) =
                                        var_data[idx].values.get(var_name)
                                {
                                    return Some(*val);
                                }
                            }
                            None
                        })
                        .collect()
                } else {
                    Vec::new()
                };

                group_values.insert(group_label.clone(), values);
            }
        }

        // Count total valid cases for the first variable
        if var_name == &independent_variables[0] {
            total_cases = group_values
                .values()
                .map(|v| v.len())
                .sum();
        }

        variable_values.insert(var_name.clone(), group_values);
    }

    Ok((variable_values, group_labels, total_cases))
}

// Calculate group means for all variables
pub fn calculate_group_means(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    variables: &[String]
) -> HashMap<String, HashMap<String, f64>> {
    let mut group_means = HashMap::new();

    for group_label in group_labels {
        let mut means = HashMap::new();

        for var_name in variables {
            let mean = group_data
                .get(var_name)
                .and_then(|g| g.get(group_label))
                .filter(|values| !values.is_empty())
                .map_or(0.0, |values| calculate_mean(values));

            means.insert(var_name.clone(), mean);
        }

        group_means.insert(group_label.clone(), means);
    }

    group_means
}

// Calculate overall means for all variables
pub fn calculate_overall_means(
    group_data: &HashMap<String, HashMap<String, Vec<f64>>>,
    group_labels: &[String],
    variables: &[String]
) -> HashMap<String, f64> {
    let mut overall_means = HashMap::new();

    for var_name in variables {
        let mut all_values = Vec::new();

        for group_label in group_labels {
            if let Some(values) = group_data.get(var_name).and_then(|g| g.get(group_label)) {
                all_values.extend(values);
            }
        }

        let mean = if !all_values.is_empty() { calculate_mean(&all_values) } else { 0.0 };

        overall_means.insert(var_name.clone(), mean);
    }

    overall_means
}

// Extract numeric values from DataRecord by field name
pub fn extract_values_by_name(records: &[DataRecord], field_name: &str) -> Vec<f64> {
    records
        .iter()
        .filter_map(|record| {
            if let Some(DataValue::Number(value)) = record.values.get(field_name) {
                Some(*value)
            } else {
                None
            }
        })
        .collect()
}

// Extract values from a specific variable index from group data
pub fn extract_values_by_index(
    group_data: &[Vec<DataRecord>],
    var_idx: usize,
    variables: &[String]
) -> Vec<f64> {
    if var_idx >= variables.len() {
        return Vec::new();
    }

    let var_name = &variables[var_idx];

    group_data
        .iter()
        .flat_map(|group| extract_values_by_name(group, var_name))
        .collect()
}

// Extract all variable values for a specific group
pub fn extract_group_values(
    group: &[DataRecord],
    var_idx: usize,
    variables: &[String]
) -> Vec<f64> {
    if var_idx >= variables.len() {
        return Vec::new();
    }

    let var_name = &variables[var_idx];
    extract_values_by_name(group, var_name)
}

// Extract all variable values from a single case
pub fn extract_case_values(record: &DataRecord, variables: &[String]) -> Vec<f64> {
    variables
        .iter()
        .filter_map(|var_name| {
            if let Some(DataValue::Number(value)) = record.values.get(var_name) {
                Some(*value)
            } else {
                None
            }
        })
        .collect()
}

// Calculate mean of values
pub fn calculate_mean(values: &[f64]) -> f64 {
    if values.is_empty() {
        return 0.0;
    }
    values.iter().sum::<f64>() / (values.len() as f64)
}

// Calculate variance with optional pre-calculated mean
pub fn calculate_variance(values: &[f64], mean: Option<f64>) -> f64 {
    if values.len() <= 1 {
        return 0.0;
    }

    let mean_val = mean.unwrap_or_else(|| calculate_mean(values));
    values
        .iter()
        .map(|&v| (v - mean_val).powi(2))
        .sum::<f64>() / ((values.len() - 1) as f64)
}

// Calculate standard deviation with optional pre-calculated mean
pub fn calculate_std_dev(values: &[f64], mean: Option<f64>) -> f64 {
    calculate_variance(values, mean).sqrt()
}

// Calculate covariance between two sets of values
pub fn calculate_covariance(
    values1: &[f64],
    values2: &[f64],
    mean1: Option<f64>,
    mean2: Option<f64>
) -> f64 {
    if values1.len() <= 1 || values1.len() != values2.len() {
        return 0.0;
    }

    let mean1_val = mean1.unwrap_or_else(|| calculate_mean(values1));
    let mean2_val = mean2.unwrap_or_else(|| calculate_mean(values2));

    values1
        .iter()
        .zip(values2.iter())
        .map(|(&v1, &v2)| (v1 - mean1_val) * (v2 - mean2_val))
        .sum::<f64>() / ((values1.len() - 1) as f64)
}

// Calculate correlation coefficient
pub fn calculate_correlation(values1: &[f64], values2: &[f64]) -> f64 {
    if values1.len() <= 1 || values1.len() != values2.len() {
        return 0.0;
    }

    let mean1 = calculate_mean(values1);
    let mean2 = calculate_mean(values2);

    let std_dev1 = calculate_std_dev(values1, Some(mean1));
    let std_dev2 = calculate_std_dev(values2, Some(mean2));

    if std_dev1 <= 0.0 || std_dev2 <= 0.0 {
        return 0.0;
    }

    calculate_covariance(values1, values2, Some(mean1), Some(mean2)) / (std_dev1 * std_dev2)
}

// Calculate log determinant of a matrix
pub fn calculate_log_determinant(matrix: &DMatrix<f64>) -> f64 {
    let svd = SVD::new(matrix.clone(), false, false);

    svd.singular_values
        .iter()
        .filter(|&v| *v > 1e-10)
        .map(|v| v.ln())
        .sum()
}

// Calculate rank and log determinant of a matrix
pub fn calculate_rank_and_log_det(matrix: &DMatrix<f64>) -> (i32, f64) {
    let svd = SVD::new(matrix.clone(), false, false);
    let singular_values = &svd.singular_values;

    let max_val = singular_values.iter().fold(0.0, |max, &v| (max as f64).max(v));
    let epsilon = 1e-10 * max_val;

    let rank = singular_values
        .iter()
        .filter(|&v| *v > epsilon)
        .count() as i32;
    let log_det = singular_values
        .iter()
        .filter(|&v| *v > epsilon)
        .map(|v| v.ln())
        .sum();

    (rank, log_det)
}

// Calculate p-value from F statistic
pub fn calculate_p_value_from_f(f_value: f64, df1: f64, df2: f64) -> f64 {
    if f_value <= 0.0 || df1 <= 0.0 || df2 <= 0.0 {
        return 1.0;
    }

    match FisherSnedecor::new(df1, df2) {
        Ok(dist) => dist.sf(f_value),
        Err(_) => 1.0,
    }
}

// Calculate p-value from chi-square statistic
pub fn calculate_p_value_from_chi_square(chi_square: f64, df: usize) -> f64 {
    if chi_square <= 0.0 || df == 0 {
        return 1.0;
    }

    match ChiSquared::new(df as f64) {
        Ok(dist) => dist.sf(chi_square),
        Err(_) => 1.0,
    }
}

// Filter valid cases based on config
pub fn filter_valid_cases(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<AnalysisData, String> {
    web_sys::console::log_1(&"Executing filter_valid_cases".into());

    let group_var = &config.main.grouping_variable;
    let independent_vars = &config.main.independent_variables;
    let min_range = config.define_range.min_range;
    let max_range = config.define_range.max_range;

    // Track valid indices for each group
    let mut valid_indices: Vec<Vec<usize>> = Vec::new();

    // Initialize with all indices
    for group in &data.group_data {
        valid_indices.push((0..group.len()).collect());
    }

    // Step 1: Apply selection filter if applicable
    if
        let (Some(selection_data), Some(selection_var), Some(set_value)) = (
            &data.selection_data,
            &config.main.selection_variable,
            &config.set_value.value,
        )
    {
        for (group_idx, sel_group) in selection_data.iter().enumerate() {
            if group_idx < valid_indices.len() {
                // Filter valid indices based on selection criteria
                valid_indices[group_idx] = valid_indices[group_idx]
                    .iter()
                    .filter(|&&idx| {
                        if idx < sel_group.len() {
                            match sel_group[idx].values.get(selection_var) {
                                Some(DataValue::Number(val)) => (val - set_value).abs() < 1e-10,
                                Some(DataValue::Text(s)) => s == &set_value.to_string(),
                                _ => false,
                            }
                        } else {
                            false
                        }
                    })
                    .copied()
                    .collect();
            }
        }
    }

    // Step 2: Apply group range filter
    for (group_idx, group) in data.group_data.iter().enumerate() {
        if group_idx < valid_indices.len() {
            // Filter valid indices based on group range
            valid_indices[group_idx] = valid_indices[group_idx]
                .iter()
                .filter(|&&idx| {
                    if idx < group.len() {
                        match group[idx].values.get(group_var) {
                            Some(DataValue::Number(val)) => {
                                let min_valid = min_range.map_or(true, |min| val >= &min);
                                let max_valid = max_range.map_or(true, |max| val <= &max);
                                min_valid && max_valid
                            }
                            Some(DataValue::Text(_)) => true, // Text values valid for groups
                            _ => false,
                        }
                    } else {
                        false
                    }
                })
                .copied()
                .collect();
        }
    }

    // Step 3: Apply independent variables filter (check for missing values)
    for (group_idx, _) in data.group_data.iter().enumerate() {
        if group_idx < valid_indices.len() {
            // Filter valid indices based on missing independent vars
            valid_indices[group_idx] = valid_indices[group_idx]
                .iter()
                .filter(|&&idx| {
                    // Check if all independent variables have valid values
                    !independent_vars.iter().any(|var_name| {
                        let var_idx = independent_vars.iter().position(|v| v == var_name);

                        match var_idx {
                            Some(var_idx) if var_idx < data.independent_data.len() => {
                                let var_data = &data.independent_data[var_idx];
                                if idx >= var_data.len() {
                                    return true;
                                }

                                match var_data[idx].values.get(var_name) {
                                    Some(DataValue::Number(val)) if val.is_nan() => true,
                                    Some(DataValue::Text(s)) if s.trim().is_empty() => true,
                                    Some(DataValue::Null) => true,
                                    None => true,
                                    _ => false,
                                }
                            }
                            _ => true,
                        }
                    })
                })
                .copied()
                .collect();
        }
    }

    // Now use the filtered valid_indices to construct the final datasets
    let mut filtered_group_data = Vec::new();

    // Filter group_data
    for (group_idx, group) in data.group_data.iter().enumerate() {
        if group_idx < valid_indices.len() {
            let filtered_group = valid_indices[group_idx]
                .iter()
                .filter_map(|&idx| {
                    if idx < group.len() { Some(group[idx].clone()) } else { None }
                })
                .collect();

            filtered_group_data.push(filtered_group);
        } else {
            filtered_group_data.push(Vec::new());
        }
    }

    // Filter independent_data
    let mut filtered_independent_data = Vec::new();

    for var_idx in 0..data.independent_data.len() {
        let mut filtered_var_data = Vec::new();

        for (group_idx, group_valid_indices) in valid_indices.iter().enumerate() {
            for &idx in group_valid_indices {
                if idx < data.independent_data[var_idx].len() {
                    filtered_var_data.push(data.independent_data[var_idx][idx].clone());
                }
            }
        }

        filtered_independent_data.push(filtered_var_data);
    }

    // Filter selection_data if applicable
    let filtered_selection_data = match &data.selection_data {
        Some(selection_data) => {
            let mut filtered = Vec::new();

            for (group_idx, sel_group) in selection_data.iter().enumerate() {
                if group_idx < valid_indices.len() {
                    let filtered_sel_group = valid_indices[group_idx]
                        .iter()
                        .filter_map(|&idx| {
                            if idx < sel_group.len() { Some(sel_group[idx].clone()) } else { None }
                        })
                        .collect();

                    filtered.push(filtered_sel_group);
                } else {
                    filtered.push(Vec::new());
                }
            }

            Some(filtered)
        }
        None => None,
    };

    Ok(AnalysisData {
        group_data: filtered_group_data,
        independent_data: filtered_independent_data,
        selection_data: filtered_selection_data,
        group_data_defs: data.group_data_defs.clone(),
        independent_data_defs: data.independent_data_defs.clone(),
        selection_data_defs: data.selection_data_defs.clone(),
    })
}

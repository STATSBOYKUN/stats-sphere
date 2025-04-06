use crate::factor::models::{
    config::{ FactorAnalysisConfig, ExtractionMethod },
    data::{ DataRecord, DataValue, VariableDefinition, AnalysisData },
    result::{
        FactorAnalysisResult,
        DescriptiveStatistic,
        ScreePlot,
        CorrelationMatrix,
        InverseCorrelationMatrix,
        KMOBartlettsTest,
        AntiImageMatrices,
        Communalities,
        TotalVarianceExplained,
        ComponentMatrix,
        ReproducedCorrelations,
        RotatedComponentMatrix,
        ComponentTransformationMatrix,
        ComponentScoreCoefficientMatrix,
        ComponentScoreCovarianceMatrix,
        TotalVarianceComponent,
    },
};
use std::collections::HashMap;
use nalgebra::{ DMatrix, DVector, SymmetricEigen };
use std::f64::consts::PI;

// Extract data matrix from AnalysisData
pub fn extract_data_matrix(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<(DMatrix<f64>, Vec<String>), String> {
    // Get the target variables
    let var_names = if let Some(vars) = &config.main.target_var {
        // If specific variables are provided, use them
        let var_defs = if !data.target_data_defs.is_empty() && !data.target_data_defs[0].is_empty() {
            &data.target_data_defs[0]
        } else {
            return Err("No variable definitions found".to_string());
        };

        // Map variable names (might be index-based in configs)
        vars.iter()
            .map(|v| {
                if let Ok(idx) = v.parse::<usize>() {
                    if idx < var_defs.len() { var_defs[idx].name.clone() } else { v.clone() }
                } else {
                    v.clone()
                }
            })
            .collect::<Vec<String>>()
    } else {
        // Collect all numeric variables from all datasets
        data.target_data
            .iter()
            .flat_map(|dataset| {
                dataset.iter().flat_map(|record| {
                    record.values
                        .iter()
                        .filter(|(_, value)| matches!(value, DataValue::Number(_)))
                        .map(|(key, _)| key.clone())
                })
            })
            .collect::<std::collections::HashSet<String>>()
            .into_iter()
            .collect::<Vec<String>>()
    };

    if var_names.is_empty() {
        return Err("No valid variables found".to_string());
    }

    // Process all records from all datasets
    // Get max number of cases across all datasets
    let num_cases = data.target_data
        .iter()
        .map(|dataset| dataset.len())
        .max()
        .unwrap_or(0);

    if num_cases == 0 {
        return Err("No data records found".to_string());
    }

    // Prepare to collect data for each case
    let mut collected_records: Vec<HashMap<String, DataValue>> = vec![HashMap::new(); num_cases];

    // For each dataset, collect values for all variables
    for dataset in &data.target_data {
        for (case_idx, record) in dataset.iter().enumerate() {
            if case_idx < num_cases {
                // Merge this record's values into the case's collection
                for (var_name, value) in &record.values {
                    collected_records[case_idx].insert(var_name.clone(), value.clone());
                }
            }
        }
    }

    // Convert to DataRecords
    let records: Vec<DataRecord> = collected_records
        .into_iter()
        .map(|values| DataRecord { values })
        .collect();

    // Apply filtering based on value_target and selection if specified
    let filtered_records = if let Some(value_target) = &config.main.value_target {
        if let Some(selection) = &config.value.selection {
            // Both value_target and selection are specified
            if !data.value_target_data.is_empty() {
                // Prepare to match each case with its value target
                let mut filtered = Vec::new();

                // For each case, check if the value target matches the selection
                for (case_idx, record) in records.iter().enumerate() {
                    let mut matches_selection = false;

                    // Check across all value target datasets
                    for value_dataset in &data.value_target_data {
                        if case_idx < value_dataset.len() {
                            let value_record = &value_dataset[case_idx];

                            match value_record.values.get(value_target) {
                                Some(DataValue::Text(text)) => {
                                    if text.as_str() == selection.as_str() {
                                        matches_selection = true;
                                        break;
                                    }
                                }
                                Some(DataValue::Number(num)) => {
                                    if num.to_string() == *selection {
                                        matches_selection = true;
                                        break;
                                    }
                                }
                                _ => {}
                            }
                        }
                    }

                    if matches_selection {
                        filtered.push(record.clone());
                    }
                }

                filtered
            } else {
                // Value target data is not available, use all records
                records.clone()
            }
        } else {
            // No selection specified, use all records
            records.clone()
        }
    } else {
        // No value_target specified, use all records
        records.clone()
    };

    if filtered_records.is_empty() {
        return Err("No valid records after filtering".to_string());
    }

    // Count valid records based on options
    let mut valid_records: Vec<Vec<f64>> = Vec::new();

    for record in &filtered_records {
        let mut row = Vec::new();
        let mut has_missing = false;

        for var_name in &var_names {
            match record.values.get(var_name) {
                Some(DataValue::Number(value)) => row.push(*value),
                _ => {
                    has_missing = true;
                    if config.options.replace_mean {
                        row.push(f64::NAN); // Will replace with mean later
                    } else {
                        break; // Skip this record
                    }
                }
            }
        }

        if !has_missing || (has_missing && !config.options.exclude_list_wise) {
            if row.len() == var_names.len() {
                valid_records.push(row);
            }
        }
    }

    if valid_records.is_empty() {
        return Err("No valid records after filtering".to_string());
    }

    // Replace NaN with means if requested
    if config.options.replace_mean {
        replace_missing_with_means(&mut valid_records);
    }

    // Convert to DMatrix
    let n_rows = valid_records.len();
    let n_cols = var_names.len();
    let mut data_matrix = DMatrix::zeros(n_rows, n_cols);

    for i in 0..n_rows {
        for j in 0..n_cols {
            data_matrix[(i, j)] = valid_records[i][j];
        }
    }

    Ok((data_matrix, var_names))
}

// Replace missing values (NaN) with column means
pub fn replace_missing_with_means(data: &mut Vec<Vec<f64>>) {
    if data.is_empty() {
        return;
    }

    let n_cols = data[0].len();
    let mut means = vec![0.0; n_cols];
    let mut counts = vec![0; n_cols];

    // Calculate means
    for row in data.iter() {
        for (j, &val) in row.iter().enumerate() {
            if !val.is_nan() {
                means[j] += val;
                counts[j] += 1;
            }
        }
    }

    for j in 0..n_cols {
        if counts[j] > 0 {
            means[j] /= counts[j] as f64;
        }
    }

    // Replace missing values
    for row in data.iter_mut() {
        for j in 0..n_cols {
            if row[j].is_nan() {
                row[j] = means[j];
            }
        }
    }
}

// Calculate correlation or covariance matrix
pub fn calculate_matrix(
    data_matrix: &DMatrix<f64>,
    matrix_type: &str
) -> Result<DMatrix<f64>, String> {
    let n_rows = data_matrix.nrows();
    let n_cols = data_matrix.ncols();

    if n_rows < 2 {
        return Err("Not enough data to calculate matrix".to_string());
    }

    // Calculate column means
    let mut means = DVector::zeros(n_cols);
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += data_matrix[(i, j)];
        }
        means[j] = sum / (n_rows as f64);
    }

    // Calculate standard deviations for correlation matrix
    let mut std_devs = DVector::zeros(n_cols);
    if matrix_type == "correlation" {
        for j in 0..n_cols {
            let mut sum_sq = 0.0;
            for i in 0..n_rows {
                sum_sq += (data_matrix[(i, j)] - means[j]).powi(2);
            }
            std_devs[j] = (sum_sq / ((n_rows - 1) as f64)).sqrt();
        }
    }

    // Calculate matrix
    let mut result = DMatrix::zeros(n_cols, n_cols);
    for i in 0..n_cols {
        for j in 0..n_cols {
            let mut sum_product = 0.0;
            for k in 0..n_rows {
                sum_product += (data_matrix[(k, i)] - means[i]) * (data_matrix[(k, j)] - means[j]);
            }

            if matrix_type == "correlation" {
                result[(i, j)] = sum_product / (((n_rows - 1) as f64) * std_devs[i] * std_devs[j]);
            } else {
                result[(i, j)] = sum_product / ((n_rows - 1) as f64);
            }
        }
    }

    Ok(result)
}

// Calculate descriptive statistics
pub fn calculate_descriptive_statistics(
    data_matrix: &DMatrix<f64>,
    var_names: &[String]
) -> Vec<DescriptiveStatistic> {
    let n_rows = data_matrix.nrows();
    let n_cols = data_matrix.ncols();
    let mut stats = Vec::with_capacity(n_cols);

    for j in 0..n_cols {
        let mut sum = 0.0;
        let mut sum_sq = 0.0;

        for i in 0..n_rows {
            let val = data_matrix[(i, j)];
            sum += val;
            sum_sq += val.powi(2);
        }

        let mean = sum / (n_rows as f64);
        let variance = (sum_sq - sum.powi(2) / (n_rows as f64)) / ((n_rows - 1) as f64);
        let std_dev = variance.sqrt();

        stats.push(DescriptiveStatistic {
            variable: var_names[j].clone(),
            mean,
            std_deviation: std_dev,
            analysis_n: n_rows,
        });
    }

    stats
}

// Create correlation matrix for results
pub fn create_correlation_matrix(matrix: &DMatrix<f64>, var_names: &[String]) -> CorrelationMatrix {
    let n_vars = matrix.nrows();
    let mut correlations = HashMap::new();
    let mut sig_values = HashMap::new();

    for i in 0..n_vars {
        let var_name = &var_names[i];
        let mut var_correlations = HashMap::new();
        let mut var_sig_values = HashMap::new();

        for j in 0..n_vars {
            let other_var = &var_names[j];
            var_correlations.insert(other_var.clone(), matrix[(i, j)]);

            // Calculate significance (p-value)
            let p_value = if i == j {
                0.0
            } else {
                // Fisher's z-transformation for correlation significance
                let n = matrix.nrows();
                let r = matrix[(i, j)];
                let z = 0.5 * ((1.0 + r) / (1.0 - r)).ln();
                let se = 1.0 / ((n - 3) as f64).sqrt();
                let t = z / se;

                // Two-tailed p-value approximation using t distribution with n-2 degrees of freedom
                let df = n - 2;
                let x = (df as f64) / ((df as f64) + t * t);
                let beta = 0.5 * incomplete_beta(0.5 * (df as f64), 0.5, x);
                2.0 * beta
            };

            var_sig_values.insert(other_var.clone(), p_value);
        }

        correlations.insert(var_name.clone(), var_correlations);
        sig_values.insert(var_name.clone(), var_sig_values);
    }

    CorrelationMatrix {
        correlations,
        sig_values,
    }
}

// Create inverse correlation matrix for results
pub fn create_inverse_correlation_matrix(
    inverse: &DMatrix<f64>,
    var_names: &[String]
) -> InverseCorrelationMatrix {
    let n_vars = inverse.nrows();
    let mut inverse_correlations = HashMap::new();

    for i in 0..n_vars {
        let var_name = &var_names[i];
        let mut var_inverse = HashMap::new();

        for j in 0..n_vars {
            let other_var = &var_names[j];
            var_inverse.insert(other_var.clone(), inverse[(i, j)]);
        }

        inverse_correlations.insert(var_name.clone(), var_inverse);
    }

    InverseCorrelationMatrix {
        inverse_correlations,
    }
}

// Calculate KMO and Bartlett's test
pub fn calculate_kmo_bartletts_test(
    correlation_matrix: &DMatrix<f64>,
    data_matrix: &DMatrix<f64>
) -> KMOBartlettsTest {
    let n_vars = correlation_matrix.nrows();
    let n_obs = data_matrix.nrows();

    // Calculate inverse of correlation matrix
    let inverse = match correlation_matrix.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // If matrix is singular, return default values
            return KMOBartlettsTest {
                kaiser_meyer_olkin: 0.0,
                bartletts_test_chi_square: 0.0,
                df: (n_vars * (n_vars - 1)) / 2,
                significance: 1.0,
            };
        }
    };

    // Calculate anti-image correlation matrix
    let mut anti_image_corr = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        for j in 0..n_vars {
            if i == j {
                anti_image_corr[(i, j)] = 1.0;
            } else {
                anti_image_corr[(i, j)] =
                    -inverse[(i, j)] / (inverse[(i, i)] * inverse[(j, j)]).sqrt();
            }
        }
    }

    // Calculate individual KMO measures
    let mut kmo_measures = vec![0.0; n_vars];
    for i in 0..n_vars {
        let mut sum_squared_correlation = 0.0;
        let mut sum_squared_partial = 0.0;

        for j in 0..n_vars {
            if i != j {
                sum_squared_correlation += correlation_matrix[(i, j)].powi(2);
                sum_squared_partial += anti_image_corr[(i, j)].powi(2);
            }
        }

        if sum_squared_correlation + sum_squared_partial > 0.0 {
            kmo_measures[i] =
                sum_squared_correlation / (sum_squared_correlation + sum_squared_partial);
        }
    }

    // Calculate overall KMO
    let mut sum_squared_correlation = 0.0;
    let mut sum_squared_partial = 0.0;

    for i in 0..n_vars {
        for j in 0..n_vars {
            if i != j {
                sum_squared_correlation += correlation_matrix[(i, j)].powi(2);
                sum_squared_partial += anti_image_corr[(i, j)].powi(2);
            }
        }
    }

    let kmo = sum_squared_correlation / (sum_squared_correlation + sum_squared_partial);

    // Calculate Bartlett's test of sphericity
    let determinant = match correlation_matrix.determinant() {
        det if det > 0.0 => det,
        _ => 1e-10, // Avoid log of zero or negative
    };

    let chi_square =
        -((n_obs as f64) - 1.0 - (2.0 * (n_vars as f64) + 5.0) / 6.0) * determinant.ln();
    let df = (n_vars * (n_vars - 1)) / 2;

    // Calculate significance (p-value) using chi-square distribution
    let significance = chi_square_cdf(chi_square, df as f64);

    KMOBartlettsTest {
        kaiser_meyer_olkin: kmo,
        bartletts_test_chi_square: chi_square,
        df,
        significance: 1.0 - significance,
    }
}

// Calculate anti-image matrices
pub fn calculate_anti_image_matrices(
    inverse: &DMatrix<f64>,
    var_names: &[String]
) -> AntiImageMatrices {
    let n_vars = inverse.nrows();
    let mut anti_image_covariance = HashMap::new();
    let mut anti_image_correlation = HashMap::new();

    for i in 0..n_vars {
        let var_name = &var_names[i];
        let mut var_cov = HashMap::new();
        let mut var_corr = HashMap::new();

        for j in 0..n_vars {
            let other_var = &var_names[j];

            // Anti-image covariance: -partial covariances (negative of off-diagonal elements of inverse)
            let cov_value = if i == j {
                1.0 / inverse[(i, j)]
            } else {
                -inverse[(i, j)] / (inverse[(i, i)] * inverse[(j, j)])
            };

            var_cov.insert(other_var.clone(), cov_value);

            // Anti-image correlation: partial correlations with sign reversed
            let corr_value = if i == j {
                1.0
            } else {
                -inverse[(i, j)] / (inverse[(i, i)] * inverse[(j, j)]).sqrt()
            };

            var_corr.insert(other_var.clone(), corr_value);
        }

        anti_image_covariance.insert(var_name.clone(), var_cov);
        anti_image_correlation.insert(var_name.clone(), var_corr);
    }

    AntiImageMatrices {
        anti_image_covariance,
        anti_image_correlation,
    }
}

// Structure to hold extraction results
pub struct ExtractionResult {
    pub loadings: DMatrix<f64>,
    pub eigenvalues: Vec<f64>,
    pub communalities: Vec<f64>,
    pub explained_variance: Vec<f64>,
    pub cumulative_variance: Vec<f64>,
    pub n_factors: usize,
    pub var_names: Vec<String>,
}

// Extract factors using specified method
pub fn extract_factors(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    match config.extraction.method {
        ExtractionMethod::PrincipalComponents =>
            extract_principal_components(matrix, config, var_names),
        ExtractionMethod::UnweightedLeastSquares =>
            extract_unweighted_least_squares(matrix, config, var_names),
        ExtractionMethod::GeneralizedLeastSquares =>
            extract_generalized_least_squares(matrix, config, var_names),
        ExtractionMethod::MaximumLikelihood =>
            extract_maximum_likelihood(matrix, config, var_names),
        ExtractionMethod::PrincipalAxisFactoring =>
            extract_principal_axis_factoring(matrix, config, var_names),
        ExtractionMethod::AlphaFactoring => extract_alpha_factoring(matrix, config, var_names),
        ExtractionMethod::ImageFactoring => extract_image_factoring(matrix, config, var_names),
    }
}

// Principal Components Analysis extraction
pub fn extract_principal_components(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Perform eigenvalue decomposition
    let eigen = matrix.clone().symmetric_eigen();
    let mut eigenvalues = Vec::with_capacity(n_vars);
    let mut eigenvectors = DMatrix::zeros(n_vars, n_vars);

    // Sort eigenvalues and eigenvectors in descending order
    let mut indices: Vec<usize> = (0..n_vars).collect();
    indices.sort_by(|&i, &j|
        eigen.eigenvalues[j].partial_cmp(&eigen.eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    for i in 0..n_vars {
        eigenvalues.push(eigen.eigenvalues[indices[i]]);
        for j in 0..n_vars {
            eigenvectors[(j, i)] = eigen.eigenvectors[(j, indices[i])];
        }
    }

    // Determine number of factors to retain
    let n_factors = determine_factors_to_retain(&eigenvalues, config);

    if n_factors == 0 {
        return Err("No factors meet the retention criteria".to_string());
    }

    // Calculate loadings matrix (Lambda_m = Omega_m * Gamma_m^(1/2))
    let mut loadings = DMatrix::zeros(n_vars, n_factors);
    for i in 0..n_vars {
        for j in 0..n_factors {
            loadings[(i, j)] = eigenvectors[(i, j)] * eigenvalues[j].sqrt();
        }
    }

    // Calculate communalities (h_i = sum(|gamma_j| * omega_ij^2))
    let mut communalities = vec![0.0; n_vars];
    for i in 0..n_vars {
        for j in 0..n_factors {
            communalities[i] += eigenvalues[j].abs() * eigenvectors[(i, j)].powi(2);
        }
    }

    // Calculate explained variance
    let total_variance: f64 = eigenvalues.iter().sum();
    let explained_variance: Vec<f64> = eigenvalues
        .iter()
        .take(n_factors)
        .map(|&val| (val / total_variance) * 100.0)
        .collect();

    // Calculate cumulative variance
    let mut cumulative_variance = vec![0.0; n_factors];
    let mut cum_sum = 0.0;
    for (i, &var) in explained_variance.iter().enumerate() {
        cum_sum += var;
        cumulative_variance[i] = cum_sum;
    }

    Ok(ExtractionResult {
        loadings,
        eigenvalues: eigenvalues.into_iter().take(n_factors).collect(),
        communalities,
        explained_variance,
        cumulative_variance,
        n_factors,
        var_names: var_names.to_vec(),
    })
}

// Only adding the adapter functions that don't already exist

// filter_valid_cases - New function to filter data based on configuration
pub fn filter_valid_cases(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<AnalysisData, String> {
    // Extract the data matrix to validate the data
    let (_, _) = extract_data_matrix(data, config)?;

    // Return filtered data
    Ok(AnalysisData {
        target_data: data.target_data.clone(),
        value_target_data: data.value_target_data.clone(),
        target_data_defs: data.target_data_defs.clone(),
        value_target_data_defs: data.value_target_data_defs.clone(),
    })
}

// calculate_correlation_matrix_wrapper - Adapter function
pub fn calculate_correlation_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<CorrelationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    Ok(create_correlation_matrix(&corr_matrix, &var_names))
}

// calculate_covariance_matrix_wrapper - Adapter function
pub fn calculate_covariance_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<CorrelationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let cov_matrix = calculate_matrix(&data_matrix, "covariance")?;
    Ok(create_correlation_matrix(&cov_matrix, &var_names))
}

// calculate_inverse_correlation_matrix_wrapper - Adapter function
pub fn calculate_inverse_correlation_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<InverseCorrelationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let inverse = match corr_matrix.try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Could not invert correlation matrix".to_string());
        }
    };
    Ok(create_inverse_correlation_matrix(&inverse, &var_names))
}

// calculate_descriptive_statistics_wrapper - Adapter function
pub fn calculate_descriptive_statistics_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<Vec<DescriptiveStatistic>, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    Ok(calculate_descriptive_statistics(&data_matrix, &var_names))
}

// calculate_kmo_bartletts_test_wrapper - Adapter function
pub fn calculate_kmo_bartletts_test_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<KMOBartlettsTest, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    Ok(calculate_kmo_bartletts_test(&corr_matrix, &data_matrix))
}

// calculate_anti_image_matrices_wrapper - Adapter function
pub fn calculate_anti_image_matrices_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<AntiImageMatrices, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let inverse = match corr_matrix.try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Could not invert correlation matrix".to_string());
        }
    };
    Ok(calculate_anti_image_matrices(&inverse, &var_names))
}

// calculate_communalities_wrapper - Adapter function
pub fn calculate_communalities_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<Communalities, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_communalities(&extraction_result, &var_names))
}

// calculate_total_variance_explained_wrapper - Adapter function
pub fn calculate_total_variance_explained_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<TotalVarianceExplained, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_total_variance_explained(&extraction_result))
}

// calculate_component_matrix_wrapper - Adapter function
pub fn calculate_component_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_component_matrix(&extraction_result, &var_names))
}

// calculate_scree_plot_wrapper - Adapter function
pub fn calculate_scree_plot_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ScreePlot, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(create_scree_plot(&extraction_result))
}

// calculate_reproduced_correlations_wrapper - Adapter function
pub fn calculate_reproduced_correlations_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ReproducedCorrelations, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    Ok(calculate_reproduced_correlations(&extraction_result, &corr_matrix, &var_names))
}

// calculate_rotated_component_matrix_wrapper - Adapter function
pub fn calculate_rotated_component_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<RotatedComponentMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let rotation_result = rotate_factors(&extraction_result, config)?;
    Ok(create_rotated_component_matrix(&rotation_result, &var_names))
}

// calculate_component_transformation_matrix_wrapper - Adapter function
pub fn calculate_component_transformation_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentTransformationMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let rotation_result = rotate_factors(&extraction_result, config)?;
    Ok(create_component_transformation_matrix(&rotation_result))
}

// calculate_component_score_coefficient_matrix_wrapper - Adapter function
pub fn calculate_component_score_coefficient_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentScoreCoefficientMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let (coefficient_matrix, _) = calculate_score_coefficients(
        &corr_matrix,
        &extraction_result,
        config,
        &var_names
    )?;
    Ok(coefficient_matrix)
}

// calculate_component_score_covariance_matrix_wrapper - Adapter function
pub fn calculate_component_score_covariance_matrix_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<ComponentScoreCovarianceMatrix, String> {
    let (data_matrix, var_names) = extract_data_matrix(data, config)?;
    let corr_matrix = calculate_matrix(&data_matrix, "correlation")?;
    let extraction_result = extract_factors(&corr_matrix, config, &var_names)?;
    let (_, covariance_matrix) = calculate_score_coefficients(
        &corr_matrix,
        &extraction_result,
        config,
        &var_names
    )?;
    Ok(covariance_matrix)
}

// generate_loading_plots_wrapper - Placeholder function
pub fn generate_loading_plots_wrapper(
    data: &AnalysisData,
    config: &FactorAnalysisConfig
) -> Result<(), String> {
    // Implementation would depend on specific requirements
    Ok(())
}

// Principal Axis Factoring extraction
pub fn extract_principal_axis_factoring(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates (squared multiple correlations)
    let mut communalities = vec![0.0; n_vars];
    let mut r_matrix = matrix.clone();

    // Initialize communalities with SMC
    let inverse_matrix = match matrix.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            // If matrix is singular, use alternative estimate
            for i in 0..n_vars {
                let mut max_r = 0.0;
                for j in 0..n_vars {
                    if i != j {
                        let r_ij = matrix[(i, j)].abs();
                        if r_ij > max_r {
                            max_r = r_ij;
                        }
                    }
                }
                communalities[i] = max_r;
            }

            // Copy communalities to diagonal of r_matrix
            for i in 0..n_vars {
                r_matrix[(i, i)] = communalities[i];
            }

            // Return early using initial estimates
            return extract_factors_from_adjusted_matrix(
                &r_matrix,
                config,
                var_names,
                communalities
            );
        }
    };

    // Calculate communalities using squared multiple correlations
    for i in 0..n_vars {
        let r_ii = inverse_matrix[(i, i)];
        if r_ii > 0.0 {
            communalities[i] = 1.0 - 1.0 / r_ii;
        } else {
            // Fallback to maximum correlation
            let mut max_r = 0.0;
            for j in 0..n_vars {
                if i != j {
                    let r_ij = matrix[(i, j)].abs();
                    if r_ij > max_r {
                        max_r = r_ij;
                    }
                }
            }
            communalities[i] = max_r;
        }

        // Replace diagonal with communality
        r_matrix[(i, i)] = communalities[i];
    }

    // Iterative solution for communalities
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Perform eigenvalue decomposition on adjusted correlation matrix
        let eigen = r_matrix.clone().symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates
        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                new_communalities[i] +=
                    sorted_eigenvalues[j].abs() * sorted_eigenvectors[(i, j)].powi(2);
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (new_communalities[i] - communalities[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Converged, calculate final loadings
            let mut loadings = DMatrix::zeros(n_vars, n_factors);
            for i in 0..n_vars {
                for j in 0..n_factors {
                    loadings[(i, j)] = sorted_eigenvectors[(i, j)] * sorted_eigenvalues[j].sqrt();
                }
            }

            // Calculate explained variance
            let total_variance: f64 = sorted_eigenvalues.iter().sum();
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / total_variance) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities and correlation matrix for next iteration
        communalities = new_communalities;
        for i in 0..n_vars {
            r_matrix[(i, i)] = communalities[i];
        }
    }

    // If we reach here, we've hit the maximum iterations without converging
    // Return the best result we have with current communalities
    extract_factors_from_adjusted_matrix(&r_matrix, config, var_names, communalities)
}

// Helper function to extract factors from adjusted matrix
fn extract_factors_from_adjusted_matrix(
    r_matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String],
    communalities: Vec<f64>
) -> Result<ExtractionResult, String> {
    let n_vars = r_matrix.nrows();

    // Perform eigenvalue decomposition
    let eigen = r_matrix.clone().symmetric_eigen();

    // Sort eigenvalues and eigenvectors
    let mut indices: Vec<usize> = (0..n_vars).collect();
    indices.sort_by(|&i, &j|
        eigen.eigenvalues[j].partial_cmp(&eigen.eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let sorted_eigenvalues: Vec<f64> = indices
        .iter()
        .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
        .collect();

    let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        for j in 0..n_vars {
            sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
        }
    }

    // Determine number of factors
    let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
    if n_factors == 0 {
        return Err("No factors meet the retention criteria".to_string());
    }

    // Calculate loadings
    let mut loadings = DMatrix::zeros(n_vars, n_factors);
    for i in 0..n_vars {
        for j in 0..n_factors {
            loadings[(i, j)] = sorted_eigenvectors[(i, j)] * sorted_eigenvalues[j].sqrt();
        }
    }

    // Calculate explained variance
    let total_variance: f64 = sorted_eigenvalues.iter().sum();
    let explained_variance: Vec<f64> = sorted_eigenvalues
        .iter()
        .take(n_factors)
        .map(|&val| (val / total_variance) * 100.0)
        .collect();

    // Calculate cumulative variance
    let mut cumulative_variance = vec![0.0; n_factors];
    let mut cum_sum = 0.0;
    for (i, &var) in explained_variance.iter().enumerate() {
        cum_sum += var;
        cumulative_variance[i] = cum_sum;
    }

    Ok(ExtractionResult {
        loadings,
        eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
        communalities,
        explained_variance,
        cumulative_variance,
        n_factors,
        var_names: var_names.to_vec(),
    })
}

// Unweighted Least Squares extraction
pub fn extract_unweighted_least_squares(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates
    let mut communalities = vec![0.5; n_vars]; // Initialize with 0.5
    let mut r_matrix = matrix.clone();

    // Update diagonal with initial communalities
    for i in 0..n_vars {
        r_matrix[(i, i)] = communalities[i];
    }

    // Iterative solution for communalities
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Calculate reduced correlation matrix R - diagonal(uniqueness)
        let mut reduced_matrix = r_matrix.clone();
        for i in 0..n_vars {
            reduced_matrix[(i, i)] = r_matrix[(i, i)] - (1.0 - communalities[i]);
        }

        // Perform eigenvalue decomposition on reduced matrix
        let eigen = reduced_matrix.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates - ULS specific formula
        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                if sorted_eigenvalues[j] > 0.0 {
                    new_communalities[i] +=
                        sorted_eigenvalues[j] * sorted_eigenvectors[(i, j)].powi(2);
                }
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (new_communalities[i] - communalities[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Converged, calculate final loadings
            let mut loadings = DMatrix::zeros(n_vars, n_factors);
            for i in 0..n_vars {
                for j in 0..n_factors {
                    if sorted_eigenvalues[j] > 0.0 {
                        loadings[(i, j)] =
                            sorted_eigenvectors[(i, j)] * sorted_eigenvalues[j].sqrt();
                    }
                }
            }

            // Calculate explained variance
            let total_variance: f64 = sorted_eigenvalues.iter().take(n_vars).sum();
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / total_variance) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities for next iteration
        communalities = new_communalities;

        // Update diagonal of correlation matrix
        for i in 0..n_vars {
            r_matrix[(i, i)] = 1.0; // Reset diagonal to 1.0 for ULS
        }
    }

    // If we reach here, we've hit the maximum iterations without converging
    // Return a result with the current estimates
    Err("ULS extraction failed to converge within the maximum iterations".to_string())
}

// Generalized Least Squares extraction
pub fn extract_generalized_least_squares(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates
    let mut communalities = vec![0.5; n_vars]; // Initialize with 0.5
    let mut r_matrix = matrix.clone();

    // Iterative solution for communalities
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Calculate weight matrix W = R^(-2)
        let r_inverse = match r_matrix.clone().try_inverse() {
            Some(inv) => inv,
            None => {
                return Err("Correlation matrix is singular in GLS extraction".to_string());
            }
        };

        // Calculate weighted correlation matrix
        let weighted_matrix = &r_inverse * matrix * &r_inverse;

        // Perform eigenvalue decomposition
        let eigen = weighted_matrix.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates - GLS specific
        let mut loadings = DMatrix::zeros(n_vars, n_factors);
        for i in 0..n_vars {
            for j in 0..n_factors {
                loadings[(i, j)] =
                    sorted_eigenvectors[(i, j)] * (sorted_eigenvalues[j] - 1.0).sqrt();
            }
        }

        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                new_communalities[i] += loadings[(i, j)].powi(2);
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (new_communalities[i] - communalities[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Calculate explained variance
            let total_variance: f64 = sorted_eigenvalues.iter().take(n_vars).sum();
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / total_variance) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            // Calculate chi-square for GLS
            let w = matrix.nrows() as f64;
            let chi_square =
                (w - 1.0 - (2.0 * (n_vars as f64) + 5.0) / 6.0 - (2.0 * (n_factors as f64)) / 3.0) *
                (n_factors..n_vars)
                    .map(|j| (sorted_eigenvalues[j] - 1.0).powi(2) / 2.0)
                    .sum::<f64>();

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities for next iteration
        communalities = new_communalities;

        // Update R matrix for next iteration
        for i in 0..n_vars {
            for j in 0..n_vars {
                if i == j {
                    r_matrix[(i, j)] = 1.0; // Keep diagonal as 1.0
                } else {
                    // Adjust off-diagonal correlations based on uniqueness
                    let weight = ((1.0 - communalities[i]) * (1.0 - communalities[j])).sqrt();
                    r_matrix[(i, j)] = matrix[(i, j)] * weight;
                }
            }
        }
    }

    // If we reach here, we've hit the maximum iterations without converging
    Err("GLS extraction failed to converge within the maximum iterations".to_string())
}

// Maximum Likelihood extraction
pub fn extract_maximum_likelihood(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Initial communality estimates - using SMC (squared multiple correlations)
    let mut communalities = vec![0.0; n_vars];
    let inverse_matrix = match matrix.clone().try_inverse() {
        Some(inv) => Some(inv), // Return Option<Matrix>
        None => {
            // If matrix is singular, use alternative initial estimates
            for i in 0..n_vars {
                communalities[i] = 0.5; // Default value
            }
            None // Return None for the Option type
        }
    };

    // If we have an inverse matrix, calculate SMC
    if let Some(inv) = &inverse_matrix {
        for i in 0..n_vars {
            let r_ii = inv[(i, i)];
            if r_ii > 0.0 {
                communalities[i] = 1.0 - 1.0 / r_ii;
            } else {
                communalities[i] = 0.5; // Default value
            }
        }
    }

    // Calculate initial uniqueness (psi-squared)
    let mut psi_squared = vec![0.0; n_vars];
    for i in 0..n_vars {
        psi_squared[i] = 1.0 - communalities[i];
        if psi_squared[i] < 0.005 {
            // Avoid very small values
            psi_squared[i] = 0.005;
        }
    }

    // Iterative solution for Maximum Likelihood
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    for iteration in 0..max_iterations {
        // Construct psi matrix (diagonal matrix of uniquenesses)
        let mut psi_matrix = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            psi_matrix[(i, i)] = psi_squared[i];
        }

        // Calculate psi^(-1) * R * psi^(-1)
        let mut psi_inv = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            psi_inv[(i, i)] = 1.0 / (psi_squared[i] as f64).sqrt();
        }

        let weighted_r = &psi_inv * matrix * &psi_inv;

        // Perform eigenvalue decomposition
        let eigen = weighted_r.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate loadings
        let mut loadings = DMatrix::zeros(n_vars, n_factors);
        for i in 0..n_vars {
            for j in 0..n_factors {
                loadings[(i, j)] =
                    (psi_squared[i] as f64).sqrt() *
                    sorted_eigenvectors[(i, j)] *
                    (sorted_eigenvalues[j] - 1.0).sqrt();
            }
        }

        // Calculate new communality estimates
        let mut new_communalities = vec![0.0; n_vars];
        for i in 0..n_vars {
            for j in 0..n_factors {
                new_communalities[i] += loadings[(i, j)].powi(2);
            }

            // Ensure communalities don't exceed 1.0
            if new_communalities[i] > 0.995 {
                new_communalities[i] = 0.995;
            }
        }

        // Calculate new uniquenesses
        let mut new_psi_squared = vec![0.0; n_vars];
        for i in 0..n_vars {
            new_psi_squared[i] = 1.0 - new_communalities[i];
            if new_psi_squared[i] < 0.005 {
                // Avoid very small values
                new_psi_squared[i] = 0.005;
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = ((new_psi_squared[i] - psi_squared[i]) as f64).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Calculate explained variance
            let total_variance: f64 = n_vars as f64; // Total variance is p for correlation matrix
            let explained_variance: Vec<f64> = (0..n_factors)
                .map(
                    |j|
                        ((new_communalities
                            .iter()
                            .map(|&h| h)
                            .sum::<f64>() /
                            total_variance) *
                            100.0) /
                        (n_factors as f64)
                )
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            // Calculate chi-square for ML
            let n = matrix.nrows() as f64;
            let ml_function = sorted_eigenvalues
                .iter()
                .skip(n_factors)
                .map(|&e| e.ln() + 1.0 / e - 1.0)
                .sum::<f64>();

            let chi_square =
                (n - 1.0 - (2.0 * (n_vars as f64) + 5.0) / 6.0 - (2.0 * (n_factors as f64)) / 3.0) *
                ml_function;
            let df = ((n_vars - n_factors).pow(2) - n_vars - n_factors) / 2;

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: new_communalities,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update uniquenesses for next iteration
        psi_squared = new_psi_squared;
    }

    // If we reach here, we've hit the maximum iterations without converging
    Err("ML extraction failed to converge within the maximum iterations".to_string())
}

// Alpha Factoring extraction
pub fn extract_alpha_factoring(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Check if determinant of correlation matrix is too small
    let determinant = matrix.determinant();
    if determinant.abs() < 1e-8 {
        return Err("Correlation matrix is nearly singular for alpha factoring".to_string());
    }

    // Initial communality estimates
    let mut h_initial = vec![0.0; n_vars];

    // Initialize communalities
    let inverse_matrix = match matrix.clone().try_inverse() {
        Some(inv) => {
            // Use SMC method
            for i in 0..n_vars {
                h_initial[i] = 1.0 - 1.0 / inv[(i, i)];

                // Ensure valid initial communality
                if h_initial[i] < 0.0 || h_initial[i] > 1.0 {
                    h_initial[i] = 0.5;
                }
            }
            true
        }
        None => {
            // Use maximum correlation method
            for i in 0..n_vars {
                let mut max_corr = 0.0;
                for j in 0..n_vars {
                    if i != j {
                        let corr = matrix[(i, j)].abs();
                        if corr > max_corr {
                            max_corr = corr;
                        }
                    }
                }
                h_initial[i] = max_corr;
            }
            false
        }
    };

    // Setup for iterations
    let max_iterations = config.extraction.max_iter as usize;
    let convergence_criterion = 0.001;

    let mut h_current = h_initial.clone();

    // Iterative solution for Alpha factoring
    for iteration in 0..max_iterations {
        // Create diagonal matrix H^(1/2)
        let mut h_sqrt = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            h_sqrt[(i, i)] = h_current[i].sqrt();
        }

        // Calculate H^(1/2) * (R-I) * H^(1/2) + I
        let identity = DMatrix::identity(n_vars, n_vars);
        let r_minus_i = matrix - &identity;
        let transformed = &h_sqrt * &r_minus_i * &h_sqrt + identity;

        // Perform eigenvalue decomposition
        let eigen = transformed.symmetric_eigen();

        // Sort eigenvalues and eigenvectors
        let mut indices: Vec<usize> = (0..n_vars).collect();
        indices.sort_by(|&i, &j|
            eigen.eigenvalues[j]
                .partial_cmp(&eigen.eigenvalues[i])
                .unwrap_or(std::cmp::Ordering::Equal)
        );

        let sorted_eigenvalues: Vec<f64> = indices
            .iter()
            .map(|&i| eigen.eigenvalues[i].max(0.0)) // Ensure non-negative
            .collect();

        let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
        for i in 0..n_vars {
            for j in 0..n_vars {
                sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
            }
        }

        // Determine number of factors
        let n_factors = determine_factors_to_retain(&sorted_eigenvalues, config);
        if n_factors == 0 {
            return Err("No factors meet the retention criteria".to_string());
        }

        // Calculate new communality estimates - Alpha factoring specific formula
        let mut h_new = vec![0.0; n_vars];
        for k in 0..n_vars {
            let mut sum = 0.0;
            for j in 0..n_factors {
                sum += sorted_eigenvalues[j].abs() * sorted_eigenvectors[(k, j)].powi(2);
            }
            h_new[k] = sum * h_current[k];

            // Check for zero communality
            if h_new[k] < 1e-6 {
                return Err("Zero communality detected in alpha factoring".to_string());
            }
        }

        // Check for convergence
        let mut max_change = 0.0;
        for i in 0..n_vars {
            let change = (h_new[i] - h_current[i]).abs();
            if change > max_change {
                max_change = change;
            }
        }

        if max_change < convergence_criterion {
            // Converged, calculate final loadings
            let mut loadings = DMatrix::zeros(n_vars, n_factors);
            for i in 0..n_vars {
                for j in 0..n_factors {
                    loadings[(i, j)] =
                        h_current[i].sqrt() *
                        sorted_eigenvectors[(i, j)] *
                        sorted_eigenvalues[j].sqrt();
                }
            }

            // Calculate explained variance
            let total_variance: f64 = h_new.iter().sum(); // Sum of communalities
            let explained_variance: Vec<f64> = sorted_eigenvalues
                .iter()
                .take(n_factors)
                .map(|&val| (val / (n_vars as f64)) * 100.0)
                .collect();

            // Calculate cumulative variance
            let mut cumulative_variance = vec![0.0; n_factors];
            let mut cum_sum = 0.0;
            for (i, &var) in explained_variance.iter().enumerate() {
                cum_sum += var;
                cumulative_variance[i] = cum_sum;
            }

            return Ok(ExtractionResult {
                loadings,
                eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
                communalities: h_new,
                explained_variance,
                cumulative_variance,
                n_factors,
                var_names: var_names.to_vec(),
            });
        }

        // Update communalities for next iteration
        h_current = h_new;
    }

    // If we reach here, we've hit the maximum iterations without converging
    Err("Alpha factoring failed to converge within the maximum iterations".to_string())
}

// Image Factoring extraction
pub fn extract_image_factoring(
    matrix: &DMatrix<f64>,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<ExtractionResult, String> {
    let n_vars = matrix.nrows();

    // Get inverse of correlation matrix
    let r_inverse = match matrix.clone().try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Correlation matrix is singular for image factoring".to_string());
        }
    };

    // Create S matrix (diagonal matrix of 1/sqrt(r_ii))
    let mut s_matrix = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        s_matrix[(i, i)] = 1.0 / r_inverse[(i, i)].sqrt();
    }

    // Calculate S^(-1) * R * S^(-1)
    let s_inv = s_matrix.clone().try_inverse().unwrap(); // S is diagonal, so inverse should exist
    let transformed = &s_inv * matrix * &s_inv;

    // Perform eigenvalue decomposition
    let eigen = transformed.symmetric_eigen();

    // Sort eigenvalues and eigenvectors
    let mut indices: Vec<usize> = (0..n_vars).collect();
    indices.sort_by(|&i, &j|
        eigen.eigenvalues[j].partial_cmp(&eigen.eigenvalues[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let sorted_eigenvalues: Vec<f64> = indices
        .iter()
        .map(|&i| eigen.eigenvalues[i])
        .collect();

    let mut sorted_eigenvectors = DMatrix::zeros(n_vars, n_vars);
    for i in 0..n_vars {
        for j in 0..n_vars {
            sorted_eigenvectors[(i, j)] = eigen.eigenvectors[(i, indices[j])];
        }
    }

    // Determine number of factors - for image factoring, only use eigenvalues > 1
    let mut n_factors = 0;
    for &val in &sorted_eigenvalues {
        if val > 1.0 {
            n_factors += 1;
        } else {
            break;
        }
    }

    if n_factors == 0 {
        return Err("No factors with eigenvalues > 1 in image factoring".to_string());
    }

    // Calculate loadings using image factoring formula
    let mut loadings = DMatrix::zeros(n_vars, n_factors);
    for i in 0..n_vars {
        for j in 0..n_factors {
            loadings[(i, j)] =
                (s_matrix[(i, i)] * sorted_eigenvectors[(i, j)] * (sorted_eigenvalues[j] - 1.0)) /
                sorted_eigenvalues[j].sqrt();
        }
    }

    // Calculate communalities
    let mut communalities = vec![0.0; n_vars];
    for i in 0..n_vars {
        for j in 0..n_factors {
            communalities[i] +=
                ((sorted_eigenvalues[j] - 1.0).powi(2) * sorted_eigenvectors[(i, j)].powi(2)) /
                (sorted_eigenvalues[j] * r_inverse[(i, i)]);
        }
    }

    // Calculate explained variance
    let total_variance = n_vars as f64; // Total variance is p for correlation matrix
    let explained_variance: Vec<f64> = (0..n_factors)
        .map(|j| (sorted_eigenvalues[j] / total_variance) * 100.0)
        .collect();

    // Calculate cumulative variance
    let mut cumulative_variance = vec![0.0; n_factors];
    let mut cum_sum = 0.0;
    for (i, &var) in explained_variance.iter().enumerate() {
        cum_sum += var;
        cumulative_variance[i] = cum_sum;
    }

    // Calculate image covariance matrix
    // R + S^2 * R^(-1) * S^2 - 2*S^2
    let image_covar = matrix + &s_matrix * &r_inverse * &s_matrix - &s_matrix * 2.0;

    // Calculate anti-image covariance matrix
    // S^2 * R^(-1) * S^2
    let anti_image_covar = &s_matrix * &r_inverse * &s_matrix;

    Ok(ExtractionResult {
        loadings,
        eigenvalues: sorted_eigenvalues.into_iter().take(n_factors).collect(),
        communalities,
        explained_variance,
        cumulative_variance,
        n_factors,
        var_names: var_names.to_vec(),
    })
}

// Determine number of factors to retain
pub fn determine_factors_to_retain(eigenvalues: &[f64], config: &FactorAnalysisConfig) -> usize {
    if let Some(max_factors) = config.extraction.max_factors {
        let max = max_factors as usize;
        if max > 0 && max <= eigenvalues.len() {
            return max;
        }
    }

    // Use eigenvalue criterion (Kaiser criterion by default)
    let eigen_cutoff = config.extraction.eigen_val;
    let count = eigenvalues
        .iter()
        .take_while(|&&val| val >= eigen_cutoff)
        .count();

    if count == 0 {
        1 // Always retain at least one factor
    } else {
        count
    }
}

// Create communalities result
pub fn create_communalities(
    extraction_result: &ExtractionResult,
    var_names: &[String]
) -> Communalities {
    let mut initial = HashMap::new();
    let mut extraction = HashMap::new();

    for (i, var_name) in var_names.iter().enumerate() {
        initial.insert(var_name.clone(), 1.0); // Initial communalities are 1.0 for PCA
        if i < extraction_result.communalities.len() {
            extraction.insert(var_name.clone(), extraction_result.communalities[i]);
        }
    }

    Communalities {
        initial,
        extraction,
    }
}

// Create total variance explained result
pub fn create_total_variance_explained(
    extraction_result: &ExtractionResult
) -> TotalVarianceExplained {
    let n_factors = extraction_result.n_factors;
    let mut initial_eigenvalues = Vec::with_capacity(n_factors);
    let mut extraction_sums = Vec::with_capacity(n_factors);
    let mut rotation_sums = Vec::new(); // Will be filled if rotation is applied

    for i in 0..n_factors {
        let eigenvalue = extraction_result.eigenvalues[i];
        let percent = extraction_result.explained_variance[i];
        let cumulative = extraction_result.cumulative_variance[i];

        initial_eigenvalues.push(TotalVarianceComponent {
            total: eigenvalue,
            percent_of_variance: percent,
            cumulative_percent: cumulative,
        });

        extraction_sums.push(TotalVarianceComponent {
            total: eigenvalue,
            percent_of_variance: percent,
            cumulative_percent: cumulative,
        });
    }

    TotalVarianceExplained {
        initial_eigenvalues,
        extraction_sums,
        rotation_sums,
    }
}

// Create component/factor matrix result
pub fn create_component_matrix(
    extraction_result: &ExtractionResult,
    var_names: &[String]
) -> ComponentMatrix {
    let mut components = HashMap::new();

    for (i, var_name) in var_names.iter().enumerate() {
        if i < extraction_result.loadings.nrows() {
            let mut loadings = Vec::with_capacity(extraction_result.n_factors);

            for j in 0..extraction_result.n_factors {
                loadings.push(extraction_result.loadings[(i, j)]);
            }

            components.insert(var_name.clone(), loadings);
        }
    }

    ComponentMatrix {
        components,
    }
}

// Calculate reproduced correlations
pub fn calculate_reproduced_correlations(
    extraction_result: &ExtractionResult,
    original_matrix: &DMatrix<f64>,
    var_names: &[String]
) -> ReproducedCorrelations {
    let n_vars = extraction_result.loadings.nrows();
    let mut reproduced_correlation = HashMap::new();
    let mut residual = HashMap::new();

    // Calculate reproduced correlation matrix
    let loadings = &extraction_result.loadings;
    let reproduced_matrix = loadings * loadings.transpose();

    for (i, var_name) in var_names.iter().enumerate() {
        if i < n_vars {
            let mut var_reproduced = HashMap::new();
            let mut var_residual = HashMap::new();

            for (j, other_var) in var_names.iter().enumerate() {
                if j < n_vars {
                    // Reproduced correlation
                    let repro_corr = reproduced_matrix[(i, j)];
                    var_reproduced.insert(other_var.clone(), repro_corr);

                    // Residual (original - reproduced)
                    let residual_corr = original_matrix[(i, j)] - repro_corr;
                    var_residual.insert(other_var.clone(), residual_corr);
                }
            }

            reproduced_correlation.insert(var_name.clone(), var_reproduced);
            residual.insert(var_name.clone(), var_residual);
        }
    }

    ReproducedCorrelations {
        reproduced_correlation,
        residual,
    }
}

// Structure to hold rotation results
pub struct RotationResult {
    pub rotated_loadings: DMatrix<f64>,
    pub transformation_matrix: DMatrix<f64>,
    pub factor_correlations: Option<DMatrix<f64>>,
}

// Rotate factors using specified method
pub fn rotate_factors(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    if config.rotation.none {
        // No rotation, return original loadings
        return Ok(RotationResult {
            rotated_loadings: extraction_result.loadings.clone(),
            transformation_matrix: DMatrix::identity(
                extraction_result.n_factors,
                extraction_result.n_factors
            ),
            factor_correlations: None,
        });
    }

    if config.rotation.varimax {
        rotate_varimax(extraction_result, config)
    } else if config.rotation.quartimax {
        rotate_quartimax(extraction_result, config)
    } else if config.rotation.equimax {
        rotate_equimax(extraction_result, config)
    } else if config.rotation.oblimin {
        rotate_oblimin(extraction_result, config)
    } else if config.rotation.promax {
        rotate_promax(extraction_result, config)
    } else {
        // Default to varimax
        rotate_varimax(extraction_result, config)
    }
}

// Varimax rotation
pub fn rotate_varimax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    let loadings = &extraction_result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with original loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = DMatrix::identity(n_cols, n_cols);

    // Normalize the factor loadings by communalities
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Iterative rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = 0.0;

    for iteration in 0..max_iterations {
        // Calculate varimax criterion
        let mut criterion = 0.0;
        for j in 0..n_cols {
            let mut sum_4th = 0.0;
            let mut sum_2nd = 0.0;

            for i in 0..n_rows {
                let val = normalized_loadings[(i, j)];
                sum_4th += val.powi(4);
                sum_2nd += val.powi(2);
            }

            criterion += sum_4th - sum_2nd.powi(2) / (n_rows as f64);
        }
        criterion /= n_rows as f64;

        // Check for convergence
        if iteration > 0 && (criterion - prev_criterion).abs() < convergence_criterion {
            break;
        }
        prev_criterion = criterion;

        // Perform pair-wise rotations
        for j in 0..n_cols - 1 {
            for k in j + 1..n_cols {
                // Calculate rotation coefficients
                let mut a = 0.0;
                let mut b = 0.0;
                let mut c = 0.0;
                let mut d = 0.0;

                for i in 0..n_rows {
                    let x = normalized_loadings[(i, j)];
                    let y = normalized_loadings[(i, k)];

                    a += x.powi(2) - y.powi(2);
                    b += 2.0 * x * y;
                    c += x.powi(2) - y.powi(2);
                    d += 2.0 * x * y;
                }

                // Varimax-specific formula
                let x = d - (2.0 * a * b) / (n_rows as f64);
                let y = c - (a.powi(2) - b.powi(2)) / (n_rows as f64);

                // Calculate rotation angle
                let phi = 0.25 * (x / y).atan();

                if phi.sin().abs() <= 1e-15 {
                    continue; // Skip tiny rotations
                }

                let cos_phi = phi.cos();
                let sin_phi = phi.sin();

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_j = normalized_loadings[(i, j)];
                    let temp_k = normalized_loadings[(i, k)];

                    normalized_loadings[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    normalized_loadings[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }

                // Apply rotation to transformation matrix
                for i in 0..n_cols {
                    let temp_j: f64 = transformation_matrix[(i, j)];
                    let temp_k: f64 = transformation_matrix[(i, k)];

                    transformation_matrix[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    transformation_matrix[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }
            }
        }
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    // Reflect factors with negative sums
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += rotated_loadings[(i, j)];
        }

        if sum < 0.0 {
            for i in 0..n_rows {
                rotated_loadings[(i, j)] = -rotated_loadings[(i, j)];
            }

            for i in 0..n_cols {
                transformation_matrix[(i, j)] = -transformation_matrix[(i, j)];
            }
        }
    }

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = transformation_matrix[(i, old_j)];
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: None,
    })
}

// Quartimax rotation - focuses on simplifying rows of the factor loading matrix
pub fn rotate_quartimax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    let loadings = &extraction_result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with original loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = DMatrix::identity(n_cols, n_cols);

    // Normalize the factor loadings by communalities
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Iterative rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = 0.0;

    for iteration in 0..max_iterations {
        // Calculate quartimax criterion (sum of 4th powers of loadings)
        let mut criterion = 0.0;
        for i in 0..n_rows {
            for j in 0..n_cols {
                criterion += normalized_loadings[(i, j)].powi(4);
            }
        }

        // Check for convergence
        if iteration > 0 && (criterion - prev_criterion).abs() < convergence_criterion {
            break;
        }
        prev_criterion = criterion;

        // Perform pair-wise rotations
        for j in 0..n_cols - 1 {
            for k in j + 1..n_cols {
                // Calculate rotation coefficients for quartimax
                let mut c = 0.0;
                let mut d = 0.0;

                for i in 0..n_rows {
                    let x = normalized_loadings[(i, j)];
                    let y = normalized_loadings[(i, k)];

                    c += x.powi(2) - y.powi(2);
                    d += 2.0 * x * y;
                }

                // Calculate rotation angle for quartimax
                let denominator = (c.powi(2) + d.powi(2)).sqrt();
                if denominator < 1e-10 {
                    continue; // Skip if division by zero
                }

                let cos_phi = c / denominator;
                let sin_phi = -d / denominator;

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_j = normalized_loadings[(i, j)];
                    let temp_k = normalized_loadings[(i, k)];

                    normalized_loadings[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    normalized_loadings[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }

                // Apply rotation to transformation matrix
                for i in 0..n_cols {
                    let temp_j: f64 = transformation_matrix[(i, j)];
                    let temp_k: f64 = transformation_matrix[(i, k)];

                    transformation_matrix[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    transformation_matrix[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }
            }
        }
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    // Reflect factors with negative sums
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += rotated_loadings[(i, j)];
        }

        if sum < 0.0 {
            for i in 0..n_rows {
                rotated_loadings[(i, j)] = -rotated_loadings[(i, j)];
            }

            for i in 0..n_cols {
                transformation_matrix[(i, j)] = -transformation_matrix[(i, j)];
            }
        }
    }

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = transformation_matrix[(i, old_j)];
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: None,
    })
}

// Equamax rotation - compromise between varimax and quartimax
pub fn rotate_equimax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    let loadings = &extraction_result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with original loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = DMatrix::identity(n_cols, n_cols);

    // Normalize the factor loadings by communalities
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Iterative rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = 0.0;

    for iteration in 0..max_iterations {
        // Calculate equamax criterion (weighted average of varimax and quartimax)
        let mut criterion = 0.0;
        for j in 0..n_cols {
            let mut sum_4th = 0.0;
            let mut sum_2nd = 0.0;

            for i in 0..n_rows {
                let val = normalized_loadings[(i, j)];
                sum_4th += val.powi(4);
                sum_2nd += val.powi(2);
            }

            // Use m/2 as weight for equamax (m = number of factors)
            criterion += sum_4th - (((n_cols as f64) / 2.0) * sum_2nd.powi(2)) / (n_rows as f64);
        }

        // Check for convergence
        if iteration > 0 && (criterion - prev_criterion).abs() < convergence_criterion {
            break;
        }
        prev_criterion = criterion;

        // Perform pair-wise rotations
        for j in 0..n_cols - 1 {
            for k in j + 1..n_cols {
                // Calculate rotation coefficients for equamax
                let mut a = 0.0;
                let mut b = 0.0;
                let mut c = 0.0;
                let mut d = 0.0;

                for i in 0..n_rows {
                    let x = normalized_loadings[(i, j)];
                    let y = normalized_loadings[(i, k)];

                    a += x.powi(2) - y.powi(2);
                    b += 2.0 * x * y;
                    c += x.powi(2) - y.powi(2);
                    d += 2.0 * x * y;
                }

                // Equamax modification
                let weight = (n_cols as f64) / 2.0;
                let x = d - (weight * a * b) / (n_rows as f64);
                let y = c - (weight * (a.powi(2) - b.powi(2))) / (2.0 * (n_rows as f64));

                // Calculate rotation angle
                let phi = 0.25 * (x / y).atan();

                if phi.sin().abs() <= 1e-15 {
                    continue; // Skip tiny rotations
                }

                let cos_phi = phi.cos();
                let sin_phi = phi.sin();

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_j = normalized_loadings[(i, j)];
                    let temp_k = normalized_loadings[(i, k)];

                    normalized_loadings[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    normalized_loadings[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }

                // Apply rotation to transformation matrix
                for i in 0..n_cols {
                    let temp_j: f64 = transformation_matrix[(i, j)];
                    let temp_k: f64 = transformation_matrix[(i, k)];

                    transformation_matrix[(i, j)] = temp_j * cos_phi - temp_k * sin_phi;
                    transformation_matrix[(i, k)] = temp_j * sin_phi + temp_k * cos_phi;
                }
            }
        }
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    // Reflect factors with negative sums
    for j in 0..n_cols {
        let mut sum = 0.0;
        for i in 0..n_rows {
            sum += rotated_loadings[(i, j)];
        }

        if sum < 0.0 {
            for i in 0..n_rows {
                rotated_loadings[(i, j)] = -rotated_loadings[(i, j)];
            }

            for i in 0..n_cols {
                transformation_matrix[(i, j)] = -transformation_matrix[(i, j)];
            }
        }
    }

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = transformation_matrix[(i, old_j)];
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: None,
    })
}

// Oblimin rotation - allows for correlated factors
pub fn rotate_oblimin(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    // First perform a varimax rotation as a starting point
    let varimax_result = rotate_varimax(extraction_result, config)?;
    let loadings = &varimax_result.rotated_loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Initialize with varimax loadings
    let mut rotated_loadings = loadings.clone();
    let mut transformation_matrix = varimax_result.transformation_matrix.clone();

    // Get delta parameter (default is 0)
    let delta = config.rotation.delta;

    // Normalize the factor loadings
    let mut normalized_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut h = vec![0.0; n_rows];

    // Apply Kaiser normalization if specified
    let apply_kaiser = true; // Default is to apply Kaiser normalization

    if apply_kaiser {
        for i in 0..n_rows {
            let mut sum_squared = 0.0;
            for j in 0..n_cols {
                sum_squared += loadings[(i, j)].powi(2);
            }
            h[i] = sum_squared.sqrt();

            for j in 0..n_cols {
                if h[i] > 1e-10 {
                    normalized_loadings[(i, j)] = loadings[(i, j)] / h[i];
                } else {
                    normalized_loadings[(i, j)] = 0.0;
                }
            }
        }
    } else {
        normalized_loadings = loadings.clone();
        for i in 0..n_rows {
            h[i] = 1.0;
        }
    }

    // Initialize factor correlation matrix
    let mut factor_correlations = DMatrix::identity(n_cols, n_cols);

    // Calculate initial quantities needed for oblimin
    let mut u = vec![0.0; n_cols];
    let mut v = vec![0.0; n_cols];
    let mut x = vec![0.0; n_cols];

    for i in 0..n_cols {
        for j in 0..n_rows {
            u[i] += normalized_loadings[(j, i)].powi(2);
            v[i] += normalized_loadings[(j, i)].powi(4);
        }
        x[i] = v[i] - (delta / (n_rows as f64)) * u[i].powi(2);
    }

    let mut d_sum = 0.0;
    for i in 0..n_cols {
        d_sum += u[i];
    }

    let mut g_sum = 0.0;
    for i in 0..n_cols {
        g_sum += x[i];
    }

    let mut s = vec![0.0; n_rows];
    for i in 0..n_rows {
        s[i] = if apply_kaiser { 1.0 } else { h[i] };
    }

    let mut s_squared_sum = 0.0;
    for i in 0..n_rows {
        s_squared_sum += s[i].powi(2);
    }

    let h_value = s_squared_sum - (delta / (n_rows as f64)) * d_sum.powi(2);
    let initial_criterion = h_value - g_sum;

    // Iterative direct oblimin rotation
    let max_iterations = config.rotation.max_iter as usize;
    let convergence_criterion = 1e-5;
    let mut prev_criterion = initial_criterion;

    for iteration in 0..max_iterations {
        // For each pair of factors (p, q)
        for p in 0..n_cols {
            for q in 0..n_cols {
                if p == q {
                    continue;
                }

                // Calculate parameters for rotation
                let d_pq = d_sum - u[p] - u[q];
                let g_pq = g_sum - x[p] - x[q];

                // Calculate rotation parameters
                let mut z_pq = 0.0;
                let mut y_pq = 0.0;

                for i in 0..n_rows {
                    let lambda_ip = normalized_loadings[(i, p)];
                    let lambda_iq = normalized_loadings[(i, q)];

                    z_pq += lambda_ip.powi(2) * lambda_iq.powi(2);
                    y_pq += lambda_ip * lambda_iq;
                }

                let mut t = 0.0;
                let mut z = 0.0;

                for i in 0..n_rows {
                    t +=
                        s[i] * normalized_loadings[(i, p)].powi(2) -
                        (delta / (n_rows as f64)) * u[p] * d_pq;
                    z +=
                        s[i] * normalized_loadings[(i, p)] * normalized_loadings[(i, q)] -
                        (delta / (n_rows as f64)) * y_pq * d_pq;
                }

                let r = z_pq - (delta / (n_rows as f64)) * u[p] * u[q];

                // Calculate rotation angle using cubic equation
                let p_prime = 1.5 * (y_pq - t / r);
                let q_prime = (0.5 * (x[p] - 4.0 * y_pq * t + r + 2.0 * t)) / r;
                let r_prime = (0.5 * (y_pq * (t + r) - t - z)) / r;

                // Solve cubic equation: b^3 + p'*b^2 + q'*b + r' = 0
                // Using cardano's formula
                let a = 1.0;
                let b = p_prime;
                let c = q_prime;
                let d = r_prime;

                let p_cubic = c / a - b.powi(2) / (3.0 * a.powi(2));
                let q_cubic =
                    (2.0 * b.powi(3)) / (27.0 * a.powi(3)) - (b * c) / (3.0 * a.powi(2)) + d / a;

                let delta_cubic = q_cubic.powi(2) / 4.0 + p_cubic.powi(3) / 27.0;

                let mut root = 0.0;

                if delta_cubic > 0.0 {
                    // One real root
                    let u = (-q_cubic / 2.0 + delta_cubic.sqrt()).cbrt();
                    let v = (-q_cubic / 2.0 - delta_cubic.sqrt()).cbrt();
                    root = u + v - b / (3.0 * a);
                } else if delta_cubic == 0.0 {
                    // All roots are real and at least two are equal
                    let u = (-q_cubic / 2.0).cbrt();
                    root = 2.0 * u - b / (3.0 * a);
                } else {
                    // Three real roots
                    let rho = (-p_cubic.powi(3) / 27.0).sqrt();
                    let theta = (-q_cubic / (2.0 * rho)).acos();
                    let cos_term = (theta / 3.0).cos();
                    root = 2.0 * rho.cbrt() * cos_term - b / (3.0 * a);
                }

                // Calculate transformation parameters
                let a_term = 1.0 + 2.0 * y_pq * root + root.powi(2);
                let t1 = a_term.abs().sqrt();
                let t2 = root / t1;

                // Apply rotation to normalized loadings
                for i in 0..n_rows {
                    let temp_p = normalized_loadings[(i, p)];
                    let temp_q = normalized_loadings[(i, q)];

                    normalized_loadings[(i, p)] = temp_p * t1 - temp_q * root;
                    normalized_loadings[(i, q)] = temp_q;
                }

                // Update factor correlation
                for i in 0..n_cols {
                    if i != p {
                        factor_correlations[(i, p)] =
                            factor_correlations[(i, p)] / t1 + factor_correlations[(i, q)] * t2;
                        factor_correlations[(p, i)] = factor_correlations[(i, p)];
                    }
                }
                factor_correlations[(p, p)] = 1.0;

                // Update u, v, x
                u[p] = t1.powi(2) * u[p];
                x[p] = a_term.powi(2) * x[p];

                // Recalculate for q
                u[q] = 0.0;
                v[q] = 0.0;
                for i in 0..n_rows {
                    u[q] += normalized_loadings[(i, q)].powi(2);
                    v[q] += normalized_loadings[(i, q)].powi(4);
                }
                x[q] = v[q] - (delta / (n_rows as f64)) * u[q].powi(2);

                // Update global sums
                d_sum = d_pq + u[p] + u[q];
                g_sum = g_pq + x[p] + x[q];
            }
        }

        // Check for convergence
        let h_value = s_squared_sum - (delta / (n_rows as f64)) * d_sum.powi(2);
        let current_criterion = h_value - g_sum;

        if (current_criterion - prev_criterion).abs() < initial_criterion * convergence_criterion {
            break;
        }

        prev_criterion = current_criterion;
    }

    // Denormalize the rotated loadings
    for i in 0..n_rows {
        for j in 0..n_cols {
            rotated_loadings[(i, j)] = normalized_loadings[(i, j)] * h[i];
        }
    }

    Ok(RotationResult {
        rotated_loadings,
        transformation_matrix,
        factor_correlations: Some(factor_correlations),
    })
}

// Promax rotation - starts with varimax and then relaxes orthogonality
pub fn rotate_promax(
    extraction_result: &ExtractionResult,
    config: &FactorAnalysisConfig
) -> Result<RotationResult, String> {
    // First perform a varimax rotation
    let varimax_result = rotate_varimax(extraction_result, config)?;
    let loadings = &varimax_result.rotated_loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    // Get kappa parameter (default is 4)
    let kappa = config.rotation.kappa as f64;

    // Create target matrix P by raising varimax loadings to power of kappa
    let mut target_matrix = DMatrix::zeros(n_rows, n_cols);
    for i in 0..n_rows {
        for j in 0..n_cols {
            // Get absolute value of loading
            let abs_loading = loadings[(i, j)].abs();

            // Preserve sign when raising to power of kappa
            let sign = if loadings[(i, j)] >= 0.0 { 1.0 } else { -1.0 };

            // Apply promax power transformation
            target_matrix[(i, j)] =
                (sign * abs_loading.powf(kappa + 1.0)) /
                (loadings[(i, j)].powi(2) / (n_rows as f64)).sqrt();
        }
    }

    // Normalize target matrix by column
    for j in 0..n_cols {
        let mut sum_squared = 0.0;
        for i in 0..n_rows {
            sum_squared += target_matrix[(i, j)].powi(2);
        }

        let norm = sum_squared.sqrt();
        if norm > 1e-10 {
            for i in 0..n_rows {
                target_matrix[(i, j)] /= norm;
            }
        }
    }

    // Calculate transformation matrix L: L = (A'A)^(-1) A'P where A is the varimax loadings
    let a_transpose_a = loadings.transpose() * loadings;
    let a_transpose_a_inv = match a_transpose_a.try_inverse() {
        Some(inv) => inv,
        None => {
            return Err("Could not invert A'A matrix for Promax rotation".to_string());
        }
    };

    let a_transpose_p = loadings.transpose() * target_matrix;
    let transformation_matrix = a_transpose_a_inv * a_transpose_p;

    // Normalize the transformation matrix by column
    let mut normalized_transformation = DMatrix::zeros(n_cols, n_cols);
    for j in 0..n_cols {
        // Calculate the column norm
        let mut sum_squared = 0.0;
        for i in 0..n_cols {
            sum_squared += transformation_matrix[(i, j)].powi(2);
        }

        let norm = sum_squared.sqrt();
        if norm > 1e-10 {
            for i in 0..n_cols {
                normalized_transformation[(i, j)] = transformation_matrix[(i, j)] / norm;
            }
        }
    }

    // Calculate factor correlations: R_ff = C (Q'Q)^(-1) C'
    // where Q is the normalized transformation matrix and C is a diagonal matrix

    // Calculate Q'Q
    let q_transpose_q = normalized_transformation.transpose() * normalized_transformation.clone();

    // Calculate (Q'Q)^(-1)
    let q_transpose_q_inv = match q_transpose_q.try_inverse() {
        Some(inv) => inv,
        None => {
            // If inversion fails, return identity
            DMatrix::identity(n_cols, n_cols)
        }
    };

    // Create diagonal matrix C with sqrt of diagonal elements of (Q'Q)^(-1)
    let mut c_matrix = DMatrix::zeros(n_cols, n_cols);
    for i in 0..n_cols {
        c_matrix[(i, i)] = q_transpose_q_inv[(i, i)].sqrt();
    }

    // Factor correlations: R_ff = C (Q'Q)^(-1) C'
    let factor_correlations = &c_matrix * &q_transpose_q_inv * c_matrix.transpose();

    // Calculate rotated loadings: X * Q * C^(-1)
    let mut c_inv = DMatrix::zeros(n_cols, n_cols);
    for i in 0..n_cols {
        if c_matrix[(i, i)] > 1e-10 {
            c_inv[(i, i)] = 1.0 / c_matrix[(i, i)];
        } else {
            c_inv[(i, i)] = 1.0;
        }
    }

    let rotated_loadings = loadings * normalized_transformation.clone() * c_inv;

    // Rearrange factors in descending order of variance explained
    let mut factor_variances = vec![0.0; n_cols];
    for j in 0..n_cols {
        for i in 0..n_rows {
            factor_variances[j] += rotated_loadings[(i, j)].powi(2);
        }
    }

    let mut indices: Vec<usize> = (0..n_cols).collect();
    indices.sort_by(|&i, &j|
        factor_variances[j].partial_cmp(&factor_variances[i]).unwrap_or(std::cmp::Ordering::Equal)
    );

    let mut sorted_loadings = DMatrix::zeros(n_rows, n_cols);
    let mut sorted_transform = DMatrix::zeros(n_cols, n_cols);
    let mut sorted_correlations = DMatrix::zeros(n_cols, n_cols);

    for (new_j, &old_j) in indices.iter().enumerate() {
        for i in 0..n_rows {
            sorted_loadings[(i, new_j)] = rotated_loadings[(i, old_j)];
        }

        for i in 0..n_cols {
            sorted_transform[(i, new_j)] = normalized_transformation[(i, old_j)];

            // Rearrange factor correlations
            for k in 0..n_cols {
                sorted_correlations[(new_j, indices[k])] = factor_correlations[(old_j, k)];
                sorted_correlations[(indices[k], new_j)] = factor_correlations[(k, old_j)];
            }
        }
    }

    Ok(RotationResult {
        rotated_loadings: sorted_loadings,
        transformation_matrix: sorted_transform,
        factor_correlations: Some(sorted_correlations),
    })
}

// Create rotated component matrix result
pub fn create_rotated_component_matrix(
    rotation_result: &RotationResult,
    var_names: &[String]
) -> RotatedComponentMatrix {
    let mut components = HashMap::new();
    let rotated_loadings = &rotation_result.rotated_loadings;
    let n_rows = rotated_loadings.nrows();
    let n_cols = rotated_loadings.ncols();

    for (i, var_name) in var_names.iter().enumerate() {
        if i < n_rows {
            let mut loadings = Vec::with_capacity(n_cols);

            for j in 0..n_cols {
                loadings.push(rotated_loadings[(i, j)]);
            }

            components.insert(var_name.clone(), loadings);
        }
    }

    RotatedComponentMatrix {
        components,
    }
}

// Create component transformation matrix result
pub fn create_component_transformation_matrix(
    rotation_result: &RotationResult
) -> ComponentTransformationMatrix {
    let transformation_matrix = &rotation_result.transformation_matrix;
    let n_rows = transformation_matrix.nrows();
    let n_cols = transformation_matrix.ncols();

    let mut components = Vec::with_capacity(n_rows);

    for i in 0..n_rows {
        let mut row = Vec::with_capacity(n_cols);

        for j in 0..n_cols {
            row.push(transformation_matrix[(i, j)]);
        }

        components.push(row);
    }

    ComponentTransformationMatrix {
        components,
    }
}

// Calculate factor scores
pub fn calculate_score_coefficients(
    matrix: &DMatrix<f64>,
    result: &ExtractionResult,
    config: &FactorAnalysisConfig,
    var_names: &[String]
) -> Result<(ComponentScoreCoefficientMatrix, ComponentScoreCovarianceMatrix), String> {
    let loadings = &result.loadings;
    let n_rows = loadings.nrows();
    let n_cols = loadings.ncols();

    let mut coefficients = DMatrix::zeros(n_rows, n_cols);

    // Choose factor score coefficient method
    if config.scores.regression {
        // Regression method
        // W = R^(-1) * A where A is the loadings matrix and R is the correlation matrix
        match matrix.clone().try_inverse() {
            Some(inv_matrix) => {
                coefficients = inv_matrix * loadings;
            }
            None => {
                return Err(
                    "Could not invert correlation matrix for factor score calculation".to_string()
                );
            }
        }
    } else if config.scores.bartlett {
        // Bartlett method
        // W = (A'*U^(-2)*A)^(-1)*A'*U^(-2) where U^2 = diag(1-h_j^2)

        // Calculate U^(-2) matrix - diagonal matrix of reciprocals of uniquenesses
        let mut u_inv_squared = DMatrix::zeros(n_rows, n_rows);
        for i in 0..n_rows {
            let h_squared = if i < result.communalities.len() {
                result.communalities[i]
            } else {
                0.0
            };

            // Avoid division by zero
            let u_squared = (1.0 - h_squared).max(0.001);
            u_inv_squared[(i, i)] = 1.0 / u_squared;
        }

        // Calculate (A'*U^(-2)*A)
        let a_transpose_u_inv_squared_a = loadings.transpose() * u_inv_squared.clone() * loadings;

        // Invert (A'*U^(-2)*A)
        match a_transpose_u_inv_squared_a.try_inverse() {
            Some(ata_inv) => {
                coefficients = ata_inv * loadings.transpose() * u_inv_squared;
            }
            None => {
                return Err("Could not invert matrix for Bartlett method".to_string());
            }
        }
    } else if config.scores.anderson {
        // Anderson-Rubin method
        // W = U^(-1)*A*(A'*U^(-2)*A)^(-1/2)

        // Calculate U^(-1) matrix - diagonal matrix of reciprocals of sqrt of uniquenesses
        let mut u_inv = DMatrix::zeros(n_rows, n_rows);
        let mut u_inv_squared = DMatrix::zeros(n_rows, n_rows);

        for i in 0..n_rows {
            let h_squared = if i < result.communalities.len() {
                result.communalities[i]
            } else {
                0.0
            };

            // Avoid division by zero
            let u_squared = (1.0 - h_squared).max(0.001);
            u_inv[(i, i)] = 1.0 / u_squared.sqrt();
            u_inv_squared[(i, i)] = 1.0 / u_squared;
        }

        // Calculate A'*U^(-2)*A
        let a_transpose_u_inv_squared_a = loadings.transpose() * u_inv_squared * loadings;

        // Calculate symmetric square root
        match symmetric_matrix_sqrt(&a_transpose_u_inv_squared_a) {
            Some(ata_u_sqrt) => {
                match ata_u_sqrt.try_inverse() {
                    Some(ata_u_sqrt_inv) => {
                        coefficients = u_inv * loadings * ata_u_sqrt_inv;
                    }
                    None => {
                        return Err(
                            "Could not invert square root matrix for Anderson-Rubin method".to_string()
                        );
                    }
                }
            }
            None => {
                return Err(
                    "Could not calculate square root of matrix for Anderson-Rubin method".to_string()
                );
            }
        }
    } else {
        // Default to regression method
        match matrix.clone().try_inverse() {
            Some(inv_matrix) => {
                coefficients = inv_matrix * loadings;
            }
            None => {
                return Err(
                    "Could not invert correlation matrix for factor score calculation".to_string()
                );
            }
        }
    }

    // Convert to result structures
    let mut component_score_coefficient_matrix = ComponentScoreCoefficientMatrix {
        components: HashMap::new(),
    };

    for (i, var_name) in var_names.iter().enumerate() {
        if i < n_rows {
            let mut factor_scores = Vec::with_capacity(n_cols);

            for j in 0..n_cols {
                factor_scores.push(coefficients[(i, j)]);
            }

            component_score_coefficient_matrix.components.insert(var_name.clone(), factor_scores);
        }
    }

    // Calculate factor score covariance matrix
    // For regression method: (B'R^(-1)B)
    // For Bartlett method: (A'U^(-2)A)^(-1)
    // For Anderson-Rubin method: Identity matrix
    let mut component_score_covariance_matrix = ComponentScoreCovarianceMatrix {
        components: vec![vec![0.0; n_cols]; n_cols],
    };

    if config.scores.anderson {
        // Anderson-Rubin method produces uncorrelated scores (identity covariance matrix)
        for i in 0..n_cols {
            for j in 0..n_cols {
                component_score_covariance_matrix.components[i][j] = if i == j { 1.0 } else { 0.0 };
            }
        }
    } else if config.scores.bartlett {
        // Bartlett method: (A'U^(-2)A)^(-1)
        let mut u_inv_squared = DMatrix::zeros(n_rows, n_rows);
        for i in 0..n_rows {
            let h_squared = if i < result.communalities.len() {
                result.communalities[i]
            } else {
                0.0
            };

            let u_squared = (1.0 - h_squared).max(0.001);
            u_inv_squared[(i, i)] = 1.0 / u_squared;
        }

        let a_transpose_u_inv_squared_a = loadings.transpose() * u_inv_squared * loadings;

        match a_transpose_u_inv_squared_a.try_inverse() {
            Some(cov_matrix) => {
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = cov_matrix[(i, j)];
                    }
                }
            }
            None => {
                // Fall back to identity matrix
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = if i == j {
                            1.0
                        } else {
                            0.0
                        };
                    }
                }
            }
        }
    } else {
        // Regression method: (B'R^(-1)B)
        match matrix.clone().try_inverse() {
            Some(r_inv) => {
                let cov_matrix = coefficients.transpose() * r_inv * coefficients;
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = cov_matrix[(i, j)];
                    }
                }
            }
            None => {
                // Fall back to identity matrix
                for i in 0..n_cols {
                    for j in 0..n_cols {
                        component_score_covariance_matrix.components[i][j] = if i == j {
                            1.0
                        } else {
                            0.0
                        };
                    }
                }
            }
        }
    }

    Ok((component_score_coefficient_matrix, component_score_covariance_matrix))
}

// Helper function to calculate the symmetric square root of a matrix
pub fn symmetric_matrix_sqrt(matrix: &DMatrix<f64>) -> Option<DMatrix<f64>> {
    let n = matrix.nrows();
    if n != matrix.ncols() {
        return None;
    }

    // Perform eigenvalue decomposition
    let eigen = matrix.clone().symmetric_eigen();

    // Create diagonal matrix of sqrt of eigenvalues
    let mut d_sqrt = DMatrix::zeros(n, n);
    for i in 0..n {
        if eigen.eigenvalues[i] < 0.0 {
            // Matrix is not positive definite
            return None;
        }
        d_sqrt[(i, i)] = eigen.eigenvalues[i].sqrt();
    }

    // Compute Q * D^(1/2) * Q'
    Some(eigen.eigenvectors.clone() * d_sqrt * eigen.eigenvectors.transpose())
}

// Create scree plot data
pub fn create_scree_plot(extraction_result: &ExtractionResult) -> ScreePlot {
    let eigenvalues = extraction_result.eigenvalues.clone();
    let mut component_numbers = Vec::with_capacity(eigenvalues.len());

    for i in 0..eigenvalues.len() {
        component_numbers.push(i + 1);
    }

    ScreePlot {
        eigenvalues,
        component_numbers,
    }
}

// Helper functions for statistical distributions

// Chi-square cumulative distribution function
pub fn chi_square_cdf(x: f64, df: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }

    // For chi-square, we use the relationship with gamma distribution
    // CDF(x; df) = P(df/2, x/2) where P is the regularized gamma function
    let a = df / 2.0;
    let y = x / 2.0;

    gamma_p(a, y)
}

// Regularized gamma function P(a,x)
pub fn gamma_p(a: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x < a + 1.0 {
        // Use series expansion
        let mut sum = 1.0 / a;
        let mut term = 1.0 / a;
        for i in 1..100 {
            term *= x / (a + (i as f64));
            sum += term;
            if term < 1e-10 * sum {
                break;
            }
        }
        let gamma_a = gamma_function(a);
        return (sum * (x.powf(a) * (-x).exp())) / gamma_a;
    } else {
        // Use continued fraction
        return 1.0 - gamma_q(a, x);
    }
}

// Regularized gamma function Q(a,x) = 1 - P(a,x)
pub fn gamma_q(a: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 1.0;
    }

    // Use continued fraction for Q
    let mut b = x + 1.0 - a;
    let mut c = 1.0 / 1e-30;
    let mut d = 1.0 / b;
    let mut h = d;

    for i in 1..100 {
        let an = (-i as f64) * ((i as f64) - a);
        b += 2.0;
        d = 1.0 / (b + an * d);
        c = b + an / c;
        let del = c * d;
        h *= del;
        if (del - 1.0).abs() < 1e-10 {
            break;
        }
    }

    let gamma_a = gamma_function(a);
    (h * (x.powf(a) * (-x).exp())) / gamma_a
}

// Gamma function approximation (Lanczos approximation)
pub fn gamma_function(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::MAX; // Singularity
    }

    // Lanczos coefficients
    let p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
        12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    let mut y = x;
    let mut result = 0.99999999999980993;

    for i in 0..8 {
        result += p[i] / (y + (i as f64));
    }

    let t = y + 7.5;
    let sqrt_2pi = (2.0 * PI).sqrt();

    sqrt_2pi * t.powf(y - 0.5) * (-t).exp() * result
}

// Incomplete beta function for p-value calculations
pub fn incomplete_beta(a: f64, b: f64, x: f64) -> f64 {
    if x <= 0.0 {
        return 0.0;
    }
    if x >= 1.0 {
        return 1.0;
    }

    let lbeta_ab = ln_gamma(a) + ln_gamma(b) - ln_gamma(a + b);
    let front = (x.powf(a) * (1.0 - x).powf(b)) / (a * lbeta_ab.exp());

    if x < (a + 1.0) / (a + b + 2.0) {
        // Use series expansion
        let mut sum = 1.0;
        let mut term = 1.0;
        let mut n = 1.0;

        while n < 100.0 {
            term *= ((a + n - 1.0) * (a + b + n - 1.0) * x) / ((a + n) * n);
            sum += term;
            if term < 1e-10 * sum {
                break;
            }
            n += 1.0;
        }

        return front * sum;
    } else {
        // Use continued fraction representation
        return 1.0 - incomplete_beta(b, a, 1.0 - x);
    }
}

// Log gamma function
pub fn ln_gamma(x: f64) -> f64 {
    if x <= 0.0 {
        return f64::NAN;
    }

    // Lanczos approximation
    let p = [
        676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
        12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7,
    ];

    let mut y = x;
    let mut result = 0.99999999999980993;

    for i in 0..8 {
        result += p[i] / (y + (i as f64));
    }

    let t = y + 7.5;
    let sqrt_2pi = (2.0 * PI).sqrt();

    sqrt_2pi.ln() + (y - 0.5) * t.ln() - t + (result / y).ln()
}

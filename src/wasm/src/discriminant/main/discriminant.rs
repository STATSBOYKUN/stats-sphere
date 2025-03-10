use wasm_bindgen::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

use crate::discriminant::main::types::{
    FLambdaResult, BoxMResult, ChiSquareResult,
    DiscriminantResults, ClassificationResults, ClassificationResult,
    EigenStats
};
use crate::discriminant::main::matrices::{
    matrix_inverse, matrix_determinant, power_iteration,
    dot_product, find_eigenpairs, log_determinant
};
use crate::discriminant::main::stats::{
    chi_square_cdf, f_distribution_cdf, chi_square_p_value, f_test_p_value,
    mahalanobis_distance
};
use crate::discriminant::main::utils::{
    extract_first_field_name, extract_field_value,
    round_to_decimal, format_p_value, argmax
};

/// Core implementation of discriminant analysis
pub struct DiscriminantAnalysis {
    // Jumlah kelompok
    pub g: usize,
    // Jumlah variabel
    pub p: usize,
    // Jumlah variabel yang dipilih
    pub q: usize,
    // Data untuk setiap kelompok (g matriks)
    // Setiap matriks berukuran mj x p, di mana mj adalah jumlah kasus dalam kelompok j
    pub data: Vec<Vec<Vec<f64>>>,
    // Bobot kasus untuk setiap kelompok
    pub weights: Vec<Vec<f64>>,
    // Jumlah kasus di setiap kelompok
    pub m: Vec<usize>,
    // Jumlah bobot kasus di setiap kelompok
    pub n_j: Vec<f64>,
    // Jumlah total bobot
    pub n: f64,
    // Means untuk setiap variabel i dalam grup j
    pub means_by_group: Vec<Vec<f64>>,
    // Means untuk setiap variabel i (keseluruhan)
    pub means_overall: Vec<f64>,
    // Within-Groups Sums of Squares and Cross-Product Matrix (W)
    pub w_matrix: Vec<Vec<f64>>,
    // Total Sums of Squares and Cross-Product Matrix (T)
    pub t_matrix: Vec<Vec<f64>>,
    // Within-Groups Covariance Matrix
    pub c_matrix: Vec<Vec<f64>>,
    // Individual Group Covariance Matrices
    pub c_group_matrices: Vec<Vec<Vec<f64>>>,
    // Within-Groups Correlation Matrix
    pub r_matrix: Vec<Vec<f64>>,
    // Total Covariance Matrix
    pub t_prime_matrix: Vec<Vec<f64>>,
    // Canonical Discriminant Function Coefficients
    pub canonical_coefficients: Vec<Vec<f64>>,
    // Eigenvalues
    pub eigenvalues: Vec<f64>,
    // Prior probabilities
    pub priors: Vec<f64>,
    // Variable names
    pub variable_names: Vec<String>,
    // Group variable name
    pub group_name: String,
    // Group values (0, 1, etc.)
    pub group_values: Vec<usize>,
}

impl DiscriminantAnalysis {
    /// Creates a new DiscriminantAnalysis instance
    pub fn new(
        group_data: Vec<Vec<Value>>,
        independent_data: Vec<Vec<Value>>,
        min_range: f64,
        max_range: f64,
        prior_probs: Option<Vec<f64>>
    ) -> Result<Self, String> {
        if group_data.is_empty() {
            return Err("No group data provided".into());
        }

        if independent_data.is_empty() {
            return Err("No independent variables provided".into());
        }

        // Extract group field name
        let group_field_name = if !group_data[0].is_empty() {
            match extract_first_field_name(&group_data[0][0]) {
                Some(name) => name,
                None => return Err("Could not determine group field name".into()),
            }
        } else {
            return Err("Group data is empty".into());
        };

        // Extract unique group values
        let mut unique_groups = Vec::new();

        for group_list in &group_data {
            for group_item in group_list {
                if let Some(group_value) = group_item.get(&group_field_name)
                    .and_then(|val| val.as_u64())
                    .map(|val| val as usize) {
                    if !unique_groups.contains(&group_value) {
                        unique_groups.push(group_value);
                    }
                }
            }
        }

        // Sort the groups
        unique_groups.sort();

        // Determine number of groups
        let g = unique_groups.len();
        if g == 0 {
            return Err("No valid groups found in data".into());
        }

        // Number of independent variables (each array in independent_data is a variable)
        let p = independent_data.len();
        if p == 0 {
            return Err("No independent variables provided".into());
        }

        // Extract variable field names
        let mut var_field_names = Vec::with_capacity(p);
        for var_data in &independent_data {
            if !var_data.is_empty() {
                match extract_first_field_name(&var_data[0]) {
                    Some(name) => var_field_names.push(name),
                    None => return Err("Could not determine variable field name".into()),
                }
            } else {
                return Err("Variable data is empty".into());
            }
        }

        // Create a mapping from group value to index
        let mut group_to_index = HashMap::new();
        for (i, &group) in unique_groups.iter().enumerate() {
            group_to_index.insert(group, i);
        }

        // Determine the number of cases
        let num_cases = if !group_data[0].is_empty() {
            group_data[0].len()
        } else {
            return Err("No cases found in group data".into());
        };

        // Check that all variables have the same number of cases
        for var_data in &independent_data {
            if var_data.len() != num_cases {
                return Err("All variables must have the same number of cases".into());
            }
        }

        // Initially all variables are selected
        let q = p;

        // Prepare data structures
        let mut grouped_data: Vec<Vec<Vec<f64>>> = vec![Vec::new(); g];
        let mut grouped_weights: Vec<Vec<f64>> = vec![Vec::new(); g];

        // Process the data case by case
        for case_idx in 0..num_cases {
            // Get the group for this case
            if case_idx >= group_data[0].len() {
                continue; // Skip if out of bounds
            }

            let group_value = match group_data[0][case_idx].get(&group_field_name)
                .and_then(|val| val.as_u64())
                .map(|val| val as usize) {
                Some(val) => val,
                None => continue, // Skip if no valid group
            };

            // Get the group index
            let group_idx = match group_to_index.get(&group_value) {
                Some(&idx) => idx,
                None => continue, // Skip if group not in mapping
            };

            // Get the values for all variables for this case
            let mut case_values = Vec::with_capacity(p);
            let mut all_values_valid = true;

            for var_idx in 0..p {
                if var_idx >= independent_data.len() || case_idx >= independent_data[var_idx].len() {
                    all_values_valid = false;
                    break;
                }

                let field_name = &var_field_names[var_idx];
                match extract_field_value(&independent_data[var_idx][case_idx], field_name) {
                    Some(val) => {
                        // Scale the values to be between min_range and max_range if needed
                        let scaled_val = if max_range > min_range {
                            min_range + (val - min_range) * (max_range - min_range) / (max_range - min_range)
                        } else {
                            val
                        };
                        case_values.push(scaled_val);
                    },
                    None => {
                        all_values_valid = false;
                        break;
                    }
                }
            }

            // Only add the case if all values were valid
            if all_values_valid {
                // Default weight is 1.0
                let weight = 1.0;

                grouped_data[group_idx].push(case_values);
                grouped_weights[group_idx].push(weight);
            }
        }

        // Count cases in each group
        let m: Vec<usize> = grouped_data.iter().map(|group| group.len()).collect();

        // Validate number of cases
        for (i, &count) in m.iter().enumerate() {
            if count == 0 {
                return Err(format!("Group {} has no valid cases", i + 1));
            }
        }

        // Sum of weights in each group
        let n_j: Vec<f64> = grouped_weights.iter()
            .map(|weights| weights.iter().sum())
            .collect();

        // Total sum of weights
        let n: f64 = n_j.iter().sum();

        // Compute prior probabilities
        let priors = match prior_probs {
            Some(p) => {
                if p.len() != g {
                    return Err(format!("Prior probabilities must have length {}", g));
                }
                p
            },
            None => {
                // Default priors: 0.5 for each group (equal priors)
                // This matches the example output where each group has 0.5 prior
                vec![0.5; g]
            }
        };

        // Create instance with basic data
        let mut da = DiscriminantAnalysis {
            g,
            p,
            q,
            data: grouped_data,
            weights: grouped_weights,
            m,
            n_j,
            n,
            means_by_group: vec![vec![0.0; p]; g],
            means_overall: vec![0.0; p],
            w_matrix: vec![vec![0.0; p]; p],
            t_matrix: vec![vec![0.0; p]; p],
            c_matrix: vec![vec![0.0; p]; p],
            c_group_matrices: vec![vec![vec![0.0; p]; p]; g],
            r_matrix: vec![vec![0.0; p]; p],
            t_prime_matrix: vec![vec![0.0; p]; p],
            canonical_coefficients: vec![vec![0.0; 0]; p],
            eigenvalues: vec![],
            priors,
            variable_names: var_field_names,
            group_name: group_field_name,
            group_values: unique_groups,
        };

        // Compute basic statistics
        da.compute_basic_statistics()?;

        Ok(da)
    }

    /// Compute basic statistics: means, matrices, etc.
    pub fn compute_basic_statistics(&mut self) -> Result<(), String> {
        // 1. Calculate means for each group
        for j in 0..self.g {
            for i in 0..self.p {
                // Mean of variable i in group j
                let mut sum_weighted_values = 0.0;

                for k in 0..self.m[j] {
                    sum_weighted_values += self.weights[j][k] * self.data[j][k][i];
                }

                self.means_by_group[j][i] = sum_weighted_values / self.n_j[j];
            }
        }

        // 2. Calculate overall means for each variable
        for i in 0..self.p {
            let mut sum_weighted_values = 0.0;

            for j in 0..self.g {
                for k in 0..self.m[j] {
                    sum_weighted_values += self.weights[j][k] * self.data[j][k][i];
                }
            }

            self.means_overall[i] = sum_weighted_values / self.n;
        }

        // 3. Calculate Within-Groups Sums of Squares and Cross-Product Matrix (W)
        for i in 0..self.p {
            for l in 0..=i {
                let mut first_term = 0.0;
                let mut second_term = 0.0;

                for j in 0..self.g {
                    let mut sum_weighted_i = 0.0;
                    let mut sum_weighted_l = 0.0;

                    for k in 0..self.m[j] {
                        let weight = self.weights[j][k];
                        let x_ijk = self.data[j][k][i];
                        let x_ljk = self.data[j][k][l];

                        first_term += weight * x_ijk * x_ljk;
                        sum_weighted_i += weight * x_ijk;
                        sum_weighted_l += weight * x_ljk;
                    }

                    second_term += (sum_weighted_i * sum_weighted_l) / self.n_j[j];
                }

                self.w_matrix[i][l] = first_term - second_term;
                if i != l {
                    self.w_matrix[l][i] = self.w_matrix[i][l];
                }
            }
        }

        // 4. Calculate Total Sums of Squares and Cross-Product Matrix (T)
        for i in 0..self.p {
            for l in 0..=i {
                let mut first_term = 0.0;
                let mut sum_weighted_i = 0.0;
                let mut sum_weighted_l = 0.0;

                for j in 0..self.g {
                    for k in 0..self.m[j] {
                        let weight = self.weights[j][k];
                        let x_ijk = self.data[j][k][i];
                        let x_ljk = self.data[j][k][l];

                        first_term += weight * x_ijk * x_ljk;
                        sum_weighted_i += weight * x_ijk;
                        sum_weighted_l += weight * x_ljk;
                    }
                }

                let second_term = (sum_weighted_i * sum_weighted_l) / self.n;

                self.t_matrix[i][l] = first_term - second_term;
                if i != l {
                    self.t_matrix[l][i] = self.t_matrix[i][l];
                }
            }
        }

        // 5. Calculate Within-Groups Covariance Matrix (C)
        // C = W / (n - g)
        if self.n <= self.g as f64 {
            return Err("Number of cases must be greater than the number of groups".into());
        }

        for i in 0..self.p {
            for j in 0..self.p {
                self.c_matrix[i][j] = self.w_matrix[i][j] / (self.n - self.g as f64);
            }
        }

        // 6. Calculate Individual Group Covariance Matrices
        for j in 0..self.g {
            for i in 0..self.p {
                for l in 0..=i {
                    let mut sum_product = 0.0;

                    for k in 0..self.m[j] {
                        let weight = self.weights[j][k];
                        let x_ijk = self.data[j][k][i];
                        let x_ljk = self.data[j][k][l];

                        sum_product += weight * x_ijk * x_ljk;
                    }

                    let mean_product = self.means_by_group[j][i] * self.means_by_group[j][l] * self.n_j[j];

                    if self.n_j[j] <= 1.0 {
                        return Err(format!("Group {} must have more than one case", j + 1));
                    }

                    self.c_group_matrices[j][i][l] = (sum_product - mean_product) / (self.n_j[j] - 1.0);
                    if i != l {
                        self.c_group_matrices[j][l][i] = self.c_group_matrices[j][i][l];
                    }
                }
            }
        }

        // 7. Calculate Within-Groups Correlation Matrix (R)
        for i in 0..self.p {
            for l in 0..=i {
                let w_ii = self.w_matrix[i][i];
                let w_ll = self.w_matrix[l][l];

                if w_ii > 0.0 && w_ll > 0.0 {
                    self.r_matrix[i][l] = self.w_matrix[i][l] / (w_ii * w_ll).sqrt();
                    if i != l {
                        self.r_matrix[l][i] = self.r_matrix[i][l];
                    }
                } else {
                    self.r_matrix[i][l] = f64::NAN;
                    if i != l {
                        self.r_matrix[l][i] = self.r_matrix[i][l];
                    }
                }
            }
        }

        // 8. Calculate Total Covariance Matrix (T')
        // T' = T / (n - 1)
        if self.n <= 1.0 {
            return Err("Number of cases must be greater than one".into());
        }

        for i in 0..self.p {
            for j in 0..self.p {
                self.t_prime_matrix[i][j] = self.t_matrix[i][j] / (self.n - 1.0);
            }
        }

        Ok(())
    }

    /// Calculate Wilks' Lambda, F-values for variable equality tests
    pub fn univariate_f_lambda(&self, i: usize) -> Result<FLambdaResult, String> {
        if i >= self.p {
            return Err(format!("Variable index {} out of bounds", i));
        }

        let t_ii = self.t_matrix[i][i];
        let w_ii = self.w_matrix[i][i];

        // F_i = ((t_ii - w_ii) * (n - g)) / (w_ii * (g - 1))
        let f_i = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);

        // Lambda_i = w_ii / t_ii
        let lambda_i = w_ii / t_ii;

        let df1 = self.g - 1;
        let df2 = (self.n - self.g as f64) as usize;

        // P-value
        let sig = f_test_p_value(f_i, df1 as u32, df2 as u32);

        Ok(FLambdaResult {
            f: round_to_decimal(f_i, 3),
            lambda: round_to_decimal(lambda_i, 3),
            df1: df1 as u32,
            df2: df2 as u32,
            sig: round_to_decimal(sig, 3),
        })
    }

    /// Perform Box's M test for equality of covariance matrices
    pub fn box_m_test(&self) -> Result<BoxMResult, String> {
        // Check number of groups
        if self.g < 2 {
            return Err("Box's M test requires at least two groups".into());
        }

        // Filter groups with nonsingular covariance matrices
        let mut valid_groups = Vec::new();
        let mut valid_n_j = Vec::new();

        for j in 0..self.g {
            match matrix_determinant(&self.c_group_matrices[j]) {
                Some(det) if det > 1e-10 => {
                    valid_groups.push(j);
                    valid_n_j.push(self.n_j[j]);
                },
                _ => {}
            }
        }

        let g_prime = valid_groups.len();

        if g_prime < 2 {
            return Err("Box's M test requires at least two groups with nonsingular covariance matrices".into());
        }

        // Calculate n_prime
        let n_prime: f64 = valid_n_j.iter().sum();

        // Calculate pooled within-groups covariance matrix C'
        let mut c_prime = vec![vec![0.0; self.p]; self.p];

        for (idx, &j) in valid_groups.iter().enumerate() {
            for i in 0..self.p {
                for k in 0..self.p {
                    c_prime[i][k] += self.c_group_matrices[j][i][k] * (valid_n_j[idx] - 1.0);
                }
            }
        }

        for i in 0..self.p {
            for k in 0..self.p {
                c_prime[i][k] /= n_prime - g_prime as f64;
            }
        }

        // Calculate log determinants
        let mut log_dets = Vec::with_capacity(g_prime + 1);

        // Pooled log determinant
        let c_prime_log_det = log_determinant(&c_prime)
            .ok_or_else(|| "Singular pooled covariance matrix".to_string())?;
        log_dets.push(c_prime_log_det);

        // Group log determinants
        for &j in &valid_groups {
            let c_j_log_det = log_determinant(&self.c_group_matrices[j])
                .ok_or_else(|| format!("Singular covariance matrix for group {}", j))?;
            log_dets.push(c_j_log_det);
        }

        // Calculate Box's M
        let mut m = (n_prime - g_prime as f64) * log_dets[0];

        for (idx, &j) in valid_groups.iter().enumerate() {
            m -= (valid_n_j[idx] - 1.0) * log_dets[idx + 1];
        }

        // Calculate F statistic
        let p = self.p as f64;

        // Calculate e1
        let mut sum_reciprocal = 0.0;
        for n_j in &valid_n_j {
            sum_reciprocal += 1.0 / (n_j - 1.0);
        }
        sum_reciprocal -= 1.0 / (n_prime - g_prime as f64);

        let e1 = sum_reciprocal * (2.0 * p * p + 3.0 * p - 1.0) / (6.0 * (g_prime - 1) as f64 * (p + 1.0));

        // Calculate e2
        let mut sum_reciprocal_squared = 0.0;
        for n_j in &valid_n_j {
            sum_reciprocal_squared += 1.0 / ((n_j - 1.0).powi(2));
        }
        sum_reciprocal_squared -= 1.0 / ((n_prime - g_prime as f64).powi(2));

        let e2 = sum_reciprocal_squared * ((p - 1.0) * (p + 2.0)) / (6.0 * (g_prime - 1) as f64);

        // Calculate degrees of freedom
        let t1 = (g_prime - 1) as f64 * (p + 1.0) / 2.0;

        let mut f;
        let mut t2;
        let mut b;

        if e2 > e1.powi(2) {
            t2 = (t1 + 2.0) / (e2 - e1.powi(2)).abs();
            b = t1 / (1.0 - e1 - t1 / t2);
            f = m / b;
        } else {
            t2 = (t1 + 2.0) / 0.0001; // Avoid division by zero
            b = t2 / (1.0 - e1 - 2.0 / t2);
            f = t2 * m / (t1 * (b - m));
        }

        // Calculate p-value
        let p_value = if t2 > 10000.0 {
            // Use chi-square approximation
            let chi2 = m * (1.0 - e1);
            chi_square_p_value(chi2, t1 as u32)
        } else {
            // Use F distribution
            f_test_p_value(f, t1 as u32, t2 as u32)
        };

        Ok(BoxMResult {
            m: round_to_decimal(m, 3),
            f: round_to_decimal(f, 3),
            df1: round_to_decimal(t1, 3),
            df2: round_to_decimal(t2, 3),
            p_value: round_to_decimal(p_value, 3),
        })
    }

    /// Compute canonical discriminant functions
    pub fn compute_canonical_discriminant_functions(&mut self) -> Result<(), String> {
        // Number of canonical functions is min(p, g-1)
        let m = std::cmp::min(self.q, self.g - 1);

        if m == 0 {
            return Err("Cannot compute canonical discriminant functions: min(q, g-1) = 0".into());
        }

        // Calculate T - W (between-groups sum of squares and cross-products)
        let mut t_minus_w = vec![vec![0.0; self.p]; self.p];
        for i in 0..self.p {
            for j in 0..self.p {
                t_minus_w[i][j] = self.t_matrix[i][j] - self.w_matrix[i][j];
            }
        }

        // Calculate inverse of W
        let w_inv = matrix_inverse(&self.w_matrix)
            .map_err(|e| format!("Failed to invert W matrix: {}", e))?;

        // Calculate (T-W) * W^-1
        let mut a = vec![vec![0.0; self.p]; self.p];
        for i in 0..self.p {
            for j in 0..self.p {
                let mut sum = 0.0;
                for k in 0..self.p {
                    sum += t_minus_w[i][k] * w_inv[k][j];
                }
                a[i][j] = sum;
            }
        }

        // Find eigenvalues and eigenvectors
        let (eigenvalues, eigenvectors) = find_eigenpairs(&a, m)
            .map_err(|e| format!("Eigenvalue computation failed: {}", e))?;

        // Store results
        self.eigenvalues = eigenvalues;

        // Initialize canonical coefficients matrix
        self.canonical_coefficients = vec![vec![0.0; m]; self.p];

        // Copy eigenvectors to canonical coefficients
        for i in 0..self.p {
            for j in 0..m {
                self.canonical_coefficients[i][j] = eigenvectors[i][j];
            }
        }

        Ok(())
    }

    /// Calculate standardized canonical discriminant function coefficients
    pub fn standardized_coefficients(&self) -> Result<Vec<Vec<f64>>, String> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut standardized = vec![vec![0.0; m]; self.p];

        for i in 0..self.p {
            let w_ii = self.w_matrix[i][i];
            if w_ii <= 0.0 {
                return Err(format!("Cannot compute standardized coefficients: w[{}][{}] <= 0", i, i));
            }

            let s_ii = w_ii.sqrt();

            for j in 0..m {
                standardized[i][j] = s_ii * self.canonical_coefficients[i][j];
            }
        }

        Ok(standardized)
    }

    /// Calculate structure matrix (correlations between variables and discriminant functions)
    pub fn structure_matrix(&self) -> Result<Vec<Vec<f64>>, String> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut structure = vec![vec![0.0; m]; self.p];

        for i in 0..self.p {
            let w_ii = self.w_matrix[i][i];
            if w_ii <= 0.0 {
                return Err(format!("Cannot compute structure matrix: w[{}][{}] <= 0", i, i));
            }

            let s_ii_inv = 1.0 / w_ii.sqrt();

            for j in 0..m {
                let mut sum = 0.0;
                for k in 0..self.p {
                    sum += self.w_matrix[i][k] * self.canonical_coefficients[k][j];
                }
                structure[i][j] = s_ii_inv * sum;
            }
        }

        Ok(structure)
    }

    /// Calculate canonical correlations
    pub fn canonical_correlations(&self) -> Vec<f64> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut correlations = Vec::with_capacity(m);

        for k in 0..m {
            let lambda_k = self.eigenvalues[k];
            correlations.push((lambda_k / (1.0 + lambda_k)).sqrt());
        }

        correlations
    }

    /// Calculate Wilks' Lambda for the discriminant functions
    pub fn wilks_lambda(&self) -> Vec<ChiSquareResult> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut results = Vec::with_capacity(m);

        // Calculate lambda values
        for k in 0..m {
            let mut product = 1.0;

            for i in k..m {
                product *= 1.0 / (1.0 + self.eigenvalues[i]);
            }

            // Calculate chi-square
            let df = (self.p - k) * (self.g - k - 1);
            let chi_square = -(self.n - (self.p + self.g) as f64 / 2.0 - 1.0) * product.ln();
            let p_value = chi_square_p_value(chi_square, df as u32);

            results.push(ChiSquareResult {
                chi_square: round_to_decimal(chi_square, 3),
                df: df as u32,
                p_value: round_to_decimal(p_value, 3),
            });
        }

        results
    }

    /// Calculate eigenvalue statistics
    pub fn eigen_statistics(&self) -> Vec<EigenStats> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut stats = Vec::with_capacity(m);

        // Calculate sum of eigenvalues
        let sum_eigenvalues: f64 = self.eigenvalues.iter().sum();

        // Calculate percentage of variance for each eigenvalue
        let mut cumulative = 0.0;

        for k in 0..m {
            let eigenvalue = self.eigenvalues[k];
            let pct = (eigenvalue / sum_eigenvalues) * 100.0;
            cumulative += pct;

            let canonical_corr = (eigenvalue / (1.0 + eigenvalue)).sqrt();

            stats.push(EigenStats {
                eigenvalue: round_to_decimal(eigenvalue, 3),
                pct_of_variance: round_to_decimal(pct, 1),
                cumulative_pct: round_to_decimal(cumulative, 1),
                canonical_correlation: round_to_decimal(canonical_corr, 3),
            });
        }

        stats
    }

    /// Calculate group centroids
    pub fn group_centroids(&self) -> Vec<Vec<f64>> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut centroids = vec![vec![0.0; m]; self.g];

        // Calculate function values at group means
        for j in 0..self.g {
            for k in 0..m {
                let mut sum = 0.0;

                for i in 0..self.p {
                    sum += self.canonical_coefficients[i][k] * self.means_by_group[j][i];
                }

                centroids[j][k] = sum;
            }
        }

        centroids
    }

    /// Calculate unstandardized canonical discriminant function coefficients
    pub fn unstandardized_coefficients(&self) -> Result<Vec<Vec<f64>>, String> {
        let m = std::cmp::min(self.q, self.g - 1);

        // The unstandardized coefficients with constant
        let mut coeffs = vec![vec![0.0; m]; self.p + 1];

        // Copy the canonical coefficients
        for i in 0..self.p {
            for j in 0..m {
                coeffs[i][j] = self.canonical_coefficients[i][j];
            }
        }

        // Calculate the constant term for each function
        for j in 0..m {
            let mut sum = 0.0;

            for i in 0..self.p {
                sum += coeffs[i][j] * self.means_overall[i];
            }

            coeffs[self.p][j] = -sum;
        }

        Ok(coeffs)
    }

    /// Calculate classification function coefficients (Fisher's linear discriminant functions)
    pub fn classification_functions(&self) -> Result<Vec<Vec<f64>>, String> {
        // Calculate inverse of W
        let w_inv = matrix_inverse(&self.w_matrix)
            .map_err(|e| format!("Failed to invert W matrix: {}", e))?;

        // Classification function coefficients with constant term
        let mut coeffs = vec![vec![0.0; self.g]; self.p + 1];

        // Calculate coefficients for each group
        for j in 0..self.g {
            for i in 0..self.p {
                let mut sum = 0.0;

                for l in 0..self.p {
                    sum += w_inv[i][l] * self.means_by_group[j][l];
                }

                coeffs[i][j] = (self.n - self.g as f64) * sum;
            }

            // Calculate constant term
            let mut sum = 0.0;

            for i in 0..self.p {
                sum += coeffs[i][j] * self.means_by_group[j][i];
            }

            // Use a small value instead of 0 for priors to avoid -infinity
            let prior = if self.priors[j] <= 0.0 { 1e-10 } else { self.priors[j] };
            coeffs[self.p][j] = prior.ln() - 0.5 * sum;
        }

        Ok(coeffs)
    }

    /// Classify a new case
    pub fn classify(&self, x: &[f64]) -> Result<ClassificationResult, String> {
        if x.len() != self.p {
            return Err(format!("Input vector must have {} elements, got {}", self.p, x.len()));
        }

        // Number of functions
        let m = std::cmp::min(self.q, self.g - 1);

        // 1. Calculate discriminant function values
        let mut f = vec![0.0; m];

        for k in 0..m {
            let mut sum = 0.0;

            for i in 0..self.p {
                sum += self.canonical_coefficients[i][k] * x[i];
            }

            f[k] = sum;
        }

        // 2. Calculate Mahalanobis distances to group centroids
        let centroids = self.group_centroids();
        let mut mahalanobis_distances = vec![0.0; self.g];
        let mut chi_square_probs = vec![0.0; self.g];

        // Identity matrix for canonical space
        let identity = vec![vec![1.0; m]; m];

        for j in 0..self.g {
            let mut distance = 0.0;

            // Calculate squared distance in canonical space
            for k in 0..m {
                let diff = f[k] - centroids[j][k];
                distance += diff * diff;
            }

            mahalanobis_distances[j] = distance;

            // Chi-square probability
            chi_square_probs[j] = 1.0 - chi_square_cdf(distance, m as u32);
        }

        // 3. Calculate posterior probabilities
        let mut g_j = vec![0.0; self.g];

        for j in 0..self.g {
            // Use a small value instead of 0 for priors to avoid -infinity
            let prior = if self.priors[j] <= 0.0 { 1e-10 } else { self.priors[j] };
            g_j[j] = prior.ln() - 0.5 * mahalanobis_distances[j];
        }

        let max_g = g_j.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

        let mut posterior = vec![0.0; self.g];
        let mut denominator = 0.0;

        for j in 0..self.g {
            let g_diff = g_j[j] - max_g;

            if g_diff > -46.0 {
                let p = (g_diff).exp();
                posterior[j] = p;
                denominator += p;
            }
        }

        if denominator > 0.0 {
            for j in 0..self.g {
                posterior[j] /= denominator;
            }
        }

        // 4. Determine predicted group
        let predicted_group = match argmax(&posterior) {
            Some(idx) => idx,
            None => return Err("Failed to determine predicted group".into()),
        };

        Ok(ClassificationResult {
            predicted_group,
            posterior_probabilities: posterior,
            discriminant_functions: f,
            mahalanobis_distances,
            chi_square_probs,
        })
    }

    /// Perform cross-validation
    pub fn cross_validate(&self) -> Result<ClassificationResults, String> {
        // Pre-allocate count matrices
        let mut original_count = vec![vec![0; self.g]; self.g];
        let mut cross_val_count = vec![vec![0; self.g]; self.g];

        // Calculate pooled covariance matrix inverse
        let c_inv = matrix_inverse(&self.c_matrix)
            .map_err(|_| "Cannot compute inverse of pooled covariance matrix".to_string())?;

        // Original classification
        for j in 0..self.g {
            for k in 0..self.m[j] {
                // Extract case
                let x = &self.data[j][k];

                // Classify using all data
                let result = self.classify(x)?;
                let predicted = result.predicted_group;

                // Update original classification counts
                original_count[j][predicted] += 1;

                // Cross-validation: leave-one-out
                // Find group with minimum Mahalanobis distance (excluding case k)
                let mut min_distance = f64::INFINITY;
                let mut cv_predicted = 0;

                for i in 0..self.g {
                    // Skip groups with prior probability of 0
                    if self.priors[i] <= 0.0 {
                        continue;
                    }

                    // For non-self groups, use original means
                    if i != j {
                        // Calculate Mahalanobis distance
                        let distance = mahalanobis_distance(x, &self.means_by_group[i], &c_inv);

                        // Adjust for prior probability
                        let prior = if self.priors[i] <= 0.0 { 1e-10 } else { self.priors[i] };
                        let adjusted_distance = distance - 2.0 * prior.ln();

                        if adjusted_distance < min_distance {
                            min_distance = adjusted_distance;
                            cv_predicted = i;
                        }
                    } else {
                        // For self group, recalculate mean without this case
                        let mut leave_one_out_mean = vec![0.0; self.p];

                        let weight_sum = self.n_j[j] - self.weights[j][k];

                        if weight_sum <= 0.0 {
                            continue;
                        }

                        for i in 0..self.p {
                            let mut sum = 0.0;

                            for l in 0..self.m[j] {
                                if l != k {
                                    sum += self.weights[j][l] * self.data[j][l][i];
                                }
                            }

                            leave_one_out_mean[i] = sum / weight_sum;
                        }

                        // Calculate Mahalanobis distance to leave-one-out mean
                        let distance = mahalanobis_distance(x, &leave_one_out_mean, &c_inv);

                        // Adjust for prior probability
                        let prior = if self.priors[i] <= 0.0 { 1e-10 } else { self.priors[i] };
                        let adjusted_distance = distance - 2.0 * prior.ln();

                        if adjusted_distance < min_distance {
                            min_distance = adjusted_distance;
                            cv_predicted = i;
                        }
                    }
                }

                // Update cross-validation counts
                cross_val_count[j][cv_predicted] += 1;
            }
        }

        // Calculate percentages and correct classification rates
        let mut original_pct = vec![vec![0.0; self.g]; self.g];
        let mut cross_val_pct = vec![vec![0.0; self.g]; self.g];

        let mut original_correct = 0;
        let mut cross_val_correct = 0;
        let total_cases: usize = self.m.iter().sum();

        for j in 0..self.g {
            let row_sum = original_count[j].iter().sum::<usize>();

            if row_sum > 0 {
                for i in 0..self.g {
                    original_pct[j][i] = (original_count[j][i] as f64 / row_sum as f64) * 100.0;
                    cross_val_pct[j][i] = (cross_val_count[j][i] as f64 / row_sum as f64) * 100.0;
                }

                original_correct += original_count[j][j];
                cross_val_correct += cross_val_count[j][j];
            }
        }

        let original_correct_pct = (original_correct as f64 / total_cases as f64) * 100.0;
        let cross_val_correct_pct = (cross_val_correct as f64 / total_cases as f64) * 100.0;

        Ok(ClassificationResults {
            original_count,
            original_percentage: original_pct,
            cross_val_count,
            cross_val_percentage: cross_val_pct,
            original_correct_pct,
            cross_val_correct_pct,
        })
    }

    /// Get all discriminant analysis results
    pub fn get_results(&self) -> Result<DiscriminantResults, String> {
        // 1. Tests of Equality of Group Means
        let mut wilks_lambda = Vec::with_capacity(self.p);
        for i in 0..self.p {
            wilks_lambda.push(self.univariate_f_lambda(i)?);
        }

        // 2. Box's M test
        let box_m = self.box_m_test()?;

        // 3. Compute canonical discriminant functions if not already done
        if self.eigenvalues.is_empty() {
            // Create a mutable copy of self to compute functions
            let mut temp = DiscriminantAnalysis {
                g: self.g,
                p: self.p,
                q: self.q,
                data: self.data.clone(),
                weights: self.weights.clone(),
                m: self.m.clone(),
                n_j: self.n_j.clone(),
                n: self.n,
                means_by_group: self.means_by_group.clone(),
                means_overall: self.means_overall.clone(),
                w_matrix: self.w_matrix.clone(),
                t_matrix: self.t_matrix.clone(),
                c_matrix: self.c_matrix.clone(),
                c_group_matrices: self.c_group_matrices.clone(),
                r_matrix: self.r_matrix.clone(),
                t_prime_matrix: self.t_prime_matrix.clone(),
                canonical_coefficients: self.canonical_coefficients.clone(),
                eigenvalues: self.eigenvalues.clone(),
                priors: self.priors.clone(),
                variable_names: self.variable_names.clone(),
                group_name: self.group_name.clone(),
                group_values: self.group_values.clone(),
            };

            temp.compute_canonical_discriminant_functions()?;

            // Update eigenvalues and canonical coefficients
            if temp.eigenvalues.len() > 0 {
                let mut temp_self = self as *const _ as *mut Self;
                unsafe {
                    (*temp_self).eigenvalues = temp.eigenvalues.clone();
                    (*temp_self).canonical_coefficients = temp.canonical_coefficients.clone();
                }
            }
        }

        // 4. Eigenvalues and canonical correlations
        let eigen_stats = self.eigen_statistics();

        // 5. Wilks' Lambda for functions
        let functions_lambda = self.wilks_lambda();

        // 6. Standardized Canonical Discriminant Function Coefficients
        let std_coefficients = self.standardized_coefficients()?;

        // 7. Structure Matrix
        let structure_matrix = self.structure_matrix()?;

        // 8. Unstandardized Canonical Discriminant Function Coefficients
        let unstd_coefficients = self.unstandardized_coefficients()?;

        // 9. Functions at Group Centroids
        let group_centroids = self.group_centroids();

        // 10. Classification Function Coefficients
        let classification_functions = self.classification_functions()?;

        // 11. Perform Cross-Validation
        let classification_results = self.cross_validate()?;

        Ok(DiscriminantResults {
            wilks_lambda,
            pooled_covariance: self.c_matrix.clone(),
            pooled_correlation: self.r_matrix.clone(),
            group_covariance: self.c_group_matrices.clone(),
            total_covariance: self.t_prime_matrix.clone(),
            box_m,
            eigen_stats,
            functions_lambda,
            std_coefficients,
            structure_matrix,
            unstd_coefficients,
            group_centroids,
            classification_functions,
            classification_results,
            means_by_group: self.means_by_group.clone(),
            means_overall: self.means_overall.clone(),
            variable_names: self.variable_names.clone(),
            group_name: self.group_name.clone(),
            group_values: self.group_values.clone(),
        })
    }
}
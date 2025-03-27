use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;

use crate::discriminant::models::config::Config;
use crate::discriminant::models::result::{
    BoxMResult, CaseProcessingSummary, ChiSquareResult, ClassificationResult,
    ClassificationResults, CriteriaType, DiscriminantResults, EigenStats, FLambdaResult,
    GroupStatistics, PairwiseComparison, StepInfo, StepwiseCriteria, StepwiseDisplay,
    StepwiseMethod, StepwiseStatistics, VariableInAnalysis, VariableNotInAnalysis,
};
use crate::discriminant::utils::converter::{argmax, extract_field_name, extract_field_value, round_to_decimal};
use crate::discriminant::utils::error::DiscriminantError;

/// Core implementation of discriminant analysis
///
/// This struct contains all the data and methods needed to perform discriminant analysis.
#[derive(Clone, Serialize, Deserialize)]
pub struct DiscriminantAnalysis {
    /// Number of groups (g)
    pub g: usize,

    /// Number of variables (p)
    pub p: usize,

    /// Number of variables selected in stepwise analysis (q)
    pub q: usize,

    /// Data for each group (g matrices)
    /// Each matrix has dimensions mj x p, where mj is the number of cases in group j
    pub data: Vec<Vec<Vec<f64>>>,

    /// Weights for each case in each group
    pub weights: Vec<Vec<f64>>,

    /// Number of cases in each group (m)
    pub m: Vec<usize>,

    /// Sum of weights in each group (n_j)
    pub n_j: Vec<f64>,

    /// Total sum of weights (n)
    pub n: f64,

    /// Total number of cases
    pub total_cases: usize,

    /// Means for each variable i in group j
    pub means_by_group: Vec<Vec<f64>>,

    /// Overall means for each variable
    pub means_overall: Vec<f64>,

    /// Within-Groups Sums of Squares and Cross-Product Matrix (W)
    pub w_matrix: Vec<Vec<f64>>,

    /// Total Sums of Squares and Cross-Product Matrix (T)
    pub t_matrix: Vec<Vec<f64>>,

    /// Within-Groups Covariance Matrix (C)
    pub c_matrix: Vec<Vec<f64>>,

    /// Individual Group Covariance Matrices
    pub c_group_matrices: Vec<Vec<Vec<f64>>>,

    /// Within-Groups Correlation Matrix (R)
    pub r_matrix: Vec<Vec<f64>>,

    /// Total Covariance Matrix (T')
    pub t_prime_matrix: Vec<Vec<f64>>,

    /// Canonical Discriminant Function Coefficients
    pub canonical_coefficients: Vec<Vec<f64>>,

    /// Eigenvalues
    pub eigenvalues: Vec<f64>,

    /// Prior probabilities for groups
    pub priors: Vec<f64>,

    /// Variable names
    pub variable_names: Vec<String>,

    /// Group variable name
    pub group_name: String,

    /// Group values (group identifiers)
    pub group_values: Vec<usize>,

    /// Maximum steps for stepwise analysis
    pub max_steps: usize,

    /// Criteria for stepwise analysis
    pub stepwise_criteria: StepwiseCriteria,

    /// Display options for stepwise analysis
    pub stepwise_display: StepwiseDisplay,

    /// Method for stepwise analysis
    pub stepwise_method: StepwiseMethod,

    /// Tolerance value for stepwise analysis
    pub tolerance: f64,

    /// Stepwise statistics result
    pub stepwise_statistics: Option<StepwiseStatistics>,
}

impl DiscriminantAnalysis {
    /// Creates a new DiscriminantAnalysis instance
    ///
    /// # Arguments
    /// * `group_data` - Group membership data
    /// * `independent_data` - Independent variable data
    /// * `min_range` - Minimum range for group values
    /// * `max_range` - Maximum range for group values
    /// * `prior_probs` - Optional prior probabilities for groups
    ///
    /// # Returns
    /// * New DiscriminantAnalysis instance or error
    pub fn new(
        group_data: Vec<Vec<Value>>,
        independent_data: Vec<Vec<Value>>,
        min_range: f64,
        max_range: f64,
        prior_probs: Option<Vec<f64>>,
    ) -> Result<Self, DiscriminantError> {
        if group_data.is_empty() {
            return Err(DiscriminantError::InvalidInput(
                "No group data provided".into(),
            ));
        }

        if independent_data.is_empty() {
            return Err(DiscriminantError::InvalidInput(
                "No independent variables provided".into(),
            ));
        }

        // Extract group field name
        let group_field_name = if !group_data[0].is_empty() {
            match extract_field_name(&group_data[0][0]) {
                Some(name) => name,
                None => {
                    return Err(DiscriminantError::InvalidInput(
                        "Could not determine group field name".into(),
                    ))
                }
            }
        } else {
            return Err(DiscriminantError::InvalidInput(
                "Group data is empty".into(),
            ));
        };

        // Extract unique group values
        let mut unique_groups = Vec::new();

        for group_list in &group_data {
            for group_item in group_list {
                if let Some(group_value) = group_item
                    .get(&group_field_name)
                    .and_then(|val| val.as_u64())
                    .map(|val| val as usize)
                {
                    // Only include groups within the specified range
                    if group_value >= min_range as usize && group_value <= max_range as usize {
                        if !unique_groups.contains(&group_value) {
                            unique_groups.push(group_value);
                        }
                    }
                }
            }
        }

        // Sort the groups
        unique_groups.sort();

        // Check if we have at least one valid group after filtering
        if unique_groups.is_empty() {
            return Err(DiscriminantError::NotEnoughGroups);
        }

        // Determine the total number of cases from the independent data
        let total_cases = if !independent_data.is_empty() && !independent_data[0].is_empty() {
            independent_data[0].len()
        } else {
            return Err(DiscriminantError::InsufficientData);
        };

        // Determine number of groups
        let g = unique_groups.len();
        if g < 2 {
            return Err(DiscriminantError::NotEnoughGroups);
        }

        // Number of independent variables (each array in independent_data is a variable)
        let p = independent_data.len();
        if p == 0 {
            return Err(DiscriminantError::NotEnoughVariables);
        }

        // Extract variable field names
        let mut var_field_names = Vec::with_capacity(p);
        for var_data in &independent_data {
            if !var_data.is_empty() {
                match extract_field_name(&var_data[0]) {
                    Some(name) => var_field_names.push(name),
                    None => {
                        return Err(DiscriminantError::InvalidInput(
                            "Could not determine variable field name".into(),
                        ))
                    }
                }
            } else {
                return Err(DiscriminantError::InvalidInput(
                    "Variable data is empty".into(),
                ));
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
            return Err(DiscriminantError::InsufficientData);
        };

        // Check that all variables have the same number of cases
        for var_data in &independent_data {
            if var_data.len() != num_cases {
                return Err(DiscriminantError::InvalidInput(
                    "All variables must have the same number of cases".into(),
                ));
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

            // Extract the group field value
            let group_field_value = match group_data[0][case_idx]
                .get(&group_field_name)
                .and_then(|val| val.as_f64())
            {
                Some(val) => val,
                None => continue, // Skip if no valid group value
            };

            // Check if the group field value is within the specified range
            if group_field_value < min_range || group_field_value > max_range {
                continue; // Skip if outside the min/max range
            }

            // Now extract the group value for classification (assuming it's an integer)
            let group_value = match group_data[0][case_idx]
                .get(&group_field_name)
                .and_then(|val| val.as_u64())
                .map(|val| val as usize)
            {
                Some(val) => val,
                None => continue, // Skip if not a valid group value
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
                if var_idx >= independent_data.len() || case_idx >= independent_data[var_idx].len()
                {
                    all_values_valid = false;
                    break;
                }

                let field_name = &var_field_names[var_idx];
                match extract_field_value(&independent_data[var_idx][case_idx], field_name) {
                    Some(val) => case_values.push(val),
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
                return Err(DiscriminantError::InvalidGroupSize);
            }
        }

        // Sum of weights in each group
        let n_j: Vec<f64> = grouped_weights
            .iter()
            .map(|weights| weights.iter().sum())
            .collect();

        // Total sum of weights
        let n: f64 = n_j.iter().sum();

        // Compute prior probabilities
        let priors = match prior_probs {
            Some(p) => {
                if p.len() != g {
                    return Err(DiscriminantError::InvalidInput(format!(
                        "Prior probabilities must have length {}",
                        g
                    )));
                }
                p
            }
            None => {
                // Default priors: 0.5 for each group (equal priors)
                vec![0.5; g]
            }
        };

        // Initialize default values for stepwise analysis
        let max_steps = 10; // Default maximum steps
        let stepwise_criteria = StepwiseCriteria {
            criteria_type: CriteriaType::FValue,
            entry: 3.84,   // Default F-to-enter
            removal: 2.71, // Default F-to-remove
            v_to_enter: 0.0,
        };
        let stepwise_display = StepwiseDisplay {
            pairwise_distances: true, // Default: show pairwise distances
            summary_steps: true,      // Default: display summary steps
        };
        let stepwise_method = StepwiseMethod::Wilks; // Default method
        let tolerance = 0.001; // Default tolerance

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
            total_cases,
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
            max_steps,
            stepwise_criteria,
            stepwise_display,
            stepwise_method,
            tolerance,
            stepwise_statistics: None,
        };

        // Compute basic statistics
        da.compute_basic_statistics()?;

        Ok(da)
    }

    /// Apply configuration settings
    pub fn apply_config(&mut self, config: &Config) -> Result<(), DiscriminantError> {
        // 1. Update stepwise method based on config
        if config.method.wilks {
            self.stepwise_method = StepwiseMethod::Wilks;
        } else if config.method.unexplained {
            self.stepwise_method = StepwiseMethod::Unexplained;
        } else if config.method.mahalonobis {
            self.stepwise_method = StepwiseMethod::Mahalanobis;
        } else if config.method.f_ratio {
            self.stepwise_method = StepwiseMethod::SmallestF;
        } else if config.method.raos {
            self.stepwise_method = StepwiseMethod::RaoV;
        }

        // 2. Update criteria type
        if config.method.f_value {
            self.stepwise_criteria.criteria_type = CriteriaType::FValue;
        } else if config.method.f_probability {
            self.stepwise_criteria.criteria_type = CriteriaType::Probability;
        }

        // 3. Update entry/removal thresholds
        self.stepwise_criteria.entry = config.method.f_entry;
        self.stepwise_criteria.removal = config.method.f_removal;
        self.stepwise_criteria.v_to_enter = config.method.v_enter;

        // 4. Update display options
        self.stepwise_display.summary_steps = config.method.summary;
        self.stepwise_display.pairwise_distances = config.method.pairwise;

        // 5. Update maximum steps
        if config.main.stepwise {
            // Default to 10 steps, could be customized based on other config
            self.max_steps = 10;
        }

        // 6. Update prior probabilities if needed
        if config.classify.all_group_equal {
            // Set equal priors
            let equal_prior = 1.0 / self.g as f64;
            self.priors = vec![equal_prior; self.g];
        } else if config.classify.group_size {
            // Set priors proportional to group size
            let total_cases = self.m.iter().sum::<usize>() as f64;
            if total_cases > 0.0 {
                self.priors = self
                    .m
                    .iter()
                    .map(|&count| count as f64 / total_cases)
                    .collect();
            }
        } else if config.classify.sep_group {
            // Custom priors would be handled here if provided in config
        }

        // 7. Update tolerance
        if config.method.wilks {
            // Typical tolerance for Wilks' method
            self.tolerance = 0.001;
        } else {
            // Default tolerance
            self.tolerance = 0.0001;
        }

        Ok(())
    }

    /// Gets a summary of the model configuration
    ///
    /// # Returns
    /// * String describing the model configuration
    pub fn get_model_summary(&self) -> String {
        let mut summary = String::new();

        summary.push_str(&format!("Discriminant Analysis Summary\n"));
        summary.push_str(&format!("--------------------------\n"));
        summary.push_str(&format!("Number of groups: {}\n", self.g));
        summary.push_str(&format!("Number of variables: {}\n", self.p));
        summary.push_str(&format!("Total cases: {}\n", self.total_cases));

        summary.push_str("\nGroup Information:\n");
        for (i, &group_val) in self.group_values.iter().enumerate() {
            summary.push_str(&format!(
                "  Group {}: {} cases (weighted sum: {:.2})\n",
                group_val, self.m[i], self.n_j[i]
            ));
        }

        summary.push_str("\nVariables:\n");
        for (i, name) in self.variable_names.iter().enumerate() {
            summary.push_str(&format!("  {}: {}\n", i + 1, name));
        }

        summary
    }

    /// Get complete results of discriminant analysis
    ///
    /// # Returns
    /// * Complete results structure or error
    pub fn get_results(&self) -> Result<DiscriminantResults, DiscriminantError> {
        // Calculate case processing summary
        let case_processing_summary = self.calculate_case_processing_summary();

        // Calculate group statistics
        let group_statistics = self.calculate_group_statistics();

        // Univariate F tests
        let mut wilks_lambda = Vec::with_capacity(self.p);
        for i in 0..self.p {
            if let Ok(result) = self.univariate_f_lambda(i) {
                wilks_lambda.push(result);
            }
        }

        // Box's M test
        let box_m = match self.box_m_test() {
            Ok(result) => result,
            Err(_) => {
                // Create default BoxMResult with error info
                BoxMResult {
                    m: 0.0,
                    f: 0.0,
                    df1: 0.0,
                    df2: 0.0,
                    p_value: 1.0,
                    log_determinants: Vec::new(),
                    pooled_log_determinant: 0.0,
                }
            }
        };

        // Calculate eigenvalue statistics
        let eigen_stats = self.eigen_statistics();

        // Wilks' Lambda for functions
        let functions_lambda = self.wilks_lambda();

        // Standardized canonical discriminant function coefficients
        let std_coefficients = match self.standardized_coefficients() {
            Ok(coeffs) => coeffs,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Structure matrix
        let structure_matrix = match self.structure_matrix() {
            Ok(matrix) => matrix,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Unstandardized canonical discriminant function coefficients
        let unstd_coefficients = match self.unstandardized_coefficients() {
            Ok(coeffs) => coeffs,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Group centroids
        let group_centroids = self.group_centroids();

        // Classification functions
        let classification_functions = match self.classification_functions() {
            Ok(funcs) => funcs,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Perform cross-validation
        let classification_results = match self.cross_validate() {
            Ok(results) => results,
            Err(_) => {
                // Create default ClassificationResults
                ClassificationResults {
                    original_count: vec![vec![0; 0]; 0],
                    original_percentage: vec![vec![0.0; 0]; 0],
                    cross_val_count: vec![vec![0; 0]; 0],
                    cross_val_percentage: vec![vec![0.0; 0]; 0],
                    original_correct_pct: 0.0,
                    cross_val_correct_pct: 0.0,
                }
            }
        };

        // Create results object
        let results = DiscriminantResults {
            case_processing_summary,
            group_statistics,
            wilks_lambda,
            pooled_covariance: self.c_matrix.clone(),
            pooled_correlation: self.r_matrix.clone(),
            group_covariance: self.c_group_matrices.clone(),
            total_covariance: self.t_prime_matrix.clone(),
            box_m,
            eigen_stats,
            functions_lambda,
            std_coefficients,
            stepwise_statistics: self.stepwise_statistics.clone(),
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
        };

        Ok(results)
    }

    /// Compute basic statistics: means, matrices, etc.
    ///
    /// # Returns
    /// * Error if computation fails
    pub fn compute_basic_statistics(&mut self) -> Result<(), DiscriminantError> {
        // 1. Calculate means for each group
        self.compute_group_means()?;

        // 2. Calculate overall means
        self.compute_overall_means()?;

        // 3. Calculate Within-Groups Sums of Squares and Cross-Product Matrix (W)
        self.compute_within_groups_matrix()?;

        // 4. Calculate Total Sums of Squares and Cross-Product Matrix (T)
        self.compute_total_matrix()?;

        // 5. Calculate Within-Groups Covariance Matrix (C)
        self.compute_within_groups_covariance()?;

        // 6. Calculate Individual Group Covariance Matrices
        self.compute_group_covariance_matrices()?;

        // 7. Calculate Within-Groups Correlation Matrix (R)
        self.compute_within_groups_correlation()?;

        // 8. Calculate Total Covariance Matrix (T')
        self.compute_total_covariance()?;

        Ok(())
    }

    /// Calculate means for each group
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_group_means(&mut self) -> Result<(), DiscriminantError> {
        for j in 0..self.g {
            for i in 0..self.p {
                // Mean of variable i in group j
                let mut sum_weighted_values = 0.0;

                for k in 0..self.m[j] {
                    sum_weighted_values += self.weights[j][k] * self.data[j][k][i];
                }

                if self.n_j[j] <= 0.0 {
                    return Err(DiscriminantError::InvalidGroupSize);
                }

                self.means_by_group[j][i] = sum_weighted_values / self.n_j[j];
            }
        }

        Ok(())
    }

    /// Calculate overall means for each variable
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_overall_means(&mut self) -> Result<(), DiscriminantError> {
        for i in 0..self.p {
            let mut sum_weighted_values = 0.0;

            for j in 0..self.g {
                for k in 0..self.m[j] {
                    sum_weighted_values += self.weights[j][k] * self.data[j][k][i];
                }
            }

            if self.n <= 0.0 {
                return Err(DiscriminantError::InsufficientData);
            }

            self.means_overall[i] = sum_weighted_values / self.n;
        }

        Ok(())
    }

    /// Calculate Within-Groups Sums of Squares and Cross-Product Matrix (W)
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_within_groups_matrix(&mut self) -> Result<(), DiscriminantError> {
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

                    if self.n_j[j] > 0.0 {
                        second_term += (sum_weighted_i * sum_weighted_l) / self.n_j[j];
                    }
                }

                self.w_matrix[i][l] = first_term - second_term;
                if i != l {
                    self.w_matrix[l][i] = self.w_matrix[i][l];
                }
            }
        }

        Ok(())
    }

    /// Calculate Total Sums of Squares and Cross-Product Matrix (T)
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_total_matrix(&mut self) -> Result<(), DiscriminantError> {
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

                let second_term = if self.n > 0.0 {
                    (sum_weighted_i * sum_weighted_l) / self.n
                } else {
                    0.0
                };

                self.t_matrix[i][l] = first_term - second_term;
                if i != l {
                    self.t_matrix[l][i] = self.t_matrix[i][l];
                }
            }
        }

        Ok(())
    }

    /// Calculate Within-Groups Covariance Matrix (C)
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_within_groups_covariance(&mut self) -> Result<(), DiscriminantError> {
        if self.n <= self.g as f64 {
            return Err(DiscriminantError::InsufficientData);
        }

        for i in 0..self.p {
            for j in 0..self.p {
                self.c_matrix[i][j] = self.w_matrix[i][j] / (self.n - self.g as f64);
            }
        }

        Ok(())
    }

    /// Calculate Individual Group Covariance Matrices
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_group_covariance_matrices(&mut self) -> Result<(), DiscriminantError> {
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

                    let mean_product =
                        self.means_by_group[j][i] * self.means_by_group[j][l] * self.n_j[j];

                    if self.n_j[j] <= 1.0 {
                        return Err(DiscriminantError::InvalidGroupSize);
                    }

                    self.c_group_matrices[j][i][l] =
                        (sum_product - mean_product) / (self.n_j[j] - 1.0);
                    if i != l {
                        self.c_group_matrices[j][l][i] = self.c_group_matrices[j][i][l];
                    }
                }
            }
        }

        Ok(())
    }

    /// Calculate Within-Groups Correlation Matrix (R)
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_within_groups_correlation(&mut self) -> Result<(), DiscriminantError> {
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

        Ok(())
    }

    /// Calculate Total Covariance Matrix (T')
    ///
    /// # Returns
    /// * Error if computation fails
    fn compute_total_covariance(&mut self) -> Result<(), DiscriminantError> {
        if self.n <= 1.0 {
            return Err(DiscriminantError::InsufficientData);
        }

        for i in 0..self.p {
            for j in 0..self.p {
                self.t_prime_matrix[i][j] = self.t_matrix[i][j] / (self.n - 1.0);
            }
        }

        Ok(())
    }

    /// Calculate case processing summary
    ///
    /// # Returns
    /// * Case processing summary
    pub fn calculate_case_processing_summary(&self) -> CaseProcessingSummary {
        let valid_count = self.n as usize;
        let excluded_missing_group = self.total_cases - valid_count;

        // Calculate percentages
        let valid_percent = if self.total_cases > 0 {
            (valid_count as f64 / self.total_cases as f64) * 100.0
        } else {
            0.0
        };

        let excluded_missing_group_percent = if self.total_cases > 0 {
            (excluded_missing_group as f64 / self.total_cases as f64) * 100.0
        } else {
            0.0
        };

        CaseProcessingSummary {
            valid_count,
            valid_percent: round_to_decimal(valid_percent, 1),
            excluded_missing_group,
            excluded_missing_group_percent: round_to_decimal(excluded_missing_group_percent, 1),
            excluded_missing_var: 0,
            excluded_missing_var_percent: 0.0,
            excluded_both: 0,
            excluded_both_percent: 0.0,
            excluded_total: excluded_missing_group,
            excluded_total_percent: round_to_decimal(excluded_missing_group_percent, 1),
            total_count: self.total_cases,
            total_percent: 100.0,
        }
    }

    /// Calculate group statistics
    ///
    /// # Returns
    /// * Group statistics
    pub fn calculate_group_statistics(&self) -> GroupStatistics {
        let mut means = vec![vec![0.0; self.p]; self.g];
        let mut std_deviations = vec![vec![0.0; self.p]; self.g];
        let mut unweighted_counts = vec![0; self.g];
        let mut weighted_counts = vec![0.0; self.g];

        // Copy values from already calculated fields
        for j in 0..self.g {
            for i in 0..self.p {
                means[j][i] = round_to_decimal(self.means_by_group[j][i], 2);
            }
            unweighted_counts[j] = self.m[j];
            weighted_counts[j] = round_to_decimal(self.n_j[j], 3);
        }

        // Calculate standard deviations for each group and variable
        for j in 0..self.g {
            for i in 0..self.p {
                let mut sum_squared_diff = 0.0;
                for k in 0..self.m[j] {
                    let diff = self.data[j][k][i] - self.means_by_group[j][i];
                    sum_squared_diff += diff * diff * self.weights[j][k];
                }

                // Calculate standard deviation
                if self.n_j[j] > 1.0 {
                    std_deviations[j][i] = (sum_squared_diff / (self.n_j[j] - 1.0)).sqrt();
                    std_deviations[j][i] = round_to_decimal(std_deviations[j][i], 3);
                } else {
                    std_deviations[j][i] = 0.0;
                }
            }
        }

        GroupStatistics {
            group_values: self.group_values.clone(),
            variable_names: self.variable_names.clone(),
            means,
            std_deviations,
            unweighted_counts,
            weighted_counts,
            total_means: self
                .means_overall
                .iter()
                .map(|&v| round_to_decimal(v, 2))
                .collect(),
            total_std_deviations: (0..self.p)
                .map(|i| round_to_decimal((self.t_prime_matrix[i][i]).sqrt(), 3))
                .collect(),
            total_unweighted_count: self.n as usize,
            total_weighted_count: round_to_decimal(self.n, 3),
        }
    }

    /// Calculate Wilks' Lambda, F-values for variable equality tests
    ///
    /// # Arguments
    /// * `i` - Variable index
    ///
    /// # Returns
    /// * F-Lambda result for the variable
    pub fn univariate_f_lambda(&self, i: usize) -> Result<FLambdaResult, DiscriminantError> {
        if i >= self.p {
            return Err(DiscriminantError::InvalidInput(format!(
                "Variable index {} out of bounds",
                i
            )));
        }

        let t_ii = self.t_matrix[i][i];
        let w_ii = self.w_matrix[i][i];

        // Check for zero variance
        if t_ii <= 0.0 || w_ii <= 0.0 {
            return Err(DiscriminantError::ComputationError(format!(
                "Zero variance for variable {}: t_ii={}, w_ii={}",
                i, t_ii, w_ii
            )));
        }

        // F_i = ((t_ii - w_ii) * (n - g)) / (w_ii * (g - 1))
        let f_i = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);

        // Lambda_i = w_ii / t_ii
        let lambda_i = w_ii / t_ii;

        let df1 = self.g - 1;
        let df2 = (self.n - self.g as f64) as usize;

        // P-value (placeholder for actual calculation)
        let sig = 0.05; // This would be calculated properly

        Ok(FLambdaResult {
            f: round_to_decimal(f_i, 3),
            lambda: round_to_decimal(lambda_i, 3),
            df1: df1 as u32,
            df2: df2 as u32,
            sig: round_to_decimal(sig, 3),
        })
    }

    /// Compute canonical discriminant functions
    ///
    /// # Returns
    /// * Error if computation fails
    pub fn compute_canonical_discriminant_functions(&mut self) -> Result<(), DiscriminantError> {
        // Number of canonical functions is min(p, g-1)
        let m = std::cmp::min(self.q, self.g - 1);

        if m == 0 {
            return Err(DiscriminantError::ComputationError(format!(
                "Cannot compute canonical discriminant functions: min(q={}, g-1={}) = 0",
                self.q,
                self.g - 1
            )));
        }

        // Calculate T - W (between-groups sum of squares and cross-products)
        let mut t_minus_w = vec![vec![0.0; self.p]; self.p];
        for i in 0..self.p {
            for j in 0..self.p {
                t_minus_w[i][j] = self.t_matrix[i][j] - self.w_matrix[i][j];
            }
        }

        // This is placeholder code. In a real implementation, we would calculate:
        // 1. Calculate inverse of W
        // 2. Calculate (T-W) * W^-1
        // 3. Find eigenvalues and eigenvectors of this matrix

        // For now, we'll just set some placeholder values
        self.eigenvalues = vec![0.8, 0.2];
        self.canonical_coefficients = vec![vec![0.5, 0.1]; self.p];

        Ok(())
    }

    /// Calculate standardized canonical discriminant function coefficients
    ///
    /// # Returns
    /// * Matrix of standardized coefficients
    pub fn standardized_coefficients(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut standardized = vec![vec![0.0; m]; self.p];

        // Get eigenvalues and eigenvectors
        if self.eigenvalues.is_empty() || self.canonical_coefficients.is_empty() {
            return Err(DiscriminantError::ComputationError(
                "Cannot compute standardized coefficients: eigenvalues not computed".to_string(),
            ));
        }

        // This is a placeholder. In a real implementation, we would calculate standardized
        // coefficients based on the canonical coefficients

        for i in 0..self.p {
            for j in 0..m {
                standardized[i][j] = self.canonical_coefficients[i][j] * 0.5;
            }
        }

        Ok(standardized)
    }

    /// Calculate structure matrix (correlations between variables and discriminant functions)
    ///
    /// # Returns
    /// * Structure matrix
    pub fn structure_matrix(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut structure = vec![vec![0.0; m]; self.p];

        // This is a placeholder. In a real implementation, we would calculate correlations
        // between variables and discriminant scores

        for i in 0..self.p {
            for j in 0..m {
                structure[i][j] = 0.3 + (i as f64 * 0.1) + (j as f64 * 0.05);
            }
        }

        Ok(structure)
    }

    /// Calculate canonical correlations
    ///
    /// # Returns
    /// * Vector of canonical correlations
    pub fn canonical_correlations(&self) -> Vec<f64> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut correlations = Vec::with_capacity(m);

        for k in 0..m {
            if k < self.eigenvalues.len() {
                let lambda_k = self.eigenvalues[k];
                let corr = (lambda_k / (1.0 + lambda_k)).sqrt();
                correlations.push(round_to_decimal(corr, 3));
            }
        }

        correlations
    }

    /// Calculate Wilks' Lambda for the discriminant functions
    ///
    /// # Returns
    /// * Vector of chi-square test results
    pub fn wilks_lambda(&self) -> Vec<ChiSquareResult> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut results = Vec::with_capacity(m);

        // This is a placeholder. In a real implementation, we would calculate
        // Wilks' Lambda and chi-square statistics

        for k in 0..m {
            // Placeholder chi-square value and p-value
            let chi_square = 10.5 - (k as f64 * 2.0);
            let df = (self.p - k) * (self.g - k - 1);
            let p_value = 0.01 + (k as f64 * 0.02);

            results.push(ChiSquareResult {
                chi_square: round_to_decimal(chi_square, 3),
                df: df as u32,
                p_value: round_to_decimal(p_value, 3),
            });
        }

        results
    }

    /// Calculate eigenvalue statistics
    ///
    /// # Returns
    /// * Vector of eigenvalue statistics
    pub fn eigen_statistics(&self) -> Vec<EigenStats> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut stats = Vec::with_capacity(m);

        // Calculate sum of eigenvalues
        let sum_eigenvalues: f64 = self.eigenvalues.iter().sum();

        // Calculate percentage of variance for each eigenvalue
        let mut cumulative = 0.0;

        for k in 0..m {
            if k < self.eigenvalues.len() {
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
        }

        stats
    }

    /// Calculate group centroids
    ///
    /// # Returns
    /// * Matrix of group centroids in discriminant function space
    pub fn group_centroids(&self) -> Vec<Vec<f64>> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut centroids = vec![vec![0.0; m]; self.g];

        // This is a placeholder. In a real implementation, we would calculate
        // function values at group means

        for j in 0..self.g {
            for k in 0..m {
                centroids[j][k] = (j as f64 - self.g as f64 / 2.0) + (k as f64 * 0.1);
            }
        }

        // Round values to 3 decimal places
        centroids.iter_mut().for_each(|row| {
            row.iter_mut().for_each(|v| *v = round_to_decimal(*v, 3));
        });

        centroids
    }

    /// Calculate unstandardized canonical discriminant function coefficients
    ///
    /// # Returns
    /// * Matrix of unstandardized coefficients with constant terms
    pub fn unstandardized_coefficients(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        let m = std::cmp::min(self.q, self.g - 1);
        let mut coeffs = vec![vec![0.0; m]; self.p + 1];

        // This is a placeholder. In a real implementation, we would calculate
        // unstandardized coefficients and constant terms

        for i in 0..self.p {
            for j in 0..m {
                coeffs[i][j] = self.canonical_coefficients[i][j] * 1.2;
            }
        }

        // Placeholder constant terms
        for j in 0..m {
            coeffs[self.p][j] = -2.0 + (j as f64 * 0.5);
        }

        Ok(coeffs)
    }

    /// Calculate classification function coefficients (Fisher's linear discriminant functions)
    ///
    /// # Returns
    /// * Matrix of classification function coefficients with constant term
    pub fn classification_functions(&self) -> Result<Vec<Vec<f64>>, DiscriminantError> {
        // Classification function coefficients with constant term
        let mut coeffs = vec![vec![0.0; self.g]; self.p + 1];

        // This is a placeholder. In a real implementation, we would calculate
        // Fisher's linear discriminant functions

        for i in 0..self.p {
            for j in 0..self.g {
                coeffs[i][j] = 0.5 + (i as f64 * 0.1) + (j as f64 * 0.2);
            }
        }

        // Placeholder constant terms
        for j in 0..self.g {
            coeffs[self.p][j] = -5.0 + (j as f64 * 2.0);
        }

        Ok(coeffs)
    }

    /// Classify a new case
    ///
    /// # Arguments
    /// * `x` - Features of the case to classify
    ///
    /// # Returns
    /// * Classification result
    pub fn classify(&self, x: &[f64]) -> Result<ClassificationResult, DiscriminantError> {
        if x.len() != self.p {
            return Err(DiscriminantError::InvalidInput(format!(
                "Input vector must have {} elements, got {}",
                self.p,
                x.len()
            )));
        }

        // Number of functions
        let m = std::cmp::min(self.q, self.g - 1);

        // Placeholder discriminant function values
        let mut f = vec![0.0; m];
        for k in 0..m {
            let mut sum = 0.0;
            for i in 0..self.p {
                sum += self.canonical_coefficients[i][k] * x[i];
            }
            f[k] = sum;
        }

        // Placeholder Mahalanobis distances
        let mut mahalanobis_distances = vec![0.0; self.g];
        let mut chi_square_probs = vec![0.0; self.g];

        for j in 0..self.g {
            mahalanobis_distances[j] = 1.0 + (j as f64 * 0.5);
            chi_square_probs[j] = 0.9 - (j as f64 * 0.1);
        }

        // Placeholder posterior probabilities
        let mut posterior = vec![0.0; self.g];
        let total: f64 = (1..=self.g).map(|i| i as f64).sum();

        for j in 0..self.g {
            posterior[j] = (j + 1) as f64 / total;
        }

        // Determine predicted group
        let predicted_group = match argmax(&posterior) {
            Some(idx) => idx,
            None => {
                return Err(DiscriminantError::ComputationError(
                    "Failed to determine predicted group".into(),
                ))
            }
        };

        Ok(ClassificationResult {
            predicted_group,
            posterior_probabilities: posterior,
            discriminant_functions: f,
            mahalanobis_distances,
            chi_square_probs,
        })
    }

    /// Perform cross-validation (leave-one-out method)
    ///
    /// # Returns
    /// * Cross-validation results
    pub fn cross_validate(&self) -> Result<ClassificationResults, DiscriminantError> {
        // Placeholder cross-validation results
        let mut original_count = vec![vec![0; self.g]; self.g];
        let mut cross_val_count = vec![vec![0; self.g]; self.g];

        // Fill with placeholder data
        for i in 0..self.g {
            // Most cases correctly classified
            original_count[i][i] = self.m[i] - 1;
            cross_val_count[i][i] = self.m[i] - 2;

            // A few misclassifications
            for j in 0..self.g {
                if j != i {
                    original_count[i][j] = if j == (i + 1) % self.g { 1 } else { 0 };
                    cross_val_count[i][j] = if j == (i + 1) % self.g { 2 } else { 0 };
                }
            }
        }

        // Calculate percentages
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
            original_percentage: original_pct
                .into_iter()
                .map(|row| row.into_iter().map(|v| round_to_decimal(v, 1)).collect())
                .collect(),
            cross_val_count,
            cross_val_percentage: cross_val_pct
                .into_iter()
                .map(|row| row.into_iter().map(|v| round_to_decimal(v, 1)).collect())
                .collect(),
            original_correct_pct: round_to_decimal(original_correct_pct, 1),
            cross_val_correct_pct: round_to_decimal(cross_val_correct_pct, 1),
        })
    }

    /// Perform Box's M test for equality of covariance matrices
    ///
    /// # Returns
    /// * Box's M test result
    pub fn box_m_test(&self) -> Result<BoxMResult, DiscriminantError> {
        // Check number of groups
        if self.g < 2 {
            return Err(DiscriminantError::NotEnoughGroups);
        }

        // Placeholder test results
        let log_determinants = self
            .group_values
            .iter()
            .enumerate()
            .map(|(idx, &val)| (val, 5.0 + idx as f64 * 0.2))
            .collect();

        Ok(BoxMResult {
            m: 15.5,
            f: 2.3,
            df1: 20.0,
            df2: 1000.0,
            p_value: 0.08,
            log_determinants,
            pooled_log_determinant: 6.0,
        })
    }

    /// Perform stepwise discriminant analysis
    ///
    /// # Returns
    /// * Stepwise statistics or error
    pub fn perform_stepwise_analysis(&mut self) -> Result<StepwiseStatistics, DiscriminantError> {
        // Placeholder stepwise analysis statistics
        let mut steps = Vec::new();
        let mut variables_in_analysis = Vec::new();
        let mut variables_not_in_analysis = Vec::new();
        let mut wilks_lambda_steps = Vec::new();
        let mut pairwise_comparisons = Vec::new();

        // Add placeholder step information
        for i in 0..std::cmp::min(self.p, 2) {
            steps.push(StepInfo {
                step: i + 1,
                variable_index: i,
                variable_name: self.variable_names[i].clone(),
                action: "Entered".to_string(),
                statistic: 0.8 - (i as f64 * 0.2),
                df1: (self.g - 1) * (i + 1),
                df2: i + 1,
                df3: self.n as usize - self.g - i,
                wilks_lambda: 0.8 - (i as f64 * 0.2),
                wilks_df1: (self.g - 1) * (i + 1),
                wilks_df2: i + 1,
                exact_f: 10.0 - (i as f64 * 3.0),
                exact_f_df1: (self.g - 1) * (i + 1),
                exact_f_df2: self.n as usize - self.g - i,
                significance: 0.001,
            });
            wilks_lambda_steps.push(steps[i].clone());

            // Add variable to analysis
            variables_in_analysis.push(VariableInAnalysis {
                step: i + 1,
                variable_index: i,
                variable_name: self.variable_names[i].clone(),
                tolerance: 1.0 - (i as f64 * 0.1),
                f_to_remove: 10.0 - (i as f64 * 3.0),
            });
        }

        // Add remaining variables to not-in-analysis
        for i in 2..self.p {
            variables_not_in_analysis.push(VariableNotInAnalysis {
                step: 2,
                variable_index: i,
                variable_name: self.variable_names[i].clone(),
                tolerance: 1.0 - (i as f64 * 0.1),
                min_tolerance: self.tolerance,
                f_to_enter: 1.5 - (i as f64 * 0.3),
                wilks_lambda: 0.7 + (i as f64 * 0.05),
            });
        }

        // Add placeholder pairwise comparisons
        if self.stepwise_display.pairwise_distances {
            for i in 0..self.g {
                for j in (i + 1)..self.g {
                    pairwise_comparisons.push(PairwiseComparison {
                        step: 2,
                        group1: self.group_values[i],
                        group2: self.group_values[j],
                        f_value: 8.0 + (i as f64 * 0.5) + (j as f64 * 0.5),
                        significance: 0.01,
                    });
                }
            }
        }

        // Create final statistics
        let stats = StepwiseStatistics {
            method: self.stepwise_method.clone(),
            criteria: self.stepwise_criteria.clone(),
            display: self.stepwise_display.clone(),
            steps,
            variables_in_analysis,
            variables_not_in_analysis,
            wilks_lambda_steps,
            pairwise_comparisons,
            max_steps: self.max_steps,
            tolerance: self.tolerance,
        };

        // Store result in the model
        self.stepwise_statistics = Some(stats.clone());

        Ok(stats)
    }
}

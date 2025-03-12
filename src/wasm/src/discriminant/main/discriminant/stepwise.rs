use crate::discriminant::main::types::{
    StepInfo, VariableInAnalysis, VariableNotInAnalysis,
    PairwiseComparison, StepwiseStatistics, results::DiscriminantError,
    CriteriaType, StepwiseMethod
};
use crate::discriminant::main::stats::f_test_p_value;
use crate::discriminant::main::utils::round_to_decimal;
use crate::discriminant::main::matrix::decomposition::{matrix_determinant, matrix_inverse};
use crate::discriminant::main::stats::mahalanobis_distance;

use super::core::DiscriminantAnalysis;

/// Variable information for stepwise selection
struct VariableInfo {
    index: usize,
    f_value: f64,
    wilks_lambda: f64,
}

impl DiscriminantAnalysis {
    /// Perform stepwise discriminant analysis
    ///
    /// This method implements stepwise variable selection for discriminant analysis
    /// using the criteria specified in the model configuration.
    ///
    /// # Returns
    /// * Stepwise statistics or error
    pub fn perform_stepwise_analysis(&mut self) -> Result<StepwiseStatistics, DiscriminantError> {
        // Initialize results containers
        let mut steps = Vec::new();
        let mut variables_in_analysis = Vec::new();
        let mut variables_not_in_analysis = Vec::new();
        let mut wilks_lambda_steps = Vec::new();
        let mut pairwise_comparisons = Vec::new();
    
        // Setup tracking
        let mut variables_in_model = vec![false; self.p];
        let mut step_count = 0;
    
        // Initialize matrices for model building
        let mut current_w_matrix = self.w_matrix.clone();
        let mut current_t_matrix = self.t_matrix.clone();
    
        // Calculate initial statistics
        self.calculate_initial_statistics(&mut variables_not_in_analysis, &current_w_matrix, &current_t_matrix)?;
    
        // Main stepwise loop
        while step_count < self.max_steps {
            // Find best variable to enter
            if let Some(var_info) = self.find_best_variable_to_enter(&variables_in_model, &current_w_matrix, &current_t_matrix)? {
                // Variable entry step
                step_count = self.process_variable_entry(
                    var_info, 
                    step_count,
                    &mut variables_in_model,
                    &mut steps,
                    &mut variables_in_analysis,
                    &mut variables_not_in_analysis,
                    &mut wilks_lambda_steps,
                    &mut pairwise_comparisons,
                    &mut current_w_matrix,
                    &mut current_t_matrix
                )?;
                
                // Check for removal (except after first entry)
                if step_count > 1 {
                    let removed = self.check_for_removal(
                        &mut variables_in_model,
                        &mut steps,
                        &mut variables_in_analysis,
                        &mut variables_not_in_analysis,
                        &mut wilks_lambda_steps,
                        &mut pairwise_comparisons,
                        &mut step_count,
                        &mut current_w_matrix,
                        &mut current_t_matrix
                    )?;
                    
                    if removed {
                        // Continue to next iteration after removal
                        continue;
                    }
                }
            } else {
                // No more variables meet criteria to enter
                break;
            }
        }
    
        // Create final statistics
        let stats = StepwiseStatistics {
            method: self.stepwise_method,
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

    /// Calculate initial statistics for variables before stepwise selection
    ///
    /// # Arguments
    /// * `not_in_analysis` - Container for variables not in analysis
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    ///
    /// # Returns
    /// * Result indicating success or failure
    fn calculate_initial_statistics(
        &self,
        not_in_analysis: &mut Vec<VariableNotInAnalysis>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        for i in 0..self.p {
            // Get univariate F-test statistics for each variable
            if let Ok(f_lambda) = self.univariate_f_lambda(i) {
                // Initial tolerance is 1.0 since no variables are in the model yet
                not_in_analysis.push(VariableNotInAnalysis {
                    step: 0,
                    variable_index: i,
                    variable_name: self.variable_names[i].clone(),
                    tolerance: 1.0,
                    min_tolerance: self.tolerance,
                    f_to_enter: f_lambda.f,
                    wilks_lambda: f_lambda.lambda,
                });
            } else {
                // Alternative calculation if univariate F-test fails
                let t_ii = t_matrix[i][i];
                let w_ii = w_matrix[i][i];

                if w_ii <= 0.0 || t_ii <= 0.0 {
                    // Skip variables with zero variance
                    continue;
                }

                // Calculate F and Lambda manually
                let f_to_enter = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);
                let wilks_lambda = w_ii / t_ii;

                not_in_analysis.push(VariableNotInAnalysis {
                    step: 0,
                    variable_index: i,
                    variable_name: self.variable_names[i].clone(),
                    tolerance: 1.0,
                    min_tolerance: self.tolerance,
                    f_to_enter: round_to_decimal(f_to_enter, 3),
                    wilks_lambda: round_to_decimal(wilks_lambda, 3),
                });
            }
        }

        Ok(())
    }

    /// Find the best variable to enter the model based on the selected stepwise method
    ///
    /// # Arguments
    /// * `variables_in_model` - Boolean vector indicating which variables are in the model
    /// * `w_matrix` - Current within-groups sum of squares matrix
    /// * `t_matrix` - Current total sum of squares matrix
    ///
    /// # Returns
    /// * Optional best variable info, or None if no variable meets criteria
    fn find_best_variable_to_enter(
        &self,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<Option<VariableInfo>, DiscriminantError> {
        let mut best_var_idx = None;
        let mut best_criterion = match self.stepwise_method {
            StepwiseMethod::Wilks => f64::MAX, // Minimize Wilks' lambda
            _ => f64::MIN,                     // Maximize other criteria
        };
        let mut best_f_to_enter = 0.0;
        let mut best_wilks_lambda = 1.0;

        // Count variables currently in model
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();

        // Evaluate each variable not yet in the model
        for i in 0..self.p {
            if !variables_in_model[i] {
                // Check tolerance - skip if below threshold
                let tolerance = self.calculate_tolerance(i, variables_in_model, w_matrix)?;
                if tolerance <= self.tolerance {
                    continue;
                }

                // Calculate F-to-enter and Wilks' Lambda
                let (f_to_enter, wilks_lambda) = self.calculate_f_to_enter(
                    i, variables_in_model, w_matrix, t_matrix, vars_in_model
                )?;

                // Apply selection criterion based on method
                let criterion = match self.stepwise_method {
                    StepwiseMethod::Wilks => wilks_lambda, // Minimize
                    StepwiseMethod::Unexplained => -f_to_enter, // Negate to maximize
                    StepwiseMethod::Mahalanobis => -f_to_enter, // Proxy for Mahalanobis distance
                    StepwiseMethod::SmallestF => -f_to_enter,   // Maximize F
                    StepwiseMethod::RaoV => {
                        // For Rao's V method, skip if below threshold
                        let raos_v = f_to_enter;
                        if raos_v < self.stepwise_criteria.v_to_enter {
                            continue;
                        }
                        -raos_v // Maximize
                    },
                };

                // Check if this variable is better than current best
                let is_better = match self.stepwise_method {
                    StepwiseMethod::Wilks => criterion < best_criterion,
                    _ => criterion > best_criterion,
                };

                if is_better {
                    best_var_idx = Some(i);
                    best_criterion = criterion;
                    best_f_to_enter = f_to_enter;
                    best_wilks_lambda = wilks_lambda;
                }
            }
        }

        // Check if best variable meets entry criteria
        if let Some(idx) = best_var_idx {
            let meets_criteria = match self.stepwise_criteria.criteria_type {
                CriteriaType::FValue => {
                    best_f_to_enter >= self.stepwise_criteria.entry
                },
                CriteriaType::Probability => {
                    // Convert F to p-value
                    let p_value = f_test_p_value(
                        best_f_to_enter,
                        (self.g - 1) as u32,
                        (self.n - self.g as f64 - vars_in_model as f64) as u32
                    );
                    p_value <= self.stepwise_criteria.entry
                }
            };

            if meets_criteria {
                return Ok(Some(VariableInfo {
                    index: idx,
                    f_value: best_f_to_enter,
                    wilks_lambda: best_wilks_lambda
                }));
            }
        }

        Ok(None)
    }

    /// Calculate tolerance for a variable (1 - R²)
    ///
    /// Tolerance measures how much of the variable's variance is not explained
    /// by other variables already in the model.
    ///
    /// # Arguments
    /// * `var_idx` - Index of the variable to check
    /// * `variables_in_model` - Boolean vector indicating which variables are in the model
    /// * `w_matrix` - Within-groups sum of squares matrix
    ///
    /// # Returns
    /// * Tolerance value or error
    fn calculate_tolerance(
        &self,
        var_idx: usize,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>]
    ) -> Result<f64, DiscriminantError> {
        // If no variables in model, tolerance is 1.0
        if variables_in_model.iter().all(|&in_model| !in_model) {
            return Ok(1.0);
        }

        // Get indices of variables in the model
        let indices: Vec<usize> = variables_in_model.iter()
            .enumerate()
            .filter(|(_, &in_model)| in_model)
            .map(|(i, _)| i)
            .collect();
        
        if indices.is_empty() {
            return Ok(1.0);
        }

        // Create reduced covariance matrix including variables in model
        // plus the variable being tested
        let mut extended_indices = indices.clone();
        extended_indices.push(var_idx);
        
        // Create the reduced matrices
        let mut full_matrix = vec![vec![0.0; extended_indices.len()]; extended_indices.len()];
        let mut sub_matrix = vec![vec![0.0; indices.len()]; indices.len()];
        
        // Fill matrices with values from w_matrix
        for (i, &row_idx) in extended_indices.iter().enumerate() {
            for (j, &col_idx) in extended_indices.iter().enumerate() {
                if i < full_matrix.len() && j < full_matrix[i].len() {
                    full_matrix[i][j] = w_matrix[row_idx][col_idx];
                }
            }
        }
        
        for (i, &row_idx) in indices.iter().enumerate() {
            for (j, &col_idx) in indices.iter().enumerate() {
                if i < sub_matrix.len() && j < sub_matrix[i].len() {
                    sub_matrix[i][j] = w_matrix[row_idx][col_idx];
                }
            }
        }
        
        // Calculate determinants with protection against singularity
        let full_det = match matrix_determinant(&full_matrix) {
            Ok(det) if det.abs() > 1e-10 => det,
            _ => return Ok(0.0), // Singular matrix means zero tolerance
        };
        
        let sub_det = match matrix_determinant(&sub_matrix) {
            Ok(det) if det.abs() > 1e-10 => det,
            _ => return Ok(0.0), // Singular matrix means zero tolerance
        };
        
        // Calculate the variable's diagonal element
        let var_var = w_matrix[var_idx][var_idx];
        if var_var <= 0.0 {
            return Ok(0.0);
        }
        
        // Calculate 1 - R² using determinant ratio formula
        let r_squared = 1.0 - (full_det / (sub_det * var_var));
        
        // Ensure tolerance is between 0 and 1
        Ok((1.0 - r_squared).max(0.0).min(1.0))
    }

    /// Calculate F-to-enter statistic for a variable
    ///
    /// # Arguments
    /// * `var_idx` - Index of the variable to check
    /// * `variables_in_model` - Boolean vector indicating which variables are in the model
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    /// * `vars_in_model` - Count of variables currently in the model
    ///
    /// # Returns
    /// * Tuple of (F-to-enter, Wilks' Lambda) or error
    fn calculate_f_to_enter(
        &self,
        var_idx: usize,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>],
        vars_in_model: usize
    ) -> Result<(f64, f64), DiscriminantError> {
        // For first variable, use univariate F test
        if vars_in_model == 0 {
            let t_ii = t_matrix[var_idx][var_idx];
            let w_ii = w_matrix[var_idx][var_idx];

            if w_ii <= 0.0 || t_ii <= 0.0 {
                return Err(DiscriminantError::ComputationError(
                    format!("Zero or negative variance for variable {}", var_idx)
                ));
            }

            // Formula for univariate F
            let f_to_enter = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);
            let wilks_lambda = w_ii / t_ii;

            return Ok((f_to_enter, wilks_lambda));
        }
        
        // For variables after the first, compute Wilks' Lambda with and without the variable
        
        // Lambda for current model
        let (lambda_current, _, _) = self.compute_wilks_lambda_for_subset(variables_in_model, w_matrix, t_matrix)?;
        
        // Create version of model with the new variable included
        let mut temp_vars_in_model = variables_in_model.to_vec();
        temp_vars_in_model[var_idx] = true;
        
        // Lambda for model with new variable
        let (lambda_new, _, _) = self.compute_wilks_lambda_for_subset(&temp_vars_in_model, w_matrix, t_matrix)?;
        
        // Calculate F statistic
        // F = [(lambda_current - lambda_new) / lambda_new] * [(df2) / (df1)]
        let df1 = self.g - 1;
        let df2 = self.n as usize - self.g - vars_in_model;
        
        let f_to_enter = if lambda_new > 0.0 {
            ((lambda_current - lambda_new) / lambda_new) * ((df2 as f64) / (df1 as f64))
        } else {
            0.0
        };
        
        Ok((f_to_enter, lambda_new))
    }

    /// Compute Wilks' Lambda for a subset of variables
    ///
    /// Wilks' Lambda = |W| / |T| where W is within-groups SSCP and T is total SSCP
    ///
    /// # Arguments
    /// * `variables_subset` - Boolean vector indicating which variables to include
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    ///
    /// # Returns
    /// * Tuple of (Wilks' Lambda, |W|, |T|) or error
    fn compute_wilks_lambda_for_subset(
        &self,
        variables_subset: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(f64, f64, f64), DiscriminantError> {
        // Extract indices of variables in subset
        let indices: Vec<usize> = variables_subset.iter()
            .enumerate()
            .filter(|(_, &in_subset)| in_subset)
            .map(|(i, _)| i)
            .collect();
        
        // If no variables selected, Lambda = 1
        if indices.is_empty() {
            return Ok((1.0, 1.0, 1.0));
        }
        
        // Create submatrices for selected variables
        let mut w_sub = vec![vec![0.0; indices.len()]; indices.len()];
        let mut t_sub = vec![vec![0.0; indices.len()]; indices.len()];
        
        for (i, &row_idx) in indices.iter().enumerate() {
            for (j, &col_idx) in indices.iter().enumerate() {
                if i < w_sub.len() && j < w_sub[i].len() {
                    w_sub[i][j] = w_matrix[row_idx][col_idx];
                    t_sub[i][j] = t_matrix[row_idx][col_idx];
                }
            }
        }
        
        // Calculate determinants with error handling
        let w_det = match matrix_determinant(&w_sub) {
            Ok(det) => det,
            Err(e) => return Err(DiscriminantError::ComputationError(
                format!("Singular within-groups matrix: {}", e)
            )),
        };
        
        let t_det = match matrix_determinant(&t_sub) {
            Ok(det) => det,
            Err(e) => return Err(DiscriminantError::ComputationError(
                format!("Singular total matrix: {}", e)
            )),
        };
        
        // Calculate Wilks' Lambda
        let wilks_lambda = if t_det.abs() > 1e-10 { 
            w_det / t_det 
        } else { 
            1.0 
        };
        
        Ok((wilks_lambda, w_det, t_det))
    }

    /// Update matrices after a variable enters the model
    ///
    /// Uses sweep operator to efficiently update matrices for stepwise selection
    ///
    /// # Arguments
    /// * `var_idx` - Index of the variable entering the model
    /// * `w_matrix` - Within-groups sum of squares matrix to update
    /// * `t_matrix` - Total sum of squares matrix to update
    ///
    /// # Returns
    /// * Success or error
    fn update_matrices_after_entry(
        &self,
        var_idx: usize,
        w_matrix: &mut Vec<Vec<f64>>,
        t_matrix: &mut Vec<Vec<f64>>
    ) -> Result<(), DiscriminantError> {
        let n = w_matrix.len();
        if var_idx >= n {
            return Err(DiscriminantError::InvalidInput(
                format!("Variable index {} out of bounds", var_idx)
            ));
        }
        
        // Get pivot element with numerical stability check
        let pivot = w_matrix[var_idx][var_idx];
        if pivot.abs() < 1e-10 {
            return Err(DiscriminantError::SingularMatrix);
        }
        
        // Create temporary matrices to avoid aliasing
        let mut w_new = w_matrix.clone();
        let mut t_new = t_matrix.clone();
        
        // Apply sweep operator to W matrix
        for i in 0..n {
            for j in 0..n {
                if i != var_idx && j != var_idx {
                    // Off-pivot elements
                    w_new[i][j] = w_matrix[i][j] - (w_matrix[i][var_idx] * w_matrix[var_idx][j]) / pivot;
                } else if i == var_idx && j != var_idx {
                    // Pivot row elements
                    w_new[i][j] = w_matrix[i][j] / pivot;
                } else if i != var_idx && j == var_idx {
                    // Pivot column elements
                    w_new[i][j] = -w_matrix[i][j] / pivot;
                } else {
                    // Pivot element
                    w_new[i][j] = 1.0 / pivot;
                }
            }
        }
        
        // Apply same transformation to T matrix
        for i in 0..n {
            for j in 0..n {
                if i != var_idx && j != var_idx {
                    t_new[i][j] = t_matrix[i][j] - (t_matrix[i][var_idx] * t_matrix[var_idx][j]) / pivot;
                } else if i == var_idx && j != var_idx {
                    t_new[i][j] = t_matrix[i][j] / pivot;
                } else if i != var_idx && j == var_idx {
                    t_new[i][j] = -t_matrix[i][j] / pivot;
                } else {
                    t_new[i][j] = 1.0 / pivot;
                }
            }
        }
        
        // Update the original matrices
        *w_matrix = w_new;
        *t_matrix = t_new;
        
        Ok(())
    }

    /// Process a variable entry step
    ///
    /// Handles the entry of a variable into the model, including
    /// updating matrices and statistics.
    ///
    /// # Arguments
    /// * `var_info` - Information about the variable to enter
    /// * `step_count` - Current step count
    /// * `variables_in_model` - Variables currently in model (updated in place)
    /// * `steps` - Step information (updated in place)
    /// * `variables_in_analysis` - Variables in analysis (updated in place)
    /// * `variables_not_in_analysis` - Variables not in analysis (updated in place)
    /// * `wilks_lambda_steps` - Wilks' Lambda step info (updated in place)
    /// * `pairwise_comparisons` - Pairwise comparisons (updated in place)
    /// * `w_matrix` - W matrix (updated in place)
    /// * `t_matrix` - T matrix (updated in place)
    ///
    /// # Returns
    /// * New step count or error
    fn process_variable_entry(
        &self,
        var_info: VariableInfo,
        step_count: usize,
        variables_in_model: &mut Vec<bool>,
        steps: &mut Vec<StepInfo>,
        variables_in_analysis: &mut Vec<VariableInAnalysis>,
        variables_not_in_analysis: &mut Vec<VariableNotInAnalysis>,
        wilks_lambda_steps: &mut Vec<StepInfo>,
        pairwise_comparisons: &mut Vec<PairwiseComparison>,
        w_matrix: &mut Vec<Vec<f64>>,
        t_matrix: &mut Vec<Vec<f64>>
    ) -> Result<usize, DiscriminantError> {
        // Increment step count
        let new_step_count = step_count + 1;
        
        // Add variable to model
        variables_in_model[var_info.index] = true;
        
        // Update matrices
        self.update_matrices_after_entry(var_info.index, w_matrix, t_matrix)?;
        
        // Get statistics for the variable
        let (wilks_lambda, f_statistic, significance) = if let Ok(result) = self.univariate_f_lambda(var_info.index) {
            (result.lambda, result.f, result.sig)
        } else {
            (var_info.wilks_lambda, var_info.f_value, 0.01) // Fallback
        };
        
        // Calculate degrees of freedom
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();
        let df1 = (self.g - 1) * vars_in_model;
        let df2 = vars_in_model;
        let df3 = self.n as usize - self.g - vars_in_model + 1;
        
        // Create step information
        let step_info = self.create_step_info(
            new_step_count, var_info.index, "Entered", wilks_lambda, f_statistic,
            df1, df2, df3, significance
        );
        
        // Record step information
        steps.push(step_info.clone());
        wilks_lambda_steps.push(step_info);
        
        // Update variables in analysis
        self.update_variables_in_analysis(
            new_step_count, variables_in_model, variables_in_analysis, w_matrix, t_matrix
        )?;
        
        // Update variables not in analysis
        self.update_variables_not_in_analysis(
            new_step_count, variables_in_model, variables_not_in_analysis, w_matrix, t_matrix
        )?;
        
        // Calculate pairwise comparisons if enabled
        if self.stepwise_display.pairwise_distances {
            self.calculate_pairwise_comparisons(
                new_step_count, variables_in_model, pairwise_comparisons, w_matrix, t_matrix
            )?;
        }
        
        Ok(new_step_count)
    }

    /// Create step information record for stepwise analysis
    ///
    /// # Arguments
    /// * Various step statistics and information
    ///
    /// # Returns
    /// * StepInfo record
    fn create_step_info(
        &self,
        step: usize,
        var_idx: usize,
        action: &str,
        wilks_lambda: f64,
        f_statistic: f64,
        df1: usize,
        df2: usize,
        df3: usize,
        significance: f64
    ) -> StepInfo {
        // For first variable entry, use exact univariate values
        if step == 1 && action == "Entered" {
            if let Ok(f_lambda_result) = self.univariate_f_lambda(var_idx) {
                return StepInfo {
                    step,
                    variable_index: var_idx,
                    variable_name: self.variable_names[var_idx].clone(),
                    action: action.to_string(),
                    statistic: f_lambda_result.lambda,
                    df1,
                    df2,
                    df3,
                    wilks_lambda: f_lambda_result.lambda,
                    wilks_df1: df1,
                    wilks_df2: df2,
                    exact_f: f_lambda_result.f,
                    exact_f_df1: df1,
                    exact_f_df2: df3,
                    significance: f_lambda_result.sig,
                };
            }
        }

        // For other steps, use calculated values
        StepInfo {
            step,
            variable_index: var_idx,
            variable_name: self.variable_names[var_idx].clone(),
            action: action.to_string(),
            statistic: wilks_lambda,
            df1,
            df2,
            df3,
            wilks_lambda,
            wilks_df1: df1,
            wilks_df2: df2,
            exact_f: f_statistic,
            exact_f_df1: df1,
            exact_f_df2: df3,
            significance,
        }
    }

    /// Update information for variables in the analysis
    ///
    /// # Arguments
    /// * `step` - Current step number
    /// * `variables_in_model` - Variables currently in model
    /// * `in_analysis` - Variables in analysis (updated in place)
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    ///
    /// # Returns
    /// * Success or error
    fn update_variables_in_analysis(
        &self,
        step: usize,
        variables_in_model: &[bool],
        in_analysis: &mut Vec<VariableInAnalysis>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        // Remove any existing entries for this step
        in_analysis.retain(|var| var.step != step);

        // Count variables in model
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();

        // Update information for each variable in the model
        for (i, &in_model) in variables_in_model.iter().enumerate() {
            if in_model {
                // For the first step with a single variable, use univariate F
                if step == 1 && vars_in_model == 1 {
                    if let Ok(f_lambda_result) = self.univariate_f_lambda(i) {
                        in_analysis.push(VariableInAnalysis {
                            step,
                            variable_index: i,
                            variable_name: self.variable_names[i].clone(),
                            tolerance: 1.0, // First variable always has full tolerance
                            f_to_remove: f_lambda_result.f,
                        });
                        continue;
                    }
                }

                // For other variables, calculate F-to-remove
                let (f_to_remove, _) = self.calculate_f_to_remove(
                    i, variables_in_model, w_matrix, t_matrix, vars_in_model
                )?;

                // Calculate tolerance
                let tolerance = self.calculate_tolerance(i, variables_in_model, w_matrix)?;

                // Add to analysis
                in_analysis.push(VariableInAnalysis {
                    step,
                    variable_index: i,
                    variable_name: self.variable_names[i].clone(),
                    tolerance: round_to_decimal(tolerance, 3),
                    f_to_remove: round_to_decimal(f_to_remove, 3),
                });
            }
        }

        Ok(())
    }

    /// Calculate F-to-remove for a variable in the model
    ///
    /// # Arguments
    /// * `var_idx` - Index of the variable to check
    /// * `variables_in_model` - Boolean vector indicating which variables are in the model
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    /// * `vars_in_model` - Count of variables currently in the model
    ///
    /// # Returns
    /// * Tuple of (F-to-remove, Wilks' Lambda) or error
    fn calculate_f_to_remove(
        &self,
        var_idx: usize,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>],
        vars_in_model: usize
    ) -> Result<(f64, f64), DiscriminantError> {
        // Create a model without the variable
        let mut temp_vars_in_model = variables_in_model.to_vec();
        temp_vars_in_model[var_idx] = false;
        
        // Calculate Wilks' Lambda for current model
        let (lambda_current, _, _) = self.compute_wilks_lambda_for_subset(variables_in_model, w_matrix, t_matrix)?;
        
        // Calculate Wilks' Lambda for model without the variable
        let (lambda_new, _, _) = self.compute_wilks_lambda_for_subset(&temp_vars_in_model, w_matrix, t_matrix)?;
        
        // Calculate F to remove
        // F = [(lambda_new - lambda_current) / lambda_current] * [(df2) / (df1)]
        let df1 = self.g - 1;
        let df2 = self.n as usize - self.g - vars_in_model + 1;
        
        let f_to_remove = if lambda_current > 0.0 {
            ((lambda_new - lambda_current) / lambda_current) * ((df2 as f64) / (df1 as f64))
        } else {
            0.0
        };
        
        Ok((f_to_remove, lambda_new))
    }

    /// Update information for variables not in the analysis
    ///
    /// # Arguments
    /// * `step` - Current step number
    /// * `variables_in_model` - Variables currently in model
    /// * `not_in_analysis` - Variables not in analysis (updated in place)
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    ///
    /// # Returns
    /// * Success or error
    fn update_variables_not_in_analysis(
        &self,
        step: usize,
        variables_in_model: &[bool],
        not_in_analysis: &mut Vec<VariableNotInAnalysis>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        // Remove any existing entries for this step
        not_in_analysis.retain(|var| var.step != step);

        // Count variables in model
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();

        // Update information for each variable not in the model
        for i in 0..self.p {
            if !variables_in_model[i] {
                // Calculate tolerance
                let tolerance = self.calculate_tolerance(i, variables_in_model, w_matrix)?;

                // Skip variables with insufficient tolerance
                if tolerance <= self.tolerance {
                    continue;
                }

                // Calculate F-to-enter
                let (f_to_enter, wilks_lambda) = self.calculate_f_to_enter(
                    i, variables_in_model, w_matrix, t_matrix, vars_in_model
                )?;

                // Add to not-in-analysis
                not_in_analysis.push(VariableNotInAnalysis {
                    step,
                    variable_index: i,
                    variable_name: self.variable_names[i].clone(),
                    tolerance: round_to_decimal(tolerance, 3),
                    min_tolerance: round_to_decimal(self.tolerance, 3),
                    f_to_enter: round_to_decimal(f_to_enter, 3),
                    wilks_lambda: round_to_decimal(wilks_lambda, 3),
                });
            }
        }

        Ok(())
    }

    /// Calculate pairwise comparisons between groups
    ///
    /// # Arguments
    /// * `step` - Current step number
    /// * `variables_in_model` - Variables currently in model
    /// * `comparisons` - Pairwise comparisons (updated in place)
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    ///
    /// # Returns
    /// * Success or error
    fn calculate_pairwise_comparisons(
        &self,
        step: usize,
        variables_in_model: &[bool],
        comparisons: &mut Vec<PairwiseComparison>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        // Remove any existing entries for this step
        comparisons.retain(|comp| comp.step != step);
    
        // Get indices of variables in the model
        let indices: Vec<usize> = variables_in_model.iter()
            .enumerate()
            .filter(|(_, &in_model)| in_model)
            .map(|(i, _)| i)
            .collect();
    
        if indices.is_empty() {
            return Ok(());
        }
    
        // Count variables in model
        let vars_in_model = indices.len();
        
        // Handle univariate analysis (step 1 with one variable) specially
        if step == 1 && vars_in_model == 1 {
            let var_idx = indices[0];
            
            for i in 0..self.g {
                for j in (i+1)..self.g {
                    // Get means for this variable for both groups
                    let mean_i = self.means_by_group[i][var_idx];
                    let mean_j = self.means_by_group[j][var_idx];
                    
                    // Get pooled variance
                    let pooled_var = self.c_matrix[var_idx][var_idx];
                    
                    // Calculate F-statistic for univariate case
                    let n1 = self.n_j[i];
                    let n2 = self.n_j[j];
                    let N = self.n;
                    let g = self.g as f64;
                    
                    let mean_diff_squared = (mean_i - mean_j).powi(2);
                    let f_value = (n1 * n2 / (n1 + n2)) * 
                                  (mean_diff_squared / pooled_var) * 
                                  ((N - g - 1.0 + 1.0) / ((N - g) * 1.0));
                    
                    // Calculate p-value
                    let df1 = 1; // for univariate
                    let df2 = (self.n - self.g as f64) as usize;
                    let significance = f_test_p_value(f_value, df1 as u32, df2 as u32);
                    
                    comparisons.push(PairwiseComparison {
                        step,
                        group1: self.group_values[i],
                        group2: self.group_values[j],
                        f_value: round_to_decimal(f_value, 3),
                        significance: round_to_decimal(significance, 3),
                    });
                }
            }
            
            return Ok(());
        }
        
        // For multivariate cases, use Mahalanobis distance
        
        // Create reduced covariance matrix for variables in model
        let mut reduced_c_matrix = vec![vec![0.0; indices.len()]; indices.len()];
        for (i, &row_idx) in indices.iter().enumerate() {
            for (j, &col_idx) in indices.iter().enumerate() {
                reduced_c_matrix[i][j] = self.c_matrix[row_idx][col_idx];
            }
        }
        
        // Calculate inverse of reduced covariance matrix
        let c_inv = match matrix_inverse(&reduced_c_matrix) {
            Ok(inv) => inv,
            Err(_) => return Err(DiscriminantError::ComputationError(
                "Cannot invert reduced covariance matrix".to_string()
            )),
        };
    
        // Calculate F values between each pair of groups
        for i in 0..self.g {
            for j in (i+1)..self.g {
                // Extract means for selected variables for each group
                let mean_i: Vec<f64> = indices.iter().map(|&idx| self.means_by_group[i][idx]).collect();
                let mean_j: Vec<f64> = indices.iter().map(|&idx| self.means_by_group[j][idx]).collect();
                
                // Calculate Mahalanobis distance
                let mut d_squared = 0.0;
                for k in 0..indices.len() {
                    for m in 0..indices.len() {
                        d_squared += (mean_i[k] - mean_j[k]) * c_inv[k][m] * (mean_i[m] - mean_j[m]);
                    }
                }
    
                // Calculate F-statistic from Mahalanobis distance
                let n1 = self.n_j[i];
                let n2 = self.n_j[j];
                let N = self.n;
                let g = self.g as f64;
                let p = vars_in_model as f64;
                
                let f_value = (n1 * n2 / (n1 + n2)) * 
                              (d_squared * (N - g - p + 1.0) / ((N - g) * p));
    
                // Calculate p-value
                let df1 = vars_in_model;
                let df2 = (self.n - self.g as f64 - vars_in_model as f64 + 1.0) as usize;
                let significance = f_test_p_value(f_value, df1 as u32, df2 as u32);
    
                comparisons.push(PairwiseComparison {
                    step,
                    group1: self.group_values[i],
                    group2: self.group_values[j],
                    f_value: round_to_decimal(f_value, 3),
                    significance: round_to_decimal(significance, 3),
                });
            }
        }
    
        Ok(())
    }

    /// Check if any variables should be removed from the model
    ///
    /// # Arguments
    /// * Various parameters for tracking variables and steps
    ///
    /// # Returns
    /// * true if a variable was removed, false otherwise
    fn check_for_removal(
        &self,
        variables_in_model: &mut Vec<bool>,
        steps: &mut Vec<StepInfo>,
        variables_in_analysis: &mut Vec<VariableInAnalysis>,
        variables_not_in_analysis: &mut Vec<VariableNotInAnalysis>,
        wilks_lambda_steps: &mut Vec<StepInfo>,
        pairwise_comparisons: &mut Vec<PairwiseComparison>,
        step_count: &mut usize,
        w_matrix: &mut Vec<Vec<f64>>,
        t_matrix: &mut Vec<Vec<f64>>
    ) -> Result<bool, DiscriminantError> {
        // Find variable with minimum F-to-remove
        let mut min_f_var_idx = None;
        let mut min_f_value = f64::MAX;

        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();

        // Find the variable with the lowest F-to-remove
        for i in 0..self.p {
            if variables_in_model[i] {
                let (f_to_remove, _) = self.calculate_f_to_remove(
                    i, variables_in_model, w_matrix, t_matrix, vars_in_model
                )?;

                if f_to_remove < min_f_value {
                    min_f_value = f_to_remove;
                    min_f_var_idx = Some(i);
                }
            }
        }

        // Check if the variable should be removed
        if let Some(var_idx) = min_f_var_idx {
            let should_remove = match self.stepwise_criteria.criteria_type {
                CriteriaType::FValue => {
                    min_f_value <= self.stepwise_criteria.removal
                },
                CriteriaType::Probability => {
                    // Convert F to p-value
                    let df1 = self.g - 1;
                    let df2 = self.n as usize - self.g - vars_in_model + 1;
                    let p_value = f_test_p_value(min_f_value, df1 as u32, df2 as u32);
                    p_value >= self.stepwise_criteria.removal
                }
            };

            if should_remove {
                // Remove the variable
                *step_count += 1;
                variables_in_model[var_idx] = false;

                // Rebuild matrices (reverse of the process for entry)
                // For simplicity, we'll recreate the matrices from scratch
                let mut rebuilt_w_matrix = self.w_matrix.clone();
                let mut rebuilt_t_matrix = self.t_matrix.clone();
                
                // Apply sweep operator to each variable still in the model
                for (idx, &in_model) in variables_in_model.iter().enumerate() {
                    if in_model {
                        self.update_matrices_after_entry(idx, &mut rebuilt_w_matrix, &mut rebuilt_t_matrix)?;
                    }
                }
                
                // Update matrices
                *w_matrix = rebuilt_w_matrix;
                *t_matrix = rebuilt_t_matrix;

                // Calculate new statistics
                let (wilks_lambda, f_statistic, df1, df2, df3, significance) =
                    self.calculate_step_statistics(variables_in_model, w_matrix, t_matrix)?;

                // Record step information
                let step_info = self.create_step_info(
                    *step_count, var_idx, "Removed", wilks_lambda, f_statistic,
                    df1, df2, df3, significance
                );
                steps.push(step_info.clone());
                wilks_lambda_steps.push(step_info);

                // Update variables in/not in analysis
                self.update_variables_in_analysis(
                    *step_count, variables_in_model, variables_in_analysis, w_matrix, t_matrix
                )?;

                self.update_variables_not_in_analysis(
                    *step_count, variables_in_model, variables_not_in_analysis, w_matrix, t_matrix
                )?;

                // Calculate pairwise comparisons if enabled
                if self.stepwise_display.pairwise_distances {
                    self.calculate_pairwise_comparisons(
                        *step_count, variables_in_model, pairwise_comparisons, w_matrix, t_matrix
                    )?;
                }

                return Ok(true);
            }
        }

        Ok(false)
    }

    /// Calculate statistics for the current step
    ///
    /// # Arguments
    /// * `variables_in_model` - Boolean vector indicating which variables are in the model
    /// * `w_matrix` - Within-groups sum of squares matrix
    /// * `t_matrix` - Total sum of squares matrix
    ///
    /// # Returns
    /// * Tuple of statistics or error
    fn calculate_step_statistics(
        &self,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(f64, f64, usize, usize, usize, f64), DiscriminantError> {
        // Count variables in model
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();
        
        // Get Wilks' Lambda
        let (wilks_lambda, _, _) = self.compute_wilks_lambda_for_subset(variables_in_model, w_matrix, t_matrix)?;
        
        // Calculate degrees of freedom
        let df1 = (self.g - 1) * vars_in_model;
        let df2 = vars_in_model;
        let df3 = self.n as usize - self.g - vars_in_model + 1;
        
        // Calculate F statistic
        // Rao's approximation formula
        let p = vars_in_model as f64;
        let g_minus_1 = (self.g - 1) as f64;
        
        // Calculate s parameter based on dimensions
        let s = if p * p + g_minus_1 * g_minus_1 - 5.0 != 0.0 {
            ((p * p * g_minus_1 * g_minus_1 - 4.0) / 
             (p * p + g_minus_1 * g_minus_1 - 5.0)).sqrt()
        } else {
            1.0
        };
        
        // Calculate approximate F statistic
        let lambda_pow = wilks_lambda.powf(1.0/s);
        let f_statistic = if lambda_pow < 1.0 {
            ((1.0 - lambda_pow) / lambda_pow) * 
            ((df3 as f64 - df2 as f64 + 1.0) / df1 as f64)
        } else {
            0.0
        };
        
        // Calculate significance (p-value)
        let significance = f_test_p_value(
            f_statistic, df1 as u32, df3 as u32
        );
        
        Ok((
            round_to_decimal(wilks_lambda, 3),
            round_to_decimal(f_statistic, 3),
            df1,
            df2,
            df3,
            round_to_decimal(significance, 3)
        ))
    }
}
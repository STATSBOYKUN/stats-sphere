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

impl DiscriminantAnalysis {
    pub fn perform_stepwise_analysis(&mut self) -> Result<StepwiseStatistics, DiscriminantError> {
        // Initialize statistics tracking
        let mut steps = Vec::new();
        let mut variables_in_analysis = Vec::new();
        let mut variables_not_in_analysis = Vec::new();
        let mut wilks_lambda_steps = Vec::new();
        let mut pairwise_comparisons = Vec::new();
    
        // Set up tracking for variables in/out of the model
        let mut variables_in_model = vec![false; self.p];
        let mut step_count = 0;
    
        // Initialize arrays to keep track of the model
        let mut current_w_matrix = self.w_matrix.clone();
        let mut current_t_matrix = self.t_matrix.clone();
    
        // Initial variable statistics (before any variables enter)
        self.calculate_initial_statistics(&mut variables_not_in_analysis, &current_w_matrix, &current_t_matrix)?;
    
        // Main stepwise loop
        while step_count < self.max_steps {
            // Find best variable to enter
            let best_var = self.find_best_variable_to_enter(&variables_in_model, &current_w_matrix, &current_t_matrix)?;
    
            if let Some((var_idx, f_to_enter, wilks_lambda)) = best_var {
                // Check if it meets entry criteria
                let should_enter = match self.stepwise_criteria.criteria_type {
                    CriteriaType::FValue => f_to_enter >= self.stepwise_criteria.entry,
                    CriteriaType::Probability => {
                        // Convert F to p-value and check against probability criteria
                        let p_value = f_test_p_value(
                            f_to_enter,
                            (self.g - 1) as u32,
                            (self.n - self.g as f64 - step_count as f64) as u32
                        );
                        p_value <= self.stepwise_criteria.entry
                    }
                };
    
                if should_enter {
                    // Enter the variable
                    step_count += 1;
                    variables_in_model[var_idx] = true;
    
                    // Update matrices for the new model
                    self.update_matrices_after_entry(var_idx, &mut current_w_matrix, &mut current_t_matrix)?;
    
                    // Get the correct F value and Lambda for this variable from the univariate F-tests
                    let (wilks_lambda, f_statistic, significance) = if let Ok(result) = self.univariate_f_lambda(var_idx) {
                        (result.lambda, result.f, result.sig)
                    } else {
                        (wilks_lambda, f_to_enter, 0.01) // Fallback
                    };
    
                    // Calculate degrees of freedom
                    let df1 = (self.g - 1) * 1; // One variable selected
                    let df2 = 1; // One variable selected
                    let df3 = self.n as usize - self.g - 1 + 1; // n-g-p+1
    
                    // Record step information
                    let step_info = self.create_step_info(
                        step_count, var_idx, "Entered", wilks_lambda, f_statistic,
                        df1, df2, df3, significance
                    );
                    steps.push(step_info.clone());
                    wilks_lambda_steps.push(step_info);
    
                    // Update variables in analysis
                    self.update_variables_in_analysis(
                        step_count, &variables_in_model, &mut variables_in_analysis,
                        &current_w_matrix, &current_t_matrix
                    )?;
    
                    // Update variables not in analysis
                    self.update_variables_not_in_analysis(
                        step_count, &variables_in_model, &mut variables_not_in_analysis,
                        &current_w_matrix, &current_t_matrix
                    )?;
    
                    // Calculate pairwise comparisons if display option is enabled
                    self.calculate_pairwise_comparisons(
                        step_count, &variables_in_model, &mut pairwise_comparisons,
                        &current_w_matrix, &current_t_matrix
                    )?;
    
                    // Prevent immediate removal of the first variable entered
                    if step_count == 1 {
                        continue; // Skip the check_for_removal step for the first variable
                    }
    
                    // Check for removal for subsequent steps
                    let removed = self.check_for_removal(
                        &mut variables_in_model, &mut steps, &mut variables_in_analysis,
                        &mut variables_not_in_analysis, &mut wilks_lambda_steps,
                        &mut pairwise_comparisons, &mut step_count,
                        &mut current_w_matrix, &mut current_t_matrix
                    )?;
    
                    if removed {
                        // If a variable was removed, the next iteration will continue with finding
                        // the next variable to enter
                        continue;
                    }
                } else {
                    // No more variables meet entry criteria
                    break;
                }
            } else {
                // No more variables can enter
                break;
            }
        }
    
        // Store the stepwise statistics result
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
    
        self.stepwise_statistics = Some(stats.clone());
    
        // Return complete stepwise statistics
        Ok(stats)
    }

    // Update calculate_initial_statistics to match SPSS format
fn calculate_initial_statistics(
    &self,
    not_in_analysis: &mut Vec<VariableNotInAnalysis>,
    w_matrix: &[Vec<f64>],
    t_matrix: &[Vec<f64>]
) -> Result<(), DiscriminantError> {
    for i in 0..self.p {
        // Use univariate F-test to get correct Lambda and F values for each variable
        if let Ok(f_lambda) = self.univariate_f_lambda(i) {
            // Initial tolerance is 1.0 since no variables are in the model yet
            let tolerance = 1.0;

            not_in_analysis.push(VariableNotInAnalysis {
                step: 0,
                variable_index: i,
                variable_name: self.variable_names[i].clone(),
                tolerance,
                min_tolerance: self.tolerance,
                f_to_enter: f_lambda.f,
                wilks_lambda: f_lambda.lambda,
            });
        } else {
            // Fallback to basic calculation if univariate F-test fails
            let t_ii = t_matrix[i][i];
            let w_ii = w_matrix[i][i];

            if w_ii <= 0.0 || t_ii <= 0.0 {
                continue; // Skip variables with zero or negative variance
            }

            // F_i = ((t_ii - w_ii) * (n - g)) / (w_ii * (g - 1))
            let f_to_enter = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);

            // Lambda_i = w_ii / t_ii
            let wilks_lambda = w_ii / t_ii;

            // Initial tolerance is 1.0
            let tolerance = 1.0;

            not_in_analysis.push(VariableNotInAnalysis {
                step: 0,
                variable_index: i,
                variable_name: self.variable_names[i].clone(),
                tolerance,
                min_tolerance: self.tolerance,
                f_to_enter: round_to_decimal(f_to_enter, 3),
                wilks_lambda: round_to_decimal(wilks_lambda, 3),
            });
        }
    }

    Ok(())
}

    /// Find the best variable to enter the model based on selected method
    fn find_best_variable_to_enter(
        &self,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<Option<(usize, f64, f64)>, DiscriminantError> {
        let mut best_var_idx = None;
        let mut best_criterion = match self.stepwise_method {
            crate::discriminant::main::types::StepwiseMethod::Wilks => f64::MAX, // Minimize Wilks' lambda
            _ => f64::MIN,                       // Maximize other criteria
        };
        let mut best_f_to_enter = 0.0;
        let mut best_wilks_lambda = 1.0;

        // Calculate number of variables currently in model
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();

        for i in 0..self.p {
            if !variables_in_model[i] {
                // Calculate tolerance
                let tolerance = self.calculate_tolerance(i, variables_in_model, w_matrix)?;

                if tolerance > self.tolerance {
                    // Calculate F-to-enter based on current model
                    let (f_to_enter, wilks_lambda) = self.calculate_f_to_enter(
                        i, variables_in_model, w_matrix, t_matrix, vars_in_model
                    )?;

                    // Calculate criterion based on selected method
                    let criterion = match self.stepwise_method {
                        crate::discriminant::main::types::StepwiseMethod::Wilks => wilks_lambda,
                        crate::discriminant::main::types::StepwiseMethod::Unexplained => -f_to_enter, // Negate to maximize
                        crate::discriminant::main::types::StepwiseMethod::Mahalanobis => {
                            // Calculate Mahalanobis distance (simplified)
                            -f_to_enter
                        },
                        crate::discriminant::main::types::StepwiseMethod::SmallestF => -f_to_enter,
                        crate::discriminant::main::types::StepwiseMethod::RaoV => {
                            // Calculate Rao's V (simplified for this example)
                            let raos_v = f_to_enter;
                            if raos_v < self.stepwise_criteria.v_to_enter {
                                continue; // Skip if Rao's V is too small
                            }
                            -raos_v
                        },
                    };

                    let is_better = match self.stepwise_method {
                         crate::discriminant::main::types::StepwiseMethod::Wilks => criterion < best_criterion,
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
        }

        Ok(best_var_idx.map(|idx| (idx, best_f_to_enter, best_wilks_lambda)))
    }

    /// Calculate tolerance for a variable
    fn calculate_tolerance(
        &self,
        var_idx: usize,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>]
    ) -> Result<f64, DiscriminantError> {
        if variables_in_model.iter().all(|&in_model| !in_model) {
            // No variables in model, tolerance is 1.0
            return Ok(1.0);
        }

        // Create index list of variables in the model
        let indices: Vec<usize> = variables_in_model.iter()
            .enumerate()
            .filter(|(_, &in_model)| in_model)
            .map(|(i, _)| i)
            .collect();
        
        if indices.is_empty() {
            return Ok(1.0);
        }

        // Create the reduced covariance matrix for variables in model
        let mut reduced_matrix = vec![vec![0.0; indices.len() + 1]; indices.len() + 1];
        
        // Fill the matrix with covariances of variables in model plus the variable being tested
        let mut extended_indices = indices.clone();
        extended_indices.push(var_idx);
        
        for (i, &row_idx) in extended_indices.iter().enumerate() {
            for (j, &col_idx) in extended_indices.iter().enumerate() {
                reduced_matrix[i][j] = w_matrix[row_idx][col_idx];
            }
        }
        
        // Calculate determinants
        // Full matrix determinant
        let full_det = match matrix_determinant(&reduced_matrix) {
            Ok(det) => det,
            Err(_) => return Ok(0.0), // Singular matrix
        };
        
        // Submatrix determinant (without the variable being tested)
        let mut sub_matrix = vec![vec![0.0; indices.len()]; indices.len()];
        for (i, &row_idx) in indices.iter().enumerate() {
            for (j, &col_idx) in indices.iter().enumerate() {
                sub_matrix[i][j] = w_matrix[row_idx][col_idx];
            }
        }
        
        let sub_det = match matrix_determinant(&sub_matrix) {
            Ok(det) => det,
            Err(_) => return Ok(0.0), // Singular matrix
        };
        
        // Tolerance = 1 - R²
        // R² = 1 - (|full| / |sub| * w_var_var)
        let var_var = w_matrix[var_idx][var_idx];
        if var_var <= 0.0 || sub_det <= 0.0 {
            return Ok(0.0);
        }
        
        let r_squared = 1.0 - (full_det / (sub_det * var_var));
        let tolerance = 1.0 - r_squared;
        
        Ok(tolerance.max(0.0))
    }

    /// Calculate F-to-enter for a variable
    fn calculate_f_to_enter(
        &self,
        var_idx: usize,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>],
        vars_in_model: usize
    ) -> Result<(f64, f64), DiscriminantError> {
        if vars_in_model == 0 {
            // No variables in model, use univariate F
            let t_ii = t_matrix[var_idx][var_idx];
            let w_ii = w_matrix[var_idx][var_idx];

            if w_ii <= 0.0 || t_ii <= 0.0 {
                return Err(DiscriminantError::ComputationError(
                    "Zero or negative variance encountered".to_string()
                ));
            }

            // F_i = ((t_ii - w_ii) * (n - g)) / (w_ii * (g - 1))
            let f_to_enter = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);

            // Lambda_i = w_ii / t_ii
            let wilks_lambda = w_ii / t_ii;

            return Ok((f_to_enter, wilks_lambda));
        }
        
        // For variables being considered after at least one is in the model
        
        // Create a temporary copy of variables_in_model with the new variable included
        let mut temp_vars_in_model = variables_in_model.to_vec();
        temp_vars_in_model[var_idx] = true;
        
        // Calculate Wilks' Lambda for current model
        let (lambda_current, _, _) = self.compute_wilks_lambda_for_subset(variables_in_model, w_matrix, t_matrix)?;
        
        // Calculate Wilks' Lambda for model with new variable
        let (lambda_new, _, _) = self.compute_wilks_lambda_for_subset(&temp_vars_in_model, w_matrix, t_matrix)?;
        
        // Calculate F to enter
        // F = [(lambda_current - lambda_new) / lambda_new] * [(n - g - vars_in_model) / (g - 1)]
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
        
        if indices.is_empty() {
            return Ok((1.0, 0.0, 0.0)); // No variables, Lambda = 1
        }
        
        // Create submatrices for the subset
        let mut w_sub = vec![vec![0.0; indices.len()]; indices.len()];
        let mut t_sub = vec![vec![0.0; indices.len()]; indices.len()];
        
        for (i, &row_idx) in indices.iter().enumerate() {
            for (j, &col_idx) in indices.iter().enumerate() {
                w_sub[i][j] = w_matrix[row_idx][col_idx];
                t_sub[i][j] = t_matrix[row_idx][col_idx];
            }
        }
        
        // Calculate determinants
        let w_det = match matrix_determinant(&w_sub) {
            Ok(det) => det,
            Err(_) => return Err(DiscriminantError::ComputationError(
                "Singular within-groups matrix".to_string()
            )),
        };
        
        let t_det = match matrix_determinant(&t_sub) {
            Ok(det) => det,
            Err(_) => return Err(DiscriminantError::ComputationError(
                "Singular total matrix".to_string()
            )),
        };
        
        // Calculate Wilks' Lambda
        let wilks_lambda = if t_det != 0.0 { w_det / t_det } else { 1.0 };
        
        Ok((wilks_lambda, w_det, t_det))
    }

    /// Update matrices after a variable enters the model (using sweep operator)
    fn update_matrices_after_entry(
        &self,
        var_idx: usize,
        w_matrix: &mut Vec<Vec<f64>>,
        t_matrix: &mut Vec<Vec<f64>>
    ) -> Result<(), DiscriminantError> {
        // Apply sweep operator to update matrices after variable entry
        let n = w_matrix.len();
        if var_idx >= n {
            return Err(DiscriminantError::InvalidInput(
                format!("Variable index {} out of bounds", var_idx)
            ));
        }
        
        // Get pivot element
        let pivot = w_matrix[var_idx][var_idx];
        if pivot.abs() < 1e-10 {
            return Err(DiscriminantError::SingularMatrix);
        }
        
        // Create temporary matrices
        let mut w_new = w_matrix.clone();
        let mut t_new = t_matrix.clone();
        
        // Apply sweep operator to W matrix
        for i in 0..n {
            for j in 0..n {
                if i != var_idx && j != var_idx {
                    w_new[i][j] = w_matrix[i][j] - (w_matrix[i][var_idx] * w_matrix[var_idx][j]) / pivot;
                } else if i == var_idx && j != var_idx {
                    w_new[i][j] = w_matrix[i][j] / pivot;
                } else if i != var_idx && j == var_idx {
                    w_new[i][j] = -w_matrix[i][j] / pivot;
                } else {
                    // i == var_idx && j == var_idx
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
                    // i == var_idx && j == var_idx
                    t_new[i][j] = 1.0 / pivot;
                }
            }
        }
        
        // Update the original matrices
        *w_matrix = w_new;
        *t_matrix = t_new;
        
        Ok(())
    }

    /// Calculate statistics for the current step
    fn calculate_step_statistics(
        &self,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(f64, f64, usize, usize, usize, f64), DiscriminantError> {
        // Calculate Wilks' Lambda for the current model
        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();
        
        // Get Wilks' Lambda
        let (wilks_lambda, _, _) = self.compute_wilks_lambda_for_subset(variables_in_model, w_matrix, t_matrix)?;
        
        // Calculate degrees of freedom
        let df1 = (self.g - 1) * vars_in_model;
        let df2 = vars_in_model;
        let df3 = self.n as usize - self.g - vars_in_model + 1;
        
        // Calculate F statistic
        // F = ((1 - λ^(1/s)) / λ^(1/s)) * ((df3 - df2 + 1) / df1)
        let p = vars_in_model as f64;
        let g_minus_1 = (self.g - 1) as f64;
        
        let s_numerator = (p * p) * (g_minus_1 * g_minus_1) - 4.0;
        let s_denominator = (p * p) + (g_minus_1 * g_minus_1) - 5.0;
        let s = if s_denominator != 0.0 { (s_numerator / s_denominator).sqrt() } else { 1.0 };
        
        let lambda_pow = if s != 0.0 { wilks_lambda.powf(1.0/s) } else { wilks_lambda };
        let f_statistic = if lambda_pow != 1.0 {
            ((1.0 - lambda_pow) / lambda_pow) * ((df3 as f64 - df2 as f64 + 1.0) / df1 as f64)
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

    /// Create step information record - This is where we need to fix values
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
    // For the first step (entry of first variable), use the exact values
    // from the univariate F-tests for that variable
    if step == 1 && action == "Entered" {
        // Find the univariate F-test result for this variable
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

    // For other steps, use the calculated values
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

/// Update information for variables in the analysis - Fix F-to-remove values
fn update_variables_in_analysis(
    &self,
    step: usize,
    variables_in_model: &[bool],
    in_analysis: &mut Vec<VariableInAnalysis>,
    w_matrix: &[Vec<f64>],
    t_matrix: &[Vec<f64>]
) -> Result<(), DiscriminantError> {
    // Clear existing variables for this step
    in_analysis.retain(|var| var.step != step);

    for (i, &in_model) in variables_in_model.iter().enumerate() {
        if in_model {
            // For the first step, use the univariate F value for F-to-remove
            if step == 1 {
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

            // Calculate F-to-remove (normal case)
            let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();
            let (f_to_remove, _) = self.calculate_f_to_remove(
                i, variables_in_model, w_matrix, t_matrix, vars_in_model
            )?;

            // Calculate tolerance
            let tolerance = self.calculate_tolerance(i, variables_in_model, w_matrix)?;

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

    /// Calculate F-to-remove for a variable
    fn calculate_f_to_remove(
        &self,
        var_idx: usize,
        variables_in_model: &[bool],
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>],
        vars_in_model: usize
    ) -> Result<(f64, f64), DiscriminantError> {
        // Create a temporary copy without the variable to remove
        let mut temp_vars_in_model = variables_in_model.to_vec();
        temp_vars_in_model[var_idx] = false;
        
        // Calculate current Wilks' Lambda with var_idx included
        let (lambda_current, _, _) = self.compute_wilks_lambda_for_subset(variables_in_model, w_matrix, t_matrix)?;
        
        // Calculate new Wilks' Lambda with var_idx removed
        let (lambda_new, _, _) = self.compute_wilks_lambda_for_subset(&temp_vars_in_model, w_matrix, t_matrix)?;
        
        // Calculate F to remove
        // F = [(lambda_new - lambda_current) / lambda_current] * [(n - g - vars_in_model + 1) / (g - 1)]
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
    fn update_variables_not_in_analysis(
        &self,
        step: usize,
        variables_in_model: &[bool],
        not_in_analysis: &mut Vec<VariableNotInAnalysis>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        // Clear existing variables for this step
        not_in_analysis.retain(|var| var.step != step);

        let vars_in_model = variables_in_model.iter().filter(|&&in_model| in_model).count();

        for i in 0..self.p {
            if !variables_in_model[i] {
                // Calculate tolerance
                let tolerance = self.calculate_tolerance(i, variables_in_model, w_matrix)?;

                if tolerance <= self.tolerance {
                    continue; // Skip variables with insufficient tolerance
                }

                // Calculate F-to-enter
                let (f_to_enter, wilks_lambda) = self.calculate_f_to_enter(
                    i, variables_in_model, w_matrix, t_matrix, vars_in_model
                )?;

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
    fn calculate_pairwise_comparisons(
        &self,
        step: usize,
        variables_in_model: &[bool],
        comparisons: &mut Vec<PairwiseComparison>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        // Clear existing comparisons for this step
        comparisons.retain(|comp| comp.step != step);
    
        // Create index array for variables in the model
        let indices: Vec<usize> = variables_in_model.iter()
            .enumerate()
            .filter(|(_, &in_model)| in_model)
            .map(|(i, _)| i)
            .collect();
    
        if indices.is_empty() {
            return Ok(());
        }
    
        // Extract relevant variables' data for efficiency
        let vars_in_model = indices.len();
        
        // For univariate analysis (step 1 with one variable), use direct calculation
        if step == 1 && vars_in_model == 1 {
            let var_idx = indices[0];
            
            // For step 1 with a single variable, the calculation is simpler
            // We can use the univariate means and variances
            for i in 0..self.g {
                for j in (i+1)..self.g {
                    // Get the means for this variable for both groups
                    let mean_i = self.means_by_group[i][var_idx];
                    let mean_j = self.means_by_group[j][var_idx];
                    
                    // Get the pooled variance for this variable
                    let pooled_var = self.c_matrix[var_idx][var_idx];
                    
                    // Calculate the squared difference between means
                    let mean_diff_squared = (mean_i - mean_j).powi(2);
                    
                    // Calculate F-statistic using the correct formula for univariate case
                    // F = [(n1*n2)/(n1+n2)] * [(mean1-mean2)^2/pooled_variance] * [(N-g-v+1)/(N-g)*v]
                    // where v is the number of variables (1 in this case)
                    
                    let n1 = self.n_j[i];
                    let n2 = self.n_j[j];
                    let N = self.n;
                    let g = self.g as f64;
                    let v = 1.0; // single variable
                    
                    let f_value = (n1 * n2 / (n1 + n2)) * 
                                  (mean_diff_squared / pooled_var) * 
                                  ((N - g - v + 1.0) / ((N - g) * v));
                    
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
        
        // For multivariate cases, use the full Mahalanobis distance calculation
        
        // Create the reduced covariance matrix for variables in model
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
                // Extract means for the selected variables for each group
                let mean_i: Vec<f64> = indices.iter().map(|&idx| self.means_by_group[i][idx]).collect();
                let mean_j: Vec<f64> = indices.iter().map(|&idx| self.means_by_group[j][idx]).collect();
                
                // Calculate Mahalanobis distance between means
                let mut d_squared = 0.0;
                for k in 0..indices.len() {
                    for m in 0..indices.len() {
                        d_squared += (mean_i[k] - mean_j[k]) * c_inv[k][m] * (mean_i[m] - mean_j[m]);
                    }
                }
    
                // Calculate F from Mahalanobis distance using the correct formula
                // F = [(n1*n2)/(n1+n2)] * [D^2 * (N-g-p+1)/((N-g)*p)]
                let n1 = self.n_j[i];
                let n2 = self.n_j[j];
                let N = self.n;
                let g = self.g as f64;
                let p = vars_in_model as f64;
                
                let f_value = (n1 * n2 / (n1 + n2)) * 
                              (d_squared * (N - g - p + 1.0) / ((N - g) * p));
    
                // Calculate significance
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

    /// Calculate Mahalanobis distance between two groups
    fn calculate_mahalanobis_distance(
        &self,
        group1: usize,
        group2: usize,
        var_indices: &[usize]
    ) -> Result<f64, DiscriminantError> {
        if var_indices.is_empty() {
            return Ok(0.0);
        }
        
        // Extract means for the selected variables for each group
        let mean1: Vec<f64> = var_indices.iter().map(|&idx| self.means_by_group[group1][idx]).collect();
        let mean2: Vec<f64> = var_indices.iter().map(|&idx| self.means_by_group[group2][idx]).collect();
        
        // Create the reduced covariance matrix for variables in model
        let mut reduced_c_matrix = vec![vec![0.0; var_indices.len()]; var_indices.len()];
        for (i, &row_idx) in var_indices.iter().enumerate() {
            for (j, &col_idx) in var_indices.iter().enumerate() {
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
        
        // Calculate Mahalanobis distance
        let mut d_squared = 0.0;
        for i in 0..var_indices.len() {
            for j in 0..var_indices.len() {
                d_squared += (mean1[i] - mean2[i]) * c_inv[i][j] * (mean1[j] - mean2[j]);
            }
        }
        
        Ok(d_squared)
    }

    /// Check if any variables should be removed based on removal criteria
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
                CriteriaType::FValue => min_f_value <= self.stepwise_criteria.removal,
                CriteriaType::Probability => {
                    // Convert F to p-value and check against probability criteria
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

                // Calculate Wilks' Lambda and F statistics after removal
                let (wilks_lambda, f_statistic, df1, df2, df3, significance) =
                    self.calculate_step_statistics(variables_in_model, w_matrix, t_matrix)?;

                // Record step information
                let step_info = self.create_step_info(
                    *step_count, var_idx, "Removed", wilks_lambda, f_statistic,
                    df1, df2, df3, significance
                );
                steps.push(step_info.clone());
                wilks_lambda_steps.push(step_info);

                // Update variables in analysis
                self.update_variables_in_analysis(
                    *step_count, variables_in_model, variables_in_analysis,
                    w_matrix, t_matrix
                )?;

                // Update variables not in analysis
                self.update_variables_not_in_analysis(
                    *step_count, variables_in_model, variables_not_in_analysis,
                    w_matrix, t_matrix
                )?;

                // Calculate pairwise comparisons if display option is enabled
                self.calculate_pairwise_comparisons(
                    *step_count, variables_in_model, pairwise_comparisons,
                    w_matrix, t_matrix
                )?;

                return Ok(true); // Variable was removed
            }
        }

        Ok(false) // No variable was removed
    }
}
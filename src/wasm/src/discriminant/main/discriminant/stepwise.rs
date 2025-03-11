use crate::discriminant::main::types::{
    StepInfo, VariableInAnalysis, VariableNotInAnalysis,
    PairwiseComparison, StepwiseStatistics, results::DiscriminantError,
    CriteriaType, StepwiseMethod
};
use crate::discriminant::main::stats::f_test_p_value;
use crate::discriminant::main::utils::round_to_decimal;

use super::core::DiscriminantAnalysis;

impl DiscriminantAnalysis {
    /// Perform stepwise discriminant analysis
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

                    // Calculate Wilks' Lambda and F statistics for this step
                    let (wilks_lambda, f_statistic, df1, df2, df3, significance) =
                        self.calculate_step_statistics(&variables_in_model, &current_w_matrix, &current_t_matrix)?;

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
                    if self.stepwise_display.pairwise_distances {
                        self.calculate_pairwise_comparisons(
                            step_count, &variables_in_model, &mut pairwise_comparisons,
                            &current_w_matrix, &current_t_matrix
                        )?;
                    }

                    // Check for removal
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

    /// Calculate initial variable statistics before any variables enter
    fn calculate_initial_statistics(
        &self,
        not_in_analysis: &mut Vec<VariableNotInAnalysis>,
        w_matrix: &[Vec<f64>],
        t_matrix: &[Vec<f64>]
    ) -> Result<(), DiscriminantError> {
        for i in 0..self.p {
            // Calculate univariate F and Lambda
            let t_ii = t_matrix[i][i];
            let w_ii = w_matrix[i][i];

            if w_ii <= 0.0 || t_ii <= 0.0 {
                continue; // Skip variables with zero or negative variance
            }

            // F_i = ((t_ii - w_ii) * (n - g)) / (w_ii * (g - 1))
            let f_to_enter = ((t_ii - w_ii) * (self.n - self.g as f64)) / (w_ii * (self.g - 1) as f64);

            // Lambda_i = w_ii / t_ii
            let wilks_lambda = w_ii / t_ii;

            // Initial tolerance is 1.0 since no variables are in the model yet
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

        // For the simple implementation, we'll return a reasonable tolerance
        // In a full implementation, this would involve matrix operations
        Ok(0.95)
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

        // For variables being considered after at least one is in the model,
        // we need to calculate the incremental F and Lambda
        // For simplicity, we'll use a simplified calculation

        let t_ii = t_matrix[var_idx][var_idx];
        let w_ii = w_matrix[var_idx][var_idx];

        if w_ii <= 0.0 || t_ii <= 0.0 {
            return Err(DiscriminantError::ComputationError(
                "Zero or negative variance encountered".to_string()
            ));
        }

        let df1 = self.g - 1;
        let df2 = self.n as usize - self.g - vars_in_model;

        // Adjusted F calculation for stepwise model
        let f_to_enter = ((t_ii - w_ii) * (df2 as f64)) / (w_ii * df1 as f64);

        // Adjusted Wilks' Lambda
        let wilks_lambda = w_ii / t_ii;

        Ok((f_to_enter, wilks_lambda))
    }

    /// Update matrices after a variable enters the model (using sweep operator)
    fn update_matrices_after_entry(
        &self,
        var_idx: usize,
        w_matrix: &mut Vec<Vec<f64>>,
        t_matrix: &mut Vec<Vec<f64>>
    ) -> Result<(), DiscriminantError> {
        // In a full implementation, this would apply the sweep operator
        // For now, we'll just keep the original matrices
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

        // For demonstration, we'll calculate simplified statistics
        let wilks_lambda = 0.7; // Placeholder
        let f_statistic = 5.0;  // Placeholder
        let df1 = (self.g - 1) * vars_in_model;
        let df2 = 2;            // Placeholder
        let df3 = self.n as usize - self.g - vars_in_model + 1;
        let significance = 0.01; // Placeholder

        Ok((
            round_to_decimal(wilks_lambda, 3),
            round_to_decimal(f_statistic, 3),
            df1,
            df2,
            df3,
            round_to_decimal(significance, 3)
        ))
    }

    /// Create step information record
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
        StepInfo {
            step,
            variable_index: var_idx,
            variable_name: self.variable_names[var_idx].clone(),
            action: action.to_string(),
            statistic: wilks_lambda,  // The step statistic is Wilks' Lambda
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
                // Calculate F-to-remove
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
        // Simplified calculation for demonstration
        let t_ii = t_matrix[var_idx][var_idx];
        let w_ii = w_matrix[var_idx][var_idx];

        if w_ii <= 0.0 || t_ii <= 0.0 {
            return Err(DiscriminantError::ComputationError(
                "Zero or negative variance encountered".to_string()
            ));
        }

        let df1 = self.g - 1;
        let df2 = self.n as usize - self.g - vars_in_model + 1;

        // F calculation for removal
        let f_to_remove = ((t_ii - w_ii) * (df2 as f64)) / (w_ii * df1 as f64);

        // Wilks' Lambda
        let wilks_lambda = w_ii / t_ii;

        Ok((f_to_remove, wilks_lambda))
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
        let mut indices = Vec::new();
        for (i, &in_model) in variables_in_model.iter().enumerate() {
            if in_model {
                indices.push(i);
            }
        }

        if indices.is_empty() {
            return Ok(());
        }

        // Calculate F values between each pair of groups
        for i in 0..self.g {
            for j in (i+1)..self.g {
                // Calculate Mahalanobis distance between group i and j
                let d_squared = self.calculate_mahalanobis_distance(i, j, &indices)?;

                // Calculate F from Mahalanobis distance
                let vars_in_model = indices.len();
                let f_value = (self.n_j[i] * self.n_j[j] / (self.n_j[i] + self.n_j[j])) *
                              d_squared * (self.n - self.g as f64 - vars_in_model as f64 + 1.0) /
                              (self.n - 2.0) / vars_in_model as f64;

                // Calculate significance
                let df1 = vars_in_model;
                let df2 = self.n as usize - self.g - vars_in_model + 1;
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
        // Create mean difference vector
        let mut diff = Vec::with_capacity(var_indices.len());
        for &idx in var_indices {
            diff.push(self.means_by_group[group1][idx] - self.means_by_group[group2][idx]);
        }

        // Simplified calculation
        // In a full implementation we would create and invert a submatrix
        let d_squared = diff.iter().map(|&d| d * d).sum::<f64>();

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
                if self.stepwise_display.pairwise_distances {
                    self.calculate_pairwise_comparisons(
                        *step_count, variables_in_model, pairwise_comparisons,
                        w_matrix, t_matrix
                    )?;
                }

                return Ok(true); // Variable was removed
            }
        }

        Ok(false) // No variable was removed
    }
}
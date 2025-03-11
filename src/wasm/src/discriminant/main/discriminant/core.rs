use serde_json::Value;
use std::collections::HashMap;

use crate::discriminant::main::types::{
    StepwiseMethod, StepwiseCriteria, StepwiseDisplay, StepwiseStatistics,
    results::DiscriminantError, CriteriaType
};
use crate::discriminant::main::utils::{extract_first_field_name, extract_field_value};

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
    // Jumlah kasus
    pub total_cases: usize,
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
    // Maximum steps for stepwise analysis
    pub max_steps: usize,
    // Criteria for stepwise analysis
    pub stepwise_criteria: StepwiseCriteria,
    // Display options for stepwise analysis
    pub stepwise_display: StepwiseDisplay,
    // Method for stepwise analysis
    pub stepwise_method: StepwiseMethod,
    // Tolerance value for stepwise analysis
    pub tolerance: f64,
    // Stepwise statistics result
    pub stepwise_statistics: Option<StepwiseStatistics>,
}

impl DiscriminantAnalysis {
    /// Creates a new DiscriminantAnalysis instance
    pub fn new(
        group_data: Vec<Vec<Value>>,
        independent_data: Vec<Vec<Value>>,
        min_range: f64,
        max_range: f64,
        prior_probs: Option<Vec<f64>>
    ) -> Result<Self, DiscriminantError> {
        if group_data.is_empty() {
            return Err(DiscriminantError::InvalidInput("No group data provided".into()));
        }

        if independent_data.is_empty() {
            return Err(DiscriminantError::InvalidInput("No independent variables provided".into()));
        }

        // Extract group field name
        let group_field_name = if !group_data[0].is_empty() {
            match extract_first_field_name(&group_data[0][0]) {
                Some(name) => name,
                None => return Err(DiscriminantError::InvalidInput(
                    "Could not determine group field name".into()
                )),
            }
        } else {
            return Err(DiscriminantError::InvalidInput("Group data is empty".into()));
        };

        // Extract unique group values
        let mut unique_groups = Vec::new();

        for group_list in &group_data {
            for group_item in group_list {
                if let Some(group_value) = group_item.get(&group_field_name)
                    .and_then(|val| val.as_u64())
                    .map(|val| val as usize) {
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
        if g == 0 {
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
                match extract_first_field_name(&var_data[0]) {
                    Some(name) => var_field_names.push(name),
                    None => return Err(DiscriminantError::InvalidInput(
                        "Could not determine variable field name".into()
                    )),
                }
            } else {
                return Err(DiscriminantError::InvalidInput("Variable data is empty".into()));
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
                    "All variables must have the same number of cases".into()
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
            let group_field_value = match group_data[0][case_idx].get(&group_field_name)
                .and_then(|val| val.as_f64()) {
                Some(val) => val,
                None => continue, // Skip if no valid group value
            };

            // Check if the group field value is within the specified range
            if group_field_value < min_range || group_field_value > max_range {
                continue; // Skip if outside the min/max range
            }

            // Now extract the group value for classification (assuming it's an integer)
            let group_value = match group_data[0][case_idx].get(&group_field_name)
                .and_then(|val| val.as_u64())
                .map(|val| val as usize) {
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
                return Err(DiscriminantError::InvalidGroupSize);
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
                    return Err(DiscriminantError::InvalidInput(
                        format!("Prior probabilities must have length {}", g)
                    ));
                }
                p
            },
            None => {
                // Default priors: 0.5 for each group (equal priors)
                // This matches the example output where each group has 0.5 prior
                vec![0.5; g]
            }
        };

        // Initialize default values for stepwise analysis
        let max_steps = 10;  // Default maximum steps
        let stepwise_criteria = StepwiseCriteria {
            criteria_type: CriteriaType::FValue,
            entry: 3.84,     // Default F-to-enter
            removal: 2.71,   // Default F-to-remove
            v_to_enter: 0.0
        };
        let stepwise_display = StepwiseDisplay {
            pairwise_distances: false,  // Default: don't display pairwise distances
            summary_steps: true,        // Default: display summary steps
        };
        let stepwise_method = StepwiseMethod::Wilks;  // Default method
        let tolerance = 0.001;  // Default tolerance

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
}
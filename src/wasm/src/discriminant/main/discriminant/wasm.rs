use wasm_bindgen::prelude::*;
use serde_json::Value;
use crate::discriminant::main::types::results::{BoxMResult, DiscriminantError, DiscriminantResults};

use super::core::DiscriminantAnalysis;

/// WebAssembly binding for discriminant analysis
#[wasm_bindgen]
pub struct DiscriminantAnalysisWasm {
    inner: DiscriminantAnalysis,
}

#[wasm_bindgen]
impl DiscriminantAnalysisWasm {
    /// Create a new discriminant analysis
    ///
    /// # Arguments
    /// * `group_variable` - JSON string containing group data
    /// * `independent_variable` - JSON string containing independent variable data
    /// * `min_range` - Minimum range for scaling
    /// * `max_range` - Maximum range for scaling
    /// * `prior_probs` - JSON string containing prior probabilities (optional)
    ///
    /// # Returns
    /// * New instance of DiscriminantAnalysisWasm
    #[wasm_bindgen(constructor)]
    pub fn new(
        group_variable: &JsValue,
        independent_variable: &JsValue,
        min_range: f64,
        max_range: f64,
        prior_probs: &JsValue
    ) -> Result<DiscriminantAnalysisWasm, JsValue> {
        // Convert JS values to Rust types
        let group_data: Vec<Vec<Value>> = serde_wasm_bindgen::from_value(group_variable.clone())
            .map_err(|e| JsValue::from_str(&format!("Failed to parse group data: {}", e)))?;

        let independent_data: Vec<Vec<Value>> = serde_wasm_bindgen::from_value(independent_variable.clone())
            .map_err(|e| JsValue::from_str(&format!("Failed to parse independent data: {}", e)))?;

        // Parse prior probabilities (optional)
        let prior_probs_opt = if prior_probs.is_null() {
            None
        } else {
            let priors: Vec<f64> = serde_wasm_bindgen::from_value(prior_probs.clone())
                .map_err(|e| JsValue::from_str(&format!("Failed to parse prior probabilities: {}", e)))?;
            Some(priors)
        };

        // Create inner discriminant analysis object
        let inner = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            min_range,
            max_range,
            prior_probs_opt
        ).map_err(format_error)?;

        Ok(DiscriminantAnalysisWasm { inner })
    }

    /// Compute canonical discriminant functions
    #[wasm_bindgen]
    pub fn compute_canonical_discriminant_functions(&mut self) -> Result<(), JsValue> {
        self.inner.compute_canonical_discriminant_functions()
            .map_err(format_error)
    }

    /// Get univariate F-statistics and Wilks' Lambda for a variable
    ///
    /// # Arguments
    /// * `variable_index` - Index of the variable (0-based)
    ///
    /// # Returns
    /// * JSON string with the F-Lambda result
    #[wasm_bindgen]
    pub fn univariate_f_lambda(&self, variable_index: usize) -> Result<JsValue, JsValue> {
        let result = self.inner.univariate_f_lambda(variable_index)
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
    }

    /// Perform Box's M test for equality of covariance matrices
    ///
    /// # Returns
    /// * JSON string with the Box's M test result
    #[wasm_bindgen]
    pub fn box_m_test(&self) -> Result<JsValue, JsValue> {
        let result = self.inner.box_m_test()
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
    }

    /// Get Wilks' Lambda for the discriminant functions
    ///
    /// # Returns
    /// * JSON string with Wilks' Lambda results
    #[wasm_bindgen]
    pub fn wilks_lambda(&self) -> JsValue {
        let result = self.inner.wilks_lambda();

        serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL)
    }

    /// Classify a new observation
    ///
    /// # Arguments
    /// * `x` - JSON array of feature values
    ///
    /// # Returns
    /// * JSON string with classification result
    #[wasm_bindgen]
    pub fn classify(&self, x: &JsValue) -> Result<JsValue, JsValue> {
        let x_vec: Vec<f64> = serde_wasm_bindgen::from_value(x.clone())
            .map_err(|e| JsValue::from_str(&format!("Failed to parse input vector: {}", e)))?;

        let result = self.inner.classify(&x_vec)
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
    }

    /// Perform cross-validation
    ///
    /// # Returns
    /// * JSON string with cross-validation results
    #[wasm_bindgen]
    pub fn cross_validate(&self) -> Result<JsValue, JsValue> {
        let result = self.inner.cross_validate()
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize result: {}", e)))
    }

    /// Get group centroids
    ///
    /// # Returns
    /// * JSON string with group centroids
    #[wasm_bindgen]
    pub fn group_centroids(&self) -> JsValue {
        let centroids = self.inner.group_centroids();

        serde_wasm_bindgen::to_value(&centroids).unwrap_or(JsValue::NULL)
    }

    /// Get standardized coefficients
    ///
    /// # Returns
    /// * JSON string with standardized coefficients
    #[wasm_bindgen]
    pub fn standardized_coefficients(&self) -> Result<JsValue, JsValue> {
        let coeffs = self.inner.standardized_coefficients()
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&coeffs)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize coefficients: {}", e)))
    }

    /// Get structure matrix
    ///
    /// # Returns
    /// * JSON string with structure matrix
    #[wasm_bindgen]
    pub fn structure_matrix(&self) -> Result<JsValue, JsValue> {
        let matrix = self.inner.structure_matrix()
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&matrix)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize matrix: {}", e)))
    }

    /// Get canonical correlations
    ///
    /// # Returns
    /// * JSON string with canonical correlations
    #[wasm_bindgen]
    pub fn canonical_correlations(&self) -> JsValue {
        let correlations = self.inner.canonical_correlations();

        serde_wasm_bindgen::to_value(&correlations).unwrap_or(JsValue::NULL)
    }

    /// Get classification functions
    ///
    /// # Returns
    /// * JSON string with classification function coefficients
    #[wasm_bindgen]
    pub fn classification_functions(&self) -> Result<JsValue, JsValue> {
        let functions = self.inner.classification_functions()
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&functions)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize functions: {}", e)))
    }

    /// Get complete discriminant analysis results
    ///
    /// # Returns
    /// * JSON string with all results
    #[wasm_bindgen]
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        // Calculate case processing summary
        let case_processing_summary = self.inner.calculate_case_processing_summary();

        // Calculate group statistics
        let group_statistics = self.inner.calculate_group_statistics();

        // Univariate F tests
        let mut wilks_lambda = Vec::with_capacity(self.inner.p);
        for i in 0..self.inner.p {
            if let Ok(result) = self.inner.univariate_f_lambda(i) {
                wilks_lambda.push(result);
            }
        }

        // Box's M test
        let box_m = match self.inner.box_m_test() {
            Ok(result) => result,
            Err(e) => {
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
        let eigen_stats = self.inner.eigen_statistics();

        // Wilks' Lambda for functions
        let functions_lambda = self.inner.wilks_lambda();

        // Standardized canonical discriminant function coefficients
        let std_coefficients = match self.inner.standardized_coefficients() {
            Ok(coeffs) => coeffs,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Structure matrix
        let structure_matrix = match self.inner.structure_matrix() {
            Ok(matrix) => matrix,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Unstandardized canonical discriminant function coefficients
        let unstd_coefficients = match self.inner.unstandardized_coefficients() {
            Ok(coeffs) => coeffs,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Group centroids
        let group_centroids = self.inner.group_centroids();

        // Classification functions
        let classification_functions = match self.inner.classification_functions() {
            Ok(funcs) => funcs,
            Err(_) => vec![vec![0.0; 0]; 0],
        };

        // Perform cross-validation
        let classification_results = match self.inner.cross_validate() {
            Ok(results) => results,
            Err(_) => {
                // Create default ClassificationResults
                crate::discriminant::main::types::results::ClassificationResults {
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
        let results = crate::discriminant::main::types::results::DiscriminantResults {
            case_processing_summary,
            group_statistics,
            wilks_lambda,
            pooled_covariance: self.inner.c_matrix.clone(),
            pooled_correlation: self.inner.r_matrix.clone(),
            group_covariance: self.inner.c_group_matrices.clone(),
            total_covariance: self.inner.t_prime_matrix.clone(),
            box_m,
            eigen_stats,
            functions_lambda,
            std_coefficients,
            stepwise_statistics: self.inner.stepwise_statistics.clone(),
            structure_matrix,
            unstd_coefficients,
            group_centroids,
            classification_functions,
            classification_results,
            means_by_group: self.inner.means_by_group.clone(),
            means_overall: self.inner.means_overall.clone(),
            variable_names: self.inner.variable_names.clone(),
            group_name: self.inner.group_name.clone(),
            group_values: self.inner.group_values.clone(),
        };

        serde_wasm_bindgen::to_value(&results)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
    }

    /// Perform stepwise discriminant analysis
    #[wasm_bindgen]
    pub fn perform_stepwise_analysis(&mut self) -> Result<JsValue, JsValue> {
        let result = self.inner.perform_stepwise_analysis()
            .map_err(format_error)?;

        serde_wasm_bindgen::to_value(&result)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize stepwise results: {}", e)))
    }
    
    /// Get model summary information
    #[wasm_bindgen]
    pub fn get_model_summary(&self) -> String {
        self.inner.get_model_summary()
    }
}

/// Format DiscriminantError to JsValue
fn format_error(err: DiscriminantError) -> JsValue {
    JsValue::from_str(&format!("{}", err))
}
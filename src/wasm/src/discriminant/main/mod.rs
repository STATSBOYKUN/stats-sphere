use wasm_bindgen::prelude::*;
use serde_json::Value;

// Import the modules, but use a more explicit path
pub mod types;
pub mod matrices;
pub mod stats;
pub mod utils;
pub mod discriminant;

use discriminant::DiscriminantAnalysis;

/// Main WebAssembly binding for discriminant analysis
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
        ).map_err(|e| JsValue::from_str(&e))?;

        Ok(DiscriminantAnalysisWasm { inner })
    }

    /// Compute canonical discriminant functions
    #[wasm_bindgen]
    pub fn compute_canonical_discriminant_functions(&mut self) -> Result<(), JsValue> {
        self.inner.compute_canonical_discriminant_functions()
            .map_err(|e| JsValue::from_str(&e))
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
            .map_err(|e| JsValue::from_str(&e))?;

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
            .map_err(|e| JsValue::from_str(&e))?;

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
            .map_err(|e| JsValue::from_str(&e))?;

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
            .map_err(|e| JsValue::from_str(&e))?;

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
            .map_err(|e| JsValue::from_str(&e))?;

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
            .map_err(|e| JsValue::from_str(&e))?;

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
            .map_err(|e| JsValue::from_str(&e))?;

        serde_wasm_bindgen::to_value(&functions)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize functions: {}", e)))
    }

    /// Get complete discriminant analysis results
    ///
    /// # Returns
    /// * JSON string with all results
    #[wasm_bindgen]
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        let results = self.inner.get_results()
            .map_err(|e| JsValue::from_str(&e))?;

        serde_wasm_bindgen::to_value(&results)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
    }
}
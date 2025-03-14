use serde::{Deserialize, Serialize};
use serde_json::Value;
use wasm_bindgen::prelude::*;

use super::distance::{calculate_distance_matrix, transform_distance_matrix};
use super::evaluation::evaluate_clustering;
use super::standardization::{handle_missing_values, standardize_data};
use super::types::{
    BinaryOptions, ClusterMembership, ClusteringConfig, ClusteringError, DataType, DistanceMetric,
    DistanceTransformation, HierarchicalClusteringResults, LinkageMethod, MissingValueStrategy,
    StandardizationMethod,
};
use super::utils::{extract_variable_names, parse_input_data};

// Import hierarchical clustering functions
use super::{get_cluster_membership, get_cluster_memberships_range, hierarchical_cluster};

/// WebAssembly binding for hierarchical clustering
#[wasm_bindgen]
pub struct HierarchicalClusteringWasm {
    // Data for analysis
    data: Vec<Vec<f64>>,         // Processed data for clustering
    label_data: Vec<usize>,      // Label data for cases (if provided)
    variable_names: Vec<String>, // Names of variables
    label_name: Option<String>,  // Name of label variable

    // Configuration and state
    config: ClusteringConfig,       // Configuration for analysis
    distance_matrix: Vec<Vec<f64>>, // Calculated distance matrix
    case_ids: Vec<usize>,           // Valid case IDs

    // Results
    results: Option<HierarchicalClusteringResults>,

    // Raw inputs (for reference)
    raw_config: Value,
    raw_cluster_vars: Value,
    raw_label_vars: Value,
}

#[wasm_bindgen]
impl HierarchicalClusteringWasm {
    /// Create a new hierarchical clustering instance with SPSS-style input format
    ///
    /// # Arguments
    /// * `tempData` - Configuration object with settings
    /// * `slicedDataForCluster` - Array of variable data for clustering
    /// * `slicedDataForLabelCases` - Array of label data for cases
    /// * `varDefsForCluster` - Definitions of variables for clustering
    /// * `varDefsForLabelCases` - Definitions of variables for label cases
    ///
    /// # Returns
    /// * New instance of HierarchicalClusteringWasm
    #[wasm_bindgen(constructor)]
    pub fn new(
        tempData: &JsValue,
        slicedDataForCluster: &JsValue,
        slicedDataForLabelCases: &JsValue,
        varDefsForCluster: &JsValue,
        varDefsForLabelCases: &JsValue,
    ) -> Result<HierarchicalClusteringWasm, JsValue> {
        // Validate inputs to provide better error messages
        if tempData.is_null() || tempData.is_undefined() {
            return Err(JsValue::from_str(
                "Configuration object (tempData) is null or undefined",
            ));
        }

        if slicedDataForCluster.is_null() || slicedDataForCluster.is_undefined() {
            return Err(JsValue::from_str(
                "Cluster data (slicedDataForCluster) is null or undefined",
            ));
        }

        if varDefsForCluster.is_null() || varDefsForCluster.is_undefined() {
            return Err(JsValue::from_str(
                "Cluster variable definitions (varDefsForCluster) is null or undefined",
            ));
        }

        // Parse configuration object
        let raw_config: Value = match serde_wasm_bindgen::from_value(tempData.clone()) {
            Ok(config) => config,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to parse configuration object: {}. Make sure it's a valid JSON object.",
                    e
                )))
            }
        };

        // Parse cluster data
        let sliced_data_for_cluster: Vec<Vec<Value>> =
            match serde_wasm_bindgen::from_value(slicedDataForCluster.clone()) {
                Ok(data) => data,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to parse cluster data: {}. Make sure it's an array of arrays.",
                        e
                    )))
                }
            };

        // Check cluster data structure
        if sliced_data_for_cluster.is_empty() {
            return Err(JsValue::from_str(
                "Cluster data is empty. Expected non-empty array of variables.",
            ));
        }

        // Parse label data
        let sliced_data_for_label_cases: Vec<Vec<Value>> =
            match serde_wasm_bindgen::from_value(slicedDataForLabelCases.clone()) {
                Ok(data) => data,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to parse label data: {}. Make sure it's an array of arrays.",
                        e
                    )))
                }
            };

        // Parse variable definitions
        let var_defs_for_cluster: Value = match serde_wasm_bindgen::from_value(varDefsForCluster.clone()) {
            Ok(defs) => defs,
            Err(e) => return Err(JsValue::from_str(&format!("Failed to parse cluster variable definitions: {}. Make sure it's a valid JSON object.", e))),
        };

        let var_defs_for_label_cases: Value = match serde_wasm_bindgen::from_value(varDefsForLabelCases.clone()) {
            Ok(defs) => defs,
            Err(e) => return Err(JsValue::from_str(&format!("Failed to parse label variable definitions: {}. Make sure it's a valid JSON object.", e))),
        };

        // Extract clustering configuration from the config object
        let config = match parse_spss_config(&raw_config) {
            Ok(c) => c,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to parse SPSS configuration: {}. Check configuration structure.",
                    e
                )))
            }
        };

        // Extract variable names from definitions
        let mut variable_names = Vec::new();
        if let Some(var_defs_array) = var_defs_for_cluster.as_array() {
            for var_def in var_defs_array {
                if let Some(var_def_array) = var_def.as_array() {
                    if let Some(first_def) = var_def_array.first() {
                        if let Some(name) = first_def.get("name").and_then(|n| n.as_str()) {
                            variable_names.push(name.to_string());
                        }
                    }
                }
            }
        }

        if variable_names.is_empty() {
            return Err(JsValue::from_str("No valid variable names found in varDefsForCluster. Each variable should have a 'name' property."));
        }

        // Log extracted variable names for debugging
        let var_names_str = variable_names.join(", ");
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Extracted variable names: {}",
            var_names_str
        )));

        // Extract label name if available
        let label_name = if let Some(main) = raw_config.get("main") {
            if let Some(label_cases) = main.get("LabelCases").and_then(|l| l.as_str()) {
                Some(label_cases.to_string())
            } else {
                None
            }
        } else {
            None
        };

        if let Some(label_name_str) = &label_name {
            web_sys::console::log_1(&JsValue::from_str(&format!(
                "Using label: {}",
                label_name_str
            )));
        } else {
            web_sys::console::log_1(&JsValue::from_str("No label name found in configuration."));
        }

        // Determine number of cases
        if sliced_data_for_cluster.is_empty() {
            return Err(JsValue::from_str(
                "Cluster data is empty. Expected at least one variable.",
            ));
        }

        let num_cases = if !sliced_data_for_cluster[0].is_empty() {
            sliced_data_for_cluster[0].len()
        } else {
            return Err(JsValue::from_str(
                "First variable in cluster data has no cases.",
            ));
        };

        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Number of cases: {}",
            num_cases
        )));

        // Validate variable data structure
        for (i, var_data) in sliced_data_for_cluster.iter().enumerate() {
            if var_data.len() != num_cases {
                return Err(JsValue::from_str(&format!(
                    "Variable at index {} has {} cases, but expected {}. All variables must have the same number of cases.",
                    i, var_data.len(), num_cases
                )));
            }
        }

        // Initialize data matrix
        let mut data_matrix = vec![vec![0.0; variable_names.len()]; num_cases];

        // Fill the matrix with data from sliced_data_for_cluster
        for (var_idx, var_data) in sliced_data_for_cluster.iter().enumerate() {
            if var_idx >= variable_names.len() {
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Warning: More variables in data than in variable definitions. Ignoring extra data at index {}.",
                    var_idx
                )));
                continue;
            }

            let var_name = &variable_names[var_idx];
            let mut missing_values = 0;

            for (case_idx, case) in var_data.iter().enumerate() {
                if case_idx >= num_cases {
                    continue;
                }

                if let Some(obj) = case.as_object() {
                    if let Some(value) = obj.get(var_name).and_then(|v| v.as_f64()) {
                        data_matrix[case_idx][var_idx] = value;
                    } else {
                        missing_values += 1;
                        // Use NaN to represent missing values
                        data_matrix[case_idx][var_idx] = f64::NAN;
                    }
                } else {
                    missing_values += 1;
                    data_matrix[case_idx][var_idx] = f64::NAN;
                }
            }

            if missing_values > 0 {
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Warning: Variable '{}' has {} missing values out of {} cases.",
                    var_name, missing_values, num_cases
                )));
            }
        }

        // Extract label data if available
        let mut label_values = Vec::new();

        if let Some(label_name_str) = &label_name {
            if !sliced_data_for_label_cases.is_empty() && !sliced_data_for_label_cases[0].is_empty()
            {
                for (i, case) in sliced_data_for_label_cases[0].iter().enumerate() {
                    if i >= num_cases {
                        web_sys::console::log_1(&JsValue::from_str(
                            "Warning: More label cases than data cases. Ignoring extra labels.",
                        ));
                        break;
                    }

                    if let Some(obj) = case.as_object() {
                        let label_value = obj
                            .get(label_name_str)
                            .and_then(|v| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64)))
                            .unwrap_or(0.0) as usize;

                        label_values.push(label_value);
                    } else {
                        web_sys::console::log_1(&JsValue::from_str(&format!(
                            "Warning: Label case at index {} is not an object. Using default value 0.",
                            i
                        )));
                        label_values.push(0); // Default value if not found
                    }
                }
            }
        }

        // If we have fewer label values than cases, pad with default values
        while label_values.len() < num_cases {
            web_sys::console::log_1(&JsValue::from_str(
                "Warning: Fewer label cases than data cases. Using default value 0 for missing labels."
            ));
            label_values.push(0);
        }

        // Create initial case IDs (will be updated during preprocessing)
        let case_ids: Vec<usize> = (0..data_matrix.len()).collect();

        // Log successful initialization
        web_sys::console::log_1(&JsValue::from_str(
            "Successfully initialized HierarchicalClusteringWasm",
        ));

        // Create the instance
        Ok(HierarchicalClusteringWasm {
            data: data_matrix,
            label_data: label_values,
            variable_names,
            label_name,
            config,
            distance_matrix: vec![],
            case_ids,
            results: None,
            raw_config,
            raw_cluster_vars: var_defs_for_cluster,
            raw_label_vars: var_defs_for_label_cases,
        })
    }

    /// Perform complete hierarchical clustering analysis
    #[wasm_bindgen]
    pub fn perform_analysis(&mut self) -> Result<(), JsValue> {
        web_sys::console::log_1(&JsValue::from_str("Starting complete analysis..."));

        // Chain all the analysis steps with proper error handling
        match self.preprocess_data() {
            Ok(_) => web_sys::console::log_1(&JsValue::from_str(
                "✓ Data preprocessing completed successfully",
            )),
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error handling missing values: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to handle missing values: {:?}",
                    e
                )));
            }
        }

        match self.calculate_distances() {
            Ok(_) => web_sys::console::log_1(&JsValue::from_str(
                "✓ Distance calculation completed successfully",
            )),
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error during standardization: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to standardize data: {:?}",
                    e
                )));
            }
        }

        match self.cluster() {
            Ok(_) => {
                web_sys::console::log_1(&JsValue::from_str("✓ Clustering completed successfully"))
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error calculating distance matrix: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to calculate distance matrix: {:?}",
                    e
                )));
            }
        }

        // Get default cluster solution if specified in config
        if let Some(obj) = self.raw_config.get("statistics") {
            if let Some(num_clusters) = obj.get("NoOfCluster").and_then(|c| c.as_u64()) {
                if num_clusters > 0 {
                    match self.get_clusters(num_clusters as usize) {
                        Ok(_) => web_sys::console::log_1(&JsValue::from_str(&format!(
                            "✓ Got cluster solution for {} clusters",
                            num_clusters
                        ))),
                        Err(e) => {
                            web_sys::console::error_1(&JsValue::from_str(&format!(
                                "Error during clustering: {:?}",
                                e
                            )));
                            return Err(JsValue::from_str(&format!(
                                "Failed to perform clustering: {:?}",
                                e
                            )));
                        }
                    }

                    // Try to evaluate the clusters
                    match self.evaluate(num_clusters as usize) {
                        Ok(_) => web_sys::console::log_1(&JsValue::from_str(&format!(
                            "✓ Evaluated {} cluster solution",
                            num_clusters
                        ))),
                        Err(e) => {
                            web_sys::console::error_1(&JsValue::from_str(&format!(
                                "Error getting cluster membership: {:?}",
                                e
                            )));
                            return Err(JsValue::from_str(&format!(
                                "Failed to get cluster membership: {:?}",
                                e
                            )));
                        }
                    }
                }
            } else if obj
                .get("SingleSol")
                .and_then(|s| s.as_bool())
                .unwrap_or(false)
            {
                // Default to 3 clusters if SingleSol is true but NoOfCluster is not specified
                let default_clusters = 3;
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "No cluster count specified, using default of {}",
                    default_clusters
                )));

                match self.get_clusters(default_clusters) {
                    Ok(_) => web_sys::console::log_1(&JsValue::from_str(&format!(
                        "✓ Got cluster solution for {} clusters",
                        default_clusters
                    ))),
                    Err(e) => {
                        web_sys::console::error_1(&JsValue::from_str(&format!(
                            "Error getting cluster range: {:?}",
                            e
                        )));
                        return Err(JsValue::from_str(&format!(
                            "Failed to get cluster memberships: {:?}",
                            e
                        )));
                    }
                }
            } else if obj
                .get("RangeSol")
                .and_then(|s| s.as_bool())
                .unwrap_or(false)
            {
                // Get range of solutions if specified
                let min_clusters =
                    obj.get("MinCluster").and_then(|c| c.as_u64()).unwrap_or(2) as usize;
                let max_clusters =
                    obj.get("MaxCluster").and_then(|c| c.as_u64()).unwrap_or(5) as usize;

                if min_clusters > 0 && max_clusters >= min_clusters {
                    match self.get_clusters_range(min_clusters, max_clusters) {
                        Ok(_) => web_sys::console::log_1(&JsValue::from_str(&format!(
                            "✓ Got cluster solutions from {} to {}",
                            min_clusters, max_clusters
                        ))),
                        Err(e) => {
                            web_sys::console::error_1(&JsValue::from_str(&format!(
                                "Error evaluating clustering: {:?}",
                                e
                            )));
                            return Err(JsValue::from_str(&format!(
                                "Failed to evaluate clustering: {:?}",
                                e
                            )));
                        }
                    }
                } else {
                    web_sys::console::warn_1(&JsValue::from_str(&format!(
                         "Invalid cluster range: min={}, max={}. Min must be > 0 and max must be >= min.", 
                         min_clusters, max_clusters
                     )));
                }
            }
        }

        web_sys::console::log_1(&JsValue::from_str(
            "✓ Complete analysis finished successfully",
        ));
        Ok(())
    }

    /// Preprocess data (standardize and handle missing values)
    #[wasm_bindgen]
    pub fn preprocess_data(&mut self) -> Result<(), JsValue> {
        web_sys::console::log_1(&JsValue::from_str("Starting data preprocessing..."));

        // Log data dimensions
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Data matrix dimensions: {} cases x {} variables",
            self.data.len(),
            if self.data.is_empty() {
                0
            } else {
                self.data[0].len()
            }
        )));

        // Check for empty or invalid data
        if self.data.is_empty() {
            return Err(JsValue::from_str(
                "Data matrix is empty. Cannot preprocess.",
            ));
        }

        // Handle missing values
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Handling missing values with strategy: {:?}",
            self.config.missing_values
        )));

        let (processed_data, valid_case_ids) =
            match handle_missing_values(&self.data, self.config.missing_values) {
                Ok(result) => result,
                Err(e) => {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Error handling missing values: {:?}",
                        e
                    )));
                    return Err(JsValue::from_str(&format!(
                        "Failed to handle missing values: {}",
                        e
                    )));
                }
            };

        // Log the number of cases before and after handling missing values
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Cases after handling missing values: {} (from original {})",
            valid_case_ids.len(),
            self.data.len()
        )));

        if valid_case_ids.len() < 2 {
            return Err(JsValue::from_str(
                 "Not enough valid cases after handling missing values. Need at least 2 cases for clustering."
             ));
        }

        // Update data and case IDs
        self.data = processed_data;
        self.case_ids = valid_case_ids;

        // Update label data to match valid cases
        if !self.label_data.is_empty() {
            let mut filtered_labels = Vec::with_capacity(self.case_ids.len());
            for &case_id in &self.case_ids {
                if case_id < self.label_data.len() {
                    filtered_labels.push(self.label_data[case_id]);
                } else {
                    // Use default value if case_id is out of bounds
                    filtered_labels.push(0);
                    web_sys::console::warn_1(&JsValue::from_str(&format!(
                        "Case ID {} is out of bounds for label data. Using default value 0.",
                        case_id
                    )));
                }
            }
            self.label_data = filtered_labels;
        }

        // Standardize data if needed
        if self.config.standardization != StandardizationMethod::None {
            web_sys::console::log_1(&JsValue::from_str(&format!(
                "Standardizing data with method: {:?}",
                self.config.standardization
            )));

            // Check if we should standardize by variable or by case
            let by_variable = !self
                .raw_config
                .get("method")
                .and_then(|m| m.get("ByCase"))
                .and_then(|c| c.as_bool())
                .unwrap_or(false);

            web_sys::console::log_1(&JsValue::from_str(&format!(
                "Standardizing by {}",
                if by_variable { "variable" } else { "case" }
            )));

            match standardize_data(&self.data, self.config.standardization, by_variable) {
                Ok(standardized) => {
                    self.data = standardized;
                    web_sys::console::log_1(&JsValue::from_str(
                        "Data standardization completed successfully",
                    ));
                }
                Err(e) => {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Error during standardization: {:?}",
                        e
                    )));
                    return Err(JsValue::from_str(&format!(
                        "Failed to standardize data: {}",
                        e
                    )));
                }
            }
        } else {
            web_sys::console::log_1(&JsValue::from_str("No standardization requested"));
        }

        web_sys::console::log_1(&JsValue::from_str(
            "✓ Data preprocessing completed successfully",
        ));
        Ok(())
    }

    /// Calculate distance matrix
    #[wasm_bindgen]
    pub fn calculate_distances(&mut self) -> Result<(), JsValue> {
        web_sys::console::log_1(&JsValue::from_str("Starting distance calculation..."));

        // Check data validity
        if self.data.is_empty() {
            return Err(JsValue::from_str(
                "Data matrix is empty. Cannot calculate distances.",
            ));
        }

        if self.data.len() < 2 {
            return Err(JsValue::from_str(
                "Need at least 2 cases to calculate distances.",
            ));
        }

        // Log distance calculation parameters
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Calculating distances with metric: {:?}",
            self.config.distance_metric
        )));

        if self.config.distance_metric == DistanceMetric::Minkowski {
            if let Some(power) = self.config.minkowski_power {
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Minkowski power parameter: {}",
                    power
                )));
            } else {
                web_sys::console::log_1(&JsValue::from_str(
                    "Minkowski power parameter not specified, using default (p=2)",
                ));
            }
        }

        // Get binary options if needed
        let binary_options = if self.config.distance_metric == DistanceMetric::Jaccard {
            match &self.config.binary_options {
                Some(options) => {
                    web_sys::console::log_1(&JsValue::from_str(&format!(
                        "Using binary options - present: {}, absent: {}",
                        options.present_value, options.absent_value
                    )));
                    Some(options)
                }
                None => {
                    web_sys::console::error_1(&JsValue::from_str(
                        "Binary options required for Jaccard distance but not provided",
                    ));
                    return Err(JsValue::from_str(
                        "Binary options required for Jaccard distance",
                    ));
                }
            }
        } else {
            None
        };

        // Calculate distance matrix
        let distance_matrix = match calculate_distance_matrix(
            &self.data,
            self.config.distance_metric,
            self.config.minkowski_power,
            binary_options,
        ) {
            Ok(matrix) => {
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Distance matrix calculated successfully: {} x {}",
                    matrix.len(),
                    if matrix.is_empty() {
                        0
                    } else {
                        matrix[0].len()
                    }
                )));
                matrix
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error calculating distance matrix: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to calculate distance matrix: {}",
                    e
                )));
            }
        };

        // Apply transformation if needed
        if self.config.distance_transformation != DistanceTransformation::None {
            web_sys::console::log_1(&JsValue::from_str(&format!(
                "Applying distance transformation: {:?}",
                self.config.distance_transformation
            )));

            self.distance_matrix =
                transform_distance_matrix(&distance_matrix, self.config.distance_transformation);
        } else {
            self.distance_matrix = distance_matrix;
        }

        web_sys::console::log_1(&JsValue::from_str(
            "✓ Distance calculation completed successfully",
        ));
        Ok(())
    }

    /// Perform hierarchical clustering
    #[wasm_bindgen]
    pub fn cluster(&mut self) -> Result<(), JsValue> {
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Starting hierarchical clustering with method: {:?}",
            self.config.method
        )));

        // Check if we have calculated distances
        if self.distance_matrix.is_empty() {
            web_sys::console::error_1(&JsValue::from_str("Distance matrix not calculated"));
            return Err(JsValue::from_str(
                "Distance matrix not calculated. Call calculate_distances() first.",
            ));
        }

        // Check dimensions
        if self.distance_matrix.len() < 2 {
            web_sys::console::error_1(&JsValue::from_str(
                "Need at least 2 cases to perform clustering",
            ));
            return Err(JsValue::from_str(
                "Need at least 2 cases to perform clustering",
            ));
        }

        // Perform clustering
        let results = match hierarchical_cluster(&self.data, &self.distance_matrix, &self.config) {
            Ok(res) => {
                web_sys::console::log_1(&JsValue::from_str(
                    "Hierarchical clustering completed successfully",
                ));
                res
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error during clustering: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to perform clustering: {}",
                    e
                )));
            }
        };

        self.results = Some(results);

        web_sys::console::log_1(&JsValue::from_str("✓ Clustering completed successfully"));
        Ok(())
    }

    /// Get cluster membership for a specific number of clusters
    ///
    /// # Arguments
    /// * `num_clusters` - Number of clusters to extract
    ///
    /// # Returns
    /// * JSON string with cluster membership information
    #[wasm_bindgen]
    pub fn get_clusters(&mut self, num_clusters: usize) -> Result<JsValue, JsValue> {
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Getting {} cluster solution...",
            num_clusters
        )));

        // Validate num_clusters
        if num_clusters < 1 {
            web_sys::console::error_1(&JsValue::from_str("Number of clusters must be at least 1"));
            return Err(JsValue::from_str("Number of clusters must be at least 1"));
        }

        // Check if we have performed clustering
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                web_sys::console::error_1(&JsValue::from_str("Clustering not performed"));
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        let data_size = self.data.len();

        if num_clusters > data_size {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Number of clusters ({}) cannot exceed number of cases ({})",
                num_clusters, data_size
            )));
            return Err(JsValue::from_str(&format!(
                "Number of clusters ({}) cannot exceed number of cases ({})",
                num_clusters, data_size
            )));
        }

        // Get cluster membership
        let membership = match get_cluster_membership(
            &results.agglomeration_schedule,
            num_clusters,
            data_size,
        ) {
            Ok(m) => {
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Successfully got {} cluster solution",
                    num_clusters
                )));
                m
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error getting cluster membership: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to get cluster membership: {}",
                    e
                )));
            }
        };

        // Store in results
        results.single_solution = Some(membership.clone());

        // Convert to JS value
        match serde_wasm_bindgen::to_value(&membership) {
            Ok(value) => {
                web_sys::console::log_1(&JsValue::from_str(
                    "Successfully serialized cluster membership",
                ));
                Ok(value)
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error serializing cluster membership: {}",
                    e
                )));
                Err(JsValue::from_str(&format!(
                    "Failed to serialize cluster membership: {}",
                    e
                )))
            }
        }
    }

    /// Get cluster memberships for a range of solutions
    ///
    /// # Arguments
    /// * `min_clusters` - Minimum number of clusters
    /// * `max_clusters` - Maximum number of clusters
    ///
    /// # Returns
    /// * JSON string with cluster membership information for each solution
    #[wasm_bindgen]
    pub fn get_clusters_range(
        &mut self,
        min_clusters: usize,
        max_clusters: usize,
    ) -> Result<JsValue, JsValue> {
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Getting cluster solutions from {} to {} clusters...",
            min_clusters, max_clusters
        )));

        // Validate parameters
        if min_clusters < 1 {
            web_sys::console::error_1(&JsValue::from_str(
                "Minimum number of clusters must be at least 1",
            ));
            return Err(JsValue::from_str(
                "Minimum number of clusters must be at least 1",
            ));
        }

        if min_clusters > max_clusters {
            web_sys::console::error_1(&JsValue::from_str(
                "Minimum number of clusters cannot be greater than maximum",
            ));
            return Err(JsValue::from_str(
                "Minimum number of clusters cannot be greater than maximum",
            ));
        }

        // Check if we have performed clustering
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                web_sys::console::error_1(&JsValue::from_str("Clustering not performed"));
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        let data_size = self.data.len();

        if max_clusters > data_size {
            web_sys::console::error_1(&JsValue::from_str(&format!(
                "Maximum number of clusters ({}) cannot exceed number of cases ({})",
                max_clusters, data_size
            )));
            return Err(JsValue::from_str(&format!(
                "Maximum number of clusters ({}) cannot exceed number of cases ({})",
                max_clusters, data_size
            )));
        }

        // Get cluster memberships for range
        let memberships = match get_cluster_memberships_range(
            &results.agglomeration_schedule,
            min_clusters,
            max_clusters,
            data_size,
        ) {
            Ok(m) => {
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Successfully got cluster solutions from {} to {} clusters",
                    min_clusters, max_clusters
                )));
                m
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error getting cluster range: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to get cluster memberships: {}",
                    e
                )));
            }
        };

        // Store in results
        results.range_solutions = Some(memberships.clone());

        // Convert to JS value
        match serde_wasm_bindgen::to_value(&memberships) {
            Ok(value) => {
                web_sys::console::log_1(&JsValue::from_str(
                    "Successfully serialized cluster range solutions",
                ));
                Ok(value)
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error serializing cluster range: {}",
                    e
                )));
                Err(JsValue::from_str(&format!(
                    "Failed to serialize cluster memberships: {}",
                    e
                )))
            }
        }
    }

    /// Evaluate clustering solution
    ///
    /// # Arguments
    /// * `num_clusters` - Number of clusters to evaluate
    ///
    /// # Returns
    /// * JSON string with evaluation metrics
    #[wasm_bindgen]
    pub fn evaluate(&mut self, num_clusters: usize) -> Result<JsValue, JsValue> {
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Evaluating {} cluster solution...",
            num_clusters
        )));

        // Validate num_clusters
        if num_clusters < 2 {
            web_sys::console::error_1(&JsValue::from_str("Need at least 2 clusters to evaluate"));
            return Err(JsValue::from_str("Need at least 2 clusters to evaluate"));
        }

        // Check if we have performed clustering
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                web_sys::console::error_1(&JsValue::from_str("Clustering not performed"));
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        // Get cluster membership if not already present
        let membership = if let Some(ref existing) = results.single_solution {
            if existing.num_clusters == num_clusters {
                web_sys::console::log_1(&JsValue::from_str(
                    "Using existing cluster solution for evaluation",
                ));
                existing.clone()
            } else {
                web_sys::console::log_1(&JsValue::from_str(
                    "Creating new cluster solution for evaluation",
                ));
                match get_cluster_membership(
                    &results.agglomeration_schedule,
                    num_clusters,
                    self.data.len(),
                ) {
                    Ok(m) => m,
                    Err(e) => {
                        web_sys::console::error_1(&JsValue::from_str(&format!(
                            "Error getting cluster membership: {:?}",
                            e
                        )));
                        return Err(JsValue::from_str(&format!(
                            "Failed to get cluster membership: {}",
                            e
                        )));
                    }
                }
            }
        } else {
            web_sys::console::log_1(&JsValue::from_str(
                "Creating new cluster solution for evaluation",
            ));
            match get_cluster_membership(
                &results.agglomeration_schedule,
                num_clusters,
                self.data.len(),
            ) {
                Ok(m) => m,
                Err(e) => {
                    web_sys::console::error_1(&JsValue::from_str(&format!(
                        "Error getting cluster membership: {:?}",
                        e
                    )));
                    return Err(JsValue::from_str(&format!(
                        "Failed to get cluster membership: {}",
                        e
                    )));
                }
            }
        };

        // Log cluster distribution for debugging
        let mut cluster_sizes = vec![0; num_clusters];
        for &cluster_id in &membership.cluster_ids {
            if cluster_id < num_clusters {
                cluster_sizes[cluster_id] += 1;
            }
        }

        web_sys::console::log_1(&JsValue::from_str("Cluster distribution:"));
        for (i, &size) in cluster_sizes.iter().enumerate() {
            web_sys::console::log_1(&JsValue::from_str(&format!(
                "  Cluster {}: {} cases",
                i + 1,
                size
            )));
        }

        // Check if any cluster is empty
        if cluster_sizes.iter().any(|&size| size == 0) {
            web_sys::console::warn_1(&JsValue::from_str("Warning: Some clusters are empty"));
        }

        // Evaluate clustering
        let evaluation = match evaluate_clustering(&self.data, &membership, &self.distance_matrix) {
            Ok(e) => {
                web_sys::console::log_1(&JsValue::from_str(
                    "Successfully evaluated cluster solution",
                ));
                web_sys::console::log_1(&JsValue::from_str(&format!(
                    "Silhouette coefficient: {:.4}",
                    e.silhouette
                )));
                e
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error evaluating clustering: {:?}",
                    e
                )));
                return Err(JsValue::from_str(&format!(
                    "Failed to evaluate clustering: {}",
                    e
                )));
            }
        };

        // Store in results
        results.evaluation = Some(evaluation.clone());

        // Convert to JS value
        match serde_wasm_bindgen::to_value(&evaluation) {
            Ok(value) => {
                web_sys::console::log_1(&JsValue::from_str(
                    "Successfully serialized evaluation metrics",
                ));
                Ok(value)
            }
            Err(e) => {
                web_sys::console::error_1(&JsValue::from_str(&format!(
                    "Error serializing evaluation: {}",
                    e
                )));
                Err(JsValue::from_str(&format!(
                    "Failed to serialize evaluation metrics: {}",
                    e
                )))
            }
        }
    }

    /// Get complete results
    ///
    /// # Returns
    /// * JSON string with all clustering results
    #[wasm_bindgen]
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        // Check if we have performed clustering
        let results = match &self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ))
            }
        };

        // Convert to JS value
        serde_wasm_bindgen::to_value(results)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
    }

    /// Get dendrogram data for visualization
    ///
    /// # Returns
    /// * JSON string with dendrogram data
    #[wasm_bindgen]
    pub fn get_dendrogram_data(&self) -> Result<JsValue, JsValue> {
        // Check if we have performed clustering
        let results = match &self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ))
            }
        };

        // Check if we have dendrogram data
        let dendrogram_data = match &results.dendrogram_data {
            Some(d) => d,
            None => return Err(JsValue::from_str("Dendrogram data not available")),
        };

        // Convert to JS value
        serde_wasm_bindgen::to_value(dendrogram_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize dendrogram data: {}", e)))
    }

    /// Get variable names
    #[wasm_bindgen]
    pub fn get_variable_names(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.variable_names)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize variable names: {}", e)))
    }

    /// Get label data
    #[wasm_bindgen]
    pub fn get_label_data(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.label_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize label data: {}", e)))
    }

    /// Get original configuration
    #[wasm_bindgen]
    pub fn get_config(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.raw_config)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize configuration: {}", e)))
    }
}

/// Parse SPSS-style configuration into our internal format
fn parse_spss_config(config: &Value) -> Result<ClusteringConfig, ClusteringError> {
    // Default configuration
    let mut result = ClusteringConfig {
        method: LinkageMethod::AverageBetweenGroups, // Default method
        distance_metric: DistanceMetric::Euclidean,  // Default metric
        data_type: DataType::Interval,               // Default data type
        standardization: StandardizationMethod::None, // Default no standardization
        missing_values: MissingValueStrategy::ExcludeListwise, // Default listwise deletion
        distance_transformation: DistanceTransformation::None, // Default no transformation
        minkowski_power: None,
        binary_options: None,
    };

    // Extract method configuration if available
    if let Some(method) = config.get("method") {
        // Get clustering method
        if let Some(method_str) = method.get("ClusMethod").and_then(|m| m.as_str()) {
            result.method = match method_str {
                "AverageBetweenGroups" => LinkageMethod::AverageBetweenGroups,
                "AverageWithinGroups" => LinkageMethod::AverageWithinGroups,
                "SingleLinkage" => LinkageMethod::SingleLinkage,
                "CompleteLinkage" => LinkageMethod::CompleteLinkage,
                "Centroid" => LinkageMethod::Centroid,
                "Median" => LinkageMethod::Median,
                "Ward" => LinkageMethod::Ward,
                _ => LinkageMethod::AverageBetweenGroups,
            };
        }

        // Determine distance metric based on data type
        if method
            .get("Interval")
            .and_then(|i| i.as_bool())
            .unwrap_or(false)
        {
            result.data_type = DataType::Interval;

            if let Some(metric_str) = method.get("IntervalMethod").and_then(|m| m.as_str()) {
                result.distance_metric = match metric_str {
                    "Euclidean" => DistanceMetric::Euclidean,
                    "SquaredEuclidean" => DistanceMetric::SquaredEuclidean,
                    "Cosine" => DistanceMetric::Cosine,
                    "Correlation" => DistanceMetric::Correlation,
                    "Chebyshev" => DistanceMetric::Chebyshev,
                    "Block" => DistanceMetric::Manhattan,
                    "Minkowski" => {
                        // Get power parameter if available
                        result.minkowski_power = method.get("Power").and_then(|p| p.as_f64());
                        DistanceMetric::Minkowski
                    }
                    _ => DistanceMetric::Euclidean,
                };
            }
        } else if method
            .get("Counts")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
        {
            result.data_type = DataType::Counts;

            if let Some(metric_str) = method.get("CountsMethod").and_then(|m| m.as_str()) {
                result.distance_metric = match metric_str {
                    "ChiSquare" => DistanceMetric::ChiSquare,
                    _ => DistanceMetric::ChiSquare,
                };
            }
        } else if method
            .get("Binary")
            .and_then(|b| b.as_bool())
            .unwrap_or(false)
        {
            result.data_type = DataType::Binary;

            if let Some(metric_str) = method.get("BinaryMethod").and_then(|m| m.as_str()) {
                result.distance_metric = match metric_str {
                    "Jaccard" => DistanceMetric::Jaccard,
                    _ => DistanceMetric::Jaccard,
                };

                // Get binary options if available
                let present = method
                    .get("Present")
                    .and_then(|p| p.as_f64())
                    .unwrap_or(1.0);
                let absent = method.get("Absent").and_then(|a| a.as_f64()).unwrap_or(0.0);

                result.binary_options = Some(BinaryOptions {
                    present_value: present,
                    absent_value: absent,
                });
            }
        }

        // Get standardization method if available
        if let Some(std_str) = method.get("StandardizeMethod").and_then(|s| s.as_str()) {
            result.standardization = match std_str {
                "ZScore" => StandardizationMethod::ZScore,
                "RangeNegOneToOne" => StandardizationMethod::RangeNegOneToOne,
                "RangeZeroToOne" => StandardizationMethod::RangeZeroToOne,
                "MaxMagnitudeOne" => StandardizationMethod::MaxMagnitudeOne,
                "MeanOne" => StandardizationMethod::MeanOne,
                "StdDevOne" => StandardizationMethod::StdDevOne,
                _ => StandardizationMethod::None,
            };
        }

        // Get distance transformation if available
        if method
            .get("AbsValue")
            .and_then(|a| a.as_bool())
            .unwrap_or(false)
        {
            result.distance_transformation = DistanceTransformation::AbsoluteValue;
        } else if method
            .get("ChangeSign")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
        {
            result.distance_transformation = DistanceTransformation::ChangeSign;
        } else if method
            .get("RescaleRange")
            .and_then(|r| r.as_bool())
            .unwrap_or(false)
        {
            result.distance_transformation = DistanceTransformation::RescaleZeroToOne;
        }
    }

    Ok(result)
}

/// Helper function to parse input configuration from JSON
#[wasm_bindgen]
pub fn parse_clustering_config(config_json: &JsValue) -> Result<JsValue, JsValue> {
    // Parse JSON into a generic structure
    let json_value: Value = serde_wasm_bindgen::from_value(config_json.clone())
        .map_err(|e| JsValue::from_str(&format!("Failed to parse configuration JSON: {}", e)))?;

    // Parse into our internal format
    let config = parse_spss_config(&json_value)
        .map_err(|e| JsValue::from_str(&format!("Failed to parse SPSS configuration: {}", e)))?;

    // Convert to JS value
    serde_wasm_bindgen::to_value(&config)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize config: {}", e)))
}

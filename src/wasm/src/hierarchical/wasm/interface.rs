use serde::{Deserialize, Serialize};
use serde_json::Value;
use wasm_bindgen::prelude::*;

use crate::hierarchical::algorithm::*;
use crate::hierarchical::result::*;
use crate::hierarchical::statistics::*;
use crate::hierarchical::types::*;
use crate::hierarchical::utils::error::*;
use crate::hierarchical::utils::*;
use crate::hierarchical::wasm::config::parse_spss_config;

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

    // Warnings
    warnings: Vec<String>,
}

#[wasm_bindgen]
impl HierarchicalClusteringWasm {
    /// Create a new hierarchical clustering instance with SPSS-style input format
    #[wasm_bindgen(constructor)]
    pub fn new(
        tempData: &JsValue,
        slicedDataForCluster: &JsValue,
        slicedDataForLabelCases: &JsValue,
        varDefsForCluster: &JsValue,
        varDefsForLabelCases: &JsValue,
    ) -> Result<HierarchicalClusteringWasm, JsValue> {
        // Initialize warnings vector
        let mut warnings = Vec::new();

        // Validate inputs
        if tempData.is_null() || tempData.is_undefined() {
            return Err(JsValue::from_str(
                "Configuration object (tempData) is null or undefined",
            ));
        }

        // Parse configuration object
        let raw_config: Value = match serde_wasm_bindgen::from_value(tempData.clone()) {
            Ok(config) => config,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to parse configuration object: {}",
                    e
                )))
            }
        };

        // Parse JSON data and extract variable information
        let sliced_data_for_cluster: Vec<Vec<Value>> =
            match serde_wasm_bindgen::from_value(slicedDataForCluster.clone()) {
                Ok(data) => data,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to parse cluster data: {}",
                        e
                    )))
                }
            };

        let var_defs_for_cluster: Value =
            match serde_wasm_bindgen::from_value(varDefsForCluster.clone()) {
                Ok(defs) => defs,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to parse cluster variable definitions: {}",
                        e
                    )))
                }
            };

        // Extract variable names and create data matrix
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
            return Err(JsValue::from_str("No valid variable names found"));
        }

        // Determine number of cases and initialize data matrix
        let num_cases =
            if !sliced_data_for_cluster.is_empty() && !sliced_data_for_cluster[0].is_empty() {
                sliced_data_for_cluster[0].len()
            } else {
                return Err(JsValue::from_str("Empty cluster data"));
            };

        // Log for debugging
        web_sys::console::log_1(&JsValue::from_str(&format!(
            "Processing data with {} variables and {} cases",
            variable_names.len(),
            num_cases
        )));

        let mut data_matrix = vec![vec![0.0; variable_names.len()]; num_cases];

        // Fill data matrix
        for (var_idx, var_data) in sliced_data_for_cluster.iter().enumerate() {
            if var_idx >= variable_names.len() {
                continue;
            }
            let var_name = &variable_names[var_idx];

            for (case_idx, case) in var_data.iter().enumerate() {
                if case_idx >= num_cases {
                    continue;
                }

                if let Some(obj) = case.as_object() {
                    if let Some(value) = obj.get(var_name).and_then(|v| v.as_f64()) {
                        data_matrix[case_idx][var_idx] = value;
                    } else if let Some(value) = obj
                        .get(var_name)
                        .and_then(|v| v.as_str())
                        .and_then(|s| s.parse::<f64>().ok())
                    {
                        // Try to parse string to f64
                        data_matrix[case_idx][var_idx] = value;
                    } else {
                        data_matrix[case_idx][var_idx] = f64::NAN;
                        log_warning(
                            format!("NaN value at case {} for variable {}", case_idx, var_name),
                            &mut warnings,
                        );
                    }
                } else {
                    data_matrix[case_idx][var_idx] = f64::NAN;
                    log_warning(
                        format!("Invalid case data at index {}", case_idx),
                        &mut warnings,
                    );
                }
            }
        }

        // Check if data matrix is valid
        if data_matrix.is_empty() || data_matrix[0].is_empty() {
            return Err(JsValue::from_str("Failed to create valid data matrix"));
        }

        if data_matrix.len() < 2 {
            return Err(JsValue::from_str("Need at least 2 cases for clustering"));
        }

        // Process label data if available
        let mut label_values = Vec::new();
        let label_name = if let Some(main) = raw_config.get("main") {
            main.get("LabelCases")
                .and_then(|l| l.as_str())
                .map(|s| s.to_string())
        } else {
            None
        };

        if let Some(label_name_str) = &label_name {
            let sliced_data_for_label_cases: Vec<Vec<Value>> =
                match serde_wasm_bindgen::from_value(slicedDataForLabelCases.clone()) {
                    Ok(data) => data,
                    Err(_) => Vec::new(),
                };

            if !sliced_data_for_label_cases.is_empty() && !sliced_data_for_label_cases[0].is_empty()
            {
                for (i, case) in sliced_data_for_label_cases[0].iter().enumerate() {
                    if i >= num_cases {
                        break;
                    }

                    if let Some(obj) = case.as_object() {
                        let label_value = obj
                            .get(label_name_str)
                            .and_then(|v| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64)))
                            .unwrap_or(0.0) as usize;

                        label_values.push(label_value);
                    } else {
                        label_values.push(0);
                    }
                }
            }
        }

        // Pad label values if needed
        while label_values.len() < num_cases {
            label_values.push(0);
        }

        // Parse configuration
        let config = match parse_spss_config(&raw_config) {
            Ok(c) => c,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to parse SPSS configuration: {}",
                    e
                )))
            }
        };

        // Create initial case IDs
        let case_ids: Vec<usize> = (0..data_matrix.len()).collect();

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
            raw_label_vars: match serde_wasm_bindgen::from_value(varDefsForLabelCases.clone()) {
                Ok(defs) => defs,
                Err(_) => Value::Null,
            },
            warnings,
        })
    }

    /// Perform complete hierarchical clustering analysis
    #[wasm_bindgen]
    pub fn perform_analysis(&mut self) -> Result<JsValue, JsValue> {
        // Langkah 1: Preprocess data
        if let Err(e) = self.preprocess_data() {
            let msg = format!(
                "Warning during data preprocessing: {:?}. Continuing with default values.",
                e
            );
            log_warning(msg, &mut self.warnings);

            // Ensure there are at least 2 valid cases
            if self.data.len() < 2 {
                return Err(JsValue::from_str(
                    "Critical error: Need at least 2 valid cases for clustering",
                ));
            }
        }

        // Langkah 2: Calculate distances
        if let Err(e) = self.calculate_distances() {
            let msg = format!(
                "Warning during distance calculation: {:?}. Trying with Euclidean distance.",
                e
            );
            log_warning(msg, &mut self.warnings);

            // Use fallback distance calculation
            self.fallback_distance_calculation();

            // Check if still failed
            if self.distance_matrix.is_empty() || self.distance_matrix.len() < 2 {
                return Err(JsValue::from_str(
                    "Critical error: Failed to create distance matrix even with fallback method",
                ));
            }
        }

        // Langkah 3: Cluster
        if let Err(e) = self.cluster() {
            let msg = format!(
                "Error during clustering: {:?}. Could not complete clustering.",
                e
            );
            web_sys::console::error_1(&JsValue::from_str(&msg));
            self.warnings.push(msg.clone());

            // Create AnalysisResult with error
            let result = AnalysisResult {
                success: false,
                warnings: self.warnings.clone(),
                error: Some(msg),
                data: None, // No data because clustering failed
            };

            return Ok(serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL));
        }

        // Get cluster solution if specified
        let mut cluster_solution_error = None;
        if let Some(obj) = self.raw_config.get("statistics") {
            if let Some(num_clusters) = obj.get("NoOfCluster").and_then(|c| c.as_u64()) {
                if num_clusters > 0 {
                    if let Err(e) = self.get_clusters(num_clusters as usize) {
                        let msg = format!("Warning during cluster solution extraction: {:?}. Some analyses may be incomplete.", e);
                        log_warning(msg.clone(), &mut self.warnings);
                        cluster_solution_error = Some(msg);
                    }

                    if let Err(e) = self.evaluate(num_clusters as usize) {
                        let msg = format!("Warning during cluster evaluation: {:?}. Evaluation metrics may be missing.", e);
                        log_warning(msg, &mut self.warnings);
                    }
                }
            } else if obj
                .get("SingleSol")
                .and_then(|s| s.as_bool())
                .unwrap_or(false)
            {
                // Default to 3 clusters if SingleSol is true but NoOfCluster is not specified
                let default_clusters = 3;
                if let Err(e) = self.get_clusters(default_clusters) {
                    let msg = format!(
                        "Warning during cluster solution extraction: {:?}. Using default fallback.",
                        e
                    );
                    log_warning(msg.clone(), &mut self.warnings);
                    cluster_solution_error = Some(msg);

                    // Try with a different cluster number
                    let fallback_clusters = 2;
                    if let Err(e2) = self.get_clusters(fallback_clusters) {
                        let msg2 = format!(
                            "Failed fallback to {} clusters: {:?}",
                            fallback_clusters, e2
                        );
                        log_warning(msg2, &mut self.warnings);
                    } else {
                        self.warnings.push(format!(
                            "Successfully created fallback solution with {} clusters",
                            fallback_clusters
                        ));
                    }
                }
            } else if obj
                .get("RangeSol")
                .and_then(|s| s.as_bool())
                .unwrap_or(false)
            {
                // Get range of solutions
                let min_clusters =
                    obj.get("MinCluster").and_then(|c| c.as_u64()).unwrap_or(2) as usize;
                let max_clusters =
                    obj.get("MaxCluster").and_then(|c| c.as_u64()).unwrap_or(5) as usize;

                if min_clusters > 0 && max_clusters >= min_clusters {
                    if let Err(e) = self.get_clusters_range(min_clusters, max_clusters) {
                        let msg = format!("Warning during cluster range solution: {:?}. Range solution may be incomplete.", e);
                        log_warning(msg, &mut self.warnings);
                    }
                }
            }
        }

        // Create result structure
        let result = AnalysisResult {
            success: true,
            warnings: self.warnings.clone(),
            error: cluster_solution_error,
            data: self.get_results_direct(),
        };

        // Convert to JS value
        Ok(serde_wasm_bindgen::to_value(&result).unwrap_or(JsValue::NULL))
    }

    /// Get direct results without wrapping
    fn get_results_direct(&self) -> Option<HierarchicalClusteringResults> {
        self.results.clone()
    }

    /// Preprocess data (standardize and handle missing values)
    #[wasm_bindgen]
    pub fn preprocess_data(&mut self) -> Result<(), JsValue> {
        // Handle missing values
        let (processed_data, valid_case_ids) =
            handle_missing_values(&self.data, self.config.missing_values)
                .map_err(|e| e.into_js_error())?;

        if valid_case_ids.len() < 2 {
            return Err(JsValue::from_str(
                "Not enough valid cases after handling missing values",
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
                    filtered_labels.push(0);
                }
            }
            self.label_data = filtered_labels;
        }

        // Standardize data if needed
        if self.config.standardization != StandardizationMethod::None {
            self.data = transform::standardize_data(
                &self.data,
                self.config.standardization,
                self.config.standardize_by_case,
            )
            .map_err(|e| e.into_js_error())?;
        }

        Ok(())
    }

    /// Calculate distance matrix
    #[wasm_bindgen]
    pub fn calculate_distances(&mut self) -> Result<(), JsValue> {
        if self.data.is_empty() || self.data.len() < 2 {
            return Err(JsValue::from_str(
                "Insufficient data for distance calculation",
            ));
        }

        // Get binary options if needed
        let binary_options = if let Some(options) = &self.config.binary_options {
            Some(options)
        } else {
            None
        };

        // Calculate distance matrix
        let distance_matrix = crate::hierarchical::statistics::matrix::calculate_distance_matrix(
            &self.data,
            self.config.distance_metric,
            self.config.minkowski_power,
            binary_options,
            &mut self.warnings,
            self.config.custom_power,
            self.config.custom_root,
        )
        .map_err(|e| e.into_js_error())?;

        // Apply transformation if needed
        if self.config.distance_transformation != DistanceTransformation::None {
            self.distance_matrix = transform::transform_distance_matrix(
                &distance_matrix,
                self.config.distance_transformation,
            );
        } else {
            self.distance_matrix = distance_matrix;
        }

        Ok(())
    }

    // Metode fallback untuk menghitung distance matrix jika metode utama gagal
    fn fallback_distance_calculation(&mut self) {
        self.distance_matrix =
            crate::hierarchical::statistics::matrix::create_fallback_distance_matrix(
                &self.data,
                &mut self.warnings,
            );
    }

    /// Perform hierarchical clustering
    #[wasm_bindgen]
    pub fn cluster(&mut self) -> Result<(), JsValue> {
        if self.distance_matrix.is_empty() || self.distance_matrix.len() < 2 {
            return Err(JsValue::from_str(
                "Distance matrix not calculated or insufficient data",
            ));
        }

        // Perform clustering
        let results = hierarchical_cluster(
            &self.data,
            &self.distance_matrix,
            &self.config,
            &mut self.warnings,
        )
        .map_err(|e| e.into_js_error())?;

        self.results = Some(results);

        Ok(())
    }

    /// Get cluster membership for a specific number of clusters
    #[wasm_bindgen]
    pub fn get_clusters(&mut self, num_clusters: usize) -> Result<JsValue, JsValue> {
        if num_clusters < 1 {
            return Err(JsValue::from_str("Number of clusters must be at least 1"));
        }

        // Check if clustering was performed
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        let data_size = self.data.len();

        if num_clusters > data_size {
            // Log warning and adjust to maximum possible
            log_warning(
                format!(
                "Number of clusters ({}) exceeds number of cases ({}). Will use maximum possible.",
                num_clusters, data_size
            ),
                &mut self.warnings,
            );

            // Use maximum possible number (limited to 10 for safety)
            let adjusted_clusters = data_size.min(10);

            // Get cluster membership with adjusted number
            let membership = match crate::hierarchical::result::membership::get_cluster_membership(
                &results.agglomeration_schedule,
                adjusted_clusters,
                data_size,
                &mut self.warnings,
            ) {
                Ok(m) => m,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to get cluster membership: {}",
                        e
                    )));
                }
            };

            // Store in results (use actual number of clusters found)
            results.single_solution = Some(membership.clone());

            // Log information message
            log_warning(
                format!(
                    "Created solution with {} clusters instead of requested {}",
                    membership.num_clusters, num_clusters
                ),
                &mut self.warnings,
            );

            // Convert to JS value
            return serde_wasm_bindgen::to_value(&membership).map_err(|e| {
                JsValue::from_str(&format!("Failed to serialize cluster membership: {:?}", e))
            });
        }

        // Get cluster membership
        let membership = match get_cluster_membership(
            &results.agglomeration_schedule,
            num_clusters,
            data_size,
            &mut self.warnings,
        ) {
            Ok(m) => m,
            Err(e) => {
                // Try alternative cluster numbers if requested number fails
                log_warning(
                    format!(
                        "Failed with {} clusters: {}. Trying alternative numbers of clusters.",
                        num_clusters, e
                    ),
                    &mut self.warnings,
                );

                // Try several alternatives starting from closest
                let alternatives = [
                    num_clusters - 1,
                    num_clusters + 1,
                    num_clusters - 2,
                    num_clusters + 2,
                    2, // Minimum valid clusters
                ];

                for &alt_num in alternatives.iter() {
                    if alt_num >= 2 && alt_num < data_size {
                        match get_cluster_membership(
                            &results.agglomeration_schedule,
                            alt_num,
                            data_size,
                            &mut self.warnings,
                        ) {
                            Ok(alt_m) => {
                                log_warning(
                                    format!(
                                    "Successfully created alternative solution with {} clusters",
                                    alt_m.num_clusters
                                ),
                                    &mut self.warnings,
                                );

                                // Store in results
                                results.single_solution = Some(alt_m.clone());

                                // Convert to JS value and return
                                return serde_wasm_bindgen::to_value(&alt_m).map_err(|e| {
                                    JsValue::from_str(&format!(
                                        "Failed to serialize cluster membership: {:?}",
                                        e
                                    ))
                                });
                            }
                            Err(_) => {
                                // Try next alternative
                                continue;
                            }
                        }
                    }
                }

                // If all alternatives fail, return error
                return Err(JsValue::from_str(&format!(
                    "Failed to get cluster membership for any valid number of clusters: {}",
                    e
                )));
            }
        };

        // Store in results
        results.single_solution = Some(membership.clone());

        // Convert to JS value
        serde_wasm_bindgen::to_value(&membership).map_err(|e| {
            JsValue::from_str(&format!("Failed to serialize cluster membership: {:?}", e))
        })
    }

    /// Get cluster memberships for a range of solutions
    #[wasm_bindgen]
    pub fn get_clusters_range(
        &mut self,
        min_clusters: usize,
        max_clusters: usize,
    ) -> Result<JsValue, JsValue> {
        if min_clusters < 1 || min_clusters > max_clusters {
            return Err(JsValue::from_str("Invalid cluster range parameters"));
        }

        // Check if clustering was performed
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        let data_size = self.data.len();

        if max_clusters > data_size {
            return Err(JsValue::from_str(&format!(
                "Maximum number of clusters exceeds number of cases"
            )));
        }

        // Get cluster memberships for range
        let memberships = match get_cluster_memberships_range(
            &results.agglomeration_schedule,
            min_clusters,
            max_clusters,
            data_size,
            &mut self.warnings,
        ) {
            Ok(m) => m,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to get cluster memberships: {}",
                    e
                )));
            }
        };

        // Store in results
        results.range_solutions = Some(memberships.clone());

        // Convert to JS value
        serde_wasm_bindgen::to_value(&memberships).map_err(|e| {
            JsValue::from_str(&format!("Failed to serialize cluster memberships: {}", e))
        })
    }

    /// Evaluate clustering solution
    #[wasm_bindgen]
    pub fn evaluate(&mut self, num_clusters: usize) -> Result<JsValue, JsValue> {
        if num_clusters < 2 {
            return Err(JsValue::from_str("Need at least 2 clusters to evaluate"));
        }

        // Check if clustering was performed
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        // Get cluster membership
        let membership = if let Some(ref existing) = results.single_solution {
            if existing.num_clusters == num_clusters {
                existing.clone()
            } else {
                match get_cluster_membership(
                    &results.agglomeration_schedule,
                    num_clusters,
                    self.data.len(),
                    &mut self.warnings,
                ) {
                    Ok(m) => m,
                    Err(e) => {
                        return Err(JsValue::from_str(&format!(
                            "Failed to get cluster membership: {}",
                            e
                        )));
                    }
                }
            }
        } else {
            match get_cluster_membership(
                &results.agglomeration_schedule,
                num_clusters,
                self.data.len(),
                &mut self.warnings,
            ) {
                Ok(m) => m,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to get cluster membership: {}",
                        e
                    )));
                }
            }
        };

        // Evaluate clustering
        let evaluation = match evaluate_clustering(
            &self.data,
            &membership,
            &self.distance_matrix,
            &mut self.warnings,
        ) {
            Ok(e) => e,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to evaluate clustering: {}",
                    e
                )));
            }
        };

        // Store in results
        results.evaluation = Some(evaluation.clone());

        // Convert to JS value
        serde_wasm_bindgen::to_value(&evaluation).map_err(|e| {
            JsValue::from_str(&format!("Failed to serialize evaluation metrics: {}", e))
        })
    }

    /// Get complete results
    #[wasm_bindgen]
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        match &self.results {
            Some(r) => serde_wasm_bindgen::to_value(r)
                .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e))),
            None => Err(JsValue::from_str(
                "Clustering not performed. Call cluster() first.",
            )),
        }
    }

    /// Get dendrogram data for visualization
    #[wasm_bindgen]
    pub fn get_dendrogram_data(&self) -> Result<JsValue, JsValue> {
        match &self.results {
            Some(r) => match &r.dendrogram_data {
                Some(d) => serde_wasm_bindgen::to_value(d).map_err(|e| {
                    JsValue::from_str(&format!("Failed to serialize dendrogram data: {}", e))
                }),
                None => Err(JsValue::from_str("Dendrogram data not available")),
            },
            None => Err(JsValue::from_str(
                "Clustering not performed. Call cluster() first.",
            )),
        }
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

    /// Get accumulated warnings
    #[wasm_bindgen]
    pub fn get_warnings(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.warnings)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize warnings: {}", e)))
    }
}

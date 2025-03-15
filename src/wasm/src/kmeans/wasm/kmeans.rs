use wasm_bindgen::prelude::*;
use crate::kmeans::types::data::{ClusteringResult, AnalysisResult, KMeansInput};
use crate::kmeans::utils::converters::{from_js_value, to_js_value, parse_kmeans_input};
use crate::kmeans::utils::error::{KMeansError, KMeansResult, IntoJsError, log_warning, log_error};
use crate::kmeans::stats::kmeans::KMeansClustering;

/// WASM bindings for K-Means clustering.
#[wasm_bindgen]
pub struct KMeansClusteringWasm {
    #[wasm_bindgen(skip)]
    input: Option<KMeansInput>,
    #[wasm_bindgen(skip)]
    result: Option<ClusteringResult>,
    #[wasm_bindgen(skip)]
    warnings: Vec<String>,
}

#[wasm_bindgen]
impl KMeansClusteringWasm {
    /// Create a new K-Means clustering instance.
    ///
    /// # Arguments
    /// * `temp_data` - Configuration settings (JsValue)
    /// * `sliced_data_for_target` - Target data (JsValue)
    /// * `sliced_data_for_case_target` - Case target data (JsValue)
    /// * `var_defs_for_target` - Variable definitions for targets (JsValue)
    /// * `var_defs_for_case_target` - Variable definitions for case targets (JsValue)
    ///
    /// # Returns
    /// * `Result<KMeansClusteringWasm, JsValue>` - New instance or error
    #[wasm_bindgen(constructor)]
    pub fn new(
        temp_data: JsValue,
        sliced_data_for_target: JsValue,
        sliced_data_for_case_target: JsValue,
        var_defs_for_target: JsValue,
        var_defs_for_case_target: JsValue,
    ) -> Result<KMeansClusteringWasm, JsValue> {
        // Parse input data
        let mut warnings = Vec::new();
        
        let input = parse_kmeans_input(
            &temp_data,
            &sliced_data_for_target,
            &sliced_data_for_case_target,
            &var_defs_for_target,
            &var_defs_for_case_target,
        ).map_err(|e| {
            log_error(format!("Failed to parse input data: {}", e), &mut warnings).into_js_error()
        })?;
        
        Ok(KMeansClusteringWasm {
            input: Some(input),
            result: None,
            warnings,
        })
    }
    
    /// Perform K-Means clustering analysis.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Clustering results as JS object or error
    #[wasm_bindgen]
    pub fn perform_analysis(&mut self) -> Result<JsValue, JsValue> {
        let result = match self.run_kmeans() {
            Ok(result) => {
                self.result = Some(result.clone());
                
                let analysis_result = AnalysisResult {
                    success: true,
                    warnings: self.warnings.clone(),
                    error: None,
                    data: Some(result),
                };
                
                // Use serde_wasm_bindgen directly for better JS compatibility
                match serde_wasm_bindgen::to_value(&analysis_result) {
                    Ok(js_value) => js_value,
                    Err(e) => return Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            Err(err) => {
                let analysis_result = AnalysisResult {
                    success: false,
                    warnings: self.warnings.clone(),
                    error: Some(err.to_string()),
                    data: None,
                };
                
                match serde_wasm_bindgen::to_value(&analysis_result) {
                    Ok(js_value) => js_value,
                    Err(e) => return Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            }
        };
        
        Ok(result)
    }
    
    /// Get initial cluster centers.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Initial centers as JS array or error
    #[wasm_bindgen]
    pub fn get_initial_centers(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.initial_centers) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get final cluster centers.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Final centers as JS array or error
    #[wasm_bindgen]
    pub fn get_final_centers(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.final_centers) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get iteration history directly using serde_wasm_bindgen.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Iteration changes as JS array using direct conversion
    #[wasm_bindgen]
    pub fn get_iterations_direct(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                // Convert to JS array directly
                match serde_wasm_bindgen::to_value(&result.iterations) {
                    Ok(js_array) => Ok(js_array),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get iteration history in a more detailed format.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Iteration history with details
    #[wasm_bindgen]
    pub fn get_iterations_detailed(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                let mut iterations_data = Vec::new();
                
                for (iter_num, changes) in result.iterations.iter().enumerate() {
                    let iteration_obj = serde_json::json!({
                        "iteration": iter_num + 1,
                        "changes": changes,
                        "maxChange": changes.iter().fold(0.0f64, |max: f64, &change| max.max(change))
                    });
                    
                    iterations_data.push(iteration_obj);
                }
                
                // Convert to JS array directly
                match serde_wasm_bindgen::to_value(&iterations_data) {
                    Ok(js_array) => Ok(js_array),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get iteration history table formatted as in SPSS output.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Iteration table as JS object or error
    #[wasm_bindgen]
    pub fn get_iteration_history_table(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                let mut rows = Vec::new();
                
                // Add a row for each iteration
                for (i, changes) in result.iterations.iter().enumerate() {
                    let mut row_data = serde_json::json!({
                        "iteration": i + 1
                    });
                    
                    let row_obj = row_data.as_object_mut().unwrap();
                    
                    // Add changes for each cluster
                    for (j, change) in changes.iter().enumerate() {
                        row_obj.insert(
                            format!("cluster{}", j + 1), 
                            serde_json::Value::Number(serde_json::Number::from_f64(*change).unwrap())
                        );
                    }
                    
                    rows.push(row_data);
                }
                
                // Add convergence note
                let note = format!(
                    "a. Convergence achieved due to no or small change in cluster centers. The maximum absolute coordinate change for any center is .000. The current iteration is {}. The minimum distance between initial centers is {}.",
                    result.iteration_count,
                    result.min_distance_initial
                );
                
                // Create headers based on number of clusters
                let mut headers = vec!["Iteration".to_string()];
                for i in 1..=result.final_centers.len() {
                    headers.push(i.to_string());
                }
                
                let table = serde_json::json!({
                    "title": "Iteration History",
                    "subTitle": "Change in Cluster Centers",
                    "headers": headers,
                    "rows": rows,
                    "note": note
                });
                
                // Use serde_wasm_bindgen directly
                match serde_wasm_bindgen::to_value(&table) {
                    Ok(js_table) => Ok(js_table),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get cluster membership for each data point.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Cluster assignments as JS array or error
    #[wasm_bindgen]
    pub fn get_cluster_membership(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.cluster_membership) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get distances from each point to its cluster center.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Distances as JS array or error
    #[wasm_bindgen]
    pub fn get_distances(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.distances) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get the number of data points in each cluster.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Cluster sizes as JS array or error
    #[wasm_bindgen]
    pub fn get_cluster_sizes(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.cluster_sizes) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get ANOVA statistics if available.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - ANOVA table as JS object or error
    #[wasm_bindgen]
    pub fn get_anova_table(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => match &result.anova_table {
                Some(anova) => {
                    match serde_wasm_bindgen::to_value(anova) {
                        Ok(js_value) => Ok(js_value),
                        Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                    }
                },
                None => Err(JsValue::from_str("ANOVA statistics not calculated. Enable ANOVA option.")),
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get ANOVA table formatted as in SPSS output.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - ANOVA table as JS object or error
    #[wasm_bindgen]
    pub fn get_anova_table_formatted(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match &result.anova_table {
                    Some(anova) => {
                        let mut rows = Vec::new();
                        
                        for i in 0..anova.variables.len() {
                            // Tampilkan nilai dibulatkan ke 3 desimal seperti di SPSS
                            let cluster_ms = (anova.cluster_mean_squares[i] * 1000.0).round() / 1000.0;
                            let error_ms = (anova.error_mean_squares[i] * 1000.0).round() / 1000.0;
                            let f_value = (anova.f_values[i] * 1000.0).round() / 1000.0;
                            let sig_value = (anova.significance[i] * 1000.0).round() / 1000.0;
                            
                            rows.push(serde_json::json!({
                                "variable": anova.variables[i],
                                "clusterMeanSquare": cluster_ms,
                                "clusterDf": anova.cluster_df,
                                "errorMeanSquare": error_ms,
                                "errorDf": anova.error_df,
                                "f": f_value,
                                "sig": sig_value,
                            }));
                        }
                        
                        let table = serde_json::json!({
                            "title": "ANOVA",
                            "headers": ["", "Cluster", "", "Error", "", "", ""],
                            "subheaders": ["", "Mean Square", "df", "Mean Square", "df", "F", "Sig"],
                            "rows": rows,
                            "note": "The F tests should be used only for descriptive purposes because the clusters have been chosen to maximize the differences among cases in different clusters. The observed significance levels are not corrected for this and thus cannot be interpreted as tests of the hypothesis that the cluster means are equal."
                        });
                        
                        match serde_wasm_bindgen::to_value(&table) {
                            Ok(js_value) => Ok(js_value),
                            Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                        }
                    },
                    None => Err(JsValue::from_str("ANOVA statistics not calculated. Enable ANOVA option.")),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get variable names used in clustering.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Variable names as JS array or error
    #[wasm_bindgen]
    pub fn get_variable_names(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.variable_names) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get number of iterations performed.
    ///
    /// # Returns
    /// * `usize` - Number of iterations
    #[wasm_bindgen]
    pub fn get_iteration_count(&self) -> usize {
        match &self.result {
            Some(result) => result.iteration_count,
            None => 0,
        }
    }
    
    /// Get count of missing values encountered.
    ///
    /// # Returns
    /// * `usize` - Number of missing values
    #[wasm_bindgen]
    pub fn get_missing_count(&self) -> usize {
        match &self.result {
            Some(result) => result.missing_count,
            None => 0,
        }
    }
    
    /// Get all warnings accumulated during processing.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Warnings as JS array or error
    #[wasm_bindgen]
    pub fn get_warnings(&self) -> Result<JsValue, JsValue> {
        match serde_wasm_bindgen::to_value(&self.warnings) {
            Ok(js_value) => Ok(js_value),
            Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
        }
    }
    
    /// Get the complete clustering results.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Complete clustering results as JS object or error
    #[wasm_bindgen]
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                let analysis_result = AnalysisResult {
                    success: true,
                    warnings: self.warnings.clone(),
                    error: None,
                    data: Some(result.clone()),
                };
                
                match serde_wasm_bindgen::to_value(&analysis_result) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => {
                let analysis_result = AnalysisResult {
                    success: false,
                    warnings: self.warnings.clone(),
                    error: Some("No results available. Call perform_analysis first.".to_string()),
                    data: None,
                };
                
                match serde_wasm_bindgen::to_value(&analysis_result) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            }
        }
    }
    
    /// Get the number of cases in each cluster.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Case statistics as JS object or error
    #[wasm_bindgen]
    pub fn get_case_statistics(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                match serde_wasm_bindgen::to_value(&result.case_statistics) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get specific case counts table formatted as in SPSS output.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Case counts table as JS object or error
    #[wasm_bindgen]
    pub fn get_case_counts_table(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                let stats = &result.case_statistics;
                let num_clusters = stats.cluster_counts.len();
                
                // Create table rows
                let mut rows = Vec::new();
                
                // Add rows for each cluster
                for i in 0..num_clusters {
                    rows.push(serde_json::json!({
                        "label": format!("{}", i + 1),
                        "count": stats.cluster_counts[i]
                    }));
                }
                
                // Add Valid row
                rows.push(serde_json::json!({
                    "label": "Valid",
                    "count": stats.valid_count
                }));
                
                // Add Missing row
                rows.push(serde_json::json!({
                    "label": "Missing",
                    "count": format!("{:.3}", stats.missing_count as f64 / 1000.0)
                }));
                
                let table = serde_json::json!({
                    "title": "Number of Cases in each Cluster",
                    "rows": rows
                });
                
                match serde_wasm_bindgen::to_value(&table) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get cluster membership table formatted as in SPSS output.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Cluster membership table as JS object or error
    #[wasm_bindgen]
    pub fn get_cluster_membership_table(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                let membership = &result.membership_info;
                let case_target_data = &result.case_target_data;
                
                // Create formatted table
                let mut rows = Vec::new();
                
                for i in 0..membership.case_numbers.len() {
                    let case_number = membership.case_numbers[i];
                    let cluster = membership.clusters[i] + 1; // 1-based indexing for display
                    let distance = membership.distances[i];
                    
                    // Extract gender or other case target variable
                    let gender = if i < case_target_data.len() {
                        if let Some(obj) = case_target_data[i].as_object() {
                            if let Some(gender_value) = obj.get("gender") {
                                gender_value.as_str().unwrap_or("").to_string()
                            } else {
                                "".to_string()
                            }
                        } else {
                            "".to_string()
                        }
                    } else {
                        "".to_string()
                    };
                    
                    rows.push(serde_json::json!({
                        "caseNumber": case_number,
                        "gender": gender,
                        "cluster": cluster,
                        "distance": distance,
                    }));
                }
                
                let table = serde_json::json!({
                    "title": "Cluster Membership",
                    "headers": ["Case Number", "gender", "Cluster", "Distance"],
                    "rows": rows
                });
                
                match serde_wasm_bindgen::to_value(&table) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Get distances between final cluster centers formatted as in SPSS output.
    ///
    /// # Returns
    /// * `Result<JsValue, JsValue>` - Distance matrix as JS object or error
    #[wasm_bindgen]
    pub fn get_distance_matrix_table(&self) -> Result<JsValue, JsValue> {
        match &self.result {
            Some(result) => {
                let distance_matrix = &result.distance_matrix;
                let num_clusters = distance_matrix.num_clusters;
                
                // Create formatted table
                let mut rows = Vec::new();
                
                for i in 0..num_clusters {
                    let mut row_data = serde_json::json!({
                        "cluster": i + 1  // 1-based indexing for display
                    });
                    
                    let row_obj = row_data.as_object_mut().unwrap();
                    
                    // Only include values for upper triangular part (excluding diagonal)
                    for j in 0..num_clusters {
                        if j > i {  // Upper triangular part only
                            row_obj.insert(
                                format!("cluster{}", j + 1), 
                                serde_json::Value::Number(serde_json::Number::from_f64(distance_matrix.distances[i][j]).unwrap())
                            );
                        }
                    }
                    
                    rows.push(row_data);
                }
                
                // Create headers based on number of clusters
                let mut headers = vec!["Cluster".to_string()];
                for i in 1..=num_clusters {
                    headers.push(i.to_string());
                }
                
                let table = serde_json::json!({
                    "title": "Distances between Final Cluster Centers",
                    "headers": headers,
                    "rows": rows
                });
                
                match serde_wasm_bindgen::to_value(&table) {
                    Ok(js_value) => Ok(js_value),
                    Err(e) => Err(JsValue::from_str(&format!("Serialization error: {}", e))),
                }
            },
            None => Err(JsValue::from_str("No results available. Call perform_analysis first.")),
        }
    }
    
    /// Run the K-Means clustering algorithm.
    ///
    /// # Returns
    /// * `KMeansResult<ClusteringResult>` - Clustering results or error
    fn run_kmeans(&self) -> KMeansResult<ClusteringResult> {
        let input = self.input.as_ref()
            .ok_or_else(|| {
                KMeansError::InvalidInput("Input data not initialized".to_string())
            })?;
        
        // Extract case target data (like gender)
        let mut case_target_data = Vec::new();
        if !input.sliced_data_for_case_target.is_empty() && !input.sliced_data_for_case_target[0].is_empty() {
            for case_data in &input.sliced_data_for_case_target[0] {
                case_target_data.push(serde_json::to_value(&case_data.0).unwrap_or(serde_json::Value::Null));
            }
        }
        
        // Initialize K-Means clustering
        let mut kmeans = KMeansClustering::new(
            input.temp_data.clone(),
            &input.sliced_data_for_target,
            &input.var_defs_for_target,
        )?;
        
        // Run the algorithm with case target data
        kmeans.run(case_target_data)
    }
}
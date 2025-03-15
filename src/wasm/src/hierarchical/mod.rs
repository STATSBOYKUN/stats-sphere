use wasm_bindgen::prelude::*;

// Deklarasi modul-modul
pub mod types;
pub mod utils;
pub mod statistics;
pub mod result;
pub mod algorithm;
pub mod wasm;

// Export semua fungsi publik untuk WASM
#[wasm_bindgen(start)]
pub fn start() -> Result<(), JsValue> {
    // Setup panic hook untuk debugging 
    #[cfg(feature = "console_error_panic_hook")]
    console_error_panic_hook::set_once();

    // Setup logging ke konsol browser
    #[cfg(feature = "console_log")]
    console_log::init_with_level(log::Level::Debug)
        .expect("error initializing logger");

    Ok(())
}

// WASM re-exports dari modul internal
pub use wasm::interface::HierarchicalClusteringWasm;
pub use wasm::config::parse_clustering_config;
pub use wasm::analysis::perform_analysis;
pub use wasm::preprocessing::preprocess_data;

// Entry point untuk non-WASM
#[cfg(not(target_arch = "wasm32"))]
fn main() {
    println!("Hierarchical Clustering Library");
    println!("This is primarily a WebAssembly (WASM) library.");
    println!("Use the WASM bindings for browser integration or create a custom CLI tool.");
}

// Versi fungsi untuk native (non-WASM)
#[cfg(not(target_arch = "wasm32"))]
pub mod native {
    use crate::types::*;
    use crate::algorithm::*;
    use crate::statistics::*;
    use crate::result::*;
    use crate::utils::*;
    
    /// Perform hierarchical clustering analysis with native Rust API
    /// 
    /// # Arguments
    /// * `data` - Data matrix (rows are cases, columns are variables)
    /// * `config` - Clustering configuration
    /// 
    /// # Returns
    /// * `Result<HierarchicalClusteringResults, ClusteringError>` - Results or error
    pub fn perform_hierarchical_clustering(
        data: &[Vec<f64>],
        config: ClusteringConfig,
    ) -> Result<HierarchicalClusteringResults, ClusteringError> {
        // Container for warnings
        let mut warnings = Vec::new();
        
        // Preprocess data
        let preprocessed_data = if config.standardization != StandardizationMethod::None {
            transform::standardize_data(data, config.standardization, config.standardize_by_case)?
        } else {
            data.to_vec()
        };
        
        // Calculate distance matrix
        let distance_matrix = match matrix::calculate_distance_matrix(
            &preprocessed_data,
            config.distance_metric,
            config.minkowski_power,
            config.binary_options.as_ref(),
            &mut warnings,
            config.custom_power,
            config.custom_root,
        ) {
            Ok(matrix) => matrix,
            Err(e) => {
                log::warn!("Error calculating distances: {}. Using fallback.", e);
                matrix::create_fallback_distance_matrix(&preprocessed_data, &mut warnings)
            }
        };
        
        // Apply distance transformation if needed
        let transformed_distances = if config.distance_transformation != DistanceTransformation::None {
            transform::transform_distance_matrix(&distance_matrix, config.distance_transformation)
        } else {
            distance_matrix
        };
        
        // Perform clustering
        let mut results = clustering::hierarchical_cluster(
            &preprocessed_data,
            &transformed_distances,
            &config,
            &mut warnings,
        )?;
        
        // Extract results - can be customized to get specific cluster solutions, etc.
        // This would require additional parameters
        
        Ok(results)
    }
    
    /// Get cluster membership for a specific number of clusters
    /// 
    /// # Arguments
    /// * `results` - Clustering results from perform_hierarchical_clustering
    /// * `num_clusters` - Desired number of clusters
    /// * `n_cases` - Number of cases in the dataset
    /// 
    /// # Returns
    /// * `Result<ClusterMembership, ClusteringError>` - Cluster membership or error
    pub fn get_cluster_solution(
        results: &HierarchicalClusteringResults,
        num_clusters: usize,
        n_cases: usize,
    ) -> Result<ClusterMembership, ClusteringError> {
        let mut warnings = Vec::new();
        membership::get_cluster_membership(
            &results.agglomeration_schedule,
            num_clusters,
            n_cases,
            &mut warnings,
        )
    }
}
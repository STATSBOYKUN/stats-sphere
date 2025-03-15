use serde::{Deserialize, Serialize};

/// Main configuration for K-Means clustering.
///
/// Contains parameters that control the overall clustering process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MainConfig {
    #[serde(rename = "TargetVar")]
    pub target_var: Vec<String>,
    
    #[serde(rename = "CaseTarget")]
    pub case_target: String,
    
    #[serde(rename = "IterateClassify")]
    pub iterate_classify: bool,
    
    #[serde(rename = "ClassifyOnly")]
    pub classify_only: bool,
    
    #[serde(rename = "Cluster")]
    pub cluster: usize,
    
    #[serde(rename = "OpenDataset")]
    pub open_dataset: bool,
    
    #[serde(rename = "ExternalDatafile")]
    pub external_datafile: bool,
    
    #[serde(rename = "NewDataset")]
    pub new_dataset: bool,
    
    #[serde(rename = "DataFile")]
    pub data_file: bool,
    
    #[serde(rename = "ReadInitial")]
    pub read_initial: bool,
    
    #[serde(rename = "WriteFinal")]
    pub write_final: bool,
    
    #[serde(rename = "OpenDatasetMethod")]
    pub open_dataset_method: Option<String>,
    
    #[serde(rename = "NewData")]
    pub new_data: Option<String>,
    
    #[serde(rename = "InitialData")]
    pub initial_data: Option<String>,
    
    #[serde(rename = "FinalData")]
    pub final_data: Option<String>,
}

/// Iteration configuration for K-Means clustering.
///
/// Controls how the iterative process works, including convergence criteria.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IterateConfig {
    #[serde(rename = "MaximumIterations")]
    pub maximum_iterations: usize,
    
    #[serde(rename = "ConvergenceCriterion")]
    pub convergence_criterion: f64,
    
    #[serde(rename = "UseRunningMeans")]
    pub use_running_means: bool,
}

/// Save configuration for K-Means clustering.
///
/// Determines what additional data to save from the clustering process.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SaveConfig {
    #[serde(rename = "ClusterMembership")]
    pub cluster_membership: bool,
    
    #[serde(rename = "DistanceClusterCenter")]
    pub distance_cluster_center: bool,
}

/// Options configuration for K-Means clustering.
///
/// Additional options that affect the clustering algorithm.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptionsConfig {
    #[serde(rename = "InitialCluster")]
    pub initial_cluster: bool,
    
    #[serde(rename = "ANOVA")]
    pub anova: bool,
    
    #[serde(rename = "ClusterInfo")]
    pub cluster_info: bool,
    
    #[serde(rename = "ExcludeListWise")]
    pub exclude_list_wise: bool,
    
    #[serde(rename = "ExcludePairWise")]
    pub exclude_pair_wise: bool,
}

/// Complete set of configuration options for K-Means clustering.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TempData {
    pub main: MainConfig,
    pub iterate: IterateConfig,
    pub save: SaveConfig,
    pub options: OptionsConfig,
}
use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterConfig {
    pub main: MainConfig,
    pub iterate: IterateConfig,
    pub save: SaveConfig,
    pub options: OptionsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "TargetVar")]
    pub target_var: Option<Vec<String>>,
    #[serde(rename = "CaseTarget")]
    pub case_target: Option<String>,
    #[serde(rename = "IterateClassify")]
    pub iterate_classify: bool,
    #[serde(rename = "ClassifyOnly")]
    pub classify_only: bool,
    #[serde(rename = "Cluster")]
    pub cluster: i32,
    #[serde(rename = "ReadInitial")]
    pub read_initial: bool,
    #[serde(rename = "OpenDataset")]
    pub open_dataset: bool,
    #[serde(rename = "ExternalDatafile")]
    pub external_datafile: bool,
    #[serde(rename = "WriteFinal")]
    pub write_final: bool,
    #[serde(rename = "NewDataset")]
    pub new_dataset: bool,
    #[serde(rename = "DataFile")]
    pub data_file: bool,
    #[serde(rename = "OpenDatasetMethod")]
    pub open_dataset_method: Option<String>,
    #[serde(rename = "NewData")]
    pub new_data: Option<String>,
    #[serde(rename = "InitialData")]
    pub initial_data: Option<String>,
    #[serde(rename = "FinalData")]
    pub final_data: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct IterateConfig {
    #[serde(rename = "MaximumIterations")]
    pub maximum_iterations: i32,
    #[serde(rename = "ConvergenceCriterion")]
    pub convergence_criterion: f64,
    #[serde(rename = "UseRunningMeans")]
    pub use_running_means: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    #[serde(rename = "ClusterMembership")]
    pub cluster_membership: bool,
    #[serde(rename = "DistanceClusterCenter")]
    pub distance_cluster_center: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
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

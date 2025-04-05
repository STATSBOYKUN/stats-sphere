use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterConfig {
    pub main: MainConfig,
    pub options: OptionsConfig,
    pub output: OutputConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "CategoricalVar")]
    pub categorical_var: Option<Vec<String>>,
    #[serde(rename = "ContinousVar")]
    pub continuous_var: Option<Vec<String>>,
    #[serde(rename = "Log")]
    pub log: bool,
    #[serde(rename = "Euclidean")]
    pub euclidean: bool,
    #[serde(rename = "Auto")]
    pub auto: bool,
    #[serde(rename = "MaxCluster")]
    pub max_cluster: i32,
    #[serde(rename = "Fixed")]
    pub fixed: bool,
    #[serde(rename = "NumCluster")]
    pub num_cluster: i32,
    #[serde(rename = "Aic")]
    pub aic: bool,
    #[serde(rename = "Bic")]
    pub bic: bool,
    #[serde(rename = "ToStandardized")]
    pub to_standardized: Option<bool>,
    #[serde(rename = "AssumedStandardized")]
    pub assumed_standardized: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "SrcVar")]
    pub src_var: Option<Vec<String>>,
    #[serde(rename = "TargetVar")]
    pub target_var: Option<Vec<String>>,
    #[serde(rename = "Noise")]
    pub noise: bool,
    #[serde(rename = "NoiseCluster")]
    pub noise_cluster: i32,
    #[serde(rename = "NoiseThreshold")]
    pub noise_threshold: f64,
    #[serde(rename = "MxBranch")]
    pub mx_branch: i32,
    #[serde(rename = "MxDepth")]
    pub mx_depth: i32,
    #[serde(rename = "MemoryValue")]
    pub memory_value: i32,
    #[serde(rename = "MaxNodes")]
    pub max_nodes: i32,
    #[serde(rename = "ImportCFTree")]
    pub import_cf_tree: bool,
    #[serde(rename = "CFTreeName")]
    pub cf_tree_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OutputConfig {
    #[serde(rename = "SrcVar")]
    pub src_var: Option<Vec<String>>,
    #[serde(rename = "TargetVar")]
    pub target_var: Option<Vec<String>>,
    #[serde(rename = "PivotTable")]
    pub pivot_table: bool,
    #[serde(rename = "ChartTable")]
    pub chart_table: bool,
    #[serde(rename = "ClustVar")]
    pub clust_var: bool,
    #[serde(rename = "ExportModel")]
    pub export_model: bool,
    #[serde(rename = "ExportCFTree")]
    pub export_cf_tree: bool,
    #[serde(rename = "ModelName")]
    pub model_name: Option<String>,
    #[serde(rename = "CFTreeName")]
    pub cf_tree_name: Option<String>,
}

use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KnnConfig {
    pub main: MainConfig,
    pub neighbors: NeighborsConfig,
    pub features: FeaturesConfig,
    pub partition: PartitionConfig,
    pub save: SaveConfig,
    pub output: OutputConfig,
    pub options: OptionsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "DepVar")]
    pub dep_var: Option<String>,
    #[serde(rename = "FeatureVar")]
    pub feature_var: Option<Vec<String>>,
    #[serde(rename = "CaseIdenVar")]
    pub case_iden_var: Option<String>,
    #[serde(rename = "FocalCaseIdenVar")]
    pub focal_case_iden_var: Option<String>,
    #[serde(rename = "NormCovar")]
    pub norm_covar: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NeighborsConfig {
    #[serde(rename = "Specify")]
    pub specify: bool,
    #[serde(rename = "AutoSelection")]
    pub auto_selection: bool,
    #[serde(rename = "SpecifyK")]
    pub specify_k: i32,
    #[serde(rename = "MinK")]
    pub min_k: i32,
    #[serde(rename = "MaxK")]
    pub max_k: i32,
    #[serde(rename = "MetricEucli")]
    pub metric_eucli: bool,
    #[serde(rename = "MetricManhattan")]
    pub metric_manhattan: bool,
    #[serde(rename = "Weight")]
    pub weight: bool,
    #[serde(rename = "PredictionsMean")]
    pub predictions_mean: bool,
    #[serde(rename = "PredictionsMedian")]
    pub predictions_median: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FeaturesConfig {
    #[serde(rename = "ForwardSelection")]
    pub forward_selection: Option<Vec<String>>,
    #[serde(rename = "ForcedEntryVar")]
    pub forced_entry_var: Option<Vec<String>>,
    #[serde(rename = "FeaturesToEvaluate")]
    pub features_to_evaluate: i32,
    #[serde(rename = "ForcedFeatures")]
    pub forced_features: i32,
    #[serde(rename = "PerformSelection")]
    pub perform_selection: bool,
    #[serde(rename = "MaxReached")]
    pub max_reached: bool,
    #[serde(rename = "BelowMin")]
    pub below_min: bool,
    #[serde(rename = "MaxToSelect")]
    pub max_to_select: Option<i32>,
    #[serde(rename = "MinChange")]
    pub min_change: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PartitionConfig {
    #[serde(rename = "SrcVar")]
    pub src_var: Option<Vec<String>>,
    #[serde(rename = "PartitioningVariable")]
    pub partitioning_variable: Option<String>,
    #[serde(rename = "UseRandomly")]
    pub use_randomly: bool,
    #[serde(rename = "UseVariable")]
    pub use_variable: bool,
    #[serde(rename = "VFoldPartitioningVariable")]
    pub v_fold_partitioning_variable: Option<String>,
    #[serde(rename = "VFoldUseRandomly")]
    pub v_fold_use_randomly: bool,
    #[serde(rename = "VFoldUsePartitioningVar")]
    pub v_fold_use_partitioning_var: bool,
    #[serde(rename = "TrainingNumber")]
    pub training_number: i32,
    #[serde(rename = "NumPartition")]
    pub num_partition: i32,
    #[serde(rename = "SetSeed")]
    pub set_seed: bool,
    #[serde(rename = "Seed")]
    pub seed: Option<i64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    #[serde(rename = "AutoName")]
    pub auto_name: bool,
    #[serde(rename = "CustomName")]
    pub custom_name: bool,
    #[serde(rename = "MaxCatsToSave")]
    pub max_cats_to_save: Option<i32>,
    #[serde(rename = "HasTargetVar")]
    pub has_target_var: bool,
    #[serde(rename = "IsCateTargetVar")]
    pub is_cate_target_var: bool,
    #[serde(rename = "RandomAssignToPartition")]
    pub random_assign_to_partition: bool,
    #[serde(rename = "RandomAssignToFold")]
    pub random_assign_to_fold: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OutputConfig {
    #[serde(rename = "CaseSummary")]
    pub case_summary: bool,
    #[serde(rename = "ChartAndTable")]
    pub chart_and_table: bool,
    #[serde(rename = "ExportModelXML")]
    pub export_model_xml: bool,
    #[serde(rename = "XMLFilePath")]
    pub xml_file_path: Option<String>,
    #[serde(rename = "ExportDistance")]
    pub export_distance: bool,
    #[serde(rename = "CreateDataset")]
    pub create_dataset: bool,
    #[serde(rename = "WriteDataFile")]
    pub write_data_file: bool,
    #[serde(rename = "NewDataFilePath")]
    pub new_data_file_path: Option<String>,
    #[serde(rename = "DatasetName")]
    pub dataset_name: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "Exclude")]
    pub exclude: bool,
    #[serde(rename = "Include")]
    pub include: bool,
}

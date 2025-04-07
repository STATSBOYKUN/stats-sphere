use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CATPCAConfig {
    pub main: MainConfig,
    #[serde(rename = "defineRangeScale")]
    pub define_range_scale: DefineRangeScaleConfig,
    #[serde(rename = "defineScale")]
    pub define_scale: DefineScaleConfig,
    pub discretize: DiscretizeConfig,
    pub missing: MissingConfig,
    pub options: OptionsConfig,
    pub output: OutputConfig,
    pub save: SaveConfig,
    pub bootstrap: BootstrapConfig,
    #[serde(rename = "objectPlots")]
    pub object_plots: ObjectPlotsConfig,
    #[serde(rename = "categoryPlots")]
    pub category_plots: CategoryPlotsConfig,
    #[serde(rename = "loadingPlots")]
    pub loading_plots: LoadingPlotsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "AnalysisVars")]
    pub analysis_vars: Option<Vec<String>>,
    #[serde(rename = "SuppleVars")]
    pub supple_vars: Option<Vec<String>>,
    #[serde(rename = "LabelingVars")]
    pub labeling_vars: Option<Vec<String>>,
    pub dimensions: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineRangeScaleConfig {
    pub weight: f64,
    #[serde(rename = "SplineOrdinal")]
    pub spline_ordinal: bool,
    #[serde(rename = "SplineNominal")]
    pub spline_nominal: bool,
    #[serde(rename = "MultipleNominal")]
    pub multiple_nominal: bool,
    pub ordinal: bool,
    pub nominal: bool,
    pub numeric: bool,
    pub degree: i32,
    #[serde(rename = "InteriorKnots")]
    pub interior_knots: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineScaleConfig {
    #[serde(rename = "SplineOrdinal")]
    pub spline_ordinal: bool,
    #[serde(rename = "SplineNominal")]
    pub spline_nominal: bool,
    #[serde(rename = "MultipleNominal")]
    pub multiple_nominal: bool,
    pub ordinal: bool,
    pub nominal: bool,
    pub numeric: bool,
    pub degree: i32,
    #[serde(rename = "InteriorKnots")]
    pub interior_knots: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscretizeConfig {
    #[serde(rename = "VariablesList")]
    pub variables_list: Option<Vec<String>>,
    pub method: DiscretizeMethod,
    #[serde(rename = "NumberOfCategories")]
    pub number_of_categories: bool,
    #[serde(rename = "NumberOfCategoriesValue")]
    pub number_of_categories_value: i32,
    #[serde(rename = "DistributionNormal")]
    pub distribution_normal: bool,
    #[serde(rename = "DistributionUniform")]
    pub distribution_uniform: bool,
    #[serde(rename = "EqualIntervals")]
    pub equal_intervals: bool,
    #[serde(rename = "EqualIntervalsValue")]
    pub equal_intervals_value: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum DiscretizeMethod {
    #[serde(rename = "Grouping")]
    Grouping,
    #[serde(rename = "Unspecified")]
    Unspecified,
    #[serde(rename = "Ranking")]
    Ranking,
    #[serde(rename = "Multiplying")]
    Multiplying,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MissingConfig {
    #[serde(rename = "CurrentTargetList")]
    pub current_target_list: Option<Vec<String>>,
    #[serde(rename = "AnalysisVariables")]
    pub analysis_variables: Option<Vec<String>>,
    #[serde(rename = "SupplementaryVariables")]
    pub supplementary_variables: Option<Vec<String>>,
    #[serde(rename = "MissingValuesExclude")]
    pub missing_values_exclude: bool,
    #[serde(rename = "ExcludeMode")]
    pub exclude_mode: bool,
    #[serde(rename = "ExcludeExtraCat")]
    pub exclude_extra_cat: bool,
    #[serde(rename = "ExcludeRandomCat")]
    pub exclude_random_cat: bool,
    #[serde(rename = "MissingValuesImpute")]
    pub missing_values_impute: bool,
    #[serde(rename = "ImputeMode")]
    pub impute_mode: bool,
    #[serde(rename = "ImputeExtraCat")]
    pub impute_extra_cat: bool,
    #[serde(rename = "ImputeRandomCat")]
    pub impute_random_cat: bool,
    #[serde(rename = "ExcludeObjects")]
    pub exclude_objects: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "RangeOfCases")]
    pub range_of_cases: bool,
    pub first: Option<i32>,
    pub last: Option<i32>,
    #[serde(rename = "SingleCase")]
    pub single_case: bool,
    #[serde(rename = "SingleCaseValue")]
    pub single_case_value: Option<i32>,
    #[serde(rename = "NormalizationMethod")]
    pub normalization_method: NormalizationMethod,
    #[serde(rename = "NormCustomValue")]
    pub norm_custom_value: Option<f64>,
    pub convergence: f64,
    #[serde(rename = "MaximumIterations")]
    pub maximum_iterations: i32,
    #[serde(rename = "VariableLabels")]
    pub variable_labels: bool,
    #[serde(rename = "LimitForLabel")]
    pub limit_for_label: i32,
    #[serde(rename = "VariableNames")]
    pub variable_names: bool,
    #[serde(rename = "PlotDimDisplayAll")]
    pub plot_dim_display_all: bool,
    #[serde(rename = "PlotDimRestrict")]
    pub plot_dim_restrict: bool,
    #[serde(rename = "PlotDimLoDim")]
    pub plot_dim_lo_dim: Option<i32>,
    #[serde(rename = "PlotDimHiDim")]
    pub plot_dim_hi_dim: Option<i32>,
    #[serde(rename = "ConfigurationMethod")]
    pub configuration_method: ConfigurationMethod,
    #[serde(rename = "ConfigFile")]
    pub config_file: Option<String>,
    pub none: bool,
    pub varimax: bool,
    pub oblimin: bool,
    pub delta: f64,
    pub quartimax: bool,
    pub equimax: bool,
    pub promax: bool,
    pub kappa: i32,
    pub kaiser: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum NormalizationMethod {
    #[serde(rename = "VariablePrincipal")]
    VariablePrincipal,
    #[serde(rename = "ObjectPrincipal")]
    ObjectPrincipal,
    #[serde(rename = "Symmetrical")]
    Symmetrical,
    #[serde(rename = "Independent")]
    Independent,
    #[serde(rename = "Custom")]
    Custom,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ConfigurationMethod {
    #[serde(rename = "None")]
    None,
    #[serde(rename = "Inital")]
    Initial,
    #[serde(rename = "Fixed")]
    Fixed,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OutputConfig {
    #[serde(rename = "QuantifiedVars")]
    pub quantified_vars: Vec<String>,
    #[serde(rename = "LabelingVars")]
    pub labeling_vars: Option<Vec<String>>,
    #[serde(rename = "CatQuantifications")]
    pub cat_quantifications: Option<Vec<String>>,
    #[serde(rename = "DescStats")]
    pub desc_stats: Option<Vec<String>>,
    #[serde(rename = "ObjScoresIncludeCat")]
    pub obj_scores_include_cat: Option<Vec<String>>,
    #[serde(rename = "ObjScoresLabelBy")]
    pub obj_scores_label_by: Option<Vec<String>>,
    #[serde(rename = "ObjectScores")]
    pub object_scores: bool,
    #[serde(rename = "CorreOriginalVars")]
    pub corre_original_vars: bool,
    #[serde(rename = "ComponentLoadings")]
    pub component_loadings: bool,
    #[serde(rename = "CorreTransVars")]
    pub corre_trans_vars: bool,
    #[serde(rename = "SortBySize")]
    pub sort_by_size: bool,
    #[serde(rename = "IterationHistory")]
    pub iteration_history: bool,
    pub variance: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    pub discretized: bool,
    #[serde(rename = "DiscNewdata")]
    pub disc_newdata: bool,
    #[serde(rename = "DiscDataset")]
    pub disc_dataset: Option<String>,
    #[serde(rename = "DiscWriteNewdata")]
    pub disc_write_newdata: bool,
    #[serde(rename = "DiscretizedFile")]
    pub discretized_file: Option<String>,
    #[serde(rename = "SaveTrans")]
    pub save_trans: bool,
    pub trans: bool,
    #[serde(rename = "TransNewdata")]
    pub trans_newdata: bool,
    #[serde(rename = "TransDataset")]
    pub trans_dataset: Option<String>,
    #[serde(rename = "TransWriteNewdata")]
    pub trans_write_newdata: bool,
    #[serde(rename = "TransformedFile")]
    pub transformed_file: Option<String>,
    #[serde(rename = "SaveObjScores")]
    pub save_obj_scores: bool,
    #[serde(rename = "ObjScores")]
    pub obj_scores: bool,
    #[serde(rename = "ObjNewdata")]
    pub obj_newdata: bool,
    #[serde(rename = "ObjDataset")]
    pub obj_dataset: Option<String>,
    #[serde(rename = "ObjWriteNewdata")]
    pub obj_write_newdata: bool,
    #[serde(rename = "ObjScoresFile")]
    pub obj_scores_file: Option<String>,
    #[serde(rename = "SaveApprox")]
    pub save_approx: bool,
    pub approx: bool,
    #[serde(rename = "ApproxNewdata")]
    pub approx_newdata: bool,
    #[serde(rename = "ApproxDataset")]
    pub approx_dataset: Option<String>,
    #[serde(rename = "ApproxWriteNewdata")]
    pub approx_write_newdata: bool,
    #[serde(rename = "ApproximationsFile")]
    pub approximations_file: Option<String>,
    #[serde(rename = "BTLoading")]
    pub bt_loading: bool,
    #[serde(rename = "BTObject")]
    pub bt_object: bool,
    #[serde(rename = "BTCategories")]
    pub bt_categories: bool,
    #[serde(rename = "BTEllipseCoord")]
    pub bt_ellipse_coord: bool,
    #[serde(rename = "BTNewDataset")]
    pub bt_new_dataset: bool,
    #[serde(rename = "BTDatasetName")]
    pub bt_dataset_name: Option<String>,
    #[serde(rename = "BTWriteDataFile")]
    pub bt_write_data_file: bool,
    #[serde(rename = "BTFileText")]
    pub bt_file_text: Option<String>,
    pub all: bool,
    pub first: bool,
    #[serde(rename = "MultiNomDim")]
    pub multi_nom_dim: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BootstrapConfig {
    #[serde(rename = "PerformBT")]
    pub perform_bt: bool,
    pub balanced: bool,
    pub unbalanced: bool,
    #[serde(rename = "NumberSamples")]
    pub number_samples: i32,
    #[serde(rename = "ConfLevel")]
    pub conf_level: i32,
    pub procrustes: bool,
    pub reflection: bool,
    #[serde(rename = "ThresholdLoading")]
    pub threshold_loading: BootstrapMethod,
    #[serde(rename = "ThresholdObject")]
    pub threshold_object: BootstrapMethod,
    #[serde(rename = "ThresholdCategory")]
    pub threshold_category: BootstrapMethod,
    #[serde(rename = "OperatorLoading")]
    pub operator_loading: OperatorMethod,
    #[serde(rename = "OperatorObject")]
    pub operator_object: OperatorMethod,
    #[serde(rename = "OperatorCategory")]
    pub operator_category: OperatorMethod,
    #[serde(rename = "ValueLoading")]
    pub value_loading: f64,
    #[serde(rename = "ValueObject")]
    pub value_object: i32,
    #[serde(rename = "ValueCategory")]
    pub value_category: i32,
    #[serde(rename = "NumberPoints")]
    pub number_points: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BootstrapMethod {
    #[serde(rename = "Area")]
    Area,
    #[serde(rename = "MeanNStdDev")]
    MeanNStdDev,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum OperatorMethod {
    #[serde(rename = "Greater")]
    Greater,
    #[serde(rename = "Lower")]
    Lower,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectPlotsConfig {
    #[serde(rename = "ObjectPoints")]
    pub object_points: bool,
    pub biplot: bool,
    #[serde(rename = "BiLoadings")]
    pub bi_loadings: bool,
    #[serde(rename = "BiCentroids")]
    pub bi_centroids: bool,
    pub triplot: bool,
    #[serde(rename = "BTIncludeAllVars")]
    pub bt_include_all_vars: bool,
    #[serde(rename = "BTIncludeSelectedVars")]
    pub bt_include_selected_vars: bool,
    #[serde(rename = "BTAvailableVars")]
    pub bt_available_vars: Vec<String>,
    #[serde(rename = "BTSelectedVars")]
    pub bt_selected_vars: Option<Vec<String>>,
    #[serde(rename = "LabelObjLabelByCaseNumber")]
    pub label_obj_label_by_case_number: bool,
    #[serde(rename = "LabelObjLabelByVar")]
    pub label_obj_label_by_var: bool,
    #[serde(rename = "LabelObjAvailableVars")]
    pub label_obj_available_vars: Option<Vec<String>>,
    #[serde(rename = "LabelObjSelectedVars")]
    pub label_obj_selected_vars: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoryPlotsConfig {
    #[serde(rename = "SourceVar")]
    pub source_var: Vec<String>,
    #[serde(rename = "CatPlotsVar")]
    pub cat_plots_var: Option<Vec<String>>,
    #[serde(rename = "JointCatPlotsVar")]
    pub joint_cat_plots_var: Option<Vec<String>>,
    #[serde(rename = "TransPlotsVar")]
    pub trans_plots_var: Option<Vec<String>>,
    #[serde(rename = "DimensionsForMultiNom")]
    pub dimensions_for_multi_nom: i32,
    #[serde(rename = "InclResidPlots")]
    pub incl_resid_plots: bool,
    #[serde(rename = "PrjCentroidsOfVar")]
    pub prj_centroids_of_var: Option<Vec<String>>,
    #[serde(rename = "PrjCentroidsOntoVar")]
    pub prj_centroids_onto_var: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LoadingPlotsConfig {
    pub variance: bool,
    #[serde(rename = "DisplayCompLoadings")]
    pub display_comp_loadings: bool,
    #[serde(rename = "LoadingIncludeAllVars")]
    pub loading_include_all_vars: bool,
    #[serde(rename = "LoadingIncludeSelectedVars")]
    pub loading_include_selected_vars: bool,
    #[serde(rename = "LoadingAvailableVars")]
    pub loading_available_vars: Vec<String>,
    #[serde(rename = "LoadingSelectedVars")]
    pub loading_selected_vars: Option<Vec<String>>,
    #[serde(rename = "IncludeCentroids")]
    pub include_centroids: bool,
    #[serde(rename = "IncludeCentroidsIncludeAllVars")]
    pub include_centroids_include_all_vars: bool,
    #[serde(rename = "IncludeCentroidsIncludeSelectedVars")]
    pub include_centroids_include_selected_vars: bool,
    #[serde(rename = "IncludeCentroidsAvailableVars")]
    pub include_centroids_available_vars: Vec<String>,
    #[serde(rename = "IncludeCentroidsSelectedVars")]
    pub include_centroids_selected_vars: Option<Vec<String>>,
}

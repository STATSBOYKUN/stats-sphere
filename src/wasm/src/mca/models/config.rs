use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MCAConfig {
    pub main: MainConfig,
    #[serde(rename = "defineVariable")]
    pub define_variable: DefineVariableConfig,
    pub discretize: DiscretizeConfig,
    pub missing: MissingConfig,
    pub options: OptionsConfig,
    pub output: OutputConfig,
    pub save: SaveConfig,
    #[serde(rename = "objectPlots")]
    pub object_plots: ObjectPlotsConfig,
    #[serde(rename = "variablePlots")]
    pub variable_plots: VariablePlotsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "AnalysisVars")]
    pub analysis_vars: Option<Vec<String>>,
    #[serde(rename = "SuppleVars")]
    pub supple_vars: Option<Vec<String>>,
    #[serde(rename = "LabelingVars")]
    pub labeling_vars: Option<Vec<String>>,
    pub dimensions: u8,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineVariableConfig {
    #[serde(rename = "VariableWeight")]
    pub variable_weight: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscretizeConfig {
    #[serde(rename = "VariablesList")]
    pub variables_list: Option<Vec<String>>,
    #[serde(rename = "Method")]
    pub method: DiscretizeMethod,
    #[serde(rename = "NumberOfCategories")]
    pub number_of_categories: bool,
    #[serde(rename = "NumberOfCategoriesValue")]
    pub number_of_categories_value: u8,
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
    pub first: Option<u32>,
    pub last: Option<u32>,
    #[serde(rename = "SingleCase")]
    pub single_case: bool,
    #[serde(rename = "SingleCaseValue")]
    pub single_case_value: Option<u32>,
    #[serde(rename = "NormalizationMethod")]
    pub normalization_method: NormalizationMethod,
    #[serde(rename = "NormCustomValue")]
    pub norm_custom_value: Option<f64>,
    pub convergence: f64,
    #[serde(rename = "MaximumIterations")]
    pub maximum_iterations: u32,
    #[serde(rename = "VariableLabels")]
    pub variable_labels: bool,
    #[serde(rename = "LimitForLabel")]
    pub limit_for_label: u8,
    #[serde(rename = "VariableNames")]
    pub variable_names: bool,
    #[serde(rename = "PlotDimDisplayAll")]
    pub plot_dim_display_all: bool,
    #[serde(rename = "PlotDimRestrict")]
    pub plot_dim_restrict: bool,
    #[serde(rename = "PlotDimLoDim")]
    pub plot_dim_lo_dim: Option<u8>,
    #[serde(rename = "PlotDimHiDim")]
    pub plot_dim_hi_dim: Option<u8>,
    #[serde(rename = "ConfigurationMethod")]
    pub configuration_method: ConfigurationMethod,
    #[serde(rename = "ConfigFile")]
    pub config_file: Option<String>,
    pub none: bool,
    pub varimax: bool,
    pub oblimin: bool,
    #[serde(rename = "DeltaFloat")]
    pub delta_float: f64,
    pub quartimax: bool,
    pub equimax: bool,
    pub promax: bool,
    #[serde(rename = "KappaFloat")]
    pub kappa_float: u8,
    pub kaiser: bool,
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
    #[serde(rename = "DiscMeasures")]
    pub disc_measures: bool,
    #[serde(rename = "IterationHistory")]
    pub iteration_history: bool,
    #[serde(rename = "CorreOriginalVars")]
    pub corre_original_vars: bool,
    #[serde(rename = "CorreTransVars")]
    pub corre_trans_vars: bool,
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
    pub all: bool,
    pub first: bool,
    #[serde(rename = "MultiNomDim")]
    pub multi_nom_dim: Option<u8>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ObjectPlotsConfig {
    #[serde(rename = "ObjectPoints")]
    pub object_points: bool,
    pub biplot: bool,
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
pub struct VariablePlotsConfig {
    #[serde(rename = "DimensionsForMultiNom")]
    pub dimensions_for_multi_nom: u8,
    #[serde(rename = "SourceVar")]
    pub source_var: Vec<String>,
    #[serde(rename = "CatPlotsVar")]
    pub cat_plots_var: Option<Vec<String>>,
    #[serde(rename = "JointCatPlotsVar")]
    pub joint_cat_plots_var: Option<Vec<String>>,
    #[serde(rename = "TransPlotsVar")]
    pub trans_plots_var: Option<Vec<String>>,
    #[serde(rename = "InclResidPlots")]
    pub incl_resid_plots: bool,
    #[serde(rename = "DiscMeasuresVar")]
    pub disc_measures_var: Option<Vec<String>>,
    #[serde(rename = "DisplayPlot")]
    pub display_plot: bool,
    #[serde(rename = "UseAllVars")]
    pub use_all_vars: bool,
    #[serde(rename = "UseSelectedVars")]
    pub use_selected_vars: bool,
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

use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnivariateConfig {
    pub main: MainConfig,
    pub model: ModelDetails,
    pub contrast: ContrastConfig,
    pub plots: PlotsConfig,
    pub posthoc: PosthocConfig,
    pub emmeans: EmmmeansConfig,
    pub save: SaveConfig,
    pub options: OptionsConfig,
    pub bootstrap: BootstrapConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BuildTermMethod {
    #[serde(rename = "interaction")]
    Interaction,
    #[serde(rename = "mainEffects")]
    MainEffects,
    #[serde(rename = "all2Way")]
    All2Way,
    #[serde(rename = "all3Way")]
    All3Way,
    #[serde(rename = "all4Way")]
    All4Way,
    #[serde(rename = "all5Way")]
    All5Way,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SumOfSquaresMethod {
    #[serde(rename = "typeI")]
    TypeI,
    #[serde(rename = "typeII")]
    TypeII,
    #[serde(rename = "typeIII")]
    TypeIII,
    #[serde(rename = "typeIV")]
    TypeIV,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ContrastMethod {
    #[serde(rename = "none")]
    None,
    #[serde(rename = "deviation")]
    Deviation,
    #[serde(rename = "simple")]
    Simple,
    #[serde(rename = "difference")]
    Difference,
    #[serde(rename = "helmert")]
    Helmert,
    #[serde(rename = "repeated")]
    Repeated,
    #[serde(rename = "polynomial")]
    Polynomial,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CategoryMethod {
    #[serde(rename = "last")]
    Last,
    #[serde(rename = "first")]
    First,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CIMethod {
    #[serde(rename = "lsdNone")]
    LsdNone,
    #[serde(rename = "bonferroni")]
    Bonferroni,
    #[serde(rename = "sidak")]
    Sidak,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "DepVar")]
    pub dep_var: Option<String>,
    #[serde(rename = "FixFactor")]
    pub fix_factor: Option<Vec<String>>,
    #[serde(rename = "RandFactor")]
    pub rand_factor: Option<Vec<String>>,
    #[serde(rename = "Covar")]
    pub covar: Option<Vec<String>>,
    #[serde(rename = "WlsWeight")]
    pub wls_weight: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelDetails {
    #[serde(rename = "NonCust")]
    pub non_cust: bool,
    #[serde(rename = "Custom")]
    pub custom: bool,
    #[serde(rename = "BuildCustomTerm")]
    pub build_custom_term: bool,
    #[serde(rename = "FactorsVar")]
    pub factors_var: Vec<String>,
    #[serde(rename = "TermsVar")]
    pub terms_var: Option<String>,
    #[serde(rename = "FactorsModel")]
    pub factors_model: Option<String>,
    #[serde(rename = "CovModel")]
    pub cov_model: Option<String>,
    #[serde(rename = "RandomModel")]
    pub random_model: Option<String>,
    #[serde(rename = "BuildTermMethod")]
    pub build_term_method: BuildTermMethod,
    #[serde(rename = "TermText")]
    pub term_text: Option<String>,
    #[serde(rename = "SumOfSquareMethod")]
    pub sum_of_square_method: SumOfSquaresMethod,
    #[serde(rename = "Intercept")]
    pub intercept: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContrastConfig {
    #[serde(rename = "FactorList")]
    pub factor_list: Vec<String>,
    #[serde(rename = "ContrastMethod")]
    pub contrast_method: ContrastMethod,
    #[serde(rename = "Last")]
    pub last: bool,
    #[serde(rename = "First")]
    pub first: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlotsConfig {
    #[serde(rename = "SrcList")]
    pub src_list: Vec<String>,
    #[serde(rename = "AxisList")]
    pub axis_list: Option<Vec<String>>,
    #[serde(rename = "LineList")]
    pub line_list: Option<Vec<String>>,
    #[serde(rename = "PlotList")]
    pub plot_list: Option<Vec<String>>,
    #[serde(rename = "FixFactorVars")]
    pub fix_factor_vars: Option<Vec<String>>,
    #[serde(rename = "RandFactorVars")]
    pub rand_factor_vars: Option<Vec<String>>,
    #[serde(rename = "LineChartType")]
    pub line_chart_type: bool,
    #[serde(rename = "BarChartType")]
    pub bar_chart_type: bool,
    #[serde(rename = "IncludeErrorBars")]
    pub include_error_bars: bool,
    #[serde(rename = "ConfidenceInterval")]
    pub confidence_interval: bool,
    #[serde(rename = "StandardError")]
    pub standard_error: bool,
    #[serde(rename = "Multiplier")]
    pub multiplier: i32,
    #[serde(rename = "IncludeRefLineForGrandMean")]
    pub include_ref_line_for_grand_mean: bool,
    #[serde(rename = "YAxisStart0")]
    pub y_axis_start_0: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PosthocConfig {
    #[serde(rename = "SrcList")]
    pub src_list: Option<Vec<String>>,
    #[serde(rename = "FixFactorVars")]
    pub fix_factor_vars: Option<Vec<String>>,
    #[serde(rename = "ErrorRatio")]
    pub error_ratio: i32,
    #[serde(rename = "Twosided")]
    pub twosided: bool,
    #[serde(rename = "LtControl")]
    pub lt_control: bool,
    #[serde(rename = "GtControl")]
    pub gt_control: bool,
    #[serde(rename = "CategoryMethod")]
    pub category_method: CategoryMethod,
    #[serde(rename = "Waller")]
    pub waller: bool,
    #[serde(rename = "Dunnett")]
    pub dunnett: bool,
    #[serde(rename = "Lsd")]
    pub lsd: bool,
    #[serde(rename = "Bonfe")]
    pub bonfe: bool,
    #[serde(rename = "Sidak")]
    pub sidak: bool,
    #[serde(rename = "Scheffe")]
    pub scheffe: bool,
    #[serde(rename = "Regwf")]
    pub regwf: bool,
    #[serde(rename = "Regwq")]
    pub regwq: bool,
    #[serde(rename = "Snk")]
    pub snk: bool,
    #[serde(rename = "Tu")]
    pub tu: bool,
    #[serde(rename = "Tub")]
    pub tub: bool,
    #[serde(rename = "Dun")]
    pub dun: bool,
    #[serde(rename = "Hoc")]
    pub hoc: bool,
    #[serde(rename = "Gabriel")]
    pub gabriel: bool,
    #[serde(rename = "Tam")]
    pub tam: bool,
    #[serde(rename = "Dunt")]
    pub dunt: bool,
    #[serde(rename = "Games")]
    pub games: bool,
    #[serde(rename = "Dunc")]
    pub dunc: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct EmmmeansConfig {
    #[serde(rename = "SrcList")]
    pub src_list: Vec<String>,
    #[serde(rename = "TargetList")]
    pub target_list: Option<Vec<String>>,
    #[serde(rename = "CompMainEffect")]
    pub comp_main_effect: bool,
    #[serde(rename = "ConfiIntervalMethod")]
    pub confi_interval_method: CIMethod,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    #[serde(rename = "ResWeighted")]
    pub res_weighted: bool,
    #[serde(rename = "PreWeighted")]
    pub pre_weighted: bool,
    #[serde(rename = "StdStatistics")]
    pub std_statistics: bool,
    #[serde(rename = "CooksD")]
    pub cooks_d: bool,
    #[serde(rename = "Leverage")]
    pub leverage: bool,
    #[serde(rename = "UnstandardizedRes")]
    pub unstandardized_res: bool,
    #[serde(rename = "WeightedRes")]
    pub weighted_res: bool,
    #[serde(rename = "StandardizedRes")]
    pub standardized_res: bool,
    #[serde(rename = "StudentizedRes")]
    pub studentized_res: bool,
    #[serde(rename = "DeletedRes")]
    pub deleted_res: bool,
    #[serde(rename = "CoeffStats")]
    pub coeff_stats: bool,
    #[serde(rename = "StandardStats")]
    pub standard_stats: bool,
    #[serde(rename = "Heteroscedasticity")]
    pub heteroscedasticity: bool,
    #[serde(rename = "NewDataSet")]
    pub new_dataset: bool,
    #[serde(rename = "FilePath")]
    pub file_path: Option<String>,
    #[serde(rename = "DatasetName")]
    pub dataset_name: Option<String>,
    #[serde(rename = "WriteNewDataSet")]
    pub write_new_dataset: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "DescStats")]
    pub desc_stats: bool,
    #[serde(rename = "HomogenTest")]
    pub homogen_test: bool,
    #[serde(rename = "EstEffectSize")]
    pub est_effect_size: bool,
    #[serde(rename = "SprVsLevel")]
    pub spr_vs_level: bool,
    #[serde(rename = "ObsPower")]
    pub obs_power: bool,
    #[serde(rename = "ResPlot")]
    pub res_plot: bool,
    #[serde(rename = "ParamEst")]
    pub param_est: bool,
    #[serde(rename = "LackOfFit")]
    pub lack_of_fit: bool,
    #[serde(rename = "TransformMat")]
    pub transform_mat: bool,
    #[serde(rename = "GeneralFun")]
    pub general_fun: bool,
    #[serde(rename = "ModBruschPagan")]
    pub mod_brusch_pagan: bool,
    #[serde(rename = "FTest")]
    pub f_test: bool,
    #[serde(rename = "BruschPagan")]
    pub brusch_pagan: bool,
    #[serde(rename = "WhiteTest")]
    pub white_test: bool,
    #[serde(rename = "ParamEstRobStdErr")]
    pub param_est_rob_std_err: bool,
    #[serde(rename = "HC0")]
    pub hc0: bool,
    #[serde(rename = "HC1")]
    pub hc1: bool,
    #[serde(rename = "HC2")]
    pub hc2: bool,
    #[serde(rename = "HC3")]
    pub hc3: bool,
    #[serde(rename = "HC4")]
    pub hc4: bool,
    #[serde(rename = "CoefficientMatrix")]
    pub coefficient_matrix: bool,
    #[serde(rename = "SigLevel")]
    pub sig_level: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BootstrapConfig {
    #[serde(rename = "PerformBootStrapping")]
    pub perform_boot_strapping: bool,
    #[serde(rename = "NumOfSamples")]
    pub num_of_samples: i32,
    #[serde(rename = "Seed")]
    pub seed: bool,
    #[serde(rename = "SeedValue")]
    pub seed_value: i32,
    #[serde(rename = "Level")]
    pub level: f64,
    #[serde(rename = "Percentile")]
    pub percentile: bool,
    #[serde(rename = "BCa")]
    pub bca: bool,
    #[serde(rename = "Simple")]
    pub simple: bool,
    #[serde(rename = "Stratified")]
    pub stratified: bool,
    #[serde(rename = "Variables")]
    pub variables: Vec<String>,
    #[serde(rename = "StrataVariables")]
    pub strata_variables: Option<Vec<String>>,
}

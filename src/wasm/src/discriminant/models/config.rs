use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DiscriminantConfig {
    pub main: MainConfig,
    #[serde(rename = "defineRange")]
    pub define_range: DefineRangeConfig,
    #[serde(rename = "setValue")]
    pub set_value: SetValueConfig,
    pub statistics: StatisticsConfig,
    pub method: MethodConfig,
    pub classify: ClassifyConfig,
    pub save: SaveConfig,
    pub bootstrap: BootstrapConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "GroupingVariable")]
    pub grouping_variable: String,
    #[serde(rename = "IndependentVariables")]
    pub independent_variables: Vec<String>,
    #[serde(rename = "Together")]
    pub together: bool,
    #[serde(rename = "Stepwise")]
    pub stepwise: bool,
    #[serde(rename = "SelectionVariable")]
    pub selection_variable: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineRangeConfig {
    #[serde(rename = "minRange")]
    pub min_range: Option<f64>,
    #[serde(rename = "maxRange")]
    pub max_range: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SetValueConfig {
    #[serde(rename = "Value")]
    pub value: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatisticsConfig {
    #[serde(rename = "Means")]
    pub means: bool,
    #[serde(rename = "ANOVA")]
    pub anova: bool,
    #[serde(rename = "BoxM")]
    pub box_m: bool,
    #[serde(rename = "Fisher")]
    pub fisher: bool,
    #[serde(rename = "Unstandardized")]
    pub unstandardized: bool,
    #[serde(rename = "WGCorrelation")]
    pub wg_correlation: bool,
    #[serde(rename = "WGCovariance")]
    pub wg_covariance: bool,
    #[serde(rename = "SGCovariance")]
    pub sg_covariance: bool,
    #[serde(rename = "TotalCovariance")]
    pub total_covariance: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MethodConfig {
    #[serde(rename = "Wilks")]
    pub wilks: bool,
    #[serde(rename = "Unexplained")]
    pub unexplained: bool,
    #[serde(rename = "Mahalonobis")]
    pub mahalonobis: bool,
    #[serde(rename = "FRatio")]
    pub f_ratio: bool,
    #[serde(rename = "Raos")]
    pub raos: bool,
    #[serde(rename = "FValue")]
    pub f_value: bool,
    #[serde(rename = "FProbability")]
    pub f_probability: bool,
    #[serde(rename = "Summary")]
    pub summary: bool,
    #[serde(rename = "Pairwise")]
    pub pairwise: bool,
    #[serde(rename = "VEnter")]
    pub v_enter: f64,
    #[serde(rename = "FEntry")]
    pub f_entry: f64,
    #[serde(rename = "FRemoval")]
    pub f_removal: f64,
    #[serde(rename = "PEntry")]
    pub p_entry: f64,
    #[serde(rename = "PRemoval")]
    pub p_removal: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClassifyConfig {
    #[serde(rename = "AllGroupEqual")]
    pub all_group_equal: bool,
    #[serde(rename = "GroupSize")]
    pub group_size: bool,
    #[serde(rename = "WithinGroup")]
    pub within_group: bool,
    #[serde(rename = "SepGroup")]
    pub sep_group: bool,
    #[serde(rename = "Case")]
    pub case: bool,
    #[serde(rename = "Limit")]
    pub limit: bool,
    #[serde(rename = "LimitValue")]
    pub limit_value: Option<i32>,
    #[serde(rename = "Summary")]
    pub summary: bool,
    #[serde(rename = "Leave")]
    pub leave: bool,
    #[serde(rename = "Combine")]
    pub combine: bool,
    #[serde(rename = "SepGrp")]
    pub sep_grp: bool,
    #[serde(rename = "Terr")]
    pub terr: bool,
    #[serde(rename = "Replace")]
    pub replace: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    #[serde(rename = "Predicted")]
    pub predicted: bool,
    #[serde(rename = "Discriminant")]
    pub discriminant: bool,
    #[serde(rename = "Probabilities")]
    pub probabilities: bool,
    #[serde(rename = "XmlFile")]
    pub xml_file: Option<String>,
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
    pub seed_value: i64,
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

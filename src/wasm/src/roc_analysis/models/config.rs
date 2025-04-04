use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RocConfig {
    pub main: MainConfig,
    #[serde(rename = "defineGroups")]
    pub define_groups: DefineGroupsConfig,
    pub options: OptionsConfig,
    pub display: DisplayConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "PairedSample")]
    pub paired_sample: bool,
    #[serde(rename = "StateTargetVariable")]
    pub state_target_variable: Option<String>,
    #[serde(rename = "StateVarVal")]
    pub state_var_val: Option<String>,
    #[serde(rename = "TestTargetVariable")]
    pub test_target_variable: Option<Vec<String>>,
    #[serde(rename = "TargetGroupVar")]
    pub target_group_var: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineGroupsConfig {
    #[serde(rename = "SpecifiedValues")]
    pub specified_values: bool,
    #[serde(rename = "Group1")]
    pub group1: Option<String>,
    #[serde(rename = "Group2")]
    pub group2: Option<String>,
    #[serde(rename = "UseMidValue")]
    pub use_mid_value: bool,
    #[serde(rename = "CutPoint")]
    pub cut_point: bool,
    #[serde(rename = "CutPointValue")]
    pub cut_point_value: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "IncludeCutoff")]
    pub include_cutoff: bool,
    #[serde(rename = "ExcludeCutoff")]
    pub exclude_cutoff: bool,
    #[serde(rename = "LargerTest")]
    pub larger_test: bool,
    #[serde(rename = "SmallerTest")]
    pub smaller_test: bool,
    #[serde(rename = "DistAssumptMethod")]
    pub dist_assumpt_method: DistributionMethod,
    #[serde(rename = "ConfLevel")]
    pub conf_level: i32,
    #[serde(rename = "ExcludeMissValue")]
    pub exclude_miss_value: bool,
    #[serde(rename = "MissValueAsValid")]
    pub miss_value_as_valid: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq)]
pub enum DistributionMethod {
    #[serde(rename = "Nonparametric")]
    Nonparametric,
    #[serde(rename = "BiNegativeExponential")]
    BiNegativeExponential,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisplayConfig {
    #[serde(rename = "RocCurve")]
    pub roc_curve: bool,
    #[serde(rename = "Refline")]
    pub refline: bool,
    #[serde(rename = "PRC")]
    pub prc: bool,
    #[serde(rename = "IntepolateTrue")]
    pub intepol_true: bool,
    #[serde(rename = "IntepolateFalse")]
    pub intepol_false: bool,
    #[serde(rename = "Overall")]
    pub overall: bool,
    #[serde(rename = "SECI")]
    pub seci: bool,
    #[serde(rename = "ROCPoint")]
    pub roc_point: bool,
    #[serde(rename = "PRCPoint")]
    pub prc_point: bool,
    #[serde(rename = "EvalMetrics")]
    pub eval_metrics: bool,
}

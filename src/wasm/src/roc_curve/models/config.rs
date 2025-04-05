use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ROCCurveConfig {
    pub main: MainConfig,
    pub options: OptionsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "TestTargetVariable")]
    pub test_target_variable: Option<Vec<String>>,
    #[serde(rename = "StateTargetVariable")]
    pub state_target_variable: Option<String>,
    #[serde(rename = "StateVarVal")]
    pub state_var_val: Option<String>,
    #[serde(rename = "RocCurve")]
    pub roc_curve: bool,
    #[serde(rename = "DiagRef")]
    pub diag_ref: bool,
    #[serde(rename = "ErrInterval")]
    pub err_interval: bool,
    #[serde(rename = "CoordPt")]
    pub coord_pt: bool,
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

use serde::{ Deserialize, Serialize };
use crate::discriminant::utils::error::DiscriminantError;

/// Configuration for discriminant analysis
#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Config {
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

#[derive(Serialize, Deserialize, Clone, Debug)]
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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DefineRangeConfig {
    #[serde(rename = "minRange")]
    pub min_range: Option<f64>,

    #[serde(rename = "maxRange")]
    pub max_range: Option<f64>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SetValueConfig {
    #[serde(rename = "Value")]
    pub value: Option<f64>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
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

#[derive(Serialize, Deserialize, Clone, Debug)]
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

#[derive(Serialize, Deserialize, Clone, Debug)]
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
    pub limit_value: Option<f64>,

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

#[derive(Serialize, Deserialize, Clone, Debug)]
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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BootstrapConfig {
    #[serde(rename = "PerformBootStrapping")]
    pub perform_boot_strapping: bool,

    #[serde(rename = "NumOfSamples")]
    pub num_of_samples: usize,

    #[serde(rename = "Seed")]
    pub seed: bool,

    #[serde(rename = "SeedValue")]
    pub seed_value: u64,

    #[serde(rename = "Level")]
    pub level: usize,

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

impl Config {
    /// Parse configuration from a JSON string
    pub fn from_json(json_str: &str) -> Result<Self, DiscriminantError> {
        serde_json
            ::from_str(json_str)
            .map_err(|e| DiscriminantError::InvalidInput(format!("Failed to parse config: {}", e)))
    }

    /// Get default configuration
    pub fn default() -> Self {
        Self {
            main: MainConfig {
                grouping_variable: "group".to_string(),
                independent_variables: vec!["var1".to_string()],
                together: true,
                stepwise: false,
                selection_variable: None,
            },
            define_range: DefineRangeConfig {
                min_range: None,
                max_range: None,
            },
            set_value: SetValueConfig {
                value: None,
            },
            statistics: StatisticsConfig {
                means: false,
                anova: false,
                box_m: false,
                fisher: false,
                unstandardized: false,
                wg_correlation: false,
                wg_covariance: false,
                sg_covariance: false,
                total_covariance: false,
            },
            method: MethodConfig {
                wilks: true,
                unexplained: false,
                mahalonobis: false,
                f_ratio: false,
                raos: false,
                f_value: true,
                f_probability: false,
                summary: true,
                pairwise: false,
                v_enter: 0.0,
                f_entry: 3.84,
                f_removal: 2.71,
                p_entry: 0.05,
                p_removal: 0.1,
            },
            classify: ClassifyConfig {
                all_group_equal: true,
                group_size: false,
                within_group: true,
                sep_group: false,
                case: false,
                limit: false,
                limit_value: None,
                summary: false,
                leave: false,
                combine: false,
                sep_grp: false,
                terr: false,
                replace: false,
            },
            save: SaveConfig {
                predicted: false,
                discriminant: false,
                probabilities: false,
                xml_file: None,
            },
            bootstrap: BootstrapConfig {
                perform_boot_strapping: false,
                num_of_samples: 1000,
                seed: false,
                seed_value: 2000000,
                level: 95,
                percentile: true,
                bca: false,
                simple: true,
                stratified: false,
                variables: vec![],
                strata_variables: None,
            },
        }
    }
}

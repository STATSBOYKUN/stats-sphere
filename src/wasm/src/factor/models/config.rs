use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FactorAnalysisConfig {
    pub main: MainConfig,
    pub value: ValueConfig,
    pub descriptives: DescriptivesConfig,
    pub extraction: ExtractionConfig,
    pub rotation: RotationConfig,
    pub scores: ScoresConfig,
    pub options: OptionsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "TargetVar")]
    pub target_var: Option<Vec<String>>,
    #[serde(rename = "ValueTarget")]
    pub value_target: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValueConfig {
    #[serde(rename = "Selection")]
    pub selection: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DescriptivesConfig {
    #[serde(rename = "UnivarDesc")]
    pub univar_desc: bool,
    #[serde(rename = "InitialSol")]
    pub initial_sol: bool,
    #[serde(rename = "Coefficient")]
    pub coefficient: bool,
    #[serde(rename = "Inverse")]
    pub inverse: bool,
    #[serde(rename = "SignificanceLvl")]
    pub significance_lvl: bool,
    #[serde(rename = "Reproduced")]
    pub reproduced: bool,
    #[serde(rename = "Determinant")]
    pub determinant: bool,
    #[serde(rename = "AntiImage")]
    pub anti_image: bool,
    #[serde(rename = "KMO")]
    pub kmo: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ExtractionConfig {
    #[serde(rename = "Method")]
    pub method: ExtractionMethod,
    #[serde(rename = "Correlation")]
    pub correlation: bool,
    #[serde(rename = "Covariance")]
    pub covariance: bool,
    #[serde(rename = "Unrotated")]
    pub unrotated: bool,
    #[serde(rename = "Scree")]
    pub scree: bool,
    #[serde(rename = "Eigen")]
    pub eigen: bool,
    #[serde(rename = "Factor")]
    pub factor: bool,
    #[serde(rename = "EigenVal")]
    pub eigen_val: f64,
    #[serde(rename = "MaxFactors")]
    pub max_factors: Option<i32>,
    #[serde(rename = "MaxIter")]
    pub max_iter: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ExtractionMethod {
    #[serde(rename = "PrincipalComp")]
    PrincipalComponents,
    #[serde(rename = "UnweightLeastSqr")]
    UnweightedLeastSquares,
    #[serde(rename = "GeneralizedLeastSqr")]
    GeneralizedLeastSquares,
    #[serde(rename = "MaxLikelihood")]
    MaximumLikelihood,
    #[serde(rename = "PrincipalAxisFactoring")]
    PrincipalAxisFactoring,
    #[serde(rename = "AlphaFactoring")]
    AlphaFactoring,
    #[serde(rename = "ImageFactoring")]
    ImageFactoring,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RotationConfig {
    #[serde(rename = "None")]
    pub none: bool,
    #[serde(rename = "Varimax")]
    pub varimax: bool,
    #[serde(rename = "Oblimin")]
    pub oblimin: bool,
    #[serde(rename = "Delta")]
    pub delta: f64,
    #[serde(rename = "Quartimax")]
    pub quartimax: bool,
    #[serde(rename = "Equimax")]
    pub equimax: bool,
    #[serde(rename = "Promax")]
    pub promax: bool,
    #[serde(rename = "Kappa")]
    pub kappa: i32,
    #[serde(rename = "RotatedSol")]
    pub rotated_sol: bool,
    #[serde(rename = "LoadingPlot")]
    pub loading_plot: bool,
    #[serde(rename = "MaxIter")]
    pub max_iter: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ScoresConfig {
    #[serde(rename = "SaveVar")]
    pub save_var: bool,
    #[serde(rename = "Regression")]
    pub regression: bool,
    #[serde(rename = "Bartlett")]
    pub bartlett: bool,
    #[serde(rename = "Anderson")]
    pub anderson: bool,
    #[serde(rename = "DisplayFactor")]
    pub display_factor: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "ExcludeListWise")]
    pub exclude_list_wise: bool,
    #[serde(rename = "ExcludePairWise")]
    pub exclude_pair_wise: bool,
    #[serde(rename = "ReplaceMean")]
    pub replace_mean: bool,
    #[serde(rename = "SortSize")]
    pub sort_size: bool,
    #[serde(rename = "SuppressValues")]
    pub suppress_values: bool,
    #[serde(rename = "SuppressValuesNum")]
    pub suppress_values_num: f64,
}

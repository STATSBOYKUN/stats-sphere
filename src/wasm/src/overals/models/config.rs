use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OVERALSAnalysisConfig {
    pub main: MainConfig,
    #[serde(rename = "defineRangeScale")]
    pub define_range_scale: DefineRangeScaleConfig,
    #[serde(rename = "defineRange")]
    pub define_range: DefineRangeConfig,
    pub options: OptionsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "SetTargetVariable")]
    pub set_target_variable: Option<Vec<Vec<String>>>,
    #[serde(rename = "PlotsTargetVariable")]
    pub plots_target_variable: Option<Vec<String>>,
    #[serde(rename = "Dimensions")]
    pub dimensions: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineRangeScaleConfig {
    #[serde(rename = "Minimum")]
    pub minimum: Option<f64>,
    #[serde(rename = "Maximum")]
    pub maximum: Option<f64>,
    #[serde(rename = "Ordinal")]
    pub ordinal: bool,
    #[serde(rename = "SingleNominal")]
    pub single_nominal: bool,
    #[serde(rename = "MultipleNominal")]
    pub multiple_nominal: bool,
    #[serde(rename = "DiscreteNumeric")]
    pub discrete_numeric: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineRangeConfig {
    #[serde(rename = "Minimum")]
    pub minimum: Option<f64>,
    #[serde(rename = "Maximum")]
    pub maximum: Option<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "Freq")]
    pub freq: bool,
    #[serde(rename = "SingMult")]
    pub sing_mult: bool,
    #[serde(rename = "Centroid")]
    pub centroid: bool,
    #[serde(rename = "CategoryQuant")]
    pub category_quant: bool,
    #[serde(rename = "IterHistory")]
    pub iter_history: bool,
    #[serde(rename = "ObjScore")]
    pub obj_score: bool,
    #[serde(rename = "WeightCompload")]
    pub weight_compload: bool,
    #[serde(rename = "CategCoord")]
    pub categ_coord: bool,
    #[serde(rename = "CategCentroid")]
    pub categ_centroid: bool,
    #[serde(rename = "PlotObjScore")]
    pub plot_obj_score: bool,
    #[serde(rename = "Trans")]
    pub trans: bool,
    #[serde(rename = "Compload")]
    pub compload: bool,
    #[serde(rename = "SaveObjscore")]
    pub save_objscore: bool,
    #[serde(rename = "UseRandconf")]
    pub use_randconf: bool,
    #[serde(rename = "MaxIter")]
    pub max_iter: Option<i32>,
    #[serde(rename = "Conv")]
    pub conv: Option<f64>,
}

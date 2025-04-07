use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CorrespondenceAnalysisConfig {
    pub main: MainConfig,
    #[serde(rename = "defineRangeRow")]
    pub define_range_row: DefineRangeConfig,
    #[serde(rename = "defineRangeColumn")]
    pub define_range_column: DefineRangeConfig,
    pub model: ModelConfig,
    pub statistics: StatisticsConfig,
    pub plots: PlotsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "RowTargetVar")]
    pub row_target_var: Option<String>,
    #[serde(rename = "ColTargetVar")]
    pub col_target_var: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DefineRangeConfig {
    #[serde(rename = "MinValue")]
    pub min_value: Option<f64>,
    #[serde(rename = "MaxValue")]
    pub max_value: Option<f64>,
    #[serde(rename = "ConstraintsList")]
    pub constraints_list: Option<Vec<String>>,
    #[serde(rename = "None")]
    pub none: bool,
    #[serde(rename = "CategoryEqual")]
    pub category_equal: bool,
    #[serde(rename = "CategorySupplemental")]
    pub category_supplemental: bool,
    #[serde(rename = "DefaultListModel")]
    pub default_list_model: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ModelConfig {
    #[serde(rename = "ChiSquare")]
    pub chi_square: bool,
    #[serde(rename = "Euclidean")]
    pub euclidean: bool,
    #[serde(rename = "RNCRemoved")]
    pub rnc_removed: bool,
    #[serde(rename = "RowRemoved")]
    pub row_removed: bool,
    #[serde(rename = "ColRemoved")]
    pub col_removed: bool,
    #[serde(rename = "RowTotals")]
    pub row_totals: bool,
    #[serde(rename = "ColTotals")]
    pub col_totals: bool,
    #[serde(rename = "Symmetrical")]
    pub symmetrical: bool,
    #[serde(rename = "RowPrincipal")]
    pub row_principal: bool,
    #[serde(rename = "Custom")]
    pub custom: bool,
    #[serde(rename = "Principal")]
    pub principal: bool,
    #[serde(rename = "ColPrincipal")]
    pub col_principal: bool,
    #[serde(rename = "Dimensions")]
    pub dimensions: i32,
    #[serde(rename = "CustomDimensions")]
    pub custom_dimensions: i32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatisticsConfig {
    #[serde(rename = "CorrTable")]
    pub corr_table: bool,
    #[serde(rename = "StatRowPoints")]
    pub stat_row_points: bool,
    #[serde(rename = "StatColPoints")]
    pub stat_col_points: bool,
    #[serde(rename = "PermutationTest")]
    pub permutation_test: bool,
    #[serde(rename = "MaxPermutations")]
    pub max_permutations: i32,
    #[serde(rename = "RowProfile")]
    pub row_profile: bool,
    #[serde(rename = "ColProfile")]
    pub col_profile: bool,
    #[serde(rename = "RowPoints")]
    pub row_points: bool,
    #[serde(rename = "ColPoints")]
    pub col_points: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlotsConfig {
    #[serde(rename = "Biplot")]
    pub biplot: bool,
    #[serde(rename = "RowPts")]
    pub row_pts: bool,
    #[serde(rename = "ColPts")]
    pub col_pts: bool,
    #[serde(rename = "IdScatter")]
    pub id_scatter: i32,
    #[serde(rename = "TransRow")]
    pub trans_row: bool,
    #[serde(rename = "TransCol")]
    pub trans_col: bool,
    #[serde(rename = "IdLine")]
    pub id_line: i32,
    #[serde(rename = "DisplayAll")]
    pub display_all: bool,
    #[serde(rename = "RestrictDim")]
    pub restrict_dim: bool,
    #[serde(rename = "Lowest")]
    pub lowest: Option<i32>,
    #[serde(rename = "Highest")]
    pub highest: Option<i32>,
}

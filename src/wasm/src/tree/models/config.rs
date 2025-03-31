use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TreeConfig {
    pub main: MainConfig,
    pub categories: CategoriesConfig,
    pub output: OutputConfig,
    pub validation: ValidationConfig,
    pub criteria: CriteriaConfig,
    pub save: SaveConfig,
    pub options: OptionsConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "DependentTargetVar")]
    pub dependent_target_var: Option<String>,
    #[serde(rename = "IndependentTargetVar")]
    pub independent_target_var: Option<String>,
    #[serde(rename = "Force")]
    pub force: bool,
    #[serde(rename = "InfluenceTargetVar")]
    pub influence_target_var: Option<String>,
    #[serde(rename = "GrowingMethod")]
    pub growing_method: GrowingMethod,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CategoriesConfig {
    #[serde(rename = "TargetVar")]
    pub target_var: Option<String>,
    #[serde(rename = "ModelVar")]
    pub model_var: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OutputConfig {
    #[serde(rename = "TreeOutput")]
    pub tree_output: bool,
    #[serde(rename = "TopDown")]
    pub top_down: bool,
    #[serde(rename = "L2R")]
    pub l2r: bool,
    #[serde(rename = "R2L")]
    pub r2l: bool,
    #[serde(rename = "Table")]
    pub table: bool,
    #[serde(rename = "Chart")]
    pub chart: bool,
    #[serde(rename = "TableAndChart")]
    pub table_and_chart: bool,
    #[serde(rename = "Automatic")]
    pub automatic: bool,
    #[serde(rename = "Custom")]
    pub custom: bool,
    #[serde(rename = "Percent")]
    pub percent: Option<f64>,
    #[serde(rename = "IndVarStats")]
    pub ind_var_stats: bool,
    #[serde(rename = "NodeDef")]
    pub node_def: bool,
    #[serde(rename = "TreeInTableFormat")]
    pub tree_in_table_format: bool,
    #[serde(rename = "Summary")]
    pub summary: bool,
    #[serde(rename = "Risk")]
    pub risk: bool,
    #[serde(rename = "ClassTable")]
    pub class_table: bool,
    #[serde(rename = "CPSP")]
    pub cpsp: bool,
    #[serde(rename = "ImpToModel")]
    pub imp_to_model: bool,
    #[serde(rename = "Surrogates")]
    pub surrogates: bool,
    #[serde(rename = "SummaryNP")]
    pub summary_np: bool,
    #[serde(rename = "TargetCategory")]
    pub target_category: bool,
    #[serde(rename = "RowsMethod")]
    pub rows_method: RowsNodeMethod,
    #[serde(rename = "SortOrderMethod")]
    pub sort_order_method: SortingMethod,
    #[serde(rename = "PercentIncMethod")]
    pub percent_inc_method: i32,
    #[serde(rename = "Display")]
    pub display: bool,
    #[serde(rename = "GenRules")]
    pub gen_rules: bool,
    #[serde(rename = "Spss")]
    pub spss: bool,
    #[serde(rename = "Sql")]
    pub sql: bool,
    #[serde(rename = "SimpleText")]
    pub simple_text: bool,
    #[serde(rename = "ValLbl")]
    pub val_lbl: bool,
    #[serde(rename = "ValToCases")]
    pub val_to_cases: bool,
    #[serde(rename = "SelectCases")]
    pub select_cases: bool,
    #[serde(rename = "IncSurrogates")]
    pub inc_surrogates: bool,
    #[serde(rename = "TerminalNodes")]
    pub terminal_nodes: bool,
    #[serde(rename = "BestTerminal")]
    pub best_terminal: bool,
    #[serde(rename = "NumberOfNodes")]
    pub number_of_nodes: Option<i32>,
    #[serde(rename = "BestTerminalPercent")]
    pub best_terminal_percent: bool,
    #[serde(rename = "TermPercent")]
    pub term_percent: Option<f64>,
    #[serde(rename = "BestTerminalMinIndex")]
    pub best_terminal_min_index: bool,
    #[serde(rename = "MinIndex")]
    pub min_index: Option<f64>,
    #[serde(rename = "AllNodes")]
    pub all_nodes: bool,
    #[serde(rename = "ExportRules")]
    pub export_rules: bool,
    #[serde(rename = "FileEdit")]
    pub file_edit: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ValidationConfig {
    #[serde(rename = "None")]
    pub none: bool,
    #[serde(rename = "CrossValidation")]
    pub cross_validation: bool,
    #[serde(rename = "NumberOfSample")]
    pub number_of_sample: i32,
    #[serde(rename = "SplitSample")]
    pub split_sample: bool,
    #[serde(rename = "UseRandom")]
    pub use_random: bool,
    #[serde(rename = "TrainingSample")]
    pub training_sample: i32,
    #[serde(rename = "UseVariable")]
    pub use_variable: bool,
    #[serde(rename = "SrcVar")]
    pub src_var: Vec<String>,
    #[serde(rename = "TargetVar")]
    pub target_var: Option<String>,
    #[serde(rename = "Training")]
    pub training: bool,
    #[serde(rename = "TestSample")]
    pub test_sample: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CriteriaConfig {
    #[serde(rename = "Automatic")]
    pub automatic: bool,
    #[serde(rename = "Custom")]
    pub custom: bool,
    #[serde(rename = "Value")]
    pub value: Option<f64>,
    #[serde(rename = "ParentNode")]
    pub parent_node: i32,
    #[serde(rename = "ChildNode")]
    pub child_node: i32,
    #[serde(rename = "Split")]
    pub split: f64,
    #[serde(rename = "MergCate")]
    pub merg_cate: f64,
    #[serde(rename = "Pearson")]
    pub pearson: bool,
    #[serde(rename = "LikeliHood")]
    pub likely_hood: bool,
    #[serde(rename = "MaxNoText")]
    pub max_no_text: i32,
    #[serde(rename = "MinChange")]
    pub min_change: f64,
    #[serde(rename = "AdjustSign")]
    pub adjust_sign: bool,
    #[serde(rename = "Allow")]
    pub allow: bool,
    #[serde(rename = "FixedNo")]
    pub fixed_no: bool,
    #[serde(rename = "ValueFixed")]
    pub value_fixed: i32,
    #[serde(rename = "CustomInterval")]
    pub custom_interval: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    #[serde(rename = "TerminalNode")]
    pub terminal_node: bool,
    #[serde(rename = "PredictedValue")]
    pub predicted_value: bool,
    #[serde(rename = "PredictedProbabilities")]
    pub predicted_probabilities: bool,
    #[serde(rename = "SampleAssign")]
    pub sample_assign: bool,
    #[serde(rename = "TrainingSample")]
    pub training_sample: bool,
    #[serde(rename = "TrainingFile")]
    pub training_file: Option<String>,
    #[serde(rename = "TestSample")]
    pub test_sample: bool,
    #[serde(rename = "TestSampleFile")]
    pub test_sample_file: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct OptionsConfig {
    #[serde(rename = "EqualCrossCate")]
    pub equal_cross_cate: bool,
    #[serde(rename = "Custom")]
    pub custom: bool,
    #[serde(rename = "DupLowMatrix")]
    pub dup_low_matrix: bool,
    #[serde(rename = "DupUppMatrix")]
    pub dup_upp_matrix: bool,
    #[serde(rename = "UseAvg")]
    pub use_avg: bool,
    #[serde(rename = "NoneProfits")]
    pub none_profits: bool,
    #[serde(rename = "CustomProfits")]
    pub custom_profits: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum GrowingMethod {
    #[serde(rename = "CHAID")]
    Chaid,
    #[serde(rename = "ExhaustiveCHAID")]
    ExhaustiveChaid,
    #[serde(rename = "CART")]
    Cart,
    #[serde(rename = "QUEST")]
    Quest,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum RowsNodeMethod {
    #[serde(rename = "TERMINAL")]
    Terminal,
    #[serde(rename = "PREDICTEDVALUE")]
    PredictedValue,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum SortingMethod {
    #[serde(rename = "ASCENDING")]
    Ascending,
    #[serde(rename = "DESCENDING")]
    Descending,
}

#[derive(Debug, Clone)]
pub struct DiscriminantMainType {
    pub grouping_variable: Option<String>,
    pub independent_variables: Option<Vec<String>>,
    pub together: bool,
    pub stepwise: bool,
    pub selection_variable: Option<String>,
}

#[derive(Debug, Clone)]
pub struct DiscriminantDefineRangeType {
    pub min_range: Option<f64>,
    pub max_range: Option<f64>,
}

#[derive(Debug, Clone)]
pub struct DiscriminantSetValueType {
    pub value: Option<f64>,
}

#[derive(Debug, Clone)]
pub struct DiscriminantStatisticsType {
    pub means: bool,
    pub anova: bool,
    pub box_m: bool,
    pub fisher: bool,
    pub unstandardized: bool,
    pub wg_correlation: bool,
    pub wg_covariance: bool,
    pub sg_covariance: bool,
    pub total_covariance: bool,
}

#[derive(Debug, Clone)]
pub struct DiscriminantMethodType {
    pub wilks: bool,
    pub unexplained: bool,
    pub mahalonobis: bool,
    pub f_ratio: bool,
    pub raos: bool,
    pub f_value: bool,
    pub f_probability: bool,
    pub summary: bool,
    pub pairwise: bool,
    pub v_enter: Option<f64>,
    pub f_entry: Option<f64>,
    pub f_removal: Option<f64>,
    pub p_entry: Option<f64>,
    pub p_removal: Option<f64>,
}

#[derive(Debug, Clone)]
pub struct DiscriminantClassifyType {
    pub all_group_equal: bool,
    pub group_size: bool,
    pub within_group: bool,
    pub sep_group: bool,
    pub case: bool,
    pub limit: bool,
    pub limit_value: Option<f64>,
    pub summary: bool,
    pub leave: bool,
    pub combine: bool,
    pub sep_grp: bool,
    pub terr: bool,
    pub replace: bool,
}

#[derive(Debug, Clone)]
pub struct DiscriminantSaveType {
    pub predicted: bool,
    pub discriminant: bool,
    pub probabilities: bool,
    pub xml_file: Option<String>,
}

#[derive(Debug, Clone)]
pub struct DiscriminantBootstrapType {
    pub perform_bootstrapping: bool,
    pub num_of_samples: Option<u32>,
    pub seed: bool,
    pub seed_value: Option<u32>,
    pub level: Option<f64>,
    pub percentile: bool,
    pub bca: bool,
    pub simple: bool,
    pub stratified: bool,
    pub variables: Option<String>,
    pub strata_variables: Option<String>,
}

#[derive(Debug, Clone)]
pub struct DiscriminantType {
    pub main: DiscriminantMainType,
    pub define_range: DiscriminantDefineRangeType,
    pub set_value: DiscriminantSetValueType,
    pub statistics: DiscriminantStatisticsType,
    pub method: DiscriminantMethodType,
    pub classify: DiscriminantClassifyType,
    pub save: DiscriminantSaveType,
    pub bootstrap: DiscriminantBootstrapType,
}

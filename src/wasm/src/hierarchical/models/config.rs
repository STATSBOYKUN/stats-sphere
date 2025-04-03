use serde::{ Deserialize, Serialize };

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ClusterConfig {
    pub main: MainConfig,
    pub statistics: StatisticsConfig,
    pub plots: PlotsConfig,
    pub save: SaveConfig,
    pub method: MethodConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MainConfig {
    #[serde(rename = "Variables")]
    pub variables: Option<Vec<String>>,
    #[serde(rename = "LabelCases")]
    pub label_cases: Option<String>,
    #[serde(rename = "ClusterCases")]
    pub cluster_cases: bool,
    #[serde(rename = "ClusterVar")]
    pub cluster_var: bool,
    #[serde(rename = "DispStats")]
    pub disp_stats: bool,
    #[serde(rename = "DispPlots")]
    pub disp_plots: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct StatisticsConfig {
    #[serde(rename = "AgglSchedule")]
    pub aggl_schedule: bool,
    #[serde(rename = "ProxMatrix")]
    pub prox_matrix: bool,
    #[serde(rename = "NoneSol")]
    pub none_sol: bool,
    #[serde(rename = "SingleSol")]
    pub single_sol: bool,
    #[serde(rename = "RangeSol")]
    pub range_sol: bool,
    #[serde(rename = "NoOfCluster")]
    pub no_of_cluster: Option<i32>,
    #[serde(rename = "MaxCluster")]
    pub max_cluster: Option<i32>,
    #[serde(rename = "MinCluster")]
    pub min_cluster: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct PlotsConfig {
    #[serde(rename = "Dendrograms")]
    pub dendrograms: bool,
    #[serde(rename = "AllClusters")]
    pub all_clusters: bool,
    #[serde(rename = "RangeClusters")]
    pub range_clusters: bool,
    #[serde(rename = "NoneClusters")]
    pub none_clusters: bool,
    #[serde(rename = "StartCluster")]
    pub start_cluster: i32,
    #[serde(rename = "StopCluster")]
    pub stop_cluster: Option<i32>,
    #[serde(rename = "StepByCluster")]
    pub step_by_cluster: i32,
    #[serde(rename = "VertOrien")]
    pub vert_orien: bool,
    #[serde(rename = "HoriOrien")]
    pub hori_orien: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SaveConfig {
    #[serde(rename = "NoneSol")]
    pub none_sol: bool,
    #[serde(rename = "SingleSol")]
    pub single_sol: bool,
    #[serde(rename = "RangeSol")]
    pub range_sol: bool,
    #[serde(rename = "NoOfCluster")]
    pub no_of_cluster: Option<i32>,
    #[serde(rename = "MaxCluster")]
    pub max_cluster: Option<i32>,
    #[serde(rename = "MinCluster")]
    pub min_cluster: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MethodConfig {
    #[serde(rename = "ClusMethod")]
    pub clus_method: ClusMethod,
    #[serde(rename = "Interval")]
    pub interval: bool,
    #[serde(rename = "IntervalMethod")]
    pub interval_method: IntervalMethod,
    #[serde(rename = "Power")]
    pub power: String,
    #[serde(rename = "Root")]
    pub root: String,
    #[serde(rename = "Counts")]
    pub counts: bool,
    #[serde(rename = "CountsMethod")]
    pub counts_method: CountsMethod,
    #[serde(rename = "Binary")]
    pub binary: bool,
    #[serde(rename = "BinaryMethod")]
    pub binary_method: BinaryMethod,
    #[serde(rename = "Present")]
    pub present: i32,
    #[serde(rename = "Absent")]
    pub absent: i32,
    #[serde(rename = "StandardizeMethod")]
    pub standardize_method: StandardizeMethod,
    #[serde(rename = "ByVariable")]
    pub by_variable: bool,
    #[serde(rename = "ByCase")]
    pub by_case: bool,
    #[serde(rename = "AbsValue")]
    pub abs_value: bool,
    #[serde(rename = "ChangeSign")]
    pub change_sign: bool,
    #[serde(rename = "RescaleRange")]
    pub rescale_range: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ClusMethod {
    AverageBetweenGroups,
    AverageWithinGroups,
    SingleLinkage,
    CompleteLinkage,
    Centroid,
    Median,
    Ward,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum IntervalMethod {
    Euclidean,
    SquaredEuclidean,
    Cosine,
    Correlation,
    Chebychev,
    Manhattan,
    Minkowski,
    Customized,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum CountsMethod {
    CHISQ,
    PH2,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum BinaryMethod {
    BSEUCLID,
    SIZE,
    PATTERN,
    VARIANCE,
    DISPER,
    BSHAPE,
    SM,
    PHI,
    LAMBDA,
    D,
    DICE,
    HAMANN,
    JACCARD,
    K1,
    K2,
    BLWMN,
    OCHIAI,
    RT,
    RR,
    SS1,
    SS2,
    SS3,
    SS4,
    Y,
    Q,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum StandardizeMethod {
    None,
    ZScore,
    RangeNegOneToOne,
    RangeZeroToOne,
    MaxMagnitudeOne,
    MeanOne,
    StdDevOne,
}

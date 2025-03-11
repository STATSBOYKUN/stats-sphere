use serde::{Deserialize, Serialize};

/// Stepwise method options
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum StepwiseMethod {
    Wilks,            // Wilks' lambda (default)
    Unexplained,      // Unexplained variance
    Mahalanobis,      // Mahalanobis distance
    SmallestF,        // Smallest F ratio
    RaoV,             // Rao's V
}

/// Criteria type options
#[derive(Serialize, Deserialize, Clone, Copy, PartialEq)]
pub enum CriteriaType {
    FValue,           // Use F value (default)
    Probability,      // Use probability of F
}

/// Stepwise criteria parameters
#[derive(Serialize, Deserialize, Clone)]
pub struct StepwiseCriteria {
    pub criteria_type: CriteriaType,
    pub entry: f64,    // Entry value (default: 3.84 for F, 0.05 for probability)
    pub removal: f64,  // Removal value (default: 2.71 for F, 0.10 for probability)
    pub v_to_enter: f64, // Minimum Rao's V to enter (default: 0.0)
}

/// Display options for stepwise output
#[derive(Serialize, Deserialize, Clone)]
pub struct StepwiseDisplay {
    pub summary_steps: bool,      // Show summary of steps (default: true)
    pub pairwise_distances: bool, // Show F for pairwise distances (default: true)
}

/// Step information for variables entered/removed
#[derive(Serialize, Deserialize, Clone)]
pub struct StepInfo {
    pub step: usize,
    pub variable_index: usize,
    pub variable_name: String,
    pub action: String,           // "Entered" or "Removed"
    pub statistic: f64,           // F or Wilks' Lambda
    pub df1: usize,
    pub df2: usize,
    pub df3: usize,
    pub wilks_lambda: f64,
    pub wilks_df1: usize,
    pub wilks_df2: usize,
    pub exact_f: f64,
    pub exact_f_df1: usize,
    pub exact_f_df2: usize,
    pub significance: f64,
}

/// Variable information for variables in analysis
#[derive(Serialize, Deserialize, Clone)]
pub struct VariableInAnalysis {
    pub step: usize,
    pub variable_index: usize,
    pub variable_name: String,
    pub tolerance: f64,
    pub f_to_remove: f64,
}

/// Variable information for variables not in analysis
#[derive(Serialize, Deserialize, Clone)]
pub struct VariableNotInAnalysis {
    pub step: usize,
    pub variable_index: usize,
    pub variable_name: String,
    pub tolerance: f64,
    pub min_tolerance: f64,
    pub f_to_enter: f64,
    pub wilks_lambda: f64,
}

/// Pairwise comparison information
#[derive(Serialize, Deserialize, Clone)]
pub struct PairwiseComparison {
    pub step: usize,
    pub group1: usize,
    pub group2: usize,
    pub f_value: f64,
    pub significance: f64,
}

/// Complete stepwise statistics
#[derive(Serialize, Deserialize, Clone)]
pub struct StepwiseStatistics {
    pub method: StepwiseMethod,
    pub criteria: StepwiseCriteria,
    pub display: StepwiseDisplay,
    pub steps: Vec<StepInfo>,
    pub variables_in_analysis: Vec<VariableInAnalysis>,
    pub variables_not_in_analysis: Vec<VariableNotInAnalysis>,
    pub wilks_lambda_steps: Vec<StepInfo>,
    pub pairwise_comparisons: Vec<PairwiseComparison>,
    pub max_steps: usize,
    pub tolerance: f64,
}

/// Case processing summary information
#[derive(Serialize, Deserialize, Clone)]
pub struct CaseProcessingSummary {
    pub valid_count: usize,
    pub valid_percent: f64,
    pub excluded_missing_group: usize,
    pub excluded_missing_group_percent: f64,
    pub excluded_missing_var: usize,
    pub excluded_missing_var_percent: f64,
    pub excluded_both: usize,
    pub excluded_both_percent: f64,
    pub excluded_total: usize,
    pub excluded_total_percent: f64,
    pub total_count: usize,
    pub total_percent: f64,
}

/// Group statistics information
#[derive(Serialize, Deserialize, Clone)]
pub struct GroupStatistics {
    pub group_values: Vec<usize>,
    pub variable_names: Vec<String>,
    pub means: Vec<Vec<f64>>,
    pub std_deviations: Vec<Vec<f64>>,
    pub unweighted_counts: Vec<usize>,
    pub weighted_counts: Vec<f64>,
    pub total_means: Vec<f64>,
    pub total_std_deviations: Vec<f64>,
    pub total_unweighted_count: usize,
    pub total_weighted_count: f64,
}
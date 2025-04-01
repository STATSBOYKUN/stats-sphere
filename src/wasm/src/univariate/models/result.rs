// result.rs

use serde::{ Deserialize, Serialize };
use std::collections::HashMap;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct UnivariateResult {
    pub between_subjects_factors: BetweenSubjectFactors,
    pub descriptive_statistics: DescriptiveStatistics,
    pub levene_test: LeveneTest,
    pub tests_of_between_subjects_effects: TestsBetweenSubjectsEffects,
    pub parameter_estimates: ParameterEstimates,
    pub general_estimable_function: GeneralEstimableFunction,
    pub contrast_coefficients: ContrastCoefficients,
    pub lack_of_fit_tests: LackOfFitTests,
    pub spread_vs_level_plots: SpreadVsLevelPlots,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BetweenSubjectFactors {
    pub factors: HashMap<String, usize>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DescriptiveStatistics {
    pub entries: Vec<DescriptiveStatisticsEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DescriptiveStatisticsEntry {
    pub gender: usize,
    pub lowup: usize,
    pub section: usize,
    pub mean: f64,
    pub std_deviation: f64,
    pub n: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LeveneTest {
    pub dependent_variable: String,
    pub f_statistic: f64,
    pub df1: usize,
    pub df2: usize,
    pub significance: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TestsBetweenSubjectsEffects {
    pub source: HashMap<String, TestEffectEntry>,
    pub r_squared: f64,
    pub adjusted_r_squared: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TestEffectEntry {
    pub sum_of_squares: f64,
    pub df: usize,
    pub mean_square: f64,
    pub f_value: f64,
    pub significance: f64,
    pub partial_eta_squared: f64,
    pub noncent_parameter: f64,
    pub observed_power: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParameterEstimates {
    pub estimates: Vec<ParameterEstimateEntry>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ParameterEstimateEntry {
    pub parameter: String,
    pub b: f64,
    pub std_error: f64,
    pub t_value: f64,
    pub significance: f64,
    pub confidence_interval: ConfidenceInterval,
    pub partial_eta_squared: f64,
    pub noncent_parameter: f64,
    pub observed_power: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConfidenceInterval {
    pub lower_bound: f64,
    pub upper_bound: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GeneralEstimableFunction {
    pub matrix: Vec<Vec<i32>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ContrastCoefficients {
    pub intercept: Vec<f64>,
    pub gpa: Vec<f64>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LackOfFitTests {
    pub sum_of_squares: f64,
    pub df: usize,
    pub mean_square: f64,
    pub f_value: f64,
    pub significance: f64,
    pub partial_eta_squared: f64,
    pub noncent_parameter: f64,
    pub observed_power: f64,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SpreadVsLevelPlots {
    pub points: Vec<SpreadVsLevelPoint>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SpreadVsLevelPoint {
    pub level_mean: f64,
    pub spread_standard_deviation: f64,
}

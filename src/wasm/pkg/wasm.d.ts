/* tslint:disable */
/* eslint-disable */
/**
 * Standardize data from JavaScript
 *
 * # Arguments
 * * `data_json` - JSON data array
 * * `method_str` - Standardization method
 * * `by_case` - Whether to standardize by case (true) or by variable (false)
 *
 * # Returns
 * * Standardized data array
 */
export function preprocess_data(data_json: any, method_str: string, by_case: boolean): any;
/**
 * Handle missing values from JavaScript
 *
 * # Arguments
 * * `data_json` - JSON data array
 * * `strategy_str` - Missing value strategy
 *
 * # Returns
 * * Processed data array and valid case indices
 */
export function handle_missing_values(data_json: any, strategy_str: string): any;
/**
 * Impute missing values from JavaScript
 *
 * # Arguments
 * * `data_json` - JSON data array
 * * `method` - Imputation method ("mean", "zero", etc.)
 *
 * # Returns
 * * Imputed data array
 */
export function impute_missing_values(data_json: any, method: string): any;
/**
 * Perform hierarchical clustering analysis from JavaScript
 *
 * # Arguments
 * * `data_json` - JSON data array
 * * `config_json` - Configuration object
 *
 * # Returns
 * * Result object with analysis data or error
 */
export function perform_analysis(data_json: any, config_json: any): any;
export function start(): void;
/**
 * WASM Binding: Parse SPSS-style configuration into internal format
 */
export function parse_clustering_config(config_json: any): any;
export function mse(data: Float64Array, forecast: Float64Array): number;
export function rmse(data: Float64Array, forecast: Float64Array): number;
export function mae(data: Float64Array, forecast: Float64Array): number;
export function mpe(data: Float64Array, forecast: Float64Array): number;
export function mape(data: Float64Array, forecast: Float64Array): number;
export function first_difference(data: Float64Array): Float64Array;
export function second_difference(data: Float64Array): Float64Array;
export function seasonal_difference(data: Float64Array, season: number): Float64Array;
export function partial_kj(k: number, j: number, partial_autocorrelate: Float64Array): number;
export class Autocorrelation {
  free(): void;
  constructor(data: Float64Array, data_header: string, lag: number);
  get_data(): Float64Array;
  get_data_header(): string;
  get_lag(): number;
  get_acf(): Float64Array;
  get_acf_se(): Float64Array;
  get_pacf(): Float64Array;
  get_pacf_se(): Float64Array;
  get_lb(): Float64Array;
  get_df_lb(): Uint32Array;
  get_pvalue_lb(): Float64Array;
  set_data(data: Float64Array): void;
  set_data_header(data_header: string): void;
  set_lag(lag: number): void;
  set_acf(acf: Float64Array): void;
  set_acf_se(acf_se: Float64Array): void;
  set_pacf(pacf: Float64Array): void;
  set_pacf_se(pacf_se: Float64Array): void;
  set_lb(lb: Float64Array): void;
  set_df_lb(df_lb: Uint32Array): void;
  set_pvalue_lb(pvalue_lb: Float64Array): void;
  calculate_acf(difference: Float64Array): Float64Array;
  calculate_acf_se(autocorelate: Float64Array): Float64Array;
  calculate_pacf(autocorrelate: Float64Array): Float64Array;
  calculate_pacf_se(partial_autocorelate: Float64Array): Float64Array;
  calculate_ljung_box(autocorrelate: Float64Array): Float64Array;
  pvalue_ljung_box(ljung_box: Float64Array): Float64Array;
  df_ljung_box(): Uint32Array;
  autocorelate(difference: string, seasonally: number): void;
}
export class Decomposition {
  free(): void;
  constructor(data: Float64Array, data_header: string, time: string[], time_header: string, period: number);
  get_data(): Float64Array;
  get_data_header(): string;
  get_time(): string[];
  get_time_header(): string;
  get_seasonal_component(): Float64Array;
  get_trend_component(): Float64Array;
  get_irregular_component(): Float64Array;
  get_seasonal_indices(): Float64Array;
  get_period(): number;
  get_trend_equation(): string;
  set_seasonal_component(seasonal_component: Float64Array): void;
  set_trend_component(trend_component: Float64Array): void;
  set_irregular_component(irregular_component: Float64Array): void;
  set_seasonal_indices(seasonal_indices: Float64Array): void;
  set_trend_equation(trend_equation: string): void;
  calculate_centered_moving_average(): Float64Array;
  additive_decomposition(): Float64Array;
  decomposition_evaluation(forecast: Float64Array): any;
  multiplicative_decomposition(trend: string): Float64Array;
  calculate_multiplicative_seasonal_component(centered_ma: Float64Array): Float64Array;
  calculate_multiplicative_trend_component(trend: string, deseasonalizing: Float64Array): Float64Array;
  linear_trend(deseasonalizing: Float64Array): Float64Array;
  exponential_trend(deseasonalizing: Float64Array): Float64Array;
  calculate_additive_trend_component(centered_ma: Float64Array): Float64Array;
  calculate_additive_seasonal_component(detrended: Float64Array): Float64Array;
}
/**
 * WebAssembly binding for discriminant analysis
 */
export class DiscriminantAnalysisWasm {
  free(): void;
  /**
   * Create a new discriminant analysis
   *
   * # Arguments
   * * `group_variable` - JSON string containing group data
   * * `independent_variable` - JSON string containing independent variable data
   * * `min_range` - Minimum range for scaling
   * * `max_range` - Maximum range for scaling
   * * `prior_probs` - JSON string containing prior probabilities (optional)
   *
   * # Returns
   * * New instance of DiscriminantAnalysisWasm
   */
  constructor(group_variable: any, independent_variable: any, min_range: number, max_range: number, prior_probs: any);
  /**
   * Compute canonical discriminant functions
   */
  compute_canonical_discriminant_functions(): void;
  /**
   * Get univariate F-statistics and Wilks' Lambda for a variable
   *
   * # Arguments
   * * `variable_index` - Index of the variable (0-based)
   *
   * # Returns
   * * JSON string with the F-Lambda result
   */
  univariate_f_lambda(variable_index: number): any;
  /**
   * Perform Box's M test for equality of covariance matrices
   *
   * # Returns
   * * JSON string with the Box's M test result
   */
  box_m_test(): any;
  /**
   * Get Wilks' Lambda for the discriminant functions
   *
   * # Returns
   * * JSON string with Wilks' Lambda results
   */
  wilks_lambda(): any;
  /**
   * Classify a new observation
   *
   * # Arguments
   * * `x` - JSON array of feature values
   *
   * # Returns
   * * JSON string with classification result
   */
  classify(x: any): any;
  /**
   * Perform cross-validation
   *
   * # Returns
   * * JSON string with cross-validation results
   */
  cross_validate(): any;
  /**
   * Get group centroids
   *
   * # Returns
   * * JSON string with group centroids
   */
  group_centroids(): any;
  /**
   * Get standardized coefficients
   *
   * # Returns
   * * JSON string with standardized coefficients
   */
  standardized_coefficients(): any;
  /**
   * Get structure matrix
   *
   * # Returns
   * * JSON string with structure matrix
   */
  structure_matrix(): any;
  /**
   * Get canonical correlations
   *
   * # Returns
   * * JSON string with canonical correlations
   */
  canonical_correlations(): any;
  /**
   * Get classification functions
   *
   * # Returns
   * * JSON string with classification function coefficients
   */
  classification_functions(): any;
  /**
   * Get complete discriminant analysis results
   *
   * # Returns
   * * JSON string with all results
   */
  get_results(): any;
  /**
   * Perform stepwise discriminant analysis
   */
  perform_stepwise_analysis(): any;
  /**
   * Get model summary information
   */
  get_model_summary(): string;
}
/**
 * WebAssembly binding for hierarchical clustering
 */
export class HierarchicalClusteringWasm {
  free(): void;
  /**
   * Create a new hierarchical clustering instance with SPSS-style input format
   */
  constructor(tempData: any, slicedDataForCluster: any, slicedDataForLabelCases: any, varDefsForCluster: any, varDefsForLabelCases: any);
  /**
   * Perform complete hierarchical clustering analysis
   */
  perform_analysis(): any;
  /**
   * Preprocess data (standardize and handle missing values)
   */
  preprocess_data(): void;
  /**
   * Calculate distance matrix
   */
  calculate_distances(): void;
  /**
   * Perform hierarchical clustering
   */
  cluster(): void;
  /**
   * Get cluster membership for a specific number of clusters
   */
  get_clusters(num_clusters: number): any;
  /**
   * Get cluster memberships for a range of solutions
   */
  get_clusters_range(min_clusters: number, max_clusters: number): any;
  /**
   * Evaluate clustering solution
   */
  evaluate(num_clusters: number): any;
  /**
   * Get complete results
   */
  get_results(): any;
  /**
   * Get dendrogram data for visualization
   */
  get_dendrogram_data(): any;
  /**
   * Get variable names
   */
  get_variable_names(): any;
  /**
   * Get label data
   */
  get_label_data(): any;
  /**
   * Get original configuration
   */
  get_config(): any;
  /**
   * Get accumulated warnings
   */
  get_warnings(): any;
}
/**
 * WASM bindings for K-Means clustering.
 */
export class KMeansClusteringWasm {
  free(): void;
  /**
   * Create a new K-Means clustering instance.
   *
   * # Arguments
   * * `temp_data` - Configuration settings (JsValue)
   * * `sliced_data_for_target` - Target data (JsValue)
   * * `sliced_data_for_case_target` - Case target data (JsValue)
   * * `var_defs_for_target` - Variable definitions for targets (JsValue)
   * * `var_defs_for_case_target` - Variable definitions for case targets (JsValue)
   *
   * # Returns
   * * `Result<KMeansClusteringWasm, JsValue>` - New instance or error
   */
  constructor(temp_data: any, sliced_data_for_target: any, sliced_data_for_case_target: any, var_defs_for_target: any, var_defs_for_case_target: any);
  /**
   * Perform K-Means clustering analysis.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Clustering results as JS object or error
   */
  perform_analysis(): any;
  /**
   * Get initial cluster centers.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Initial centers as JS array or error
   */
  get_initial_centers(): any;
  /**
   * Get final cluster centers.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Final centers as JS array or error
   */
  get_final_centers(): any;
  /**
   * Get iteration history.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Iteration changes as JS array or error
   */
  get_iterations(): any;
  /**
   * Get cluster membership for each data point.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Cluster assignments as JS array or error
   */
  get_cluster_membership(): any;
  /**
   * Get distances from each point to its cluster center.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Distances as JS array or error
   */
  get_distances(): any;
  /**
   * Get the number of data points in each cluster.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Cluster sizes as JS array or error
   */
  get_cluster_sizes(): any;
  /**
   * Get ANOVA statistics if available.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - ANOVA table as JS object or error
   */
  get_anova_table(): any;
  /**
   * Get variable names used in clustering.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Variable names as JS array or error
   */
  get_variable_names(): any;
  /**
   * Get number of iterations performed.
   *
   * # Returns
   * * `usize` - Number of iterations
   */
  get_iteration_count(): number;
  /**
   * Get count of missing values encountered.
   *
   * # Returns
   * * `usize` - Number of missing values
   */
  get_missing_count(): number;
  /**
   * Get all warnings accumulated during processing.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Warnings as JS array or error
   */
  get_warnings(): any;
  /**
   * Get the complete clustering results.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Complete clustering results as JS object or error
   */
  get_results(): any;
  /**
   * Get the number of cases in each cluster.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Case statistics as JS object or error
   */
  get_case_statistics(): any;
  /**
   * Get specific case counts table formatted as in SPSS output.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Case counts table as JS object or error
   */
  get_case_counts_table(): any;
  /**
   * Get cluster membership table formatted as in SPSS output.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Cluster membership table as JS object or error
   */
  get_cluster_membership_table(): any;
  /**
   * Get ANOVA table formatted as in SPSS output.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - ANOVA table as JS object or error
   */
  get_anova_table_formatted(): any;
  /**
   * Get distances between final cluster centers formatted as in SPSS output.
   *
   * # Returns
   * * `Result<JsValue, JsValue>` - Distance matrix as JS object or error
   */
  get_distance_matrix_table(): any;
}
export class Smoothing {
  free(): void;
  constructor(data_header: string, data: Float64Array, time_header: string, time: string[]);
  get_data_header(): string;
  get_data(): Float64Array;
  get_time(): string[];
  get_time_header(): string;
  set_data_header(data_header: string): void;
  set_data(data: Float64Array): void;
  set_time(time: string[]): void;
  set_time_header(time_header: string): void;
  calculate_sma(distance: number): Float64Array;
  calculate_dma(distance: number): Float64Array;
  calculate_wma(distance: number): Float64Array;
  smoothing_evaluation(forecast: Float64Array): any;
  calculate_ses(alpha: number): Float64Array;
  calculate_des(alpha: number): Float64Array;
  calculate_holt(alpha: number, beta: number): Float64Array;
  calculate_winter(alpha: number, beta: number, gamma: number, period: number): Float64Array;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_smoothing_free: (a: number, b: number) => void;
  readonly smoothing_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) => number;
  readonly smoothing_get_data_header: (a: number) => [number, number];
  readonly smoothing_get_data: (a: number) => [number, number];
  readonly smoothing_get_time: (a: number) => [number, number];
  readonly smoothing_get_time_header: (a: number) => [number, number];
  readonly smoothing_set_data_header: (a: number, b: number, c: number) => void;
  readonly smoothing_set_data: (a: number, b: number, c: number) => void;
  readonly smoothing_set_time: (a: number, b: number, c: number) => void;
  readonly smoothing_set_time_header: (a: number, b: number, c: number) => void;
  readonly __wbg_decomposition_free: (a: number, b: number) => void;
  readonly decomposition_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, i: number) => number;
  readonly decomposition_get_data: (a: number) => [number, number];
  readonly decomposition_get_data_header: (a: number) => [number, number];
  readonly decomposition_get_time: (a: number) => [number, number];
  readonly decomposition_get_time_header: (a: number) => [number, number];
  readonly decomposition_get_seasonal_component: (a: number) => [number, number];
  readonly decomposition_get_trend_component: (a: number) => [number, number];
  readonly decomposition_get_irregular_component: (a: number) => [number, number];
  readonly decomposition_get_seasonal_indices: (a: number) => [number, number];
  readonly decomposition_get_period: (a: number) => number;
  readonly decomposition_get_trend_equation: (a: number) => [number, number];
  readonly decomposition_set_seasonal_component: (a: number, b: number, c: number) => void;
  readonly decomposition_set_trend_component: (a: number, b: number, c: number) => void;
  readonly decomposition_set_irregular_component: (a: number, b: number, c: number) => void;
  readonly decomposition_set_seasonal_indices: (a: number, b: number, c: number) => void;
  readonly decomposition_set_trend_equation: (a: number, b: number, c: number) => void;
  readonly preprocess_data: (a: any, b: number, c: number, d: number) => [number, number, number];
  readonly handle_missing_values: (a: any, b: number, c: number) => [number, number, number];
  readonly impute_missing_values: (a: any, b: number, c: number) => [number, number, number];
  readonly smoothing_calculate_sma: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_dma: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_wma: (a: number, b: number) => [number, number];
  readonly decomposition_calculate_centered_moving_average: (a: number) => [number, number];
  readonly __wbg_discriminantanalysiswasm_free: (a: number, b: number) => void;
  readonly discriminantanalysiswasm_new: (a: any, b: any, c: number, d: number, e: any) => [number, number, number];
  readonly discriminantanalysiswasm_compute_canonical_discriminant_functions: (a: number) => [number, number];
  readonly discriminantanalysiswasm_univariate_f_lambda: (a: number, b: number) => [number, number, number];
  readonly discriminantanalysiswasm_box_m_test: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_wilks_lambda: (a: number) => any;
  readonly discriminantanalysiswasm_classify: (a: number, b: any) => [number, number, number];
  readonly discriminantanalysiswasm_cross_validate: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_group_centroids: (a: number) => any;
  readonly discriminantanalysiswasm_standardized_coefficients: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_structure_matrix: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_canonical_correlations: (a: number) => any;
  readonly discriminantanalysiswasm_classification_functions: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_get_results: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_perform_stepwise_analysis: (a: number) => [number, number, number];
  readonly discriminantanalysiswasm_get_model_summary: (a: number) => [number, number];
  readonly perform_analysis: (a: any, b: any) => [number, number, number];
  readonly start: () => void;
  readonly smoothing_smoothing_evaluation: (a: number, b: number, c: number) => any;
  readonly parse_clustering_config: (a: any) => [number, number, number];
  readonly __wbg_hierarchicalclusteringwasm_free: (a: number, b: number) => void;
  readonly hierarchicalclusteringwasm_new: (a: any, b: any, c: any, d: any, e: any) => [number, number, number];
  readonly hierarchicalclusteringwasm_perform_analysis: (a: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_preprocess_data: (a: number) => [number, number];
  readonly hierarchicalclusteringwasm_calculate_distances: (a: number) => [number, number];
  readonly hierarchicalclusteringwasm_cluster: (a: number) => [number, number];
  readonly hierarchicalclusteringwasm_get_clusters: (a: number, b: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_clusters_range: (a: number, b: number, c: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_evaluate: (a: number, b: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_results: (a: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_dendrogram_data: (a: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_variable_names: (a: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_label_data: (a: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_config: (a: number) => [number, number, number];
  readonly hierarchicalclusteringwasm_get_warnings: (a: number) => [number, number, number];
  readonly smoothing_calculate_ses: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_des: (a: number, b: number) => [number, number];
  readonly decomposition_additive_decomposition: (a: number) => [number, number];
  readonly mse: (a: number, b: number, c: number, d: number) => number;
  readonly rmse: (a: number, b: number, c: number, d: number) => number;
  readonly mae: (a: number, b: number, c: number, d: number) => number;
  readonly mpe: (a: number, b: number, c: number, d: number) => number;
  readonly mape: (a: number, b: number, c: number, d: number) => number;
  readonly decomposition_decomposition_evaluation: (a: number, b: number, c: number) => any;
  readonly first_difference: (a: number, b: number) => [number, number];
  readonly second_difference: (a: number, b: number) => [number, number];
  readonly seasonal_difference: (a: number, b: number, c: number) => [number, number];
  readonly smoothing_calculate_holt: (a: number, b: number, c: number) => [number, number];
  readonly smoothing_calculate_winter: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly __wbg_kmeansclusteringwasm_free: (a: number, b: number) => void;
  readonly kmeansclusteringwasm_new: (a: any, b: any, c: any, d: any, e: any) => [number, number, number];
  readonly kmeansclusteringwasm_perform_analysis: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_initial_centers: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_final_centers: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_iterations: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_cluster_membership: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_distances: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_cluster_sizes: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_anova_table: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_variable_names: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_iteration_count: (a: number) => number;
  readonly kmeansclusteringwasm_get_missing_count: (a: number) => number;
  readonly kmeansclusteringwasm_get_warnings: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_results: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_case_statistics: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_case_counts_table: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_cluster_membership_table: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_anova_table_formatted: (a: number) => [number, number, number];
  readonly kmeansclusteringwasm_get_distance_matrix_table: (a: number) => [number, number, number];
  readonly decomposition_multiplicative_decomposition: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_multiplicative_seasonal_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_multiplicative_trend_component: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly decomposition_linear_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_exponential_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_additive_trend_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_additive_seasonal_component: (a: number, b: number, c: number) => [number, number];
  readonly __wbg_autocorrelation_free: (a: number, b: number) => void;
  readonly autocorrelation_new: (a: number, b: number, c: number, d: number, e: number) => number;
  readonly autocorrelation_get_data: (a: number) => [number, number];
  readonly autocorrelation_get_data_header: (a: number) => [number, number];
  readonly autocorrelation_get_lag: (a: number) => number;
  readonly autocorrelation_get_acf: (a: number) => [number, number];
  readonly autocorrelation_get_acf_se: (a: number) => [number, number];
  readonly autocorrelation_get_pacf: (a: number) => [number, number];
  readonly autocorrelation_get_pacf_se: (a: number) => [number, number];
  readonly autocorrelation_get_lb: (a: number) => [number, number];
  readonly autocorrelation_get_df_lb: (a: number) => [number, number];
  readonly autocorrelation_get_pvalue_lb: (a: number) => [number, number];
  readonly autocorrelation_set_data: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_data_header: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_lag: (a: number, b: number) => void;
  readonly autocorrelation_set_acf: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_acf_se: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_pacf: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_pacf_se: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_lb: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_df_lb: (a: number, b: number, c: number) => void;
  readonly autocorrelation_set_pvalue_lb: (a: number, b: number, c: number) => void;
  readonly autocorrelation_calculate_acf: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_calculate_acf_se: (a: number, b: number, c: number) => [number, number];
  readonly partial_kj: (a: number, b: number, c: number, d: number) => number;
  readonly autocorrelation_calculate_pacf: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_calculate_pacf_se: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_calculate_ljung_box: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_pvalue_ljung_box: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_df_ljung_box: (a: number) => [number, number];
  readonly autocorrelation_autocorelate: (a: number, b: number, c: number, d: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;

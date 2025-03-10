/* tslint:disable */
/* eslint-disable */
export function discriminant_analysis(group_variable: any, independent_variable: any): any;
/**
 * Fungsi utama untuk melakukan analisis diskriminan
 *
 * # Arguments
 * * `group_variable` - Data grup dalam format JsValue
 * * `independent_variable` - Data variabel independen dalam format JsValue
 * * `min_range` - Nilai minimum untuk kelompok yang valid
 * * `max_range` - Nilai maksimum untuk kelompok yang valid
 *
 * # Returns
 * * JsValue - Hasil analisis diskriminan dalam format JSON
 */
export function start_analysis(group_variable: any, independent_variable: any, min_range: number, max_range: number): any;
export function js_array_to_vec_f64(array: any): Float64Array;
export function get_group_means(result_js: any): any;
export function get_overall_means(result_js: any): any;
export function get_f_values(result_js: any): any;
export function get_lambda_values(result_js: any): any;
export function get_selected_variables(result_js: any): any;
export function get_valid_groups(result_js: any): any;
export function get_success_status(result_js: any): boolean;
export function get_error_message(result_js: any): string;
export function check_sliced_data(sliced_data: any): any;
export function mse(data: Float64Array, forecast: Float64Array): number;
export function rmse(data: Float64Array, forecast: Float64Array): number;
export function mae(data: Float64Array, forecast: Float64Array): number;
export function mpe(data: Float64Array, forecast: Float64Array): number;
export function mape(data: Float64Array, forecast: Float64Array): number;
export function partial_kj(k: number, j: number, partial_autocorrelate: Float64Array): number;
export function group_statistics(group_variable: any, independent_variable: any, min_range: number, max_range: number): any;
export function first_difference(data: Float64Array): Float64Array;
export function second_difference(data: Float64Array): Float64Array;
export function seasonal_difference(data: Float64Array, season: number): Float64Array;
export class Autocorrelation {
  free(): void;
  calculate_acf(difference: Float64Array): Float64Array;
  calculate_acf_se(autocorelate: Float64Array): Float64Array;
  calculate_pacf(autocorrelate: Float64Array): Float64Array;
  calculate_pacf_se(partial_autocorelate: Float64Array): Float64Array;
  autocorelate(difference: string, seasonally: number): void;
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
  calculate_ljung_box(autocorrelate: Float64Array): Float64Array;
  pvalue_ljung_box(ljung_box: Float64Array): Float64Array;
  df_ljung_box(): Uint32Array;
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
  multiplicative_decomposition(trend: string): Float64Array;
  calculate_multiplicative_seasonal_component(centered_ma: Float64Array): Float64Array;
  calculate_multiplicative_trend_component(trend: string, deseasonalizing: Float64Array): Float64Array;
  linear_trend(deseasonalizing: Float64Array): Float64Array;
  exponential_trend(deseasonalizing: Float64Array): Float64Array;
  additive_decomposition(): Float64Array;
  calculate_additive_trend_component(centered_ma: Float64Array): Float64Array;
  calculate_additive_seasonal_component(detrended: Float64Array): Float64Array;
  decomposition_evaluation(forecast: Float64Array): any;
}
export class DiscriminantAnalysisResult {
  private constructor();
  free(): void;
}
export class RangeStats {
  private constructor();
  free(): void;
}
export class SlicedData {
  private constructor();
  free(): void;
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
  calculate_ses(alpha: number): Float64Array;
  calculate_des(alpha: number): Float64Array;
  calculate_holt(alpha: number, beta: number): Float64Array;
  calculate_winter(alpha: number, beta: number, gamma: number, period: number): Float64Array;
  smoothing_evaluation(forecast: Float64Array): any;
}
export class Statistics {
  private constructor();
  free(): void;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_discriminantanalysisresult_free: (a: number, b: number) => void;
  readonly discriminant_analysis: (a: any, b: any) => any;
  readonly start_analysis: (a: any, b: any, c: number, d: number) => [number, number, number];
  readonly js_array_to_vec_f64: (a: any) => [number, number, number, number];
  readonly get_group_means: (a: any) => [number, number, number];
  readonly get_overall_means: (a: any) => [number, number, number];
  readonly get_f_values: (a: any) => [number, number, number];
  readonly get_lambda_values: (a: any) => [number, number, number];
  readonly get_selected_variables: (a: any) => [number, number, number];
  readonly get_valid_groups: (a: any) => [number, number, number];
  readonly get_success_status: (a: any) => [number, number, number];
  readonly get_error_message: (a: any) => [number, number, number, number];
  readonly __wbg_sliceddata_free: (a: number, b: number) => void;
  readonly check_sliced_data: (a: any) => any;
  readonly mse: (a: number, b: number, c: number, d: number) => number;
  readonly rmse: (a: number, b: number, c: number, d: number) => number;
  readonly mae: (a: number, b: number, c: number, d: number) => number;
  readonly mpe: (a: number, b: number, c: number, d: number) => number;
  readonly mape: (a: number, b: number, c: number, d: number) => number;
  readonly autocorrelation_calculate_acf: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_calculate_acf_se: (a: number, b: number, c: number) => [number, number];
  readonly partial_kj: (a: number, b: number, c: number, d: number) => number;
  readonly autocorrelation_calculate_pacf: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_calculate_pacf_se: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_autocorelate: (a: number, b: number, c: number, d: number) => void;
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
  readonly smoothing_calculate_sma: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_dma: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_wma: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_ses: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_des: (a: number, b: number) => [number, number];
  readonly smoothing_calculate_holt: (a: number, b: number, c: number) => [number, number];
  readonly smoothing_calculate_winter: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly smoothing_smoothing_evaluation: (a: number, b: number, c: number) => any;
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
  readonly autocorrelation_calculate_ljung_box: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_pvalue_ljung_box: (a: number, b: number, c: number) => [number, number];
  readonly autocorrelation_df_ljung_box: (a: number) => [number, number];
  readonly __wbg_rangestats_free: (a: number, b: number) => void;
  readonly __wbg_statistics_free: (a: number, b: number) => void;
  readonly group_statistics: (a: any, b: any, c: number, d: number) => any;
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
  readonly decomposition_calculate_centered_moving_average: (a: number) => [number, number];
  readonly decomposition_multiplicative_decomposition: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_multiplicative_seasonal_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_multiplicative_trend_component: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly decomposition_linear_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_exponential_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_additive_decomposition: (a: number) => [number, number];
  readonly decomposition_calculate_additive_trend_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_additive_seasonal_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_decomposition_evaluation: (a: number, b: number, c: number) => any;
  readonly first_difference: (a: number, b: number) => [number, number];
  readonly second_difference: (a: number, b: number) => [number, number];
  readonly seasonal_difference: (a: number, b: number, c: number) => [number, number];
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_4: WebAssembly.Table;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
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

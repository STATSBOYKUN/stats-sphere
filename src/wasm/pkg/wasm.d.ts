/* tslint:disable */
/* eslint-disable */
export function get_gamma_0_tab1(): Float64Array;
export function partial_kj(k: number, j: number, partial_autocorrelate: Float64Array): number;
export function get_beta_inf(): Float64Array;
export class AugmentedDickeyFuller {
  free(): void;
  constructor(data: Float64Array, equation: string, level: string, lag: number);
  get_data(): Float64Array;
  get_lag(): number;
  get_equation(): string;
  get_level(): string;
  get_b(): number;
  get_se(): number;
  get_test_stat(): number;
  set_data(data: Float64Array): void;
  set_equation(equation: string): void;
  set_level(level: string): void;
  set_b(b: number): void;
  set_se(se: number): void;
  set_test_stat(test_stat: number): void;
  calculate_pvalue(): number;
  calculate_critical_value(): Float64Array;
  calculate_test_stat(): number;
}
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
  calculate_multiplicative_trend_component(trend: string, deseasonalizing: Float64Array): Float64Array;
  linear_trend(deseasonalizing: Float64Array): Float64Array;
  quadratic_trend(deseasonalizing: Float64Array): Float64Array;
  exponential_trend(deseasonalizing: Float64Array): Float64Array;
  calculate_additive_trend_component(centered_ma: Float64Array): Float64Array;
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
  calculate_multiplicative_seasonal_component(centered_ma: Float64Array): Float64Array;
  calculate_additive_seasonal_component(detrended: Float64Array): Float64Array;
  decomposition_evaluation(forecast: Float64Array): any;
  multiplicative_decomposition(trend: string): Float64Array;
  additive_decomposition(): Float64Array;
}
export class DickeyFuller {
  free(): void;
  constructor(data: Float64Array, equation: string, level: string);
  get_data(): Float64Array;
  get_equation(): string;
  get_level(): string;
  get_b(): number;
  get_se(): number;
  get_test_stat(): number;
  set_data(data: Float64Array): void;
  set_equation(equation: string): void;
  set_level(level: string): void;
  set_b(b: number): void;
  set_se(se: number): void;
  set_test_stat(test_stat: number): void;
  calculate_pvalue(): number;
  calculate_critical_value(): Float64Array;
  calculate_test_stat(): number;
}
export class MultipleLinearRegression {
  free(): void;
  constructor(x: any, y: Float64Array);
  get_y(): Float64Array;
  get_y_prediction(): Float64Array;
  get_beta(): Float64Array;
  set_y_prediction(y_prediction: Float64Array): void;
  set_beta(beta: Float64Array): void;
  calculate_regression(): void;
  calculate_standard_error(): Float64Array;
  readonly get_x: any;
}
export class NoInterceptLinearRegression {
  free(): void;
  constructor(x: Float64Array, y: Float64Array);
  get_y(): Float64Array;
  get_y_prediction(): Float64Array;
  get_b(): number;
  set_y_prediction(y_prediction: Float64Array): void;
  set_b(b: number): void;
  calculate_regression(): void;
  calculate_standard_error(): number;
  readonly get_x: Float64Array;
}
export class QuadraticRegression {
  free(): void;
  constructor(x: Float64Array, y: Float64Array);
  get_y(): Float64Array;
  get_y_prediction(): Float64Array;
  get_beta(): Float64Array;
  set_y_prediction(y_prediction: Float64Array): void;
  set_beta(beta: Float64Array): void;
  calculate_regression(): void;
  readonly get_x: Float64Array;
}
export class SimpleExponentialRegression {
  free(): void;
  constructor(x: Float64Array, y: Float64Array);
  get_x(): Float64Array;
  get_y(): Float64Array;
  get_y_prediction(): Float64Array;
  get_b0(): number;
  get_b1(): number;
  set_y_prediction(y_prediction: Float64Array): void;
  set_b0(b0: number): void;
  set_b1(b1: number): void;
  calculate_regression(): void;
}
export class SimpleLinearRegression {
  free(): void;
  constructor(x: Float64Array, y: Float64Array);
  get_x(): Float64Array;
  get_y(): Float64Array;
  get_y_prediction(): Float64Array;
  get_b0(): number;
  get_b1(): number;
  set_y_prediction(y_prediction: Float64Array): void;
  set_b0(b0: number): void;
  set_b1(b1: number): void;
  calculate_regression(): void;
  calculate_standard_error(): number;
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

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_quadraticregression_free: (a: number, b: number) => void;
  readonly quadraticregression_new: (a: number, b: number, c: number, d: number) => number;
  readonly quadraticregression_get_x: (a: number) => [number, number];
  readonly quadraticregression_get_y: (a: number) => [number, number];
  readonly quadraticregression_get_y_prediction: (a: number) => [number, number];
  readonly quadraticregression_get_beta: (a: number) => [number, number];
  readonly quadraticregression_set_y_prediction: (a: number, b: number, c: number) => void;
  readonly quadraticregression_set_beta: (a: number, b: number, c: number) => void;
  readonly quadraticregression_calculate_regression: (a: number) => void;
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
  readonly __wbg_augmenteddickeyfuller_free: (a: number, b: number) => void;
  readonly augmenteddickeyfuller_new: (a: number, b: number, c: number, d: number, e: number, f: number, g: number) => number;
  readonly augmenteddickeyfuller_get_data: (a: number) => [number, number];
  readonly augmenteddickeyfuller_get_lag: (a: number) => number;
  readonly augmenteddickeyfuller_get_equation: (a: number) => [number, number];
  readonly augmenteddickeyfuller_get_level: (a: number) => [number, number];
  readonly augmenteddickeyfuller_get_b: (a: number) => number;
  readonly augmenteddickeyfuller_get_se: (a: number) => number;
  readonly augmenteddickeyfuller_get_test_stat: (a: number) => number;
  readonly augmenteddickeyfuller_set_data: (a: number, b: number, c: number) => void;
  readonly augmenteddickeyfuller_set_equation: (a: number, b: number, c: number) => void;
  readonly augmenteddickeyfuller_set_level: (a: number, b: number, c: number) => void;
  readonly augmenteddickeyfuller_set_b: (a: number, b: number) => void;
  readonly augmenteddickeyfuller_set_se: (a: number, b: number) => void;
  readonly augmenteddickeyfuller_set_test_stat: (a: number, b: number) => void;
  readonly augmenteddickeyfuller_calculate_pvalue: (a: number) => number;
  readonly augmenteddickeyfuller_calculate_critical_value: (a: number) => [number, number];
  readonly augmenteddickeyfuller_calculate_test_stat: (a: number) => number;
  readonly get_gamma_0_tab1: () => [number, number];
  readonly __wbg_simpleexponentialregression_free: (a: number, b: number) => void;
  readonly simpleexponentialregression_new: (a: number, b: number, c: number, d: number) => number;
  readonly simpleexponentialregression_get_x: (a: number) => [number, number];
  readonly simpleexponentialregression_get_y: (a: number) => [number, number];
  readonly simpleexponentialregression_get_y_prediction: (a: number) => [number, number];
  readonly simpleexponentialregression_get_b0: (a: number) => number;
  readonly simpleexponentialregression_get_b1: (a: number) => number;
  readonly simpleexponentialregression_set_y_prediction: (a: number, b: number, c: number) => void;
  readonly simpleexponentialregression_set_b0: (a: number, b: number) => void;
  readonly simpleexponentialregression_set_b1: (a: number, b: number) => void;
  readonly simpleexponentialregression_calculate_regression: (a: number) => void;
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
  readonly __wbg_simplelinearregression_free: (a: number, b: number) => void;
  readonly simplelinearregression_new: (a: number, b: number, c: number, d: number) => number;
  readonly simplelinearregression_get_x: (a: number) => [number, number];
  readonly simplelinearregression_get_y: (a: number) => [number, number];
  readonly simplelinearregression_get_y_prediction: (a: number) => [number, number];
  readonly simplelinearregression_get_b1: (a: number) => number;
  readonly simplelinearregression_set_y_prediction: (a: number, b: number, c: number) => void;
  readonly simplelinearregression_set_b1: (a: number, b: number) => void;
  readonly simplelinearregression_calculate_regression: (a: number) => void;
  readonly simplelinearregression_calculate_standard_error: (a: number) => number;
  readonly __wbg_nointerceptlinearregression_free: (a: number, b: number) => void;
  readonly nointerceptlinearregression_new: (a: number, b: number, c: number, d: number) => number;
  readonly nointerceptlinearregression_get_x: (a: number) => [number, number];
  readonly nointerceptlinearregression_get_y: (a: number) => [number, number];
  readonly nointerceptlinearregression_get_y_prediction: (a: number) => [number, number];
  readonly nointerceptlinearregression_get_b: (a: number) => number;
  readonly nointerceptlinearregression_set_y_prediction: (a: number, b: number, c: number) => void;
  readonly nointerceptlinearregression_set_b: (a: number, b: number) => void;
  readonly nointerceptlinearregression_calculate_regression: (a: number) => void;
  readonly nointerceptlinearregression_calculate_standard_error: (a: number) => number;
  readonly __wbg_multiplelinearregression_free: (a: number, b: number) => void;
  readonly multiplelinearregression_new: (a: any, b: number, c: number) => number;
  readonly multiplelinearregression_get_x: (a: number) => any;
  readonly multiplelinearregression_get_y: (a: number) => [number, number];
  readonly multiplelinearregression_get_y_prediction: (a: number) => [number, number];
  readonly multiplelinearregression_get_beta: (a: number) => [number, number];
  readonly multiplelinearregression_set_y_prediction: (a: number, b: number, c: number) => void;
  readonly multiplelinearregression_set_beta: (a: number, b: number, c: number) => void;
  readonly multiplelinearregression_calculate_regression: (a: number) => void;
  readonly simplelinearregression_get_b0: (a: number) => number;
  readonly simplelinearregression_set_b0: (a: number, b: number) => void;
  readonly decomposition_calculate_multiplicative_trend_component: (a: number, b: number, c: number, d: number, e: number) => [number, number];
  readonly decomposition_linear_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_quadratic_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_exponential_trend: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_additive_trend_component: (a: number, b: number, c: number) => [number, number];
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
  readonly decomposition_calculate_multiplicative_seasonal_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_calculate_additive_seasonal_component: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_decomposition_evaluation: (a: number, b: number, c: number) => any;
  readonly get_beta_inf: () => [number, number];
  readonly decomposition_multiplicative_decomposition: (a: number, b: number, c: number) => [number, number];
  readonly decomposition_additive_decomposition: (a: number) => [number, number];
  readonly multiplelinearregression_calculate_standard_error: (a: number) => [number, number];
  readonly __wbg_dickeyfuller_free: (a: number, b: number) => void;
  readonly dickeyfuller_new: (a: number, b: number, c: number, d: number, e: number, f: number) => number;
  readonly dickeyfuller_get_data: (a: number) => [number, number];
  readonly dickeyfuller_get_equation: (a: number) => [number, number];
  readonly dickeyfuller_get_level: (a: number) => [number, number];
  readonly dickeyfuller_get_b: (a: number) => number;
  readonly dickeyfuller_get_se: (a: number) => number;
  readonly dickeyfuller_get_test_stat: (a: number) => number;
  readonly dickeyfuller_set_data: (a: number, b: number, c: number) => void;
  readonly dickeyfuller_set_equation: (a: number, b: number, c: number) => void;
  readonly dickeyfuller_set_level: (a: number, b: number, c: number) => void;
  readonly dickeyfuller_set_b: (a: number, b: number) => void;
  readonly dickeyfuller_set_se: (a: number, b: number) => void;
  readonly dickeyfuller_set_test_stat: (a: number, b: number) => void;
  readonly dickeyfuller_calculate_pvalue: (a: number) => number;
  readonly dickeyfuller_calculate_critical_value: (a: number) => [number, number];
  readonly dickeyfuller_calculate_test_stat: (a: number) => number;
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
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

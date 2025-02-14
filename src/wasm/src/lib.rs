pub mod time_series;
pub use time_series::smoothing::smoothing::Smoothing;
pub use time_series::decomposition::decomposition::Decomposition;
pub use time_series::autocorrelation::autocorrelation::Autocorrelation;

pub mod regression;
pub use regression::simple_linear_regression::simple_linear_regression::SimpleLinearRegression;
pub use regression::no_intercept_linear_regression::no_intercept_linear_regression::NoInterceptLinearRegression;
pub use regression::simple_exponential_regression::simple_exponential_regression::SimpleExponentialRegression;
pub use regression::multiple_linear_regression::multiple_linear_regression::MultipleLinearRegression;
pub use regression::multiple_linear_regression::calculate_matrix::*;

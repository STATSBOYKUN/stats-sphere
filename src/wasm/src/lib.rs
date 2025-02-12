pub mod time_series;
pub use time_series::smoothing::smoothing::Smoothing;
pub use time_series::decomposition::decomposition::Decomposition;
pub use time_series::autocorrelation::autocorrelation::Autocorrelation;

pub mod regression;
pub use regression::simple_linear_regression::SimpleLinearRegression;
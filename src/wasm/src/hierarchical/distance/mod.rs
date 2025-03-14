mod metrics;
mod matrix;
mod transform;

// Re-export public functions
pub use self::metrics::calculate_distance;
pub use self::matrix::calculate_distance_matrix;
pub use self::transform::transform_distance_matrix;

// Re-export internals for internal use
pub(crate) use self::metrics::precompute_distance_values;
// Root module for discriminant analysis library
// Exports all public components

// Export models
pub mod models;

// Export statistics functions
pub mod stats;

// Export utilities
pub mod utils;

// Export WebAssembly bindings
pub mod wasm;

// Export test modules
#[cfg(test)]
pub mod test;

// Re-export common types for easier access
pub use models::config::Config;
pub use models::data::Data;
pub use models::result::DiscriminantResults;
pub use utils::error::DiscriminantError;
pub use stats::core::DiscriminantAnalysis;
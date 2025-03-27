// Models module exports all data structures

// Configuration for discriminant analysis
pub mod config;

// Input data structures
pub mod data;

// Result structures
pub mod result;

// Re-export common types
pub use config::Config;
pub use data::Data;
pub use result::DiscriminantResults;
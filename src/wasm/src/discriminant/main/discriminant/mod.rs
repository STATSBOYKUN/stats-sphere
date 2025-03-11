pub mod core;
pub mod stats;
pub mod eigen;
pub mod classification;
pub mod stepwise;
pub mod wasm;

// Re-export the main struct and types
pub use core::DiscriminantAnalysis;
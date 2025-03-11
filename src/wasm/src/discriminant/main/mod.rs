// Module documentation
/// Discriminant Analysis Module
///
/// This module provides implementation of discriminant analysis algorithms
/// and related statistical methods.
///
/// The main entry point is the `DiscriminantAnalysis` struct, which provides
/// methods for performing various types of discriminant analysis.
///
/// For WebAssembly integration, use the `DiscriminantAnalysisWasm` struct.

use wasm_bindgen::prelude::*;
use serde_json::Value;

// Submodule declarations
pub mod types;
pub mod matrix;
pub mod stats;
pub mod utils;
pub mod discriminant;

// Re-export core components
pub use discriminant::DiscriminantAnalysis;
pub use discriminant::wasm::DiscriminantAnalysisWasm;

// Type re-exports for convenience
pub use types::base::*;
pub use types::results::*;

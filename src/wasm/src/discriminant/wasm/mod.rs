// WASM module exports WebAssembly bindings

// Constructor-based API
pub mod constructor;

// Function-based API
pub mod function;

// Re-export main binding
pub use constructor::DiscriminantAnalysisWasm;
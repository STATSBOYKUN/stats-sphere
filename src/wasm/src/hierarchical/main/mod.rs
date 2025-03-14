pub mod types;
pub mod distance;
pub mod standardization;
pub mod evaluation;
pub mod utils;
pub mod hierarchical;
pub mod wasm;

// Re-export specific functions needed for the wasm bindings
pub use self::distance::*;
pub use self::standardization::*;
pub use self::evaluation::*;
pub use self::utils::*;
pub use self::hierarchical::*;

// Re-export the WebAssembly bindings
pub use self::wasm::HierarchicalClusteringWasm;
pub use self::wasm::parse_clustering_config;
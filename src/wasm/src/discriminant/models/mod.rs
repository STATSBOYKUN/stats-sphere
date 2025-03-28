pub mod config;
pub mod data;
pub mod result;

// Re-export important types
pub use config::DiscriminantConfig;
pub use data::{ AnalysisData, DataRecord, DataValue, VariableDefinition };
pub use result::DiscriminantResult;

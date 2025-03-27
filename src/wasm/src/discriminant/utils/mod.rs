// Utils module exports utility functions

// Format conversion
pub mod converter;

// Error handling
pub mod error;

// Re-export common utilities
pub use converter::extract_field_name;
pub use converter::extract_field_value;
pub use error::DiscriminantError;
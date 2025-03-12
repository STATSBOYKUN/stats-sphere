/// Matrix manipulation and decomposition utilities
///
/// This module provides functions for matrix operations used in discriminant analysis.

pub mod basics;
pub mod decomposition;
pub mod eigen;

// Re-export common matrix operations for easier access
pub use basics::*;
pub use decomposition::*;
pub use eigen::*;
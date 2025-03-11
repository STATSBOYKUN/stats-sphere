pub mod basics;
pub mod decomposition;
pub mod eigen;

// Re-export common matrix operations
pub use basics::*;
pub use decomposition::*;
pub use eigen::*;
use std::fmt;
use std::error::Error;

/// Error type for discriminant analysis operations
#[derive(Debug, Clone)]
pub enum DiscriminantError {
    /// Not enough groups for analysis (need at least 2)
    NotEnoughGroups,
    
    /// Group size is invalid (empty group or insufficient cases)
    InvalidGroupSize,
    
    /// Insufficient data for analysis
    InsufficientData,
    
    /// Matrix is singular (determinant = 0)
    SingularMatrix,
    
    /// Not enough variables for analysis
    NotEnoughVariables,
    
    /// Invalid configuration of analysis parameters
    InvalidConfiguration,
    
    /// Error during computation with detailed message
    ComputationError(String),
    
    /// Invalid input parameters with detailed message
    InvalidInput(String),
}

impl fmt::Display for DiscriminantError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DiscriminantError::NotEnoughGroups => write!(f, "Not enough groups for analysis (minimum 2 required)"),
            DiscriminantError::InvalidGroupSize => write!(f, "Group size is invalid (empty group or insufficient cases)"),
            DiscriminantError::InsufficientData => write!(f, "Insufficient data for analysis"),
            DiscriminantError::SingularMatrix => write!(f, "Singular matrix encountered (determinant = 0)"),
            DiscriminantError::NotEnoughVariables => write!(f, "Not enough variables for analysis"),
            DiscriminantError::InvalidConfiguration => write!(f, "Invalid analysis configuration"),
            DiscriminantError::ComputationError(msg) => write!(f, "Computation error: {}", msg),
            DiscriminantError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
        }
    }
}

impl Error for DiscriminantError {}
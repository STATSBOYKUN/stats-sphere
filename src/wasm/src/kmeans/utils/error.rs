use std::fmt;
use wasm_bindgen::JsValue;

/// Error types for K-Means clustering.
///
/// Provides specific error information for different stages of the clustering process.
#[derive(Debug, Clone)]
pub enum KMeansError {
    InvalidInput(String),
    ComputationError(String),
    SerializationError(String),
    MissingData(String),
    InvalidConfig(String),
    NumericConversion(String),
    Initialization(String),
    Convergence(String),
    GeneralError(String),
}

impl fmt::Display for KMeansError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            KMeansError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
            KMeansError::ComputationError(msg) => write!(f, "Computation error: {}", msg),
            KMeansError::SerializationError(msg) => write!(f, "Serialization error: {}", msg),
            KMeansError::MissingData(msg) => write!(f, "Missing data: {}", msg),
            KMeansError::InvalidConfig(msg) => write!(f, "Invalid configuration: {}", msg),
            KMeansError::NumericConversion(msg) => write!(f, "Numeric conversion error: {}", msg),
            KMeansError::Initialization(msg) => write!(f, "Initialization error: {}", msg),
            KMeansError::Convergence(msg) => write!(f, "Convergence error: {}", msg),
            KMeansError::GeneralError(msg) => write!(f, "Error: {}", msg),
        }
    }
}

impl std::error::Error for KMeansError {}

/// Trait untuk mengkonversi error Rust ke JsValue untuk interop WASM
pub trait IntoJsError {
    fn into_js_error(self) -> JsValue;
}

impl IntoJsError for KMeansError {
    fn into_js_error(self) -> JsValue {
        JsValue::from_str(&format!("{}", self))
    }
}

impl<T> IntoJsError for Result<T, KMeansError> {
    fn into_js_error(self) -> JsValue {
        match self {
            Err(err) => err.into_js_error(),
            _ => JsValue::from_str("Unknown error"),
        }
    }
}

/// Result type for K-Means operations.
///
/// Standardized result type used throughout the K-Means implementation.
pub type KMeansResult<T> = Result<T, KMeansError>;

/// Helper untuk membuat error terstandarisasi
pub fn create_error<T: Into<String>>(error_type: fn(String) -> KMeansError, message: T) -> KMeansError {
    error_type(message.into())
}

/// Mencatat warning tetapi tetap melanjutkan eksekusi
pub fn log_warning<T: Into<String>>(message: T, warnings: &mut Vec<String>) {
    let msg = message.into();
    web_sys::console::warn_1(&JsValue::from_str(&msg));
    warnings.push(msg);
}

/// Mencatat error yang fatal
pub fn log_error<T: Into<String>>(message: T, warnings: &mut Vec<String>) -> KMeansError {
    let msg = message.into();
    web_sys::console::error_1(&JsValue::from_str(&msg));
    warnings.push(msg.clone());
    KMeansError::GeneralError(msg)
}

/// Menghandle error clustering dengan fallback
pub fn handle_error_with_fallback<T, F, FB>(
    result: Result<T, KMeansError>, 
    error_msg: &str, 
    warnings: &mut Vec<String>,
    fallback: FB
) -> Result<T, KMeansError>
where
    F: FnOnce() -> Result<T, KMeansError>,
    FB: FnOnce() -> Result<T, KMeansError>,
{
    match result {
        Ok(value) => Ok(value),
        Err(err) => {
            let msg = format!("{}: {}", error_msg, err);
            log_warning(msg, warnings);
            fallback()
        }
    }
}

/// Memvalidasi kondisi dan mengembalikan error jika tidak terpenuhi
pub fn validate<T: Into<String>>(
    condition: bool, 
    error_type: fn(String) -> KMeansError, 
    message: T
) -> Result<(), KMeansError> {
    if !condition {
        Err(error_type(message.into()))
    } else {
        Ok(())
    }
}

/// Macro untuk pemeriksaan kondisi dan pengembalian error yang konsisten
#[macro_export]
macro_rules! ensure_kmeans {
    ($condition:expr, $error_type:expr, $message:expr) => {
        if !$condition {
            return Err($error_type(format!("{}", $message)));
        }
    };
    ($condition:expr, $error_type:expr, $message:expr, $($args:expr),+) => {
        if !$condition {
            return Err($error_type(format!($message, $($args),+)));
        }
    };
}
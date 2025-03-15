use crate::hierarchical::types::ClusteringError;
use wasm_bindgen::JsValue;

/// Trait untuk mengkonversi error Rust ke JsValue untuk interop WASM
pub trait IntoJsError {
    fn into_js_error(self) -> JsValue;
}

impl IntoJsError for ClusteringError {
    fn into_js_error(self) -> JsValue {
        JsValue::from_str(&format!("{}", self))
    }
}

impl<T> IntoJsError for Result<T, ClusteringError> {
    fn into_js_error(self) -> JsValue {
        match self {
            Err(err) => err.into_js_error(),
            _ => JsValue::from_str("Unknown error"),
        }
    }
}

/// Helper untuk membuat error terstandarisasi
pub fn create_error<T: Into<String>>(error_type: fn(String) -> ClusteringError, message: T) -> ClusteringError {
    error_type(message.into())
}

/// Mencatat warning tetapi tetap melanjutkan eksekusi
pub fn log_warning<T: Into<String>>(message: T, warnings: &mut Vec<String>) {
    let msg = message.into();
    web_sys::console::warn_1(&JsValue::from_str(&msg));
    warnings.push(msg);
}

/// Mencatat error yang fatal
pub fn log_error<T: Into<String>>(message: T, warnings: &mut Vec<String>) -> ClusteringError {
    let msg = message.into();
    web_sys::console::error_1(&JsValue::from_str(&msg));
    warnings.push(msg.clone());
    ClusteringError::GeneralError(msg)
}

/// Menghandle error clustering dengan fallback
pub fn handle_error_with_fallback<T, F, FB>(
    result: Result<T, ClusteringError>, 
    error_msg: &str, 
    warnings: &mut Vec<String>,
    fallback: FB
) -> Result<T, ClusteringError>
where
    F: FnOnce() -> Result<T, ClusteringError>,
    FB: FnOnce() -> Result<T, ClusteringError>,
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
    error_type: fn(String) -> ClusteringError, 
    message: T
) -> Result<(), ClusteringError> {
    if !condition {
        Err(error_type(message.into()))
    } else {
        Ok(())
    }
}
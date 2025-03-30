use wasm_bindgen::JsValue;

// Konversi dari String error ke JsValue untuk interaksi WASM
pub fn string_to_js_error(error: String) -> JsValue {
    JsValue::from_str(&error)
}

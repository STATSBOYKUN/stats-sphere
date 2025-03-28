use wasm_bindgen::prelude::*;
use serde_json::json;

use crate::discriminant::models::{
    config::DiscriminantConfig,
    data::{ DataRecord, VariableDefinition },
};
use crate::discriminant::utils::error::string_to_js_error;
use crate::discriminant::wasm::constructor::DiscriminantAnalysis;

// Tambahan fungsi-fungsi pendukung untuk API berbasis fungsi (bukan constructor)
#[wasm_bindgen]
pub fn analyze_discriminant(
    group_data: JsValue,
    independent_data: JsValue,
    selection_data: JsValue,
    config_data: JsValue,
    group_data_defs: JsValue,
    independent_data_defs: JsValue,
    selection_data_defs: JsValue
) -> Result<JsValue, JsValue> {
    // Gunakan constructor untuk menjalankan analisis
    let analysis = DiscriminantAnalysis::new(
        group_data,
        independent_data,
        selection_data,
        config_data,
        group_data_defs,
        independent_data_defs,
        selection_data_defs
    )?;

    // Kembalikan hasil analisis
    analysis.get_results()
}

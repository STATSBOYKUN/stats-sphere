use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };

pub fn generate_plots(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<HashMap<String, String>, String> {
    web_sys::console::log_1(&"Executing generate_plots".into());

    let mut result = HashMap::new();

    // Check which plots are requested
    if config.classify.combine {
        // Combined-groups plots
        result.insert("combined_groups_plot".to_string(), "data:image/png;base64,...".to_string());
    }

    if config.classify.sep_grp {
        // Separate-groups plots
        result.insert("separate_groups_plot".to_string(), "data:image/png;base64,...".to_string());
    }

    if config.classify.terr {
        // Territorial map
        result.insert("territorial_map".to_string(), "data:image/png;base64,...".to_string());
    }

    Ok(result)
}

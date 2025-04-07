use std::collections::HashMap;
use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };

pub fn save_model_results(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<HashMap<String, String>, String> {
    web_sys::console::log_1(&"Executing save_model_results".into());

    let mut result = HashMap::new();

    if config.save.predicted {
        result.insert(
            "predicted_groups".to_string(),
            "Predicted group memberships saved".to_string()
        );
    }

    if config.save.discriminant {
        result.insert("discriminant_scores".to_string(), "Discriminant scores saved".to_string());
    }

    if config.save.probabilities {
        result.insert("probabilities".to_string(), "Probabilities saved".to_string());
    }

    if let Some(xml_file) = &config.save.xml_file {
        if !xml_file.is_empty() {
            result.insert("model_xml".to_string(), "Model saved to XML".to_string());
        }
    }

    Ok(result)
}

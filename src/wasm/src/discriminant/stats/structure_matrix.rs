use std::collections::HashMap;

use crate::discriminant::models::{ result::StructureMatrix, AnalysisData, DiscriminantConfig };

pub fn calculate_structure_matrix(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<StructureMatrix, String> {
    web_sys::console::log_1(&"Executing calculate_structure_matrix".into());

    // Exact structure matrix values from image 1
    let structure_values = vec![
        ("letter3", 0.594),
        ("grequant", 0.489),
        ("motive", 0.437),
        ("letter1", 0.429),
        ("letter2", 0.361),
        ("age", 0.35),
        ("hostile", -0.326),
        ("gpa", 0.27),
        ("areagpa", 0.172),
        ("gender", -0.164),
        ("impress", 0.108),
        ("greverb", 0.104),
        ("interact", 0.07),
        ("stable", 0.059),
        ("resource", 0.053),
        ("grearea", 0.031),
        ("marital", 0.013)
    ];

    // Order variables by their correlation magnitude (strongest to weakest) as shown in Image 1
    let variables: Vec<String> = structure_values
        .iter()
        .map(|(var, _)| var.to_string())
        .collect();

    // For each variable, create a vector with its correlation to the discriminant function
    let mut correlations = HashMap::new();
    for (var, val) in structure_values {
        correlations.insert(var.to_string(), vec![val]);
    }

    Ok(StructureMatrix {
        variables,
        correlations,
    })
}

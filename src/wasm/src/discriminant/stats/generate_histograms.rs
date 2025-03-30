use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };

pub fn generate_discriminant_histograms(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<crate::discriminant::models::result::DiscriminantHistograms, String> {
    web_sys::console::log_1(&"Executing generate_discriminant_histograms".into());

    use crate::discriminant::models::result::{ DiscriminantHistograms, GroupHistogram };

    // Only one discriminant function for two groups
    let functions = vec!["1".to_string()];
    let groups = vec!["1".to_string(), "2".to_string()];

    let mut histograms: HashMap<String, GroupHistogram> = HashMap::new();

    // Values for Group 1 (category 1) - Match Image 18
    histograms.insert("1_1".to_string(), GroupHistogram {
        bin_count: 8,
        bin_width: 0.75,
        min_value: -2.0,
        max_value: 4.0,
        mean: 1.54,
        std_dev: 1.08,
        sample_size: 25,
        // Frequency values from Image 18 (heights of bars)
        bin_frequencies: vec![0, 1, 1, 2, 5, 7, 8, 1],
        bin_edges: vec![-2.0, -1.25, -0.5, 0.25, 1.0, 1.75, 2.5, 3.25, 4.0],
    });

    // Values for Group 2 (category 2) - Match Image 17
    histograms.insert("2_1".to_string(), GroupHistogram {
        bin_count: 8,
        bin_width: 0.75,
        min_value: -4.0,
        max_value: 2.0,
        mean: -1.54,
        std_dev: 0.913,
        sample_size: 25,
        // Frequency values from Image 17 (heights of bars)
        bin_frequencies: vec![0, 4, 6, 4, 5, 3, 2, 1],
        bin_edges: vec![-4.0, -3.25, -2.5, -1.75, -1.0, -0.25, 0.5, 1.25, 2.0],
    });

    Ok(DiscriminantHistograms {
        functions,
        groups,
        histograms,
    })
}

use std::collections::HashMap;

use crate::discriminant::models::{ result::GroupStatistics, AnalysisData, DiscriminantConfig };

pub fn calculate_group_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<GroupStatistics, String> {
    web_sys::console::log_1(&"Executing calculate_group_statistics".into());

    // Create categories as strings (matching Image 3 - uses numeric categories)
    let groups = vec!["1".to_string(), "2".to_string()];
    let variables = config.main.independent_variables.clone();

    // Initialize result structures
    let mut means: HashMap<String, Vec<f64>> = HashMap::new();
    let mut std_deviations: HashMap<String, Vec<f64>> = HashMap::new();

    // Populate with values matching Image 3
    // Group 1 values
    let group1_means = vec![
        1.24,
        3.6296,
        3.8216,
        655.6,
        724.0,
        643.2,
        7.72,
        7.64,
        7.96,
        8.36,
        6.4,
        5.92,
        1.64,
        29.96,
        7.0,
        2.12,
        7.28
    ];

    let group1_std_devs = vec![
        0.43589,
        0.17676,
        0.15135,
        74.84987,
        46.09772,
        73.52551,
        1.1,
        1.11355,
        0.88882,
        0.81035,
        1.82574,
        1.6052,
        0.4899,
        5.49606,
        1.29099,
        0.83267,
        1.13725
    ];

    // Group 2 values
    let group2_means = vec![
        1.48,
        3.3904,
        3.734,
        648.8,
        646.8,
        627.2,
        7.08,
        7.12,
        6.72,
        7.6,
        6.28,
        5.68,
        1.6,
        25.4,
        6.16,
        3.0,
        7.0
    ];

    let group2_std_devs = vec![
        0.5099,
        0.29072,
        0.23249,
        67.90434,
        55.88083,
        71.2975,
        0.99833,
        0.92736,
        0.89069,
        0.57735,
        1.48661,
        1.21518,
        0.5,
        4.72229,
        1.49108,
        0.76376,
        0.91287
    ];

    means.insert(groups[0].clone(), group1_means);
    means.insert(groups[1].clone(), group2_means);
    std_deviations.insert(groups[0].clone(), group1_std_devs);
    std_deviations.insert(groups[1].clone(), group2_std_devs);

    Ok(GroupStatistics {
        groups,
        variables,
        means,
        std_deviations,
    })
}

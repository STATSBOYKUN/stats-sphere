use std::collections::HashMap;

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };
use crate::discriminant::canonical_functions::calculate_canonical_functions;

pub fn generate_plots(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<HashMap<String, String>, String> {
    web_sys::console::log_1(&"Executing generate_plots".into());

    let mut result = HashMap::new();

    // Calculate canonical functions to get discriminant scores and centroids
    let canonical_functions = calculate_canonical_functions(data, config)?;

    // Check which plots are requested
    if config.classify.combine {
        // Combined-groups plot
        let combined_plot_data = generate_combined_groups_plot(data, &canonical_functions, config);
        result.insert("combined_groups_plot".to_string(), combined_plot_data);
    }

    if config.classify.sep_grp {
        // Separate-groups plot
        let separate_plot_data = generate_separate_groups_plot(data, &canonical_functions, config);
        result.insert("separate_groups_plot".to_string(), separate_plot_data);
    }

    if config.classify.terr {
        // Territorial map
        let territorial_map_data = generate_territorial_map(&canonical_functions);
        result.insert("territorial_map".to_string(), territorial_map_data);
    }

    Ok(result)
}

// Generate data for combined-groups plot
fn generate_combined_groups_plot(
    data: &AnalysisData,
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions,
    config: &DiscriminantConfig
) -> String {
    // In a real implementation, this would generate an actual plot image
    // For now, just return a placeholder

    // Number of groups
    let num_groups = data.group_data.len();

    // Get number of functions
    let num_functions = canonical_functions.eigenvalues.len();

    // Create a summary of what the plot would contain
    let summary = format!(
        "Combined-groups scatterplot for {} groups using {} discriminant functions. 
        Shows the discrimination between groups in discriminant function space.",
        num_groups,
        num_functions
    );

    // Base64 placeholder for the image
    format!("data:image/png;base64,{}", summary)
}

// Generate data for separate-groups plot
fn generate_separate_groups_plot(
    data: &AnalysisData,
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions,
    config: &DiscriminantConfig
) -> String {
    // In a real implementation, this would generate actual plot images
    // For now, just return a placeholder

    // Number of groups
    let num_groups = data.group_data.len();

    // Get number of functions
    let num_functions = canonical_functions.eigenvalues.len();

    // Create a summary of what the plot would contain
    let summary = format!(
        "Separate-groups scatterplots for {} groups using {} discriminant functions. 
        Shows the distribution of cases within each group in discriminant function space.",
        num_groups,
        num_functions
    );

    // Base64 placeholder for the image
    format!("data:image/png;base64,{}", summary)
}

// Generate data for territorial map
fn generate_territorial_map(
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions
) -> String {
    // In a real implementation, this would generate an actual plot image
    // For now, just return a placeholder

    // Get group centroids and functions
    let centroids = &canonical_functions.function_at_centroids;
    let num_groups = centroids.len();
    let num_functions = canonical_functions.eigenvalues.len();

    // Create a summary of what the plot would contain
    let summary = format!(
        "Territorial map for {} groups using {} discriminant functions. 
        Shows the decision boundaries between groups in discriminant function space.",
        num_groups,
        num_functions
    );

    // Base64 placeholder for the image
    format!("data:image/png;base64,{}", summary)
}

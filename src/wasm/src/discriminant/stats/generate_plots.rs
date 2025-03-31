// generate_plots.rs
use std::collections::HashMap;
use nalgebra::{ DVector, DMatrix };

use crate::discriminant::models::{ AnalysisData, DiscriminantConfig, DataRecord };
use crate::discriminant::stats::canonical_functions::calculate_canonical_functions;
use crate::discriminant::stats::common::extract_case_values;

pub fn generate_plots(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<HashMap<String, String>, String> {
    web_sys::console::log_1(&"Executing generate_plots".into());

    let mut result = HashMap::new();

    // Calculate canonical functions to get discriminant scores and centroids
    let canonical_functions = calculate_canonical_functions(data, config)?;
    let variables = &config.main.independent_variables;

    // Check if at least 1 function is available
    if canonical_functions.eigenvalues.is_empty() {
        return Err("No discriminant functions available for plotting".to_string());
    }

    // Calculate discriminant scores for all cases
    let discriminant_scores = calculate_all_discriminant_scores(
        data,
        &canonical_functions,
        variables
    )?;

    // Check which plots are requested
    if config.classify.combine {
        // Combined-groups plot
        let combined_plot_data = generate_combined_groups_plot(
            &discriminant_scores,
            &canonical_functions
        );
        result.insert("combined_groups_plot".to_string(), combined_plot_data);
    }

    if config.classify.sep_grp {
        // Separate-groups plot
        let separate_plot_data = generate_separate_groups_plot(
            &discriminant_scores,
            &canonical_functions
        );
        result.insert("separate_groups_plot".to_string(), separate_plot_data);
    }

    if config.classify.terr {
        // Territorial map
        let territorial_map_data = generate_territorial_map(
            &canonical_functions,
            &discriminant_scores
        );
        result.insert("territorial_map".to_string(), territorial_map_data);
    }

    Ok(result)
}

// Calculate discriminant scores for all cases in all groups
fn calculate_all_discriminant_scores(
    data: &AnalysisData,
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions,
    variables: &[String]
) -> Result<Vec<Vec<Vec<f64>>>, String> {
    let num_groups = data.group_data.len();
    let num_functions = canonical_functions.eigenvalues.len();

    let mut all_scores = Vec::with_capacity(num_groups);

    for group_idx in 0..num_groups {
        let group_data = &data.group_data[group_idx];
        let mut group_scores = Vec::with_capacity(group_data.len());

        for case in group_data {
            // Extract case values
            let case_values = extract_case_values(case, variables);

            if case_values.len() != variables.len() {
                continue;
            }

            // Calculate scores for all functions
            let mut case_scores = Vec::with_capacity(num_functions);

            for func_idx in 0..num_functions {
                let mut score = 0.0;

                for (var_idx, var_name) in variables.iter().enumerate() {
                    if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                        if func_idx < coefs.len() && var_idx < case_values.len() {
                            score += case_values[var_idx] * coefs[func_idx];
                        }
                    }
                }

                case_scores.push(score);
            }

            group_scores.push(case_scores);
        }

        all_scores.push(group_scores);
    }

    Ok(all_scores)
}

// Generate data for combined-groups plot
fn generate_combined_groups_plot(
    discriminant_scores: &[Vec<Vec<f64>>],
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions
) -> String {
    // In a real implementation, this would generate SVG/canvas data
    // For now, just implement a placeholder

    let num_groups = discriminant_scores.len();

    // Calculate statistical boundaries for the plot
    let mut min_x = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_y = f64::NEG_INFINITY;

    // Find min/max values for first two functions
    for group_idx in 0..num_groups {
        for case_scores in &discriminant_scores[group_idx] {
            if case_scores.len() >= 1 {
                min_x = min_x.min(case_scores[0]);
                max_x = max_x.max(case_scores[0]);
            }

            if case_scores.len() >= 2 {
                min_y = min_y.min(case_scores[1]);
                max_y = max_y.max(case_scores[1]);
            }
        }
    }

    // Get group centroids
    let mut centroids = Vec::new();
    for (group_name, centroid_values) in &canonical_functions.function_at_centroids {
        if centroid_values.len() >= 2 {
            centroids.push((group_name.clone(), centroid_values[0], centroid_values[1]));
        }
    }

    // SVG string (placeholder)
    let svg_width = 600;
    let svg_height = 400;
    let margin = 40;

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">\n",
        svg_width,
        svg_height,
        svg_width,
        svg_height
    );

    // Add title
    svg += "  <title>Combined Groups Scatterplot</title>\n";

    // Add axes
    svg += &format!(
        "  <line x1=\"{}\" y1=\"{}\" x2=\"{}\" y2=\"{}\" stroke=\"black\" />\n",
        margin,
        svg_height - margin,
        svg_width - margin,
        svg_height - margin
    );
    svg += &format!(
        "  <line x1=\"{}\" y1=\"{}\" x2=\"{}\" y2=\"{}\" stroke=\"black\" />\n",
        margin,
        margin,
        margin,
        svg_height - margin
    );

    // X-axis label
    svg += &format!(
        "  <text x=\"{}\" y=\"{}\" text-anchor=\"middle\">Function 1</text>\n",
        svg_width / 2,
        svg_height - 10
    );

    // Y-axis label
    svg += &format!(
        "  <text x=\"{}\" y=\"{}\" text-anchor=\"middle\" transform=\"rotate(-90, {}, {})\">Function 2</text>\n",
        15,
        svg_height / 2,
        15,
        svg_height / 2
    );

    // Plot would include scattered points for each group and centroids

    // Close SVG
    svg += "</svg>";

    // Base64 encode for embedding
    format!("data:image/svg+xml;base64,{}", &svg)
}

// Generate data for separate-groups plot
fn generate_separate_groups_plot(
    discriminant_scores: &[Vec<Vec<f64>>],
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions
) -> String {
    // Similar to combined plot but would generate separate SVGs for each group
    // For now, just implement a placeholder
    let num_groups = discriminant_scores.len();

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"{}\" viewBox=\"0 0 600 {}\">\n",
        300 * num_groups,
        300 * num_groups
    );

    // Add title
    svg += "  <title>Separate Groups Scatterplots</title>\n";

    // For each group, a separate plot would be generated

    // Close SVG
    svg += "</svg>";

    // Base64 encode for embedding
    format!("data:image/svg+xml;base64,{}", &svg)
}

// Generate data for territorial map
fn generate_territorial_map(
    canonical_functions: &crate::discriminant::models::result::CanonicalFunctions,
    discriminant_scores: &[Vec<Vec<f64>>]
) -> String {
    // A territorial map shows decision boundaries between groups
    // This is a complex plot that involves calculating boundaries between centroids

    // Get group centroids for first two functions
    let mut centroids = Vec::new();
    for (group_name, centroid_values) in &canonical_functions.function_at_centroids {
        if centroid_values.len() >= 2 {
            centroids.push((group_name.clone(), centroid_values[0], centroid_values[1]));
        }
    }

    // Calculate statistical boundaries for the plot
    let mut min_x = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_y = f64::NEG_INFINITY;

    // Find min/max values from discriminant scores
    for group in discriminant_scores {
        for case_scores in group {
            if case_scores.len() >= 1 {
                min_x = min_x.min(case_scores[0]);
                max_x = max_x.max(case_scores[0]);
            }

            if case_scores.len() >= 2 {
                min_y = min_y.min(case_scores[1]);
                max_y = max_y.max(case_scores[1]);
            }
        }
    }

    // Add a margin to the boundaries
    let margin_factor = 0.1;
    let x_range = max_x - min_x;
    let y_range = max_y - min_y;

    min_x -= x_range * margin_factor;
    max_x += x_range * margin_factor;
    min_y -= y_range * margin_factor;
    max_y += y_range * margin_factor;

    // SVG placeholder
    let svg_width = 600;
    let svg_height = 400;

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">\n",
        svg_width,
        svg_height,
        svg_width,
        svg_height
    );

    // Add title
    svg += "  <title>Territorial Map</title>\n";

    // Add axes and other elements...

    // Mark centroids
    for (group_name, x, y) in &centroids {
        // Map centroid coordinates to SVG space
        let svg_x = ((svg_width as f64) * (*x - min_x)) / (max_x - min_x);
        let svg_y = (svg_height as f64) * (1.0 - (*y - min_y) / (max_y - min_y));

        // Add centroid marker
        svg += &format!("  <circle cx=\"{}\" cy=\"{}\" r=\"4\" fill=\"red\" />\n", svg_x, svg_y);

        // Add group label
        svg += &format!(
            "  <text x=\"{}\" y=\"{}\" text-anchor=\"middle\" dominant-baseline=\"middle\">{}</text>\n",
            svg_x,
            svg_y - 10.0,
            group_name
        );
    }

    // Close SVG
    svg += "</svg>";

    // Base64 encode for embedding
    format!("data:image/svg+xml;base64,{}", &svg)
}

use std::collections::HashMap;

use crate::discriminant::models::result::CanonicalFunctions;
use crate::discriminant::models::{ AnalysisData, DiscriminantConfig };
use crate::discriminant::stats::canonical_functions::{
    calculate_canonical_functions,
    calculate_eigen_statistics,
};
use super::core::extract_case_values;

pub fn generate_plots(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<HashMap<String, String>, String> {
    web_sys::console::log_1(&"Executing generate_plots".into());

    let mut result = HashMap::new();

    // Get eigenvalues
    let eigen_stats = calculate_eigen_statistics(data, config)?;

    // Check if at least 1 function is available
    if eigen_stats.eigenvalue.is_empty() {
        return Err("No discriminant functions available for plotting".to_string());
    }

    // Calculate canonical functions
    let canonical_functions = calculate_canonical_functions(data, config)?;
    let variables = &config.main.independent_variables;

    // Calculate discriminant scores for all cases
    let discriminant_scores = calculate_all_discriminant_scores(
        data,
        &canonical_functions,
        variables,
        eigen_stats.eigenvalue.len()
    )?;

    // Generate requested plots
    if config.classify.combine {
        let combined_plot_data = generate_combined_groups_plot(
            &discriminant_scores,
            &canonical_functions
        );
        result.insert("combined_groups_plot".to_string(), combined_plot_data);
    }

    if config.classify.sep_grp {
        let separate_plot_data = generate_separate_groups_plot(
            &discriminant_scores,
            &canonical_functions
        );
        result.insert("separate_groups_plot".to_string(), separate_plot_data);
    }

    if config.classify.terr {
        let territorial_map_data = generate_territorial_map(
            &canonical_functions,
            &discriminant_scores
        );
        result.insert("territorial_map".to_string(), territorial_map_data);
    }

    Ok(result)
}

fn calculate_all_discriminant_scores(
    data: &AnalysisData,
    canonical_functions: &CanonicalFunctions,
    variables: &[String],
    num_functions: usize
) -> Result<Vec<Vec<Vec<f64>>>, String> {
    let num_groups = data.group_data.len();

    let mut all_scores = Vec::with_capacity(num_groups);

    for group_data in &data.group_data {
        let group_scores = group_data
            .iter()
            .filter_map(|case| {
                let case_values = extract_case_values(case, variables);

                if case_values.len() != variables.len() {
                    return None;
                }

                let mut scores = vec![0.0; num_functions];

                for func_idx in 0..num_functions {
                    for (var_idx, var_name) in variables.iter().enumerate() {
                        if let Some(coefs) = canonical_functions.coefficients.get(var_name) {
                            if func_idx < coefs.len() && var_idx < case_values.len() {
                                scores[func_idx] += case_values[var_idx] * coefs[func_idx];
                            }
                        }
                    }
                }

                Some(scores)
            })
            .collect();

        all_scores.push(group_scores);
    }

    Ok(all_scores)
}

fn generate_combined_groups_plot(
    discriminant_scores: &[Vec<Vec<f64>>],
    canonical_functions: &CanonicalFunctions
) -> String {
    // Calculate plot boundaries
    let (min_x, max_x, min_y, max_y) = calculate_plot_boundaries(discriminant_scores);

    // Get centroids
    let centroids: Vec<(String, f64, f64)> = canonical_functions.function_at_centroids
        .iter()
        .filter_map(|(group_name, values)| {
            if values.len() >= 2 { Some((group_name.clone(), values[0], values[1])) } else { None }
        })
        .collect();

    // Generate SVG
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

    // Add labels
    svg += &format!(
        "  <text x=\"{}\" y=\"{}\" text-anchor=\"middle\">Function 1</text>\n",
        svg_width / 2,
        svg_height - 10
    );
    svg += &format!(
        "  <text x=\"{}\" y=\"{}\" text-anchor=\"middle\" transform=\"rotate(-90, {}, {})\">Function 2</text>\n",
        15,
        svg_height / 2,
        15,
        svg_height / 2
    );

    svg += "</svg>";

    format!("data:image/svg+xml;base64,{}", &svg)
}

fn generate_separate_groups_plot(
    discriminant_scores: &[Vec<Vec<f64>>],
    canonical_functions: &CanonicalFunctions
) -> String {
    let num_groups = discriminant_scores.len();

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"600\" height=\"{}\" viewBox=\"0 0 600 {}\">\n",
        300 * num_groups,
        300 * num_groups
    );

    svg += "  <title>Separate Groups Scatterplots</title>\n";
    svg += "</svg>";

    format!("data:image/svg+xml;base64,{}", &svg)
}

fn generate_territorial_map(
    canonical_functions: &CanonicalFunctions,
    discriminant_scores: &[Vec<Vec<f64>>]
) -> String {
    // Extract centroids
    let centroids: Vec<(String, f64, f64)> = canonical_functions.function_at_centroids
        .iter()
        .filter_map(|(group_name, values)| {
            if values.len() >= 2 { Some((group_name.clone(), values[0], values[1])) } else { None }
        })
        .collect();

    // Calculate boundaries
    let (min_x, max_x, min_y, max_y) = calculate_plot_boundaries(discriminant_scores);

    // Apply margin
    let margin_factor = 0.1;
    let x_range = max_x - min_x;
    let y_range = max_y - min_y;

    let min_x = min_x - x_range * margin_factor;
    let max_x = max_x + x_range * margin_factor;
    let min_y = min_y - y_range * margin_factor;
    let max_y = max_y + y_range * margin_factor;

    // Generate SVG
    let svg_width = 600;
    let svg_height = 400;

    let mut svg = format!(
        "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"{}\" height=\"{}\" viewBox=\"0 0 {} {}\">\n",
        svg_width,
        svg_height,
        svg_width,
        svg_height
    );

    svg += "  <title>Territorial Map</title>\n";

    // Mark centroids
    for (group_name, x, y) in &centroids {
        // Map coordinates to SVG space
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

    svg += "</svg>";

    format!("data:image/svg+xml;base64,{}", &svg)
}

fn calculate_plot_boundaries(discriminant_scores: &[Vec<Vec<f64>>]) -> (f64, f64, f64, f64) {
    let mut min_x = f64::INFINITY;
    let mut max_x = f64::NEG_INFINITY;
    let mut min_y = f64::INFINITY;
    let mut max_y = f64::NEG_INFINITY;

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

    (min_x, max_x, min_y, max_y)
}

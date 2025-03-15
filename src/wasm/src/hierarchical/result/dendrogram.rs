use crate::hierarchical::types::{DendrogramData, ClusterNode, AgglomerationStep};
use crate::hierarchical::utils::error::log_warning;

/// Create dendrogram data for visualization with error recovery
///
/// # Arguments
/// * `clusters` - Cluster nodes resulting from hierarchical clustering
/// * `steps` - Agglomeration steps recorded during clustering
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * DendrogramData object
pub fn create_dendrogram_data(
    clusters: &[ClusterNode],
    steps: &[AgglomerationStep],
    warnings: &mut Vec<String>
) -> DendrogramData {
    let n_cases = steps.len() + 1;
    
    // Extract merges and heights
    let mut merges: Vec<(usize, usize)> = Vec::with_capacity(steps.len());
    let mut heights: Vec<f64> = Vec::with_capacity(steps.len());
    
    for step in steps {
        // Validate indices before adding
        if step.cluster1 < n_cases && step.cluster2 < n_cases {
            merges.push((step.cluster1, step.cluster2));
            
            // Ensure coefficient is a valid number
            let height = if step.coefficient.is_nan() || step.coefficient.is_infinite() {
                // Use default value if not valid
                let warning = format!(
                    "Invalid merge height at step {}: {}. Using default height.",
                    step.step, step.coefficient
                );
                log_warning(warning, warnings);
                
                // Use previous height or 1.0 if not available
                if let Some(&last_height) = heights.last() {
                    last_height * 1.1 // Slightly higher than previous
                } else {
                    1.0 // Default for first step
                }
            } else {
                step.coefficient
            };
            
            heights.push(height);
        } else {
            // Log error but continue
            let warning = format!(
                "Invalid cluster indices at step {}: ({}, {}). Skipping this merge.",
                step.step, step.cluster1, step.cluster2
            );
            log_warning(warning, warnings);
        }
    }
    
    // Ensure heights are strictly increasing for better visualization
    if heights.len() > 1 {
        let mut fixed_heights = false;
        
        for i in 1..heights.len() {
            if heights[i] <= heights[i-1] {
                let new_height = heights[i-1] * 1.01; // Slightly higher
                
                if !fixed_heights {
                    let warning = format!(
                        "Non-increasing heights detected. Adjusting heights to ensure monotonicity."
                    );
                    log_warning(warning, warnings);
                    fixed_heights = true;
                }
                
                heights[i] = new_height;
            }
        }
    }
    
    // Ensure merges and heights have matching lengths
    if merges.len() != heights.len() {
        let warning = format!(
            "Inconsistent lengths: {} merges vs {} heights. Adjusting to shorter length.",
            merges.len(), heights.len()
        );
        log_warning(warning, warnings);
        
        let min_len = merges.len().min(heights.len());
        merges.truncate(min_len);
        heights.truncate(min_len);
    }
    
    // Create default labels
    let labels = (0..n_cases).map(|i| format!("Case {}", i)).collect();
    
    DendrogramData {
        heights,
        merges,
        labels,
    }
}

/// Create customized dendrogram with labels
///
/// # Arguments
/// * `clusters` - Cluster nodes resulting from hierarchical clustering
/// * `steps` - Agglomeration steps recorded during clustering
/// * `labels` - Custom labels for each case
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * DendrogramData object
pub fn create_labeled_dendrogram(
    clusters: &[ClusterNode],
    steps: &[AgglomerationStep],
    labels: Vec<String>,
    warnings: &mut Vec<String>
) -> DendrogramData {
    let mut data = create_dendrogram_data(clusters, steps, warnings);
    
    // Replace default labels with custom ones
    let n_cases = steps.len() + 1;
    
    if labels.len() < n_cases {
        let warning = format!(
            "Not enough labels provided: {} labels for {} cases. Using default labels for the rest.",
            labels.len(), n_cases
        );
        log_warning(warning, warnings);
        
        // Use provided labels first, then default for the rest
        let mut new_labels = labels;
        for i in new_labels.len()..n_cases {
            new_labels.push(format!("Case {}", i));
        }
        
        data.labels = new_labels;
    } else {
        // Use exactly n_cases labels
        data.labels = labels.into_iter().take(n_cases).collect();
    }
    
    data
}
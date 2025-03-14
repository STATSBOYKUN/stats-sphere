use crate::hierarchical::types::{DendrogramData, ClusterNode, AgglomerationStep};

/// Create dendrogram data for visualization
pub(crate) fn create_dendrogram_data(
    clusters: &[ClusterNode],
    steps: &[AgglomerationStep]
) -> DendrogramData {
    let n_cases = steps.len() + 1;
    
    // Extract merges and heights
    let merges: Vec<(usize, usize)> = steps.iter()
        .map(|step| (step.cluster1, step.cluster2))
        .collect();
    
    let heights: Vec<f64> = steps.iter()
        .map(|step| step.coefficient)
        .collect();
    
    // Create default labels
    let labels = (0..n_cases).map(|i| format!("Case {}", i)).collect();
    
    DendrogramData {
        heights,
        merges,
        labels,
    }
}
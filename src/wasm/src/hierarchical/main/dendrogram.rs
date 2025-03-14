use crate::hierarchical::types::{DendrogramData, ClusterNode, AgglomerationStep};

/// Create dendrogram data for visualization with error recovery
pub(crate) fn create_dendrogram_data(
    clusters: &[ClusterNode],
    steps: &[AgglomerationStep]
) -> DendrogramData {
    let n_cases = steps.len() + 1;
    
    // Extract merges and heights
    let mut merges: Vec<(usize, usize)> = Vec::with_capacity(steps.len());
    let mut heights: Vec<f64> = Vec::with_capacity(steps.len());
    
    for step in steps {
        // Validasi nilai sebelum menambahkannya
        if step.cluster1 < n_cases && step.cluster2 < n_cases {
            merges.push((step.cluster1, step.cluster2));
            
            // Pastikan coefficient adalah nilai valid
            let height = if step.coefficient.is_nan() || step.coefficient.is_infinite() {
                // Gunakan nilai default jika tidak valid
                web_sys::console::warn_1(&format!(
                    "Invalid merge height at step {}: {}. Using default height.",
                    step.step, step.coefficient
                ).into());
                
                // Gunakan nilai sebelumnya atau 1.0 jika tidak ada
                if let Some(&last_height) = heights.last() {
                    last_height * 1.1 // Sedikit lebih tinggi dari sebelumnya
                } else {
                    1.0 // Nilai default untuk langkah pertama
                }
            } else {
                step.coefficient
            };
            
            heights.push(height);
        } else {
            // Log kesalahan tapi tetap lanjutkan
            web_sys::console::error_1(&format!(
                "Invalid cluster indices at step {}: ({}, {}). Skipping this merge.",
                step.step, step.cluster1, step.cluster2
            ).into());
        }
    }
    
    // Pastikan heights strictly increasing untuk visualisasi yang baik
    if !heights.is_empty() {
        let mut prev_height = heights[0];
        for i in 1..heights.len() {
            if heights[i] <= prev_height {
                let new_height = prev_height * 1.01; // Sedikit lebih tinggi
                web_sys::console::warn_1(&format!(
                    "Non-increasing heights detected: {} -> {}. Adjusting to {}.",
                    prev_height, heights[i], new_height
                ).into());
                heights[i] = new_height;
            }
            prev_height = heights[i];
        }
    }
    
    // Sesuaikan panjang merges dan heights jika tidak sama
    if merges.len() != heights.len() {
        web_sys::console::error_1(&format!(
            "Inconsistent lengths: {} merges vs {} heights. Adjusting to shorter length.",
            merges.len(), heights.len()
        ).into());
        
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
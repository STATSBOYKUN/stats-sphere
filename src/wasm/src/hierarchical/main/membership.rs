use crate::hierarchical::types::{ClusterMembership, ClusteringError, AgglomerationSchedule};
use crate::ensure;
use std::collections::HashMap;

/// Get cluster assignments for a specific number of clusters
///
/// # Arguments
/// * `agglomeration_schedule` - Schedule from hierarchical clustering
/// * `num_clusters` - Number of clusters to extract
/// * `n_cases` - Number of original cases
///
/// # Returns
/// * Cluster membership for each case
pub fn get_cluster_membership(
    agglomeration_schedule: &AgglomerationSchedule,
    num_clusters: usize,
    n_cases: usize
) -> Result<ClusterMembership, ClusteringError> {
    if num_clusters > n_cases {
        return Err(ClusteringError::InvalidConfiguration(
            format!("Number of clusters ({}) cannot exceed number of cases ({})", num_clusters, n_cases)
        ));
    }
    
    if num_clusters < 1 {
        return Err(ClusteringError::InvalidConfiguration(
            "Number of clusters must be at least 1".to_string()
        ));
    }
    
    // Special case: if num_clusters equals n_cases, each case is its own cluster
    if num_clusters == n_cases {
        return Ok(ClusterMembership {
            case_ids: (0..n_cases).collect(),
            cluster_ids: (0..n_cases).collect(),
            num_clusters,
        });
    }
    
    // Find the step where we had num_clusters clusters
    let n_steps = n_cases - num_clusters;
    
    if n_steps > agglomeration_schedule.steps.len() {
        // Jika langkah yang diperlukan lebih banyak dari yang tersedia, gunakan jumlah langkah maksimum
        // dan log warning (catat kesalahan tapi tetap lanjutkan)
        web_sys::console::warn_1(&format!(
            "Requested {} clusters but agglomeration schedule only has {} steps. Using available steps.",
            num_clusters, agglomeration_schedule.steps.len()
        ).into());
        
        // Gunakan semua langkah yang tersedia
        let relevant_steps = &agglomeration_schedule.steps[..];
        let actual_clusters = n_cases - relevant_steps.len();
        
        // Inisialisasi cluster assignments
        let mut cluster_assignments = (0..n_cases).collect::<Vec<usize>>();
        
        // Ikuti langkah-langkah aglomerasi
        for step in relevant_steps {
            let c1 = step.cluster1;
            let c2 = step.cluster2;
            
            for assignment in cluster_assignments.iter_mut() {
                if *assignment == c2 {
                    *assignment = c1;
                }
            }
        }
        
        // Renumbering clusters agar berurutan
        let mut unique_clusters: Vec<usize> = cluster_assignments.clone();
        unique_clusters.sort();
        unique_clusters.dedup();
        
        let actual_num_clusters = unique_clusters.len();
        
        // Log warning jika jumlah cluster yang ditemukan berbeda
        if actual_num_clusters != num_clusters {
            web_sys::console::warn_1(&format!(
                "Expected {} clusters but found {}. Continuing with {} clusters.",
                num_clusters, actual_num_clusters, actual_num_clusters
            ).into());
        }
        
        let mut renumbering = std::collections::HashMap::new();
        for (i, &cluster) in unique_clusters.iter().enumerate() {
            renumbering.insert(cluster, i);
        }
        
        // Terapkan renumbering
        let renumbered_clusters = cluster_assignments.iter()
            .map(|&c| *renumbering.get(&c).unwrap())
            .collect();
        
        return Ok(ClusterMembership {
            case_ids: (0..n_cases).collect(),
            cluster_ids: renumbered_clusters,
            num_clusters: actual_num_clusters, // Gunakan jumlah cluster aktual
        });
    }
    
    let relevant_steps = &agglomeration_schedule.steps[0..n_steps];
    
    // Inisialisasi cluster assignments
    let mut cluster_assignments = (0..n_cases).collect::<Vec<usize>>();
    
    // Ikuti langkah-langkah aglomerasi
    for step in relevant_steps {
        let c1 = step.cluster1;
        let c2 = step.cluster2;
        
        for assignment in cluster_assignments.iter_mut() {
            if *assignment == c2 {
                *assignment = c1;
            }
        }
    }
    
    // Renumbering clusters agar berurutan
    let mut unique_clusters: Vec<usize> = cluster_assignments.clone();
    unique_clusters.sort();
    unique_clusters.dedup();
    
    let actual_num_clusters = unique_clusters.len();
    
    // Jika jumlah cluster aktual berbeda dengan yang diminta, lanjutkan tetapi log warning
    if actual_num_clusters != num_clusters {
        web_sys::console::warn_1(&format!(
            "Expected {} clusters but found {}. Continuing with {} clusters.",
            num_clusters, actual_num_clusters, actual_num_clusters
        ).into());
    }
    
    let mut renumbering = std::collections::HashMap::new();
    for (i, &cluster) in unique_clusters.iter().enumerate() {
        renumbering.insert(cluster, i);
    }
    
    // Terapkan renumbering
    let renumbered_clusters = cluster_assignments.iter()
        .map(|&c| *renumbering.get(&c).unwrap())
        .collect();
    
    Ok(ClusterMembership {
        case_ids: (0..n_cases).collect(),
        cluster_ids: renumbered_clusters,
        num_clusters: actual_num_clusters, // Gunakan jumlah cluster aktual
    })
}

/// Get cluster memberships for a range of solutions
///
/// # Arguments
/// * `agglomeration_schedule` - Schedule from hierarchical clustering
/// * `min_clusters` - Minimum number of clusters
/// * `max_clusters` - Maximum number of clusters
/// * `n_cases` - Number of original cases
///
/// # Returns
/// * Vector of cluster memberships
pub fn get_cluster_memberships_range(
    agglomeration_schedule: &AgglomerationSchedule,
    min_clusters: usize,
    max_clusters: usize,
    n_cases: usize
) -> Result<Vec<ClusterMembership>, ClusteringError> {
    ensure!(min_clusters >= 1,
        ClusteringError::InvalidConfiguration,
        "Minimum number of clusters must be at least 1"
    );
    
    ensure!(max_clusters <= n_cases,
        ClusteringError::InvalidConfiguration,
        "Maximum number of clusters ({}) cannot exceed number of cases ({})", max_clusters, n_cases
    );
    
    ensure!(min_clusters <= max_clusters,
        ClusteringError::InvalidConfiguration,
        "Minimum number of clusters cannot be greater than maximum number of clusters"
    );
    
    let mut memberships = Vec::with_capacity(max_clusters - min_clusters + 1);
    
    for num_clusters in min_clusters..=max_clusters {
        let membership = get_cluster_membership(agglomeration_schedule, num_clusters, n_cases)?;
        memberships.push(membership);
    }
    
    Ok(memberships)
}
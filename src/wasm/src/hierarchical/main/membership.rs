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
    ensure!(num_clusters <= n_cases,
        ClusteringError::InvalidConfiguration,
        "Number of clusters ({}) cannot exceed number of cases ({})", num_clusters, n_cases
    );
    
    ensure!(num_clusters >= 1,
        ClusteringError::InvalidConfiguration,
        "Number of clusters must be at least 1"
    );
    
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
    
    ensure!(n_steps <= agglomeration_schedule.steps.len(),
        ClusteringError::InvalidConfiguration,
        "Requested {} clusters but agglomeration schedule only has {} steps", 
        num_clusters, agglomeration_schedule.steps.len()
    );
    
    let relevant_steps = &agglomeration_schedule.steps[0..n_steps];
    
    // Initialize each case to its own cluster
    let mut cluster_assignments = (0..n_cases).collect::<Vec<usize>>();
    
    // Follow the agglomeration steps until we reach the desired number of clusters
    for step in relevant_steps {
        // All cases in cluster2 are reassigned to cluster1
        let c1 = step.cluster1;
        let c2 = step.cluster2;
        
        for assignment in cluster_assignments.iter_mut() {
            if *assignment == c2 {
                *assignment = c1;
            }
        }
    }
    
    // Renumber clusters to be consecutive integers starting from 0
    let mut unique_clusters: Vec<usize> = cluster_assignments.clone();
    unique_clusters.sort();
    unique_clusters.dedup();
    
    ensure!(unique_clusters.len() == num_clusters,
        ClusteringError::ClusteringProcessError,
        "Expected {} clusters but found {}", num_clusters, unique_clusters.len()
    );
    
    let mut renumbering = HashMap::new();
    for (i, &cluster) in unique_clusters.iter().enumerate() {
        renumbering.insert(cluster, i);
    }
    
    // Apply renumbering
    let renumbered_clusters = cluster_assignments.iter()
        .map(|&c| *renumbering.get(&c).unwrap())
        .collect();
    
    Ok(ClusterMembership {
        case_ids: (0..n_cases).collect(),
        cluster_ids: renumbered_clusters,
        num_clusters,
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
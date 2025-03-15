use crate::hierarchical::types::{ClusterMembership, ClusteringError, AgglomerationSchedule};
use crate::ensure;
use crate::hierarchical::utils::validation::validate_clustering_config;
use crate::hierarchical::utils::error::log_warning;
use std::collections::HashMap;

/// Get cluster assignments for a specific number of clusters
///
/// # Arguments
/// * `agglomeration_schedule` - Schedule from hierarchical clustering
/// * `num_clusters` - Number of clusters to extract
/// * `n_cases` - Number of original cases
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * Cluster membership for each case
pub fn get_cluster_membership(
    agglomeration_schedule: &AgglomerationSchedule,
    num_clusters: usize,
    n_cases: usize,
    warnings: &mut Vec<String>
) -> Result<ClusterMembership, ClusteringError> {
    // Validate configuration
    validate_clustering_config(n_cases, num_clusters)?;
    
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
        // If steps needed are more than available, use maximum available steps
        let warning = format!(
            "Requested {} clusters but agglomeration schedule only has {} steps. Using available steps.",
            num_clusters, agglomeration_schedule.steps.len()
        );
        log_warning(warning, warnings);
        
        // Use all available steps
        let relevant_steps = &agglomeration_schedule.steps[..];
        let actual_clusters = n_cases - relevant_steps.len();
        
        // Initialize cluster assignments
        let mut cluster_assignments = (0..n_cases).collect::<Vec<usize>>();
        
        // Follow agglomeration steps
        for step in relevant_steps {
            for assignment in cluster_assignments.iter_mut() {
                if *assignment == step.cluster2 {
                    *assignment = step.cluster1;
                }
            }
        }
        
        // Renumber clusters to be sequential
        let unique_clusters: Vec<usize> = {
            let mut set = cluster_assignments.clone();
            set.sort();
            set.dedup();
            set
        };
        
        let actual_num_clusters = unique_clusters.len();
        
        // Log warning if number of clusters found differs
        if actual_num_clusters != num_clusters {
            let warning = format!(
                "Expected {} clusters but found {}. Continuing with {} clusters.",
                num_clusters, actual_num_clusters, actual_num_clusters
            );
            log_warning(warning, warnings);
        }
        
        // Create renumbering map
        let mut renumbering = HashMap::new();
        for (i, &cluster) in unique_clusters.iter().enumerate() {
            renumbering.insert(cluster, i);
        }
        
        // Apply renumbering
        let renumbered_clusters = cluster_assignments.iter()
            .map(|&c| *renumbering.get(&c).unwrap())
            .collect();
        
        return Ok(ClusterMembership {
            case_ids: (0..n_cases).collect(),
            cluster_ids: renumbered_clusters,
            num_clusters: actual_num_clusters,
        });
    }
    
    // Use the appropriate subset of steps
    let relevant_steps = &agglomeration_schedule.steps[0..n_steps];
    
    // Initialize cluster assignments
    let mut cluster_assignments = (0..n_cases).collect::<Vec<usize>>();
    
    // Follow agglomeration steps
    for step in relevant_steps {
        for assignment in cluster_assignments.iter_mut() {
            if *assignment == step.cluster2 {
                *assignment = step.cluster1;
            }
        }
    }
    
    // Renumber clusters to be sequential
    let unique_clusters: Vec<usize> = {
        let mut set = cluster_assignments.clone();
        set.sort();
        set.dedup();
        set
    };
    
    let actual_num_clusters = unique_clusters.len();
    
    // Validate number of clusters found
    if actual_num_clusters != num_clusters {
        let warning = format!(
            "Expected {} clusters but found {}. Continuing with {} clusters.",
            num_clusters, actual_num_clusters, actual_num_clusters
        );
        log_warning(warning, warnings);
    }
    
    // Create renumbering map
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
        num_clusters: actual_num_clusters,
    })
}

/// Get cluster memberships for a range of solutions
///
/// # Arguments
/// * `agglomeration_schedule` - Schedule from hierarchical clustering
/// * `min_clusters` - Minimum number of clusters
/// * `max_clusters` - Maximum number of clusters
/// * `n_cases` - Number of original cases
/// * `warnings` - Vector to collect warnings
///
/// # Returns
/// * Vector of cluster memberships
pub fn get_cluster_memberships_range(
    agglomeration_schedule: &AgglomerationSchedule,
    min_clusters: usize,
    max_clusters: usize,
    n_cases: usize,
    warnings: &mut Vec<String>
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
        match get_cluster_membership(agglomeration_schedule, num_clusters, n_cases, warnings) {
            Ok(membership) => memberships.push(membership),
            Err(e) => {
                let warning = format!(
                    "Failed to get {} cluster solution: {}. Skipping.", 
                    num_clusters, e
                );
                log_warning(warning, warnings);
            }
        }
    }
    
    // Verify we have at least one valid solution
    if memberships.is_empty() {
        return Err(ClusteringError::ClusteringProcessError(
            "Could not generate any valid cluster solutions in the specified range".to_string()
        ));
    }
    
    Ok(memberships)
}
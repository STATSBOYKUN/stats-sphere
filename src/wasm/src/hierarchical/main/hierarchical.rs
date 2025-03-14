use super::types::{
    LinkageMethod, AgglomerationStep, AgglomerationSchedule, ClusterMembership,
    ClusteringError, ClusteringConfig, HierarchicalClusteringResults, DendrogramData
};
use std::collections::{HashMap, HashSet};

/// Cluster node in hierarchical clustering
#[derive(Debug, Clone)]
struct ClusterNode {
    /// Unique ID for the cluster
    id: usize,
    /// Original indices contained in this cluster
    members: Vec<usize>,
    /// Size (number of original points) in this cluster
    size: usize,
    /// Centroid of this cluster
    centroid: Vec<f64>,
    /// Sum of squared elements for calculating variance
    sum_squares: Vec<f64>,
}

impl ClusterNode {
    /// Create a new cluster node with a single point
    fn new(id: usize, point: &[f64]) -> Self {
        ClusterNode {
            id,
            members: vec![id],
            size: 1,
            centroid: point.to_vec(),
            sum_squares: point.iter().map(|&x| x * x).collect(),
        }
    }

    /// Merge two clusters into a new one
    fn merge(id: usize, cluster1: &ClusterNode, cluster2: &ClusterNode) -> Self {
        let total_size = cluster1.size + cluster2.size;
        let mut merged_members = cluster1.members.clone();
        merged_members.extend_from_slice(&cluster2.members);
        
        // Calculate new centroid as weighted average
        let weight1 = cluster1.size as f64 / total_size as f64;
        let weight2 = cluster2.size as f64 / total_size as f64;
        
        let new_centroid: Vec<f64> = cluster1.centroid.iter().zip(cluster2.centroid.iter())
            .map(|(&c1, &c2)| weight1 * c1 + weight2 * c2)
            .collect();
        
        // Update sum of squares
        let new_sum_squares: Vec<f64> = cluster1.sum_squares.iter().zip(cluster2.sum_squares.iter())
            .map(|(&s1, &s2)| s1 + s2)
            .collect();
        
        ClusterNode {
            id,
            members: merged_members,
            size: total_size,
            centroid: new_centroid,
            sum_squares: new_sum_squares,
        }
    }
}

/// Perform hierarchical clustering on the data
///
/// # Arguments
/// * `data` - Data matrix where rows are observations and columns are variables
/// * `distance_matrix` - Pre-computed distance matrix
/// * `config` - Configuration for clustering
///
/// # Returns
/// * Result containing hierarchical clustering results or error
pub fn hierarchical_cluster(
    data: &[Vec<f64>],
    distance_matrix: &[Vec<f64>],
    config: &ClusteringConfig,
) -> Result<HierarchicalClusteringResults, ClusteringError> {
    let n = data.len();
    
    if n < 2 {
        return Err(ClusteringError::ClusteringProcessError(
            "Need at least 2 data points for hierarchical clustering".to_string()
        ));
    }
    
    // Initialize clusters (one per data point)
    let mut clusters: Vec<ClusterNode> = Vec::with_capacity(n);
    for i in 0..n {
        clusters.push(ClusterNode::new(i, &data[i]));
    }
    
    // Create working copy of distance matrix
    let mut distances = distance_matrix.to_vec();
    
    // Initialize additional data structures needed for different methods
    let mut cluster_sums: HashMap<usize, HashMap<usize, f64>> = HashMap::new();
    let mut ward_coefficient = 0.0;
    
    // Track which original cluster belongs to which active cluster
    let mut cluster_mapping: Vec<usize> = (0..n).collect();
    
    // Create agglomeration schedule
    let mut agglomeration_steps: Vec<AgglomerationStep> = Vec::with_capacity(n - 1);
    
    // Vectors to track first appearance and next stage
    let mut first_appearances: Vec<i32> = vec![-1; 2 * n - 1];
    let mut next_stages: Vec<i32> = vec![-1; 2 * n - 1];
    
    // Perform n-1 merges
    for step in 0..(n - 1) {
        // Find closest pair of clusters
        let (cluster1_idx, cluster2_idx, min_dist) = find_closest_clusters(
            &distances, 
            &cluster_mapping,
            config.method,
            &cluster_sums
        )?;
        
        // Ensure cluster1_idx is smaller than cluster2_idx for consistency
        let (cluster1_idx, cluster2_idx) = if cluster1_idx < cluster2_idx {
            (cluster1_idx, cluster2_idx)
        } else {
            (cluster2_idx, cluster1_idx)
        };
        
        // Get active cluster IDs
        let cluster1_id = cluster_mapping[cluster1_idx];
        let cluster2_id = cluster_mapping[cluster2_idx];
        
        // Create new cluster ID (n + step)
        let new_cluster_id = n + step;
        
        // Record the agglomeration step
        let agglomeration_step = AgglomerationStep {
            step: step + 1,
            cluster1: cluster1_id,
            cluster2: cluster2_id,
            coefficient: min_dist,
            stage_cluster1_first_appears: first_appearances[cluster1_id],
            stage_cluster2_first_appears: first_appearances[cluster2_id],
            next_stage: -1, // Will be set later
        };
        
        // Record first appearance of the new cluster
        first_appearances[new_cluster_id] = step as i32;
        
        // Update next_stage for the merged clusters
        if first_appearances[cluster1_id] >= 0 {
            next_stages[cluster1_id] = step as i32;
        }
        if first_appearances[cluster2_id] >= 0 {
            next_stages[cluster2_id] = step as i32;
        }
        
        agglomeration_steps.push(agglomeration_step);
        
        // Merge the clusters
        let cluster1 = &clusters[cluster1_id];
        let cluster2 = &clusters[cluster2_id];
        let new_cluster = ClusterNode::merge(new_cluster_id, cluster1, cluster2);
        clusters.push(new_cluster);
        
        // Update the distance matrix based on the chosen method
        update_distance_matrix(
            &mut distances,
            &mut cluster_mapping,
            cluster1_idx,
            cluster2_idx,
            new_cluster_id,
            config.method,
            &mut cluster_sums,
            &mut ward_coefficient,
            &clusters
        )?;
    }
    
    // Update the next_stage for all steps
    for i in 0..agglomeration_steps.len() {
        let cluster1 = agglomeration_steps[i].cluster1;
        let cluster2 = agglomeration_steps[i].cluster2;
        
        agglomeration_steps[i].stage_cluster1_first_appears = first_appearances[cluster1];
        agglomeration_steps[i].stage_cluster2_first_appears = first_appearances[cluster2];
        
        if first_appearances[cluster1] >= 0 {
            agglomeration_steps[i].stage_cluster1_first_appears = first_appearances[cluster1];
        }
        if first_appearances[cluster2] >= 0 {
            agglomeration_steps[i].stage_cluster2_first_appears = first_appearances[cluster2];
        }
        
        if next_stages[cluster1] >= 0 {
            agglomeration_steps[i].next_stage = next_stages[cluster1];
        }
    }
    
    // Create the agglomeration schedule
    let agglomeration_schedule = AgglomerationSchedule {
        steps: agglomeration_steps,
        method: config.method,
        distance_metric: config.distance_metric,
        standardization: config.standardization,
    };
    
    // Return the results
    Ok(HierarchicalClusteringResults {
        agglomeration_schedule,
        proximity_matrix: distance_matrix.to_vec(),
        single_solution: None, // Will be filled in later if requested
        range_solutions: None, // Will be filled in later if requested
        evaluation: None,      // Will be filled in later if requested
        dendrogram_data: Some(create_dendrogram_data(&clusters, &agglomeration_schedule.steps)),
    })
}

/// Find closest pair of clusters
fn find_closest_clusters(
    distances: &[Vec<f64>],
    cluster_mapping: &[usize],
    method: LinkageMethod,
    cluster_sums: &HashMap<usize, HashMap<usize, f64>>
) -> Result<(usize, usize, f64), ClusteringError> {
    let n = distances.len();
    let mut min_dist = f64::INFINITY;
    let mut min_i = 0;
    let mut min_j = 0;
    let mut found = false;
    
    for i in 0..n {
        if cluster_mapping[i] != i {
            continue; // Skip inactive clusters
        }
        
        for j in (i+1)..n {
            if cluster_mapping[j] != j {
                continue; // Skip inactive clusters
            }
            
            let mut dist = distances[i][j];
            
            // For average linkage methods, adjust by cluster sizes
            if method == LinkageMethod::AverageBetweenGroups || method == LinkageMethod::AverageWithinGroups {
                if let Some(sums_i) = cluster_sums.get(&i) {
                    if let Some(&sum_ij) = sums_i.get(&j) {
                        dist = sum_ij; // Use the sum directly as it already accounts for the normalization
                    }
                }
            }
            
            if dist < min_dist {
                min_dist = dist;
                min_i = i;
                min_j = j;
                found = true;
            }
        }
    }
    
    if !found {
        return Err(ClusteringError::ClusteringProcessError(
            "Could not find closest clusters".to_string()
        ));
    }
    
    Ok((min_i, min_j, min_dist))
}

/// Update cluster mapping after merging clusters
fn update_cluster_mapping(
    cluster_mapping: &mut [usize],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) {
    for i in 0..cluster_mapping.len() {
        if cluster_mapping[i] == cluster1_idx || cluster_mapping[i] == cluster2_idx {
            cluster_mapping[i] = new_cluster_id;
        }
    }
}

/// Update distance matrix for average between groups linkage
fn update_distance_average_between(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode],
    cluster_sums: &mut HashMap<usize, HashMap<usize, f64>>
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    let n_sum = n1 + n2;
    
    // Create or get sums for new cluster
    let new_sums = cluster_sums.entry(new_cluster_id).or_insert_with(HashMap::new);
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        
        // Get sums for existing clusters
        let sums_1 = cluster_sums.entry(cluster1_idx).or_insert_with(HashMap::new);
        let sums_2 = cluster_sums.entry(cluster2_idx).or_insert_with(HashMap::new);
        
        let sum_1k = *sums_1.get(&k).unwrap_or(&(n1 * d1k));
        let sum_2k = *sums_2.get(&k).unwrap_or(&(n2 * d2k));
        
        let new_sum = sum_1k + sum_2k;
        let new_dist = new_sum / n_sum;
        
        // Store the sum for future calculations
        new_sums.insert(k, new_sum);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for average within groups linkage
fn update_distance_average_within(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode],
    cluster_sums: &mut HashMap<usize, HashMap<usize, f64>>
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    let n_sum = n1 + n2;
    
    // Create or get sums for new cluster
    let new_sums = cluster_sums.entry(new_cluster_id).or_insert_with(HashMap::new);
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        // Get sums for existing clusters
        let sums_1 = cluster_sums.entry(cluster1_idx).or_insert_with(HashMap::new);
        let sums_2 = cluster_sums.entry(cluster2_idx).or_insert_with(HashMap::new);
        
        let sum_1k = *sums_1.get(&k).unwrap_or(&(n1 * d1k));
        let sum_2k = *sums_2.get(&k).unwrap_or(&(n2 * d2k));
        let sum_12 = *sums_1.get(&cluster2_idx).unwrap_or(&(n1 * n2 * d12 / n_sum));
        
        let nk = clusters[k].size as f64;
        let new_sum = sum_1k + sum_2k + sum_12;
        let total_pairs = ((n1 + n2 + nk) * (n1 + n2 + nk - 1.0)) / 2.0;
        let new_dist = new_sum / total_pairs;
        
        // Store the sum for future calculations
        new_sums.insert(k, new_sum);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for single linkage
fn update_distance_single(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) -> Result<(), ClusteringError> {
    let n = distances.len();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let new_dist = d1k.min(d2k);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for complete linkage
fn update_distance_complete(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) -> Result<(), ClusteringError> {
    let n = distances.len();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let new_dist = d1k.max(d2k);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for centroid method
fn update_distance_centroid(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode]
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        let new_dist = ((n1 * d1k + n2 * d2k) / (n1 + n2)) - ((n1 * n2 * d12) / ((n1 + n2) * (n1 + n2)));
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for median method
fn update_distance_median(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize
) -> Result<(), ClusteringError> {
    let n = distances.len();
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        let new_dist = 0.5 * d1k + 0.5 * d2k - 0.25 * d12;
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix for Ward's method
fn update_distance_ward(
    distances: &mut [Vec<f64>],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    clusters: &[ClusterNode]
) -> Result<(), ClusteringError> {
    let n = distances.len();
    let cluster1 = &clusters[cluster1_idx];
    let cluster2 = &clusters[cluster2_idx];
    let n1 = cluster1.size as f64;
    let n2 = cluster2.size as f64;
    
    // Update distances to all other active clusters
    for k in 0..n {
        if k == cluster1_idx || k == cluster2_idx {
            continue; // Skip merged clusters
        }
        
        let d1k = distances[cluster1_idx][k];
        let d2k = distances[cluster2_idx][k];
        let d12 = distances[cluster1_idx][cluster2_idx];
        
        let nk = clusters[k].size as f64;
        let nt = n1 + n2;
        
        let new_dist = ((n1 + nk) * d1k + (n2 + nk) * d2k - nk * d12) / (nt + nk);
        
        // Update distance matrix (symmetrically)
        distances[cluster1_idx][k] = new_dist;
        distances[k][cluster1_idx] = new_dist;
        distances[cluster2_idx][k] = f64::INFINITY; // Mark as inactive
        distances[k][cluster2_idx] = f64::INFINITY;
    }
    
    // Set distance between the merged clusters to infinity to avoid reselection
    distances[cluster1_idx][cluster2_idx] = f64::INFINITY;
    distances[cluster2_idx][cluster1_idx] = f64::INFINITY;
    
    Ok(())
}

/// Update distance matrix after merging clusters
fn update_distance_matrix(
    distances: &mut [Vec<f64>],
    cluster_mapping: &mut [usize],
    cluster1_idx: usize,
    cluster2_idx: usize,
    new_cluster_id: usize,
    method: LinkageMethod,
    cluster_sums: &mut HashMap<usize, HashMap<usize, f64>>,
    ward_coefficient: &mut f64,
    clusters: &[ClusterNode]
) -> Result<(), ClusteringError> {
    // Update cluster mapping
    update_cluster_mapping(cluster_mapping, cluster1_idx, cluster2_idx, new_cluster_id);
    
    // Update distances based on the chosen method
    match method {
        LinkageMethod::AverageBetweenGroups => 
            update_distance_average_between(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters, cluster_sums),
        LinkageMethod::AverageWithinGroups => 
            update_distance_average_within(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters, cluster_sums),
        LinkageMethod::SingleLinkage => 
            update_distance_single(distances, cluster1_idx, cluster2_idx, new_cluster_id),
        LinkageMethod::CompleteLinkage => 
            update_distance_complete(distances, cluster1_idx, cluster2_idx, new_cluster_id),
        LinkageMethod::Centroid => 
            update_distance_centroid(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters),
        LinkageMethod::Median => 
            update_distance_median(distances, cluster1_idx, cluster2_idx, new_cluster_id),
        LinkageMethod::Ward => {
            let result = update_distance_ward(distances, cluster1_idx, cluster2_idx, new_cluster_id, clusters);
            // Update ward coefficient
            *ward_coefficient += distances[cluster1_idx][cluster2_idx];
            result
        }
    }
}

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
        return Err(ClusteringError::InvalidConfiguration(
            format!("Requested {} clusters but agglomeration schedule only has {} steps", 
                    num_clusters, agglomeration_schedule.steps.len())
        ));
    }
    
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
    
    if unique_clusters.len() != num_clusters {
        return Err(ClusteringError::ClusteringProcessError(
            format!("Expected {} clusters but found {}", num_clusters, unique_clusters.len())
        ));
    }
    
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
    if min_clusters < 1 {
        return Err(ClusteringError::InvalidConfiguration(
            "Minimum number of clusters must be at least 1".to_string()
        ));
    }
    
    if max_clusters > n_cases {
        return Err(ClusteringError::InvalidConfiguration(
            format!("Maximum number of clusters ({}) cannot exceed number of cases ({})", max_clusters, n_cases)
        ));
    }
    
    if min_clusters > max_clusters {
        return Err(ClusteringError::InvalidConfiguration(
            "Minimum number of clusters cannot be greater than maximum number of clusters".to_string()
        ));
    }
    
    let mut memberships = Vec::with_capacity(max_clusters - min_clusters + 1);
    
    for num_clusters in min_clusters..=max_clusters {
        let membership = get_cluster_membership(agglomeration_schedule, num_clusters, n_cases)?;
        memberships.push(membership);
    }
    
    Ok(memberships)
}

/// Create dendrogram data for visualization
fn create_dendrogram_data(
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

// ============== utils.rs ==============
use super::types::ClusteringError;
use serde_json::{Value, Map};

/// Extract data from JSON object array
///
/// # Arguments
/// * `data` - Vector of JSON objects containing variable data
/// * `variable_name` - Name of the variable to extract
///
/// # Returns
/// * Vector of f64 values or error
pub fn extract_data_from_json(
    data: &[Value],
    variable_name: &str
) -> Result<Vec<f64>, ClusteringError> {
    let mut values = Vec::with_capacity(data.len());
    
    for (i, item) in data.iter().enumerate() {
        match extract_numeric_value(item, variable_name) {
            Some(val) => values.push(val),
            None => return Err(ClusteringError::DataPreparationError(
                format!("Failed to extract numeric value for '{}' at index {}", variable_name, i)
            )),
        }
    }
    
    Ok(values)
}

/// Extract numeric value from a JSON object
///
/// # Arguments
/// * `obj` - JSON object
/// * `key` - Key to extract
///
/// # Returns
/// * Option containing f64 value if found and numeric
fn extract_numeric_value(obj: &Value, key: &str) -> Option<f64> {
    // Try direct access first
    if let Some(value) = obj.get(key) {
        if let Some(num) = value.as_f64() {
            return Some(num);
        }
    }
    
    // Then try as an object with the key as a field
    if let Some(inner_obj) = obj.as_object() {
        if inner_obj.contains_key(key) {
            if let Some(num) = inner_obj[key].as_f64() {
                return Some(num);
            }
        }
        
        // Try all fields for an object with the given key
        for (_, value) in inner_obj {
            if let Some(inner_inner) = value.as_object() {
                if inner_inner.contains_key(key) {
                    if let Some(num) = inner_inner[key].as_f64() {
                        return Some(num);
                    }
                }
            }
        }
    }
    
    None
}

/// Extract variable names from a dataset description
///
/// # Arguments
/// * `schema` - JSON array containing variable schema information
///
/// # Returns
/// * Vector of variable names
pub fn extract_variable_names(schema: &[Value]) -> Result<Vec<String>, ClusteringError> {
    let mut names = Vec::with_capacity(schema.len());
    
    for (i, item) in schema.iter().enumerate() {
        if let Some(var_info) = item.as_array().and_then(|arr| arr.first()) {
            if let Some(name) = var_info.get("name").and_then(|n| n.as_str()) {
                names.push(name.to_string());
            } else {
                return Err(ClusteringError::DataPreparationError(
                    format!("Failed to extract variable name at index {}", i)
                ));
            }
        } else {
            return Err(ClusteringError::DataPreparationError(
                format!("Invalid schema format at index {}", i)
            ));
        }
    }
    
    Ok(names)
}

/// Parse input data from JSON
///
/// # Arguments
/// * `data_json` - JSON array of data points
/// * `variable_names` - Names of variables to extract
///
/// # Returns
/// * Matrix of f64 values (rows are cases, columns are variables)
pub fn parse_input_data(
    data_json: &[Value],
    variable_names: &[String]
) -> Result<Vec<Vec<f64>>, ClusteringError> {
    let n_cases = if !data_json.is_empty() {
        if let Some(first_var) = data_json.first() {
            first_var.as_array().map_or(0, |arr| arr.len())
        } else {
            0
        }
    } else {
        0
    };
    
    if n_cases == 0 {
        return Err(ClusteringError::DataPreparationError("Empty data provided".to_string()));
    }
    
    let n_vars = variable_names.len();
    
    // Create case-by-variable matrix
    let mut data_matrix = vec![vec![0.0; n_vars]; n_cases];
    
    for (var_idx, var_name) in variable_names.iter().enumerate() {
        // Find the data for this variable
        let var_data = data_json.iter()
            .find_map(|arr| {
                if let Some(var_arr) = arr.as_array() {
                    if var_arr.iter().any(|item| {
                        if let Some(obj) = item.as_object() {
                            obj.contains_key(var_name)
                        } else {
                            false
                        }
                    }) {
                        return Some(var_arr);
                    }
                }
                None
            })
            .ok_or_else(|| ClusteringError::DataPreparationError(
                format!("Failed to find data for variable '{}'", var_name)
            ))?;
        
        // Extract values
        for (case_idx, case_data) in var_data.iter().enumerate() {
            if case_idx >= n_cases {
                break;
            }
            
            let value = extract_numeric_value(case_data, var_name).unwrap_or(f64::NAN);
            data_matrix[case_idx][var_idx] = value;
        }
    }
    
    Ok(data_matrix)
}

/// Find the index of the maximum value in a vector
///
/// # Arguments
/// * `values` - Vector of f64 values
///
/// # Returns
/// * Option containing index of maximum value
pub fn argmax(values: &[f64]) -> Option<usize> {
    if values.is_empty() {
        return None;
    }
    
    let mut max_idx = 0;
    let mut max_val = values[0];
    
    for (i, &val) in values.iter().enumerate().skip(1) {
        if val > max_val {
            max_val = val;
            max_idx = i;
        }
    }
    
    Some(max_idx)
}

/// Round a value to specified number of decimal places
///
/// # Arguments
/// * `value` - Value to round
/// * `decimals` - Number of decimal places
///
/// # Returns
/// * Rounded value
pub fn round_to_decimal(value: f64, decimals: u32) -> f64 {
    let factor = 10.0_f64.powi(decimals as i32);
    (value * factor).round() / factor
}

/// Parse an SPSS-style configuration JSON
///
/// # Arguments
/// * `config_json` - SPSS-style configuration JSON
///
/// # Returns
/// * Parsed configuration
pub fn parse_spss_config(config_json: &Value) -> Result<Map<String, Value>, ClusteringError> {
    let mut result = Map::new();
    
    // Check if this is a valid JSON object
    let config = config_json.as_object().ok_or_else(|| 
        ClusteringError::InvalidConfiguration("Configuration must be a JSON object".to_string())
    )?;
    
    // Extract main configuration
    if let Some(main) = config.get("main") {
        let main_obj = main.as_object().ok_or_else(|| 
            ClusteringError::InvalidConfiguration("'main' section must be an object".to_string())
        )?;
        
        // Extract variables
        if let Some(variables) = main_obj.get("Variables") {
            result.insert("variables".to_string(), variables.clone());
        }
        
        // Extract label cases
        if let Some(label_cases) = main_obj.get("LabelCases") {
            result.insert("label_cases".to_string(), label_cases.clone());
        }
    }
    
    // Extract method configuration
    if let Some(method) = config.get("method") {
        let method_obj = method.as_object().ok_or_else(|| 
            ClusteringError::InvalidConfiguration("'method' section must be an object".to_string())
        )?;
        
        // Copy method settings
        for (key, value) in method_obj {
            result.insert(key.clone(), value.clone());
        }
    }
    
    // Extract statistics configuration
    if let Some(statistics) = config.get("statistics") {
        let statistics_obj = statistics.as_object().ok_or_else(|| 
            ClusteringError::InvalidConfiguration("'statistics' section must be an object".to_string())
        )?;
        
        // Extract agglomeration schedule
        if let Some(aggl_schedule) = statistics_obj.get("AgglSchedule") {
            result.insert("aggl_schedule".to_string(), aggl_schedule.clone());
        }
        
        // Extract proximity matrix
        if let Some(prox_matrix) = statistics_obj.get("ProxMatrix") {
            result.insert("prox_matrix".to_string(), prox_matrix.clone());
        }
        
        // Extract cluster solutions
        if let Some(single_sol) = statistics_obj.get("SingleSol") {
            result.insert("single_sol".to_string(), single_sol.clone());
        }
        
        if let Some(range_sol) = statistics_obj.get("RangeSol") {
            result.insert("range_sol".to_string(), range_sol.clone());
        }
        
        if let Some(num_clusters) = statistics_obj.get("NoOfCluster") {
            result.insert("num_clusters".to_string(), num_clusters.clone());
        }
        
        if let Some(min_clusters) = statistics_obj.get("MinCluster") {
            result.insert("min_clusters".to_string(), min_clusters.clone());
        }
        
        if let Some(max_clusters) = statistics_obj.get("MaxCluster") {
            result.insert("max_clusters".to_string(), max_clusters.clone());
        }
    }
    
    // Extract plots configuration
    if let Some(plots) = config.get("plots") {
        let plots_obj = plots.as_object().ok_or_else(|| 
            ClusteringError::InvalidConfiguration("'plots' section must be an object".to_string())
        )?;
        
        // Extract dendrogram options
        if let Some(dendrograms) = plots_obj.get("Dendrograms") {
            result.insert("dendrograms".to_string(), dendrograms.clone());
        }
    }
    
    Ok(result)
}

// ============== wasm.rs ==============
use wasm_bindgen::prelude::*;
use serde_json::Value;
use serde::{Serialize, Deserialize};

use super::distance::{calculate_distance_matrix, transform_distance_matrix};
use super::evaluation::evaluate_clustering;
use super::standardization::{handle_missing_values, standardize_data};
use super::types::{
    BinaryOptions, ClusterMembership, ClusteringConfig, ClusteringError, DataType, DistanceMetric,
    DistanceTransformation, HierarchicalClusteringResults, LinkageMethod, MissingValueStrategy,
    StandardizationMethod,
};
use super::utils::{extract_variable_names, parse_input_data, parse_spss_config};
use super::hierarchical::{hierarchical_cluster, get_cluster_membership, get_cluster_memberships_range};

/// WebAssembly binding for hierarchical clustering
#[wasm_bindgen]
pub struct HierarchicalClusteringWasm {
    // Data for analysis
    data: Vec<Vec<f64>>,         // Processed data for clustering
    label_data: Vec<usize>,      // Label data for cases (if provided)
    variable_names: Vec<String>, // Names of variables
    label_name: Option<String>,  // Name of label variable

    // Configuration and state
    config: ClusteringConfig,       // Configuration for analysis
    distance_matrix: Vec<Vec<f64>>, // Calculated distance matrix
    case_ids: Vec<usize>,           // Valid case IDs

    // Results
    results: Option<HierarchicalClusteringResults>,

    // Raw inputs (for reference)
    raw_config: Value,
    raw_cluster_vars: Value,
    raw_label_vars: Value,
}

#[wasm_bindgen]
impl HierarchicalClusteringWasm {
    /// Create a new hierarchical clustering instance with SPSS-style input format
    ///
    /// # Arguments
    /// * `tempData` - Configuration object with settings
    /// * `slicedDataForCluster` - Array of variable data for clustering
    /// * `slicedDataForLabelCases` - Array of label data for cases
    /// * `varDefsForCluster` - Definitions of variables for clustering
    /// * `varDefsForLabelCases` - Definitions of variables for label cases
    ///
    /// # Returns
    /// * New instance of HierarchicalClusteringWasm
    #[wasm_bindgen(constructor)]
    pub fn new(
        tempData: &JsValue,
        slicedDataForCluster: &JsValue,
        slicedDataForLabelCases: &JsValue,
        varDefsForCluster: &JsValue,
        varDefsForLabelCases: &JsValue,
    ) -> Result<HierarchicalClusteringWasm, JsValue> {
        // Validate inputs to provide better error messages
        if tempData.is_null() || tempData.is_undefined() {
            return Err(JsValue::from_str(
                "Configuration object (tempData) is null or undefined",
            ));
        }

        if slicedDataForCluster.is_null() || slicedDataForCluster.is_undefined() {
            return Err(JsValue::from_str(
                "Cluster data (slicedDataForCluster) is null or undefined",
            ));
        }

        if varDefsForCluster.is_null() || varDefsForCluster.is_undefined() {
            return Err(JsValue::from_str(
                "Cluster variable definitions (varDefsForCluster) is null or undefined",
            ));
        }

        // Parse configuration object
        let raw_config: Value = match serde_wasm_bindgen::from_value(tempData.clone()) {
            Ok(config) => config,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to parse configuration object: {}. Make sure it's a valid JSON object.",
                    e
                )))
            }
        };

        // Parse cluster data
        let sliced_data_for_cluster: Vec<Vec<Value>> =
            match serde_wasm_bindgen::from_value(slicedDataForCluster.clone()) {
                Ok(data) => data,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to parse cluster data: {}. Make sure it's an array of arrays.",
                        e
                    )))
                }
            };

        // Check cluster data structure
        if sliced_data_for_cluster.is_empty() {
            return Err(JsValue::from_str(
                "Cluster data is empty. Expected non-empty array of variables.",
            ));
        }

        // Parse label data
        let sliced_data_for_label_cases: Vec<Vec<Value>> =
            match serde_wasm_bindgen::from_value(slicedDataForLabelCases.clone()) {
                Ok(data) => data,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to parse label data: {}. Make sure it's an array of arrays.",
                        e
                    )))
                }
            };

        // Parse variable definitions
        let var_defs_for_cluster: Value = match serde_wasm_bindgen::from_value(varDefsForCluster.clone()) {
            Ok(defs) => defs,
            Err(e) => return Err(JsValue::from_str(&format!("Failed to parse cluster variable definitions: {}. Make sure it's a valid JSON object.", e))),
        };

        let var_defs_for_label_cases: Value = match serde_wasm_bindgen::from_value(varDefsForLabelCases.clone()) {
            Ok(defs) => defs,
            Err(e) => return Err(JsValue::from_str(&format!("Failed to parse label variable definitions: {}. Make sure it's a valid JSON object.", e))),
        };

        // Extract clustering configuration from the config object
        let parsed_config = match parse_spss_config(&raw_config) {
            Ok(c) => c,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to parse SPSS configuration: {}. Check configuration structure.",
                    e
                )))
            }
        };

        // Set up default cluster config
        let config = ClusteringConfig {
            method: LinkageMethod::AverageBetweenGroups,
            distance_metric: DistanceMetric::Euclidean,
            data_type: DataType::Interval,
            standardization: StandardizationMethod::None,
            missing_values: MissingValueStrategy::ExcludeListwise,
            distance_transformation: DistanceTransformation::None,
            minkowski_power: None,
            binary_options: None,
        };

        // Extract variable names from definitions
        let mut variable_names = Vec::new();
        if let Some(var_defs_array) = var_defs_for_cluster.as_array() {
            for var_def in var_defs_array {
                if let Some(var_def_array) = var_def.as_array() {
                    if let Some(first_def) = var_def_array.first() {
                        if let Some(name) = first_def.get("name").and_then(|n| n.as_str()) {
                            variable_names.push(name.to_string());
                        }
                    }
                }
            }
        }

        if variable_names.is_empty() {
            return Err(JsValue::from_str("No valid variable names found in varDefsForCluster. Each variable should have a 'name' property."));
        }

        // Extract label name if available
        let label_name = if let Some(main) = raw_config.get("main") {
            if let Some(label_cases) = main.get("LabelCases").and_then(|l| l.as_str()) {
                Some(label_cases.to_string())
            } else {
                None
            }
        } else {
            None
        };

        // Determine number of cases
        if sliced_data_for_cluster.is_empty() {
            return Err(JsValue::from_str(
                "Cluster data is empty. Expected at least one variable.",
            ));
        }

        let num_cases = if !sliced_data_for_cluster[0].is_empty() {
            sliced_data_for_cluster[0].len()
        } else {
            return Err(JsValue::from_str(
                "First variable in cluster data has no cases.",
            ));
        };

        // Validate variable data structure
        for (i, var_data) in sliced_data_for_cluster.iter().enumerate() {
            if var_data.len() != num_cases {
                return Err(JsValue::from_str(&format!(
                    "Variable at index {} has {} cases, but expected {}. All variables must have the same number of cases.",
                    i, var_data.len(), num_cases
                )));
            }
        }

        // Initialize data matrix
        let mut data_matrix = vec![vec![0.0; variable_names.len()]; num_cases];

        // Fill the matrix with data from sliced_data_for_cluster
        for (var_idx, var_data) in sliced_data_for_cluster.iter().enumerate() {
            if var_idx >= variable_names.len() {
                continue;
            }

            let var_name = &variable_names[var_idx];

            for (case_idx, case) in var_data.iter().enumerate() {
                if case_idx >= num_cases {
                    continue;
                }

                if let Some(obj) = case.as_object() {
                    if let Some(value) = obj.get(var_name).and_then(|v| v.as_f64()) {
                        data_matrix[case_idx][var_idx] = value;
                    } else {
                        // Use NaN to represent missing values
                        data_matrix[case_idx][var_idx] = f64::NAN;
                    }
                } else {
                    data_matrix[case_idx][var_idx] = f64::NAN;
                }
            }
        }

        // Extract label data if available
        let mut label_values = Vec::new();

        if let Some(label_name_str) = &label_name {
            if !sliced_data_for_label_cases.is_empty() && !sliced_data_for_label_cases[0].is_empty()
            {
                for (i, case) in sliced_data_for_label_cases[0].iter().enumerate() {
                    if i >= num_cases {
                        break;
                    }

                    if let Some(obj) = case.as_object() {
                        let label_value = obj
                            .get(label_name_str)
                            .and_then(|v| v.as_f64().or_else(|| v.as_i64().map(|i| i as f64)))
                            .unwrap_or(0.0) as usize;

                        label_values.push(label_value);
                    } else {
                        label_values.push(0); // Default value if not found
                    }
                }
            }
        }

        // If we have fewer label values than cases, pad with default values
        while label_values.len() < num_cases {
            label_values.push(0);
        }

        // Create initial case IDs (will be updated during preprocessing)
        let case_ids: Vec<usize> = (0..data_matrix.len()).collect();

        // Create the instance
        Ok(HierarchicalClusteringWasm {
            data: data_matrix,
            label_data: label_values,
            variable_names,
            label_name,
            config,
            distance_matrix: vec![],
            case_ids,
            results: None,
            raw_config,
            raw_cluster_vars: var_defs_for_cluster,
            raw_label_vars: var_defs_for_label_cases,
        })
    }

    /// Perform complete hierarchical clustering analysis
    #[wasm_bindgen]
    pub fn perform_analysis(&mut self) -> Result<(), JsValue> {
        // Chain all the analysis steps with proper error handling
        self.preprocess_data()
            .and_then(|_| self.calculate_distances())
            .and_then(|_| self.cluster())?;

        // Get default cluster solution if specified in config
        if let Some(obj) = self.raw_config.get("statistics") {
            if let Some(num_clusters) = obj.get("NoOfCluster").and_then(|c| c.as_u64()) {
                if num_clusters > 0 {
                    self.get_clusters(num_clusters as usize)?;
                    // Try to evaluate the clusters
                    self.evaluate(num_clusters as usize)?;
                }
            } else if obj
                .get("SingleSol")
                .and_then(|s| s.as_bool())
                .unwrap_or(false)
            {
                // Default to 3 clusters if SingleSol is true but NoOfCluster is not specified
                let default_clusters = 3;
                self.get_clusters(default_clusters)?;
            } else if obj
                .get("RangeSol")
                .and_then(|s| s.as_bool())
                .unwrap_or(false)
            {
                // Get range of solutions if specified
                let min_clusters =
                    obj.get("MinCluster").and_then(|c| c.as_u64()).unwrap_or(2) as usize;
                let max_clusters =
                    obj.get("MaxCluster").and_then(|c| c.as_u64()).unwrap_or(5) as usize;

                if min_clusters > 0 && max_clusters >= min_clusters {
                    self.get_clusters_range(min_clusters, max_clusters)?;
                }
            }
        }

        Ok(())
    }

    /// Preprocess data (standardize and handle missing values)
    #[wasm_bindgen]
    pub fn preprocess_data(&mut self) -> Result<(), JsValue> {
        // Check for empty or invalid data
        if self.data.is_empty() {
            return Err(JsValue::from_str(
                "Data matrix is empty. Cannot preprocess.",
            ));
        }

        // Handle missing values
        let (processed_data, valid_case_ids) = handle_missing_values(&self.data, self.config.missing_values)
            .map_err(|e| JsValue::from_str(&format!("Failed to handle missing values: {}", e)))?;

        if valid_case_ids.len() < 2 {
            return Err(JsValue::from_str(
                 "Not enough valid cases after handling missing values. Need at least 2 cases for clustering."
             ));
        }

        // Update data and case IDs
        self.data = processed_data;
        self.case_ids = valid_case_ids;

        // Update label data to match valid cases
        if !self.label_data.is_empty() {
            let mut filtered_labels = Vec::with_capacity(self.case_ids.len());
            for &case_id in &self.case_ids {
                if case_id < self.label_data.len() {
                    filtered_labels.push(self.label_data[case_id]);
                } else {
                    // Use default value if case_id is out of bounds
                    filtered_labels.push(0);
                }
            }
            self.label_data = filtered_labels;
        }

        // Standardize data if needed
        if self.config.standardization != StandardizationMethod::None {
            // Check if we should standardize by variable or by case
            let by_variable = !self
                .raw_config
                .get("method")
                .and_then(|m| m.get("ByCase"))
                .and_then(|c| c.as_bool())
                .unwrap_or(false);

            self.data = standardize_data(&self.data, self.config.standardization, by_variable)
                .map_err(|e| JsValue::from_str(&format!("Failed to standardize data: {}", e)))?;
        }

        Ok(())
    }

    /// Calculate distance matrix
    #[wasm_bindgen]
    pub fn calculate_distances(&mut self) -> Result<(), JsValue> {
        // Check data validity
        if self.data.is_empty() {
            return Err(JsValue::from_str(
                "Data matrix is empty. Cannot calculate distances.",
            ));
        }

        if self.data.len() < 2 {
            return Err(JsValue::from_str(
                "Need at least 2 cases to calculate distances.",
            ));
        }

        // Get binary options if needed
        let binary_options = if self.config.distance_metric == DistanceMetric::Jaccard {
            match &self.config.binary_options {
                Some(options) => Some(options),
                None => {
                    return Err(JsValue::from_str(
                        "Binary options required for Jaccard distance",
                    ));
                }
            }
        } else {
            None
        };

        // Calculate distance matrix
        let distance_matrix = calculate_distance_matrix(
            &self.data,
            self.config.distance_metric,
            self.config.minkowski_power,
            binary_options,
        ).map_err(|e| JsValue::from_str(&format!("Failed to calculate distance matrix: {}", e)))?;

        // Apply transformation if needed
        if self.config.distance_transformation != DistanceTransformation::None {
            self.distance_matrix =
                transform_distance_matrix(&distance_matrix, self.config.distance_transformation);
        } else {
            self.distance_matrix = distance_matrix;
        }

        Ok(())
    }

    /// Perform hierarchical clustering
    #[wasm_bindgen]
    pub fn cluster(&mut self) -> Result<(), JsValue> {
        // Check if we have calculated distances
        if self.distance_matrix.is_empty() {
            return Err(JsValue::from_str(
                "Distance matrix not calculated. Call calculate_distances() first.",
            ));
        }

        // Check dimensions
        if self.distance_matrix.len() < 2 {
            return Err(JsValue::from_str(
                "Need at least 2 cases to perform clustering",
            ));
        }

        // Perform clustering
        let results = hierarchical_cluster(&self.data, &self.distance_matrix, &self.config)
            .map_err(|e| JsValue::from_str(&format!("Failed to perform clustering: {}", e)))?;

        self.results = Some(results);

        Ok(())
    }

    /// Get cluster membership for a specific number of clusters
    ///
    /// # Arguments
    /// * `num_clusters` - Number of clusters to extract
    ///
    /// # Returns
    /// * JSON string with cluster membership information
    #[wasm_bindgen]
    pub fn get_clusters(&mut self, num_clusters: usize) -> Result<JsValue, JsValue> {
        // Validate num_clusters
        if num_clusters < 1 {
            return Err(JsValue::from_str("Number of clusters must be at least 1"));
        }

        // Check if we have performed clustering
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        let data_size = self.data.len();

        if num_clusters > data_size {
            return Err(JsValue::from_str(&format!(
                "Number of clusters ({}) cannot exceed number of cases ({})",
                num_clusters, data_size
            )));
        }

        // Get cluster membership
        let membership = match get_cluster_membership(
            &results.agglomeration_schedule,
            num_clusters,
            data_size,
        ) {
            Ok(m) => m,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to get cluster membership: {}",
                    e
                )));
            }
        };

        // Store in results
        results.single_solution = Some(membership.clone());

        // Convert to JS value
        serde_wasm_bindgen::to_value(&membership)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize cluster membership: {}", e)))
    }

    /// Get cluster memberships for a range of solutions
    ///
    /// # Arguments
    /// * `min_clusters` - Minimum number of clusters
    /// * `max_clusters` - Maximum number of clusters
    ///
    /// # Returns
    /// * JSON string with cluster membership information for each solution
    #[wasm_bindgen]
    pub fn get_clusters_range(
        &mut self,
        min_clusters: usize,
        max_clusters: usize,
    ) -> Result<JsValue, JsValue> {
        // Validate parameters
        if min_clusters < 1 {
            return Err(JsValue::from_str(
                "Minimum number of clusters must be at least 1",
            ));
        }

        if min_clusters > max_clusters {
            return Err(JsValue::from_str(
                "Minimum number of clusters cannot be greater than maximum",
            ));
        }

        // Check if we have performed clustering
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        let data_size = self.data.len();

        if max_clusters > data_size {
            return Err(JsValue::from_str(&format!(
                "Maximum number of clusters ({}) cannot exceed number of cases ({})",
                max_clusters, data_size
            )));
        }

        // Get cluster memberships for range
        let memberships = match get_cluster_memberships_range(
            &results.agglomeration_schedule,
            min_clusters,
            max_clusters,
            data_size,
        ) {
            Ok(m) => m,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to get cluster memberships: {}",
                    e
                )));
            }
        };

        // Store in results
        results.range_solutions = Some(memberships.clone());

        // Convert to JS value
        serde_wasm_bindgen::to_value(&memberships)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize cluster memberships: {}", e)))
    }

    /// Evaluate clustering solution
    ///
    /// # Arguments
    /// * `num_clusters` - Number of clusters to evaluate
    ///
    /// # Returns
    /// * JSON string with evaluation metrics
    #[wasm_bindgen]
    pub fn evaluate(&mut self, num_clusters: usize) -> Result<JsValue, JsValue> {
        // Validate num_clusters
        if num_clusters < 2 {
            return Err(JsValue::from_str("Need at least 2 clusters to evaluate"));
        }

        // Check if we have performed clustering
        let results = match &mut self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        // Get cluster membership if not already present
        let membership = if let Some(ref existing) = results.single_solution {
            if existing.num_clusters == num_clusters {
                existing.clone()
            } else {
                match get_cluster_membership(
                    &results.agglomeration_schedule,
                    num_clusters,
                    self.data.len(),
                ) {
                    Ok(m) => m,
                    Err(e) => {
                        return Err(JsValue::from_str(&format!(
                            "Failed to get cluster membership: {}",
                            e
                        )));
                    }
                }
            }
        } else {
            match get_cluster_membership(
                &results.agglomeration_schedule,
                num_clusters,
                self.data.len(),
            ) {
                Ok(m) => m,
                Err(e) => {
                    return Err(JsValue::from_str(&format!(
                        "Failed to get cluster membership: {}",
                        e
                    )));
                }
            }
        };

        // Evaluate clustering
        let evaluation = match evaluate_clustering(&self.data, &membership, &self.distance_matrix) {
            Ok(e) => e,
            Err(e) => {
                return Err(JsValue::from_str(&format!(
                    "Failed to evaluate clustering: {}",
                    e
                )));
            }
        };

        // Store in results
        results.evaluation = Some(evaluation.clone());

        // Convert to JS value
        serde_wasm_bindgen::to_value(&evaluation)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize evaluation metrics: {}", e)))
    }

    /// Get complete results
    ///
    /// # Returns
    /// * JSON string with all clustering results
    #[wasm_bindgen]
    pub fn get_results(&self) -> Result<JsValue, JsValue> {
        // Check if we have performed clustering
        let results = match &self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        // Convert to JS value
        serde_wasm_bindgen::to_value(results)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize results: {}", e)))
    }

    /// Get dendrogram data for visualization
    ///
    /// # Returns
    /// * JSON string with dendrogram data
    #[wasm_bindgen]
    pub fn get_dendrogram_data(&self) -> Result<JsValue, JsValue> {
        // Check if we have performed clustering
        let results = match &self.results {
            Some(r) => r,
            None => {
                return Err(JsValue::from_str(
                    "Clustering not performed. Call cluster() first.",
                ));
            }
        };

        // Check if we have dendrogram data
        let dendrogram_data = match &results.dendrogram_data {
            Some(d) => d,
            None => return Err(JsValue::from_str("Dendrogram data not available")),
        };

        // Convert to JS value
        serde_wasm_bindgen::to_value(dendrogram_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize dendrogram data: {}", e)))
    }

    /// Get variable names
    #[wasm_bindgen]
    pub fn get_variable_names(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.variable_names)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize variable names: {}", e)))
    }

    /// Get label data
    #[wasm_bindgen]
    pub fn get_label_data(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.label_data)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize label data: {}", e)))
    }

    /// Get original configuration
    #[wasm_bindgen]
    pub fn get_config(&self) -> Result<JsValue, JsValue> {
        serde_wasm_bindgen::to_value(&self.raw_config)
            .map_err(|e| JsValue::from_str(&format!("Failed to serialize configuration: {}", e)))
    }
}

/// Parse SPSS-style configuration into our internal format
#[wasm_bindgen]
pub fn parse_clustering_config(config_json: &JsValue) -> Result<JsValue, JsValue> {
    // Parse JSON into a generic structure
    let json_value: Value = match serde_wasm_bindgen::from_value(config_json.clone()) {
        Ok(value) => value,
        Err(e) => return Err(JsValue::from_str(&format!("Failed to parse configuration JSON: {}", e))),
    };

    // Parse into our internal format
    let config = match convert_config_to_clustering_config(&json_value) {
        Ok(config) => config,
        Err(e) => return Err(JsValue::from_str(&format!("Failed to convert configuration: {}", e))),
    };

    // Convert to JS value
    serde_wasm_bindgen::to_value(&config)
        .map_err(|e| JsValue::from_str(&format!("Failed to serialize config: {}", e)))
}

/// Convert parsed SPSS config to ClusteringConfig
fn convert_config_to_clustering_config(config: &Value) -> Result<ClusteringConfig, ClusteringError> {
    // Default configuration
    let mut result = ClusteringConfig {
        method: LinkageMethod::AverageBetweenGroups, // Default method
        distance_metric: DistanceMetric::Euclidean,  // Default metric
        data_type: DataType::Interval,               // Default data type
        standardization: StandardizationMethod::None, // Default no standardization
        missing_values: MissingValueStrategy::ExcludeListwise, // Default listwise deletion
        distance_transformation: DistanceTransformation::None, // Default no transformation
        minkowski_power: None,
        binary_options: None,
    };

    // Extract method configuration if available
    if let Some(method) = config.get("method") {
        // Get clustering method
        if let Some(method_str) = method.get("ClusMethod").and_then(|m| m.as_str()) {
            result.method = match method_str {
                "AverageBetweenGroups" => LinkageMethod::AverageBetweenGroups,
                "AverageWithinGroups" => LinkageMethod::AverageWithinGroups,
                "SingleLinkage" => LinkageMethod::SingleLinkage,
                "CompleteLinkage" => LinkageMethod::CompleteLinkage,
                "Centroid" => LinkageMethod::Centroid,
                "Median" => LinkageMethod::Median,
                "Ward" => LinkageMethod::Ward,
                _ => LinkageMethod::AverageBetweenGroups,
            };
        }

        // Determine distance metric based on data type
        if method
            .get("Interval")
            .and_then(|i| i.as_bool())
            .unwrap_or(false)
        {
            result.data_type = DataType::Interval;

            if let Some(metric_str) = method.get("IntervalMethod").and_then(|m| m.as_str()) {
                result.distance_metric = match metric_str {
                    "Euclidean" => DistanceMetric::Euclidean,
                    "SquaredEuclidean" => DistanceMetric::SquaredEuclidean,
                    "Cosine" => DistanceMetric::Cosine,
                    "Correlation" => DistanceMetric::Correlation,
                    "Chebyshev" => DistanceMetric::Chebyshev,
                    "Block" => DistanceMetric::Manhattan,
                    "Minkowski" => {
                        // Get power parameter if available
                        result.minkowski_power = method.get("Power").and_then(|p| p.as_f64());
                        DistanceMetric::Minkowski
                    }
                    _ => DistanceMetric::Euclidean,
                };
            }
        } else if method
            .get("Counts")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
        {
            result.data_type = DataType::Counts;

            if let Some(metric_str) = method.get("CountsMethod").and_then(|m| m.as_str()) {
                result.distance_metric = match metric_str {
                    "ChiSquare" => DistanceMetric::ChiSquare,
                    _ => DistanceMetric::ChiSquare,
                };
            }
        } else if method
            .get("Binary")
            .and_then(|b| b.as_bool())
            .unwrap_or(false)
        {
            result.data_type = DataType::Binary;

            if let Some(metric_str) = method.get("BinaryMethod").and_then(|m| m.as_str()) {
                result.distance_metric = match metric_str {
                    "Jaccard" => DistanceMetric::Jaccard,
                    _ => DistanceMetric::Jaccard,
                };

                // Get binary options if available
                let present = method
                    .get("Present")
                    .and_then(|p| p.as_f64())
                    .unwrap_or(1.0);
                let absent = method.get("Absent").and_then(|a| a.as_f64()).unwrap_or(0.0);

                result.binary_options = Some(BinaryOptions {
                    present_value: present,
                    absent_value: absent,
                });
            }
        }

        // Get standardization method if available
        if let Some(std_str) = method.get("StandardizeMethod").and_then(|s| s.as_str()) {
            result.standardization = match std_str {
                "ZScore" => StandardizationMethod::ZScore,
                "RangeNegOneToOne" => StandardizationMethod::RangeNegOneToOne,
                "RangeZeroToOne" => StandardizationMethod::RangeZeroToOne,
                "MaxMagnitudeOne" => StandardizationMethod::MaxMagnitudeOne,
                "MeanOne" => StandardizationMethod::MeanOne,
                "StdDevOne" => StandardizationMethod::StdDevOne,
                _ => StandardizationMethod::None,
            };
        }

        // Get distance transformation if available
        if method
            .get("AbsValue")
            .and_then(|a| a.as_bool())
            .unwrap_or(false)
        {
            result.distance_transformation = DistanceTransformation::AbsoluteValue;
        } else if method
            .get("ChangeSign")
            .and_then(|c| c.as_bool())
            .unwrap_or(false)
        {
            result.distance_transformation = DistanceTransformation::ChangeSign;
        } else if method
            .get("RescaleRange")
            .and_then(|r| r.as_bool())
            .unwrap_or(false)
        {
            result.distance_transformation = DistanceTransformation::RescaleZeroToOne;
        }
    }

    Ok(result)
}
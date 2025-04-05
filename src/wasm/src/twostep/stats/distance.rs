use crate::twostep::models::result::CFEntry;

// Calculate distance between two clusters
pub fn calculate_cluster_distance(
    cluster1: &CFEntry,
    cluster2: &CFEntry,
    use_euclidean: bool
) -> f64 {
    if use_euclidean {
        // Euclidean distance between centroids
        let mut sum_squared = 0.0;

        for i in 0..cluster1.sum_values.len() {
            let mean1 = cluster1.mean(i);
            let mean2 = cluster2.mean(i);
            sum_squared += (mean1 - mean2).powi(2);
        }

        sum_squared.sqrt()
    } else {
        // Log-likelihood distance based on documentation formula:
        // d(j, s) = ξj + ξs - ξ<j,s>

        // Calculate ξj and ξs terms
        let xi_j = calculate_xi_term(cluster1);
        let xi_s = calculate_xi_term(cluster2);

        // Calculate ξ<j,s> term (combined cluster)
        let combined_cluster = combine_clusters(cluster1, cluster2);
        let xi_combined = calculate_xi_term(&combined_cluster);

        // Return the distance formula result
        xi_j + xi_s - xi_combined
    }
}

// Helper function to calculate the ξv term in the log-likelihood distance formula
// ξv = -Nv(∑(k=1 to K^A) 1/2 log(σ²k + σ²vk) + ∑(k=1 to K^B) Êvk)
pub fn calculate_xi_term(cluster: &CFEntry) -> f64 {
    let mut xi = 0.0;
    let n = cluster.n as f64;

    if n <= 0.0 {
        return 0.0;
    }

    // Continuous variables contribution
    for i in 0..cluster.sum_values.len() {
        // σ²k is a small constant (1e-10) to avoid log(0)
        // σ²vk is the variance of the kth variable in the cluster
        let sigma2_k = 1e-10;
        let sigma2_vk = cluster.variance(i).max(1e-10);
        xi += 0.5 * (sigma2_k + sigma2_vk).ln();
    }

    // Categorical variables contribution
    for i in 0..cluster.category_counts.len() {
        let cats = &cluster.category_counts[i];

        // Calculate entropy term Êvk
        let mut e_vk = 0.0;
        for (_, &count) in cats {
            let prob = (count as f64) / n;
            if prob > 0.0 {
                e_vk -= prob * prob.ln();
            }
        }

        xi += e_vk;
    }

    -n * xi
}

// Helper function to create a combined cluster from two clusters
pub fn combine_clusters(cluster1: &CFEntry, cluster2: &CFEntry) -> CFEntry {
    let mut combined = CFEntry::new(cluster1.sum_values.len(), cluster1.category_counts.len());

    // Sum counts
    combined.n = cluster1.n + cluster2.n;

    // Sum continuous values
    for i in 0..cluster1.sum_values.len() {
        combined.sum_values[i] = cluster1.sum_values[i] + cluster2.sum_values[i];
        combined.sum_squared[i] = cluster1.sum_squared[i] + cluster2.sum_squared[i];
    }

    // Combine categorical counts
    for i in 0..cluster1.category_counts.len() {
        for (cat, &count) in &cluster1.category_counts[i] {
            *combined.category_counts[i].entry(cat.clone()).or_insert(0) += count;
        }

        for (cat, &count) in &cluster2.category_counts[i] {
            *combined.category_counts[i].entry(cat.clone()).or_insert(0) += count;
        }
    }

    combined
}

// Calculate Euclidean distance between a data point and a cluster
pub fn calculate_euclidean_distance(
    data_point: &[f64],
    cluster: &CFEntry,
    num_continuous: usize
) -> f64 {
    let mut sum_squared = 0.0;

    for i in 0..num_continuous.min(data_point.len()).min(cluster.sum_values.len()) {
        let cluster_mean = cluster.mean(i);
        sum_squared += (data_point[i] - cluster_mean).powi(2);
    }

    sum_squared.sqrt()
}

// Calculate log-likelihood distance between a data point and a cluster
// Based on the formula d(j, s) = ξj + ξs - ξ<j,s> adapted for point-to-cluster case
pub fn calculate_log_likelihood_distance(
    data_point: &[f64],
    cat_point: &[String],
    cluster: &CFEntry,
    num_continuous: usize,
    num_categorical: usize
) -> f64 {
    // For a point-to-cluster distance, we adapt the cluster-to-cluster formula
    // by treating the point as a degenerate cluster with n=1

    // Create a temporary cluster representing the single point
    let point_cluster = create_point_cluster(
        data_point,
        cat_point,
        num_continuous,
        num_categorical
    );

    // Calculate ξpoint term
    let xi_point = calculate_xi_term(&point_cluster);

    // Calculate ξcluster term
    let xi_cluster = calculate_xi_term(cluster);

    // Calculate ξcombined term
    let combined_cluster = combine_clusters(&point_cluster, cluster);
    let xi_combined = calculate_xi_term(&combined_cluster);

    // Return the log-likelihood distance
    xi_point + xi_cluster - xi_combined
}

// Helper function to create a cluster entry from a single data point
pub fn create_point_cluster(
    data_point: &[f64],
    cat_point: &[String],
    num_continuous: usize,
    num_categorical: usize
) -> CFEntry {
    let mut entry = CFEntry::new(num_continuous, num_categorical);

    // Set count to 1
    entry.n = 1;

    // Set continuous values
    for i in 0..num_continuous.min(data_point.len()) {
        entry.sum_values[i] = data_point[i];
        entry.sum_squared[i] = data_point[i] * data_point[i];
    }

    // Set categorical values
    for i in 0..num_categorical.min(cat_point.len()) {
        *entry.category_counts[i].entry(cat_point[i].clone()).or_insert(0) += 1;
    }

    entry
}

// Calculate minimum distance between clusters
pub fn calculate_min_intercluster_distance(
    sub_clusters: &[CFEntry],
    cluster_assignments: &[usize],
    use_euclidean: bool
) -> f64 {
    let k = *cluster_assignments.iter().max().unwrap_or(&0) + 1;

    if k <= 1 {
        return 0.0;
    }

    let mut min_distance = f64::MAX;

    for cluster_i in 0..k {
        for cluster_j in cluster_i + 1..k {
            let mut found_pair = false;
            let mut cluster_distance = f64::MAX;

            // Find minimum distance between sub-clusters in different clusters
            for (sc_i, &assign_i) in cluster_assignments.iter().enumerate() {
                if assign_i != cluster_i {
                    continue;
                }

                for (sc_j, &assign_j) in cluster_assignments.iter().enumerate() {
                    if assign_j != cluster_j {
                        continue;
                    }

                    let distance = calculate_cluster_distance(
                        &sub_clusters[sc_i],
                        &sub_clusters[sc_j],
                        use_euclidean
                    );

                    cluster_distance = cluster_distance.min(distance);
                    found_pair = true;
                }
            }

            if found_pair {
                min_distance = min_distance.min(cluster_distance);
            }
        }
    }

    if min_distance == f64::MAX {
        0.0
    } else {
        min_distance
    }
}

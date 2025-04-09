// icicle_plot.rs
use crate::hierarchical::models::{
    config::ClusterConfig,
    data::AnalysisData,
    result::{ DendrogramTreeNode, IciclePlot },
};

use super::core::{
    build_dendrogram_tree,
    extract_case_label,
    generate_agglomeration_schedule_wrapper,
    generate_cluster_membership,
};

// In-order traversal to get proper ordering of cases
fn get_case_ordering(node: &DendrogramTreeNode) -> Vec<usize> {
    let mut ordering = Vec::new();

    // If this is a leaf node, return its case
    if node.left.is_none() && node.right.is_none() {
        return node.cases.clone();
    }

    // Traverse left child
    if let Some(left) = &node.left {
        ordering.extend(get_case_ordering(left));
    }

    // Traverse right child
    if let Some(right) = &node.right {
        ordering.extend(get_case_ordering(right));
    }

    ordering
}

pub fn generate_icicle_plot(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<IciclePlot, String> {
    // Get number of cases
    let num_cases = data.cluster_data
        .get(0)
        .map(|d| d.len())
        .unwrap_or(0) as i32;

    // Determine plot parameters based on configuration
    let (start_cluster, stop_cluster, step_by) = if config.plots.all_clusters {
        // Process all clusters from 1 to number of cases
        (1, num_cases, 1)
    } else if config.plots.range_clusters {
        // Use configured range
        let start = config.plots.start_cluster;
        let stop = config.plots.stop_cluster.unwrap_or_else(|| num_cases / 2);
        let step = config.plots.step_by_cluster;
        (start, stop, step)
    } else {
        // Use single solution
        let cluster = config.plots.start_cluster;
        (cluster, cluster, 1)
    };

    // Determine orientation
    let orientation = if config.plots.vert_orien { "vertical" } else { "horizontal" };

    // Get agglomeration schedule
    let agglomeration = generate_agglomeration_schedule_wrapper(data, config)?;

    // Get case labels
    let case_labels = if config.main.cluster_cases {
        (0..num_cases as usize)
            .map(|idx| extract_case_label(data, config, idx))
            .collect::<Vec<String>>()
    } else {
        // For variable clustering, use variable names as labels
        config.main.variables
            .as_ref()
            .map(|vars| vars.clone())
            .unwrap_or_else(|| vec![])
    };

    let num_items = case_labels.len();

    // Build the dendrogram tree to determine proper case ordering
    let dendrogram_tree = build_dendrogram_tree(&agglomeration, num_items, &case_labels);

    // Get the proper ordering of cases based on the dendrogram
    let ordering = get_case_ordering(&dendrogram_tree);

    // Create cluster count vector - this represents the number of clusters at each level
    let num_clusters: Vec<usize> = (start_cluster..=stop_cluster)
        .step_by(step_by as usize)
        .map(|c| c as usize)
        .collect();

    // Create a matrix to track when each case joins a cluster
    // For each case, determine at which clustering level it merges with another case
    let mut cluster_merge_matrix = vec![vec![0; num_items]; num_clusters.len()];

    // Fill the matrix - for each number of clusters
    for (level_idx, &num_cluster_count) in num_clusters.iter().enumerate() {
        // Ensure valid number of clusters
        let valid_num_clusters = num_cluster_count.max(1).min(num_items);

        // Generate cluster assignments for this number of clusters
        let assignments = generate_cluster_membership(
            &agglomeration.stages,
            num_items,
            valid_num_clusters
        )?;

        // For each case in our ordering
        for (pos_idx, &case_idx) in ordering.iter().enumerate() {
            if case_idx < assignments.len() {
                let cluster_id = assignments[case_idx];

                // Find other cases in the same cluster
                let mut is_merged = false;
                for other_case_idx in 0..num_items {
                    if
                        other_case_idx != case_idx &&
                        other_case_idx < assignments.len() &&
                        assignments[other_case_idx] == cluster_id
                    {
                        is_merged = true;
                        break;
                    }
                }

                // If this case is merged with others, track the level at which it merges
                if is_merged {
                    cluster_merge_matrix[level_idx][pos_idx] = 1;
                }
            }
        }
    }

    // Convert the matrix to a flat representation for the IciclePlot struct
    // For each case, determine the first level at which it merges
    let mut clusters_flat = Vec::with_capacity(num_items);

    for (pos_idx, &case_idx) in ordering.iter().enumerate() {
        if case_idx < case_labels.len() {
            clusters_flat.push(case_labels[case_idx].clone());

            // Find first level where this case merges with another
            for level_idx in 0..num_clusters.len() {
                if cluster_merge_matrix[level_idx][pos_idx] == 1 {
                    break;
                }
            }
        }
    }

    Ok(IciclePlot {
        orientation: orientation.to_string(),
        clusters: clusters_flat,
        num_clusters: num_clusters,
        start_cluster,
        stop_cluster,
        step_by,
    })
}

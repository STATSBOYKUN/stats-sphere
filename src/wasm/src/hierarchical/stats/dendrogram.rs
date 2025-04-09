// dendrogram.rs
use std::collections::HashMap;
use crate::hierarchical::models::{
    config::ClusterConfig,
    data::AnalysisData,
    result::{ AgglomerationSchedule, Dendrogram, DendrogramNode, DendrogramTreeNode },
};

use super::core::{ extract_case_label, generate_agglomeration_schedule_wrapper };

// Build a dendrogram tree from agglomeration schedule
pub fn build_dendrogram_tree(
    agglomeration: &AgglomerationSchedule,
    num_items: usize,
    case_labels: &[String]
) -> DendrogramTreeNode {
    // First, create leaf nodes for each original item
    let mut nodes: HashMap<usize, DendrogramTreeNode> = (1..=num_items)
        .map(|i| (
            i,
            DendrogramTreeNode {
                id: i,
                left: None,
                right: None,
                cases: vec![i - 1], // Store 0-based case index
                height: 0.0,
                label: if i <= case_labels.len() {
                    Some(case_labels[i - 1].clone())
                } else {
                    None
                },
            },
        ))
        .collect();

    // Track the next node ID
    let mut next_id = num_items + 1;

    // Process each stage of the agglomeration
    for stage in &agglomeration.stages {
        let (cluster1_id, cluster2_id) = stage.clusters_combined;

        // Get the two nodes being merged
        if
            let (Some(node1), Some(node2)) = (
                nodes.remove(&cluster1_id),
                nodes.remove(&cluster2_id),
            )
        {
            // Create a new node representing the merger
            let mut merged_cases = node1.cases.clone();
            merged_cases.extend(node2.cases.clone());

            let merged_node = DendrogramTreeNode {
                id: next_id,
                left: Some(Box::new(node1)),
                right: Some(Box::new(node2)),
                cases: merged_cases,
                height: stage.coefficients,
                label: None,
            };

            // Add the new node to our map
            nodes.insert(next_id, merged_node);
            next_id += 1;
        }
    }

    // The last remaining node is the root of our dendrogram
    if nodes.len() == 1 {
        nodes.into_values().next().unwrap()
    } else {
        // This should not happen with a valid agglomeration schedule
        DendrogramTreeNode {
            id: 0,
            left: None,
            right: None,
            cases: (0..num_items).collect(),
            height: 0.0,
            label: None,
        }
    }
}

// Convert the tree structure to a flat list of nodes with their positions
fn flatten_dendrogram(
    node: &DendrogramTreeNode,
    pos: f64,
    width: f64,
    case_labels: &[String]
) -> Vec<DendrogramNode> {
    let mut nodes = Vec::new();

    // If this is a leaf node, add it directly
    if node.left.is_none() && node.right.is_none() {
        if let Some(label) = &node.label {
            nodes.push(DendrogramNode {
                case: label.clone(),
                linkage_distance: node.height,
            });
        } else if !node.cases.is_empty() && node.cases[0] < case_labels.len() {
            nodes.push(DendrogramNode {
                case: case_labels[node.cases[0]].clone(),
                linkage_distance: node.height,
            });
        }
        return nodes;
    }

    // Process left subtree
    let left_width = if let Some(left) = &node.left {
        ((left.cases.len() as f64) / (node.cases.len() as f64)) * width
    } else {
        0.0
    };

    if let Some(left) = &node.left {
        let left_nodes = flatten_dendrogram(left, pos, left_width, case_labels);
        nodes.extend(left_nodes);
    }

    // Process right subtree
    if let Some(right) = &node.right {
        let right_nodes = flatten_dendrogram(
            right,
            pos + left_width,
            width - left_width,
            case_labels
        );
        nodes.extend(right_nodes);
    }

    nodes
}

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

pub fn generate_dendrogram(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<Dendrogram, String> {
    // Get the agglomeration schedule
    let agglomeration = generate_agglomeration_schedule_wrapper(data, config)?;

    // Get all case labels
    let case_labels = if config.main.cluster_cases {
        let case_count = data.cluster_data
            .get(0)
            .map(|d| d.len())
            .unwrap_or(0);

        (0..case_count).map(|idx| extract_case_label(data, config, idx)).collect()
    } else {
        // For variable clustering, use variable names as labels
        config.main.variables
            .as_ref()
            .map(|vars| vars.clone())
            .unwrap_or_else(|| vec![])
    };

    // Build the hierarchical dendrogram tree
    let dendrogram_tree = build_dendrogram_tree(&agglomeration, case_labels.len(), &case_labels);

    // Get the proper ordering of cases based on the dendrogram
    let ordering = get_case_ordering(&dendrogram_tree);

    // Create DendrogramNodes for each case in the proper order
    let mut nodes = Vec::with_capacity(case_labels.len());

    // Find the maximum linkage distance for normalization
    let max_height = agglomeration.stages
        .last()
        .map(|stage| stage.coefficients)
        .unwrap_or(1.0);

    // Create nodes for all cases with their linkage distances
    for &case_idx in &ordering {
        if case_idx < case_labels.len() {
            // Find the stage where this case was merged
            let mut linkage_distance = 0.0;

            for stage in &agglomeration.stages {
                let (cluster1, cluster2) = stage.clusters_combined;

                // If this case was part of these clusters, update its linkage distance
                if cluster1 == case_idx + 1 || cluster2 == case_idx + 1 {
                    linkage_distance = stage.coefficients;
                    break;
                }
            }

            // Normalize linkage distance if needed
            if max_height > 0.0 {
                linkage_distance = linkage_distance / max_height;
            }

            nodes.push(DendrogramNode {
                case: case_labels[case_idx].clone(),
                linkage_distance,
            });
        }
    }

    Ok(Dendrogram { nodes })
}

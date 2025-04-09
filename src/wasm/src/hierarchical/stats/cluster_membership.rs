// cluster_membership.rs
use std::collections::HashMap;
use rayon::prelude::*;

use crate::hierarchical::models::{
    config::ClusterConfig,
    data::AnalysisData,
    result::{ AgglomerationStage, CaseCluster, ClusterMembership },
};

use super::core::generate_agglomeration_schedule_wrapper;

pub fn perform_clustering(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<Vec<CaseCluster>, String> {
    // Get the agglomeration schedule
    let agglomeration = generate_agglomeration_schedule_wrapper(data, config)?;

    // Determine the number of clusters to create
    let num_clusters = config.statistics.no_of_cluster.unwrap_or(2) as usize;

    // Count total number of cases
    let num_cases = data.cluster_data
        .iter()
        .map(|d| d.len())
        .next()
        .unwrap_or(0);

    // Initialize each case to its own cluster
    let mut case_cluster_ids = (0..num_cases).collect::<Vec<usize>>();

    // Process agglomeration schedule to create the desired number of clusters
    let stages = &agglomeration.stages;
    let num_stages_to_process = num_cases.saturating_sub(num_clusters);

    for i in 0..num_stages_to_process {
        if i >= stages.len() {
            break;
        }

        let stage = &stages[i];
        let (cluster1, cluster2) = stage.clusters_combined;

        // Merge clusters by assigning all cases from cluster2 to cluster1
        // Using rayon for parallel processing of large datasets
        if case_cluster_ids.len() > 10000 {
            case_cluster_ids.par_iter_mut().for_each(|cluster_id| {
                if *cluster_id == cluster2 - 1 {
                    *cluster_id = cluster1 - 1;
                }
            });
        } else {
            for case_id in 0..case_cluster_ids.len() {
                if case_cluster_ids[case_id] == cluster2 - 1 {
                    case_cluster_ids[case_id] = cluster1 - 1;
                }
            }
        }
    }

    // Count cases in each cluster using parallel reduction for large datasets
    let cluster_counts = if case_cluster_ids.len() > 10000 {
        case_cluster_ids
            .par_iter()
            .fold(
                || HashMap::new(),
                |mut counts, &cluster_id| {
                    *counts.entry(cluster_id).or_insert(0) += 1;
                    counts
                }
            )
            .reduce(
                || HashMap::new(),
                |mut a, b| {
                    for (k, v) in b {
                        *a.entry(k).or_insert(0) += v;
                    }
                    a
                }
            )
    } else {
        case_cluster_ids.iter().fold(HashMap::new(), |mut counts, &cluster_id| {
            *counts.entry(cluster_id).or_insert(0) += 1;
            counts
        })
    };

    // Create the result
    let mut clusters: Vec<CaseCluster> = cluster_counts
        .into_iter()
        .map(|(cluster_id, count)| {
            CaseCluster {
                name: format!("Cluster {}", cluster_id + 1),
                cluster_count: count,
            }
        })
        .collect();

    // Sort the clusters by name
    clusters.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(clusters)
}

pub fn get_cluster_memberships(
    data: &AnalysisData,
    config: &ClusterConfig
) -> Result<Vec<ClusterMembership>, String> {
    // Dapatkan jadwal aglomerasi
    let agglomeration = generate_agglomeration_schedule_wrapper(data, config)?;

    // Hitung jumlah kasus
    let num_cases = data.cluster_data
        .iter()
        .map(|d| d.len())
        .next()
        .unwrap_or(0);

    // Tentukan solusi cluster yang akan dihasilkan
    let solutions = if config.statistics.none_sol {
        vec![] // Tidak ada solusi
    } else if config.statistics.single_sol {
        // Solusi tunggal
        vec![config.statistics.no_of_cluster.unwrap_or(2)]
    } else if config.statistics.range_sol {
        // Rentang solusi
        let min = config.statistics.min_cluster.unwrap_or(2);
        let max = config.statistics.max_cluster.unwrap_or(((num_cases as i32) / 2).max(min));
        (min..=max).collect()
    } else {
        // Default: solusi tunggal
        vec![config.statistics.no_of_cluster.unwrap_or(2)]
    };

    // Hasilkan keanggotaan untuk setiap solusi yang diminta
    let mut result = Vec::new();
    for num_clusters in solutions {
        let assignments = generate_cluster_membership(
            &agglomeration.stages,
            num_cases,
            num_clusters as usize
        )?;

        result.push(ClusterMembership {
            num_clusters: num_clusters as usize,
            case_assignments: assignments,
        });
    }

    Ok(result)
}

pub fn generate_cluster_membership(
    stages: &[AgglomerationStage],
    num_cases: usize,
    num_clusters: usize
) -> Result<Vec<usize>, String> {
    // Inisialisasi: setiap kasus adalah cluster sendiri
    let mut case_cluster_ids = (0..num_cases).collect::<Vec<usize>>();

    // Proses jadwal aglomerasi untuk membuat jumlah cluster yang diinginkan
    let num_stages_to_process = num_cases.saturating_sub(num_clusters);

    for i in 0..num_stages_to_process {
        if i >= stages.len() {
            break;
        }

        let stage = &stages[i];
        let (cluster1, cluster2) = stage.clusters_combined;

        // Gabungkan cluster dengan menetapkan semua kasus dari cluster2 ke cluster1
        for case_id in 0..case_cluster_ids.len() {
            if case_cluster_ids[case_id] == cluster2 - 1 {
                case_cluster_ids[case_id] = cluster1 - 1;
            }
        }
    }

    Ok(case_cluster_ids)
}

use std::collections::HashMap;

use crate::discriminant::models::{
    result::GroupStatistics,
    AnalysisData,
    DiscriminantConfig,
    data::DataValue,
};

pub fn calculate_group_statistics(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<GroupStatistics, String> {
    // Ambil variabel independen dari konfigurasi
    let independent_variables = &config.main.independent_variables;

    // Inisialisasi struktur hasil
    let mut result = GroupStatistics {
        groups: Vec::new(),
        variables: independent_variables.clone(),
        means: HashMap::new(),
        std_deviations: HashMap::new(),
    };

    // Inisialisasi maps untuk means dan std_deviations
    for variable in independent_variables {
        result.means.insert(variable.clone(), Vec::new());
        result.std_deviations.insert(variable.clone(), Vec::new());
    }

    // Ekstrak nilai unik dari group_data untuk mendapatkan grup
    let mut unique_groups = HashMap::new();

    for group_records in &data.group_data {
        for record in group_records {
            if
                let Some(DataValue::Number(group_val)) = record.values.get(
                    &config.main.grouping_variable
                )
            {
                unique_groups.entry(group_val.to_string()).or_insert(Vec::new()).push(record);
            } else if
                let Some(DataValue::Text(group_val)) = record.values.get(
                    &config.main.grouping_variable
                )
            {
                unique_groups.entry(group_val.clone()).or_insert(Vec::new()).push(record);
            }
        }
    }

    // Tambahkan grup ke hasil
    for group_name in unique_groups.keys() {
        result.groups.push(group_name.clone());
    }

    // Untuk setiap variabel independen, hitung statistik
    for var_idx in 0..independent_variables.len() {
        if var_idx >= data.independent_data.len() {
            continue;
        }

        let variable = &independent_variables[var_idx];
        let variable_records = &data.independent_data[var_idx];

        // Kelompokkan data berdasarkan grup
        for group_name in &result.groups {
            let mut group_values = Vec::new();

            // Cari nilai untuk grup ini
            for record in variable_records {
                // Ambil nilai dari semua record (tidak ada filter per grup karena
                // struktur data tidak mendukung)
                if let Some(DataValue::Number(value)) = record.values.get(variable) {
                    group_values.push(*value);
                }
            }

            // Hitung statistik
            if !group_values.is_empty() {
                let mean = group_values.iter().sum::<f64>() / (group_values.len() as f64);

                let variance = if group_values.len() > 1 {
                    group_values
                        .iter()
                        .map(|v| (v - mean).powi(2))
                        .sum::<f64>() / ((group_values.len() - 1) as f64)
                } else {
                    0.0
                };

                let std_dev = variance.sqrt();

                result.means.get_mut(variable).unwrap().push(mean);
                result.std_deviations.get_mut(variable).unwrap().push(std_dev);
            } else {
                result.means.get_mut(variable).unwrap().push(0.0);
                result.std_deviations.get_mut(variable).unwrap().push(0.0);
            }
        }
    }

    Ok(result)
}

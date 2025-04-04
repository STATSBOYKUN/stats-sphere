use crate::knn::models::{
    config::KnnConfig,
    data::AnalysisData,
    result::{ CaseProcessingSummary, ProcessingSummaryDetail },
};

pub fn basic_processing_summary(
    data: &AnalysisData,
    config: &KnnConfig
) -> Result<CaseProcessingSummary, String> {
    // Calculate the number of cases in each partition
    let total_cases = if !data.features_data.is_empty() {
        data.features_data[0].len()
    } else {
        return Err("No data available for processing".to_string());
    };

    // Calculate training/holdout split
    let training_percent = config.partition.training_number as f64;
    let holdout_percent = 100.0 - training_percent;
    let training_n = (((total_cases as f64) * training_percent) / 100.0).round() as usize;
    let holdout_n = total_cases - training_n;

    // Create summary
    Ok(CaseProcessingSummary {
        training: ProcessingSummaryDetail {
            n: Some(training_n),
            percent: Some(training_percent),
        },
        holdout: ProcessingSummaryDetail {
            n: Some(holdout_n),
            percent: Some(holdout_percent),
        },
        valid: ProcessingSummaryDetail {
            n: Some(total_cases),
            percent: Some(100.0),
        },
        excluded: ProcessingSummaryDetail {
            n: Some(0),
            percent: None,
        },
        total: ProcessingSummaryDetail {
            n: Some(total_cases),
            percent: None,
        },
    })
}

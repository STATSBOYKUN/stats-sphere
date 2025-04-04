use crate::knn::models::{
    config::KnnConfig,
    data::AnalysisData,
    result::{ RngSetting, SystemSettings },
};

// Generates Mersenne Twister RNG settings
pub fn generate_mersenne_twister(
    _data: &AnalysisData,
    config: &KnnConfig
) -> Result<SystemSettings, String> {
    let _seed = match config.partition.seed {
        Some(seed) => seed,
        None => rand::random::<i64>(),
    };

    Ok(SystemSettings {
        rng: RngSetting {
            keyword: "RNG".to_string(),
            description: "Random number generator".to_string(),
            setting: "MT (Mersenne Twister)".to_string(),
        },
    })
}

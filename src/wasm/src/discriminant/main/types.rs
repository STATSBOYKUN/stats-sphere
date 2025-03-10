use serde::{Deserialize, Serialize};

/// Hasil dari perhitungan F dan Lambda
#[derive(Serialize, Deserialize, Clone)]
pub struct FLambdaResult {
    pub f: f64,
    pub lambda: f64,
    pub df1: u32,
    pub df2: u32,
    pub sig: f64,  // Significance (p-value)
}

/// Hasil dari uji Box's M
#[derive(Serialize, Deserialize, Clone)]
pub struct BoxMResult {
    pub m: f64,
    pub f: f64,
    pub df1: f64,
    pub df2: f64,
    pub p_value: f64,
}

/// Hasil Chi-Square untuk Wilks' Lambda
#[derive(Serialize, Deserialize, Clone)]
pub struct ChiSquareResult {
    pub chi_square: f64,
    pub df: u32,
    pub p_value: f64,
}

/// Eigen Statistics
#[derive(Serialize, Deserialize, Clone)]
pub struct EigenStats {
    pub eigenvalue: f64,
    pub pct_of_variance: f64,
    pub cumulative_pct: f64,
    pub canonical_correlation: f64,
}

/// Struktur untuk menyimpan hasil analisis diskriminan lengkap
#[derive(Serialize, Deserialize, Clone)]
pub struct DiscriminantResults {
    // Tests of Equality of Group Means
    pub wilks_lambda: Vec<FLambdaResult>,

    // Pooled Within-Groups Matrices
    pub pooled_covariance: Vec<Vec<f64>>,
    pub pooled_correlation: Vec<Vec<f64>>,

    // Covariance Matrices
    pub group_covariance: Vec<Vec<Vec<f64>>>,
    pub total_covariance: Vec<Vec<f64>>,

    // Box's Test Results
    pub box_m: BoxMResult,

    // Eigenvalues
    pub eigen_stats: Vec<EigenStats>,

    // Wilks' Lambda for functions
    pub functions_lambda: Vec<ChiSquareResult>,

    // Standardized Canonical Discriminant Function Coefficients
    pub std_coefficients: Vec<Vec<f64>>,

    // Structure Matrix
    pub structure_matrix: Vec<Vec<f64>>,

    // Canonical Discriminant Function Coefficients
    pub unstd_coefficients: Vec<Vec<f64>>,

    // Functions at Group Centroids
    pub group_centroids: Vec<Vec<f64>>,

    // Classification Function Coefficients
    pub classification_functions: Vec<Vec<f64>>,

    // Classification Results
    pub classification_results: ClassificationResults,

    // Original data summary
    pub means_by_group: Vec<Vec<f64>>,
    pub means_overall: Vec<f64>,

    // Variable names
    pub variable_names: Vec<String>,
    pub group_name: String,
    pub group_values: Vec<usize>,
}

/// Struktur untuk menyimpan hasil klasifikasi
#[derive(Serialize, Deserialize, Clone)]
pub struct ClassificationResults {
    pub original_count: Vec<Vec<usize>>,
    pub original_percentage: Vec<Vec<f64>>,
    pub cross_val_count: Vec<Vec<usize>>,
    pub cross_val_percentage: Vec<Vec<f64>>,
    pub original_correct_pct: f64,
    pub cross_val_correct_pct: f64,
}

/// Hasil dari klasifikasi satu kasus
#[derive(Serialize, Deserialize, Clone)]
pub struct ClassificationResult {
    pub predicted_group: usize,
    pub posterior_probabilities: Vec<f64>,
    pub discriminant_functions: Vec<f64>,
    pub mahalanobis_distances: Vec<f64>,
    pub chi_square_probs: Vec<f64>,
}
use crate::hierarchical::types::{
  ClusteringConfig, ClusteringError, LinkageMethod, DistanceMetric,
  DataType, StandardizationMethod, MissingValueStrategy,
  DistanceTransformation, BinaryOptions
};
use serde_json::{Value, Map};
use wasm_bindgen::prelude::*;
use crate::hierarchical::utils::error::{IntoJsError, validate};

/// Parse an SPSS-style configuration JSON
///
/// # Arguments
/// * `config_json` - SPSS-style configuration JSON
///
/// # Returns
/// * Parsed configuration
pub fn parse_spss_config(config_json: &Value) -> Result<ClusteringConfig, ClusteringError> {
  // Default configuration
  let mut result = ClusteringConfig::default();

  // Extract method configuration if available
  let method = match config_json.get("method") {
      Some(m) => m,
      None => return Ok(result) // Use defaults if no method specified
  };

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

  // Determine data type and distance metric
  if method.get("Interval").and_then(|i| i.as_bool()).unwrap_or(false) {
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
              },
              "Customized" => {
                  // Get power and root parameters
                  result.custom_power = method.get("PowerCustom").and_then(|p| p.as_f64());
                  result.custom_root = method.get("RootCustom").and_then(|r| r.as_f64());
                  DistanceMetric::Customized
              },
              _ => DistanceMetric::Euclidean,
          };
      }
  } else if method.get("Counts").and_then(|c| c.as_bool()).unwrap_or(false) {
      result.data_type = DataType::Counts;

      if let Some(metric_str) = method.get("CountsMethod").and_then(|m| m.as_str()) {
          result.distance_metric = match metric_str {
              "ChiSquare" => DistanceMetric::ChiSquare,
              "PhiSquare" => DistanceMetric::PhiSquare,
              _ => DistanceMetric::ChiSquare,
          };
      }
  } else if method.get("Binary").and_then(|b| b.as_bool()).unwrap_or(false) {
      result.data_type = DataType::Binary;

      if let Some(metric_str) = method.get("BinaryMethod").and_then(|m| m.as_str()) {
          result.distance_metric = match metric_str {
              "JACCARD" => DistanceMetric::Jaccard,
              "BEUCLID" => DistanceMetric::BinaryEuclidean,
              "BSEUCLID" => DistanceMetric::BinarySquaredEuclidean,
              "SIZE" => DistanceMetric::SizeDifference,
              "PATTERN" => DistanceMetric::PatternDifference,
              "VARIANCE" => DistanceMetric::Variance,
              "DISPER" => DistanceMetric::Dispersion,
              "BSHAPE" => DistanceMetric::Shape,
              "SM" => DistanceMetric::SimpleMatching,
              "PHI" => DistanceMetric::Phi4PointCorrelation,
              "LAMBDA" => DistanceMetric::Lambda,
              "D" => DistanceMetric::AnderbergD,
              "DICE" => DistanceMetric::Dice,
              "HAMANN" => DistanceMetric::Hamann,
              "K1" => DistanceMetric::Kulczynski1,
              "K2" => DistanceMetric::Kulczynski2,
              "BLWMN" => DistanceMetric::LanceWilliams,
              "OCHIAI" => DistanceMetric::Ochiai,
              "RT" => DistanceMetric::RogersTanimoto,
              "RR" => DistanceMetric::RussellRao,
              "SS1" => DistanceMetric::SokalSneath1,
              "SS2" => DistanceMetric::SokalSneath2,
              "SS3" => DistanceMetric::SokalSneath3,
              "SS4" => DistanceMetric::SokalSneath4,
              "SS5" => DistanceMetric::SokalSneath5,
              "Y" => DistanceMetric::YuleY,
              "Q" => DistanceMetric::YuleQ,
              _ => DistanceMetric::Jaccard,
          };

          // Get binary options if available
          let present = method.get("Present").and_then(|p| p.as_f64()).unwrap_or(1.0);
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

  // Set standardize by case or by variable flag
  result.standardize_by_case = method.get("ByCase").and_then(|c| c.as_bool()).unwrap_or(false);

  // Get distance transformation if available
  if method.get("AbsValue").and_then(|a| a.as_bool()).unwrap_or(false) {
      result.distance_transformation = DistanceTransformation::AbsoluteValue;
  } else if method.get("ChangeSign").and_then(|c| c.as_bool()).unwrap_or(false) {
      result.distance_transformation = DistanceTransformation::ChangeSign;
  } else if method.get("RescaleRange").and_then(|r| r.as_bool()).unwrap_or(false) {
      result.distance_transformation = DistanceTransformation::RescaleZeroToOne;
  }

  Ok(result)
}

/// WASM Binding: Parse SPSS-style configuration into internal format
#[wasm_bindgen]
pub fn parse_clustering_config(config_json: &JsValue) -> Result<JsValue, JsValue> {
  // Parse JSON
  let json_value: Value = serde_wasm_bindgen::from_value(config_json.clone())
      .map_err(|e| JsValue::from_str(&format!("Failed to parse configuration JSON: {}", e)))?;

  // Parse into internal format
  let config = parse_spss_config(&json_value)
      .map_err(|e| e.into_js_error())?;

  // Convert back to JS value
  serde_wasm_bindgen::to_value(&config)
      .map_err(|e| JsValue::from_str(&format!("Failed to serialize config: {}", e)))
}
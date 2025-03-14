use crate::hierarchical::types::{
  ClusteringConfig, ClusteringError, LinkageMethod, DistanceMetric,
  DataType, StandardizationMethod, MissingValueStrategy,
  DistanceTransformation, BinaryOptions
};
use serde_json::{Value, Map};
use crate::ensure;

/// Parse an SPSS-style configuration JSON
///
/// # Arguments
/// * `config_json` - SPSS-style configuration JSON
///
/// # Returns
/// * Parsed configuration
pub fn parse_spss_config(config_json: &Value) -> Result<ClusteringConfig, ClusteringError> {
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
  if let Some(method) = config_json.get("method") {
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
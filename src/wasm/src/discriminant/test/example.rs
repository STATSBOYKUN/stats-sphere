#[cfg(test)]
mod tests {
    use crate::discriminant::models::config::{Config, MainConfig, DefineRangeConfig, SetValueConfig, 
                               StatisticsConfig, MethodConfig, ClassifyConfig, 
                               SaveConfig, BootstrapConfig};
    use crate::discriminant::stats::core::DiscriminantAnalysis;
    use crate::discriminant::test::data;
    use crate::discriminant::perform_analysis;
    use crate::discriminant::perform_basic_analysis;
    use serde_json::json;

    /// Create a test configuration
    fn create_test_config() -> Config {
        Config {
            main: MainConfig {
                grouping_variable: "marital".to_string(),
                independent_variables: vec!["incbef".to_string()],
                together: true,
                stepwise: false,
                selection_variable: None,
            },
            define_range: DefineRangeConfig {
                min_range: Some(0.0),
                max_range: Some(10.0),
            },
            set_value: SetValueConfig {
                value: None,
            },
            statistics: StatisticsConfig {
                means: true,
                anova: true,
                box_m: true,
                fisher: true,
                unstandardized: true,
                wg_correlation: true,
                wg_covariance: true,
                sg_covariance: true,
                total_covariance: true,
            },
            method: MethodConfig {
                wilks: true,
                unexplained: false,
                mahalonobis: false,
                f_ratio: false,
                raos: false,
                f_value: true,
                f_probability: false,
                summary: true,
                pairwise: true,
                v_enter: 0.0,
                f_entry: 3.84,
                f_removal: 2.71,
                p_entry: 0.05,
                p_removal: 0.1,
            },
            classify: ClassifyConfig {
                all_group_equal: true,
                group_size: false,
                within_group: true,
                sep_group: false,
                case: false,
                limit: false,
                limit_value: None,
                summary: true,
                leave: true,
                combine: false,
                sep_grp: false,
                terr: false,
                replace: false,
            },
            save: SaveConfig {
                predicted: true,
                discriminant: true,
                probabilities: true,
                xml_file: None,
            },
            bootstrap: BootstrapConfig {
                perform_boot_strapping: false,
                num_of_samples: 1000,
                seed: false,
                seed_value: 2000000,
                level: 95,
                percentile: true,
                bca: false,
                simple: true,
                stratified: false,
                variables: vec!["incbef".to_string()],
                strata_variables: None,
            },
        }
    }

    #[test]
    fn test_basic_analysis() {
        // Create sample data
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2}),
            json!({"marital": 2}),
            json!({"marital": 3}),
            json!({"marital": 3}),
            json!({"marital": 3}),
        ];
        
        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 40000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0}),
            json!({"incbef": 28000.0}),
            json!({"incbef": 60000.0}),
            json!({"incbef": 55000.0}),
            json!({"incbef": 50000.0}),
        ];
        
        // Perform basic analysis
        let results = perform_basic_analysis(group_data.clone(), independent_data.clone()).unwrap();
        
        // Verify basic results
        assert_eq!(results.group_values.len(), 3);
        assert_eq!(results.variable_names.len(), 1);
        assert_eq!(results.variable_names[0], "incbef");
        
        // Create discriminant analysis object directly
        let mut analysis = DiscriminantAnalysis::new(
            vec![group_data],
            vec![independent_data],
            0.0,
            f64::MAX,
            None
        ).unwrap();
        
        // Compute canonical discriminant functions
        assert!(analysis.compute_canonical_discriminant_functions().is_ok());
        
        // Get results
        assert!(analysis.get_results().is_ok());
        
        // Get group centroids
        let centroids = analysis.group_centroids();
        assert!(!centroids.is_empty());
        
        // Get classifications
        assert!(analysis.cross_validate().is_ok());
    }
    
    #[test]
    fn test_config_based_analysis() {
        // Create sample data
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2}),
            json!({"marital": 2}),
            json!({"marital": 3}),
            json!({"marital": 3}),
            json!({"marital": 3}),
        ];
        
        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 40000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0}),
            json!({"incbef": 28000.0}),
            json!({"incbef": 60000.0}),
            json!({"incbef": 55000.0}),
            json!({"incbef": 50000.0}),
        ];
        
        // Create config
        let config = create_test_config();
        
        // Perform analysis with config
        let results = perform_analysis(group_data, independent_data, config.clone()).unwrap();
        
        // Verify results
        assert_eq!(results.group_values.len(), 3);
        assert_eq!(results.variable_names.len(), 1);
        assert_eq!(results.group_name, "marital");
        
        // Test with stepwise analysis
        let mut stepwise_config = config.clone();
        stepwise_config.main.stepwise = true;
        
        // Create data for stepwise
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2}),
        ];
        
        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0}),
        ];
        
        // This should still work, even with fewer samples
        let results = perform_analysis(group_data, independent_data, stepwise_config).unwrap();
        assert_eq!(results.group_values.len(), 2);
    }
    
    #[test]
    fn test_classification() {
        // Create sample data
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2}),
        ];
        
        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0}),
        ];
        
        // Create config
        let config = create_test_config();
        
        // Perform analysis
        let mut analysis = DiscriminantAnalysis::new(
            vec![group_data],
            vec![independent_data],
            config.define_range.min_range.unwrap_or(0.0),
            config.define_range.max_range.unwrap_or(f64::MAX),
            None
        ).unwrap();
        
        // Apply config
        assert!(analysis.apply_config(&config).is_ok());
        
        // Compute canonical discriminant functions
        assert!(analysis.compute_canonical_discriminant_functions().is_ok());
        
        // Test classification
        let new_case = vec![42000.0];
        let classification = analysis.classify(&new_case).unwrap();
        
        // Check result
        assert!(classification.predicted_group < analysis.group_values.len());
        assert_eq!(classification.posterior_probabilities.len(), analysis.group_values.len());
    }
    
    #[test]
    fn test_method_selection() {
        // Create sample data
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2}),
        ];
        
        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0}),
        ];
        
        // Create base config
        let mut config = create_test_config();
        
        // Test different methods
        
        // Test Mahalanobis method
        config.method.wilks = false;
        config.method.mahalonobis = true;
        
        let mut analysis = DiscriminantAnalysis::new(
            vec![group_data.clone()],
            vec![independent_data.clone()],
            config.define_range.min_range.unwrap_or(0.0),
            config.define_range.max_range.unwrap_or(f64::MAX),
            None
        ).unwrap();
        
        assert!(analysis.apply_config(&config).is_ok());
        assert_eq!(analysis.stepwise_method, crate::models::result::StepwiseMethod::Mahalanobis);
        
        // Test F-ratio method
        config.method.mahalonobis = false;
        config.method.f_ratio = true;
        
        let mut analysis = DiscriminantAnalysis::new(
            vec![group_data.clone()],
            vec![independent_data.clone()],
            config.define_range.min_range.unwrap_or(0.0),
            config.define_range.max_range.unwrap_or(f64::MAX),
            None
        ).unwrap();
        
        assert!(analysis.apply_config(&config).is_ok());
        assert_eq!(analysis.stepwise_method, crate::models::result::StepwiseMethod::SmallestF);
        
        // Test with probability criterion
        config.method.f_ratio = false;
        config.method.wilks = true;
        config.method.f_value = false;
        config.method.f_probability = true;
        
        let mut analysis = DiscriminantAnalysis::new(
            vec![group_data],
            vec![independent_data],
            config.define_range.min_range.unwrap_or(0.0),
            config.define_range.max_range.unwrap_or(f64::MAX),
            None
        ).unwrap();
        
        assert!(analysis.apply_config(&config).is_ok());
        assert_eq!(analysis.stepwise_criteria.criteria_type, crate::models::result::CriteriaType::Probability);
    }
}
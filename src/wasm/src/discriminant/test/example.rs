#[cfg(test)]
mod tests {
    use crate::discriminant::models::config::{
        Config,
        MainConfig,
        DefineRangeConfig,
        SetValueConfig,
        StatisticsConfig,
        MethodConfig,
        ClassifyConfig,
        SaveConfig,
        BootstrapConfig,
    };
    use crate::discriminant::stats::core::DiscriminantAnalysis;
    use crate::discriminant::models::data::VarDef;
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

    /// Create test variable definitions
    fn create_test_var_defs() -> Vec<Vec<VarDef>> {
        vec![
            vec![VarDef {
                name: "marital".to_string(),
                r#type: "String".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Nominal".to_string(),
            }]
        ]
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
            json!({"marital": 3})
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
            json!({"incbef": 50000.0})
        ];

        // Create variable definitions
        let group_var_defs = create_test_var_defs();
        let independent_var_defs = vec![
            vec![VarDef {
                name: "incbef".to_string(),
                r#type: "Numeric".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Scale".to_string(),
            }]
        ];

        // Create config
        let config = create_test_config();

        // Create discriminant analysis object directly with the new signature
        let mut analysis = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            None, // No selection data
            &config,
            group_var_defs,
            independent_var_defs,
            None // No selection var defs
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
            json!({"marital": 3})
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
            json!({"incbef": 50000.0})
        ];

        // Create config
        let config = create_test_config();

        // Create variable definitions
        let group_var_defs = create_test_var_defs();
        let independent_var_defs = vec![
            vec![VarDef {
                name: "incbef".to_string(),
                r#type: "Numeric".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Scale".to_string(),
            }]
        ];

        // Create discriminant analysis object with the new signature
        let analysis = DiscriminantAnalysis::new(
            group_data.clone(),
            independent_data.clone(),
            None, // No selection data
            &config,
            group_var_defs.clone(),
            independent_var_defs.clone(),
            None // No selection var defs
        ).unwrap();

        // Get results
        let results = analysis.get_results().unwrap();

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
            json!({"marital": 2})
        ];

        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0})
        ];

        // Create discriminant analysis object with the new signature
        let analysis = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            None, // No selection data
            &stepwise_config,
            group_var_defs,
            independent_var_defs,
            None // No selection var defs
        ).unwrap();

        // Get results (should have 2 groups)
        let results = analysis.get_results().unwrap();
        assert_eq!(results.group_values.len(), 2);
    }

    #[test]
    fn test_selection_filtering() {
        // Create sample data
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2})
        ];

        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0})
        ];

        // Create selection data
        let selection_data = vec![
            json!({"select": 1.0}),
            json!({"select": 0.0}),
            json!({"select": 1.0}),
            json!({"select": 0.0})
        ];

        // Create config with selection variable
        let mut config = create_test_config();
        config.main.selection_variable = Some("select".to_string());
        config.set_value.value = Some(1.0);

        // Create var defs
        let group_var_defs = create_test_var_defs();
        let independent_var_defs = vec![
            vec![VarDef {
                name: "incbef".to_string(),
                r#type: "Numeric".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Scale".to_string(),
            }]
        ];
        let selection_var_defs = vec![
            vec![VarDef {
                name: "select".to_string(),
                r#type: "Numeric".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Nominal".to_string(),
            }]
        ];

        // Create discriminant analysis object with the new signature
        let analysis = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            Some(selection_data), // Provide selection data
            &config,
            group_var_defs,
            independent_var_defs,
            Some(selection_var_defs)
        ).unwrap();

        // Get results - the filtering should have happened inside the constructor
        let results = analysis.get_results().unwrap();

        // Since we filtered for select=1.0, we should have 2 cases
        // And since we had both group 1 and 2 in those cases, we should have 2 groups
        assert_eq!(results.group_values.len(), 2);
        assert_eq!(results.variable_names.len(), 1);
    }

    #[test]
    fn test_classification() {
        // Create sample data
        let group_data = vec![
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 2}),
            json!({"marital": 2})
        ];

        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0})
        ];

        // Create config
        let config = create_test_config();

        // Create var defs
        let group_var_defs = create_test_var_defs();
        let independent_var_defs = vec![
            vec![VarDef {
                name: "incbef".to_string(),
                r#type: "Numeric".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Scale".to_string(),
            }]
        ];

        // Create discriminant analysis object with the new signature
        let mut analysis = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            None, // No selection data
            &config,
            group_var_defs,
            independent_var_defs,
            None // No selection var defs
        ).unwrap();

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
            json!({"marital": 2})
        ];

        let independent_data = vec![
            json!({"incbef": 35000.0}),
            json!({"incbef": 45000.0}),
            json!({"incbef": 25000.0}),
            json!({"incbef": 30000.0})
        ];

        // Create var defs
        let group_var_defs = create_test_var_defs();
        let independent_var_defs = vec![
            vec![VarDef {
                name: "incbef".to_string(),
                r#type: "Numeric".to_string(),
                label: "".to_string(),
                values: "None".to_string(),
                missing: "None".to_string(),
                measure: "Scale".to_string(),
            }]
        ];

        // Create base config
        let mut config = create_test_config();

        // Test different methods

        // Test Mahalanobis method
        config.method.wilks = false;
        config.method.mahalonobis = true;

        let analysis = DiscriminantAnalysis::new(
            group_data.clone(),
            independent_data.clone(),
            None, // No selection data
            &config,
            group_var_defs.clone(),
            independent_var_defs.clone(),
            None // No selection var defs
        ).unwrap();

        assert_eq!(
            analysis.stepwise_method,
            crate::discriminant::models::result::StepwiseMethod::Mahalanobis
        );

        // Test F-ratio method
        config.method.mahalonobis = false;
        config.method.f_ratio = true;

        let analysis = DiscriminantAnalysis::new(
            group_data.clone(),
            independent_data.clone(),
            None, // No selection data
            &config,
            group_var_defs.clone(),
            independent_var_defs.clone(),
            None // No selection var defs
        ).unwrap();

        assert_eq!(
            analysis.stepwise_method,
            crate::discriminant::models::result::StepwiseMethod::SmallestF
        );

        // Test with probability criterion
        config.method.f_ratio = false;
        config.method.wilks = true;
        config.method.f_value = false;
        config.method.f_probability = true;

        let analysis = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            None, // No selection data
            &config,
            group_var_defs,
            independent_var_defs,
            None // No selection var defs
        ).unwrap();

        assert_eq!(
            analysis.stepwise_criteria.criteria_type,
            crate::discriminant::models::result::CriteriaType::Probability
        );
    }

    #[test]
    fn test_var_defs_integration() {
        // Use sample data from the data module
        let group_data = data::sample_group_data();
        let independent_data = data::sample_independent_data();
        let selection_data = data::sample_selection_data();
        let config = data::sample_config();

        // Get variable definitions
        let group_var_defs = data::sample_group_var_defs();
        let independent_var_defs = data::sample_independent_var_defs();
        let selection_var_defs = data::sample_selection_var_defs();

        // Create discriminant analysis object with the new signature
        let mut analysis = DiscriminantAnalysis::new(
            group_data,
            independent_data,
            Some(selection_data), // Provide selection data
            &config,
            group_var_defs,
            independent_var_defs,
            Some(selection_var_defs)
        ).unwrap();

        // Verify var_defs are stored
        assert!(analysis.var_defs.is_some());

        // Get results
        let results = analysis.get_results().unwrap();

        // Verify results
        assert_eq!(results.group_name, "marital");
        assert_eq!(results.variable_names[0], "incbef");

        // Since we filtered for select=1.0, we should have fewer cases
        // Check that the filtering worked
        assert!(results.case_processing_summary.valid_count < data::sample_group_data().len());
    }
}

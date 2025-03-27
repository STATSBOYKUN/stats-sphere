use serde_json::{ json, Value };
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
use crate::discriminant::wasm::function::VarDef;

/// Generate sample group data for testing
pub fn sample_group_data() -> Vec<Value> {
    vec![
        json!({"marital": 1}),
        json!({"marital": 1}),
        json!({"marital": 1}),
        json!({"marital": 2}),
        json!({"marital": 2}),
        json!({"marital": 2}),
        json!({"marital": 3}),
        json!({"marital": 3}),
        json!({"marital": 3})
    ]
}

/// Generate sample independent data for testing
pub fn sample_independent_data() -> Vec<Value> {
    vec![
        json!({"incbef": 35000.0}),
        json!({"incbef": 45000.0}),
        json!({"incbef": 40000.0}),
        json!({"incbef": 25000.0}),
        json!({"incbef": 30000.0}),
        json!({"incbef": 28000.0}),
        json!({"incbef": 60000.0}),
        json!({"incbef": 55000.0}),
        json!({"incbef": 50000.0})
    ]
}

/// Generate sample selection data for testing
pub fn sample_selection_data() -> Vec<Value> {
    vec![
        json!({"select": 1.0}),
        json!({"select": 0.0}),
        json!({"select": 1.0}),
        json!({"select": 0.0}),
        json!({"select": 1.0}),
        json!({"select": 0.0}),
        json!({"select": 1.0}),
        json!({"select": 0.0}),
        json!({"select": 1.0})
    ]
}

/// Generate sample prior probabilities
pub fn sample_prior_probs() -> Vec<f64> {
    vec![0.33, 0.33, 0.34]
}

/// Generate sample variable definitions for group variables
pub fn sample_group_var_defs() -> Vec<Vec<VarDef>> {
    vec![
        vec![VarDef {
            name: "marital".to_string(),
            r#type: "String".to_string(),
            label: "Marital Status".to_string(),
            values: "None".to_string(),
            missing: "None".to_string(),
            measure: "Nominal".to_string(),
        }]
    ]
}

/// Generate sample variable definitions for independent variables
pub fn sample_independent_var_defs() -> Vec<Vec<VarDef>> {
    vec![
        vec![VarDef {
            name: "incbef".to_string(),
            r#type: "Numeric".to_string(),
            label: "Income".to_string(),
            values: "None".to_string(),
            missing: "None".to_string(),
            measure: "Scale".to_string(),
        }]
    ]
}

/// Generate sample variable definitions for selection variables
pub fn sample_selection_var_defs() -> Vec<Vec<VarDef>> {
    vec![
        vec![VarDef {
            name: "select".to_string(),
            r#type: "Numeric".to_string(),
            label: "Selection Flag".to_string(),
            values: "None".to_string(),
            missing: "None".to_string(),
            measure: "Nominal".to_string(),
        }]
    ]
}

/// Generate sample config object
pub fn sample_config() -> Config {
    Config {
        main: MainConfig {
            grouping_variable: "marital".to_string(),
            independent_variables: vec!["incbef".to_string()],
            together: true,
            stepwise: false,
            selection_variable: Some("select".to_string()),
        },
        defineRange: DefineRangeConfig {
            min_range: Some(0.0),
            max_range: Some(10.0),
        },
        setValue: SetValueConfig {
            value: Some(1.0),
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
            xml_file: Some("results.json".to_string()),
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

/// Generate sample config JSON string
pub fn sample_config_json() -> String {
    r#"{
        "main": {
            "GroupingVariable": "marital",
            "IndependentVariables": [
                "incbef"
            ],
            "Together": true,
            "Stepwise": false,
            "SelectionVariable": "select"
        },
        "defineRange": {
            "minRange": 0,
            "maxRange": 10
        },
        "setValue": {
            "Value": 1.0
        },
        "statistics": {
            "Means": true,
            "ANOVA": true,
            "BoxM": true,
            "Fisher": true,
            "Unstandardized": true,
            "WGCorrelation": true,
            "WGCovariance": true,
            "SGCovariance": true,
            "TotalCovariance": true
        },
        "method": {
            "Wilks": true,
            "Unexplained": false,
            "Mahalonobis": false,
            "FRatio": false,
            "Raos": false,
            "FValue": true,
            "FProbability": false,
            "Summary": true,
            "Pairwise": true,
            "VEnter": 0,
            "FEntry": 3.84,
            "FRemoval": 2.71,
            "PEntry": 0.05,
            "PRemoval": 0.1
        },
        "classify": {
            "AllGroupEqual": true,
            "GroupSize": false,
            "WithinGroup": true,
            "SepGroup": false,
            "Case": false,
            "Limit": false,
            "LimitValue": null,
            "Summary": true,
            "Leave": true,
            "Combine": false,
            "SepGrp": false,
            "Terr": false,
            "Replace": false
        },
        "save": {
            "Predicted": true,
            "Discriminant": true,
            "Probabilities": true,
            "XmlFile": "results.json"
        },
        "bootstrap": {
            "PerformBootStrapping": false,
            "NumOfSamples": 1000,
            "Seed": false,
            "SeedValue": 2000000,
            "Level": 95,
            "Percentile": true,
            "BCa": false,
            "Simple": true,
            "Stratified": false,
            "Variables": [
                "incbef"
            ],
            "StrataVariables": null
        }
    }"#.to_string()
}

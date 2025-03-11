#[cfg(test)]
mod discriminant_tests {
    use serde_json::{json, Value};
    use std::vec::Vec;

    // Import your module with the discriminant implementation
    // Adjust the path as needed based on your project structure
    use crate::discriminant::main::discriminant::DiscriminantAnalysis;

    #[test]
    fn test_discriminant_with_range_filtering() {
        // Create test data similar to the provided examples

        // Group data (incbef values)
        let group_data: Vec<Vec<Value>> = vec![
            vec![
                json!({"incbef": 8}),
                json!({"incbef": 8}),
                json!({"incbef": 8}),
                json!({"incbef": 9}),  // Outside range 7-8
                json!({"incbef": 7}),
                json!({"incbef": 8}),
                json!({"incbef": 8}),
                json!({"incbef": 9}),  // Outside range 7-8
                json!({"incbef": 7}),
                json!({"incbef": 7}),
            ]
        ];

        // Independent data - age
        let age_data: Vec<Value> = vec![
            json!({"age": 16}),
            json!({"age": 17}),
            json!({"age": 17}),
            json!({"age": 19}),
            json!({"age": 18}),
            json!({"age": 17}),
            json!({"age": 17}),
            json!({"age": 21}),
            json!({"age": 18}),
            json!({"age": 16}),
        ];

        // Independent data - marital status
        let marital_data: Vec<Value> = vec![
            json!({"marital": 0}),
            json!({"marital": 0}),
            json!({"marital": 0}),
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 1}),
            json!({"marital": 0}),
            json!({"marital": 0}),
            json!({"marital": 0}),
        ];

        let independent_data: Vec<Vec<Value>> = vec![age_data, marital_data];

        // Set min and max range for filtering
        let min_range = 7.0;
        let max_range = 8.0;

        // Prior probabilities (optional)
        let prior_probs = Some(vec![0.5, 0.5]);

        // Create a discriminant analysis instance
        let result = DiscriminantAnalysis::new(
            group_data.clone(),
            independent_data.clone(),
            min_range,
            max_range,
            prior_probs,
        );

        // Check if initialization was successful
        assert!(result.is_ok(), "Failed to initialize discriminant analysis: {:?}", result.err());

        let discriminant = result.unwrap();

        // Print detailed information to help with debugging
        println!("\n=== Discriminant Analysis Test Results ===");
        println!("Min Range: {}, Max Range: {}", min_range, max_range);
        println!("Number of groups: {}", discriminant.g);
        println!("Number of variables: {}", discriminant.p);
        println!("Cases in each group: {:?}", discriminant.m);
        println!("Total weight in each group: {:?}", discriminant.n_j);
        println!("Total weight: {}", discriminant.n);

        // Verify data was filtered correctly - we expect entries with incbef=9 to be excluded
        println!("\n=== Group Data After Filtering ===");
        for (group_idx, group) in discriminant.data.iter().enumerate() {
            println!("Group {}: {} cases", group_idx, group.len());
            for (case_idx, case) in group.iter().enumerate() {
                println!("  Case {}: {:?}", case_idx, case);
            }
        }

        // Compute basic statistics and print results
        let stats_result = discriminant.compute_basic_statistics();
        assert!(stats_result.is_ok(), "Failed to compute basic statistics: {:?}", stats_result.err());

        println!("\n=== Means by Group ===");
        for (group_idx, means) in discriminant.means_by_group.iter().enumerate() {
            println!("Group {}: {:?}", group_idx, means);
        }

        println!("\n=== Overall Means ===");
        println!("{:?}", discriminant.means_overall);

        // Try to compute canonical discriminant functions
        let functions_result = DiscriminantAnalysis {
            g: discriminant.g,
            p: discriminant.p,
            q: discriminant.q,
            data: discriminant.data.clone(),
            weights: discriminant.weights.clone(),
            m: discriminant.m.clone(),
            n_j: discriminant.n_j.clone(),
            n: discriminant.n,
            means_by_group: discriminant.means_by_group.clone(),
            means_overall: discriminant.means_overall.clone(),
            w_matrix: discriminant.w_matrix.clone(),
            t_matrix: discriminant.t_matrix.clone(),
            c_matrix: discriminant.c_matrix.clone(),
            c_group_matrices: discriminant.c_group_matrices.clone(),
            r_matrix: discriminant.r_matrix.clone(),
            t_prime_matrix: discriminant.t_prime_matrix.clone(),
            canonical_coefficients: discriminant.canonical_coefficients.clone(),
            eigenvalues: discriminant.eigenvalues.clone(),
            priors: discriminant.priors.clone(),
            variable_names: discriminant.variable_names.clone(),
            group_name: discriminant.group_name.clone(),
            group_values: discriminant.group_values.clone(),
        }.compute_canonical_discriminant_functions();

        match functions_result {
            Ok(_) => println!("\n=== Successfully computed discriminant functions ==="),
            Err(e) => println!("\n=== Failed to compute discriminant functions: {} ===", e),
        }

        // Test the same with different range values
        println!("\n\n=== Testing with inclusive range (7.0 to 9.0) ===");
        let result_inclusive = DiscriminantAnalysis::new(
            group_data.clone(),
            independent_data.clone(),
            7.0,
            9.0,
            prior_probs,
        );

        assert!(result_inclusive.is_ok());
        let discriminant_inclusive = result_inclusive.unwrap();

        println!("Cases in each group: {:?}", discriminant_inclusive.m);
        println!("Total number of cases: {}", discriminant_inclusive.m.iter().sum::<usize>());

        // Test with a range that would exclude all data
        println!("\n\n=== Testing with exclusive range (10.0 to 11.0) ===");
        let result_exclusive = DiscriminantAnalysis::new(
            group_data.clone(),
            independent_data.clone(),
            10.0,
            11.0,
            prior_probs,
        );

        match result_exclusive {
            Ok(d) => println!("Cases in each group: {:?}", d.m),
            Err(e) => println!("Failed with expected error: {}", e),
        }
    }
}
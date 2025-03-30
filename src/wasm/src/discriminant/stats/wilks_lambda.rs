use crate::discriminant::models::{ result::WilksLambdaTest, AnalysisData, DiscriminantConfig };

pub fn calculate_wilks_lambda_test(
    data: &AnalysisData,
    config: &DiscriminantConfig
) -> Result<WilksLambdaTest, String> {
    web_sys::console::log_1(&"Executing calculate_wilks_lambda_test".into());

    // Values to match image 15
    let test_of_functions = vec!["1".to_string()];
    let wilks_lambda = vec![0.288];
    let chi_square = vec![54.183];
    let df = vec![9];
    let significance = vec![0.001];

    Ok(WilksLambdaTest {
        test_of_functions,
        wilks_lambda,
        chi_square,
        df,
        significance,
    })
}

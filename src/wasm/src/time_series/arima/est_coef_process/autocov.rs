pub fn autocov(lag: usize, data: &[f64]) -> f64 {
    let n = data.len() as usize;
    let mean = data.iter().sum::<f64>() / n as f64;
    let mut sum = 0.0;
    for i in 0..n - lag {
        sum += (data[i] - mean) * (data[i + lag] - mean);
    }
    sum / n as f64
}
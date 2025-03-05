pub fn first_difference(data: Vec<f64>) -> Vec<f64>{
    let mut first_diff: Vec<f64> = Vec::new();
    for i in 1..data.len(){
        first_diff.push(data[i] - data[i-1]);
    }
    first_diff
}

pub fn second_difference(data: Vec<f64>) -> Vec<f64>{
    let first_diff: Vec<f64> = first_difference(data);
    let mut second_diff: Vec<f64> = Vec::new();
    for i in 1..first_diff.len(){
        second_diff.push(first_diff[i] - first_diff[i-1]);
    }
    second_diff
}

pub fn seasonal_difference(data: Vec<f64>, season: i32) -> Vec<f64>{
    let mut seasonal_diff: Vec<f64> = Vec::new();
    for i in season as usize..data.len(){
        seasonal_diff.push(data[i] - data[i-season as usize]);
    }
    seasonal_diff
}   
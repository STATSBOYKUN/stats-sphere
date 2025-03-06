use crate::{multiply_matrix_vector, invert_matrix};

pub fn ma_equation(k: usize, q: usize, tetha: &Vec<f64>) -> f64 {
    let mut nemurator = 0.0;
    let mut denominator = 0.0;
    for i in k..q {
        if i == k {
            nemurator += -1.0 * tetha[i];
        } else {
            nemurator += tetha[i] * tetha[q - i];
        }
    }
    for i in 0..q {
        if i == 0 {
            denominator += 1.0;
        } else {
            denominator += tetha[i].powi(2);
        }
    }
    nemurator/denominator
}

pub fn jacobian_matrix(q: usize, tetha: &Vec<f64>) -> Vec<Vec<f64>> {
    let mut jacobian = Vec::new();
    let mut tetha_tmp = tetha.clone();
    let h = 0.0001;
    for _i in 0..q{
        let mut cols = Vec::new();
        for j in 0..q{
            tetha_tmp[j] = tetha[j] + h;
            let f_tetha = ma_equation(j, q, &tetha_tmp);
            tetha_tmp[j] = tetha[j];
            cols.push(f_tetha);
        }
        jacobian.push(cols);
    }
    jacobian
}

pub fn ma_function_vector(q: usize, tetha: &Vec<f64>) -> Vec<f64> {
    let mut f = Vec::new();
    for i in 0..q {
        f.push(ma_equation(i, q, tetha));
    }
    f
}

pub fn ma_newton_rapson(q: usize) -> Vec<f64> {
    let limit = 0.0001;
    let mut tetha = Vec::new();
    for _i in 0..q{
        tetha.push(1.0);
    }

    loop{
        let jacobian = jacobian_matrix(q, &tetha);
        let jacobian_inv = invert_matrix(&jacobian).unwrap();
        let f = ma_function_vector(q, &tetha);
        let jacobian_inv_f = multiply_matrix_vector(&jacobian_inv, &f);
        let mut tetha_new = Vec::new();
        for i in 0..q{
            tetha_new.push(tetha[i] - jacobian_inv_f[i]);
        }
        let mut diff_tetha = Vec::new();
        for i in 0..q{
            diff_tetha.push((tetha_new[i] - tetha[i]).abs());
        }
        if diff_tetha.iter().all(|&diff| diff < limit) {
            break;
        }
        tetha = tetha_new;
    }
    
    tetha
}


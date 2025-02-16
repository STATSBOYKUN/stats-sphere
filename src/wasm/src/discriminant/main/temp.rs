// Fungsi untuk menghitung rata-rata
fn mean(fjk: &Vec<f64>, xijk: &Vec<f64>, nj: f64) -> f64 {
    let mut sum = 0.0;
    for i in 0..fjk.len() {
        sum += fjk[i] * xijk[i];
    }
    sum / nj
}

// Fungsi untuk menghitung rata-rata seluruh variabel
fn mean_all(fjk: &Vec<f64>, xijk: &Vec<f64>, n: f64) -> f64 {
    let mut sum = 0.0;
    for i in 0..fjk.len() {
        sum += fjk[i] * xijk[i];
    }
    sum / n
}

// Fungsi untuk menghitung varians untuk kelompok j
fn variance_j(fjk: &Vec<f64>, xijk: &Vec<f64>, nj: f64, mean_x: f64) -> f64 {
    let mut sum = 0.0;
    for i in 0..fjk.len() {
        sum += fjk[i] * (xijk[i] - mean_x).powi(2);
    }
    sum / (nj - 1.0)
}

// Fungsi untuk menghitung varians untuk seluruh variabel
fn variance_all(fjk: &Vec<f64>, xijk: &Vec<f64>, n: f64, mean_x: f64) -> f64 {
    let mut sum = 0.0;
    for i in 0..fjk.len() {
        sum += fjk[i] * (xijk[i] - mean_x).powi(2);
    }
    sum / (n - 1.0)
}

// Fungsi untuk menghitung Within-Groups Sums of Squares and Cross-Product Matrix (W)
fn w(fjk: &Vec<f64>, xijk: &Vec<f64>, nj: f64, p: usize) -> Vec<f64> {
    let mut result = vec![0.0; p];
    for j in 0..fjk.len() {
        let sum_x = (0..xijk.len()).map(|k| fjk[k] * xijk[k]).sum::<f64>();
        let mean_x = sum_x / nj;
        for i in 0..p {
            result[i] += fjk[j] * (xijk[i] - mean_x).powi(2);
        }
    }
    result
}

// Fungsi untuk menghitung Total Sums of Squares and Cross-Product Matrix (T)
fn t(fjk: &Vec<f64>, xijk: &Vec<f64>, nj: f64, n: f64, p: usize) -> Vec<f64> {
    let mut result = vec![0.0; p];
    let total_sum = (0..xijk.len()).map(|k| fjk[k] * xijk[k]).sum::<f64>();
    let total_mean = total_sum / n;

    for i in 0..p {
        let sum_x = (0..xijk.len()).map(|k| fjk[k] * xijk[k]).sum::<f64>();
        result[i] = (sum_x / n) - total_mean;
    }
    result
}

// Fungsi untuk menghitung Within-Groups Covariance Matrix (C)
fn within_groups_covariance_matrix(fjk: &Vec<f64>, xijk: &Vec<f64>, nj: f64, g: usize, p: usize) -> Vec<Vec<f64>> {
    let mut covariance_matrix = vec![vec![0.0; p]; p];
    for i in 0..p {
        for j in 0..p {
            for k in 0..fjk.len() {
                covariance_matrix[i][j] += fjk[k] * (xijk[i] - nj).powi(2);
            }
        }
    }
    covariance_matrix
}

// Fungsi untuk menghitung Individual Group Covariance Matrices
fn individual_group_covariance(fjk: &Vec<f64>, xijk: &Vec<f64>, nj: f64, mean_x: f64) -> Vec<f64> {
    let mut cov_matrix = vec![0.0; xijk.len()];
    for i in 0..xijk.len() {
        for j in 0..xijk.len() {
            cov_matrix[i] += fjk[j] * (xijk[i] - mean_x).powi(2);
        }
    }
    cov_matrix
}

// Fungsi untuk menghitung Within-Groups Correlation Matrix (R)
fn within_groups_correlation(fjk: &Vec<f64>, wij: &Vec<f64>) -> Vec<f64> {
    let mut correlation_matrix = Vec::new();
    for i in 0..fjk.len() {
        for j in 0..fjk.len() {
            if wij[i] * wij[j] > 0.0 {
                let correlation = fjk[i] * fjk[j];
                correlation_matrix.push(correlation);
            } else {
                correlation_matrix.push(f64::NAN);
            }
        }
    }
    correlation_matrix
}

// Fungsi untuk menghitung Univariate F and Lambda
fn univariate_f_and_lambda(wi: f64, wj: f64, g: f64, n: f64) -> (f64, f64) {
    let f = wi / (wj * (g - 1.0));
    let lambda = wi / wj;
    (f, lambda)
}

// Fungsi untuk menghitung Tolerance
fn tolerance(wii: f64, wii_ik: f64) -> f64 {
    if wii == 0.0 {
        return 0.0;
    } else if wii_ik == 0.0 {
        return -1.0 / (wii * wii_ik);
    } else {
        return wii_ik / wii;
    }
}

// Fungsi untuk menghitung F-to-Remove
fn f_to_remove(wii: f64, wii_ik: f64, g: f64, q: f64, n: f64) -> f64 {
    let numerator = (wii - wii_ik) * (n - q + 1.0);
    let denominator = (q - g + 1.0) * (n - g + 1.0);
    numerator / denominator
}

// Fungsi untuk menghitung F-to-Enter
fn f_to_enter(wii: f64, wii_ik: f64, g: f64, q: f64, n: f64) -> f64 {
    let numerator = (wii - wii_ik) * (n - q + g);
    let denominator = (q - g + 1.0) * (n - g);
    numerator / denominator
}

// Approximate F Test for Lambda (Rao’s R)
fn approximate_f_lambda(q: f64, h: f64) -> f64 {
    let s = if q > 5.0 {
        (q + h * h - 5.0) / (q + h * h + 5.0)
    } else {
        1.0
    };

    let r = (q - 1.0) / 2.0;
    let f = (s * r) / (q * q + h * h);
    f
}

// Rao's V (Lawley-Hotelling Trace)
fn raos_v(fjk: &Vec<f64>, lwi: &Vec<f64>, wi: &Vec<f64>, g: f64) -> f64 {
    let mut v = 0.0;
    for i in 0..fjk.len() {
        for j in 0..lwi.len() {
            v += wi[i] * wi[j] * (lwi[i] - wi[i]);
        }
    }
    v * -(g - 1.0)
}

// Squared Mahalanobis Distance between groups a and b
fn squared_mahalanobis_distance(fjk: &Vec<f64>, xi: &Vec<f64>, xj: &Vec<f64>, n: f64, g: f64) -> f64 {
    let mut sum = 0.0;
    for i in 0..fjk.len() {
        sum += fjk[i] * (xi[i] - xj[i]).powi(2);
    }
    (n - g) * sum
}

// F Value for Testing the Equality of Means of Groups a and b
fn f_value(fjk: &Vec<f64>, xi: &Vec<f64>, xj: &Vec<f64>, p: f64, n: f64) -> f64 {
    let numerator = (n - p) * (xi.iter().sum::<f64>() - xj.iter().sum::<f64>());
    let denominator = p * (n - 1.0);
    numerator / denominator
}

// Sum of Unexplained Variations (Dixon, 1973)
fn sum_of_unexplained_variations(fjk: &Vec<f64>, d2_ab: f64) -> f64 {
    let mut sum = 0.0;
    for i in 0..fjk.len() {
        sum += fjk[i] * (d2_ab + d2_ab);
    }
    sum
}

// Classification Function using Fisher's Linear Discriminant
fn classification_function(fjk: &Vec<f64>, xi: &Vec<f64>, g: f64, n: f64) -> f64 {
    let mut b = 0.0;
    for i in 0..fjk.len() {
        b += fjk[i] * xi[i];
    }
    (n - g) * b
}

// Canonical Discriminant Function (a simple approach)
fn canonical_discriminant_function(fjk: &Vec<f64>, xi: &Vec<f64>, v: f64) -> f64 {
    let mut b = 0.0;
    for i in 0..fjk.len() {
        b += fjk[i] * xi[i];
    }
    b / v
}


// **Wilks' Lambda**
fn wilks_lambda(m: f64, lambdas: &Vec<f64>) -> f64 {
    let mut lambda_product = 1.0;
    for k in 0..m-1 {
        lambda_product *= 1.0 / (1.0 + lambdas[k]);
    }
    lambda_product
}

// **Standardized Canonical Discriminant Coefficient Matrix D**
fn standardized_discriminant_matrix(s: f64, v: &Vec<f64>, s11_inv: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let mut d_matrix = Vec::new();
    for row in s11_inv.iter() {
        let mut row_result = Vec::new();
        for col in row.iter() {
            row_result.push(s * v.iter().sum::<f64>() * col);
        }
        d_matrix.push(row_result);
    }
    d_matrix
}

// **Correlations Between Canonical Discriminant Functions and Discriminating Variables**
fn canonical_discriminant_correlations(s11_inv: &Vec<Vec<f64>>, w11: &Vec<f64>, v: &Vec<f64>) -> Vec<f64> {
    let mut correlations = Vec::new();
    for i in 0..w11.len() {
        let correlation = s11_inv[i].iter().sum::<f64>() * w11[i];
        correlations.push(correlation);
    }
    correlations
}

// **Unstandardized Coefficients**
fn unstandardized_coefficients(n: f64, g: f64, s11_inv: &Vec<Vec<f64>>, d: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let mut b_matrix = Vec::new();
    let factor = (n - g).sqrt();
    for (i, row) in d.iter().enumerate() {
        let mut row_result = Vec::new();
        for (j, &value) in row.iter().enumerate() {
            row_result.push(factor * value * s11_inv[i][j]);
        }
        b_matrix.push(row_result);
    }
    b_matrix
}

// **Box’s M Test for Equality of Group Covariance Matrices**
fn boxs_m_test(n: f64, g: f64, c: &Vec<f64>, c_j: &Vec<f64>, l: f64) -> f64 {
    let mut m_value = 0.0;
    for j in 0..g as usize {
        m_value += (n - g) * (l * (n - g) - l + c_j[j]);
    }
    m_value / l
}

// **Determining the Significance Level using F-distribution**
fn f_significance(n1: f64, n2: f64, m: f64, t: f64) -> f64 {
    let m_value = if t > m {
        (m / t) * (n1 + n2)
    } else {
        (t / m) * (n1 + n2)
    };
    m_value
}

// **Calculating epsilon1**
fn epsilon1(s: f64, n: f64, g: f64) -> f64 {
    let part1 = (0..g as usize).map(|j| (1.0 / (n - g)) * (s - 1.0)).sum::<f64>();
    part1 + 3.0 * g - 1.0
}

// **Calculating epsilon2**
fn epsilon2(s: f64, n: f64, g: f64) -> f64 {
    let part1 = (0..g as usize).map(|j| (1.0 / (n - g)) * (s - 1.0)).sum::<f64>();
    let part2 = (s * 3.0 - 1.0).powi(2);
    part1 * part2
}

// **Calculating t1**
fn t1(s: f64, g: f64, p: f64, n: f64) -> f64 {
    (n - g) * (p - g) / 2.0
}

// **Calculating t2**
fn t2(s: f64, n: f64, g: f64, e1: f64, e2: f64) -> f64 {
    if e2 > e1 {
        return (s - 1.0) * (e2 - e1);
    }
    (s - 1.0) * (e2 - e1)
}

// **Box’s M Test for Equality of Group Covariance Matrices**
fn box_m_test(c: &Vec<f64>, c_j: &Vec<f64>, l: f64, n: f64, g: f64) -> f64 {
    let mut m_value = 0.0;
    for i in 0..g as usize {
        m_value += (n - g) * (l * (n - g) - l + c_j[i]);
    }
    m_value / l
}

// **Bartlett's chi-square statistic calculation**
fn bartlett_chisquare(e1: f64, e2: f64) -> f64 {
    let t = e2 - e1;
    t
}

// **Classification: Compute chi-square distance**
fn classification_distance(f: &Vec<f64>, centroid: &Vec<f64>, d: &Vec<Vec<f64>>) -> f64 {
    let diff = f.iter().zip(centroid.iter()).map(|(a, b)| a - b).collect::<Vec<f64>>();
    let t = diff.iter().zip(d.iter()).map(|(a, row)| row.iter().map(|b| a * b).sum::<f64>()).sum::<f64>();
    t
}

// **Cross-Validation**
// Function to compute d^2 for Xjk excluding the k-th sample
fn d2_excluding_sample(Xjk: &Vec<f64>, Mjk: &Vec<f64>, Sj: &Vec<Vec<f64>>, n: f64, g: f64) -> f64 {
    let mut sum = 0.0;
    let n_g_minus_g = n - g;
    for i in 0..Xjk.len() {
        let diff = Xjk[i] - Mjk[i];
        sum += diff.powi(2) / Sj[i][i];
    }
    sum * n_g_minus_g / (n - g)
}

// Function to calculate the probability P(Gj|X)
fn probability_Gj_given_X(Pj: &Vec<f64>, Dj: &Vec<Vec<f64>>, X: &Vec<f64>) -> f64 {
    let mut p_value = 1.0;
    for j in 0..Pj.len() {
        let mut sum = 0.0;
        for i in 0..X.len() {
            sum += Dj[j][i] * X[i];
        }
        p_value *= Pj[j] * sum.powi(-1);
    }
    p_value
}

// **Rotations**
// Function to calculate h2 (squared multiple correlation)
fn h2(coefficients_rotated: &Vec<f64>, correlations_rotated: &Vec<f64>) -> f64 {
    let mut sum = 0.0;
    for i in 0..coefficients_rotated.len() {
        sum += coefficients_rotated[i].powi(2) * correlations_rotated[i];
    }
    1.0 + sum
}

// Function to compute the unrotated structure matrix R
fn unrotated_structure_matrix(S11_inv: &Vec<Vec<f64>>, W11: &Vec<Vec<f64>>, V: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let mut result_matrix = vec![vec![0.0; W11.len()]; W11.len()];
    for i in 0..W11.len() {
        for j in 0..V.len() {
            result_matrix[i][j] = S11_inv[i][j] * V[i][j];
        }
    }
    result_matrix
}

// **Rotated Matrix**
// Function to calculate the rotated matrix Dn
fn rotated_matrix(K: &Vec<Vec<f64>>, D: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let mut rotated_matrix = vec![vec![0.0; D[0].len()]; D.len()];
    for i in 0..D.len() {
        for j in 0..D[0].len() {
            rotated_matrix[i][j] = D[i][j] * K[i][j];
        }
    }
    rotated_matrix
}

// **Function to calculate Rk, the rotated matrix of pooled within-groups correlations**
fn rotated_within_groups_correlations(K: &Vec<Vec<f64>>, R: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let mut rotated_R = vec![vec![0.0; R[0].len()]; R.len()];
    for i in 0..R.len() {
        for j in 0..R[0].len() {
            rotated_R[i][j] = R[i][j] * K[i][j];
        }
    }
    rotated_R
}

// **Calculating the eigenvectors and matrix for the rotated coefficient**
fn eigenvector_rotation(T_W: &Vec<Vec<f64>>, V: &Vec<Vec<f64>>) -> Vec<Vec<f64>> {
    let mut rotated_eigenvectors = vec![vec![0.0; T_W[0].len()]; V.len()];
    for i in 0..T_W.len() {
        for j in 0..V.len() {
            rotated_eigenvectors[i][j] = T_W[i][j] * V[i][j];
        }
    }
    rotated_eigenvectors
}

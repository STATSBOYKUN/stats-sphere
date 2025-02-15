use wasm_bindgen::prelude::*;
use crate::QuadraticRegression;
use nalgebra::{DMatrix, DVector, SVD};

#[wasm_bindgen]
impl QuadraticRegression{
    pub fn calculate_regression(&mut self){
        let n = self.get_x().len();
        let x_values = self.get_x();
        let y_values = self.get_y();
        // Membuat matriks desain untuk regresi polinomial orde 3
        let mut x = DMatrix::zeros(n, 4);
        let mut y = DVector::zeros(n);

        for i in 0..n {
            x[(i, 0)] = 1.0;  // Koefisien konstanta (b0)
            x[(i, 1)] = x_values[i];    // b1 * t
            x[(i, 2)] = x_values[i].powi(2); // b2 * t^2
            y[i] = y_values[i]; // p-value aktual
        }
    
        // Menggunakan Singular Value Decomposition (SVD) untuk menyelesaikan regresi
        let svd = SVD::new(x.clone(), true, true);
        let coefficients = svd.solve(&y, 1e-10).expect("Regresi gagal");

        let mut y_prediction = Vec::new();
        for i in 0..n {
            let y_pred = coefficients[0] + coefficients[1] * x_values[i] + coefficients[2] * x_values[i].powi(2);
            y_prediction.push(y_pred);
        }

        self.set_beta(coefficients.iter().map(|v| *v).collect());
        self.set_y_prediction(y_prediction);
    }
}
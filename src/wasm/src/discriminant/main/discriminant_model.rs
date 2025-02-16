use crate::discriminant::main::dmatrix::DMatrix;

#[derive(Debug)]
pub struct DiscriminantModel {
    n_names: Option<Vec<String>>,
    n_predictors: usize,
    n_cats: usize,
    n_disc_funcs: usize,
    abs_det_dinv: Vec<f64>,
    prob: Vec<f64>,
    imp: ModelImp,
}

impl DiscriminantModel {
    pub fn new(n_predictors: usize, n_cats: usize, n_disc_funcs: usize) -> Self {
        Self {
            n_names: None,
            n_predictors,
            n_cats,
            n_disc_funcs,
            abs_det_dinv: vec![1.0; n_cats],
            prob: vec![0.0; n_cats],
            imp: ModelImp::new(n_predictors, n_disc_funcs, n_cats),
        }
    }

    pub fn set_function_names(&mut self, names: Vec<String>) {
        self.n_names = Some(names);
    }

    pub fn set_function_coefficients(&mut self, coeff: DMatrix) {
        self.imp.set_function_coefficients(coeff);
    }

    pub fn set_function_constants(&mut self, constants: DMatrix) {
        self.imp.set_function_constants(constants);
    }

    pub fn set_inv_covs(&mut self, inv_covs: Vec<DMatrix>) -> bool {
        if inv_covs.len() != self.n_cats {
            return false;
        }
        for (j, cov) in inv_covs.iter().enumerate() {
            self.imp.set_inv_cov(cov, j);
            self.abs_det_dinv[j] = cov.det().abs();
        }
        true
    }

    pub fn set_prior_probs(&mut self, prior_probs: Vec<f64>) -> bool {
        if prior_probs.len() != self.n_cats {
            return false;
        }
        self.prob = prior_probs;
        true
    }

    pub fn predict(&self, data: &DMatrix) -> Vec<usize> {
        let mut predictions = Vec::with_capacity(data.nrows());

        for i in 0..data.nrows() {
            let mut max_value = f64::NEG_INFINITY;
            let mut predicted_class = 0;

            for j in 0..self.n_cats {
                let discriminant_value = self.calculate_discriminant_value(i, j, data);
                if discriminant_value > max_value {
                    max_value = discriminant_value;
                    predicted_class = j;
                }
            }

            predictions.push(predicted_class);
        }

        predictions
    }

    fn calculate_discriminant_value(&self, row_index: usize, class_index: usize, data: &DMatrix) -> f64 {
        // Assuming linear discriminant: g(x) = x^T * W_class + b_class
        let coeff = &self.imp.coeff_one.as_ref().unwrap();
        let constants = self.imp.constants.as_ref().unwrap();

        // Using the new row and column methods
        let x = data.row(row_index);  // Access row from DMatrix
        let w_class = coeff.column(class_index);  // Access column from coeff matrix
        let b_class = constants.get_element(0, class_index);  // Access constant from constants matrix

        let discriminant_value = x.iter().zip(w_class.iter()).map(|(xi, wi)| xi * wi).sum::<f64>() + b_class;

        discriminant_value
    }
}

#[derive(Debug)]
struct ModelImp {
    coeff_one: Option<DMatrix>,
    constants: Option<DMatrix>,
    fbar: Vec<DMatrix>,
    f_dinv: Vec<DMatrix>,
}

impl ModelImp {
    pub fn new(n_predictors: usize, n_disc_funcs: usize, n_cats: usize) -> Self {
        let zerovec = DMatrix::new(1, n_disc_funcs);
        let identity_matrix = DMatrix::identity(n_disc_funcs);
        Self {
            coeff_one: None,
            constants: None,
            fbar: vec![zerovec.clone(); n_cats],
            f_dinv: vec![identity_matrix; n_cats],
        }
    }

    pub fn set_function_coefficients(&mut self, coeff: DMatrix) {
        self.coeff_one = Some(coeff);
    }

    pub fn set_function_constants(&mut self, constants: DMatrix) {
        self.constants = Some(constants);
    }

    pub fn set_inv_cov(&mut self, inv_cov: &DMatrix, index: usize) {
        if index < self.f_dinv.len() {
            self.f_dinv[index] = inv_cov.clone(); // Clone if needed
        }
    }
}

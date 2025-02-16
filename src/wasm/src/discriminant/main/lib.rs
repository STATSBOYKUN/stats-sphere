use wasm_bindgen::prelude::*;
use crate::discriminant::main::dmatrix::DMatrix;
use crate::discriminant::main::discriminant_model::DiscriminantModel;

#[wasm_bindgen]
pub struct DMatrixWasm {
    matrix: DMatrix,
}

#[wasm_bindgen]
impl DMatrixWasm {
    #[wasm_bindgen(constructor)]
    pub fn new(rows: usize, cols: usize) -> Self {
        Self {
            matrix: DMatrix::new(rows, cols),
        }
    }

    #[wasm_bindgen]
    pub fn set_element(&mut self, row: usize, col: usize, value: f64) {
        self.matrix.set_element(row, col, value);
    }

    #[wasm_bindgen]
    pub fn det(&self) -> f64 {
        self.matrix.det()
    }
}

#[wasm_bindgen]
pub struct DiscriminantModelWasm {
    model: DiscriminantModel,
}

#[wasm_bindgen]
impl DiscriminantModelWasm {
    #[wasm_bindgen(constructor)]
    pub fn new(n_predictors: usize, n_cats: usize, n_disc_funcs: usize) -> Self {
        Self {
            model: DiscriminantModel::new(n_predictors, n_cats, n_disc_funcs),
        }
    }

    #[wasm_bindgen]
    pub fn set_function_coefficients(&mut self, coeff: DMatrixWasm) {
        self.model.set_function_coefficients(coeff.matrix.clone());
    }

    #[wasm_bindgen]
    pub fn predict(&self, data: &DMatrixWasm) -> Vec<usize> {
        let data_matrix = &data.matrix; // Convert to DMatrix
        self.model.predict(data_matrix)
    }
}

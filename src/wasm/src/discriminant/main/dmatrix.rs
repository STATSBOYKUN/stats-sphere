use wasm_bindgen::prelude::*;
use js_sys;

#[wasm_bindgen]
#[derive(Clone)]
pub struct DMatrix {
    n_row: usize,
    n_col: usize,
    data: Vec<f64>,
}

#[wasm_bindgen]
impl DMatrix {
    #[wasm_bindgen(constructor)]
    pub fn new(n_row: usize, n_col: usize) -> DMatrix {
        let data = vec![0.0; n_row * n_col];
        DMatrix { n_row, n_col, data }
    }

    pub fn add(&mut self, other: &DMatrix) {
        assert_eq!(self.n_row, other.n_row);
        assert_eq!(self.n_col, other.n_col);
        for i in 0..self.data.len() {
            self.data[i] += other.data[i];
        }
    }

    pub fn sub(&mut self, m1: &DMatrix, m2: &DMatrix) {
        assert_eq!(m1.n_row, m2.n_row);
        assert_eq!(m1.n_col, m2.n_col);
        assert_eq!(self.n_row, m1.n_row);
        assert_eq!(self.n_col, m1.n_col);
        for i in 0..self.data.len() {
            self.data[i] = m1.data[i] - m2.data[i];
        }
    }

    pub fn mul(&mut self, m1: &DMatrix, m2: &DMatrix) {
        assert_eq!(m1.n_col, m2.n_row);
        assert_eq!(self.n_row, m1.n_row);
        assert_eq!(self.n_col, m2.n_col);

        let mut temp_data = vec![0.0; self.n_row * self.n_col];

        for i in 0..self.n_row {
            for j in 0..self.n_col {
                let mut sum = 0.0;
                for k in 0..m1.n_col {
                    let m1_index = i * m1.n_col + k;
                    let m2_index = k * m2.n_col + j;
                    sum += m1.data[m1_index] * m2.data[m2_index];
                }
                let temp_index = i * self.n_col + j;
                temp_data[temp_index] = sum;
            }
        }

        self.data = temp_data;
    }

    pub fn mul_transpose_right(&mut self, m1: &DMatrix, m2: &DMatrix) {
        assert_eq!(m1.n_col, m2.n_col);
        assert_eq!(self.n_row, m1.n_row);
        assert_eq!(self.n_col, m2.n_row);

        let mut temp_data = vec![0.0; self.n_row * self.n_col];

        for i in 0..self.n_row {
            for j in 0..self.n_col {
                let mut sum = 0.0;
                for k in 0..m1.n_col {
                    let m1_index = i * m1.n_col + k;
                    let m2_index = j * m2.n_col + k;
                    sum += m1.data[m1_index] * m2.data[m2_index];
                }
                temp_data[i * self.n_col + j] = sum;
            }
        }

        self.data = temp_data;
    }

    pub fn set_identity(&mut self) {
        assert_eq!(self.n_row, self.n_col);
        self.set_zero();
        for i in 0..self.n_row {
            let index = i * self.n_col + i;
            self.data[index] = 1.0;
        }
    }

    pub fn set_zero(&mut self) {
        for x in &mut self.data {
            *x = 0.0;
        }
    }

    pub fn copy_sub_matrix(&self, row_source: usize, col_source: usize, num_row: usize, num_col: usize, row_dest: usize, col_dest: usize, target: &mut DMatrix) {
        assert!(row_source + num_row <= self.n_row);
        assert!(col_source + num_col <= self.n_col);
        assert!(row_dest + num_row <= target.n_row);
        assert!(col_dest + num_col <= target.n_col);

        for i in 0..num_row {
            for j in 0..num_col {
                let src_row = row_source + i;
                let src_col = col_source + j;
                let src_index = src_row * self.n_col + src_col;

                let dest_row = row_dest + i;
                let dest_col = col_dest + j;
                let dest_index = dest_row * target.n_col + dest_col;

                target.data[dest_index] = self.data[src_index];
            }
        }
    }

    pub fn set(&mut self, other: &DMatrix) {
        assert_eq!(self.n_row, other.n_row);
        assert_eq!(self.n_col, other.n_col);
        self.data.copy_from_slice(&other.data);
    }

    #[wasm_bindgen(getter)]
    pub fn get_element(&self, row: usize, column: usize) -> f64 {
        assert!(row < self.n_row && column < self.n_col);
        self.data[row * self.n_col + column]
    }

    #[wasm_bindgen(setter)]
    pub fn set_element(&mut self, row: usize, column: usize, value: f64) {
        assert!(row < self.n_row && column < self.n_col);
        let index = row * self.n_col + column;
        self.data[index] = value;
    }

    pub fn det(&self) -> f64 {
        assert_eq!(self.n_row, self.n_col);
        let n = self.n_row;
        if n == 1 {
            return self.get_element(0, 0);
        }
        let mut a = self.clone();
        let mut sg = 1.0;
        let mut pivot_row = 0;
        while pivot_row < n && a.get_element(pivot_row, 0) == 0.0 {
            pivot_row += 1;
        }
        if pivot_row == n {
            return 0.0;
        }
        if pivot_row != 0 {
            for j in 0..n {
                let temp = a.get_element(0, j);
                a.set_element(0, j, a.get_element(pivot_row, j));
                a.set_element(pivot_row, j, temp);
            }
            sg = -sg;
        }
        let a00 = a.get_element(0, 0);
        let mut b = DMatrix::new(n - 1, n - 1);
        a.copy_sub_matrix(1, 1, n - 1, n - 1, 0, 0, &mut b);
        for i in 1..n {
            let ai0 = a.get_element(i, 0);
            for j in 1..n {
                let a0j = a.get_element(0, j);
                let mut bij = a.get_element(i, j);
                bij -= ai0 / a00 * a0j;
                b.set_element(i - 1, j - 1, bij);
            }
        }
        sg * a00 * b.det()
    }

    #[wasm_bindgen(getter)]
    pub fn n_row(&self) -> usize {
        self.n_row
    }

    #[wasm_bindgen(getter)]
    pub fn n_col(&self) -> usize {
        self.n_col
    }

    #[wasm_bindgen(getter)]
    pub fn data(&self) -> js_sys::Float64Array {
        js_sys::Float64Array::from(&self.data[..])
    }
}
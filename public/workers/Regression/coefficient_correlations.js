// coefficient_correlations.js

self.onmessage = function(e) {
  const { dependent, independent } = e.data;

  // Validasi input
  if (!dependent || !independent) {
    self.postMessage({ error: "Data dependent dan independent harus disediakan." });
    return;
  }

  // Periksa apakah independent adalah array of arrays
  const isArrayOfArrays = Array.isArray(independent) &&
      (independent.length === 0 || Array.isArray(independent[0]));

  let independentData;
  if (isArrayOfArrays) {
    independentData = independent;
  } else if (Array.isArray(independent)) {
    independentData = [independent]; // Konversi array tunggal ke array of arrays
  } else {
    self.postMessage({ error: "Data independent harus berupa array atau array of arrays." });
    return;
  }

  const y = dependent;
  const n = y.length;
  const k = independentData.length; // Jumlah variabel independen

  // Validasi panjang data
  if (independentData.some(indVar => indVar.length !== n)) {
    self.postMessage({ error: "Panjang semua array independent harus sama dengan dependent." });
    return;
  }

  // Fungsi untuk menghitung rata-rata
  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  const meanY = mean(y);
  const meansX = independentData.map(indVar => mean(indVar));

  // Matriks desain X dengan kolom konstan (1) dan semua variabel independen
  const X = [];
  for (let i = 0; i < n; i++) {
    const row = [1]; // Kolom pertama adalah konstanta 1
    for (let j = 0; j < k; j++) {
      row.push(independentData[j][i]);
    }
    X.push(row);
  }

  // Transpose matriks
  function transpose(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array(cols).fill().map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }

    return result;
  }

  // Perkalian matriks
  function multiplyMatrices(a, b) {
    const aRows = a.length;
    const aCols = a[0].length;
    const bCols = b[0].length;
    const result = Array(aRows).fill().map(() => Array(bCols).fill(0));

    for (let i = 0; i < aRows; i++) {
      for (let j = 0; j < bCols; j++) {
        for (let k = 0; k < aCols; k++) {
          result[i][j] += a[i][k] * b[k][j];
        }
      }
    }

    return result;
  }

  // Invers matriks menggunakan eliminasi Gaussian
  function inverse(matrix) {
    const n = matrix.length;
    const augmented = Array(n).fill().map(() => Array(2 * n).fill(0));

    // Buat matriks augmented [A|I]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        augmented[i][j] = matrix[i][j];
      }
      augmented[i][i + n] = 1;
    }

    // Eliminasi Gaussian
    for (let i = 0; i < n; i++) {
      // Cari pivot
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = j;
        }
      }

      // Tukar baris
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }

      // Periksa singularitas
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error("Matriks singular, tidak dapat dihitung inversnya");
      }

      // Normalisasi baris pivot
      for (let j = i; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminasi baris lainnya
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const factor = augmented[j][i];
          for (let k = i; k < 2 * n; k++) {
            augmented[j][k] -= factor * augmented[i][k];
          }
        }
      }
    }

    // Ekstrak invers
    const result = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        result[i][j] = augmented[i][j + n];
      }
    }

    return result;
  }

  // Hitung X'X
  const X_transpose = transpose(X);
  const X_transpose_X = multiplyMatrices(X_transpose, X);

  // Hitung X'y
  const y_col = y.map(val => [val]); // Konversi y ke matriks kolom
  const X_transpose_y = multiplyMatrices(X_transpose, y_col);

  // Hitung (X'X)^(-1)
  let X_transpose_X_inverse;
  try {
    X_transpose_X_inverse = inverse(X_transpose_X);
  } catch (error) {
    self.postMessage({ error: error.message });
    return;
  }

  // Hitung β = (X'X)^(-1)X'y
  const beta = multiplyMatrices(X_transpose_X_inverse, X_transpose_y).map(row => row[0]);

  // Hitung y prediksi dan residual
  const y_pred = [];
  for (let i = 0; i < n; i++) {
    let sum = beta[0]; // Intercept
    for (let j = 0; j < k; j++) {
      sum += beta[j + 1] * independentData[j][i];
    }
    y_pred.push(sum);
  }

  // Hitung residual
  const residuals = y.map((val, i) => val - y_pred[i]);

  // Hitung SSE (Sum of Squared Errors)
  const SSE = residuals.reduce((sum, val) => sum + val * val, 0);

  // Varians residual
  const sigma2 = SSE / (n - k - 1);

  // Matriks kovarians untuk koefisien = σ² * (X'X)^(-1)
  const covariance_matrix = X_transpose_X_inverse.map(row =>
      row.map(val => val * sigma2)
  );

  // Hitung matriks korelasi dari matriks kovarians
  // Untuk koefisien regresi (korelasi diagonal = 1)
  const correlation_matrix = Array(k + 1).fill().map(() => Array(k + 1).fill(0));

  for (let i = 0; i < k + 1; i++) {
    for (let j = 0; j < k + 1; j++) {
      if (i === j) {
        correlation_matrix[i][j] = 1.000;
      } else {
        correlation_matrix[i][j] = covariance_matrix[i][j] /
            Math.sqrt(covariance_matrix[i][i] * covariance_matrix[j][j]);
      }
    }
  }

  // Fungsi pembulatan ke 3 desimal
  function round(val) {
    return Math.round(val * 1000) / 1000;
  }

  // Buat column headers untuk output
  const variableHeaders = [];
  for (let i = k; i >= 1; i--) {
    variableHeaders.push({
      header: `VAR0000${i + 1}` // VAR00002, VAR00003, dst.
    });
  }

  // Buat rows untuk Correlations dan Covariances
  const children = [];

  // Correlations rows
  for (let i = k; i >= 1; i--) {
    const rowData = {
      rowHeader: [null, "Correlations", `VAR0000${i + 1}`]
    };

    // Tambahkan nilai korelasi untuk semua variabel
    for (let j = k; j >= 1; j--) {
      rowData[`VAR0000${j + 1}`] = round(correlation_matrix[i][j]);
    }

    children.push(rowData);
  }

  // Covariances rows
  for (let i = k; i >= 1; i--) {
    const rowData = {
      rowHeader: [null, "Covariances", `VAR0000${i + 1}`]
    };

    // Tambahkan nilai kovarians untuk semua variabel
    for (let j = k; j >= 1; j--) {
      rowData[`VAR0000${j + 1}`] = round(covariance_matrix[i][j]);
    }

    children.push(rowData);
  }

  // Susun output dengan struktur JSON sesuai spesifikasi
  const output = {
    tables: [
      {
        title: "Coefficient Correlationsa",
        columnHeaders: [
          { header: "Model" },
          { header: "" },
          { header: "" },
          ...variableHeaders
        ],
        rows: [
          {
            rowHeader: ["1"],
            children: children
          }
        ],
        footnote: "a. Dependent Variable: VAR00001"
      }
    ]
  };

  self.postMessage(output);
};
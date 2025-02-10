// public/workers/regressionWorker.js

// Fungsi untuk mengalikan dua matriks
function multiplyMatrices(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
      result[i] = [];
      for (let j = 0; j < b[0].length; j++) {
        let sum = 0;
        for (let k = 0; k < a[0].length; k++) {
          sum += a[i][k] * b[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  }
  
  // Fungsi untuk menginvers matriks menggunakan metode Gauss-Jordan
  function invertMatrix(matrix) {
    const n = matrix.length;
    let augmented = matrix.map((row, i) => [...row, ...Array(n).fill(0).map((_, j) => (i === j ? 1 : 0))]);
  
    for (let i = 0; i < n; i++) {
      // Cari pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
  
      // Tukar baris
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
  
      // Pastikan pivot tidak nol
      if (Math.abs(augmented[i][i]) < 1e-10) {
        throw new Error("Matriks tidak dapat diinvers.");
      }
  
      // Buat pivot menjadi 1
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
  
      // Eliminasi kolom lainnya
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }
  
    // Ambil bagian invers
    return augmented.map(row => row.slice(n));
  }
  
  // Fungsi untuk melakukan regresi linier berganda
  function performRegression(data) {
    const n = data.length;
    if (n === 0) {
      throw new Error("Data tidak boleh kosong.");
    }
  
    // Ambil semua nama variabel independen
    const independentVars = Object.keys(data[0]).filter(key => key !== 'y');
    const p = independentVars.length;
  
    // Buat matriks X dan vektor y
    const X = data.map(row => [1, ...independentVars.map(varName => row[varName])]);
    const y = data.map(row => row.y);
  
    // Hitung X^T
    const Xt = X[0].map((_, colIndex) => X.map(row => row[colIndex]));
  
    // Hitung X^T * X
    const XtX = multiplyMatrices(Xt, X);
  
    // Hitung (X^T * X)^-1
    const XtX_inv = invertMatrix(XtX);
  
    // Hitung X^T * y
    const Xty = multiplyMatrices(Xt, y.map(val => [val]));
  
    // Hitung beta = (X^T * X)^-1 * X^T * y
    const betaMatrix = multiplyMatrices(XtX_inv, Xty);
    const beta = betaMatrix.map(row => row[0]);
  
    // Hitung prediksi y
    const yPred = X.map(row => {
      return row.reduce((sum, val, idx) => sum + val * beta[idx], 0);
    });
  
    // Hitung rata-rata y
    const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
    // Hitung total sum of squares (SST) dan sum of squares due to regression (SSR)
    const SST = y.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
    const SSR = yPred.reduce((sum, val) => sum + Math.pow(val - meanY, 2), 0);
  
    // Hitung R-squared
    const rSquare = SSR / SST;
  
    // Hitung Adjusted R-squared
    const adjustedRSquare = 1 - (1 - rSquare) * (n - 1) / (n - p - 1);
  
    // Hitung Residual Sum of Squares (SSE)
    const SSE = y.reduce((sum, val, idx) => sum + Math.pow(val - yPred[idx], 2), 0);
  
    // Hitung Standard Error of the Estimate
    const stdError = Math.sqrt(SSE / (n - p - 1));
  
    // Hitung R (korelasi)
    const r = Math.sqrt(rSquare);
  
    // Susun objek JSON sesuai format yang diinginkan
    const result = {
      tables: [
        {
          title: "Model Summary",
          columnHeaders: [
            { header: "Model" },
            { header: "R" },
            { header: "R Square" },
            { header: "Adjusted R Square" },
            { header: "Std. Error of the Estimate" }
          ],
          rows: [
            {
              rowHeader: ["1"],
              R: parseFloat(r.toFixed(6)),
              "R Square": parseFloat(rSquare.toFixed(6)),
              "Adjusted R Square": parseFloat(adjustedRSquare.toFixed(6)),
              "Std. Error of the Estimate": parseFloat(stdError.toFixed(6))
            }
          ]
        }
      ],
      coefficients: {
        variables: ["Intercept", ...independentVars],
        values: beta.map(b => parseFloat(b.toFixed(6)))
      }
    };
  
    return result;
  }
  
  // Listener untuk pesan dari main thread
  self.addEventListener('message', function(e) {
    const inputData = e.data;
  
    try {
      // Validasi input data
      if (!Array.isArray(inputData) || inputData.length === 0) {
        throw new Error("Input data harus berupa array dan tidak kosong.");
      }
  
      // Pastikan setiap objek memiliki setidaknya satu variabel independen dan 'y'
      const firstRow = inputData[0];
      const keys = Object.keys(firstRow);
      if (!keys.includes('y') || keys.length < 2) {
        throw new Error("Setiap objek data harus memiliki setidaknya satu variabel independen dan 'y'.");
      }
  
      // Lakukan regresi linier berganda
      const regressionResult = performRegression(inputData);
  
      // Kirimkan hasil kembali ke main thread
      self.postMessage({ success: true, result: regressionResult });
    } catch (error) {
      // Kirimkan error jika terjadi
      self.postMessage({ success: false, error: error.message });
    }
  });
  
// coefficients_collinearity.js

self.onmessage = function(e) {
    const { dependent, independent } = e.data;
    
    // Validasi input: pastikan data independen tersedia dan berbentuk array of arrays
    if (!independent || !Array.isArray(independent) || independent.length === 0) {
      self.postMessage({ error: "Data independen harus disediakan sebagai array of arrays." });
      return;
    }
    
    // Optional: validasi data dependent (meskipun tidak digunakan dalam perhitungan ini)
    if (!dependent || !Array.isArray(dependent) || dependent.length === 0) {
      self.postMessage({ error: "Data dependent harus disediakan sebagai array." });
      return;
    }
    
    // Fungsi bantu untuk operasi matriks
    function matrixTranspose(matrix) {
      return matrix[0].map((_, i) => matrix.map(row => row[i]));
    }
  
    function matrixMultiply(A, B) {
      let result = [];
      for (let i = 0; i < A.length; i++) {
        result[i] = [];
        for (let j = 0; j < B[0].length; j++) {
          let sum = 0;
          for (let k = 0; k < A[0].length; k++) {
            sum += A[i][k] * B[k][j];
          }
          result[i][j] = sum;
        }
      }
      return result;
    }
  
    function matrixInverse(matrix) {
      let n = matrix.length;
      let identity = [];
      for (let i = 0; i < n; i++) {
        identity[i] = [];
        for (let j = 0; j < n; j++) {
          identity[i][j] = i === j ? 1 : 0;
        }
      }
      // Clone matrix
      let A = matrix.map(row => row.slice());
  
      for (let i = 0; i < n; i++) {
        let pivot = A[i][i];
        if (pivot === 0) {
          // Tukar baris jika pivot nol
          for (let r = i + 1; r < n; r++) {
            if (A[r][i] !== 0) {
              [A[i], A[r]] = [A[r], A[i]];
              [identity[i], identity[r]] = [identity[r], identity[i]];
              pivot = A[i][i];
              break;
            }
          }
          if (pivot === 0) {
            throw new Error("Matrix is singular");
          }
        }
        // Skala baris pivot
        for (let j = 0; j < n; j++) {
          A[i][j] /= pivot;
          identity[i][j] /= pivot;
        }
        // Eliminasi kolom pivot pada baris lain
        for (let r = 0; r < n; r++) {
          if (r !== i) {
            let factor = A[r][i];
            for (let j = 0; j < n; j++) {
              A[r][j] -= factor * A[i][j];
              identity[r][j] -= factor * identity[i][j];
            }
          }
        }
      }
      return identity;
    }
  
    // Fungsi untuk menghitung koefisien regresi (Beta) menggunakan Ordinary Least Squares (OLS)
    function linearRegressionCoefficients(X, y) {
      const X_T = matrixTranspose(X);
      const XTX = matrixMultiply(X_T, X);
      const XTX_inv = matrixInverse(XTX);
  
      // Hitung X^T * y
      let XTy = [];
      for (let i = 0; i < X_T.length; i++) {
        let sum = 0;
        for (let j = 0; j < X_T[0].length; j++) {
          sum += X_T[i][j] * y[j];
        }
        XTy.push([sum]);
      }
      const betaMatrix = matrixMultiply(XTX_inv, XTy);
      return betaMatrix.map(row => row[0]);
    }
  
    // Fungsi untuk menghitung R²
    function computeR2(y, yPred) {
      const meanY = y.reduce((a, b) => a + b, 0) / y.length;
      const ssTot = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
      const ssRes = y.reduce((sum, yi, idx) => sum + Math.pow(yi - yPred[idx], 2), 0);
      return ssTot === 0 ? 0 : 1 - ssRes / ssTot;
    }
  
    // Fungsi untuk menghitung diagnosa kolinearitas:
    // Untuk setiap variabel independen, regresikan variabel tersebut terhadap variabel lain.
    // Tolerance = 1 - R² dan VIF = 1 / Tolerance.
    function calculateCollinearityDiagnostics(indepVars) {
      let diagnostics = [];
      const numVars = indepVars.length;
      for (let i = 0; i < numVars; i++) {
        // Jika hanya ada satu variabel, tidak ada kolinearitas antar variabel
        if (numVars === 1) {
          diagnostics.push({ varName: "VAR00002", tolerance: 1.000, vif: 1.000 });
        } else {
          const y = indepVars[i];
          let X = [];
          const n = y.length;
          for (let j = 0; j < n; j++) {
            let row = [1]; // Term konstanta
            // Masukkan semua variabel lain sebagai prediktor
            for (let k = 0; k < numVars; k++) {
              if (k !== i) row.push(indepVars[k][j]);
            }
            X.push(row);
          }
          const beta = linearRegressionCoefficients(X, y);
          const yPred = X.map(row =>
            row.reduce((sum, val, idx) => sum + val * beta[idx], 0)
          );
          const r2 = computeR2(y, yPred);
          const tolerance = 1 - r2;
          const vif = tolerance === 0 ? Infinity : 1 / tolerance;
          diagnostics.push({
            varName: "VAR0000" + (i + 2),
            tolerance: parseFloat(tolerance.toFixed(3)),
            vif: parseFloat(vif.toFixed(3))
          });
        }
      }
      return diagnostics;
    }
  
    // Hitung diagnosa kolinearitas untuk data independen
    const diagnostics = calculateCollinearityDiagnostics(independent);
  
    // Susun objek hasil sesuai struktur JSON yang diinginkan
    const result = {
      tables: [
        {
          title: "Coefficients",
          columnHeaders: [
            { header: "Model" },
            { header: "" },
            {
              header: "Collinearity Statistics",
              children: [
                { header: "Tolerance", key: "tolerance" },
                { header: "VIF", key: "vif" }
              ]
            }
          ],
          rows: [
            {
              rowHeader: ["1"],
              children: diagnostics.map(diag => ({
                rowHeader: [null, diag.varName],
                tolerance: diag.tolerance,
                vif: diag.vif
              }))
            }
          ]
        }
      ]
    };
  
    console.log(result);
    self.postMessage(result);
  };
  
// coefficients_partandpartial.js

self.onmessage = function(e) {
    const { dependent, independents } = e.data;
    
    // Validasi input
    if (!dependent || !independents) {
      self.postMessage({ error: "Kedua data 'dependent' dan 'independents' harus disediakan." });
      return;
    }
    
    const n = dependent.length;
    
    // Fungsi dasar: rata-rata dan korelasi Pearson
    function mean(arr) {
      return arr.reduce((sum, val) => sum + val, 0) / arr.length;
    }
    
    function correlation(x, y) {
      const n = x.length;
      const meanX = mean(x);
      const meanY = mean(y);
      let num = 0, denX = 0, denY = 0;
      for (let i = 0; i < n; i++) {
        const dx = x[i] - meanX;
        const dy = y[i] - meanY;
        num += dx * dy;
        denX += dx * dx;
        denY += dy * dy;
      }
      return num / Math.sqrt(denX * denY);
    }
    
    // Fungsi untuk membangun matriks desain X dengan kolom intercept dan kolom-kolom dari Z
    function buildDesignMatrix(Z) {
      // Z: array of arrays, masing-masing array sepanjang n (setiap array = 1 variabel)
      const m = Z.length; // jumlah variabel
      const X = [];
      for (let i = 0; i < n; i++) {
        let row = [1]; // intercept
        for (let j = 0; j < m; j++) {
          row.push(Z[j][i]);
        }
        X.push(row);
      }
      return X;
    }
    
    // Fungsi perkalian matriks
    function matrixMultiply(A, B) {
      const rowsA = A.length;
      const colsA = A[0].length;
      const rowsB = B.length;
      const colsB = B[0].length;
      if (colsA !== rowsB) {
        throw new Error("Ukuran matriks tidak sesuai untuk perkalian");
      }
      let result = [];
      for (let i = 0; i < rowsA; i++) {
        let row = [];
        for (let j = 0; j < colsB; j++) {
          let sum = 0;
          for (let k = 0; k < colsA; k++) {
            sum += A[i][k] * B[k][j];
          }
          row.push(sum);
        }
        result.push(row);
      }
      return result;
    }
    
    // Fungsi transpos matriks
    function matrixTranspose(matrix) {
      const rows = matrix.length;
      const cols = matrix[0].length;
      let result = [];
      for (let j = 0; j < cols; j++) {
        let row = [];
        for (let i = 0; i < rows; i++) {
          row.push(matrix[i][j]);
        }
        result.push(row);
      }
      return result;
    }
    
    // Fungsi invers matriks (menggunakan Gauss-Jordan elimination)
    function matrixInverse(matrix) {
      const n = matrix.length;
      // Buat matriks augmented: [matrix | I]
      let augmented = matrix.map((row, i) => {
        let newRow = row.slice();
        for (let j = 0; j < n; j++) {
          newRow.push(i === j ? 1 : 0);
        }
        return newRow;
      });
      // Eliminasi Gauss-Jordan
      for (let i = 0; i < n; i++) {
        // Jika elemen pivot mendekati nol, swap dengan baris lain
        let pivot = augmented[i][i];
        if (Math.abs(pivot) < 1e-12) {
          for (let j = i + 1; j < n; j++) {
            if (Math.abs(augmented[j][i]) > 1e-12) {
              const temp = augmented[i];
              augmented[i] = augmented[j];
              augmented[j] = temp;
              pivot = augmented[i][i];
              break;
            }
          }
        }
        // Normalisasi baris i
        for (let j = 0; j < 2 * n; j++) {
          augmented[i][j] /= pivot;
        }
        // Eliminasi elemen di baris lain
        for (let k = 0; k < n; k++) {
          if (k !== i) {
            let factor = augmented[k][i];
            for (let j = 0; j < 2 * n; j++) {
              augmented[k][j] -= factor * augmented[i][j];
            }
          }
        }
      }
      // Ekstrak invers dari augmented matrix
      let inv = [];
      for (let i = 0; i < n; i++) {
        inv.push(augmented[i].slice(n, 2 * n));
      }
      return inv;
    }
    
    // Fungsi untuk menghitung residual dari regresi Y ~ Z.
    // Jika Z kosong, kembalikan Y itu sendiri.
    function regressionResiduals(Y, Z) {
      if (Z.length === 0) return Y.slice();
      const X = buildDesignMatrix(Z); // n x (m+1)
      const Xt = matrixTranspose(X);   // (m+1) x n
      const XtX = matrixMultiply(Xt, X); // (m+1) x (m+1)
      const XtX_inv = matrixInverse(XtX);
      // Hitung X^T * Y
      let Xty = [];
      for (let i = 0; i < Xt.length; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
          sum += Xt[i][j] * Y[j];
        }
        Xty.push(sum);
      }
      // Koefisien: b = (X^T X)^(-1) * (X^T Y)
      let b = [];
      for (let i = 0; i < XtX_inv.length; i++) {
        let sum = 0;
        for (let j = 0; j < XtX_inv[i].length; j++) {
          sum += XtX_inv[i][j] * Xty[j];
        }
        b.push(sum);
      }
      // Fitted values: X * b
      let fitted = [];
      for (let i = 0; i < n; i++) {
        let sum = 0;
        for (let j = 0; j < X[i].length; j++) {
          sum += b[j] * X[i][j];
        }
        fitted.push(sum);
      }
      // Residuals: Y - fitted
      let residuals = [];
      for (let i = 0; i < n; i++) {
        residuals.push(Y[i] - fitted[i]);
      }
      return residuals;
    }
    
    // Fungsi pembulatan ke 3 desimal dan mengubah ke string
    function formatVal(val) {
      return val.toFixed(3);
    }
    
    // Proses perhitungan untuk setiap variabel independen
    const rows = [];
    // Iterasi untuk tiap variabel independen
    for (let i = 0; i < independents.length; i++) {
      const X_i = independents[i];
      // Tentukan Z: semua variabel independen kecuali variabel i
      const Z = independents.filter((_, idx) => idx !== i);
      
      // Zero-order correlation: korelasi antara dependent dan X_i
      const r_zero = correlation(dependent, X_i);
      
      // Jika tidak ada variabel kontrol (Z kosong), partial dan part sama dengan zero-order
      let r_partial = r_zero;
      let r_part = r_zero;
      if (Z.length > 0) {
        // Partial correlation:
        // 1. Dapatkan residual dependent setelah diregresi pada Z
        // 2. Dapatkan residual X_i setelah diregresi pada Z
        const residY = regressionResiduals(dependent, Z);
        const residX = regressionResiduals(X_i, Z);
        r_partial = correlation(residY, residX);
        
        // Part correlation: korelasi antara dependent dengan residual X_i (hasil regresi X_i ~ Z)
        r_part = correlation(dependent, residX);
      }
      
      // Format nilai menjadi string 3 desimal
      const zeroOrderStr = formatVal(r_zero);
      const partialStr = formatVal(r_partial);
      const partStr = formatVal(r_part);
      
      // Penamaan variabel independen (misal: VAR00002, VAR00003, dst.)
      const varName = "VAR0000" + (i + 2);
      const modelNum = (i + 1).toString();
      
      // Tambahkan baris hasil ke array rows
      rows.push({
        rowHeader: [modelNum, varName],
        zeroOrder: zeroOrderStr,
        partial: partialStr,
        part: partStr
      });
    }
    
    // Susun objek JSON hasil perhitungan dengan struktur tabel "Coefficients"
    const result = {
      tables: [
        {
          title: "Coefficients",
          columnHeaders: [
            { header: "Model" },
            { header: "" },
            {
              header: "Correlations",
              children: [
                { header: "Zero-order", key: "zeroOrder" },
                { header: "Partial",    key: "partial"   },
                { header: "Part",       key: "part"      }
              ]
            }
          ],
          rows: rows,
          footnotes: [
            "a. Dependent Variable: VAR00001"
          ]
        }
      ]
    };
    
    // Kirim hasil perhitungan kembali ke main thread
    self.postMessage(result);
  };
  
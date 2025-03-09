// public/workers/anova.js

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
  let augmented = matrix.map((row, i) => [
    ...row,
    ...Array(n)
      .fill(0)
      .map((_, j) => (i === j ? 1 : 0))
  ]);

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

// Fungsi untuk melakukan ANOVA berdasarkan hasil regresi
function performANOVA(data, regressionResult) {
  const n = data.length;
  // p: jumlah prediktor, didapat dari jumlah koefisien dikurangi intercept
  const p = regressionResult.coefficients.values.length - 1; 

  // Total Sum of Squares (SST)
  const meanY = data.reduce((sum, row) => sum + row.y, 0) / n;
  const SST = data.reduce((sum, row) => sum + Math.pow(row.y - meanY, 2), 0);

  // Regression Sum of Squares (SSR)
  const SSR = SST * regressionResult.rSquare;

  // Residual Sum of Squares (SSE)
  const SSE = SST - SSR;

  // Degrees of Freedom
  const dfRegression = p;
  const dfResidual = n - p - 1;
  const dfTotal = n - 1;

  // Mean Squares
  const MSRegression = SSR / dfRegression;
  const MSResidual = SSE / dfResidual;

  // F-Statistic
  const F = MSRegression / MSResidual;

  // Sig (p-value) – disini kita pakai placeholder
  const Sig = "0.05";

  const anovaResult = {
    tables: [
      {
        title: "Anova",
        columnHeaders: [
          { header: "Model" },
          { header: "" },
          { header: "Sum of Squares" },
          { header: "df" },
          { header: "Mean Square" },
          { header: "F" },
          { header: "Sig" }
        ],
        rows: [
          {
            rowHeader: ["1"],
            children: [
              {
                rowHeader: [null, "Regression"],
                "Sum of Squares": parseFloat(SSR.toFixed(6)),
                df: dfRegression,
                "Mean Square": parseFloat(MSRegression.toFixed(6)),
                F: parseFloat(F.toFixed(6)),
                Sig: Sig
              },
              {
                rowHeader: [null, "Residual"],
                "Sum of Squares": parseFloat(SSE.toFixed(6)),
                df: dfResidual,
                "Mean Square": parseFloat(MSResidual.toFixed(6)),
                F: "",
                Sig: ""
              },
              {
                rowHeader: [null, "Total"],
                "Sum of Squares": parseFloat(SST.toFixed(6)),
                df: dfTotal,
                "Mean Square": "",
                F: "",
                Sig: ""
              }
            ]
          }
        ]
      }
    ]
  };

  return anovaResult;
}

// Listener untuk pesan dari main thread
self.addEventListener('message', function(e) {
  const { data: inputData, regressionResult } = e.data;

  try {
    if (!Array.isArray(inputData) || inputData.length === 0) {
      throw new Error("Input data harus berupa array dan tidak kosong.");
    }
    if (!regressionResult || !regressionResult.rSquare) {
      throw new Error("Hasil regresi tidak valid atau tidak tersedia.");
    }

    const anovaResult = performANOVA(inputData, regressionResult);
    self.postMessage({ success: true, result: anovaResult });
  } catch (error) {
    self.postMessage({ success: false, error: error.message });
  }
});

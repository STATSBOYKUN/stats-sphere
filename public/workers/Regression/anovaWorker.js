// public/workers/anovaWorker.js

console.log("[ANOVA Worker] Worker script started loading");

self.onmessage = function (e) {
  console.log("[ANOVA Worker] Message received");

  try {
    const { dependentData, independentData } = e.data;

    console.log("[ANOVA Worker] Data received:", {
      dependentDataType: typeof dependentData,
      dependentDataIsArray: Array.isArray(dependentData),
      dependentDataLength: dependentData?.length,
      independentDataType: typeof independentData,
      independentDataIsArray: Array.isArray(independentData),
      independentDataLength: independentData?.length
    });

    // Validasi input data
    if (!dependentData) {
      throw new Error("Missing required data: dependentData is null or undefined");
    }
    if (!independentData) {
      throw new Error("Missing required data: independentData is null or undefined");
    }
    if (!Array.isArray(dependentData)) {
      throw new Error("Invalid data type: dependentData must be an array");
    }
    if (!Array.isArray(independentData)) {
      throw new Error("Invalid data type: independentData must be an array");
    }
    if (dependentData.length === 0) {
      throw new Error("Empty data: dependentData has no elements");
    }
    if (independentData.length === 0) {
      throw new Error("Empty data: independentData has no elements");
    }

    // Pastikan independentData berbentuk array of arrays
    const depData = [...dependentData];
    let indepData = independentData;
    if (!Array.isArray(indepData[0])) {
      console.log("[ANOVA Worker] Converting independentData to array of arrays format");
      indepData = [indepData];
    }

    console.log("[ANOVA Worker] Starting ANOVA calculation");
    console.log("[ANOVA Worker] Sample data:", {
      depDataSample: depData.slice(0, 3),
      indepDataSample: indepData.map(arr => arr.slice(0, 3))
    });

    // Dimensi data
    const n = depData.length;
    const p = indepData.length; // Jumlah variabel independen
    console.log("[ANOVA Worker] Data dimensions:", { n, p });

    // Buat design matrix dengan intercept
    console.log("[ANOVA Worker] Creating design matrix with intercept");
    const X_with_intercept = [];
    try {
      for (let i = 0; i < n; i++) {
        const row = [1]; // Term intercept
        for (let j = 0; j < p; j++) {
          row.push(indepData[j][i]);
        }
        X_with_intercept.push(row);
      }
      console.log("[ANOVA Worker] Design matrix sample:", X_with_intercept.slice(0, 3));
    } catch (err) {
      console.error("[ANOVA Worker] Error creating design matrix:", err);
      throw new Error("Failed to create design matrix: " + err.message);
    }

    // Hitung X'X
    console.log("[ANOVA Worker] Calculating X'X");
    let Xt, XtX;
    try {
      Xt = transposeMatrix(X_with_intercept);
      XtX = multiplyMatrices(Xt, X_with_intercept);
      console.log("[ANOVA Worker] X'X dimensions:", { rows: XtX.length, cols: XtX[0].length });
    } catch (err) {
      console.error("[ANOVA Worker] Error in matrix multiplication:", err);
      throw new Error("Matrix multiplication failed: " + err.message);
    }

    // Hitung invers dari X'X
    console.log("[ANOVA Worker] Calculating (X'X)^-1");
    let XtX_inv;
    try {
      XtX_inv = invertMatrix(XtX);
      console.log("[ANOVA Worker] Matrix inversion completed");
    } catch (err) {
      console.error("[ANOVA Worker] Error in matrix inversion:", err);
      throw new Error("Matrix inversion failed: " + err.message);
    }

    // Hitung X'y
    console.log("[ANOVA Worker] Calculating X'y");
    let Xty;
    try {
      Xty = multiplyMatrixVector(Xt, depData);
      console.log("[ANOVA Worker] X'y calculated");
    } catch (err) {
      console.error("[ANOVA Worker] Error in matrix-vector multiplication:", err);
      throw new Error("Matrix-vector multiplication failed: " + err.message);
    }

    // Hitung koefisien beta
    console.log("[ANOVA Worker] Calculating beta coefficients");
    let beta;
    try {
      beta = multiplyMatrixVector(XtX_inv, Xty);
      console.log("[ANOVA Worker] Beta coefficients:", beta);
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating beta coefficients:", err);
      throw new Error("Beta coefficient calculation failed: " + err.message);
    }

    // Hitung nilai prediksi y
    console.log("[ANOVA Worker] Calculating predicted values");
    let y_pred = [];
    try {
      for (let i = 0; i < n; i++) {
        let pred = 0;
        for (let j = 0; j < beta.length; j++) {
          pred += X_with_intercept[i][j] * beta[j];
        }
        y_pred.push(pred);
      }
      console.log("[ANOVA Worker] Predicted values sample:", y_pred.slice(0, 3));
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating predicted values:", err);
      throw new Error("Predicted values calculation failed: " + err.message);
    }

    // Hitung residuals
    console.log("[ANOVA Worker] Calculating residuals");
    let residuals;
    try {
      residuals = depData.map((yi, i) => yi - y_pred[i]);
      console.log("[ANOVA Worker] Residuals sample:", residuals.slice(0, 3));
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating residuals:", err);
      throw new Error("Residuals calculation failed: " + err.message);
    }

    // Hitung Sum of Squares
    console.log("[ANOVA Worker] Calculating sum of squares");
    let y_mean, SST, SSR, SSE;
    try {
      y_mean = mean(depData);
      SST = sumArray(depData.map(yi => (yi - y_mean) ** 2));
      SSR = sumArray(y_pred.map(ypi => (ypi - y_mean) ** 2));
      SSE = sumArray(residuals.map(ei => ei ** 2));
      console.log("[ANOVA Worker] Sum of squares:", { SST, SSR, SSE });
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating sum of squares:", err);
      throw new Error("Sum of squares calculation failed: " + err.message);
    }

    // Degrees of Freedom
    const regressionDF = p;
    const residualDF = n - p - 1;
    const totalDF = n - 1;
    console.log("[ANOVA Worker] Degrees of freedom:", { regressionDF, residualDF, totalDF });

    // Mean Squares
    let regressionMS, residualMS;
    try {
      regressionMS = SSR / regressionDF;
      residualMS = SSE / residualDF;
      console.log("[ANOVA Worker] Mean squares:", { regressionMS, residualMS });
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating mean squares:", err);
      throw new Error("Mean squares calculation failed: " + err.message);
    }

    // F-statistic
    let F;
    try {
      F = regressionMS / residualMS;
      console.log("[ANOVA Worker] F statistic:", F);
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating F statistic:", err);
      throw new Error("F statistic calculation failed: " + err.message);
    }

    // R-squared dan adjusted R-squared
    let RSquare, adjustedRSquare;
    try {
      RSquare = SSR / SST;
      adjustedRSquare = 1 - ((1 - RSquare) * (n - 1) / (n - p - 1));
      console.log("[ANOVA Worker] R-squared:", { RSquare, adjustedRSquare });
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating R-squared:", err);
      throw new Error("R-squared calculation failed: " + err.message);
    }

    // Hitung p-value secara nyata menggunakan distribusi F
    let pValue;
    try {
      const F_cdf = cumulativeFDistribution(F, regressionDF, residualDF);
      pValue = 1 - F_cdf;
      console.log("[ANOVA Worker] p-value:", pValue);
    } catch (err) {
      console.error("[ANOVA Worker] Error calculating p-value:", err);
      throw new Error("p-value calculation failed: " + err.message);
    }

    // Susun ANOVA table
    console.log("[ANOVA Worker] Preparing ANOVA table");
    const anovaTable = {
      tables: [
        {
          title: "ANOVA",
          columnHeaders: [
            { header: "Model" },
            { header: "Sum of Squares" },
            { header: "df" },
            { header: "Mean Square" },
            { header: "F" },
            { header: "Sig." }
          ],
          rows: [
            {
              rowHeader: ["Regression"],
              "Sum of Squares": SSR.toFixed(3),
              "df": regressionDF,
              "Mean Square": regressionMS.toFixed(3),
              "F": F.toFixed(3),
              "Sig.": pValue.toFixed(3),
            },
            {
              rowHeader: ["Residual"],
              "Sum of Squares": SSE.toFixed(3),
              "df": residualDF,
              "Mean Square": residualMS.toFixed(3),
              "F": "",
              "Sig.": "",
            },
            {
              rowHeader: ["Total"],
              "Sum of Squares": SST.toFixed(3),
              "df": totalDF,
              "Mean Square": "",
              "F": "",
              "Sig.": "",
            }
          ]
        }
      ]
    };

    console.log("[ANOVA Worker] Sending result back to main thread");
    const result = {
      title: "ANOVA",
      output_data: JSON.stringify(anovaTable),
      output_type: "table",
      components: "ANOVA",
    };

    self.postMessage(result);
  } catch (error) {
    console.error("[ANOVA Worker] Critical error:", error.message, error.stack);
    self.postMessage({ error: error.message || "Unknown error in ANOVA worker" });
  }
};

// --- Helper functions untuk operasi matriks ---

const transposeMatrix = (matrix) => {
  if (!matrix || !matrix.length || !matrix[0] || !matrix[0].length) {
    throw new Error("Invalid matrix for transpose operation");
  }
  try {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array(cols).fill().map(() => Array(rows));
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }
    return result;
  } catch (err) {
    console.error("[ANOVA Worker] Error in transposeMatrix:", err);
    throw err;
  }
};

const multiplyMatrices = (A, B) => {
  if (!A || !A.length || !B || !B.length) {
    throw new Error("Invalid matrices for multiplication");
  }
  if (!A[0] || !A[0].length || !B[0] || !B[0].length) {
    throw new Error("Empty matrices cannot be multiplied");
  }
  if (A[0].length !== B.length) {
    throw new Error(`Matrix dimensions incompatible: A(${A.length}x${A[0].length}) * B(${B.length}x${B[0].length})`);
  }
  try {
    const rowsA = A.length;
    const colsB = B[0].length;
    const result = [];
    for (let i = 0; i < rowsA; i++) {
      result[i] = [];
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < B.length; k++) {
          sum += A[i][k] * B[k][j];
        }
        result[i][j] = sum;
      }
    }
    return result;
  } catch (err) {
    console.error("[ANOVA Worker] Error in multiplyMatrices:", err);
    throw err;
  }
};

const multiplyMatrixVector = (matrix, vector) => {
  if (!matrix || !matrix.length || !vector || !vector.length) {
    throw new Error("Invalid inputs for matrix-vector multiplication");
  }
  if (matrix[0].length !== vector.length) {
    throw new Error(`Dimensions incompatible: Matrix columns (${matrix[0].length}) ≠ Vector length (${vector.length})`);
  }
  try {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array(rows).fill(0);
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[i] += matrix[i][j] * vector[j];
      }
    }
    return result;
  } catch (err) {
    console.error("[ANOVA Worker] Error in multiplyMatrixVector:", err);
    throw err;
  }
};

const invertMatrix = (matrix) => {
  if (!matrix || !matrix.length) {
    throw new Error("Invalid matrix for inversion");
  }
  if (matrix.length !== matrix[0].length) {
    throw new Error(`Cannot invert non-square matrix: ${matrix.length}x${matrix[0].length}`);
  }
  try {
    const n = matrix.length;
    const augmented = [];
    for (let i = 0; i < n; i++) {
      augmented[i] = [...matrix[i]];
      for (let j = 0; j < n; j++) {
        augmented[i].push(i === j ? 1 : 0);
      }
    }
    for (let i = 0; i < n; i++) {
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = j;
        }
      }
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }
      if (Math.abs(augmented[i][i]) < 1e-10) {
        throw new Error("Matrix is singular and cannot be inverted");
      }
      const pivot = augmented[i][i];
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const factor = augmented[j][i];
          for (let k = 0; k < 2 * n; k++) {
            augmented[j][k] -= factor * augmented[i][k];
          }
        }
      }
    }
    const inverse = [];
    for (let i = 0; i < n; i++) {
      inverse[i] = augmented[i].slice(n);
    }
    return inverse;
  } catch (err) {
    console.error("[ANOVA Worker] Error in invertMatrix:", err);
    throw err;
  }
};

const sumArray = (arr) => {
  if (!arr || !arr.length) {
    throw new Error("Cannot sum empty array");
  }
  try {
    return arr.reduce((acc, val) => {
      if (isNaN(val)) {
        throw new Error("Array contains NaN values");
      }
      return acc + val;
    }, 0);
  } catch (err) {
    console.error("[ANOVA Worker] Error in sumArray:", err);
    throw err;
  }
};

const mean = (arr) => {
  if (!arr || !arr.length) {
    throw new Error("Cannot calculate mean of empty array");
  }
  try {
    const sum = sumArray(arr);
    return sum / arr.length;
  } catch (err) {
    console.error("[ANOVA Worker] Error in mean calculation:", err);
    throw err;
  }
};

// --- Helper functions untuk perhitungan p-value menggunakan distribusi F ---

// Fungsi logGamma dengan algoritma Lanczos standar
const logGamma = (z) => {
  const p = [
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7
  ];
  const g = 7;
  if (z < 0.5) {
    // Gunakan rumus refleksi
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  } else {
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) {
      x += p[i] / (z + i + 1);
    }
    let t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
};

// Fungsi betacf untuk menghitung continued fraction dari incomplete beta
const betacf = (a, b, x) => {
  const MAXIT = 100;
  const EPS = 3e-7;
  const FPMIN = 1e-30;
  let m2, aa, c, d, del;
  let qab = a + b;
  let qap = a + 1;
  let qam = a - 1;
  c = 1;
  d = 1 - qab * x / qap;
  if (Math.abs(d) < FPMIN) d = FPMIN;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= MAXIT; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    c = 1 + aa / c;
    if (Math.abs(c) < FPMIN) c = FPMIN;
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1.0) < EPS) break;
  }
  return h;
};

// Fungsi untuk menghitung regularized incomplete beta function
const incbeta = (x, a, b) => {
  if (x < 0 || x > 1) {
    throw new Error("x out of bounds in incbeta");
  }
  if (x === 0) return 0;
  if (x === 1) return 1;
  const lnBeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const bt = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lnBeta);
  let result;
  if (x < (a + 1) / (a + b + 2)) {
    result = bt * betacf(a, b, x) / a;
  } else {
    result = 1 - bt * betacf(b, a, 1 - x) / b;
  }
  if (result < 0) result = 0;
  if (result > 1) result = 1;
  return result;
};

// Fungsi cumulativeFDistribution menggunakan incomplete beta untuk mendapatkan CDF F-distribution
const cumulativeFDistribution = (F, df1, df2) => {
  if (F < 0) return 0;
  const x = (df1 * F) / (df1 * F + df2);
  return incbeta(x, df1 / 2, df2 / 2);
};

console.log("[ANOVA Worker] Worker script loaded completely");

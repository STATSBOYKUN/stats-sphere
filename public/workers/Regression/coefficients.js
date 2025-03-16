// public/workers/Regression/coefficients.js

self.onmessage = function(e) {
  try {
    const { independentVarNames, dependentData, independentData } = e.data;

    console.log("Coefficients Worker received data:", e.data);

    if (!dependentData || !independentData) {
      throw new Error("Missing required data: dependentData or independentData");
    }

    if (!independentVarNames || !Array.isArray(independentVarNames)) {
      throw new Error("Missing or invalid independentVarNames");
    }

    // Calculate regression coefficients directly from raw data
    const coefficients = calculateCoefficients(dependentData, independentData, independentVarNames);

    // Format coefficients for the table
    const coefficientsData = coefficients.map((coef, idx) => {
      return {
        rowHeader: [idx === 0 ? "1" : null],
        children: [
          {
            rowHeader: [null, idx === 0 ? "(Constant)" : independentVarNames[idx - 1]],
            "B": parseFloat(coef.coefficient.toFixed(3)),
            "stdError": parseFloat(coef.stdError.toFixed(3)),
            "Beta": coef.standardizedCoefficient !== null ? parseFloat(coef.standardizedCoefficient.toFixed(3)) : "",
            "t": parseFloat(coef.tValue.toFixed(3)),
            "Sig.": parseFloat(coef.pValue.toFixed(3))
          }
        ]
      };
    });

    const coefficientsTable = {
      tables: [
        {
          title: "Coefficients",
          columnHeaders: [
            { header: "Model" },
            { header: "" },
            {
              header: "Unstandardized Coefficients",
              children: [
                { header: "B", key: "B" },
                { header: "Std. Error", key: "stdError" }
              ]
            },
            {
              header: "Standardized Coefficients",
              children: [
                { header: "Beta", key: "Beta" }
              ]
            },
            { header: "t" },
            { header: "Sig." }
          ],
          rows: coefficientsData
        }
      ]
    };

    self.postMessage({
      success: true,
      result: coefficientsTable
    });
  } catch (error) {
    console.error("Coefficients Worker error:", error);
    self.postMessage({
      success: false,
      error: error.message || "Unknown error in Coefficients worker"
    });
  }
};

// Calculate regression coefficients from raw data
function calculateCoefficients(dependent, independents, varNames) {
  const n = dependent.length;
  const p = independents.length;

  try {
    // Prepare design matrix X with intercept column
    const X = [];
    for (let i = 0; i < n; i++) {
      const row = [1]; // Intercept
      for (let j = 0; j < p; j++) {
        row.push(independents[j][i]);
      }
      X.push(row);
    }

    // Calculate X'X
    const Xt = transposeMatrix(X);
    const XtX = multiplyMatrices(Xt, X);

    // Calculate (X'X)^-1
    const XtX_inv = invertMatrix(XtX);

    // Calculate X'y
    const Xty = multiplyMatrixVector(Xt, dependent);

    // Calculate beta coefficients: β = (X'X)^-1X'y
    const beta = multiplyMatrixVector(XtX_inv, Xty);

    // Calculate predicted values
    const yPred = X.map(row => {
      let sum = 0;
      for (let j = 0; j < beta.length; j++) {
        sum += row[j] * beta[j];
      }
      return sum;
    });

    // Calculate residuals
    const residuals = dependent.map((y, i) => y - yPred[i]);

    // Calculate sum of squared residuals
    const SSE = residuals.reduce((sum, r) => sum + r * r, 0);

    // Calculate degrees of freedom and mean squared error
    const df = n - p - 1;
    const MSE = SSE / df;

    // Standard errors of coefficients
    const stdErrors = [];
    for (let i = 0; i < p + 1; i++) {
      stdErrors.push(Math.sqrt(MSE * XtX_inv[i][i]));
    }

    // Calculate t-values
    const tValues = beta.map((b, i) => b / stdErrors[i]);

    // p-values (two-tailed) using t-distribution
    const pValues = tValues.map(t => 2 * (1 - tCDF(Math.abs(t), df)));

    // Calculate standardized coefficients (Beta)
    const meanY = dependent.reduce((sum, y) => sum + y, 0) / n;
    const sdY = Math.sqrt(dependent.reduce((sum, y) => sum + (y - meanY) ** 2, 0) / (n - 1));

    const means = independents.map(x => x.reduce((sum, val) => sum + val, 0) / n);
    const sds = independents.map((x, i) =>
      Math.sqrt(x.reduce((sum, val) => sum + (val - means[i]) ** 2, 0) / (n - 1))
    );

    const standardizedCoefficients = [null]; // Intercept has no standardized coefficient
    for (let i = 0; i < p; i++) {
      standardizedCoefficients.push(beta[i + 1] * (sds[i] / sdY));
    }

    // Create coefficient objects
    const coefficients = [];
    for (let i = 0; i < p + 1; i++) {
      coefficients.push({
        coefficient: beta[i],
        stdError: stdErrors[i],
        standardizedCoefficient: standardizedCoefficients[i],
        tValue: tValues[i],
        pValue: pValues[i]
      });
    }

    return coefficients;
  } catch (error) {
    console.error("Error calculating coefficients:", error);

    // Return simple placeholder coefficients if calculation fails
    const coefficients = [{
      coefficient: 0,
      stdError: 0,
      standardizedCoefficient: null,
      tValue: 0,
      pValue: 1
    }];

    // Add a coefficient for each independent variable
    for (let i = 0; i < varNames.length; i++) {
      coefficients.push({
        coefficient: 0,
        stdError: 0,
        standardizedCoefficient: 0,
        tValue: 0,
        pValue: 1
      });
    }

    return coefficients;
  }
}

// --------------------
// Functions for t-distribution p-value calculation
// --------------------

// tCDF: Cumulative distribution function for the t-distribution.
// Menggunakan relasi: CDF_t(t; v) = 1 - 0.5 * I_{v/(t^2+v)}(v/2, 1/2)
function tCDF(t, df) {
  if (t === 0) return 0.5;
  const x = df / (t * t + df);
  return 1 - 0.5 * incbeta(x, df / 2, 0.5);
}

// incbeta: Regularized incomplete beta function menggunakan algoritma Lanczos
function incbeta(x, a, b) {
  if (x < 0 || x > 1) throw new Error("x out of bounds in incbeta");
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
}

// logGamma: Log dari fungsi gamma menggunakan algoritma Lanczos standar
function logGamma(z) {
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
    return Math.log(Math.PI) - Math.log(Math.sin(Math.PI * z)) - logGamma(1 - z);
  } else {
    z -= 1;
    let x = 0.99999999999980993;
    for (let i = 0; i < p.length; i++) {
      x += p[i] / (z + i + 1);
    }
    const t = z + g + 0.5;
    return 0.5 * Math.log(2 * Math.PI) + (z + 0.5) * Math.log(t) - t + Math.log(x);
  }
}

// betacf: Continued fraction untuk incomplete beta function
function betacf(a, b, x) {
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
}

// --------------------
// Matrix Operation Functions
// --------------------

function transposeMatrix(matrix) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array(cols).fill().map(() => Array(rows));

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j][i] = matrix[i][j];
    }
  }

  return result;
}

function multiplyMatrices(A, B) {
  const rowsA = A.length;
  const colsA = A[0].length;
  const colsB = B[0].length;
  const result = Array(rowsA).fill().map(() => Array(colsB).fill(0));

  for (let i = 0; i < rowsA; i++) {
    for (let j = 0; j < colsB; j++) {
      for (let k = 0; k < colsA; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }

  return result;
}

function multiplyMatrixVector(matrix, vector) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const result = Array(rows).fill(0);

  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[i] += matrix[i][j] * vector[j];
    }
  }

  return result;
}

function invertMatrix(matrix) {
  try {
    const n = matrix.length;

    // Create augmented matrix [A|I]
    const augmented = [];
    for (let i = 0; i < n; i++) {
      augmented[i] = [...matrix[i]];
      for (let j = 0; j < n; j++) {
        augmented[i].push(i === j ? 1 : 0);
      }
    }

    // Gaussian elimination
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
  } catch (error) {
    console.error("Error inverting matrix:", error);
    const n = matrix.length;
    const identity = [];
    for (let i = 0; i < n; i++) {
      identity[i] = [];
      for (let j = 0; j < n; j++) {
        identity[i][j] = i === j ? 1 : 0;
      }
    }
    return identity;
  }
}

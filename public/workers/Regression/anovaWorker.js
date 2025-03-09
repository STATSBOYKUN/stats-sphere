self.onmessage = function (e) {
  try {
    const { dependentData, independentData, analyticId } = e.data;

    if (!dependentData || !independentData || !analyticId) {
      throw new Error("Missing required data.");
    }

    // Perform ANOVA calculation (same logic as before)

    const n = dependentData.length;
    const p = independentData[0].length; // Number of independent variables

    // Add intercept (column of 1's) to independent data
    const X_with_intercept = independentData.map(row => [1, ...row]);

    // Calculate X'X
    const Xt = transposeMatrix(X_with_intercept);
    const XtX = multiplyMatrices(Xt, X_with_intercept);

    // Calculate (X'X)^-1
    const XtX_inv = invertMatrix(XtX);

    // Calculate X'y
    const Xty = multiplyMatrixVector(Xt, dependentData);

    // Calculate beta = (X'X)^-1 * X'y
    const beta = multiplyMatrixVector(XtX_inv, Xty);

    // Calculate predicted y
    const y_pred = multiplyMatrixVector(X_with_intercept, beta);

    // Calculate residuals
    const residuals = dependentData.map((yi, i) => yi - y_pred[i]);

    // Calculate Total Sum of Squares (SST)
    const y_mean = mean(dependentData);
    const SST = sumArray(dependentData.map(yi => (yi - y_mean) ** 2));

    // Calculate Regression Sum of Squares (SSR)
    const SSR = sumArray(y_pred.map(ypi => (ypi - y_mean) ** 2));

    // Calculate Residual Sum of Squares (SSE)
    const SSE = sumArray(residuals.map(ei => ei ** 2));

    // Degrees of Freedom
    const regressionDF = p;
    const residualDF = n - p - 1;
    const totalDF = n - 1;

    // Mean Squares
    const regressionMS = SSR / regressionDF;
    const residualMS = SSE / residualDF;

    // F-statistic
    const F = regressionMS / residualMS;

    // R-squared
    const RSquare = SSR / SST;
    const adjustedRSquare = 1 - ((1 - RSquare) * (n - 1) / (n - p - 1));

    // Prepare ANOVA table
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
              "Sig.": (1 - cumulativeFDistribution(F, regressionDF, residualDF)).toFixed(3),
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

    // Return result to the main thread
    const result = {
      analytic_id: analyticId,
      title: "ANOVA",
      output_data: JSON.stringify(anovaTable),
      output_type: "table",
      components: "ANOVA",
    };

    self.postMessage(result); // Send the result back to main thread
  } catch (error) {
    // Handle errors and pass the error message back
    self.postMessage({ error: error.message });
  }
};

// Helper functions for matrix operations
const transposeMatrix = (matrix) => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

const multiplyMatrices = (A, B) => {
  const result = [];
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
};

const multiplyMatrixVector = (matrix, vector) => {
  const result = [];
  for (let i = 0; i < matrix.length; i++) {
    let sum = 0;
    for (let j = 0; j < vector.length; j++) {
      sum += matrix[i][j] * vector[j];
    }
    result[i] = sum;
  }
  return result;
};

const invertMatrix = (matrix) => {
  const n = matrix.length;
  const identity = identityMatrix(n);
  const augmented = matrix.map((row, i) => [...row, ...identity[i]]);

  for (let i = 0; i < n; i++) {
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
    const pivot = augmented[i][i];
    if (pivot === 0) {
      throw new Error('Matrix is singular and cannot be inverted.');
    }
    for (let j = 0; j < 2 * n; j++) {
      augmented[i][j] /= pivot;
    }
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = augmented[k][i];
        for (let j = 0; j < 2 * n; j++) {
          augmented[k][j] -= factor * augmented[i][j];
        }
      }
    }
  }

  const inverse = augmented.map(row => row.slice(n));
  return inverse;
};

const identityMatrix = (size) => {
  const identity = [];
  for (let i = 0; i < size; i++) {
    identity[i] = [];
    for (let j = 0; j < size; j++) {
      identity[i][j] = i === j ? 1 : 0;
    }
  }
  return identity;
};

const sumArray = (arr) => arr.reduce((acc, val) => acc + val, 0);

const mean = (arr) => sumArray(arr) / arr.length;

const cumulativeFDistribution = (F, df1, df2) => {
  const x = (df1 * F) / (df1 * F + df2);
  return betaIncomplete(df1 / 2, df2 / 2, x);
};

const betaIncomplete = (a, b, x) => {
  const bt = (x === 0 || x === 1) ? 0 : Math.exp(lngamma(a + b) - lngamma(a) - lngamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? bt * betaCf(x, a, b) / a : 1 - bt * betaCf(1 - x, b, a) / b;
};

const betaCf = (x, a, b) => {
  const MAX_ITER = 100;
  const EPS = 1e-10;
  let m2, aa, c, d, del, h, qab, qam, qap;

  qab = a + b;
  qap = a + 1;
  qam = a - 1;
  c = 1;
  d = 1 - qab * x / qap;
  if (Math.abs(d) < EPS) d = EPS;
  d = 1 / d;
  h = d;
  for (let m = 1; m <= MAX_ITER; m++) {
    m2 = 2 * m;
    aa = m * (b - m) * x / ((qam + m2) * (a + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < EPS) d = EPS;
    c = 1 + aa / c;
    if (Math.abs(c) < EPS) c = EPS;
    d = 1 / d;
    h *= d * c;
    aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
    d = 1 + aa * d;
    if (Math.abs(d) < EPS) d = EPS;
    c = 1 + aa / c;
    if (Math.abs(c) < EPS) c = EPS;
    d = 1 / d;
    del = d * c;
    h *= del;
    if (Math.abs(del - 1) < EPS) break;
  }
  return h;
};

const lngamma = (z) => {
  const coefficients = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < coefficients.length; j++) {
    y += 1;
    ser += coefficients[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
};

// hooks/useLinear.ts

import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';

export const useLinear = () => {
  // Fungsi utama untuk melakukan regresi linier
  const calculateLinearRegression = (y: number[], X: number[][]) => {
    const n = y.length;
    const p = X[0].length; // Jumlah variabel independen

    // Tambahkan intercept (kolom 1) ke X
    const X_with_intercept = X.map(row => [1, ...row]);

    // Hitung X'X
    const Xt = transposeMatrix(X_with_intercept);
    const XtX = multiplyMatrices(Xt, X_with_intercept);

    // Hitung (X'X)^{-1}
    const XtX_inv = invertMatrix(XtX);

    // Hitung X'y
    const Xty = multiplyMatrixVector(Xt, y);

    // Hitung beta = (X'X)^{-1} X'y
    const beta = multiplyMatrixVector(XtX_inv, Xty);

    // Hitung y_pred = X * beta
    const y_pred = multiplyMatrixVector(X_with_intercept, beta);

    // Hitung residuals
    const residuals = y.map((yi, i) => yi - y_pred[i]);

    // Hitung Total Sum of Squares (SST)
    const y_mean = mean(y);
    const SST = sumArray(y.map(yi => (yi - y_mean) ** 2));

    // Hitung Regression Sum of Squares (SSR)
    const SSR = sumArray(y_pred.map(ypi => (ypi - y_mean) ** 2));

    // Hitung Residual Sum of Squares (SSE)
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

    // Standard error of estimate
    const stdErrorEstimate = Math.sqrt(residualMS);

    // Standard errors for coefficients
    const standardErrors: number[] = [];
    const varianceMatrix = scalarMultiplyMatrix(XtX_inv, residualMS);
    for (let i = 0; i < beta.length; i++) {
      standardErrors.push(Math.sqrt(varianceMatrix[i][i]));
    }

    // t-values
    const tValues = beta.map((b, i) => b / standardErrors[i]);

    // p-values (Menggunakan distribusi normal sebagai aproksimasi)
    const pValues = tValues.map(t => 2 * (1 - cumulativeStandardNormal(Math.abs(t))));

    // Standardized Coefficients (Beta)
    const stdY = standardDeviation(y);
    const stdXs: number[] = [];
    for (let i = 1; i < X_with_intercept[0].length; i++) {
      const xi = X_with_intercept.map(row => row[i]);
      stdXs.push(standardDeviation(xi));
    }
    const standardizedCoefficients = beta.slice(1).map((b, i) => (b * stdXs[i]) / stdY);

    // Siapkan data koefisien
    const coefficients = beta.map((b, idx) => ({
      coefficient: b,
      stdError: standardErrors[idx],
      standardizedCoefficient: idx === 0 ? null : standardizedCoefficients[idx - 1],
      tValue: tValues[idx],
      pValue: pValues[idx],
    }));

    return {
      R: Math.sqrt(RSquare),
      RSquare,
      adjustedRSquare,
      stdErrorEstimate,
      regressionSS: SSR,
      regressionDF,
      regressionMS,
      residualSS: SSE,
      residualDF,
      residualMS,
      totalSS: SST,
      totalDF,
      F,
      pValue: 1 - cumulativeFDistribution(F, regressionDF, residualDF),
      coefficients,
    };
  };

  // Fungsi bantu untuk matriks dan statistik

  // Transpose matrix
  const transposeMatrix = (matrix: number[][]): number[][] => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };

  // Multiply two matrices
  const multiplyMatrices = (A: number[][], B: number[][]): number[][] => {
    const result: number[][] = [];
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

  // Multiply matrix and vector
  const multiplyMatrixVector = (matrix: number[][], vector: number[]): number[] => {
    const result: number[] = [];
    for (let i = 0; i < matrix.length; i++) {
      let sum = 0;
      for (let j = 0; j < vector.length; j++) {
        sum += matrix[i][j] * vector[j];
      }
      result[i] = sum;
    }
    return result;
  };

  // Scalar multiply matrix
  const scalarMultiplyMatrix = (matrix: number[][], scalar: number): number[][] => {
    return matrix.map(row => row.map(value => value * scalar));
  };

  // Invert matrix (Menggunakan metode Gauss-Jordan)
  const invertMatrix = (matrix: number[][]): number[][] => {
    const n = matrix.length;
    const identity = identityMatrix(n);
    const augmented = matrix.map((row, i) => [...row, ...identity[i]]);

    for (let i = 0; i < n; i++) {
      // Pivot
      let maxRow = i;
      for (let k = i + 1; k < n; k++) {
        if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = k;
        }
      }
      // Swap rows
      [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

      // Make pivot == 1
      const pivot = augmented[i][i];
      if (pivot === 0) {
        throw new Error('Matrix is singular and cannot be inverted.');
      }
      for (let j = 0; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminate other rows
      for (let k = 0; k < n; k++) {
        if (k !== i) {
          const factor = augmented[k][i];
          for (let j = 0; j < 2 * n; j++) {
            augmented[k][j] -= factor * augmented[i][j];
          }
        }
      }
    }

    // Extract inverse matrix
    const inverse = augmented.map(row => row.slice(n));
    return inverse;
  };

  // Create identity matrix
  const identityMatrix = (size: number): number[][] => {
    const identity = [];
    for (let i = 0; i < size; i++) {
      identity[i] = [];
      for (let j = 0; j < size; j++) {
        identity[i][j] = i === j ? 1 : 0;
      }
    }
    return identity;
  };

  // Sum of array elements
  const sumArray = (arr: number[]): number => {
    return arr.reduce((acc, val) => acc + val, 0);
  };

  // Mean of array
  const mean = (arr: number[]): number => {
    return sumArray(arr) / arr.length;
  };

  // Standard deviation
  const standardDeviation = (arr: number[]): number => {
    const avg = mean(arr);
    const squareDiffs = arr.map(value => (value - avg) ** 2);
    const avgSquareDiff = sumArray(squareDiffs) / (arr.length - 1);
    return Math.sqrt(avgSquareDiff);
  };

  // Cumulative distribution function for standard normal distribution
  const cumulativeStandardNormal = (z: number): number => {
    return (1 + erf(z / Math.sqrt(2))) / 2;
  };

  // Error function approximation
  const erf = (x: number): number => {
    // Approximate the error function using a numerical method
    const sign = x >= 0 ? 1 : -1;
    x = Math.abs(x);

    const a1 =  0.254829592;
    const a2 = -0.284496736;
    const a3 =  1.421413741;
    const a4 = -1.453152027;
    const a5 =  1.061405429;
    const p  =  0.3275911;

    const t = 1 / (1 + p * x);
    const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

    return sign * y;
  };

  // Cumulative F-distribution
  const cumulativeFDistribution = (F: number, df1: number, df2: number): number => {
    // Implementasi sederhana menggunakan aproksimasi
    const x = (df1 * F) / (df1 * F + df2);
    return betaIncomplete(df1 / 2, df2 / 2, x);
  };

  // Beta incomplete function
  const betaIncomplete = (a: number, b: number, x: number): number => {
    const bt = (x === 0 || x === 1) ? 0 :
      Math.exp(lngamma(a + b) - lngamma(a) - lngamma(b) + a * Math.log(x) + b * Math.log(1 - x));

    if (x < (a + 1) / (a + b + 2)) {
      return bt * betaCf(x, a, b) / a;
    } else {
      return 1 - bt * betaCf(1 - x, b, a) / b;
    }
  };

  // Continued fraction for betaIncomplete
  const betaCf = (x: number, a: number, b: number): number => {
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

  // Log gamma function
  const lngamma = (z: number): number => {
    const coefficients = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.1208650973866179e-2, -0.5395239384953e-5
    ];
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

  return {
    calculateLinearRegression,
  };
};

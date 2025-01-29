// useCurveEstimation.ts
type DataPoint = {
  x: number;
  y: number;
};

type LinearRegressionResult = {
  b0: number;
  b1: number;
  r2: number;
  predict: (val: number) => number;
};

type MultipleLinearRegressionResult = {
  coefficients: number[];
  r2: number;
  predict: (xArr: number[]) => number;
};

const mean = (arr: number[]): number => {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
};

const linearRegression = (x: number[], y: number[]): LinearRegressionResult => {
  const xMean = mean(x);
  const yMean = mean(y);
  const numerator = x.reduce((sum, xi, i) => sum + (xi - xMean) * (y[i] - yMean), 0);
  const denominator = x.reduce((sum, xi) => sum + (xi - xMean) ** 2, 0);
  const b1 = numerator / denominator;
  const b0 = yMean - b1 * xMean;
  const yPred = x.map(xi => b0 + b1 * xi);
  const ssRes = y.reduce((sum, yi, i) => sum + (yi - yPred[i]) ** 2, 0);
  const ssTot = y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  return { b0, b1, r2, predict: (val: number) => b0 + b1 * val };
};

const inverseMatrixGaussJordan = (M: number[][]): number[][] => {
  const n = M.length;
  let A = M.map((row, i) => [...row, ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0))]);
  for (let i = 0; i < n; i++) {
    let pivot = A[i][i];
    if (pivot === 0) {
      for (let r = i + 1; r < n; r++) {
        if (A[r][i] !== 0) {
          [A[i], A[r]] = [A[r], A[i]];
          pivot = A[i][i];
          break;
        }
      }
      if (pivot === 0) throw new Error("Matrix is not invertible");
    }
    A[i] = A[i].map(value => value / pivot);
    for (let r = 0; r < n; r++) {
      if (r !== i) {
        const factor = A[r][i];
        A[r] = A[r].map((val, c) => val - factor * A[i][c]);
      }
    }
  }
  return A.map(row => row.slice(n));
};

const transposeMatrix = (matrix: number[][]): number[][] => {
  return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
};

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

const multipleLinearRegression = (X: number[][], Y: number[]): MultipleLinearRegressionResult => {
  const XT = transposeMatrix(X);
  const XTX = multiplyMatrices(XT, X);
  const XTY = multiplyMatrices(XT, Y.map(y => [y]));
  const XTX_inv = inverseMatrixGaussJordan(XTX);
  const B = multiplyMatrices(XTX_inv, XTY);
  const coefficients = B.map(row => row[0]);
  const yMean = mean(Y);
  const yPred = X.map(row => row.reduce((sum, val, i) => sum + val * coefficients[i], 0));
  const ssRes = Y.reduce((sum, yi, i) => sum + (yi - yPred[i]) ** 2, 0);
  const ssTot = Y.reduce((sum, yi) => sum + (yi - yMean) ** 2, 0);
  const r2 = 1 - ssRes / ssTot;
  return {
    coefficients,
    r2,
    predict: (xArr: number[]) => [1, ...xArr].reduce((sum, val, i) => sum + val * coefficients[i], 0)
  };
};

const tryLinear = (X: number[], Y: number[]): LinearRegressionResult => {
  return linearRegression(X, Y);
};

const tryLogarithmic = (X: number[], Y: number[]): LinearRegressionResult | null => {
  if (X.some(x => x <= 0)) return null;
  const Xlog = X.map(x => Math.log(x));
  return linearRegression(Xlog, Y);
};

const tryInverse = (X: number[], Y: number[]): LinearRegressionResult | null => {
  if (X.some(x => x === 0)) return null;
  const Xinv = X.map(x => 1 / x);
  return linearRegression(Xinv, Y);
};

const tryQuadratic = (X: number[], Y: number[]): MultipleLinearRegressionResult => {
  const Xmat = X.map(x => [1, x, x ** 2]);
  return multipleLinearRegression(Xmat, Y);
};

const tryCubic = (X: number[], Y: number[]): MultipleLinearRegressionResult => {
  const Xmat = X.map(x => [1, x, x ** 2, x ** 3]);
  return multipleLinearRegression(Xmat, Y);
};

const tryPower = (X: number[], Y: number[]): LinearRegressionResult | null => {
  const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.x > 0 && d.y > 0);
  if (filtered.length < X.length) return null;
  const lnY = filtered.map(d => Math.log(d.y));
  const lnX = filtered.map(d => Math.log(d.x));
  const result = linearRegression(lnX, lnY);
  return { ...result, b0: Math.exp(result.b0) };
};

const tryCompound = (X: number[], Y: number[]): LinearRegressionResult | null => {
  const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0);
  if (filtered.length < X.length) return null;
  const lnY = filtered.map(d => Math.log(d.y));
  const Xpos = filtered.map(d => d.x);
  const result = linearRegression(Xpos, lnY);
  return { ...result, b0: Math.exp(result.b0), b1: Math.exp(result.b1) };
};

const trySCurve = (X: number[], Y: number[]): LinearRegressionResult | null => {
  const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0 && d.x !== 0);
  if (filtered.length < X.length) return null;
  const lnY = filtered.map(d => Math.log(d.y));
  const invX = filtered.map(d => 1 / d.x);
  return linearRegression(invX, lnY);
};

const tryGrowth = (X: number[], Y: number[]): LinearRegressionResult | null => {
  const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0);
  if (filtered.length < X.length) return null;
  const lnY = filtered.map(d => Math.log(d.y));
  const Xpos = filtered.map(d => d.x);
  return linearRegression(Xpos, lnY);
};

const tryExponential = (X: number[], Y: number[]): LinearRegressionResult | null => {
  const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0);
  if (filtered.length < X.length) return null;
  const lnY = filtered.map(d => Math.log(d.y));
  const Xpos = filtered.map(d => d.x);
  const result = linearRegression(Xpos, lnY);
  return { ...result, b0: Math.exp(result.b0) };
};

export const useCurveEstimation = () => {
  return {
    tryLinear,
    tryLogarithmic,
    tryInverse,
    tryQuadratic,
    tryCubic,
    tryPower,
    tryCompound,
    trySCurve,
    tryGrowth,
    tryExponential
  };
};

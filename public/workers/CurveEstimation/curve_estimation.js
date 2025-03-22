// curve_estimation.js
// This worker performs curve estimation calculations

// Function to calculate mean
const mean = (arr) => {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  };
  
  // Linear regression calculation
  const linearRegression = (x, y) => {
    const n = x.length;
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
    const df1 = 1;
    const df2 = n - 2;
    const f = (r2 / df1) / ((1 - r2) / df2);
    const sig = 1 - fCDF(f, df1, df2);
    return { b0, b1, r2, f, df1, df2, sig, predict: (val) => b0 + b1 * val };
  };
  
  // Inverse matrix calculation using Gauss-Jordan elimination
  const inverseMatrixGaussJordan = (M) => {
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
  
  // Matrix transpose operation
  const transposeMatrix = (matrix) => {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
  };
  
  // Matrix multiplication
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
  
  // Multiple linear regression
  const multipleLinearRegression = (X, Y) => {
    const n = Y.length;
    const k = X[0].length - 1;
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
    const df1 = k;
    const df2 = n - k - 1;
    const f = (r2 / df1) / ((1 - r2) / df2);
    const sig = 1 - fCDF(f, df1, df2);
    return {
      coefficients,
      r2,
      f,
      df1,
      df2,
      sig,
      predict: (xArr) => [1, ...xArr].reduce((sum, val, i) => sum + val * coefficients[i], 0)
    };
  };
  
  // Model-specific regression functions
  const tryLinear = (X, Y) => {
    return linearRegression(X, Y);
  };
  
  const tryLogarithmic = (X, Y) => {
    if (X.some(x => x <= 0)) return null;
    const Xlog = X.map(x => Math.log(x));
    return linearRegression(Xlog, Y);
  };
  
  const tryInverse = (X, Y) => {
    if (X.some(x => x === 0)) return null;
    const Xinv = X.map(x => 1 / x);
    return linearRegression(Xinv, Y);
  };
  
  const tryQuadratic = (X, Y) => {
    const Xmat = X.map(x => [1, x, x ** 2]);
    return multipleLinearRegression(Xmat, Y);
  };
  
  const tryCubic = (X, Y) => {
    const Xmat = X.map(x => [1, x, x ** 2, x ** 3]);
    return multipleLinearRegression(Xmat, Y);
  };
  
  const tryPower = (X, Y) => {
    const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.x > 0 && d.y > 0);
    if (filtered.length < X.length) return null;
    const lnY = filtered.map(d => Math.log(d.y));
    const lnX = filtered.map(d => Math.log(d.x));
    const result = linearRegression(lnX, lnY);
    return { ...result, b0: Math.exp(result.b0) };
  };
  
  const tryCompound = (X, Y) => {
    const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0);
    if (filtered.length < X.length) return null;
    const lnY = filtered.map(d => Math.log(d.y));
    const Xpos = filtered.map(d => d.x);
    const result = linearRegression(Xpos, lnY);
    return { ...result, b0: Math.exp(result.b0), b1: Math.exp(result.b1) };
  };
  
  const trySCurve = (X, Y) => {
    const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0 && d.x !== 0);
    if (filtered.length < X.length) return null;
    const lnY = filtered.map(d => Math.log(d.y));
    const invX = filtered.map(d => 1 / d.x);
    return linearRegression(invX, lnY);
  };
  
  const tryGrowth = (X, Y) => {
    const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0);
    if (filtered.length < X.length) return null;
    const lnY = filtered.map(d => Math.log(d.y));
    const Xpos = filtered.map(d => d.x);
    return linearRegression(Xpos, lnY);
  };
  
  const tryExponential = (X, Y) => {
    const filtered = X.map((x, i) => ({ x, y: Y[i] })).filter(d => d.y > 0);
    if (filtered.length < X.length) return null;
    const lnY = filtered.map(d => Math.log(d.y));
    const Xpos = filtered.map(d => d.x);
    const result = linearRegression(Xpos, lnY);
    return { ...result, b0: Math.exp(result.b0) };
  };
  
  // Functions for F-distribution CDF calculation
  const betacf = (a, b, x) => {
    const MAX_ITER = 100;
    const EPS = 3.0e-7;
    let am = 1;
    let bm = 1;
    let az = 1;
    let qab = a + b;
    let qap = a + 1;
    let qam = a - 1;
    let bz = 1 - qab * x / qap;
    for (let m = 1; m <= MAX_ITER; m++) {
      let em = m;
      let tem = em + em;
      let d = em * (b - m) * x / ((qam + tem) * (a + tem));
      let ap = az + d * am;
      let bp = bz + d * bm;
      d = -(a + em) * (qab + em) * x / ((a + tem) * (qap + tem));
      let app = ap + d * az;
      let bpp = bp + d * bz;
      let aold = az;
      am = ap / bpp;
      bm = bp / bpp;
      az = app / bpp;
      bz = 1;
      if (Math.abs(az - aold) < (EPS * Math.abs(az))) break;
    }
    return az;
  };
  
  const betai = (a, b, x) => {
    if (x < 0 || x > 1) throw new Error("Bad x in betai");
    if (x === 0 || x === 1) return x;
    const bt = Math.exp(gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) {
      return bt * betacf(a, b, x) / a;
    } else {
      return 1 - bt * betacf(b, a, 1 - x) / b;
    }
  };
  
  const gammaln = (x) => {
    const cof = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.001208650973866179, -0.000005395239384953
    ];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < cof.length; j++) {
      ser += cof[j] / (++y);
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  };
  
  const fCDF = (f, df1, df2) => {
    const x = (df1 * f) / (df1 * f + df2);
    return betai(df1 / 2, df2 / 2, x);
  };
  
  const generateRegressionSummary = (models, X, Y) => {
    const rows = models.map(model => {
      let result = {};
      switch (model) {
        case 'Linear':
          const lin = tryLinear(X, Y);
          result = {
            rowHeader: ["Linear"],
            "R Square": lin.r2.toFixed(3),
            "F": lin.f.toFixed(3),
            "df1": lin.df1,
            "df2": lin.df2,
            "Sig.": lin.sig.toFixed(3),
            "Constant": lin.b0.toFixed(3),
            "b1": lin.b1.toFixed(3),
            "b2": "",
            "b3": ""
          };
          break;
      
        case 'Logarithmic':
          const log = tryLogarithmic(X, Y);
          if (log) {
            result = {
              rowHeader: ["Logarithmic"],
              "R Square": log.r2.toFixed(3),
              "F": log.f.toFixed(3),
              "df1": log.df1,
              "df2": log.df2,
              "Sig.": log.sig.toFixed(3),
              "Constant": log.b0.toFixed(3),
              "b1": log.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["Logarithmic"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'Inverse':
          const inv = tryInverse(X, Y);
          if (inv) {
            result = {
              rowHeader: ["Inverse"],
              "R Square": inv.r2.toFixed(3),
              "F": inv.f.toFixed(3),
              "df1": inv.df1,
              "df2": inv.df2,
              "Sig.": inv.sig.toFixed(3),
              "Constant": inv.b0.toFixed(3),
              "b1": inv.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["Inverse"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'Quadratic':
          const quad = tryQuadratic(X, Y);
          result = {
            rowHeader: ["Quadratic"],
            "R Square": quad.r2.toFixed(3),
            "F": quad.f.toFixed(3),
            "df1": quad.df1,
            "df2": quad.df2,
            "Sig.": quad.sig.toFixed(3),
            "Constant": quad.coefficients[0].toFixed(3),
            "b1": quad.coefficients[1].toFixed(3),
            "b2": quad.coefficients[2].toFixed(3),
            "b3": ""
          };
          break;
      
        case 'Cubic':
          const cubic = tryCubic(X, Y);
          result = {
            rowHeader: ["Cubic"],
            "R Square": cubic.r2.toFixed(3),
            "F": cubic.f.toFixed(3),
            "df1": cubic.df1,
            "df2": cubic.df2,
            "Sig.": cubic.sig.toFixed(3),
            "Constant": cubic.coefficients[0].toFixed(3),
            "b1": cubic.coefficients[1].toFixed(3),
            "b2": cubic.coefficients[2].toFixed(3),
            "b3": cubic.coefficients[3].toFixed(3)
          };
          break;
      
        case 'Compound':
          const compound = tryCompound(X, Y);
          if (compound) {
            result = {
              rowHeader: ["Compound"],
              "R Square": compound.r2.toFixed(3),
              "F": compound.f.toFixed(3),
              "df1": compound.df1,
              "df2": compound.df2,
              "Sig.": compound.sig.toFixed(3),
              "Constant": compound.b0.toFixed(3),
              "b1": compound.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["Compound"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'Power':
          const power = tryPower(X, Y);
          if (power) {
            result = {
              rowHeader: ["Power"],
              "R Square": power.r2.toFixed(3),
              "F": power.f.toFixed(3),
              "df1": power.df1,
              "df2": power.df2,
              "Sig.": power.sig.toFixed(3),
              "Constant": power.b0.toFixed(3),
              "b1": power.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["Power"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'S':
          const sCurve = trySCurve(X, Y);
          if (sCurve) {
            result = {
              rowHeader: ["S"],
              "R Square": sCurve.r2.toFixed(3),
              "F": sCurve.f.toFixed(3),
              "df1": sCurve.df1,
              "df2": sCurve.df2,
              "Sig.": sCurve.sig.toFixed(3),
              "Constant": sCurve.b0.toFixed(3),
              "b1": sCurve.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["S"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'Growth':
          const growth = tryGrowth(X, Y);
          if (growth) {
            result = {
              rowHeader: ["Growth"],
              "R Square": growth.r2.toFixed(3),
              "F": growth.f.toFixed(3),
              "df1": growth.df1,
              "df2": growth.df2,
              "Sig.": growth.sig.toFixed(3),
              "Constant": growth.b0.toFixed(3),
              "b1": growth.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["Growth"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'Exponential':
          const exponential = tryExponential(X, Y);
          if (exponential) {
            result = {
              rowHeader: ["Exponential"],
              "R Square": exponential.r2.toFixed(3),
              "F": exponential.f.toFixed(3),
              "df1": exponential.df1,
              "df2": exponential.df2,
              "Sig.": exponential.sig.toFixed(3),
              "Constant": exponential.b0.toFixed(3),
              "b1": exponential.b1.toFixed(3),
              "b2": "",
              "b3": ""
            };
          } else {
            result = {
              rowHeader: ["Exponential"],
              "R Square": "",
              "F": "",
              "df1": "",
              "df2": "",
              "Sig.": "",
              "Constant": "",
              "b1": "",
              "b2": "",
              "b3": ""
            };
          }
          break;
      
        case 'Logistic':
          result = {
            rowHeader: ["Logistic"],
            "R Square": "",
            "F": "",
            "df1": "",
            "df2": "",
            "Sig.": "",
            "Constant": "",
            "b1": "",
            "b2": "",
            "b3": ""
          };
          break;
      
        default:
          result = {
            rowHeader: [model],
            "R Square": "",
            "F": "",
            "df1": "",
            "df2": "",
            "Sig.": "",
            "Constant": "",
            "b1": "",
            "b2": "",
            "b3": ""
          };
      }
      
      return result;
    });
  
    return {
      tables: [
        {
          title: "Model Summary and Parameter Estimates",
          columnHeaders: [
            { header: "Equation" },
            {
              header: "Model Summary",
              children: [
                { header: "R Square" },
                { header: "F" },
                { header: "df1" },
                { header: "df2" },
                { header: "Sig." }
              ]
            },
            {
              header: "Parameter Estimates",
              children: [
                { header: "Constant" },
                { header: "b1" },
                { header: "b2" },
                { header: "b3" }
              ]
            }
          ],
          rows: rows
        }
      ]
    };
  };
  
  // Event listener for messages from main thread
  self.addEventListener('message', (event) => {
    try {
      const { action, data } = event.data;
      
      switch (action) {
        case 'runRegression':
          const { models, X, Y, dependentName, independentNames } = data;
          
          // Generate regression summary
          const result = generateRegressionSummary(models, X, Y);
          
          // Add metadata about the regression
          const response = {
            success: true,
            result: result,
            metadata: {
              dependentVariable: dependentName,
              independentVariables: independentNames,
              numObservations: X.length
            }
          };
          
          self.postMessage({ action: 'regressionResults', data: response });
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      // Send back error details
      self.postMessage({ 
        action: 'error', 
        data: {
          message: error.message,
          stack: error.stack
        }
      });
    }
  });
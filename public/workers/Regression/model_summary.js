self.onmessage = function(e) {
  const { dependent, independent } = e.data;

  if (!dependent || !independent) {
    self.postMessage({ error: "Data dependent dan independent harus disediakan." });
    return;
  }
  if (!Array.isArray(dependent) || !Array.isArray(independent)) {
    self.postMessage({ error: "Data dependent dan independent harus berupa array." });
    return;
  }

  const numIndependentVars = independent.length;
  const n = dependent.length;
  const rows = [];

  const mean = arr => arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const round = (val, decimals = 3) => Number(val.toFixed(decimals));

  for (let varIndex = 0; varIndex < numIndependentVars; varIndex++) {
    const x = independent[varIndex];
    const y = dependent;

    if (y.length !== x.length) {
      self.postMessage({ error: `Panjang data dependent dan independent ke-${varIndex+1} harus sama.` });
      return;
    }

    const k = 1;

    const meanX = mean(x);
    const meanY = mean(y);

    const ssX = x.reduce((acc, xi) => acc + Math.pow(xi - meanX, 2), 0);

    let numerator = 0;
    for (let i = 0; i < n; i++) {
      numerator += (x[i] - meanX) * (y[i] - meanY);
    }
    const b = numerator / ssX;

    const a = meanY - b * meanX;

    const yPred = x.map(xi => a + b * xi);
    const residuals = y.map((yi, i) => yi - yPred[i]);

    const SSE = residuals.reduce((sum, e) => sum + Math.pow(e, 2), 0);

    const SST = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);

    const rSquare = 1 - SSE / SST;

    const r = b >= 0 ? Math.sqrt(rSquare) : -Math.sqrt(rSquare);

    const adjustedRSquare = 1 - ((n - 1) / (n - k - 1)) * (1 - rSquare);

    const stdErrorEstimate = Math.sqrt(SSE / (n - k - 1));

    rows.push({
      rowHeader: [(varIndex + 1).toString()],
      r: round(r, 3),
      rSquare: round(rSquare, 3),
      adjustedRSquare: round(adjustedRSquare, 3),
      stdErrorEstimate: round(stdErrorEstimate, 5)
    });
  }

  const result = {
    tables: [
      {
        title: "Model Summary",
        columnHeaders: [
          { header: "Model" },
          { header: "R", key: "r" },
          { header: "R Square", key: "rSquare" },
          { header: "Adjusted R Square", key: "adjustedRSquare" },
          { header: "Std. Error of the Estimate", key: "stdErrorEstimate" }
        ],
        rows: rows
      }
    ]
  };

  self.postMessage(result);
};
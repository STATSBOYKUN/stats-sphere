// model_summary.js

self.onmessage = function(e) {
  const { dependent, independent } = e.data;
  
  // Validasi input
  if (!dependent || !independent) {
    self.postMessage({ error: "Data dependent dan independent harus disediakan." });
    return;
  }
  if (!Array.isArray(dependent) || !Array.isArray(independent)) {
    self.postMessage({ error: "Data dependent dan independent harus berupa array." });
    return;
  }
  if (dependent.length !== independent.length) {
    self.postMessage({ error: "Panjang data dependent dan independent harus sama." });
    return;
  }
  
  const n = dependent.length; // Jumlah observasi
  const k = 1;                // Jumlah prediktor (satu variabel independen)
  
  // Fungsi untuk menghitung rata-rata
  const mean = arr => arr.reduce((sum, val) => sum + val, 0) / arr.length;
  const meanX = mean(independent);
  const meanY = mean(dependent);
  
  // Hitung Sum of Squares untuk X: SSₓ = Σ (x - meanX)²
  const ssX = independent.reduce((acc, xi) => acc + Math.pow(xi - meanX, 2), 0);
  
  // Hitung slope (b) = Σ[(x - meanX)*(y - meanY)] / SSₓ
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (independent[i] - meanX) * (dependent[i] - meanY);
  }
  const b = numerator / ssX;
  
  // Hitung intercept (a) = meanY - b * meanX
  const a = meanY - b * meanX;
  
  // Hitung nilai prediksi (yhat) dan residual
  const yPred = independent.map(xi => a + b * xi);
  const residuals = dependent.map((yi, i) => yi - yPred[i]);
  
  // Hitung Sum of Squared Errors (SSE)
  const SSE = residuals.reduce((sum, e) => sum + Math.pow(e, 2), 0);
  
  // Hitung Total Sum of Squares (SST)
  const SST = dependent.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  
  // Koefisien determinasi (R Square)
  const rSquare = 1 - SSE / SST;
  
  // Untuk regresi linear sederhana, koefisien korelasi (r) adalah akar R Square dengan tanda slope
  const r = b >= 0 ? Math.sqrt(rSquare) : -Math.sqrt(rSquare);
  
  // Adjusted R Square: 1 - ((n-1)/(n-k-1))*(1 - R^2)
  const adjustedRSquare = 1 - ((n - 1) / (n - k - 1)) * (1 - rSquare);
  
  // Standard Error of the Estimate: sqrt(SSE/(n-k-1))
  const stdErrorEstimate = Math.sqrt(SSE / (n - k - 1));
  
  // Fungsi pembulatan
  const round = (val, decimals = 3) => Number(val.toFixed(decimals));
  
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
        rows: [
          {
            rowHeader: ["1"],
            r: round(r, 3),
            rSquare: round(rSquare, 3),
            adjustedRSquare: round(adjustedRSquare, 3),
            stdErrorEstimate: round(stdErrorEstimate, 5)
          }
        ]
      }
    ]
  };
  
  self.postMessage(result);
};

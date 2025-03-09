// model_durbin.js

self.onmessage = function (e) {
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
  
    // Data: y (dependent) dan x (independent)
    const y = dependent;
    const x = independent;
    const n = y.length; // Jumlah observasi
    const k = 1;        // Jumlah prediktor (satu variabel independen)
  
    // Fungsi sederhana untuk menghitung rata-rata
    const mean = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const meanY = mean(y);
    const meanX = mean(x);
  
    // Hitung variansi dan kovarians dengan pembagi (n-1)
    let cov = 0,
      varX = 0,
      varY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      cov += dx * dy;
      varX += dx * dx;
      varY += dy * dy;
    }
    cov /= (n - 1);
    varX /= (n - 1);
    varY /= (n - 1);
  
    // Koefisien regresi (slope dan intercept)
    const slope = cov / varX;
    const intercept = meanY - slope * meanX;
  
    // Hitung nilai prediksi dan residual
    const yPred = y.map((yi, i) => intercept + slope * x[i]);
    const residuals = y.map((yi, i) => yi - yPred[i]);
  
    // Hitung Sum of Squared Errors (SSE) dan Total Sum of Squares (SST)
    const SSE = residuals.reduce((sum, e) => sum + e * e, 0);
    const SST = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);
  
    // Koefisien determinasi (R Square) dan koefisien korelasi (r)
    const rSquare = 1 - SSE / SST;
    const r = cov / (Math.sqrt(varX) * Math.sqrt(varY));
  
    // Adjusted R Square: 1 - ((n-1)/(n-k-1))*(1 - R^2)
    const adjustedRSquare = 1 - ((n - 1) / (n - k - 1)) * (1 - rSquare);
  
    // Standard Error of the Estimate: sqrt(SSE/(n-k-1))
    const stdErrorEstimate = Math.sqrt(SSE / (n - k - 1));
  
    // Durbin-Watson statistic: sum((e_t - e_(t-1))^2) / SSE
    let dwSum = 0;
    for (let i = 1; i < n; i++) {
      const diff = residuals[i] - residuals[i - 1];
      dwSum += diff * diff;
    }
    const durbinWatson = dwSum / SSE;
  
    // Fungsi pembulatan
    const round = (val, decimals = 3) => Number(val.toFixed(decimals));
  
    // Bangun objek JSON hasil sesuai struktur yang diminta
    const result = {
      tables: [
        {
          title: "Model Summary",
          columnHeaders: [
            { header: "Model" },
            { header: "R", key: "r" },
            { header: "R Square", key: "rSquare" },
            { header: "Adjusted R Square", key: "adjustedRSquare" },
            { header: "Std. Error of the Estimate", key: "stdErrorEstimate" },
            { header: "Durbin-Watson", key: "durbinWatson" }
          ],
          rows: [
            {
              rowHeader: ["1"],
              r: round(r, 3),
              rSquare: round(rSquare, 3),
              adjustedRSquare: round(adjustedRSquare, 3),
              stdErrorEstimate: round(stdErrorEstimate, 5),
              durbinWatson: round(durbinWatson, 3)
            }
          ]
        }
      ]
    };
  
    self.postMessage(result);
  };
  
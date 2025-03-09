// casewise_diagnostics.js

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
    
    const y = dependent;
    const x = independent;
    const n = y.length; // Jumlah observasi
    
    // Fungsi bantu: menghitung rata-rata
    const mean = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;
    
    const meanX = mean(x);
    const meanY = mean(y);
    
    // Hitung kovarians dan variansi x (dengan pembagi n-1)
    let cov = 0, varX = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      cov += dx * dy;
      varX += dx * dx;
    }
    cov /= (n - 1);
    varX /= (n - 1);
    
    // Hitung slope dan intercept (OLS)
    const slope = cov / varX;               // Dihitung = 0.4 (contoh)
    const intercept = meanY - slope * meanX;  // Dihitung = 1.75 (contoh)
    
    // Hitung nilai prediksi tiap kasus
    const predicted = x.map(xi => intercept + slope * xi);
    // Hitung residual tiap kasus: e = y - predicted
    const residuals = y.map((yi, i) => yi - predicted[i]);
    
    // Hitung SSE (Sum of Squared Errors)
    const SSE = residuals.reduce((sum, e) => sum + e * e, 0);
    // Standar error (s) dengan df = n - 2
    const s = Math.sqrt(SSE / (n - 2));
    
    // Hitung standardized residual: e / s
    const stdResiduals = residuals.map(e => e / s);
    
    // Fungsi pembulatan
    function round(val, decimals) {
      return Number(val.toFixed(decimals));
    }
    
    // Bangun data casewise diagnostics
    const cases = [];
    for (let i = 0; i < n; i++) {
      cases.push({
        caseNumber: (i + 1).toString(),
        var00001: round(y[i], 2),                // Nilai aktual
        predictedValue: round(predicted[i], 4),
        residual: round(residuals[i], 4),
        stdResidual: round(stdResiduals[i], 3)
      });
    }
    
    const result = {
      tables: [
        {
          title: "Casewise Diagnostics",
          columnHeaders: [
            { header: "Case Number" },
            { header: "Std. Residual", key: "stdResidual" },
            { header: "VAR00001", key: "var00001" },
            { header: "Predicted Value", key: "predictedValue" },
            { header: "Residual", key: "residual" }
          ],
          rows: cases.map(item => ({
            rowHeader: [item.caseNumber],
            stdResidual: item.stdResidual,
            var00001: item.var00001,
            predictedValue: item.predictedValue,
            residual: item.residual
          }))
        }
      ]
    };
    
    self.postMessage(result);
  };
  
// residuals_statistics.js

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
    
    // Fungsi bantu: menghitung rata-rata
    const mean = (arr) => arr.reduce((sum, v) => sum + v, 0) / arr.length;
    
    // Hitung rata-rata x dan y
    const meanX = mean(independent);
    const meanY = mean(dependent);
    
    // Hitung kovarians dan variansi x (menggunakan pembagi n-1)
    let cov = 0, varX = 0;
    for (let i = 0; i < n; i++) {
      const dx = independent[i] - meanX;
      const dy = dependent[i] - meanY;
      cov += dx * dy;
      varX += dx * dx;
    }
    cov /= (n - 1);
    varX /= (n - 1);
    
    // Koefisien regresi: slope dan intercept
    const slope = cov / varX;
    const intercept = meanY - slope * meanX;
    
    // Hitung nilai prediksi dan residual
    const yPred = independent.map(xi => intercept + slope * xi);
    const residuals = dependent.map((yi, i) => yi - yPred[i]);
    
    // Fungsi untuk menghitung statistik dasar dari array (menggunakan pembagi n-1 untuk std dev)
    function getStats(arr) {
      const count = arr.length;
      const m = mean(arr);
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const variance = arr.reduce((sum, v) => sum + Math.pow(v - m, 2), 0) / (count - 1);
      const stdDev = Math.sqrt(variance);
      return { min, max, mean: m, stdDev, n: count };
    }
    
    // Statistik untuk Predicted Value dan Residual
    const statsPred = getStats(yPred);
    const statsRes = getStats(residuals);
    
    // Hitung nilai standar (z-score) untuk Predicted Value
    const stdPred = yPred.map(v => (v - statsPred.mean) / statsPred.stdDev);
    const statsStdPred = getStats(stdPred);
    
    // Hitung Std. Error of the Estimate (s); untuk regresi linear sederhana, df = n - 2
    const SSE = residuals.reduce((sum, r) => sum + r * r, 0);
    const s = Math.sqrt(SSE / (n - 2));
    
    // Hitung standar residual: tiap residual dibagi s
    const stdRes = residuals.map(r => r / s);
    const statsStdRes = getStats(stdRes);
    
    // Fungsi pembulatan
    function round(val, decimals) {
      return Number(val.toFixed(decimals));
    }
    
    // Bangun objek JSON hasil sesuai struktur yang diinginkan
    const result = {
      tables: [
        {
          title: "Residuals Statistics",
          columnHeaders: [
            { header: "" },
            { header: "Minimum", key: "minimum" },
            { header: "Maximum", key: "maximum" },
            { header: "Mean", key: "mean" },
            { header: "Std. Deviation", key: "stdDeviation" },
            { header: "N", key: "n" }
          ],
          rows: [
            {
              rowHeader: ["Predicted Value"],
              minimum: round(statsPred.min, 4),
              maximum: round(statsPred.max, 4),
              mean: round(statsPred.mean, 4),
              stdDeviation: round(statsPred.stdDev, 5),
              n: statsPred.n
            },
            {
              rowHeader: ["Residual"],
              minimum: round(statsRes.min, 4),
              maximum: round(statsRes.max, 4),
              mean: round(statsRes.mean, 4),
              stdDeviation: round(statsRes.stdDev, 5),
              n: statsRes.n
            },
            {
              rowHeader: ["Std. Predicted Value"],
              minimum: round(statsStdPred.min, 3),
              maximum: round(statsStdPred.max, 3),
              mean: round(statsStdPred.mean, 3),
              stdDeviation: round(statsStdPred.stdDev, 3),
              n: statsStdPred.n
            },
            {
              rowHeader: ["Std. Residual"],
              minimum: round(statsStdRes.min, 3),
              maximum: round(statsStdRes.max, 3),
              mean: round(statsStdRes.mean, 3),
              stdDeviation: round(statsStdRes.stdDev, 3),
              n: statsStdRes.n
            }
          ]
        }
      ]
    };
    
    self.postMessage(result);
  };
  
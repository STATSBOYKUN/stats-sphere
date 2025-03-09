// confidence_interval.js

self.onmessage = function(e) {
    // Ambil data yang dikirimkan dari main thread
    const { independent, dependent } = e.data;
    
    // Validasi: pastikan kedua array tersedia dan memiliki panjang yang sama
    if (!independent || !dependent) {
      self.postMessage({ error: "Kedua array independent dan dependent harus disediakan." });
      return;
    }
    
    if (independent.length !== dependent.length) {
      self.postMessage({ error: "Array independent dan dependent harus memiliki panjang yang sama." });
      return;
    }
    
    const n = dependent.length;
  
    // Hitung rata-rata masing-masing variabel
    const meanY = dependent.reduce((sum, val) => sum + val, 0) / n;
    const meanX = independent.reduce((sum, val) => sum + val, 0) / n;
  
    // Hitung Sxx dan Sxy
    let Sxx = 0, Sxy = 0;
    for (let i = 0; i < n; i++) {
      Sxx += Math.pow(independent[i] - meanX, 2);
      Sxy += (independent[i] - meanX) * (dependent[i] - meanY);
    }
  
    // Koefisien regresi: slope (VAR00002) dan intercept ((Constant))
    const slope = Sxy / Sxx;
    const intercept = meanY - slope * meanX;
  
    // Hitung residual sum of squares (RSS)
    let rss = 0;
    for (let i = 0; i < n; i++) {
      const predicted = intercept + slope * independent[i];
      rss += Math.pow(dependent[i] - predicted, 2);
    }
    
    const df = n - 2; // derajat kebebasan
    const sigma2 = rss / df; // estimasi varians error
  
    // Hitung standar error untuk masing-masing koefisien
    const seSlope = Math.sqrt(sigma2 / Sxx);
    const seIntercept = Math.sqrt(sigma2 * (1 / n + Math.pow(meanX, 2) / Sxx));
  
    // Nilai kritis t untuk CI 95% (dengan asumsi df = n - 2, contoh default: 2.447)
    const tCrit = 2.447;
  
    // Hitung batas bawah dan atas 95% Confidence Interval
    const interceptLower = parseFloat((intercept - tCrit * seIntercept).toFixed(3));
    const interceptUpper = parseFloat((intercept + tCrit * seIntercept).toFixed(3));
    const slopeLower = parseFloat((slope - tCrit * seSlope).toFixed(3));
    const slopeUpper = parseFloat((slope + tCrit * seSlope).toFixed(3));
  
    // Susun output dengan struktur table (output berupa objek)
    const result = {
      tables: [
        {
          title: "Coefficients",
          columnHeaders: [
            { header: "Model" },
            { header: "" },
            {
              header: "95% Confidence Interval for B",
              children: [
                { header: "Lower Bound", key: "lowerBound" },
                { header: "Upper Bound", key: "upperBound" }
              ]
            }
          ],
          rows: [
            {
              rowHeader: ["1"],
              children: [
                {
                  rowHeader: [null, "(Constant)"],
                  lowerBound: interceptLower,
                  upperBound: interceptUpper
                },
                {
                  rowHeader: [null, "VAR00002"],
                  lowerBound: slopeLower,
                  upperBound: slopeUpper
                }
              ]
            }
          ]
        }
      ]
    };
  
    // Kirim hasil perhitungan kembali ke main thread
    self.postMessage(result);
  };
  
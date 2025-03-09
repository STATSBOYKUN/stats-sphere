// coefficient_correlations.js

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
  
  // Asumsi: independent disediakan sebagai array of arrays (untuk multiple variabel)
  // Karena hanya ada 1 variabel independen, gunakan elemen pertama
  const x = Array.isArray(independent[0]) ? independent[0] : independent;
  const y = dependent;
  
  const n = y.length;
  
  // Fungsi untuk menghitung rata-rata
  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
  
  const meanX = mean(x);
  const meanY = mean(y);
  
  // Hitung Sum of Squares untuk X: SSₓ = Σ (x - meanX)²
  const ssX = x.reduce((acc, xi) => acc + Math.pow(xi - meanX, 2), 0);
  
  // Hitung slope (b) = Σ[(x - meanX)*(y - meanY)] / SSₓ
  let numerator = 0;
  for (let i = 0; i < n; i++) {
    numerator += (x[i] - meanX) * (y[i] - meanY);
  }
  const b = numerator / ssX;
  
  // Hitung intercept (a) = meanY - b * meanX
  const a = meanY - b * meanX;
  
  // Hitung SSE (Sum of Squared Errors) dari prediksi regresi
  let SSE = 0;
  for (let i = 0; i < n; i++) {
    const yhat = a + b * x[i];
    SSE += Math.pow(y[i] - yhat, 2);
  }
  
  // Derajat kebebasan: n - 2
  const sigma2 = SSE / (n - 2);
  
  // Varians dari slope: Var(b) = σ² / SSₓ
  const varB = sigma2 / ssX;
  
  // Fungsi pembulatan ke 3 desimal
  function round(val) {
    return Math.round(val * 1000) / 1000;
  }
  
  // Susun output dengan struktur JSON sesuai spesifikasi
  const output = {
    tables: [
      {
        title: "Coefficient Correlations",
        columnHeaders: [
          { header: "Model" },
          { header: "" },
          { header: "" },
          { header: "Value" }
        ],
        rows: [
          {
            rowHeader: ["1"],
            children: [
              {
                rowHeader: [null, "Correlations", "VAR00002"],
                Value: 1.000  // Matriks korelasi 1x1 selalu 1
              },
              {
                rowHeader: [null, "Covariances", "VAR00002"],
                Value: round(varB)
              }
            ]
          }
        ]
      }
    ]
  };
  
  self.postMessage(output);
};

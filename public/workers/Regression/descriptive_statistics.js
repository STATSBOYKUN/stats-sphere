// descriptive_statistics.js

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
  
  // Fungsi untuk menghitung nilai rata-rata
  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
  
  // Fungsi untuk menghitung standar deviasi sampel (dengan pembagi n-1)
  function sampleStdDev(arr) {
    const m = mean(arr);
    const sumSq = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
    return Math.sqrt(sumSq / (arr.length - 1));
  }
  
  // Hitung statistik untuk variabel dependen (VAR00001)
  const statsDependent = {
    variable: "VAR00001",
    mean: parseFloat(mean(dependent).toFixed(2)),
    stdDeviation: parseFloat(sampleStdDev(dependent).toFixed(5)),
    n: dependent.length
  };
  
  // Hitung statistik untuk variabel independen (VAR00002)
  const statsIndependent = {
    variable: "VAR00002",
    mean: parseFloat(mean(independent).toFixed(2)),
    stdDeviation: parseFloat(sampleStdDev(independent).toFixed(5)),
    n: independent.length
  };
  
  // Susun output JSON sesuai struktur yang diminta
  const result = {
    tables: [
      {
        title: "Descriptive Statistics",
        columnHeaders: [
          { header: "Variable", key: "variable" },
          { header: "Mean", key: "mean" },
          { header: "Std. Deviation", key: "stdDeviation" },
          { header: "N", key: "n" }
        ],
        rows: [
          Object.assign({ rowHeader: ["VAR00001"] }, statsDependent),
          Object.assign({ rowHeader: ["VAR00002"] }, statsIndependent)
        ]
      }
    ]
  };
  
  self.postMessage(result);
};

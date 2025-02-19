// descriptive_statistics.js

// Menerima pesan dari main thread
self.onmessage = function(e) {
  // Pastikan data yang diterima memiliki properti 'dependent' dan 'independent'
  const { dependent, independent } = e.data;

  // Fungsi untuk menghitung rata-rata
  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  // Fungsi untuk menghitung standar deviasi sampel
  function sampleStdDev(arr) {
    const m = mean(arr);
    const sumSq = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0);
    return Math.sqrt(sumSq / (arr.length - 1));
  }

  // Menghitung nilai statistik untuk masing-masing variabel
  const statsDependent = {
    variable: "VAR00001",
    mean: parseFloat(mean(dependent).toFixed(2)),
    stdDeviation: parseFloat(sampleStdDev(dependent).toFixed(5)),
    n: dependent.length
  };

  const statsIndependent = {
    variable: "VAR00002",
    mean: parseFloat(mean(independent).toFixed(2)),
    stdDeviation: parseFloat(sampleStdDev(independent).toFixed(5)),
    n: independent.length
  };

  // Menyusun format output JSON
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
          statsDependent,
          statsIndependent
        ]
      }
    ]
  };

  // Mengirim hasil kembali ke main thread
  self.postMessage(result);
};

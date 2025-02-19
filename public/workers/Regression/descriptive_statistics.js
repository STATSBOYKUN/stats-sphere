// descriptive_statistics.js

// Fungsi untuk menghitung mean
function calculateMean(arr) {
  const sum = arr.reduce((acc, val) => acc + val, 0);
  return sum / arr.length;
}

// Fungsi untuk menghitung standar deviasi sample
function calculateSampleStdDev(arr, mean) {
  const squaredDiffs = arr.map(val => Math.pow(val - mean, 2));
  // Bagi dengan n-1 untuk sample standard deviation
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / (arr.length - 1);
  return Math.sqrt(variance);
}

// Web Worker menerima pesan dari thread utama
self.onmessage = function (event) {
  console.log("[Worker] Data diterima:", event.data);
  const { dependent, independent } = event.data;

  // Validasi input
  if (!Array.isArray(dependent) || !Array.isArray(independent)) {
    const errorMsg = "Parameter 'dependent' dan 'independent' harus berupa array.";
    console.error("[Worker] Error:", errorMsg);
    postMessage({ error: errorMsg });
    return;
  }

  // Jika salah satu array kosong, kembalikan tabel dengan rows kosong
  if (dependent.length === 0 || independent.length === 0) {
    const output = {
      tables: [
        {
          title: "Descriptive Statistics",
          columnHeaders: [
            { header: "Variable", key: "variable" },
            { header: "Mean", key: "mean" },
            { header: "Std. Deviation", key: "stdDeviation" },
            { header: "N", key: "n" }
          ],
          rows: []
        }
      ]
    };
    postMessage(output);
    return;
  }

  // Hitung statistik untuk data dependen
  const meanDependent = calculateMean(dependent);
  const stdDependent = parseFloat(calculateSampleStdDev(dependent, meanDependent).toFixed(5));
  const statsDependent = {
    variable: "VAR00001",
    mean: meanDependent,
    stdDeviation: stdDependent,
    n: dependent.length,
    children: [] // tambahkan children kosong untuk menghindari error
  };

  // Hitung statistik untuk data independen
  const meanIndependent = calculateMean(independent);
  const stdIndependent = parseFloat(calculateSampleStdDev(independent, meanIndependent).toFixed(5));
  const statsIndependent = {
    variable: "VAR00002",
    mean: meanIndependent,
    stdDeviation: stdIndependent,
    n: independent.length,
    children: [] // tambahkan children kosong
  };

  // Susun output JSON sesuai dengan spesifikasi
  const output = {
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

  console.log("[Worker] Hasil perhitungan:", output);
  // Kirim hasil perhitungan kembali ke thread utama
  postMessage(output);
};

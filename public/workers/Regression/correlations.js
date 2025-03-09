// correlations.js

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
  
  const n = dependent.length;
  
  // Fungsi untuk menghitung rata-rata
  function mean(arr) {
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }
  
  // Fungsi untuk menghitung koefisien korelasi Pearson
  function correlation(x, y) {
    const n = x.length;
    const meanX = mean(x);
    const meanY = mean(y);
    let num = 0, denX = 0, denY = 0;
    for (let i = 0; i < n; i++) {
      const dx = x[i] - meanX;
      const dy = y[i] - meanY;
      num += dx * dy;
      denX += dx * dx;
      denY += dy * dy;
    }
    return num / Math.sqrt(denX * denY);
  }
  
  // Fungsi log gamma (menggunakan metode dari Numerical Recipes)
  function gammln(xx) {
    const cof = [
      76.18009172947146, -86.50532032941677,
      24.01409824083091, -1.231739572450155,
      0.1208650973866179e-2, -0.5395239384953e-5
    ];
    let x = xx - 1.0;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < cof.length; j++) {
      x += 1;
      ser += cof[j] / x;
    }
    return -tmp + Math.log(2.5066282746310005 * ser);
  }
  
  // Fungsi betacf untuk evaluasi fungsi beta tak hingga
  function betacf(a, b, x) {
    const MAXIT = 100;
    const EPS = 3e-7;
    const FPMIN = 1e-30;
    const qab = a + b;
    const qap = a + 1;
    const qam = a - 1;
    let c = 1;
    let d = 1 - qab * x / qap;
    if (Math.abs(d) < FPMIN) d = FPMIN;
    d = 1 / d;
    let h = d;
    for (let m = 1; m <= MAXIT; m++) {
      const m2 = 2 * m;
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      h *= d * c;
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < FPMIN) d = FPMIN;
      c = 1 + aa / c;
      if (Math.abs(c) < FPMIN) c = FPMIN;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < EPS) break;
    }
    return h;
  }
  
  // Fungsi incomplete beta
  function betai(a, b, x) {
    if (x < 0 || x > 1) return NaN;
    const bt = (x === 0 || x === 1)
      ? 0
      : Math.exp(gammln(a + b) - gammln(a) - gammln(b) + a * Math.log(x) + b * Math.log(1 - x));
    if (x < (a + 1) / (a + b + 2)) {
      return bt * betacf(a, b, x) / a;
    } else {
      return 1 - bt * betacf(b, a, 1 - x) / b;
    }
  }
  
  // Menghitung nilai korelasi
  let r = correlation(dependent, independent);
  
  // Hitung statistik t untuk uji korelasi
  const df = n - 2; // derajat kebebasan
  const t = r * Math.sqrt(df / (1 - r * r));
  
  // Hitung p-value 1-tailed.
  // P-value = 0.5 * betai(df/2, 0.5, df/(t*t+df))
  let pValue = 0.5 * betai(df / 2, 0.5, df / (t * t + df));
  
  // Fungsi pembulatan ke 3 desimal
  function round(num) {
    return Math.round(num * 1000) / 1000;
  }
  
  r = round(r);
  pValue = round(pValue);
  
  const result = {
    tables: [
      {
        title: "Correlations",
        columnHeaders: [
          { header: "" },
          { header: "" },
          { header: "VAR00001" },
          { header: "VAR00002" }
        ],
        rows: [
          {
            rowHeader: ["Pearson Correlation"],
            children: [
              {
                rowHeader: [null, "VAR00001"],
                VAR00001: 1.000,
                VAR00002: r
              },
              {
                rowHeader: [null, "VAR00002"],
                VAR00001: r,
                VAR00002: 1.000
              }
            ]
          },
          {
            rowHeader: ["Sig. (1-tailed)"],
            children: [
              {
                rowHeader: [null, "VAR00001"],
                VAR00001: ".",
                VAR00002: pValue
              },
              {
                rowHeader: [null, "VAR00002"],
                VAR00001: pValue,
                VAR00002: "."
              }
            ]
          },
          {
            rowHeader: ["N"],
            children: [
              {
                rowHeader: [null, "VAR00001"],
                VAR00001: n,
                VAR00002: n
              },
              {
                rowHeader: [null, "VAR00002"],
                VAR00001: n,
                VAR00002: n
              }
            ]
          }
        ]
      }
    ]
  };
  
  console.log(result);
  self.postMessage(result);
};

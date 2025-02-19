// rsquare.js

self.onmessage = function (event) {
  console.log("[Worker] Data diterima:", event.data);
  const { dependent, independent } = event.data;

  // Validasi input
  if (!Array.isArray(dependent) || !Array.isArray(independent)) {
    console.error("[Worker] Error: Parameter 'dependent' dan 'independent' harus berupa array.");
    postMessage({ error: "Parameter 'dependent' dan 'independent' harus berupa array." });
    return;
  }
  if (dependent.length !== independent.length) {
    console.error("[Worker] Error: Array 'dependent' dan 'independent' harus memiliki panjang yang sama.");
    postMessage({ error: "Array 'dependent' dan 'independent' harus memiliki panjang yang sama." });
    return;
  }

  const n = dependent.length;
  // Gunakan A untuk data dependen dan B untuk data independen
  const A = dependent;
  const B = independent;

  // Hitung rata‑rata
  const meanA = A.reduce((acc, val) => acc + val, 0) / n;
  const meanB = B.reduce((acc, val) => acc + val, 0) / n;
  console.log("[Worker] Mean A:", meanA, "Mean B:", meanB);

  // Hitung slope dan intercept
  let sumXY = 0,
      sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumXY += (B[i] - meanB) * (A[i] - meanA);
    sumXX += Math.pow(B[i] - meanB, 2);
  }
  const slope = sumXY / sumXX;
  const intercept = meanA - slope * meanB;
  console.log("[Worker] Slope:", slope, "Intercept:", intercept);

  // Hitung SS_total dan SS_reg untuk perhitungan R²
  let ssTotal = 0,
      ssReg = 0;
  for (let i = 0; i < n; i++) {
    const predicted = intercept + slope * B[i];
    ssTotal += Math.pow(A[i] - meanA, 2);
    ssReg += Math.pow(predicted - meanA, 2);
  }
  console.log("[Worker] SS Total:", ssTotal, "SS Regression:", ssReg);
  const rSquared = ssReg / ssTotal;
  console.log("[Worker] R Squared:", rSquared);

  // Hitung error sum of squares (SS_error) dan Mean Square Error (MSE)
  const ssError = ssTotal - ssReg;
  const df1 = 1; // derajat kebebasan untuk prediktor
  const df2 = n - 2; // derajat kebebasan error
  const mse = ssError / df2;
  console.log("[Worker] SS Error:", ssError, "MSE:", mse);

  // F Change statistic
  const fChange = (ssReg / df1) / mse;
  console.log("[Worker] F Change:", fChange);

  // ===============================================
  // Perhitungan p-value untuk distribusi-F
  // ===============================================

  // Fungsi log gamma (menggunakan aproksimasi Lanczos)
  function gammaln(x) {
    const cof = [
      76.18009172947146,
      -86.50532032941677,
      24.01409824083091,
      -1.231739572450155,
      0.1208650973866179e-2,
      -0.5395239384953e-5
    ];
    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    for (let j = 0; j < cof.length; j++) {
      y += 1;
      ser += cof[j] / y;
    }
    return -tmp + Math.log(2.5066282746310005 * ser / x);
  }

  // Fungsi untuk menghitung continued fraction dari incomplete beta function
  function betacf(x, a, b) {
    const MAX_ITER = 100;
    const EPS = 3e-7;
    let am = 1,
      bm = 1,
      az = 1;
    let qab = a + b,
      qap = a + 1,
      qam = a - 1;
    let bz = 1 - (qab * x) / qap;

    for (let m = 1; m <= MAX_ITER; m++) {
      let em = m;
      let tem = em + em;
      let d = (em * (b - m) * x) / ((qam + tem) * (a + tem));
      let ap = az + d * am;
      let bp = bz + d * bm;
      d = (-(a + em) * (qab + em) * x) / ((a + tem) * (qap + tem));
      let app = ap + d * az;
      let bpp = bp + d * bz;
      let aold = az;
      am = ap / bpp;
      bm = bp / bpp;
      az = app / bpp;
      bz = 1;
      if (Math.abs(az - aold) < EPS * Math.abs(az)) {
        return az;
      }
    }
    return az; // jika tidak konvergen, kembalikan nilai terakhir
  }

  // Fungsi untuk incomplete beta terregulerisasi, I_x(a, b)
  function betai(x, a, b) {
    if (x < 0 || x > 1) {
      throw new Error("x harus berada di antara 0 dan 1");
    }
    // Kasus khusus
    if (x === 0 || x === 1) return x;

    const bt = Math.exp(
      gammaln(a + b) - gammaln(a) - gammaln(b) + a * Math.log(x) + b * Math.log(1 - x)
    );
    if (x < (a + 1) / (a + b + 2)) {
      return (bt * betacf(x, a, b)) / a;
    } else {
      return 1 - (bt * betacf(1 - x, b, a)) / b;
    }
  }

  // Fungsi untuk menghitung p-value dari distribusi-F
  // Dengan F ~ F(df1, df2), p-value = 1 - I_x(df1/2, df2/2)
  // dimana x = (df1 * F) / (df1 * F + df2)
  function fPvalue(f, d1, d2) {
    if (f < 0) return 1;
    const x = (d1 * f) / (d1 * f + d2);
    const incBeta = betai(x, d1 / 2, d2 / 2);
    return 1 - incBeta;
  }

  const sigFChange = fPvalue(fChange, df1, df2);
  console.log("[Worker] Sig. F Change:", sigFChange);

  // Format nilai R Square Change (.058a)
  const rSquareChange = rSquared.toFixed(3).replace(/^0/, "") + "a";
  const fChangeRounded = parseFloat(fChange.toFixed(3));
  const sigFChangeRounded = parseFloat(sigFChange.toFixed(3));

  // Susun output JSON sesuai format yang diinginkan
  const result = {
    tables: [
      {
        title: "Model Summary",
        columnHeaders: [
          { header: "Model" },
          {
            header: "Change Statistics",
            children: [
              { header: "R Square Change", "key": "rSquareChange"},
              { header: "F Change", key: "fChange" },
              { header: "df1", key: "df1" },
              { header: "df2", key: "df2" },
              { header: "Sig. F Change", key: "sigFChange" }
            ]
          }
        ],
        rows: [
          {
            rowHeader: ["1"],
            rSquareChange: rSquareChange,
            fChange: fChangeRounded,
            df1: df1,
            df2: df2,
            sigFChange: sigFChangeRounded
          }
        ],
        footnotes: ["a. Predictors: (Constant), VAR00002"]
      }
    ]
  };

  console.log("[Worker] Hasil perhitungan:", result);
  // Kirim hasil perhitungan kembali ke thread utama
  postMessage(result);
};

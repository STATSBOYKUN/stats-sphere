// rsquare.js

self.onmessage = function (event) {
  console.log("[Worker] Data diterima:", event.data);
  const { dependent, independent } = event.data;

  // Validasi input
  if (!Array.isArray(dependent)) {
    console.error("[Worker] Error: Parameter 'dependent' harus berupa array.");
    postMessage({ error: "Parameter 'dependent' harus berupa array." });
    return;
  }

  // Periksa apakah independent adalah array of arrays
  const isArrayOfArrays = Array.isArray(independent) &&
      (independent.length === 0 || Array.isArray(independent[0]));

  let independentData;
  if (isArrayOfArrays) {
    independentData = independent;
  } else if (Array.isArray(independent)) {
    independentData = [independent]; // Konversi ke array of arrays
  } else {
    console.error("[Worker] Error: Parameter 'independent' harus berupa array atau array of arrays.");
    postMessage({ error: "Parameter 'independent' harus berupa array atau array of arrays." });
    return;
  }

  const n = dependent.length;
  const k = independentData.length; // Jumlah variabel independen

  // Validasi semua array memiliki panjang yang sama
  if (independentData.some(arr => arr.length !== n)) {
    console.error("[Worker] Error: Semua array independen harus memiliki panjang yang sama dengan dependent.");
    postMessage({ error: "Semua array independen harus memiliki panjang yang sama dengan dependent." });
    return;
  }

  // Fungsi helper untuk operasi matriks
  function transpose(matrix) {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const result = Array(cols).fill().map(() => Array(rows).fill(0));

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        result[j][i] = matrix[i][j];
      }
    }

    return result;
  }

  function multiplyMatrices(a, b) {
    const aRows = a.length;
    const aCols = a[0].length;
    const bCols = b[0].length;
    const result = Array(aRows).fill().map(() => Array(bCols).fill(0));

    for (let i = 0; i < aRows; i++) {
      for (let j = 0; j < bCols; j++) {
        for (let m = 0; m < aCols; m++) {
          result[i][j] += a[i][m] * b[m][j];
        }
      }
    }

    return result;
  }

  function inverse(matrix) {
    const n = matrix.length;
    const augmented = Array(n).fill().map(() => Array(2 * n).fill(0));

    // Buat matriks augmented [A|I]
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        augmented[i][j] = matrix[i][j];
      }
      augmented[i][i + n] = 1;
    }

    // Eliminasi Gaussian
    for (let i = 0; i < n; i++) {
      // Cari pivot
      let maxRow = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(augmented[j][i]) > Math.abs(augmented[maxRow][i])) {
          maxRow = j;
        }
      }

      // Tukar baris
      if (maxRow !== i) {
        [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];
      }

      // Periksa singularitas
      const pivot = augmented[i][i];
      if (Math.abs(pivot) < 1e-10) {
        throw new Error("Matriks singular, tidak dapat menghitung invers");
      }

      // Normalisasi baris pivot
      for (let j = i; j < 2 * n; j++) {
        augmented[i][j] /= pivot;
      }

      // Eliminasi baris lainnya
      for (let j = 0; j < n; j++) {
        if (j !== i) {
          const factor = augmented[j][i];
          for (let m = i; m < 2 * n; m++) {
            augmented[j][m] -= factor * augmented[i][m];
          }
        }
      }
    }

    // Ekstrak invers
    const result = Array(n).fill().map(() => Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        result[i][j] = augmented[i][j + n];
      }
    }

    return result;
  }

  // Bangun matriks desain X dengan kolom intercept
  const X = Array(n).fill().map(() => Array(k + 1).fill(0));
  for (let i = 0; i < n; i++) {
    X[i][0] = 1; // Intercept
    for (let j = 0; j < k; j++) {
      X[i][j + 1] = independentData[j][i];
    }
  }

  // Hitung rata-rata variabel dependen
  const meanY = dependent.reduce((acc, val) => acc + val, 0) / n;
  console.log("[Worker] Mean Y:", meanY);

  // Hitung koefisien regresi menggunakan β = (X'X)^(-1)X'y
  const X_transpose = transpose(X);
  const X_transpose_X = multiplyMatrices(X_transpose, X);
  const X_transpose_X_inverse = inverse(X_transpose_X);

  const y_column = dependent.map(val => [val]); // Konversi ke vektor kolom
  const X_transpose_y = multiplyMatrices(X_transpose, y_column);
  const beta = multiplyMatrices(X_transpose_X_inverse, X_transpose_y).map(row => row[0]);

  console.log("[Worker] Koefisien regresi:", beta);

  // Hitung nilai prediksi
  const predicted = Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    predicted[i] = beta[0]; // Intercept
    for (let j = 0; j < k; j++) {
      predicted[i] += beta[j + 1] * independentData[j][i];
    }
  }

  // Hitung SS_total dan SS_reg untuk perhitungan R²
  let ssTotal = 0,
      ssReg = 0;
  for (let i = 0; i < n; i++) {
    ssTotal += Math.pow(dependent[i] - meanY, 2);
    ssReg += Math.pow(predicted[i] - meanY, 2);
  }
  console.log("[Worker] SS Total:", ssTotal, "SS Regression:", ssReg);

  const rSquared = ssReg / ssTotal;
  console.log("[Worker] R Squared:", rSquared);

  // Hitung error sum of squares (SS_error) dan Mean Square Error (MSE)
  const ssError = ssTotal - ssReg;
  const df1 = k; // derajat kebebasan untuk prediktor (jumlah variabel independen)
  const df2 = n - k - 1; // derajat kebebasan error (n - k - 1 untuk multiple regression)
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

  // Buat catatan kaki untuk prediktor
  const predictorVariables = [];
  for (let i = k; i > 0; i--) {
    predictorVariables.push(`VAR0000${i+1}`);
  }
  const footnoteText = `a. Predictors: (Constant), ${predictorVariables.join(', ')}`;

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
        footnotes: [footnoteText]
      }
    ]
  };

  console.log("[Worker] Hasil perhitungan:", result);
  // Kirim hasil perhitungan kembali ke thread utama
  postMessage(result);
};
// collinearity_diagnostics.js

self.onmessage = function(e) {
    const { dependent, independent } = e.data;
    
    // Validasi input
    if (!dependent || !independent) {
      self.postMessage({ error: "Data dependent dan independent harus disediakan." });
      return;
    }
    if (!Array.isArray(dependent) || !Array.isArray(independent) || independent.length === 0) {
      self.postMessage({ error: "Pastikan data dalam format array (independent: array of arrays)." });
      return;
    }
    
    // Asumsi: independent disediakan sebagai array of arrays, dan kita gunakan variabel pertama (independent[0])
    const n = dependent.length; // jumlah data
    const X = [];
    for (let i = 0; i < n; i++) {
      // Matriks desain X dengan kolom konstan (1) dan variabel independen dari independent[0]
      X.push([1, independent[0][i]]);
    }
    
    // --- Langkah 1. Hitung standar deviasi tiap kolom
    const numCols = 2;
    let sumSq = Array(numCols).fill(0);
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < numCols; j++) {
        sumSq[j] += X[i][j] * X[i][j];
      }
    }
    const sd = sumSq.map(Math.sqrt); // Contoh: [√n, √(jumlah kuadrat variabel)]
    
    // --- Langkah 2. Hitung korelasi antara kolom 0 (konstan) dan kolom 1 (variabel independen)
    let cross = 0;
    for (let i = 0; i < n; i++) {
      cross += X[i][0] * X[i][1]; // Karena kolom konstan = 1, ini hanya menjumlahkan nilai variabel independen
    }
    const r = cross / (sd[0] * sd[1]);
    
    // Matriks korelasi 2x2 adalah:
    //   [1    r]
    //   [r    1]
    // Eigenvalue untuk matriks 2x2 simetris ini dapat dihitung langsung:
    const lambda1 = 1 + r;
    const lambda2 = 1 - r;
    
    // --- Langkah 3. Hitung Condition Index
    // Condition Index untuk tiap dimensi = sqrt(max_eigenvalue / eigenvalue_j)
    const maxLambda = lambda1; // Karena r positif, maka lambda1 > lambda2
    const condIndex1 = Math.sqrt(maxLambda / lambda1); // = 1
    const condIndex2 = Math.sqrt(maxLambda / lambda2);
    
    // --- Langkah 4. Dekomposisi Varians (Variance Proportions)
    // Untuk matriks korelasi 2x2, eigenvektor standar adalah:
    //   untuk λ₁: [1/√2, 1/√2]
    //   untuk λ₂: [1/√2, -1/√2]
    const v1 = [1 / Math.sqrt(2), 1 / Math.sqrt(2)];
    const v2 = [1 / Math.sqrt(2), -1 / Math.sqrt(2)];
    
    // Fungsi bantu untuk menghitung kontribusi: (v_ij)^2 / λ_j
    function contribution(v, lambda) {
      return (v * v) / lambda;
    }
    
    // Untuk variabel "Constant" (kolom 0)
    const contrConst = [
      contribution(v1[0], lambda1),
      contribution(v2[0], lambda2)
    ];
    const totalConst = contrConst[0] + contrConst[1];
    const propConst = contrConst.map(c => c / totalConst);
    
    // Untuk variabel "VAR00002" (kolom 1)
    const contrVar = [
      contribution(v1[1], lambda1),
      contribution(v2[1], lambda2)
    ];
    const totalVar = contrVar[0] + contrVar[1];
    const propVar = contrVar.map(c => c / totalVar);
    
    // --- Fungsi pembulatan
    function round3(val) {
      return Math.round(val * 1000) / 1000;
    }
    function round2(val) {
      return Math.round(val * 100) / 100;
    }
    
    // Bulatkan nilai sesuai format output
    const eigen1 = round3(lambda1);
    const eigen2 = round3(lambda2);
    const ci1 = round3(condIndex1);
    const ci2 = round3(condIndex2);
    const constDim1 = round2(propConst[0]);
    const constDim2 = round2(propConst[1]);
    const varDim1   = round2(propVar[0]);
    const varDim2   = round2(propVar[1]);
    
    // --- Langkah 5. Bangun objek JSON hasil sesuai spesifikasi
    const result = {
      tables: [
        {
          title: "Collinearity Diagnostics",
          columnHeaders: [
            { header: "Model" },
            { header: "Dimension" },
            { header: "Eigenvalue" },
            { header: "Condition Index" },
            {
              header: "Variance Proportions",
              children: [
                { header: "Constant", key: "constant" },
                { header: "VAR00002", key: "var00002" }
              ]
            }
          ],
          rows: [
            {
              rowHeader: ["1"],
              children: [
                {
                  rowHeader: [null, "1"],
                  "Eigenvalue": eigen1,
                  "Condition Index": ci1,
                  constant: constDim1,
                  var00002: varDim1
                },
                {
                  rowHeader: [null, "2"],
                  "Eigenvalue": eigen2,
                  "Condition Index": ci2,
                  constant: constDim2,
                  var00002: varDim2
                }
              ]
            }
          ]
        }
      ]
    };
    
    // Kirim hasil kembali ke main thread
    self.postMessage(result);
  };
  
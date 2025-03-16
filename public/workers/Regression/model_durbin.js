// model_durbin.js

self.onmessage = function (e) {
    const { dependent, independent } = e.data;

    // Validasi input
    if (!dependent || !independent) {
        self.postMessage({ error: "Data dependent dan independent harus disediakan." });
        return;
    }
    if (!Array.isArray(dependent)) {
        self.postMessage({ error: "Data dependent harus berupa array." });
        return;
    }

    // Periksa apakah independent adalah array of arrays
    const isArrayOfArrays = Array.isArray(independent) &&
        Array.isArray(independent[0]);

    // Tangani kasus array tunggal dan array of arrays
    let X;
    if (isArrayOfArrays) {
        X = independent;
    } else if (Array.isArray(independent)) {
        X = [independent]; // Konversi array tunggal ke array of arrays
    } else {
        self.postMessage({ error: "Data independent harus berupa array atau array of arrays." });
        return;
    }

    // Validasi bahwa semua array dalam X memiliki panjang yang sama dengan dependent
    if (X.some(indVar => indVar.length !== dependent.length)) {
        self.postMessage({ error: "Panjang semua array independent harus sama dengan dependent." });
        return;
    }

    // Data: y (dependent) dan X (independent)
    const y = dependent;
    const n = y.length;     // Jumlah observasi
    const k = X.length;     // Jumlah prediktor (variabel independen)

    // Fungsi untuk transpose matriks
    const transpose = matrix => {
        const rows = matrix.length;
        const cols = matrix[0].length;
        const result = new Array(cols);
        for (let i = 0; i < cols; i++) {
            result[i] = new Array(rows);
            for (let j = 0; j < rows; j++) {
                result[i][j] = matrix[j][i];
            }
        }
        return result;
    };

    // Buat matriks desain X dengan kolom intercept
    const X_design = new Array(n);
    for (let i = 0; i < n; i++) {
        X_design[i] = [1]; // Tambah intercept
        for (let j = 0; j < k; j++) {
            X_design[i].push(X[j][i]);
        }
    }

    // Hitung X'X
    const X_transpose = transpose(X_design);
    const X_transpose_X = new Array(k + 1);
    for (let i = 0; i < k + 1; i++) {
        X_transpose_X[i] = new Array(k + 1);
        for (let j = 0; j < k + 1; j++) {
            let sum = 0;
            for (let l = 0; l < n; l++) {
                sum += X_transpose[i][l] * X_design[l][j];
            }
            X_transpose_X[i][j] = sum;
        }
    }

    // Fungsi untuk menghitung invers matriks menggunakan eliminasi Gaussian
    const inverse = (matrix) => {
        const n = matrix.length;
        const augmented = new Array(n);

        // Buat matriks augmented [A|I]
        for (let i = 0; i < n; i++) {
            augmented[i] = new Array(2 * n);
            for (let j = 0; j < n; j++) {
                augmented[i][j] = matrix[i][j];
            }
            for (let j = n; j < 2 * n; j++) {
                augmented[i][j] = (j - n === i) ? 1 : 0;
            }
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
            if (Math.abs(augmented[i][i]) < 1e-10) {
                throw new Error("Matrix is singular, cannot calculate inverse");
            }

            // Skala baris pivot
            const pivot = augmented[i][i];
            for (let j = i; j < 2 * n; j++) {
                augmented[i][j] /= pivot;
            }

            // Eliminasi baris lainnya
            for (let j = 0; j < n; j++) {
                if (j !== i) {
                    const factor = augmented[j][i];
                    for (let k = i; k < 2 * n; k++) {
                        augmented[j][k] -= factor * augmented[i][k];
                    }
                }
            }
        }

        // Ekstrak invers dari matriks augmented
        const inverse = new Array(n);
        for (let i = 0; i < n; i++) {
            inverse[i] = new Array(n);
            for (let j = 0; j < n; j++) {
                inverse[i][j] = augmented[i][j + n];
            }
        }

        return inverse;
    };

    // Hitung (X'X)^-1
    let X_transpose_X_inverse;
    try {
        X_transpose_X_inverse = inverse(X_transpose_X);
    } catch (error) {
        self.postMessage({ error: "Error: " + error.message });
        return;
    }

    // Hitung X'y
    const X_transpose_y = new Array(k + 1);
    for (let i = 0; i < k + 1; i++) {
        let sum = 0;
        for (let j = 0; j < n; j++) {
            sum += X_transpose[i][j] * y[j];
        }
        X_transpose_y[i] = sum;
    }

    // Hitung koefisien β = (X'X)^-1 X'y
    const coef = new Array(k + 1);
    for (let i = 0; i < k + 1; i++) {
        coef[i] = 0;
        for (let j = 0; j < k + 1; j++) {
            coef[i] += X_transpose_X_inverse[i][j] * X_transpose_y[j];
        }
    }

    // Ekstrak intercept dan slopes
    const intercept = coef[0];
    const slopes = coef.slice(1);

    // Hitung nilai prediksi
    const yPred = new Array(n);
    for (let i = 0; i < n; i++) {
        yPred[i] = intercept;
        for (let j = 0; j < k; j++) {
            yPred[i] += slopes[j] * X[j][i];
        }
    }

    // Hitung residual
    const residuals = y.map((yi, i) => yi - yPred[i]);

    // Hitung rata-rata y
    const meanY = y.reduce((a, b) => a + b, 0) / n;

    // Hitung SSE dan SST
    const SSE = residuals.reduce((sum, e) => sum + e * e, 0);
    const SST = y.reduce((sum, yi) => sum + Math.pow(yi - meanY, 2), 0);

    // Hitung R Square
    const rSquare = 1 - SSE / SST;

    // Hitung Multiple Correlation Coefficient (R)
    const r = Math.sqrt(rSquare);

    // Hitung Adjusted R Square
    const adjustedRSquare = 1 - ((n - 1) / (n - k - 1)) * (1 - rSquare);

    // Hitung Standard Error of the Estimate
    const stdErrorEstimate = Math.sqrt(SSE / (n - k - 1));

    // Hitung statistik Durbin-Watson
    let dwSum = 0;
    for (let i = 1; i < n; i++) {
        const diff = residuals[i] - residuals[i - 1];
        dwSum += diff * diff;
    }
    const durbinWatson = dwSum / SSE;

    // Fungsi pembulatan
    const round = (val, decimals = 3) => Number(val.toFixed(decimals));

    // Bangun objek JSON hasil sesuai struktur yang diminta
    const result = {
        tables: [
            {
                title: "Model Summary",
                columnHeaders: [
                    { header: "Model" },
                    { header: "R", key: "r" },
                    { header: "R Square", key: "rSquare" },
                    { header: "Adjusted R Square", key: "adjustedRSquare" },
                    { header: "Std. Error of the Estimate", key: "stdErrorEstimate" },
                    { header: "Durbin-Watson", key: "durbinWatson" }
                ],
                rows: [
                    {
                        rowHeader: ["1"],
                        r: round(r, 3),
                        rSquare: round(rSquare, 3),
                        adjustedRSquare: round(adjustedRSquare, 3),
                        stdErrorEstimate: round(stdErrorEstimate, 5),
                        durbinWatson: round(durbinWatson, 3)
                    }
                ]
            }
        ]
    };

    self.postMessage(result);
};
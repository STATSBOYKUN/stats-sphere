// collinearity_diagnostics.js

self.onmessage = function(e) {
    const { dependent, independent } = e.data;

    // Validasi input
    if (!dependent || !independent) {
        self.postMessage({ error: "Data dependent dan independent harus disediakan." });
        return;
    }

    // Periksa apakah independent adalah array of arrays
    const isArrayOfArrays = Array.isArray(independent) &&
        (independent.length === 0 || Array.isArray(independent[0]));

    let independentData;
    if (isArrayOfArrays) {
        independentData = independent;
    } else if (Array.isArray(independent)) {
        independentData = [independent]; // Konversi array tunggal ke array of arrays
    } else {
        self.postMessage({ error: "Data independent harus berupa array atau array of arrays." });
        return;
    }

    // Validasi panjang data
    const n = dependent.length; // jumlah data
    if (independentData.some(indVar => indVar.length !== n)) {
        self.postMessage({ error: "Panjang semua array independent harus sama dengan dependent." });
        return;
    }

    const k = independentData.length; // jumlah variabel independen

    // --- Bangun matriks desain X dengan kolom konstan (1) dan semua variabel independen
    const X = [];
    for (let i = 0; i < n; i++) {
        const row = [1]; // Kolom pertama adalah konstanta 1
        for (let j = 0; j < k; j++) {
            row.push(independentData[j][i]);
        }
        X.push(row);
    }

    const numCols = k + 1; // +1 untuk kolom konstanta

    // --- Langkah 1. Standardisasi data - hitung mean dan sd untuk setiap kolom
    const means = Array(numCols).fill(0);
    const sds = Array(numCols).fill(0);

    // Konstanta (kolom 0) memiliki mean=1 dan sd=0
    for (let j = 1; j < numCols; j++) {
        // Hitung mean
        for (let i = 0; i < n; i++) {
            means[j] += X[i][j];
        }
        means[j] /= n;

        // Hitung standar deviasi
        for (let i = 0; i < n; i++) {
            sds[j] += Math.pow(X[i][j] - means[j], 2);
        }
        sds[j] = Math.sqrt(sds[j] / (n - 1));
    }

    // Standar deviasi khusus untuk konstanta
    sds[0] = Math.sqrt(n);

    // --- Langkah 2. Hitung matriks korelasi
    const correlationMatrix = Array(numCols).fill().map(() => Array(numCols).fill(0));

    // Diagonal adalah 1
    for (let i = 0; i < numCols; i++) {
        correlationMatrix[i][i] = 1;
    }

    // Hitung korelasi antar kolom
    for (let i = 0; i < numCols; i++) {
        for (let j = i + 1; j < numCols; j++) {
            let sum = 0;
            if (i === 0) {
                // Korelasi antara konstanta dan variabel
                for (let r = 0; r < n; r++) {
                    sum += X[r][j];
                }
                correlationMatrix[i][j] = sum / (n * sds[j]);
            } else {
                // Korelasi antar variabel
                for (let r = 0; r < n; r++) {
                    sum += (X[r][i] - means[i]) * (X[r][j] - means[j]);
                }
                correlationMatrix[i][j] = sum / ((n - 1) * sds[i] * sds[j]);
            }

            // Matriks korelasi simetris
            correlationMatrix[j][i] = correlationMatrix[i][j];
        }
    }

    // --- Langkah 3. Hitung eigenvalues dan eigenvectors matriks korelasi
    // Implementasi algoritma Jacobi untuk matriks simetris
    function computeEigenDecomposition(matrix) {
        const n = matrix.length;

        // Buat salinan matriks
        const mat = Array(n).fill().map((_, i) => Array(n).fill().map((_, j) => matrix[i][j]));

        // Inisialisasi eigenvectors sebagai matriks identitas
        const V = Array(n).fill().map((_, i) => Array(n).fill().map((_, j) => i === j ? 1 : 0));

        const maxRotations = 100;
        const threshold = 1e-10;

        for (let iter = 0; iter < maxRotations; iter++) {
            // Cari elemen terbesar off-diagonal
            let maxOffDiag = 0;
            let p = 0, q = 1;

            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    if (Math.abs(mat[i][j]) > maxOffDiag) {
                        maxOffDiag = Math.abs(mat[i][j]);
                        p = i;
                        q = j;
                    }
                }
            }

            // Jika semua elemen off-diagonal mendekati nol, berhenti
            if (maxOffDiag < threshold) {
                break;
            }

            // Compute rotation parameters
            let theta, t, c, s;
            if (Math.abs(mat[p][p] - mat[q][q]) < threshold) {
                theta = Math.PI / 4;
            } else {
                theta = 0.5 * Math.atan2(2 * mat[p][q], mat[p][p] - mat[q][q]);
            }

            c = Math.cos(theta);
            s = Math.sin(theta);

            // Update matriks dengan rotasi
            const matpp = mat[p][p];
            const matqq = mat[q][q];
            const matpq = mat[p][q];

            mat[p][p] = matpp * c * c + matqq * s * s + 2 * matpq * c * s;
            mat[q][q] = matpp * s * s + matqq * c * c - 2 * matpq * c * s;
            mat[p][q] = 0;
            mat[q][p] = 0;

            for (let i = 0; i < n; i++) {
                if (i !== p && i !== q) {
                    const matpi = mat[p][i];
                    const matqi = mat[q][i];
                    mat[p][i] = c * matpi + s * matqi;
                    mat[i][p] = mat[p][i];
                    mat[q][i] = -s * matpi + c * matqi;
                    mat[i][q] = mat[q][i];
                }
            }

            // Update eigenvectors
            for (let i = 0; i < n; i++) {
                const Vip = V[i][p];
                const Viq = V[i][q];
                V[i][p] = c * Vip + s * Viq;
                V[i][q] = -s * Vip + c * Viq;
            }
        }

        // Ekstrak eigenvalues dari diagonal matriks
        const eigenvalues = Array(n).fill().map((_, i) => mat[i][i]);

        // Transpose eigenvectors untuk format yang benar
        const eigenvectors = Array(n).fill().map((_, i) => Array(n).fill().map((_, j) => V[j][i]));

        return { eigenvalues, eigenvectors };
    }

    // Hitung eigendecomposition
    const { eigenvalues, eigenvectors } = computeEigenDecomposition(correlationMatrix);

    // --- Langkah 4. Urutkan eigenvalues dan eigenvectors (descending)
    const indices = eigenvalues.map((_, i) => i);
    indices.sort((a, b) => eigenvalues[b] - eigenvalues[a]);

    const sortedEigenvalues = indices.map(i => eigenvalues[i]);
    const sortedEigenvectors = indices.map(i => eigenvectors[i]);

    // --- Langkah 5. Hitung Condition Index
    const maxEigenvalue = sortedEigenvalues[0];
    const conditionIndices = sortedEigenvalues.map(lambda =>
        Math.sqrt(maxEigenvalue / Math.max(lambda, 1e-10))
    );

    // --- Langkah 6. Hitung Variance Proportions
    const varianceProportions = Array(numCols).fill().map(() => Array(numCols).fill(0));

    for (let j = 0; j < numCols; j++) {
        // Hitung phi untuk variabel j
        const phi = sortedEigenvectors.map((evec, i) =>
            (evec[j] * evec[j]) / sortedEigenvalues[i]
        );

        // Total phi untuk normalisasi
        const totalPhi = phi.reduce((sum, val) => sum + val, 0);

        // Proporsi varians untuk setiap dimensi
        for (let i = 0; i < numCols; i++) {
            varianceProportions[j][i] = phi[i] / totalPhi;
        }
    }

    // --- Fungsi pembulatan
    function round3(val) {
        return Math.round(val * 1000) / 1000;
    }
    function round2(val) {
        return Math.round(val * 100) / 100;
    }

    // --- Persiapkan output JSON

    // Header untuk Variance Proportions
    const varianceChildren = [
        { header: "Constant", key: "constant" }
    ];

    for (let i = 0; i < k; i++) {
        varianceChildren.push({
            header: `VAR0000${i+2}`, // VAR00002, VAR00003, dst.
            key: `var0000${i+2}`
        });
    }

    // Baris untuk tiap dimensi
    const dimensionRows = [];
    for (let i = 0; i < numCols; i++) {
        const rowData = {
            rowHeader: [null, `${i+1}`],
            "Eigenvalue": round3(sortedEigenvalues[i]),
            "Condition Index": round3(conditionIndices[i])
        };

        // Tambahkan Variance Proportions
        rowData.constant = round2(varianceProportions[0][i]);
        for (let j = 0; j < k; j++) {
            rowData[`var0000${j+2}`] = round2(varianceProportions[j+1][i]);
        }

        dimensionRows.push(rowData);
    }

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
                        children: varianceChildren
                    }
                ],
                rows: [
                    {
                        rowHeader: ["1"],
                        children: dimensionRows
                    }
                ]
            }
        ]
    };

    // Kirim hasil kembali ke main thread
    self.postMessage(result);
};
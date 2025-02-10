self.onmessage = (e) => {
    const { action, data, variables } = e.data;
    let result = { success: true, error: null, anova: null };
    try {
        if (action === 'REGRESSION') {
            const anova = performRegression(data, variables);
            result.anova = anova;
        }
        self.postMessage(result);
    } catch (err) {
        self.postMessage({ success: false, error: err.message });
    }
};
self.addEventListener('error', (e) => {
    self.postMessage({ success: false, error: e.message });
});
function performRegression(data, variables) {
    const dependent = variables.find(v => v.role === 'dependent').name;
    const independents = variables.filter(v => v.role === 'independent').map(v => v.name);
    const n = data.length;
    const X = data.map(row => [1, ...independents.map(v => parseFloat(row[v]))]);
    const Y = data.map(row => parseFloat(row[dependent]));
    const Xt = transpose(X);
    const XtX = multiplyMatrices(Xt, X);
    const XtY = multiplyMatrixVector(Xt, Y);
    const beta = gaussianElimination(XtX, XtY);
    const Y_pred = X.map(row => beta.reduce((sum, b, i) => sum + b * row[i], 0));
    const residuals = Y.map((y, i) => y - Y_pred[i]);
    const SST = Y.reduce((sum, y) => sum + Math.pow(y - mean(Y), 2), 0);
    const SSR = Y_pred.reduce((sum, yHat) => sum + Math.pow(yHat - mean(Y), 2), 0);
    const SSE = residuals.reduce((sum, e) => sum + Math.pow(e, 2), 0);
    const dfModel = independents.length;
    const dfResidual = n - independents.length - 1;
    const dfTotal = n - 1;
    const MSR = SSR / dfModel;
    const MSE = SSE / dfResidual;
    const F = MSR / MSE;
    const anova = {
        tables: [
            {
                title: "ANOVA",
                columnHeaders: [
                    { header: "Model" },
                    { header: "" },
                    { header: "Sum of Squares" },
                    { header: "df" },
                    { header: "Mean Square" },
                    { header: "F" },
                    { header: "Sig" }
                ],
                rows: [
                    {
                        rowHeader: ["1"],
                        children: [
                            {
                                rowHeader: [null, "Regression"],
                                "Sum of Squares": round(SSR, 3),
                                "df": dfModel,
                                "Mean Square": round(MSR, 3),
                                "F": round(F, 3),
                                "Sig": calculatePValue(F, dfModel, dfResidual)
                            },
                            {
                                rowHeader: [null, "Residual"],
                                "Sum of Squares": round(SSE, 3),
                                "df": dfResidual,
                                "Mean Square": round(MSE, 3),
                                "F": "",
                                "Sig": ""
                            },
                            {
                                rowHeader: [null, "Total"],
                                "Sum of Squares": round(SST, 3),
                                "df": dfTotal,
                                "Mean Square": "",
                                "F": "",
                                "Sig": ""
                            }
                        ]
                    }
                ]
            }
        ]
    };
    return anova;
}
function mean(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}
function transpose(matrix) {
    return matrix[0].map((_, colIndex) => matrix.map(row => row[colIndex]));
}
function multiplyMatrices(a, b) {
    const result = [];
    for (let i = 0; i < a.length; i++) {
        result[i] = [];
        for (let j = 0; j < b[0].length; j++) {
            let sum = 0;
            for (let k = 0; k < a[0].length; k++) {
                sum += a[i][k] * b[k][j];
            }
            result[i][j] = sum;
        }
    }
    return result;
}
function multiplyMatrixVector(matrix, vector) {
    return matrix.map(row => row.reduce((sum, val, idx) => sum + val * vector[idx], 0));
}
function gaussianElimination(a, b) {
    const n = a.length;
    for (let i = 0; i < n; i++) {
        let max = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(a[j][i]) > Math.abs(a[max][i])) {
                max = j;
            }
        }
        [a[i], a[max]] = [a[max], a[i]];
        [b[i], b[max]] = [b[max], b[i]];
        for (let j = i + 1; j < n; j++) {
            const factor = a[j][i] / a[i][i];
            for (let k = i; k < n; k++) {
                a[j][k] -= factor * a[i][k];
            }
            b[j] -= factor * b[i];
        }
    }
    const x = Array(n).fill(0);
    for (let i = n - 1; i >= 0; i--) {
        let sum = b[i];
        for (let j = i + 1; j < n; j++) {
            sum -= a[i][j] * x[j];
        }
        x[i] = sum / a[i][i];
    }
    return x;
}
function round(num, decimals) {
    return Number(Math.round(num + 'e' + decimals) + 'e-' + decimals);
}
function calculatePValue(F, df1, df2) {
    return round(1 - fisherCdf(F, df1, df2), 3);
}
function fisherCdf(x, d1, d2) {
    if (x < 0) return 0;
    let a = d1 / 2;
    let b = d2 / 2;
    let betafunc = incompleteBeta(d1 * x / (d1 * x + d2), a, b);
    return betafunc;
}
function incompleteBeta(x, a, b) {
    let bt;
    if (x === 0 || x === 1) {
        bt = 0;
    } else {
        bt = Math.exp(gammaLn(a + b) - gammaLn(a) - gammaLn(b) + a * Math.log(x) + b * Math.log(1 - x));
    }
    if (x < (a + 1) / (a + b + 2)) {
        return bt * betaSeries(x, a, b) / a;
    } else {
        return 1 - bt * betaSeries(1 - x, b, a) / b;
    }
}
function betaSeries(x, a, b) {
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 100; n++) {
        term *= (a + n) * (b - n + 1) * x / ((a + n) * (1 + n));
        sum += term;
        if (Math.abs(term) < 1e-15) break;
    }
    return sum;
}
function gammaLn(z) {
    let x = z;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;
    ser += 76.18009172947146 / (x + 1);
    ser += -86.50532032941677 / (x + 2);
    ser += 24.01409824083091 / (x + 3);
    ser += -1.231739572450155 / (x + 4);
    ser += 0.00120858003 / (x + 5);
    ser += -0.00000536382 / (x + 6);
    return -tmp + Math.log(2.5066282746310005 * ser / x);
}

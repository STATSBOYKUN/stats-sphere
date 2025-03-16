self.onmessage = function(e) {
    const { independent, dependent } = e.data;

    if (!independent || !dependent) {
        self.postMessage({ error: "Kedua array independent dan dependent harus disediakan." });
        return;
    }

    if (!Array.isArray(independent) || !Array.isArray(dependent)) {
        self.postMessage({ error: "Independent dan dependent harus berupa array." });
        return;
    }

    const n = dependent.length;
    const numIndependentVars = independent.length;

    const rows = [];
    const children = [];

    for (let varIndex = 0; varIndex < numIndependentVars; varIndex++) {
        const currentIndependent = independent[varIndex];

        if (currentIndependent.length !== n) {
            self.postMessage({ error: `Variabel independent ke-${varIndex+1} harus memiliki panjang yang sama dengan dependent.` });
            return;
        }

        const meanY = dependent.reduce((sum, val) => sum + val, 0) / n;
        const meanX = currentIndependent.reduce((sum, val) => sum + val, 0) / n;

        let Sxx = 0, Sxy = 0;
        for (let i = 0; i < n; i++) {
            Sxx += Math.pow(currentIndependent[i] - meanX, 2);
            Sxy += (currentIndependent[i] - meanX) * (dependent[i] - meanY);
        }

        const slope = Sxy / Sxx;
        const intercept = meanY - slope * meanX;

        let rss = 0;
        for (let i = 0; i < n; i++) {
            const predicted = intercept + slope * currentIndependent[i];
            rss += Math.pow(dependent[i] - predicted, 2);
        }

        const df = n - 2;
        const sigma2 = rss / df;

        const seSlope = Math.sqrt(sigma2 / Sxx);
        const seIntercept = Math.sqrt(sigma2 * (1 / n + Math.pow(meanX, 2) / Sxx));

        const tCrit = 2.447;

        const interceptLower = parseFloat((intercept - tCrit * seIntercept).toFixed(3));
        const interceptUpper = parseFloat((intercept + tCrit * seIntercept).toFixed(3));
        const slopeLower = parseFloat((slope - tCrit * seSlope).toFixed(3));
        const slopeUpper = parseFloat((slope + tCrit * seSlope).toFixed(3));

        if (varIndex === 0) {
            children.push({
                rowHeader: [null, "(Constant)"],
                lowerBound: interceptLower,
                upperBound: interceptUpper
            });
        }

        children.push({
            rowHeader: [null, `VAR0000${varIndex+2}`],
            lowerBound: slopeLower,
            upperBound: slopeUpper
        });
    }

    rows.push({
        rowHeader: ["1"],
        children: children
    });

    const result = {
        tables: [
            {
                title: "Coefficients",
                columnHeaders: [
                    { header: "Model" },
                    { header: "" },
                    {
                        header: "95% Confidence Interval for B",
                        children: [
                            { header: "Lower Bound", key: "lowerBound" },
                            { header: "Upper Bound", key: "upperBound" }
                        ]
                    }
                ],
                rows: rows
            }
        ]
    };

    self.postMessage(result);
};
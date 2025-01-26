/* Fungsi-fungsi untuk Descriptive Stats */
function formatDescriptiveStats(data, variables) {
    if (!data.length) {
        return { tables: [{ title: 'Descriptive Statistics', columnHeaders: [], rows: [] }] };
    }
    const desc = calculateDescriptive(data, variables);
    return {
        tables: [
            {
                title: 'Descriptive Statistics',
                columnHeaders: [{ header: "" }, { header: "" }, ...variables.map(v => ({ header: v.name }))],
                rows: desc.rows,
            },
        ],
    };
}

function calculateDescriptive(data, variables) {
    const sum = summarizeAll(data, variables);
    const rows = buildDescriptiveRows(variables, sum);
    return { rows };
}

function buildDescriptiveRows(variables, sum) {
    const rows = [
        {
            rowHeader: ['N'],
            children: [
                {
                    rowHeader: [null, 'Valid'],
                    ...variables.reduce((acc, v) => {
                        acc[v.name] = sum.valid[v.name] || 0;
                        return acc;
                    }, {}),
                },
                {
                    rowHeader: [null, 'Missing'],
                    ...variables.reduce((acc, v) => {
                        acc[v.name] = sum.missing[v.name] || 0;
                        return acc;
                    }, {}),
                },
            ],
        },
        ...[
            'Mean',
            'Std. Error of Mean',
            'Median',
            'Mode',
            'Std. Deviation',
            'Variance',
            'Skewness',
            'Std. Error of Skewness',
            'Kurtosis',
            'Std. Error of Kurtosis',
            'Range',
            'Minimum',
            'Maximum',
            'Sum',
        ].map((k) => {
            const r = { rowHeader: [k] };
            variables.forEach((variable) => {
                r[variable.name] = sum[k]?.[variable.name] ?? null;
            });
            return r;
        }),
        {
            rowHeader: ['Percentiles'],
            children: buildPercentiles(variables, sum.Percentiles),
        },
    ];
    return rows;
}

function buildPercentiles(variables, pObj) {
    const ps = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
    return ps.map((x) => {
        const r = { rowHeader: [null, x.toString()] };
        variables.forEach((v) => {
            r[v.name] = pObj[v.name]?.[x] ?? null;
        });
        return r;
    });
}

function summarizeAll(data, variables) {
    const res = {
        valid: {}, missing: {},
        Mean: {}, 'Std. Error of Mean': {}, Median: {}, Mode: {},
        'Std. Deviation': {}, Variance: {}, Skewness: {}, 'Std. Error of Skewness': {},
        Kurtosis: {}, 'Std. Error of Kurtosis': {}, Range: {}, Minimum: {}, Maximum: {}, Sum: {},
        Percentiles: {},
    };
    variables.forEach((variable) => {
        let col = data.map((d) => d[variable.name]);
        switch ((variable.type || '').toLowerCase()) {
            case 'numeric': {
                const numericArr = col.filter((x) => x !== null && x !== '' && x !== undefined).map(Number);
                const validN = numericArr.length;
                res.valid[variable.name] = validN;
                res.missing[variable.name] = data.length - validN;
                if (!validN) {
                    [
                        'Mean','Std. Error of Mean','Median','Mode','Std. Deviation','Variance',
                        'Skewness','Std. Error of Skewness','Kurtosis','Std. Error of Kurtosis',
                        'Range','Minimum','Maximum','Sum',
                    ].forEach((k) => (res[k][variable.name] = null));
                    res.Percentiles[variable.name] = {};
                } else {
                    const stats = calcNumeric(numericArr);
                    [
                        'Mean','Std. Error of Mean','Median','Mode','Std. Deviation','Variance',
                        'Skewness','Std. Error of Skewness','Kurtosis','Std. Error of Kurtosis',
                        'Range','Minimum','Maximum','Sum',
                    ].forEach((k) => {
                        res[k][variable.name] = stats[k];
                    });
                    res.Percentiles[variable.name] = {};
                    stats.Percentiles.forEach((p) => {
                        res.Percentiles[variable.name][p.percentile] = p.value;
                    });
                }
                break;
            }
            case 'string':
            case 'date':
            default: {
                const arrStr = col.map((x) => (x == null ? '' : x));
                const valN = arrStr.length;
                res.valid[variable.name] = valN;
                res.missing[variable.name] = 0;
                const md = mode(arrStr);
                [
                    'Mean','Std. Error of Mean','Median','Std. Deviation','Variance','Skewness',
                    'Std. Error of Skewness','Kurtosis','Std. Error of Kurtosis','Range',
                    'Minimum','Maximum','Sum',
                ].forEach((k) => (res[k][variable.name] = null));
                res.Mode[variable.name] = md || null;
                res.Percentiles[variable.name] = {};
                break;
            }
        }
    });
    return res;
}

function calcNumeric(arr) {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
    const md = mode(arr);
    const var_ = arr.length > 1
        ? arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (arr.length - 1)
        : null;
    const std = var_ === null ? null : Math.sqrt(var_);
    let skew = null, kurt = null;
    if (std !== null && arr.length >= 3) {
        const num = arr.reduce((a, b) => a + (b - mean) ** 3, 0);
        skew = (arr.length * num) / ((arr.length - 1) * (arr.length - 2) * std ** 3);
    }
    if (std !== null && arr.length >= 4) {
        const num = arr.reduce((a, b) => a + (b - mean) ** 4, 0);
        kurt = (arr.length * (arr.length + 1) * num) /
            ((arr.length - 1) * (arr.length - 2) * (arr.length - 3) * std ** 4) -
            (3 * (arr.length - 1) ** 2) / ((arr.length - 2) * (arr.length - 3));
    }
    const sem = std === null ? null : std / Math.sqrt(arr.length);
    const rng = Math.max(...arr) - Math.min(...arr);
    const s = arr.reduce((a, b) => a + b, 0);
    const pList = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90].map((x) => ({
        percentile: x,
        value: +percentile(sorted, x).toFixed(1),
    }));
    return {
        Mean: mean ? +mean.toFixed(3) : null,
        'Std. Error of Mean': sem ? +sem.toFixed(3) : null,
        Median: median,
        Mode: md || null,
        'Std. Deviation': std !== null ? +std.toFixed(3) : null,
        Variance: var_ !== null ? +var_.toFixed(3) : null,
        Skewness: skew !== null ? +skew.toFixed(3) : null,
        'Std. Error of Skewness': std !== null ? stdErrorSkew(arr.length) : null,
        Kurtosis: kurt !== null ? +kurt.toFixed(3) : null,
        'Std. Error of Kurtosis': std !== null ? stdErrorKurt(arr.length) : null,
        Range: rng,
        Minimum: Math.min(...arr),
        Maximum: Math.max(...arr),
        Sum: s,
        Percentiles: pList,
    };
}

function mode(a) {
    if (!a.length) return null;
    const f = {};
    let mx = 0, m = [];
    a.forEach((x) => {
        f[x] = (f[x] || 0) + 1;
        if (f[x] > mx) mx = f[x];
    });
    for (const k in f) {
        if (f[k] === mx) m.push(k);
    }
    return m.length === a.length ? null : m.join(', ');
}

function percentile(arr, p) {
    if (!arr.length) return null;
    const pos = (p / 100) * (arr.length + 1);
    if (pos < 1) return arr[0];
    if (pos >= arr.length) return arr[arr.length - 1];
    const i = Math.floor(pos) - 1;
    const fr = pos - Math.floor(pos);
    return arr[i] + fr * (arr[i + 1] - arr[i]);
}

function stdErrorSkew(n) {
    if (n < 4) return null;
    return +Math.sqrt((6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3))).toFixed(3);
}

function stdErrorKurt(n) {
    if (n < 6) return null;
    const vs = (6 * n * (n - 1)) / ((n - 2) * (n + 1) * (n + 3));
    const vk = (4 * (n ** 2 - 1) * vs) / ((n - 3) * (n + 5));
    return +Math.sqrt(vk).toFixed(3);
}

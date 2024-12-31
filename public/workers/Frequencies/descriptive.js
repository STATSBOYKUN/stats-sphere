function isNumericArray(arr) {
    return arr.every(x => typeof x === 'number');
}
function isMixedArray(arr) {
    return arr.some(x => typeof x !== 'number' && x !== null) && arr.some(x => typeof x === 'number');
}
function sanitizeNumericArray(arr) {
    return arr.map(x => (typeof x === 'number' ? x : NaN)).filter(x => !isNaN(x));
}
function modeFunc(arr) {
    if (!arr.length) return '';
    const freq = {};
    let maxFreq = 0, modes = [];
    arr.forEach(x => {
        freq[x] = (freq[x] || 0) + 1;
        if (freq[x] > maxFreq) maxFreq = freq[x];
    });
    for (let k in freq) if (freq[k] === maxFreq) modes.push(k);
    return modes.length === arr.length ? null : modes;
}
function percentilesFunc(arr, p) {
    if (!arr.length) return '';
    const s = [...arr].sort((a, b) => a - b);
    const pos = (p / 100) * (s.length + 1);
    if (pos < 1) return s[0];
    if (pos >= s.length) return s[s.length - 1];
    const i = Math.floor(pos) - 1, frac = pos - Math.floor(pos);
    return s[i] + frac * (s[i + 1] - s[i]);
}
function calculateNumericStatistics(arr) {
    if (!arr.length) return {
        N: 0, Mean: '', Median: '', Mode: '',
        'Std. Error of Mean': '', 'Std. Deviation': '', Variance: '',
        Skewness: '', 'Std. Error of Skewness': '', Kurtosis: '',
        'Std. Error of Kurtosis': '', Range: '', Minimum: '', Maximum: '',
        Sum: '', Percentiles: []
    };
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    const median = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    const modes = modeFunc(arr), mode = modes ? modes.join(', ') : 'None';
    const var_ = arr.length > 1 ? arr.reduce((a, b) => a + (b - mean) ** 2, 0) / (arr.length - 1) : '';
    const std = var_ === '' ? '' : Math.sqrt(var_);
    let skew = '', kurt = '';
    if (arr.length >= 3 && std !== '') {
        const num = arr.reduce((sum, x) => sum + (x - mean) ** 3, 0);
        skew = (arr.length * num) / ((arr.length - 1) * (arr.length - 2) * std ** 3);
    }
    if (arr.length >= 4 && std !== '') {
        const num = arr.reduce((sum, x) => sum + (x - mean) ** 4, 0);
        kurt = ((arr.length * (arr.length + 1) * num) /
                ((arr.length - 1) * (arr.length - 2) * (arr.length - 3) * std ** 4)) -
            (3 * (arr.length - 1) ** 2) / ((arr.length - 2) * (arr.length - 3));
    }
    const sem = std === '' ? '' : std / Math.sqrt(arr.length);
    let ses = '', sek = '';
    if (arr.length >= 4) ses = Math.sqrt((6 * arr.length * (arr.length - 1)) / ((arr.length - 2) * (arr.length + 1) * (arr.length + 3)));
    if (arr.length >= 6) {
        const vs = (6 * arr.length * (arr.length - 1)) / ((arr.length - 2) * (arr.length + 1) * (arr.length + 3));
        const vk = (4 * ((arr.length ** 2) - 1) * vs) / ((arr.length - 3) * (arr.length + 5));
        sek = Math.sqrt(vk);
    }
    const rng = Math.max(...arr) - Math.min(...arr);
    const sum = arr.reduce((a, b) => a + b, 0);
    const p = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90].map(x => ({
        percentile: x,
        value: parseFloat(percentilesFunc(arr, x).toFixed(1))
    }));
    return {
        N: arr.length,
        Mean: parseFloat(mean.toFixed(3)),
        Median: median,
        Mode: mode,
        'Std. Error of Mean': std === '' ? '' : parseFloat(sem.toFixed(3)),
        'Std. Deviation': std === '' ? '' : parseFloat(std.toFixed(3)),
        Variance: var_ === '' ? '' : parseFloat(var_.toFixed(3)),
        Skewness: skew === '' ? '' : parseFloat(skew.toFixed(3)),
        'Std. Error of Skewness': ses === '' ? '' : parseFloat(ses.toFixed(3)),
        Kurtosis: kurt === '' ? '' : parseFloat(kurt.toFixed(3)),
        'Std. Error of Kurtosis': sek === '' ? '' : parseFloat(sek.toFixed(3)),
        Range: rng,
        Minimum: Math.min(...arr),
        Maximum: Math.max(...arr),
        Sum: sum,
        Percentiles: p
    };
}
function calculateStringStatistics(arr) {
    if (!arr.length) return { N: 0, Mode: '', Missing: 0 };
    const modes = modeFunc(arr), mode = modes ? modes.join(', ') : 'None';
    return { N: arr.length, Mode: mode, Missing: 0 };
}
function calculateDescriptiveStats(data) {
    if (!data?.length) return { tables: [{ title: 'Descriptive Statistics', columns: [], rows: [] }] };
    const fields = Object.keys(data[0]), r = {};
    fields.forEach(f => {
        const vals = data.map(d => d[f]).filter(x => x != null);
        const numeric = isNumericArray(vals), mixed = isMixedArray(data.map(d => d[f]));
        r[f] = numeric || mixed ? calculateNumericStatistics(numeric ? vals : sanitizeNumericArray(vals))
            : calculateStringStatistics(vals.filter(x => typeof x === 'string'));
    });
    const cols = fields.map(f => f[0].toUpperCase() + f.slice(1));
    const rows = [
        {
            rowHeader: ['N'],
            children: [
                {
                    rowHeader: [null, 'Valid'],
                    ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].N), a), {})
                },
                {
                    rowHeader: [null, 'Missing'],
                    ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = data.length - r[f].N), a), {})
                }
            ]
        },
        {
            rowHeader: ['Mean'],
            ...fields.reduce((a, f) => {
                const v = r[f].Mean;
                a[f[0].toUpperCase()+f.slice(1)] = v !== undefined && v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Std. Error of Mean'],
            ...fields.reduce((a, f) => {
                const v = r[f]['Std. Error of Mean'];
                a[f[0].toUpperCase()+f.slice(1)] = v !== undefined && v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Median'],
            ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].Median ?? ''), a), {})
        },
        {
            rowHeader: ['Mode'],
            ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].Mode ?? ''), a), {})
        },
        {
            rowHeader: ['Std. Deviation'],
            ...fields.reduce((a, f) => {
                const v = r[f]['Std. Deviation'];
                a[f[0].toUpperCase()+f.slice(1)] = v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Variance'],
            ...fields.reduce((a, f) => {
                const v = r[f].Variance;
                a[f[0].toUpperCase()+f.slice(1)] = v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Skewness'],
            ...fields.reduce((a, f) => {
                const v = r[f].Skewness;
                a[f[0].toUpperCase()+f.slice(1)] = v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Std. Error of Skewness'],
            ...fields.reduce((a, f) => {
                const v = r[f]['Std. Error of Skewness'];
                a[f[0].toUpperCase()+f.slice(1)] = v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Kurtosis'],
            ...fields.reduce((a, f) => {
                const v = r[f].Kurtosis;
                a[f[0].toUpperCase()+f.slice(1)] = v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Std. Error of Kurtosis'],
            ...fields.reduce((a, f) => {
                const v = r[f]['Std. Error of Kurtosis'];
                a[f[0].toUpperCase()+f.slice(1)] = v !== '' ? parseFloat(v.toFixed(3)) : '';
                return a;
            }, {})
        },
        {
            rowHeader: ['Range'],
            ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].Range ?? ''), a), {})
        },
        {
            rowHeader: ['Minimum'],
            ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].Minimum ?? ''), a), {})
        },
        {
            rowHeader: ['Maximum'],
            ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].Maximum ?? ''), a), {})
        },
        {
            rowHeader: ['Sum'],
            ...fields.reduce((a, f) => ((a[f[0].toUpperCase()+f.slice(1)] = r[f].Sum ?? ''), a), {})
        },
        {
            rowHeader: ['Percentiles'],
            children: [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90].map(num => ({
                rowHeader: [null, num.toString()],
                ...fields.reduce((a, f) => {
                    const found = r[f].Percentiles?.find(x => x.percentile === num);
                    a[f[0].toUpperCase()+f.slice(1)] = found ? parseFloat(found.value.toFixed(1)) : '';
                    return a;
                }, {})
            }))
        }
    ];
    const types = {};
    fields.forEach(f => {
        const vals = data.map(d => d[f]).filter(x => x != null);
        types[f] = isNumericArray(vals) ? 'numeric' : 'string';
    });
    const filtered = rows
        .filter(r => r.rowHeader[0] === 'N' || r.rowHeader[0] === 'Percentiles' || fields.some(f => types[f] === 'numeric'))
        .map(r => {
            if (r.rowHeader[0] === 'N' || r.rowHeader[0] === 'Percentiles') return r;
            const nr = { ...r };
            fields.forEach(f => {
                if (types[f] === 'string') nr[f[0].toUpperCase() + f.slice(1)] = '';
            });
            return nr;
        });
    return { tables: [{ title: 'Descriptive Statistics', columns: cols, rows: filtered }] };
}

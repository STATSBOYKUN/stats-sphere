function computeFreq(data, variable) {
    let vals = [];
    let missingCount = 0;
    switch ((variable.type || '').toLowerCase()) {
        case 'numeric':
            data.forEach((row) => {
                const val = row[variable.name];
                if (val === null || val === '') {
                    missingCount++;
                } else {
                    vals.push(val);
                }
            });
            break;
        case 'string':
        case 'date':
        default:
            data.forEach((row) => {
                const val = row[variable.name];
                vals.push(val == null ? '' : val);
            });
            missingCount = 0;
            break;
    }
    if (!vals.length && missingCount === 0) {
        return [];
    }
    const freqMap = {};
    vals.forEach((v) => {
        freqMap[v] = (freqMap[v] || 0) + 1;
    });
    const freqArr = Object.keys(freqMap).map((k) => ({
        value: k,
        frequency: freqMap[k],
    }));
    return { freqArr, missingCount };
}

function formatFrequencyTable(varName, freqResult, variableType) {
    if (Array.isArray(freqResult) && freqResult.length === 0) {
        return {
            output_data: JSON.stringify({
                tables: [
                    {
                        title: `Frequency Table for ${varName}`,
                        columnHeaders: [
                            { header: "" },
                            { header: "" },
                            { header: "Frequency" },
                            { header: "Percent" },
                            { header: "ValidPercent" },
                            { header: "CumulativePercent" }
                        ],
                        rows: [
                            {
                                rowHeader: ['Total'],
                                Frequency: 0,
                                Percent: 0,
                                ValidPercent: 0,
                                CumulativePercent: '',
                            },
                        ],
                    },
                ],
            }),
        };
    }
    const { freqArr, missingCount } = freqResult;
    const totalCount = freqArr.reduce((sum, obj) => sum + obj.frequency, 0) + missingCount;
    const validCount = totalCount - missingCount;
    if ((variableType || '').toLowerCase() === 'numeric') {
        freqArr.sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
    } else {
        freqArr.sort((a, b) => {
            const valA = a.value.toString();
            const valB = b.value.toString();
            return valA.localeCompare(valB);
        });
    }
    const validRows = [];
    const missingRows = [];
    let validTotal = 0;
    let cumul = 0;
    freqArr.forEach((obj, idx) => {
        if ((variableType || '').toLowerCase() === 'numeric') {
            const val = obj.value;
            const freq = obj.frequency;
            const pct = +((freq / totalCount) * 100).toFixed(2);
            const validPct = validCount ? +((freq / validCount) * 100).toFixed(2) : 0;
            cumul += validPct;
            const isLastValidRow = idx === freqArr.length - 1;
            if (isLastValidRow && Math.round(cumul) >= 99) {
                cumul = 100;
            }
            validRows.push({
                rowHeader: [null, `${val}`],
                Frequency: freq,
                Percent: pct,
                ValidPercent: validPct,
                CumulativePercent: +cumul.toFixed(2),
            });
            validTotal += freq;
        } else {
            const val = obj.value;
            const freq = obj.frequency;
            const pct = +((freq / totalCount) * 100).toFixed(2);
            const validPct = validCount ? +((freq / validCount) * 100).toFixed(2) : 0;
            cumul += validPct;
            const isLastValidRow = idx === freqArr.length - 1;
            if (isLastValidRow && Math.round(cumul) >= 99) {
                cumul = 100;
            }
            validRows.push({
                rowHeader: [null, val === '' ? '' : `${val}`],
                Frequency: freq,
                Percent: pct,
                ValidPercent: validPct,
                CumulativePercent: +cumul.toFixed(2),
            });
            validTotal += freq;
        }
    });
    if (validRows.length) {
        validRows.push({
            rowHeader: [null, 'Total'],
            Frequency: validTotal,
            Percent: +((validTotal / totalCount) * 100).toFixed(2),
            ValidPercent: 100,
            CumulativePercent: '',
        });
    }
    if ((variableType || '').toLowerCase() === 'numeric' && missingCount > 0) {
        missingRows.push({
            rowHeader: [null, 'System'],
            Frequency: missingCount,
            Percent: +((missingCount / totalCount) * 100).toFixed(2),
            ValidPercent: null,
            CumulativePercent: null,
        });
    }
    if(missingCount === 0) {
        missingRows.push({ rowHeader: [null, 'System'], Frequency: null, Percent: null, ValidPercent: null, CumulativePercent: null });
    }
    const validSection = { rowHeader: ['Valid'], children: validRows };
    const missingSection = { rowHeader: ['Missing'], children: missingRows };
    let totalSection;
    if (missingCount === 0) {
        totalSection = {
            rowHeader: ['Total'],
            Frequency: null,
            Percent: null,
            ValidPercent: null,
            CumulativePercent: null,
        };
    } else {
        totalSection = {
            rowHeader: ['Total'],
            Frequency: totalCount,
            Percent: 100,
            ValidPercent: 100,
            CumulativePercent: '',
        };
    }
    const rows = [validSection, missingSection, totalSection];
    return {
        output_data: JSON.stringify({
            tables: [
                {
                    title: `Frequency Table for ${varName}`,
                    columnHeaders: [
                        { header: "" },
                        { header: "" },
                        { header: "Frequency" },
                        { header: "Percent" },
                        { header: "ValidPercent" },
                        { header: "CumulativePercent" }
                    ],
                    rows,
                },
            ],
        }),
    };
}

function computeFreq(data, variable) {
    let vals = [];
    let missingCount = 0;

    switch ((variable.type || '').toLowerCase()) {
        case 'numeric':
            // null atau '' dianggap missing
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
            // string / date: null atau '' dianggap valid
            data.forEach((row) => {
                const val = row[variable.name];
                // ganti null => ''
                vals.push(val == null ? '' : val);
            });
            missingCount = 0;
            break;
    }

    // Kalau sama sekali tidak ada data (vals=0 dan missing=0),
    // kembalikan array kosong
    if (!vals.length && missingCount === 0) {
        return [];
    }

    // Hitung frekuensi masing2 nilai valid
    const freqMap = {};
    vals.forEach((v) => {
        freqMap[v] = (freqMap[v] || 0) + 1;
    });

    // Bangun array { value, frequency }
    const freqArr = Object.keys(freqMap).map((k) => ({
        value: k,
        frequency: freqMap[k],
    }));

    return { freqArr, missingCount };
}

function formatFrequencyTable(varName, freqResult, variableType) {
    // Jika freqResult = [] => tidak ada data sama sekali
    if (Array.isArray(freqResult) && freqResult.length === 0) {
        return {
            output_data: JSON.stringify({
                tables: [
                    {
                        title: `Frequency Table for ${varName}`,
                        columns: ['Frequency', 'Percent', 'ValidPercent', 'CumulativePercent'],
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

    // Total = total valid + missing
    const totalCount = freqArr.reduce((sum, obj) => sum + obj.frequency, 0) + missingCount;
    // Valid = totalCount - missing
    const validCount = totalCount - missingCount;

    // Urutkan ascending
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
            // Numeric => '' / null tidak masuk freqArr,
            // sebab sudah dihitung di missingCount
            // => Di freqArr hanya value numeric valid
            const val = obj.value;
            const freq = obj.frequency;

            // Hitung persentase
            const pct = +((freq / totalCount) * 100).toFixed(2); // percent
            const validPct = validCount
                ? +((freq / validCount) * 100).toFixed(2)
                : 0;

            // Update cumulative percent
            cumul += validPct;

            // Kalau baris valid terakhir, kita cek apakah cumul "mendekati" 100
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
            // String / Date => null / '' dianggap valid
            const val = obj.value;
            const freq = obj.frequency;
            const pct = +((freq / totalCount) * 100).toFixed(2);
            const validPct = validCount
                ? +((freq / validCount) * 100).toFixed(2)
                : 0;

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

    // Tambahkan [null, 'Total'] di dalam ['Valid'] (total valid)
    if (validRows.length) {
        validRows.push({
            rowHeader: [null, 'Total'],
            Frequency: validTotal,
            Percent: +((validTotal / totalCount) * 100).toFixed(2),
            ValidPercent: 100,
            CumulativePercent: '',
        });
    }

    // === Missing Section ===
    // Hanya untuk numeric (sesuai ketentuan)
    // Jika missingCount > 0 => tambahkan baris [null, "System"] dengan frequency = missingCount
    if ((variableType || '').toLowerCase() === 'numeric' && missingCount > 0) {
        missingRows.push({
            rowHeader: [null, 'System'],
            Frequency: missingCount,
            Percent: +((missingCount / totalCount) * 100).toFixed(2),
            ValidPercent: null,
            CumulativePercent: null,
        });
    }

    const validSection = { rowHeader: ['Valid'], children: validRows };
    const missingSection = { rowHeader: ['Missing'], children: missingRows };

    // === Total Section ===
    // Jika TIDAK ada missing (missingCount=0), maka baris 'Total' => null semua
    // Jika ADA missing, baris 'Total' => isi normal
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
                    columns: ['Frequency', 'Percent', 'ValidPercent', 'CumulativePercent'],
                    rows,
                },
            ],
        }),
    };
}

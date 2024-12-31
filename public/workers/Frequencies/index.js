self.importScripts('./frequency.js', './descriptive.js');

self.onmessage = e => {
    const { data, vars } = e.data;
    console.log('Worker received message:', { data, vars }); // Log penerimaan pesan
    try {
        const desc = formatDescriptiveStats(data, vars);
        console.log('Descriptive Statistics:', desc); // Log hasil deskriptif
        const freqs = vars.map((v, i) => {
            const freq = computeFreq(data, v);
            console.log(`Frequency for variable "${v}":`, freq); // Log frekuensi setiap variabel
            return formatFrequencyTable(v, freq, i + 1);
        });
        console.log('Formatted Frequencies:', freqs); // Log tabel frekuensi yang diformat
        const descriptive = JSON.stringify(desc);
        const frequencies = freqs.map(f => f.output_data);
        console.log('Serialized Descriptive Statistics:', descriptive); // Log deskriptif dalam format JSON
        console.log('Serialized Frequencies:', frequencies); // Log frekuensi dalam format JSON
        self.postMessage({ success: true, descriptive, frequencies });
    } catch (err) {
        console.error('Error in Worker:', err); // Log error jika terjadi
        self.postMessage({ success: false, error: err.message });
    }
};

self.addEventListener("error", e => {
    console.error("Inside Worker:", e.message);
});

function formatDescriptiveStats(data, vars) {
    console.log('formatDescriptiveStats called with:', { data, vars }); // Log pemanggilan fungsi
    if (!data.length) {
        const emptyResult = { tables: [{ title: 'Descriptive Statistics', columns: [], rows: [] }] };
        console.log('formatDescriptiveStats output (empty data):', emptyResult); // Log hasil jika data kosong
        return emptyResult;
    }
    const desc = calculateDescriptive(data, vars);
    console.log('Calculated Descriptive:', desc); // Log hasil perhitungan deskriptif
    const formatted = {
        tables: [{
            title: 'Descriptive Statistics',
            columns: vars,
            rows: desc.rows
        }]
    };
    console.log('formatDescriptiveStats output:', formatted); // Log output akhir fungsi
    return formatted;
}

function calculateDescriptive(data, vars) {
    console.log('calculateDescriptive called with:', { data, vars }); // Log pemanggilan fungsi
    const sum = summarizeAll(data, vars);
    console.log('summarizeAll result:', sum); // Log hasil summarizeAll
    const rows = buildDescriptiveRows(vars, sum);
    console.log('buildDescriptiveRows result:', rows); // Log hasil buildDescriptiveRows
    return { rows };
}

function buildDescriptiveRows(vars, sum) {
    console.log('buildDescriptiveRows called with:', { vars, sum }); // Log pemanggilan fungsi
    const rows = [
        {
            rowHeader: ['N'],
            children: [
                { rowHeader: [null, 'Valid'], ...sum.valid },
                { rowHeader: [null, 'Missing'], ...sum.missing }
            ]
        },
        ...[
            'Mean','Std. Error of Mean','Median','Mode','Std. Deviation','Variance','Skewness',
            'Std. Error of Skewness','Kurtosis','Std. Error of Kurtosis','Range','Minimum','Maximum','Sum'
        ].map(k => {
            const r = { rowHeader: [k] };
            vars.forEach(v => {
                r[v] = sum[k]?.[v] ?? '';
            });
            console.log(`Row for ${k}:`, r); // Log setiap baris statistik
            return r;
        }),
        { rowHeader: ['Percentiles'], children: buildPercentiles(vars, sum.Percentiles) }
    ];
    console.log('buildDescriptiveRows output:', rows); // Log output akhir fungsi
    return rows;
}

function buildPercentiles(vars, pObj) {
    console.log('buildPercentiles called with:', { vars, pObj }); // Log pemanggilan fungsi
    const ps = [10,20,25,30,40,50,60,70,75,80,90];
    const percentilesRows = ps.map(x => {
        const r = { rowHeader: [null, x.toString()] };
        vars.forEach(v => {
            r[v] = pObj[v]?.[x] ?? '';
        });
        console.log(`Percentile ${x} for variables:`, r); // Log setiap baris percentile
        return r;
    });
    console.log('buildPercentiles output:', percentilesRows); // Log output akhir fungsi
    return percentilesRows;
}

function summarizeAll(data, vars) {
    console.log('summarizeAll called with:', { data, vars }); // Log pemanggilan fungsi
    const res = {
        valid:{}, missing:{}, Mean:{}, 'Std. Error of Mean':{}, Median:{}, Mode:{},
        'Std. Deviation':{}, Variance:{}, Skewness:{}, 'Std. Error of Skewness':{},
        Kurtosis:{}, 'Std. Error of Kurtosis':{}, Range:{}, Minimum:{}, Maximum:{},
        Sum:{}, Percentiles:{}
    };
    vars.forEach(v => {
        const col = data.map(d => d[v]).filter(x => x != null);
        console.log(`Processing variable "${v}":`, { col }); // Log data kolom per variabel
        if (!col.length) {
            res.valid[v] = 0;
            res.missing[v] = data.length;
            console.log(`Variable "${v}" has no valid data.`, { valid: res.valid[v], missing: res.missing[v] }); // Log jika tidak ada data valid
            return;
        }
        const stats = numericOrString(col);
        console.log(`Stats for variable "${v}":`, stats); // Log hasil numericOrString
        res.valid[v] = stats.valid;
        res.missing[v] = stats.missing;
        if (stats.num) {
            [
                'Mean','Std. Error of Mean','Median','Mode','Std. Deviation','Variance',
                'Skewness','Std. Error of Skewness','Kurtosis','Std. Error of Kurtosis',
                'Range','Minimum','Maximum','Sum'
            ].forEach(k => {
                res[k][v] = stats.num[k];
                console.log(`Set ${k} for "${v}":`, stats.num[k]); // Log setiap statistik numerik
            });
            res.Percentiles[v] = {};
            stats.num.Percentiles.forEach(p => {
                res.Percentiles[v][p.percentile] = p.value;
                console.log(`Set Percentile ${p.percentile} for "${v}":`, p.value); // Log setiap percentile
            });
        } else {
            res.Mean[v] = '';
            res['Std. Error of Mean'][v] = '';
            res.Median[v] = '';
            res.Mode[v] = stats.str.Mode;
            console.log(`Set Mode for "${v}":`, stats.str.Mode); // Log mode untuk string
            [
                'Std. Deviation','Variance','Skewness','Std. Error of Skewness',
                'Kurtosis','Std. Error of Kurtosis','Range','Minimum','Maximum','Sum'
            ].forEach(k => {
                res[k][v] = '';
                console.log(`Set ${k} for "${v}" as empty (string variable).`); // Log pengaturan kosong untuk statistik numerik
            });
            res.Percentiles[v] = {};
        }
    });
    console.log('summarizeAll result:', res); // Log hasil akhir summarizeAll
    return res;
}

function numericOrString(arr) {
    console.log('numericOrString called with:', arr); // Log pemanggilan fungsi
    const parsed = arr.map(x => {
        const n = parseFloat(x);
        return isNaN(n) ? null : n;
    });
    const allNumeric = parsed.every(n => n !== null);
    console.log('Parsed array:', parsed, 'All Numeric:', allNumeric); // Log hasil parsing
    if (allNumeric) {
        const numStats = calcNumeric(parsed);
        console.log('Numeric statistics:', numStats); // Log statistik numerik
        return { valid: arr.length, missing: 0, num: numStats };
    }
    const strStats = { Mode: mode(arr) };
    console.log('String statistics:', strStats); // Log statistik string
    return { valid: arr.length, missing: 0, str: strStats };
}

function calcNumeric(arr) {
    console.log('calcNumeric called with:', arr); // Log pemanggilan fungsi
    const mean = arr.reduce((a,b)=>a+b,0)/arr.length;
    const sorted = [...arr].sort((a,b)=>a-b);
    const mid = Math.floor(sorted.length/2);
    const median = sorted.length % 2 ? sorted[mid] : (sorted[mid-1]+sorted[mid])/2;
    const md = mode(arr);
    const var_ = arr.length>1 ? arr.reduce((a,b)=>a+(b-mean)**2,0)/(arr.length-1) : '';
    const std = var_==='' ? '' : Math.sqrt(var_);
    let skew='', kurt='';
    if(std!=='' && arr.length>=3) {
        const num=arr.reduce((a,b)=>a+(b-mean)**3,0);
        skew=(arr.length*num)/((arr.length-1)*(arr.length-2)*std**3);
    }
    if(std!=='' && arr.length>=4) {
        const num=arr.reduce((a,b)=>a+(b-mean)**4,0);
        kurt=((arr.length*(arr.length+1)*num)/((arr.length-1)*(arr.length-2)*(arr.length-3)*std**4))
            - (3*((arr.length-1)**2)/((arr.length-2)*(arr.length-3)));
    }
    const sem = std==='' ? '' : std/Math.sqrt(arr.length);
    const rng = Math.max(...arr) - Math.min(...arr);
    const s = arr.reduce((a,b)=>a+b,0);
    const p=[10,20,25,30,40,50,60,70,75,80,90].map(x=>({
        percentile:x,
        value:+percentile(sorted,x).toFixed(1)
    }));
    const numericResult = {
        N:arr.length,
        Mean:+mean.toFixed(3),
        'Std. Error of Mean':std===''?'':+(sem.toFixed(3)),
        Median:median,
        Mode:md??'None',
        'Std. Deviation':std===''?'':+(std.toFixed(3)),
        Variance:var_===''?'':+(var_.toFixed(3)),
        Skewness:skew=== '' ? '' : +(skew.toFixed(3)),
        'Std. Error of Skewness':std === '' ? '' : stdErrorSkew(arr.length),
        Kurtosis:kurt === '' ? '' : +(kurt.toFixed(3)),
        'Std. Error of Kurtosis':std === '' ? '' : stdErrorKurt(arr.length),
        Range:rng,
        Minimum:Math.min(...arr),
        Maximum:Math.max(...arr),
        Sum:s,
        Percentiles:p
    };
    console.log('calcNumeric output:', numericResult); // Log hasil akhir kalkulasi numerik
    return numericResult;
}

function mode(a) {
    console.log('mode called with:', a); // Log pemanggilan fungsi
    if(!a.length){
        console.log('mode output: empty array, returning ""');
        return '';
    }
    const f={}, m=[];
    let mx=0;
    a.forEach(x => {
        f[x] = (f[x]||0)+1;
        if(f[x]>mx) mx=f[x];
    });
    for(const k in f) if(f[k]===mx) m.push(k);
    const result = m.length===a.length?null:m.join(', ');
    console.log('mode output:', result); // Log hasil mode
    return result;
}

function percentile(arr, p) {
    console.log(`percentile called with arr: ${arr} and p: ${p}`); // Log pemanggilan fungsi
    if(!arr.length) {
        console.log('percentile output: empty array, returning ""');
        return '';
    }
    const pos=(p/100)*(arr.length+1);
    let result;
    if(pos<1) {
        result = arr[0];
    }
    else if(pos>=arr.length) {
        result = arr[arr.length-1];
    }
    else {
        const i=Math.floor(pos)-1, fr=pos-Math.floor(pos);
        result = arr[i]+fr*(arr[i+1]-arr[i]);
    }
    console.log(`percentile output for p=${p}:`, result); // Log hasil percentile
    return result;
}

function stdErrorSkew(n) {
    console.log('stdErrorSkew called with n:', n); // Log pemanggilan fungsi
    if(n<4){
        console.log('stdErrorSkew output: n < 4, returning ""');
        return '';
    }
    const result = +Math.sqrt((6*n*(n-1))/((n-2)*(n+1)*(n+3))).toFixed(3);
    console.log('stdErrorSkew output:', result); // Log hasil SE skewness
    return result;
}

function stdErrorKurt(n) {
    console.log('stdErrorKurt called with n:', n); // Log pemanggilan fungsi
    if(n<6){
        console.log('stdErrorKurt output: n < 6, returning ""');
        return '';
    }
    const vs=(6*n*(n-1))/((n-2)*(n+1)*(n+3));
    const vk=(4*((n**2)-1)*vs)/((n-3)*(n+5));
    const result = +Math.sqrt(vk).toFixed(3);
    console.log('stdErrorKurt output:', result); // Log hasil SE kurtosis
    return result;
}

function computeFreq(data, field) {
    console.log(`computeFreq called for field "${field}" with data length: ${data.length}`); // Log pemanggilan fungsi
    const vals = data.map(x => x[field]);
    if(!vals.length) {
        console.log('computeFreq output: empty array, returning []');
        return [];
    }
    const freqMap={}, total=vals.length;
    vals.forEach(x => { freqMap[x] = (freqMap[x]||0)+1; });
    const arr = Object.keys(freqMap).map(k => ({
        value:k,
        frequency:freqMap[k],
        percent:(freqMap[k]/total)*100
    }));
    arr.sort((a,b)=>b.frequency - a.frequency);
    console.log(`computeFreq output for field "${field}":`, arr); // Log hasil frekuensi
    return arr;
}

function formatFrequencyTable(varName, freqArr) {
    console.log(`formatFrequencyTable called for variable "${varName}" with freqArr:`, freqArr); // Log pemanggilan fungsi
    const validRows=[], missingRows=[];
    let validTotal=0, missingTotal=0, cumul=0;
    freqArr.forEach(obj=>{
        if(obj.value==='System' || obj.value==='' || obj.value==null) {
            missingRows.push({
                rowHeader:[null,obj.value+''||'System'],
                Frequency:obj.frequency,
                Percent:obj.percent,
                ValidPercent:null,
                CumulativePercent:null
            });
            missingTotal+=obj.frequency;
            console.log(`Missing value added for "${varName}":`, obj); // Log missing value
        } else {
            cumul+=obj.percent;
            validRows.push({
                rowHeader:[null,obj.value+''],
                Frequency:obj.frequency,
                Percent:obj.percent,
                ValidPercent:obj.percent,
                CumulativePercent:+cumul.toFixed(1)
            });
            validTotal+=obj.frequency;
            console.log(`Valid value added for "${varName}":`, obj); // Log valid value
        }
    });
    if(validRows.length) {
        const pct = +(validTotal/(validTotal+missingTotal)*100).toFixed(1);
        validRows.push({
            rowHeader:[null,'Total'],
            Frequency:validTotal,
            Percent:pct,
            ValidPercent:pct,
            CumulativePercent:''
        });
        console.log(`Total valid for "${varName}":`, { validTotal, pct }); // Log total valid
    }
    const rows = [
        { rowHeader:['Valid'], children: validRows },
        { rowHeader:['Missing'], children: missingRows },
        {
            rowHeader:['Total'],
            Frequency: validTotal+missingTotal,
            Percent:100,
            ValidPercent: validRows.length?100:'',
            CumulativePercent:''
        }
    ];
    const output = {
        output_data: JSON.stringify({
            tables:[{
                title:`Frequency Table for ${varName}`,
                columns:['Frequency','Percent','ValidPercent','CumulativePercent'],
                rows
            }]
        })
    };
    console.log(`formatFrequencyTable output for "${varName}":`, output); // Log output akhir
    return output;
}

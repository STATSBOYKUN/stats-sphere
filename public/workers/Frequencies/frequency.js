function computeFrequencyTable(values) {
    const v = values.filter(x => x != null);
    const freq = {};
    v.forEach(x => (freq[x] = (freq[x] || 0) + 1));
    const total = v.length;
    const arr = Object.keys(freq).map(k => ({
        value: k,
        frequency: freq[k],
        percent: (freq[k] / total) * 100
    }));
    arr.sort((a, b) => b.frequency - a.frequency);
    return arr;
}

function calculateFrequencyTables(data) {
    if (!data?.length) return {};
    const fields = Object.keys(data[0]);
    const res = {};
    fields.forEach(f => {
        const vals = data.map(row => row[f]);
        res[f] = computeFrequencyTable(vals);
    });
    return res;
}

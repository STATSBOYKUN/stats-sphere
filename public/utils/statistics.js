export const sortNumbers = (arr) => {
    return arr.slice().sort((a, b) => a - b);
};

export const mean = (arr) => {
    if (arr.length === 0) throw new Error("Mean tidak dapat dihitung untuk array kosong.");
    const total = arr.reduce((sum, value) => sum + value, 0);
    return total / arr.length;
};

export const median = (arr) => {
    if (arr.length === 0) throw new Error("Median tidak dapat dihitung untuk array kosong.");
    const sorted = sortNumbers(arr);
    const mid = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    } else {
        return sorted[mid];
    }
};

export const mode = (arr) => {
    if (arr.length === 0) throw new Error("Mode tidak dapat dihitung untuk array kosong.");
    const frequency = {};
    arr.forEach(num => {
        frequency[num] = (frequency[num] || 0) + 1;
    });
    const maxFreq = Math.max(...Object.values(frequency));
    const modes = Object.keys(frequency)
        .filter(key => frequency[Number(key)] === maxFreq)
        .map(Number);
    return modes;
};

export const standardDeviation = (arr) => {
    if (arr.length === 0) throw new Error("Standard Deviation tidak dapat dihitung untuk array kosong.");
    const m = mean(arr);
    const varianceVal = arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
    return Math.sqrt(varianceVal);
};

export const variance = (arr) => {
    if (arr.length === 0) throw new Error("Variance tidak dapat dihitung untuk array kosong.");
    const m = mean(arr);
    return arr.reduce((sum, val) => sum + Math.pow(val - m, 2), 0) / arr.length;
};

export const sampleSkewness = (arr) => {
    if (arr.length < 3) throw new Error("Sample Skewness memerlukan setidaknya 3 data.");
    const m = mean(arr);
    const sd = standardDeviation(arr);
    const n = arr.length;
    const skew = arr.reduce((sum, val) => sum + Math.pow((val - m) / sd, 3), 0) * (n / ((n - 1) * (n - 2)));
    return skew;
};

export const sampleKurtosis = (arr) => {
    if (arr.length < 4) throw new Error("Sample Kurtosis memerlukan setidaknya 4 data.");
    const m = mean(arr);
    const sd = standardDeviation(arr);
    const n = arr.length;
    const kurt = arr.reduce((sum, val) => sum + Math.pow((val - m) / sd, 4), 0) *
        ((n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3))) - (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
    return kurt;
};

export const minValue = (arr) => {
    if (arr.length === 0) throw new Error("Min tidak dapat dihitung untuk array kosong.");
    return Math.min(...arr);
};

export const maxValue = (arr) => {
    if (arr.length === 0) throw new Error("Max tidak dapat dihitung untuk array kosong.");
    return Math.max(...arr);
};

export const sum = (arr) => {
    return arr.reduce((sum, val) => sum + val, 0);
};

export const range = (arr) => {
    if (arr.length === 0) throw new Error("Range tidak dapat dihitung untuk array kosong.");
    return maxValue(arr) - minValue(arr);
};

export const quantileSorted = (sortedArr, q) => {
    if (sortedArr.length === 0) throw new Error("Quantile tidak dapat dihitung untuk array kosong.");
    if (q < 0 || q > 1) throw new Error("Quantile harus antara 0 dan 1.");
    const pos = (sortedArr.length - 1) * q;
    const base = Math.floor(pos);
    const rest = pos - base;
    if ((sortedArr[base + 1] !== undefined)) {
        return sortedArr[base] + rest * (sortedArr[base + 1] - sortedArr[base]);
    } else {
        return sortedArr[base];
    }
};

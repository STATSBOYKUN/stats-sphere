import {
    sortNumbers,
    mean,
    median,
    mode,
    standardDeviation,
    variance,
    sampleSkewness,
    sampleKurtosis,
    minValue,
    maxValue,
    sum,
    quantileSorted,
    range
} from '../../utils/statistics.js';

importScripts('../utils/statistics.js');

console.log("Worker dijalankan");

// Fungsi internal untuk kalkulasi statistik
function calculateFrequencies(data, columnIndex) {
    const columnData = data.map((row) => row[columnIndex]).filter(value => value !== null && value !== undefined);
    const frequencies = {};
    columnData.forEach((value) => {
        frequencies[value] = (frequencies[value] || 0) + 1;
    });
    const valid = columnData.length;
    const missing = data.length - valid;
    return { frequencies, valid, missing };
}

function calculateCompleteStatistics(data, columnIndex) {
    const columnData = data.map((row) => row[columnIndex]);

    const numericData = columnData.filter(value => typeof value === 'number');
    if (numericData.length === 0) {
        return null;
    }

    const sortedData = sortNumbers(numericData);
    const meanVal = mean(sortedData);
    const medianVal = median(sortedData);
    const modes = mode(sortedData);
    const modeVal = modes[0];
    const standardDeviationVal = standardDeviation(sortedData);
    const varianceVal = variance(sortedData);
    const skewnessVal = sampleSkewness(sortedData);
    const kurtosisVal = sampleKurtosis(sortedData);
    const rangeVal = range(sortedData);
    const minimum = minValue(sortedData);
    const maximum = maxValue(sortedData);
    const sumVal = sum(sortedData);
    const percentiles = {
        10: quantileSorted(sortedData, 0.10),
        20: quantileSorted(sortedData, 0.20),
        25: quantileSorted(sortedData, 0.25),
        30: quantileSorted(sortedData, 0.30),
        40: quantileSorted(sortedData, 0.40),
        50: quantileSorted(sortedData, 0.50),
        60: quantileSorted(sortedData, 0.60),
        70: quantileSorted(sortedData, 0.70),
        75: quantileSorted(sortedData, 0.75),
        80: quantileSorted(sortedData, 0.80),
        90: quantileSorted(sortedData, 0.90),
    };

    const note = modes.length > 1 ? "a Multiple modes exist. The smallest value is shown" : "";

    return {
        N: numericData.length,
        Valid: numericData.length,
        Missing: data.length - numericData.length,
        Mean: parseFloat(meanVal.toFixed(2)),
        "Std. Error of Mean": parseFloat((standardDeviationVal / Math.sqrt(sortedData.length)).toFixed(3)),
        Median: parseFloat(medianVal.toFixed(2)),
        Mode: modeVal,
        "Std. Deviation": parseFloat(standardDeviationVal.toFixed(3)),
        Variance: parseFloat(varianceVal.toFixed(3)),
        Skewness: parseFloat(skewnessVal.toFixed(3)),
        "Std. Error of Skewness": parseFloat((1.0 / Math.sqrt(sortedData.length)).toFixed(3)),
        Kurtosis: parseFloat(kurtosisVal.toFixed(3)),
        "Std. Error of Kurtosis": parseFloat((2.0 / Math.sqrt(sortedData.length)).toFixed(3)),
        Range: rangeVal,
        Minimum: minimum,
        Maximum: maximum,
        Sum: sumVal,
        Percentiles: percentiles,
        Note: note,
    };
}

function calculateCompleteStatisticsForAll(data, variables, columnIndices) {
    const completeStats = {};

    columnIndices.forEach(columnIndex => {
        const variable = variables.find(v => v.columnIndex === columnIndex);
        if (variable) {
            const stats = calculateCompleteStatistics(data, columnIndex);
            if (stats) {
                completeStats[variable.name] = stats;
            }
        }
    });

    return completeStats;
}

// Listener untuk menerima pesan dari main thread
onmessage = async (e) => {
    console.log("Worker menerima pesan:", e.data);
    const { action, payload } = e.data;

    if (action === 'calculate') {
        const { data, variables, selectedVariables } = payload;
        console.log("Data length:", data.length);
        console.log("Variables:", variables);
        console.log("Selected Variables:", selectedVariables);

        const columnIndices = selectedVariables.map((variableName) => {
            const variable = variables.find((v) => v.name === variableName);
            return variable ? variable.columnIndex : -1;
        }).filter((index) => index !== -1);

        const completeStatistics = calculateCompleteStatisticsForAll(data, variables, columnIndices);

        const frequencyResults = [];
        for (const variableName of selectedVariables) {
            const variable = variables.find((v) => v.name === variableName);
            if (variable) {
                const { frequencies, valid, missing } = calculateFrequencies(data, variable.columnIndex);
                const frequencyData = Object.entries(frequencies).map(([key, value]) => ({
                    Frequency: key,
                    Percent: parseFloat(((value / valid) * 100).toFixed(1)),
                    "Valid Percent": parseFloat(((value / valid) * 100).toFixed(1)),
                    "Cumulative Percent": 0,
                }));

                let cumulative = 0;
                frequencyData.forEach((item) => {
                    cumulative += item.Percent;
                    item["Cumulative Percent"] = parseFloat(cumulative.toFixed(1));
                });

                frequencyData.push({
                    Frequency: "Total",
                    Percent: 100.0,
                    "Valid Percent": 100.0,
                    "Cumulative Percent": "",
                });

                frequencyResults.push({
                    variableName,
                    frequencyData,
                    valid,
                    missing
                });
            }
        }

        console.log("Worker mengirim hasil ke main thread");
        postMessage({ completeStatistics, frequencyResults });
    }
};

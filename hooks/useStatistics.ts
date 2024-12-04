// hooks/useStatistics.ts

import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';
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
} from '@/utils/statistics';

export const useStatistics = () => {
    const data = useDataStore((state) => state.data);
    const variables = useVariableStore((state) => state.variables);

    // Fungsi untuk menghitung frekuensi dari nilai variabel
    const calculateFrequencies = (columnIndex: number) => {
        const columnData = data.map((row) => row[columnIndex]).filter(value => value !== null && value !== undefined);
        const frequencies: { [key: string]: number } = {};
        columnData.forEach((value) => {
            frequencies[value] = (frequencies[value] || 0) + 1;
        });
        const valid = columnData.length; // Jumlah data valid
        const missing = data.length - valid; // Jumlah data yang hilang
        return { frequencies, valid, missing };
    };

    // Fungsi untuk menghitung statistik lengkap untuk satu variabel
    const calculateCompleteStatistics = (columnIndex: number) => {
        const columnData = data.map((row) => row[columnIndex]);

        // Periksa apakah data numerik
        const numericData = columnData.filter(value => typeof value === 'number');
        if (numericData.length === 0) {
            return null; // Tidak menghitung statistik numerik untuk data non-numerik
        }

        const sortedData = sortNumbers(numericData);
        const meanVal = mean(sortedData);
        const medianVal = median(sortedData);
        const modes = mode(sortedData);
        const modeVal = modes.length === 1 ? modes[0] : modes[0]; // Pilih mode terkecil jika ada multiple
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

        // Cek apakah terdapat mode ganda
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
            "Std. Error of Skewness": parseFloat((1.0 / Math.sqrt(sortedData.length)).toFixed(3)), // Aproksimasi
            Kurtosis: parseFloat(kurtosisVal.toFixed(3)),
            "Std. Error of Kurtosis": parseFloat((2.0 / Math.sqrt(sortedData.length)).toFixed(3)), // Aproksimasi
            Range: rangeVal,
            Minimum: minimum,
            Maximum: maximum,
            Sum: sumVal,
            Percentiles: percentiles,
            Note: note,
        };
    };

    // Fungsi untuk menghitung statistik lengkap untuk semua variabel yang dipilih
    const calculateCompleteStatisticsForAll = (columnIndices: number[]) => {
        const completeStats: { [key: string]: any } = {};

        columnIndices.forEach(columnIndex => {
            const variable = variables.find(v => v.columnIndex === columnIndex);
            if (variable) {
                const stats = calculateCompleteStatistics(columnIndex);
                if (stats) {
                    completeStats[variable.name] = stats;
                }
            }
        });

        return completeStats;
    };

    // Mendapatkan variabel berdasarkan index kolom
    const getVariableByColumnIndex = (columnIndex: number) => {
        return variables.find((variable) => variable.columnIndex === columnIndex);
    };

    return {
        calculateFrequencies,
        calculateCompleteStatistics,
        calculateCompleteStatisticsForAll,
        getVariableByColumnIndex,
    };
};

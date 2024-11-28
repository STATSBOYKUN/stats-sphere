// hooks/useStatistics.ts
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';

export const useStatistics = () => {
    const data = useDataStore((state) => state.data);
    const variables = useVariableStore((state) => state.variables);

    // Fungsi untuk menghitung frekuensi dari nilai variabel
    const calculateFrequencies = (columnIndex: number) => {
        const columnData = data.map((row) => row[columnIndex]);
        const frequencies = columnData.reduce((acc, value) => {
            acc[value] = (acc[value] || 0) + 1;
            return acc;
        }, {});
        return frequencies;
    };

    // Mendapatkan variabel berdasarkan index kolom
    const getVariableByColumnIndex = (columnIndex: number) => {
        return variables.find((variable) => variable.columnIndex === columnIndex);
    };

    return {
        calculateFrequencies,
        getVariableByColumnIndex,
    };
};

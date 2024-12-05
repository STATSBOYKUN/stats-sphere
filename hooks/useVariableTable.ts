// hooks/useVariableTable.ts
import { useEffect, useMemo } from 'react';
import { useVariableStore, VariableRow } from '@/stores/useVariableStore';

export const useVariableTable = (totalColumns: number) => {
    const variables = useVariableStore((state) => state.variables);
    const updateVariable = useVariableStore((state) => state.updateVariable);
    const loadVariables = useVariableStore((state) => state.loadVariables);

    // Load data saat komponen pertama kali dipasang
    useEffect(() => {
        loadVariables(totalColumns);
    }, [loadVariables, totalColumns]);

    // Mengonversi variabel ke dalam format data untuk Handsontable
    const data = useMemo(() => {
        return variables.map((variable) => [
            variable.name,
            variable.type,
            variable.width,
            variable.decimals,
            variable.label,
            variable.values,
            variable.missing,
            variable.columns,
            variable.align,
            variable.measure,
        ]);
    }, [variables]);

    // Event handler untuk menangani perubahan data dalam tabel
    const handleAfterChange = (changes: Handsontable.CellChange[] | null, source: Handsontable.ChangeSource) => {
        if (source === 'loadData' || !changes) return;

        changes.forEach(([row, prop, oldValue, newValue]) => {
            if (newValue !== oldValue) {
                // Menentukan nama kolom berdasarkan index kolom
                const fieldIndex = typeof prop === 'number' ? prop : parseInt(prop);
                const fieldName = [
                    'name', 'type', 'width', 'decimals', 'label', 'values', 'missing', 'columns', 'align', 'measure'
                ][fieldIndex] as keyof VariableRow;

                updateVariable(row, fieldName, newValue);
            }
        });
    };

    return { data, handleAfterChange };
};

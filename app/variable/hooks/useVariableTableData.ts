// hooks/useVariableTableData.ts
import { useState, useEffect, useCallback } from 'react';
import {useVariableStore, Variable} from '@/stores/useVariableStore';

export const useVariableTableData = () => {
    const variables = useVariableStore((state) => state.variables);
    const updateVariable = useVariableStore((state) => state.updateVariable);
    const loadVariables = useVariableStore((state) => state.loadVariables);

    useEffect(() => {
        loadVariables(); // ganti sesuai kebutuhan
    }, [loadVariables]);

    // Fungsi konversi data variabel ke format array 2D untuk Handsontable
    const convertVariablesToTableData = useCallback((variablesList: Variable[]): any[][] => {
        return variablesList.map((variable) => {
            // Asumsikan variable default jika nama kosong
            const isDefault = variable.name === '';

            return [
                variable.name,
                isDefault ? '' : variable.type,
                isDefault ? '' : variable.width,
                isDefault ? '' : variable.decimals,
                variable.label,
                // Konversi array values ke string
                Array.isArray(variable.values) && variable.values.length > 0
                    ? variable.values.map((vl: any) => `${vl.value}: ${vl.label}`).join(', ')
                    : '',
                // Konversi array missing ke string
                Array.isArray(variable.missing) && variable.missing.length > 0
                    ? variable.missing.join(', ')
                    : '',
                isDefault ? '' : variable.columns,
                variable.align,
                variable.measure,
            ];
        });
    }, []);


    const [tableData, setTableData] = useState(() => convertVariablesToTableData(variables));

    // Update tableData saat variabel berubah
    useEffect(() => {
        setTableData(convertVariablesToTableData(variables));
    }, [variables, convertVariablesToTableData]);

    // Handle perubahan dari Handsontable
    const handleAfterChange = useCallback((changes: any, source: string) => {
        if (source === 'loadData' || !changes) return;
        changes.forEach(([row, col, oldValue, newValue]: any) => {
            switch (col) {
                case 5: // Values column
                    const parsedValues = newValue
                        .split(',')
                        .map((item: string) => {
                            const [value, label] = item.split(':').map((s) => s.trim());
                            return { value, label };
                        })
                        .filter((item: any) => item.value !== undefined && item.label !== undefined);
                    updateVariable(row, 'values', parsedValues);
                    break;
                case 6: // Missing column
                    const parsedMissing = newValue
                        .split(',')
                        .map((item: string) => item.trim())
                        .filter((item: string) => item !== '');
                    updateVariable(row, 'missing', parsedMissing);
                    break;
                default: {
                    const colMapping: Record<number, keyof VariableRow> = {
                        0: 'name',
                        1: 'type',
                        2: 'width',
                        3: 'decimals',
                        4: 'label',
                        7: 'columns',
                        8: 'align',
                        9: 'measure',
                    };
                    if (colMapping[col]) {
                        updateVariable(row, colMapping[col], newValue);
                    }
                    break;
                }
            }
        });
    }, [updateVariable]);

    return { tableData, handleAfterChange };
};

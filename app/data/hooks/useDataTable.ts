// hooks/useDataTable.ts
import { useEffect } from 'react';
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';

export const useDataTable = () => {
    const { data, updateCell, loadData } = useDataStore();
    const { variables, addVariable, loadVariables, getVariableByColumnIndex } = useVariableStore();

    useEffect(() => {
        loadData();
        loadVariables();
    }, [loadData, loadVariables]);

    return { data, variables, updateCell, addVariable, getVariableByColumnIndex };
};

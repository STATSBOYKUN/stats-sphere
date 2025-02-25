// hooks/useDataTable.ts
import { useEffect } from 'react';
import { useDataStore } from '@/stores/useDataStore';
import { useVariableStore } from '@/stores/useVariableStore';

export const useDataTable = () => {
    const { data, nCases, nVars, updateCell, loadData } = useDataStore();
    const { variables, addVariable, loadVariables, getVariableByColumnIndex } = useVariableStore();

    useEffect(() => {
        loadData();
        loadVariables();
    }, [loadData, loadVariables]);

    return { data, nCases, nVars, variables, updateCell, addVariable, getVariableByColumnIndex };
};

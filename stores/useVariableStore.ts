// stores/useVariableStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import db from '@/lib/db';

export interface VariableRow {
    columnIndex: number;
    name: string;
    type: string;
    width: number;
    decimals: number;
    label: string;
    values: string;
    missing: string;
    columns: number;
    align: string;
    measure: string;
}

interface VariableStoreState {
    variables: VariableRow[];
    setVariables: (variables: VariableRow[]) => void;
    updateVariable: (rowIndex: number, field: keyof VariableRow, value: any) => void;
    addVariable: (variable: VariableRow) => Promise<void>;
    getVariableByColumnIndex: (columnIndex: number) => VariableRow | undefined;
    loadVariables: (totalVariables: number) => Promise<void>; // Accept totalVariables
}

const totalVariables = 45;

export const useVariableStore = create<VariableStoreState>()(
    devtools((set, get) => ({
        variables: [],
        setVariables: (variables) => set({ variables }),
        updateVariable: async (rowIndex, field, value) => {
            const variables = get().variables.map((variable) => ({ ...variable }));
            // @ts-ignore
            variables[rowIndex][field] = value;
            set({ variables });

            try {
                const variableToUpdate = variables[rowIndex];
                // @ts-ignore
                await db.variables.put(variableToUpdate);
            } catch (error) {
                console.error('Failed to update variable in Dexie:', error);
            }
        },
        addVariable: async (variable) => {
            const variables = [...get().variables, variable];
            set({ variables });

            try {
                // @ts-ignore
                await db.variables.add(variable);
            } catch (error) {
                console.error('Failed to add variable to Dexie:', error);
            }
        },
        getVariableByColumnIndex: (columnIndex) => {
            return get().variables.find((variable) => variable.columnIndex === columnIndex);
        },
        loadVariables: async (totalVariables) => {
            try {
                const variablesFromDb = await db.variables.orderBy('columnIndex').toArray();
                const variables = variablesFromDb.slice();

                for (let i = variables.length; i < totalVariables; i++) {
                    // @ts-ignore
                    variables.push({
                        columnIndex: i,
                        name: '',
                        type: '',
                        width: 0,
                        decimals: 0,
                        label: '',
                        values: '',
                        missing: '',
                        columns: '',
                        align: '',
                        measure: '',
                    });
                }

                // @ts-ignore
                set({ variables });
            } catch (error) {
                console.error('Failed to fetch variables from Dexie:', error);
            }
        },
    }))
);

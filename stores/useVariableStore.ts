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
    columns: string;
    align: string;
    measure: string;
}

interface VariableStoreState {
    variables: VariableRow[];
    setVariables: (variables: VariableRow[]) => void;
    updateVariable: (rowIndex: number, field: keyof VariableRow, value: any) => void;
    loadVariables: () => Promise<void>;
}

const totalVariables = 45; // Jumlah kolom dalam tabel data

export const useVariableStore = create<VariableStoreState>()(
    devtools((set, get) => ({
        variables: Array.from({ length: totalVariables }, (_, index) => ({
            columnIndex: index,
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
        })),
        setVariables: (variables) => set({ variables }),
        updateVariable: async (rowIndex, field, value) => {
            const variables = get().variables.map((variable) => ({ ...variable }));
            variables[rowIndex][field] = value;
            set({ variables });

            // Update variable in Dexie.js
            try {
                const variableToUpdate = variables[rowIndex];
                await db.variables.put(variableToUpdate);
            } catch (error) {
                console.error('Failed to update variable in Dexie:', error);
            }
        },
        loadVariables: async () => {
            try {
                const variablesFromDb = await db.variables.orderBy('columnIndex').toArray();
                let variables = variablesFromDb;

                // Jika data dari database kurang dari totalVariables, tambahkan baris kosong
                if (variables.length < totalVariables) {
                    const emptyVariables = Array.from(
                        { length: totalVariables - variables.length },
                        (_, index) => ({
                            columnIndex: variables.length + index,
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
                        })
                    );
                    variables = variables.concat(emptyVariables);
                }

                set({ variables });
            } catch (error) {
                console.error('Failed to fetch variables from Dexie:', error);
            }
        },
    }))
);

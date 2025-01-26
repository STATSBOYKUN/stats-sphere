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
    loadVariables: (totalVariables: number) => Promise<void>;
    createNextVariable: (overrides?: Partial<VariableRow>) => Promise<void>;
}

const totalVariables = 45;

export const useVariableStore = create<VariableStoreState>()(
    devtools((set, get) => ({
        variables: [],
        setVariables: (variables) => set({ variables }),
        updateVariable: async (rowIndex, field, value) => {
            const variables = get().variables.map((variable) => ({ ...variable }));
            variables[rowIndex][field] = value;
            set({ variables });

            try {
                const variableToUpdate = variables[rowIndex];
                await db.variables.put(variableToUpdate);
            } catch (error) {
                console.error('Failed to update variable in Dexie:', error);
            }
        },
        addVariable: async (variable) => {
            const variables = [...get().variables, variable];
            set({ variables });

            try {
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
                    variables.push({
                        columnIndex: i,
                        name: '',
                        type: '',
                        width: 0,
                        decimals: 0,
                        label: '',
                        values: '',
                        missing: '',
                        columns: 0,
                        align: '',
                        measure: '',
                    });
                }

                set({ variables });
            } catch (error) {
                console.error('Failed to fetch variables from Dexie:', error);
            }
        },
        createNextVariable: async (overrides = {}) => {
            const { variables } = get();

            const varNumbers = variables
                .map(v => {
                    const match = v.name.match(/^VAR(\d+)$/);
                    return match ? parseInt(match[1], 10) : 0;
                })
                .filter(num => num > 0);
            const maxNumber = varNumbers.length ? Math.max(...varNumbers) : 0;

            const currentMaxIndex = variables.length ? Math.max(...variables.map(v => v.columnIndex)) : -1;

            const requestedIndex = overrides.columnIndex !== undefined ? overrides.columnIndex : currentMaxIndex + 1;

            if (requestedIndex > currentMaxIndex + 1) {
                for (let fillIndex = currentMaxIndex + 1; fillIndex < requestedIndex; fillIndex++) {
                    const fillName = `VAR${maxNumber + 1 + (fillIndex - (currentMaxIndex + 1))}`;
                    const fillVariable: VariableRow = {
                        columnIndex: fillIndex,
                        name: fillName,
                        type: 'Numeric',
                        width: 8,
                        decimals: 2,
                        label: '',
                        values: 'None',
                        missing: 'None',
                        columns: 8,
                        align: 'Right',
                        measure: 'Nominal',
                    };
                    await get().addVariable(fillVariable);
                    variables.push(fillVariable);
                }
            }

            const modifiedOverrides = { ...overrides };
            if (modifiedOverrides.type === 'string') {
                modifiedOverrides.decimals = 0;
                modifiedOverrides.align = 'Left';
            }

            const newName = `VAR${maxNumber + 1 + (requestedIndex - (currentMaxIndex + 1))}`;
            const defaultVariable: VariableRow = {
                columnIndex: requestedIndex,
                name: newName,
                type: 'Numeric',
                width: 8,
                decimals: 2,
                label: '',
                values: 'None',
                missing: 'None',
                columns: 8,
                align: 'Right',
                measure: 'Nominal',
            };

            const newVariable: VariableRow = { ...defaultVariable, ...modifiedOverrides };
            await get().addVariable(newVariable);
        },
    }))
);

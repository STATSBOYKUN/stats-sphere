import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import db from "@/lib/db";
import { Variable } from "@/lib/db";

interface VariableStoreState {
    variables: Variable[];
    isLoading: boolean;
    error: string | null;

    setVariables: (variables: Variable[]) => void;
    updateVariable: <K extends keyof Variable>(
        rowIndex: number,
        field: K,
        value: Variable[K]
    ) => Promise<void>;
    addVariable: (variable: Variable) => Promise<void>;
    getVariableByColumnIndex: (columnIndex: number) => Variable | undefined;
    loadVariables: () => Promise<void>;
    resetVariables: () => Promise<void>;
    getAvailableVariables: () => Promise<Variable[]>;
    getTotalVariable: () => Promise<number>;
}

const createDefaultVariable = (index: number): Variable => ({
    columnIndex: index,
    name: "",
    type: "NUMERIC",
    width: 8,
    decimals: 2,
    label: "",
    values: [],
    missing: [],
    columns: 200,
    align: "right",
    measure: "scale",
    role: "input",
});

export const useVariableStore = create<VariableStoreState>()(
    devtools(
        immer((set, get) => ({
            variables: [],
            isLoading: false,
            error: null,

            setVariables: (variables) => {
                set((draft) => {
                    draft.variables = variables;
                });
            },

            updateVariable: async <K extends keyof Variable>(
                rowIndex: number,
                field: K,
                value: Variable[K]
            ) => {
                set((draft) => {
                    if (rowIndex >= draft.variables.length) {
                        const currentLength = draft.variables.length;
                        for (let i = currentLength; i <= rowIndex; i++) {
                            draft.variables.push(createDefaultVariable(i));
                        }
                    }
                    draft.variables[rowIndex][field] = value;
                });
                try {
                    await db.variables.put(get().variables[rowIndex]);
                } catch (error: any) {
                    set((draft) => {
                        draft.error = error.message || "Error updating variable";
                    });
                }
            },

            addVariable: async (variable) => {
                set((draft) => {
                    if (variable.columnIndex >= draft.variables.length) {
                        const currentLength = draft.variables.length;
                        for (let i = currentLength; i <= variable.columnIndex; i++) {
                            draft.variables.push(createDefaultVariable(i));
                        }
                    }
                    const existingIndex = draft.variables.findIndex(
                        (v) => v.columnIndex === variable.columnIndex
                    );
                    if (existingIndex !== -1) {
                        draft.variables[existingIndex] = variable;
                    } else {
                        draft.variables[variable.columnIndex] = variable;
                    }
                });
                try {
                    await db.variables.put(variable);
                } catch (error: any) {
                    set((draft) => {
                        draft.error = error.message || "Error adding/updating variable";
                    });
                }
            },

            getVariableByColumnIndex: (columnIndex) => {
                const variable = get().variables.find((v) => v.columnIndex === columnIndex);
                if (variable && variable.name === "") {
                    return undefined;
                }
                return variable;
            },

            loadVariables: async () => {
                set((draft) => {
                    draft.isLoading = true;
                    draft.error = null;
                });
                try {
                    const variablesFromDb = await db.variables.toArray();
                    const lastVariable = await db.variables.orderBy("columnIndex").last();
                    const maxColumn = lastVariable ? lastVariable.columnIndex + 1 : 0;
                    const newVariables: Variable[] = Array.from({ length: maxColumn }, (_, i) => {
                        const found = variablesFromDb.find((v) => v.columnIndex === i);
                        return found ? found : createDefaultVariable(i);
                    });
                    set((draft) => {
                        draft.variables = newVariables;
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = error.message || "Error loading variables";
                    });
                } finally {
                    set((draft) => {
                        draft.isLoading = false;
                    });
                }
            },

            resetVariables: async () => {
                try {
                    await db.variables.clear();
                    set((draft) => {
                        draft.variables = [];
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = error.message || "Error resetting variables";
                    });
                }
            },

            getAvailableVariables: async (): Promise<Variable[]> => {
                try {
                    const availableVariables = await db.variables.toArray();
                    return availableVariables;
                } catch (error: any) {
                    return [];
                }
            },

            getTotalVariable: async () => {
                try {
                    const variable = await db.variables.orderBy("columnIndex").last();
                    return variable ? variable.columnIndex + 1 : 0;
                } catch (error: any) {
                    return 0;
                }
            },
        }))
    )
);

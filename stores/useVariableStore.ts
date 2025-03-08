import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import db from "@/lib/db";
import { Variable } from "@/lib/db";

const createDefaultVariable = (index: number, existingVariables: Variable[] = []): Variable => {
    const regex = /^var(\d+)$/;
    let maxNum = 0;
    existingVariables.forEach(v => {
        const match = v.name.match(regex);
        if (match) {
            const num = parseInt(match[1]);
            if (num > maxNum) maxNum = num;
        }
    });
    return {
        columnIndex: index,
        name: `var${maxNum + 1}`,
        type: "NUMERIC",
        width: 8,
        decimals: 2,
        label: "",
        values: [],
        missing: [],
        columns: 64,
        align: "right",
        measure: "scale",
        role: "input",
    };
};

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
    createVariable: (columnIndex: number, data: (string | number)[]) => Promise<void>;
    overwriteVariables: (variables: Variable[]) => Promise<void>;
}

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
                            draft.variables.push(createDefaultVariable(i, draft.variables));
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
                            draft.variables.push(createDefaultVariable(i, draft.variables));
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
                        return found ? found : createDefaultVariable(i, variablesFromDb);
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
                return get().variables.length;
            },

            createVariable: async (columnIndex, data) => {
                set((draft) => {
                    if (columnIndex >= draft.variables.length) {
                        const currentLength = draft.variables.length;
                        for (let i = currentLength; i <= columnIndex; i++) {
                            draft.variables.push(createDefaultVariable(i, draft.variables));
                        }
                    }
                    const nonEmptyData = data.filter(d => d !== "");
                    const allNumeric = nonEmptyData.every(
                        d => typeof d === "number" || (!isNaN(Number(d)) && d !== "")
                    );
                    let variable = createDefaultVariable(columnIndex, draft.variables);
                    if (!allNumeric) {
                        const maxWidth = nonEmptyData.reduce<number>(
                            (max: number, d: string | number): number => {
                                const str = String(d);
                                return Math.max(max, str.length);
                            },
                            0
                        );
                        variable = { ...variable, type: "STRING", width: maxWidth || variable.width };
                    }
                    draft.variables[columnIndex] = variable;
                });
                try {
                    const newVariable = get().variables[columnIndex];
                    await db.variables.put(newVariable);
                } catch (error: any) {
                    set((draft) => {
                        draft.error = error.message || "Error creating variable";
                    });
                }
            },


            overwriteVariables: async (newVariables) => {
                set((draft) => {
                    draft.variables = newVariables;
                });
                try {
                    await db.variables.clear();
                    await Promise.all(newVariables.map((variable) => db.variables.put(variable)));
                } catch (error: any) {
                    set((draft) => {
                        draft.error = error.message || "Error overwriting variables";
                    });
                }
            },
        }))
    )
);

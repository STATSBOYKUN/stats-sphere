import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { devtools } from "zustand/middleware";
import db from "@/lib/db";
import { Variable } from "@/types/Variable";
import { ValueLabel } from "@/types/ValueLabel";

export type VariableStoreError = {
    message: string;
    source: string;
    originalError?: any;
};

const processVariableName = (name: string, existingVariables: Variable[]): {
    isValid: boolean;
    message?: string;
    processedName?: string;
} => {
    if (!name) {
        return { isValid: false, message: "Variable name cannot be empty" };
    }

    let processedName = name;

    if (!/^[a-zA-Z@#$]/.test(processedName)) {
        processedName = 'var_' + processedName;
    }

    processedName = processedName
        .replace(/[^a-zA-Z0-9@#$_.]/g, '_')
        .replace(/\s+/g, '_')
        .replace(/\.$/, '_');

    if (processedName.length > 64) {
        processedName = processedName.substring(0, 64);
    }

    const existingNames = existingVariables.map(v => v.name.toLowerCase());
    if (existingNames.includes(processedName.toLowerCase())) {
        let counter = 1;
        let uniqueName = processedName;

        while (existingNames.includes(uniqueName.toLowerCase())) {
            uniqueName = `${processedName.substring(0, 60)}_${counter}`;
            counter++;
        }

        processedName = uniqueName;
    }

    return { isValid: true, processedName };
};

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

    const baseName = `var${maxNum + 1}`;
    const nameResult = processVariableName(baseName, existingVariables);

    return {
        columnIndex: index,
        name: nameResult.processedName || baseName,
        type: "NUMERIC",
        width: 8,
        decimals: 2,
        label: "",
        values: [],
        missing: [],
        columns: 64,
        align: "right",
        measure: "scale",
        role: "input"
    };
};

interface VariableStoreState {
    variables: Variable[];
    isLoading: boolean;
    error: VariableStoreError | null;
    selectedVariable: number | null;
    lastUpdated: Date | null;

    setVariables: (variables: Variable[]) => void;
    updateVariable: <K extends keyof Variable>(
        identifier: number | string,
        field: K,
        value: Variable[K]
    ) => Promise<void>;
    addVariable: (columnIndex?: number, variableData?: Partial<Variable>) => Promise<void>;
    getVariableByColumnIndex: (columnIndex: number) => Variable | undefined;
    getVariableByName: (name: string) => Variable | undefined;
    loadVariables: () => Promise<void>;
    resetVariables: () => Promise<void>;
    deleteVariable: (columnIndex: number) => Promise<void>;
    selectVariable: (columnIndex: number | null) => void;
    overwriteVariables: (variables: Variable[]) => Promise<void>;
}

export const useVariableStore = create<VariableStoreState>()(
    devtools(
        immer((set, get) => ({
            variables: [],
            isLoading: false,
            error: null,
            selectedVariable: null,
            lastUpdated: null,

            setVariables: (variables) => {
                set((draft) => {
                    draft.variables = variables;
                    draft.lastUpdated = new Date();
                });
            },

            updateVariable: async <K extends keyof Variable>(
                identifier: number | string,
                field: K,
                value: Variable[K]
            ) => {
                let variableToUpdate: Variable | undefined;
                let variableIndex: number;

                try {
                    await db.transaction('rw', db.variables, async () => {
                        if (typeof identifier === 'number') {
                            variableToUpdate = await db.variables.where('columnIndex').equals(identifier).first();
                            variableIndex = get().variables.findIndex(v => v.columnIndex === identifier);
                        } else {
                            variableToUpdate = await db.variables.where('name').equals(identifier).first();
                            variableIndex = get().variables.findIndex(v => v.name.toLowerCase() === identifier.toLowerCase());
                        }

                        if (!variableToUpdate) {
                            throw new Error(`Variable with identifier "${identifier}" not found`);
                        }

                        if (field === 'name' && typeof value === 'string') {
                            const otherVariables = get().variables.filter((_, i) => i !== variableIndex);
                            const nameResult = processVariableName(value as string, otherVariables);

                            if (!nameResult.isValid) {
                                throw new Error(nameResult.message || "Invalid variable name");
                            }

                            variableToUpdate[field] = nameResult.processedName as any;
                        } else {
                            variableToUpdate[field] = value;
                        }

                        await db.variables.put(variableToUpdate);

                        set((draft) => {
                            if (variableIndex !== -1) {
                                draft.variables[variableIndex] = variableToUpdate!;
                            }
                            draft.lastUpdated = new Date();
                        });
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error updating variable",
                            source: "updateVariable",
                            originalError: error
                        };
                    });
                }
            },

            addVariable: async (columnIndex?, variableData?) => {
                const targetIndex = columnIndex !== undefined ? columnIndex : get().variables.length;

                try {
                    await db.transaction('rw', db.variables, async () => {
                        const existingVariables = [...get().variables];
                        const defaultVar = createDefaultVariable(targetIndex, existingVariables);

                        const newVariable: Variable = {
                            ...defaultVar,
                            ...variableData,
                            columnIndex: targetIndex
                        };

                        if (variableData?.name) {
                            const nameResult = processVariableName(variableData.name, existingVariables);
                            if (nameResult.isValid && nameResult.processedName) {
                                newVariable.name = nameResult.processedName;
                            }
                        }

                        const updatedVariables = [...existingVariables];

                        for (let i = 0; i < updatedVariables.length; i++) {
                            if (updatedVariables[i].columnIndex >= targetIndex) {
                                updatedVariables[i].columnIndex += 1;
                                await db.variables.put(updatedVariables[i]);
                            }
                        }

                        const id = await db.variables.add(newVariable);

                        set((draft) => {
                            for (let i = 0; i < draft.variables.length; i++) {
                                if (draft.variables[i].columnIndex >= targetIndex) {
                                    draft.variables[i].columnIndex += 1;
                                }
                            }

                            draft.variables.push({...newVariable, id});
                            draft.variables.sort((a, b) => a.columnIndex - b.columnIndex);
                            draft.lastUpdated = new Date();
                        });
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error adding variable",
                            source: "addVariable",
                            originalError: error
                        };
                    });

                    await get().loadVariables();
                }
            },

            getVariableByColumnIndex: (columnIndex) => {
                const variable = get().variables.find((v) => v.columnIndex === columnIndex);
                if (variable && variable.name === "") {
                    return undefined;
                }
                return variable;
            },

            getVariableByName: (name) => {
                return get().variables.find(v =>
                    v.name.toLowerCase() === name.toLowerCase()
                );
            },

            loadVariables: async () => {
                set((draft) => {
                    draft.isLoading = true;
                    draft.error = null;
                });

                try {
                    await db.transaction('r', db.variables, async () => {
                        const variablesFromDb = await db.variables.toArray();

                        const normalizedVariables = variablesFromDb
                            .sort((a, b) => a.columnIndex - b.columnIndex)
                            .map((variable, index) => ({
                                ...variable,
                                columnIndex: index
                            }));

                        set((draft) => {
                            draft.variables = normalizedVariables;
                            draft.lastUpdated = new Date();
                            draft.isLoading = false;
                        });

                        if (JSON.stringify(variablesFromDb.map(v => v.columnIndex)) !==
                            JSON.stringify(normalizedVariables.map(v => v.columnIndex))) {
                            await db.variables.clear();
                            await db.variables.bulkPut(normalizedVariables);
                        }
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error loading variables",
                            source: "loadVariables",
                            originalError: error
                        };
                        draft.isLoading = false;
                    });
                }
            },

            resetVariables: async () => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        await db.variables.clear();

                        set((draft) => {
                            draft.variables = [];
                            draft.lastUpdated = new Date();
                        });
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error resetting variables",
                            source: "resetVariables",
                            originalError: error
                        };
                    });
                }
            },

            deleteVariable: async (columnIndex: number) => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        const variableToDelete = await db.variables.where('columnIndex').equals(columnIndex).first();

                        if (!variableToDelete) {
                            throw new Error(`Variable with column index ${columnIndex} not found`);
                        }

                        await db.variables.delete(variableToDelete.id!);

                        await db.variables
                            .where('columnIndex')
                            .above(columnIndex)
                            .modify(variable => {
                                variable.columnIndex--;
                            });

                        set((draft) => {
                            const variableIndex = draft.variables.findIndex(v => v.columnIndex === columnIndex);

                            if (variableIndex !== -1) {
                                draft.variables.splice(variableIndex, 1);

                                for (let i = 0; i < draft.variables.length; i++) {
                                    if (draft.variables[i].columnIndex > columnIndex) {
                                        draft.variables[i].columnIndex -= 1;
                                    }
                                }

                                draft.lastUpdated = new Date();

                                if (draft.selectedVariable === columnIndex) {
                                    draft.selectedVariable = null;
                                } else if (draft.selectedVariable !== null && draft.selectedVariable > columnIndex) {
                                    draft.selectedVariable -= 1;
                                }
                            }
                        });
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error deleting variable",
                            source: "deleteVariable",
                            originalError: error
                        };
                    });

                    await get().loadVariables();
                }
            },

            selectVariable: (columnIndex: number | null) => {
                set((draft) => {
                    draft.selectedVariable = columnIndex;
                });
            },

            overwriteVariables: async (newVariables) => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        const normalizedVariables = [...newVariables]
                            .sort((a, b) => a.columnIndex - b.columnIndex)
                            .map((variable, index) => ({
                                ...variable,
                                columnIndex: index
                            }));

                        await db.variables.clear();
                        await db.variables.bulkPut(normalizedVariables);

                        set((draft) => {
                            draft.variables = normalizedVariables;
                            draft.lastUpdated = new Date();
                        });
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error overwriting variables",
                            source: "overwriteVariables",
                            originalError: error
                        };
                    });
                }
            }
        }))
    )
);
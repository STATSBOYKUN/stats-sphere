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

const inferDefaultValues = (type: Variable['type']): Partial<Variable> => {
    const numericTypes: Variable['type'][] = ["NUMERIC", "DOT", "COMMA", "SCIENTIFIC"];

    return {
        decimals: numericTypes.includes(type) ? 2 : 0,
        align: type === "STRING" ? "left" : "right",
        measure: "unknown",
        role: "input"
    };
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
        measure: "unknown",
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
    addVariable: (variableData?: Partial<Variable>) => Promise<void>;
    getVariableByColumnIndex: (columnIndex: number) => Variable | undefined;
    getVariableByName: (name: string) => Variable | undefined;
    loadVariables: () => Promise<void>;
    resetVariables: () => Promise<void>;
    deleteVariable: (columnIndex: number) => Promise<void>;
    selectVariable: (columnIndex: number | null) => void;
    overwriteVariables: (variables: Variable[]) => Promise<void>;
    addMultipleVariables: (variablesData: Partial<Variable>[]) => Promise<void>;
    sortVariables: (direction: 'asc' | 'desc', columnIndex: number) => Promise<void>;
    ensureCompleteVariables: () => Promise<void>;
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

            ensureCompleteVariables: async () => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        const existingVariables = [...get().variables];
                        const maxIndex = existingVariables.length > 0
                            ? Math.max(...existingVariables.map(v => v.columnIndex))
                            : -1;

                        if (maxIndex === -1) return;

                        const newVariables: Variable[] = [];
                        const existingIndices = new Set(existingVariables.map(v => v.columnIndex));

                        for (let i = 0; i <= maxIndex; i++) {
                            if (!existingIndices.has(i)) {
                                const defaultVar = createDefaultVariable(i, [...existingVariables, ...newVariables]);
                                newVariables.push(defaultVar);
                            }
                        }

                        if (newVariables.length > 0) {
                            const ids = await db.variables.bulkAdd(newVariables, { allKeys: true });

                            set((draft) => {
                                const variablesWithIds = newVariables.map((v, idx) => ({
                                    ...v,
                                    id: ids[idx]
                                }));

                                draft.variables.push(...variablesWithIds);
                                draft.variables.sort((a, b) => a.columnIndex - b.columnIndex);
                                draft.lastUpdated = new Date();
                            });
                        }
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error ensuring complete variables",
                            source: "ensureCompleteVariables",
                            originalError: error
                        };
                    });
                }
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

            addVariable: async (variableData?: Partial<Variable>) => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        const existingVariables = [...get().variables];

                        const targetIndex = variableData?.columnIndex !== undefined
                            ? variableData.columnIndex
                            : existingVariables.length;

                        const defaultVar = createDefaultVariable(targetIndex, existingVariables);

                        const inferredValues = variableData?.type
                            ? inferDefaultValues(variableData.type)
                            : {};

                        const newVariable: Variable = {
                            ...defaultVar,
                            ...inferredValues,
                            ...variableData,
                            columnIndex: targetIndex
                        };

                        if (variableData?.name) {
                            const nameResult = processVariableName(variableData.name, existingVariables);
                            if (nameResult.isValid && nameResult.processedName) {
                                newVariable.name = nameResult.processedName;
                            }
                        }

                        for (let i = 0; i < existingVariables.length; i++) {
                            if (existingVariables[i].columnIndex >= targetIndex) {
                                const updatedVariable = {
                                    ...existingVariables[i],
                                    columnIndex: existingVariables[i].columnIndex + 1
                                };

                                await db.variables.put(updatedVariable);
                            }
                        }

                        const id = await db.variables.add(newVariable);

                        set((draft) => {
                            for (let i = 0; i < draft.variables.length; i++) {
                                if (draft.variables[i].columnIndex >= targetIndex) {
                                    draft.variables[i] = {
                                        ...draft.variables[i],
                                        columnIndex: draft.variables[i].columnIndex + 1
                                    };
                                }
                            }

                            draft.variables.push({...newVariable, id});
                            draft.variables.sort((a, b) => a.columnIndex - b.columnIndex);
                            draft.lastUpdated = new Date();
                        });

                        await get().ensureCompleteVariables();
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

            addMultipleVariables: async (variablesData: Partial<Variable>[]) => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        const existingVariables = [...get().variables];
                        const newVariables: Variable[] = [];

                        for (let i = 0; i < variablesData.length; i++) {
                            const variableData = variablesData[i];
                            const targetIndex = variableData.columnIndex !== undefined
                                ? variableData.columnIndex
                                : existingVariables.length + i;

                            const defaultVar = createDefaultVariable(targetIndex, [
                                ...existingVariables,
                                ...newVariables
                            ]);

                            const inferredValues = variableData.type
                                ? inferDefaultValues(variableData.type)
                                : {};

                            const newVariable: Variable = {
                                ...defaultVar,
                                ...inferredValues,
                                ...variableData,
                                columnIndex: targetIndex
                            };

                            if (variableData.name) {
                                const nameResult = processVariableName(
                                    variableData.name,
                                    [...existingVariables, ...newVariables]
                                );
                                if (nameResult.isValid && nameResult.processedName) {
                                    newVariable.name = nameResult.processedName;
                                }
                            }

                            newVariables.push(newVariable);
                        }

                        const columnIndices = newVariables.map(v => v.columnIndex).sort((a, b) => a - b);
                        const lowestNewIndex = columnIndices[0];

                        for (let i = 0; i < existingVariables.length; i++) {
                            if (existingVariables[i].columnIndex >= lowestNewIndex) {
                                existingVariables[i].columnIndex += newVariables.length;
                                await db.variables.put(existingVariables[i]);
                            }
                        }

                        const ids = await db.variables.bulkAdd(newVariables, { allKeys: true });

                        set((draft) => {
                            for (let i = 0; i < draft.variables.length; i++) {
                                if (draft.variables[i].columnIndex >= lowestNewIndex) {
                                    draft.variables[i].columnIndex += newVariables.length;
                                }
                            }

                            const variablesWithIds = newVariables.map((v, i) => ({
                                ...v,
                                id: ids[i]
                            }));

                            draft.variables.push(...variablesWithIds);
                            draft.variables.sort((a, b) => a.columnIndex - b.columnIndex);
                            draft.lastUpdated = new Date();
                        });

                        await get().ensureCompleteVariables();
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error adding multiple variables",
                            source: "addMultipleVariables",
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
                        const sortedVariables = variablesFromDb.sort((a, b) => a.columnIndex - b.columnIndex);

                        set((draft) => {
                            draft.variables = sortedVariables;
                            draft.lastUpdated = new Date();
                            draft.isLoading = false;
                        });

                        await get().ensureCompleteVariables();
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
                        const normalizedVariables = [...newVariables].sort((a, b) => a.columnIndex - b.columnIndex);
                        await db.variables.clear();
                        await db.variables.bulkPut(normalizedVariables);

                        set((draft) => {
                            draft.variables = normalizedVariables;
                            draft.lastUpdated = new Date();
                        });

                        await get().ensureCompleteVariables();
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
            },

            sortVariables: async (direction: 'asc' | 'desc', columnIndex: number) => {
                try {
                    await db.transaction('rw', db.variables, async () => {
                        const variables = [...get().variables];

                        const field = getFieldNameByColumnIndex(columnIndex);
                        if (!field) return;

                        variables.sort((a, b) => {
                            const aValue = a[field as keyof Variable];
                            const bValue = b[field as keyof Variable];

                            if (typeof aValue === 'number' && typeof bValue === 'number') {
                                return direction === 'asc' ? aValue - bValue : bValue - aValue;
                            }

                            const aStr = String(aValue || '').toLowerCase();
                            const bStr = String(bValue || '').toLowerCase();

                            return direction === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
                        });

                        const updatedVariables = variables.map((variable, index) => ({
                            ...variable,
                            columnIndex: index
                        }));

                        await db.variables.clear();
                        await db.variables.bulkPut(updatedVariables);

                        set((draft) => {
                            draft.variables = updatedVariables;
                            draft.lastUpdated = new Date();
                        });
                    });
                } catch (error: any) {
                    set((draft) => {
                        draft.error = {
                            message: error.message || "Error sorting variables",
                            source: "sortVariables",
                            originalError: error
                        };
                    });
                }
            }
        }))
    )
);

function getFieldNameByColumnIndex(columnIndex: number): string | null {
    const fieldMapping = [
        "name",
        "type",
        "width",
        "decimals",
        "label",
        "values",
        "missing",
        "columns",
        "align",
        "measure",
        "role"
    ];

    return columnIndex >= 0 && columnIndex < fieldMapping.length ? fieldMapping[columnIndex] : null;
}
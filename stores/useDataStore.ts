import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import db from "@/lib/db";
import { Variable } from "@/types/Variable";
import { WritableDraft } from "immer";

export type DataRow = (string | number)[];
export type CellUpdate = { row: number; col: number; value: string | number };

export type DataStoreError = {
    message: string;
    source: string;
    originalError?: any;
};

export interface DataStoreState {
    data: DataRow[];
    isLoading: boolean;
    error: DataStoreError | null;
    lastUpdated: Date | null;
    selectedCell: { row: number; col: number } | null;

    setData: (data: DataRow[]) => void;
    updateCell: (row: number, col: number, value: string | number) => Promise<void>;
    loadData: () => Promise<void>;
    resetData: () => Promise<void>;
    getVariableData: (variable: Variable) => Promise<{ variable: Variable, data: (string | number)[] }>;
    updateBulkCells: (updates: CellUpdate[]) => Promise<void>;
    setDataAndSync: (newData: DataRow[]) => Promise<void>;

    addRow: (index?: number) => Promise<void>;
    addColumn: (index?: number) => Promise<void>;
    deleteRow: (index: number) => Promise<void>;
    deleteColumn: (index: number) => Promise<void>;
    validateVariableData: (columnIndex: number, type: string, width: number) => Promise<{
        isValid: boolean;
        issues: Array<{ row: number; message: string }>
    }>;
    selectCell: (row: number | null, col: number | null) => void;
    sortData: (columnIndex: number, direction: 'asc' | 'desc') => Promise<void>;
    swapRows: (row1: number, row2: number) => Promise<void>;
    swapColumns: (col1: number, col2: number) => Promise<void>;
    ensureMatrixDimensions: (maxRow: number, maxCol: number, minColCount?: number) => void;
}

export const useDataStore = create<DataStoreState>()(
    devtools(
        immer((set, get) => ({
            data: [],
            isLoading: false,
            error: null,
            lastUpdated: null,
            selectedCell: null,

            setData: (data: DataRow[]) =>
                set((state) => {
                    state.data = data;
                    state.lastUpdated = new Date();
                }),

            ensureMatrixDimensions: (maxRow, maxCol, minColCount) => {
                set((state) => {
                    const effectiveMaxCol = minColCount !== undefined ?
                        Math.max(maxCol, minColCount - 1) : maxCol;

                    if (state.data.length === 0) {
                        if (maxRow >= 0 || effectiveMaxCol >= 0) {
                            const rowsCount = maxRow + 1;
                            const colsCount = effectiveMaxCol + 1;

                            state.data = Array.from({ length: rowsCount },
                                () => Array(colsCount).fill(""));
                            state.lastUpdated = new Date();
                        }
                        return;
                    }

                    if (maxRow >= state.data.length) {
                        const colsCount = Math.max(
                            state.data[0].length,
                            effectiveMaxCol + 1
                        );

                        for (let i = state.data.length; i <= maxRow; i++) {
                            state.data.push(Array(colsCount).fill(""));
                        }
                    }

                    if (state.data.length > 0 && effectiveMaxCol >= state.data[0].length) {
                        const additionalColsCount = effectiveMaxCol + 1 - state.data[0].length;

                        if (additionalColsCount > 0) {
                            for (let i = 0; i < state.data.length; i++) {
                                state.data[i].push(...Array(additionalColsCount).fill(""));
                            }
                        }
                    }

                    state.lastUpdated = new Date();
                });
            },

            updateCell: async (row, col, value) => {
                const currentData = get().data;

                if (row < currentData.length && col < currentData[0]?.length) {
                    if (currentData[row][col] === value) {
                        return;
                    }
                }

                set((state) => {
                    get().ensureMatrixDimensions(row, col);
                    state.data[row][col] = value;
                    state.lastUpdated = new Date();
                });

                try {
                    if (value === "") {
                        await db.cells.where({ row, col }).delete();
                    } else {
                        await db.cells.put({ row, col, value });
                    }
                } catch (error: any) {
                    console.error("Failed to update cell:", error);
                    set((state) => {
                        state.error = {
                            message: "Failed to update cell in database",
                            source: "updateCell",
                            originalError: error
                        };
                    });
                    await get().loadData();
                }
            },

            loadData: async () => {
                set((state) => {
                    state.isLoading = true;
                    state.error = null;
                });

                try {
                    const [lastRowCell, lastColCell] = await Promise.all([
                        db.cells.orderBy("row").last(),
                        db.cells.orderBy("col").last()
                    ]);

                    const maxRow = lastRowCell ? lastRowCell.row + 1 : 0;
                    const maxCol = lastColCell ? lastColCell.col + 1 : 0;

                    if (maxRow === 0 || maxCol === 0) {
                        set((state) => {
                            state.data = [];
                            state.lastUpdated = new Date();
                            state.isLoading = false;
                        });
                        return;
                    }

                    const availableMatrix = Array.from({ length: maxRow }, () => Array(maxCol).fill(""));

                    await db.transaction('r', db.cells, async () => {
                        const cells = await db.cells.toArray();
                        cells.forEach((cell) => {
                            availableMatrix[cell.row][cell.col] = cell.value;
                        });
                    });

                    set((state) => {
                        state.data = availableMatrix;
                        state.lastUpdated = new Date();
                        state.isLoading = false;
                    });
                } catch (error: any) {
                    console.error("Failed to load data:", error);
                    set((state) => {
                        state.error = {
                            message: error.message || "Error loading data",
                            source: "loadData",
                            originalError: error
                        };
                        state.isLoading = false;
                    });
                }
            },

            addRow: async (index?) => {
                set((state) => {
                    const rowIndex = index !== undefined ? index : state.data.length;
                    const colCount = state.data.length > 0 ? state.data[0].length : 0;
                    const newRow = Array(colCount).fill("");

                    state.data = [
                        ...state.data.slice(0, rowIndex),
                        newRow,
                        ...state.data.slice(rowIndex)
                    ];

                    state.lastUpdated = new Date();
                });

                await get().setDataAndSync(get().data);
            },

            addColumn: async (index?) => {
                set((state) => {
                    const colIndex = index !== undefined ? index :
                        (state.data.length > 0 ? state.data[0].length : 0);

                    state.data = state.data.map(row => {
                        const newRow = [...row];
                        newRow.splice(colIndex, 0, "");
                        return newRow;
                    });

                    state.lastUpdated = new Date();
                });

                await get().setDataAndSync(get().data);
            },

            deleteRow: async (index: number) => {
                set((state) => {
                    if (index < 0 || index >= state.data.length) {
                        state.error = {
                            message: "Invalid row index",
                            source: "deleteRow"
                        };
                        return;
                    }

                    state.data = [
                        ...state.data.slice(0, index),
                        ...state.data.slice(index + 1)
                    ];

                    state.lastUpdated = new Date();
                });

                await get().setDataAndSync(get().data);
            },

            deleteColumn: async (index: number) => {
                set((state) => {
                    if (state.data.length === 0 || index < 0 ||
                        (state.data.length > 0 && index >= state.data[0].length)) {
                        state.error = {
                            message: "Invalid column index",
                            source: "deleteColumn"
                        };
                        return;
                    }

                    state.data = state.data.map(row => {
                        const newRow = [...row];
                        newRow.splice(index, 1);
                        return newRow;
                    });

                    state.lastUpdated = new Date();
                });

                await get().setDataAndSync(get().data);
            },

            validateVariableData: async (columnIndex: number, type: string, width: number) => {
                const { data } = get();
                const updates: CellUpdate[] = [];
                const result = {
                    isValid: true,
                    issues: [] as Array<{ row: number; message: string }>
                };

                if (data.length === 0) return result;

                for (let row = 0; row < data.length; row++) {
                    if (columnIndex >= data[row].length) continue;

                    const value = data[row][columnIndex];
                    if (value === "" || value === null || value === undefined) continue;

                    if (type.startsWith("NUMERIC") || ["COMMA", "DOT", "SCIENTIFIC"].includes(type)) {
                        if (typeof value !== 'number' && isNaN(Number(value))) {
                            result.issues.push({
                                row,
                                message: `Row ${row + 1}: Value "${value}" is not a valid number`
                            });
                            result.isValid = false;
                            updates.push({ row, col: columnIndex, value: "" });
                            continue;
                        }

                        const numValue = typeof value === 'number' ? value : Number(value);
                        const valueStr = numValue.toString();

                        if (valueStr.length > width) {
                            result.issues.push({
                                row,
                                message: `Row ${row + 1}: Number "${value}" exceeds width (${valueStr.length} digits, max allowed is ${width})`
                            });
                            result.isValid = false;
                            updates.push({ row, col: columnIndex, value: "" });
                        }
                    } else if (type === "STRING") {
                        const strValue = String(value);
                        if (strValue.length > width) {
                            result.issues.push({
                                row,
                                message: `Row ${row + 1}: String "${strValue}" is too long (${strValue.length} chars, max allowed is ${width})`
                            });
                            result.isValid = false;
                            updates.push({ row, col: columnIndex, value: strValue.substring(0, width) });
                        }
                    } else if (["DATE", "ADATE", "EDATE", "SDATE", "JDATE"].includes(type)) {
                        const dateStr = String(value);
                        const isValidDate = !isNaN(Date.parse(dateStr));

                        if (!isValidDate) {
                            result.issues.push({
                                row,
                                message: `Row ${row + 1}: Value "${dateStr}" is not a valid date`
                            });
                            result.isValid = false;
                            updates.push({ row, col: columnIndex, value: "" });
                        }
                    }
                }

                if (updates.length > 0) {
                    await get().updateBulkCells(updates);
                }

                return result;
            },

            selectCell: (row: number | null, col: number | null) => {
                set((state) => {
                    if (row === null || col === null) {
                        state.selectedCell = null;
                    } else {
                        state.selectedCell = { row, col };
                    }
                });
            },

            resetData: async () => {
                try {
                    await db.transaction('rw', db.cells, async () => {
                        await db.cells.clear();
                    });

                    set((state) => {
                        state.data = [];
                        state.lastUpdated = new Date();
                    });
                } catch (error: any) {
                    console.error("Failed to reset data:", error);
                    set((state) => {
                        state.error = {
                            message: error.message || "Error resetting data",
                            source: "resetData",
                            originalError: error
                        };
                    });
                }
            },

            getVariableData: async (variable: Variable) => {
                if (get().data.length === 0) {
                    await get().loadData();
                }

                const { columnIndex } = variable;
                const storedData = get().data;

                const columnData = storedData.map(row =>
                    columnIndex < row.length ? row[columnIndex] : ""
                );

                return {
                    variable,
                    data: columnData
                };
            },

            updateBulkCells: async (updates) => {
                const { data } = get();

                const filteredUpdates = updates.filter(({ row, col, value }) => {
                    if (row < data.length && col < data[row].length) {
                        return data[row][col] !== value;
                    }
                    return true;
                });

                if (filteredUpdates.length === 0) {
                    return;
                }

                let maxRow = 0;
                let maxCol = 0;

                for (const { row, col } of filteredUpdates) {
                    maxRow = Math.max(maxRow, row);
                    maxCol = Math.max(maxCol, col);
                }

                set((state) => {
                    get().ensureMatrixDimensions(maxRow, maxCol);

                    for (const { row, col, value } of filteredUpdates) {
                        state.data[row][col] = value;
                    }

                    state.lastUpdated = new Date();
                });

                try {
                    await db.transaction('rw', db.cells, async () => {
                        const emptyUpdates = filteredUpdates.filter(({ value }) => value === "");
                        const nonEmptyUpdates = filteredUpdates.filter(({ value }) => value !== "");

                        if (emptyUpdates.length > 0) {
                            await Promise.all(
                                emptyUpdates.map(({ row, col }) =>
                                    db.cells.where('[col+row]').equals([col, row]).delete()
                                )
                            );
                        }

                        if (nonEmptyUpdates.length > 0) {
                            await db.cells.bulkPut(nonEmptyUpdates);
                        }
                    });
                } catch (error: any) {
                    console.error("Bulk update failed:", error);
                    set((state) => {
                        state.error = {
                            message: "Bulk update failed",
                            source: "updateBulkCells",
                            originalError: error
                        };
                    });
                    await get().loadData();
                }
            },

            setDataAndSync: async (newData) => {
                const currentData = get().data;

                if (JSON.stringify(currentData) === JSON.stringify(newData)) {
                    return;
                }

                set((state) => {
                    state.data = newData;
                    state.lastUpdated = new Date();
                });

                try {
                    await db.transaction('rw', db.cells, async () => {
                        await db.cells.clear();

                        const cells = [];
                        for (let row = 0; row < newData.length; row++) {
                            for (let col = 0; col < newData[row].length; col++) {
                                if (newData[row][col] !== "") {
                                    cells.push({ row, col, value: newData[row][col] });
                                }
                            }
                        }

                        if (cells.length > 0) {
                            await db.cells.bulkPut(cells);
                        }
                    });
                } catch (error: any) {
                    console.error("Failed to sync data:", error);
                    set((state) => {
                        state.error = {
                            message: "Failed to sync data with database",
                            source: "setDataAndSync",
                            originalError: error
                        };
                    });
                    await get().loadData();
                }
            },

            sortData: async (columnIndex: number, direction: 'asc' | 'desc') => {
                const { data } = get();
                if (data.length === 0) return;

                const rowsToSort = [...data];

                rowsToSort.sort((rowA, rowB) => {
                    const valueA = columnIndex < rowA.length ? rowA[columnIndex] : "";
                    const valueB = columnIndex < rowB.length ? rowB[columnIndex] : "";

                    const isANumeric = typeof valueA === 'number' ||
                        (typeof valueA === 'string' && valueA !== "" && !isNaN(Number(valueA)));
                    const isBNumeric = typeof valueB === 'number' ||
                        (typeof valueB === 'string' && valueB !== "" && !isNaN(Number(valueB)));

                    if (isANumeric && isBNumeric) {
                        const numA = typeof valueA === 'number' ? valueA : Number(valueA);
                        const numB = typeof valueB === 'number' ? valueB : Number(valueB);
                        return direction === 'asc' ? numA - numB : numB - numA;
                    }

                    if (isANumeric && !isBNumeric) {
                        return direction === 'asc' ? -1 : 1;
                    }
                    if (!isANumeric && isBNumeric) {
                        return direction === 'asc' ? 1 : -1;
                    }

                    const strA = String(valueA || '').toLowerCase();
                    const strB = String(valueB || '').toLowerCase();
                    return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
                });

                set(state => {
                    state.data = rowsToSort;
                    state.lastUpdated = new Date();
                });

                await get().setDataAndSync(rowsToSort);
            },

            swapRows: async (row1: number, row2: number) => {
                set((state) => {
                    if (row1 < 0 || row2 < 0 || row1 >= state.data.length || row2 >= state.data.length) {
                        state.error = {
                            message: "Invalid row indices for swapping",
                            source: "swapRows"
                        };
                        return;
                    }

                    [state.data[row1], state.data[row2]] = [state.data[row2], state.data[row1]];
                    state.lastUpdated = new Date();
                });

                const currentData = get().data;
                await get().setDataAndSync(currentData);
            },

            swapColumns: async (col1: number, col2: number) => {
                set((state) => {
                    if (state.data.length === 0) return;

                    if (col1 < 0 || col2 < 0 || col1 >= state.data[0].length || col2 >= state.data[0].length) {
                        state.error = {
                            message: "Invalid column indices for swapping",
                            source: "swapColumns"
                        };
                        return;
                    }

                    for (let i = 0; i < state.data.length; i++) {
                        [state.data[i][col1], state.data[i][col2]] = [state.data[i][col2], state.data[i][col1]];
                    }

                    state.lastUpdated = new Date();
                });

                const currentData = get().data;
                await get().setDataAndSync(currentData);
            }
        }))
    )
);
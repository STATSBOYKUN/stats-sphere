import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import db from "@/lib/db";

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
    getAvailableData: (selectedColumns?: number[]) => Promise<DataRow[]>;
    updateBulkCells: (updates: CellUpdate[]) => Promise<void>;
    setDataAndSync: (newData: DataRow[]) => Promise<void>;

    addRow: (index?: number) => Promise<void>;
    addColumn: (index?: number) => Promise<void>;
    deleteRow: (index: number) => Promise<void>;
    deleteColumn: (index: number) => Promise<void>;
    sortData: (columnIndex: number, direction: 'asc' | 'desc') => Promise<void>;
    validateVariableData: (columnIndex: number, type: string, width: number) => Promise<{
        isValid: boolean;
        issues: Array<{ row: number; message: string }>
    }>;
    selectCell: (row: number | null, col: number | null) => void;
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

            updateCell: async (row, col, value) => {
                set((state) => {
                    if (row >= state.data.length || (state.data.length > 0 && col >= state.data[0].length)) {
                        const newRows = Math.max(state.data.length, row + 1);
                        const newCols = state.data.length > 0 ? Math.max(state.data[0].length, col + 1) : col + 1;
                        const newData = Array.from({ length: newRows }, (_, i) => {
                            if (i < state.data.length) {
                                const currentRow = state.data[i];
                                if (currentRow.length < newCols) {
                                    return [...currentRow, ...Array(newCols - currentRow.length).fill("")];
                                }
                                return [...currentRow];
                            } else {
                                return Array(newCols).fill("");
                            }
                        });
                        state.data = newData;
                    }
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

            sortData: async (columnIndex: number, direction: 'asc' | 'desc') => {
                set((state) => {
                    if (state.data.length === 0) return;

                    state.data = [...state.data].sort((rowA, rowB) => {
                        const valA = rowA.length > columnIndex ? rowA[columnIndex] : "";
                        const valB = rowB.length > columnIndex ? rowB[columnIndex] : "";

                        if (typeof valA === 'number' && typeof valB === 'number') {
                            return direction === 'asc' ? valA - valB : valB - valA;
                        }

                        const numA = Number(valA);
                        const numB = Number(valB);
                        if (!isNaN(numA) && !isNaN(numB)) {
                            return direction === 'asc' ? numA - numB : numB - numA;
                        }

                        const strA = String(valA).toLowerCase();
                        const strB = String(valB).toLowerCase();

                        return direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
                    });

                    state.lastUpdated = new Date();
                });

                await get().setDataAndSync(get().data);
            },

            validateVariableData: async (columnIndex: number, type: string, width: number) => {
                const { data } = get();
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
                        }
                    } else if (type === "STRING") {
                        const strValue = String(value);
                        if (strValue.length > width) {
                            result.issues.push({
                                row,
                                message: `Row ${row + 1}: String "${strValue}" is too long (${strValue.length} chars, max allowed is ${width})`
                            });
                            result.isValid = false;
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
                        }
                    }
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

            getAvailableData: async (selectedColumns?: number[]) => {
                if (get().data.length === 0) {
                    await get().loadData();
                }
                const storedData = get().data;
                if (!selectedColumns || selectedColumns.length === 0) {
                    return storedData;
                } else {
                    return storedData.map((row) =>
                        selectedColumns.map((col) => (row[col] !== undefined ? row[col] : ""))
                    );
                }
            },

            updateBulkCells: async (updates) => {
                const { data } = get();
                let newData = [...data];
                let maxRows = data.length;
                let maxCols = data.length > 0 ? data[0].length : 0;

                updates.forEach(({ row, col }) => {
                    maxRows = Math.max(maxRows, row + 1);
                    maxCols = Math.max(maxCols, col + 1);
                });

                if (maxRows > data.length || maxCols > (data[0]?.length || 0)) {
                    newData = Array.from({ length: maxRows }, (_, r) => {
                        if (r < data.length) {
                            const currentRow = data[r];
                            if (currentRow.length < maxCols) {
                                return [...currentRow, ...Array(maxCols - currentRow.length).fill("")];
                            }
                            return [...currentRow];
                        } else {
                            return Array(maxCols).fill("");
                        }
                    });
                }

                updates.forEach(({ row, col, value }) => {
                    newData[row][col] = value;
                });

                set((state) => {
                    state.data = newData;
                    state.lastUpdated = new Date();
                });

                try {
                    await db.transaction('rw', db.cells, async () => {
                        const emptyUpdates = updates.filter(({ value }) => value === "");
                        const nonEmptyUpdates = updates.filter(({ value }) => value !== "");

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
        }))
    )
);
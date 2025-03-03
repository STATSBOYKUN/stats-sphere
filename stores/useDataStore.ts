import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import db from "@/lib/db";

export type DataRow = (string | number)[];

export interface DataStoreState {
    data: DataRow[];
    isLoading: boolean;
    error: string | null;

    setData: (data: DataRow[]) => void;
    updateCell: (row: number, col: number, value: string | number) => Promise<void>;
    loadData: () => Promise<void>;
    resetData: () => Promise<void>;
    getAvailableData: (selectedColumns?: number[]) => Promise<DataRow[]>;
    getMaxCol: () => Promise<number>;
    getMaxRow: () => Promise<number>;
}

export const useDataStore = create<DataStoreState>()(
    devtools(
        immer((set, get) => ({
            data: [],
            isLoading: false,
            error: null,

            setData: (data: DataRow[]) =>
                set((state) => {
                    state.data = data;
                }),

            updateCell: async (row, col, value) => {
                set((state) => {
                    if (
                        row >= state.data.length ||
                        (state.data.length > 0 && col >= state.data[0].length)
                    ) {
                        const newRows = Math.max(state.data.length, row + 1);
                        const newCols =
                            state.data.length > 0
                                ? Math.max(state.data[0].length, col + 1)
                                : col + 1;
                        const newData = Array.from({ length: newRows }, (_, i) => {
                            if (i < state.data.length) {
                                const currentRow = state.data[i];
                                if (currentRow.length < newCols) {
                                    return [
                                        ...currentRow,
                                        ...Array(newCols - currentRow.length).fill(""),
                                    ];
                                }
                                return [...currentRow];
                            } else {
                                return Array(newCols).fill("");
                            }
                        });
                        state.data = newData;
                    }
                    state.data[row][col] = value;
                });
                try {
                    await db.cells.put({ row, col, value });
                } catch (error: any) {
                    console.error("Failed to update cell:", error);
                    await get().loadData();
                }
            },

            loadData: async () => {
                set((state) => {
                    state.isLoading = true;
                    state.error = null;
                });
                try {
                    const lastRowCell = await db.cells.orderBy("row").last();
                    const lastColCell = await db.cells.orderBy("col").last();
                    const maxRow = lastRowCell ? lastRowCell.row + 1 : 0;
                    const maxCol = lastColCell ? lastColCell.col + 1 : 0;
                    if (maxRow === 0 || maxCol === 0) {
                        set((state) => {
                            state.data = [];
                        });
                        return;
                    }
                    const availableMatrix = Array.from({ length: maxRow }, () =>
                        Array(maxCol).fill("")
                    );
                    const cells = await db.cells.toArray();
                    cells.forEach((cell) => {
                        availableMatrix[cell.row][cell.col] = cell.value;
                    });
                    set((state) => {
                        state.data = availableMatrix;
                    });
                } catch (error: any) {
                    console.error("Failed to load data:", error);
                    set((state) => {
                        state.error = error.message || "Error loading data";
                    });
                } finally {
                    set((state) => {
                        state.isLoading = false;
                    });
                }
            },

            resetData: async () => {
                try {
                    await db.cells.clear();
                    set((state) => {
                        state.data = [];
                    });
                } catch (error: any) {
                    console.error("Failed to reset data:", error);
                    set((state) => {
                        state.error = error.message || "Error resetting data";
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

            getMaxCol: async () => {
                try {
                    const cell = await db.cells.orderBy("col").last();
                    return cell ? cell.col + 1 : 0;
                } catch (error: any) {
                    console.error("Failed to get max col:", error);
                    return 0;
                }
            },

            getMaxRow: async () => {
                try {
                    const cell = await db.cells.orderBy("row").last();
                    return cell ? cell.row + 1 : 0;
                } catch (error: any) {
                    console.error("Failed to get max row:", error);
                    return 0;
                }
            },


        }))
    )
);

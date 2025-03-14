// stores/useDataStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import db from '@/lib/db';

type DataRow = string[];

interface DataStoreState {
    data: DataRow[];
    setData: (data: DataRow[]) => void;
    updateCell: (row: number, col: number, value: string) => void;
    loadData: () => Promise<void>;
    resetData: () => void;
}

const totalRows = 100;
const totalCols = 45;

export const useDataStore = create<DataStoreState>()(
    devtools((set, get) => ({
        data: Array.from({ length: totalRows }, () => Array(totalCols).fill('')),
        setData: (data) => set({ data }),
        updateCell: async (row, col, value) => {
            const newData = get().data.map((rowData) => [...rowData]);
            newData[row][col] = value;

            set({ data: newData });

            try {
                await db.cells.put({ x: col, y: row, value });
            } catch (error) {
                console.error('Failed to update cell in Dexie:', error);
            }
        },
        loadData: async () => {
            try {
                const cells = await db.cells.toArray();
                const dataMatrix = Array.from({ length: totalRows }, () => Array(totalCols).fill(''));
                cells.forEach((cell) => {
                    if (cell.y < totalRows && cell.x < totalCols) {
                        dataMatrix[cell.y][cell.x] = cell.value;
                    }
                });
                set({ data: dataMatrix });
            } catch (error) {
                console.error('Failed to fetch data from Dexie:', error);
            }
        },
        resetData: async () => {
            try {
                await db.cells.clear();
                set({ data: Array.from({ length: totalRows }, () => Array(totalCols).fill('')) });
            } catch (error) {
                console.error('Failed to reset data in Dexie:', error);
            }
        },
    }))
);

// stores/useDataStore.ts

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import db from '@/lib/db';

type DataRow = string[]; // Each row is an array of strings

interface DataStoreState {
    data: DataRow[];
    setData: (data: DataRow[]) => void;
    updateCell: (row: number, col: number, value: string) => void;
    loadData: () => Promise<void>;
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

            // Update the cell in Dexie.js
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
    }))
);

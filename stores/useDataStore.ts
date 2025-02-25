// stores/useDataStore.ts

import {create} from 'zustand';
import {devtools} from 'zustand/middleware';
import db from '@/lib/db';

type DataRow = string[];

interface DataStoreState {
    data: DataRow[];
    setData: (data: DataRow[]) => void;
    updateCell: (row: number, col: number, value: string) => void;
    loadData: () => Promise<void>;
    resetData: () => void;
}

const defaultRows = 100;
const defaultCols = 45;

export const useDataStore = create<DataStoreState>()(
    devtools((set, get) => ({
        // Inisialisasi data matrix dengan ukuran default
        data: Array.from({ length: defaultRows }, () =>
            Array(defaultCols).fill('')
        ),
        setData: (data) => set({ data }),
        updateCell: async (row, col, value) => {
            let currentData = get().data;
            // Jika koordinat melebihi ukuran matrix saat ini, perpanjang matrix-nya
            if (row >= currentData.length || col >= currentData[0].length) {
                const newRows = Math.max(currentData.length, row + 1);
                const newCols = Math.max(currentData[0].length, col + 1);
                currentData = Array.from({length: newRows}, (_, i) => {
                    if (i < currentData.length) {
                        const currentRow = currentData[i];
                        // Jika baris yang ada kurang kolom, tambahkan nilai default ('')
                        if (currentRow.length < newCols) {
                            return [...currentRow, ...Array(newCols - currentRow.length).fill('')];
                        }
                        return currentRow;
                    } else {
                        return Array(newCols).fill('');
                    }
                });
            }

            // Buat salinan data dan perbarui cell yang diubah
            const newData = currentData.map((rowData) => [...rowData]);
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
                // Hitung ukuran matrix berdasarkan default dan data yang ada di database
                let maxRow = defaultRows;
                let maxCol = defaultCols;
                cells.forEach((cell) => {
                    if (cell.y + 1 > maxRow) maxRow = cell.y + 1;
                    if (cell.x + 1 > maxCol) maxCol = cell.x + 1;
                });
                // Buat matrix dengan ukuran dinamis
                const dataMatrix = Array.from({ length: maxRow }, () =>
                    Array(maxCol).fill('')
                );
                cells.forEach((cell) => {
                    dataMatrix[cell.y][cell.x] = cell.value;
                });
                set({ data: dataMatrix });
            } catch (error) {
                console.error('Failed to fetch data from Dexie:', error);
            }
        },
        resetData: async () => {
            try {
                await db.cells.clear();
                set({
                    data: Array.from({ length: defaultRows }, () =>
                        Array(defaultCols).fill('')
                    ),
                });
            } catch (error) {
                console.error('Failed to reset data in Dexie:', error);
            }
        },
    }))
);

export interface Cell {
    id?: number;
    x: number;
    y: number;
    value: string;
}

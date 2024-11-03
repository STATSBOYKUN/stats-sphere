// hooks/useData.ts

import { useCallback } from 'react';
import { useDataContext } from '@/contexts/DataContext';
import db from '@/lib/db';

type CellChange = [number, number, any, any];
type ChangeSource = string;

export const useData = () => {
    const { data, setData } = useDataContext();

    const updateData = useCallback(
        async (changes: CellChange[] | null, source: ChangeSource) => {
            if (source === 'loadData' || !changes) {
                return;
            }

            const newData = data.map((row) => [...row]);
            const cellsToUpdate: { x: number; y: number; value: string }[] = [];

            changes.forEach(([row, col, oldValue, newValue]) => {
                newData[row][col] = newValue;
                cellsToUpdate.push({ x: col, y: row, value: newValue });
            });

            setData(newData);

            // Update the changed cells in Dexie.js
            try {
                await db.cells.bulkPut(cellsToUpdate);
            } catch (error) {
                console.error('Failed to update data in Dexie:', error);
            }
        },
        [data, setData]
    );

    return { data, updateData };
};

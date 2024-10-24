// hooks/useData.ts

import { useCallback } from 'react';
import { useDataContext } from '../contexts/DataContext';

// Define CellChange and ChangeSource types manually
type CellChange = [number, number, any, any];
type ChangeSource = string;

export const useData = () => {
    const { data, setData } = useDataContext();

    const updateData = useCallback(
        (changes: CellChange[] | null, source: ChangeSource) => {
            if (source === 'loadData' || !changes) {
                return;
            }

            const newData = data.map((row) => [...row]);

            changes.forEach(([row, col, oldValue, newValue]) => {
                newData[row][col] = newValue;
            });

            setData(newData);
        },
        [data, setData]
    );

    return { data, updateData };
};

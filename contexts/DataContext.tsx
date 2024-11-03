// contexts/DataContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import db from '@/lib/db';

type DataRowType = string[]; // Each row is an array of strings

interface DataContextType {
    data: DataRowType[];
    setData: React.Dispatch<React.SetStateAction<DataRowType[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DataRowType[] | null>(null);
    const totalRows = 100; // Jumlah baris yang diinginkan
    const totalCols = 45;  // Jumlah kolom yang diinginkan

    useEffect(() => {
        const fetchData = async () => {
            try {
                const cells = await db.cells.toArray();
                // Buat matriks data dengan ukuran yang konsisten
                const dataMatrix = Array.from({ length: totalRows }, () => Array(totalCols).fill(''));

                cells.forEach(cell => {
                    if (cell.y < totalRows && cell.x < totalCols) {
                        dataMatrix[cell.y][cell.x] = cell.value;
                    }
                });

                setData(dataMatrix);
            } catch (error) {
                console.error('Failed to fetch data from Dexie:', error);
                const initialData = Array.from({ length: totalRows }, () => Array(totalCols).fill(''));
                setData(initialData);
            }
        };

        fetchData();
    }, []);

    if (data === null) {
        // Anda dapat menampilkan indikator loading di sini jika diperlukan
        return null;
    }

    return (
        <DataContext.Provider value={{ data, setData }}>
            {children}
        </DataContext.Provider>
    );
};

export const useDataContext = (): DataContextType => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useDataContext must be used within a DataProvider');
    }
    return context;
};

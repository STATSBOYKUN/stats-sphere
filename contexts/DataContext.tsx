// contexts/DataContext.tsx

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of your data
type DataRow = string[]; // Each row is an array of strings

interface DataContextType {
    data: DataRow[];
    setData: React.Dispatch<React.SetStateAction<DataRow[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    // Initialize empty data: 100 rows x 45 columns
    const [data, setData] = useState<DataRow[]>(() =>
        Array.from({ length: 100 }, () => Array(45).fill(''))
    );

    // Optional: Data persistence with Local Storage
    useEffect(() => {
        const storedData = localStorage.getItem('spssData');
        if (storedData) {
            try {
                const parsedData: DataRow[] = JSON.parse(storedData);
                setData(parsedData);
            } catch (error) {
                console.error('Failed to parse stored data:', error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('spssData', JSON.stringify(data));
    }, [data]);

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

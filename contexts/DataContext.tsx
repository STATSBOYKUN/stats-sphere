import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

// Define the shape of your data
type DataRow = string[]; // Each row is an array of strings

interface DataContextType {
    data: DataRow[];
    setData: React.Dispatch<React.SetStateAction<DataRow[]>>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [data, setData] = useState<DataRow[] | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const storedData = localStorage.getItem('spssData');
            if (storedData) {
                try {
                    const parsedData: DataRow[] = JSON.parse(storedData);
                    setData(parsedData);
                } catch (error) {
                    console.error('Failed to parse stored data:', error);
                    setData(Array.from({ length: 100 }, () => Array(45).fill('')));
                }
            } else {
                setData(Array.from({ length: 100 }, () => Array(45).fill('')));
            }
        }
    }, []);

    useEffect(() => {
        if (data !== null && typeof window !== 'undefined') {
            localStorage.setItem('spssData', JSON.stringify(data));
        }
    }, [data]);

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

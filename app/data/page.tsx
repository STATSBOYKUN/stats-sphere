"use client";

import React from 'react';
import DataTable from '../../components/DataTable';
import { DataProvider } from '../../contexts/DataContext';

export default function DataPage() {
    return (
        <DataProvider>
            <div className="flex-grow w-full flex flex-col">
                <DataTable />
            </div>
        </DataProvider>
    );
}
